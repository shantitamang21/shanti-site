"""
Turn your Spotify Extended Streaming History into data/eras.json for the site.

1. Spotify → Account → Privacy settings → request "Extended streaming history".
2. Unzip what they email you. You'll get files like Streaming_History_Audio_2021-2023_0.json
3. Edit the ERAS list below (titles, date ranges, a one-line vibe).
4. Run:  python tools/spotify_to_eras.py path/to/Spotify_Extended_Streaming_History
5. Commit data/eras.json and push. Azure redeploys automatically.
"""
import json
import sys
from pathlib import Path

import pandas as pd

# ---- EDIT ME: your eras (start inclusive, end exclusive, YYYY-MM-DD) ----
ERAS = [
    {"title": "Where it started",    "start": "2016-01-01", "end": "2020-01-01", "vibe": "What was on repeat back then?"},
    {"title": "Moving to Texas",     "start": "2020-01-01", "end": "2022-08-01", "vibe": "New place, new playlists."},
    {"title": "First years at UNT",  "start": "2022-08-01", "end": "2025-01-01", "vibe": "Study sessions and long drives."},
    {"title": "Late-night data era", "start": "2025-01-01", "end": "2030-01-01", "vibe": "SQL, pandas and something on repeat."},
]

MIN_MS = 30_000  # ignore plays shorter than 30 seconds (skips)


def load(folder: Path) -> pd.DataFrame:
    files = sorted(folder.glob("Streaming_History_Audio_*.json"))
    if not files:
        sys.exit(f"No Streaming_History_Audio_*.json files found in {folder}")
    df = pd.concat((pd.read_json(f) for f in files), ignore_index=True)
    df["ts"] = pd.to_datetime(df["ts"], utc=True).dt.tz_convert("America/Chicago").dt.tz_localize(None)
    df = df[df["ms_played"] >= MIN_MS]
    df = df.dropna(subset=["master_metadata_album_artist_name"])  # drop podcasts etc.
    return df


def build(df: pd.DataFrame) -> list[dict]:
    out = []
    for era in ERAS:
        part = df[(df["ts"] >= era["start"]) & (df["ts"] < era["end"])]
        if part.empty:
            continue
        monthly = (part.set_index("ts")["ms_played"]
                       .resample("MS").sum()
                       .div(60_000).round().astype(int))
        top = (part.groupby("master_metadata_album_artist_name")["ms_played"]
                   .sum().idxmax())
        first, last = monthly.index.min(), monthly.index.max()
        out.append({
            "title": era["title"],
            "years": f"{first:%b %Y} – {last:%b %Y}",
            "vibe": era["vibe"],
            "top_artist": top,
            "months": monthly.tolist(),
        })
    return out


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage: python tools/spotify_to_eras.py <folder with Spotify JSON files>")
    eras = build(load(Path(sys.argv[1])))
    target = Path(__file__).resolve().parent.parent / "data" / "eras.json"
    target.write_text(json.dumps(eras, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(eras)} eras to {target}")
