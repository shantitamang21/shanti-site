# shanti-site

Personal site for Shanti Tamang: a scroll-story About section with a pixel map, a project grid, and "Playlist years" (charts from Spotify listening data).

Plain HTML, CSS and JS. No build step.

```
index.html                  page structure and text (search for "EDIT ME")
css/style.css               all styling; colors are at the top in :root
js/main.js                  projects list, map stops, charts
data/eras.json              listening data (placeholder until you generate it)
tools/spotify_to_eras.py    turns your Spotify export into data/eras.json
staticwebapp.config.json    Azure Static Web Apps settings
```

## Run it locally
```
python -m http.server 8000
```
Then open http://localhost:8000.

## Make it yours
1. **Text:** in `index.html`, search for `EDIT ME` (your stories, email, LinkedIn, GitHub).
2. **Projects:** edit the `PROJECTS` list at the top of `js/main.js`.
3. **Map stops:** edit `STOPS` in `js/main.js`. Add an `<article class="stop">` in `index.html` and an `<li>` in `#stopIndex` for each new stop.
4. **Colors:** change the variables in `:root` in `css/style.css`.

## Load your real Spotify data
1. In Spotify: Account → Privacy settings → request **Extended streaming history**. It can take a few weeks to arrive.
2. Edit the `ERAS` list in `tools/spotify_to_eras.py`.
3. Run:
   ```
   pip install pandas
   python tools/spotify_to_eras.py "C:\path\to\Spotify Extended Streaming History"
   ```
4. Commit `data/eras.json` and push.

## Deploy to Azure Static Web Apps (Free plan)
1. Push this folder to a new GitHub repo.
2. In the Azure Portal, go to **Create a resource → Static Web App**.
   - Plan: **Free**
   - Source: **GitHub**, pick this repo and the `main` branch
   - Build preset: **Custom**
   - App location: `/`, Api location: *(blank)*, Output location: *(blank)*
3. Azure adds a GitHub Actions workflow to your repo. Every `git push` redeploys the site.
4. Optional: add your own domain under **Custom domains**. HTTPS is set up automatically.
