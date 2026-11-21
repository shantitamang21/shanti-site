/* =========================================================
   Guestbook: visitors drop a pin where they're visiting from.
   Talks to /api/pins (api/src/functions/pins.js).
   ========================================================= */
(function () {
  const HOME = { name: "Irving", lat: 32.814, lng: -96.949 };
  const mapEl = document.getElementById("gbMap");
  if (!mapEl || !window.L) return;

  const form = document.getElementById("gbForm");
  const statusEl = document.getElementById("gbStatus");
  const whereEl = document.getElementById("gbWhere");
  const submitBtn = document.getElementById("gbSubmit");
  let pins = [];
  let chosen = null;

  // ---------- Map ----------
  const map = L.map(mapEl, { worldCopyJump: true, scrollWheelZoom: false, minZoom: 2 }).setView([25, 10], 2);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd", maxZoom: 10
  }).addTo(map);

  const icon = (cls) => L.divIcon({ className: "gb-pin " + cls, html: cls === "gb-home" ? "★" : "♥", iconSize: [24, 24], iconAnchor: [12, 12] });
  const layer = L.layerGroup().addTo(map);
  L.marker([HOME.lat, HOME.lng], { icon: icon("gb-home"), title: "Shanti, Irving TX" })
    .addTo(map).bindTooltip("Me · Irving, TX", { direction: "top", offset: [0, -8] });
  let draft = null;

  map.on("click", (e) => {
    chosen = { lat: e.latlng.lat, lng: ((e.latlng.lng + 540) % 360) - 180 };
    if (draft) draft.setLatLng(e.latlng); else draft = L.marker(e.latlng, { icon: icon("gb-draft") }).addTo(map);
    whereEl.textContent = `Pin at ${chosen.lat.toFixed(1)}, ${chosen.lng.toFixed(1)} — looks good?`;
    submitBtn.disabled = false;
    setStatus("");
  });

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "gb-status " + (kind || "");
  }

  function popupFor(p) {
    const div = document.createElement("div");
    const b = document.createElement("b");
    b.textContent = p.name || "Someone";
    div.appendChild(b);
    if (p.note) { const n = document.createElement("div"); n.textContent = p.note; div.appendChild(n); }
    const d = document.createElement("small");
    d.textContent = new Date(p.ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    div.appendChild(d);
    return div;
  }

  function drawPins() {
    layer.clearLayers();
    pins.forEach(p => L.marker([p.lat, p.lng], { icon: icon("gb-visitor") }).bindPopup(popupFor(p)).addTo(layer));
  }

  // ---------- Stats ----------
  function milesFromHome(p) {
    const R = 3958.8, rad = Math.PI / 180;
    const dLat = (p.lat - HOME.lat) * rad, dLng = (p.lng - HOME.lng) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(HOME.lat * rad) * Math.cos(p.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function renderStats() {
    document.getElementById("gbTotal").textContent = pins.length.toLocaleString();

    const far = pins.reduce((best, p) => { const m = milesFromHome(p); return m > best.m ? { p, m } : best; }, { p: null, m: -1 });
    document.getElementById("gbFar").textContent = far.p ? `${Math.round(far.m).toLocaleString()} mi` : "—";
    document.getElementById("gbFarWho").textContent = far.p ? `from ${far.p.name || "someone"}` : "no pins yet";

    const avg = pins.length ? pins.reduce((s, p) => s + milesFromHome(p), 0) / pins.length : 0;
    document.getElementById("gbAvg").textContent = pins.length ? `${Math.round(avg).toLocaleString()} mi` : "—";

    // Pins per month, last 12 months
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: d.getFullYear() + "-" + d.getMonth(), label: d.toLocaleDateString(undefined, { month: "short" }), n: 0 });
    }
    pins.forEach(p => { const d = new Date(p.ts); const m = months.find(x => x.key === d.getFullYear() + "-" + d.getMonth()); if (m) m.n++; });
    const max = Math.max(1, ...months.map(m => m.n));
    document.getElementById("gbChart").innerHTML = months.map(m =>
      `<div class="gb-bar"><div style="height:${(m.n / max) * 100}%" title="${m.n} pin${m.n === 1 ? "" : "s"}"></div><span>${m.label}</span></div>`
    ).join("");

    const list = document.getElementById("gbLatest");
    list.innerHTML = "";
    pins.filter(p => p.note).slice(0, 4).forEach(p => {
      const li = document.createElement("li");
      const q = document.createElement("span"); q.textContent = `“${p.note}”`;
      const w = document.createElement("small"); w.textContent = ` — ${p.name || "someone"}`;
      li.append(q, w); list.appendChild(li);
    });
    if (!list.children.length) list.innerHTML = "<li><span>No notes yet. Be the first!</span></li>";
  }

  // ---------- API ----------
  async function load() {
    try {
      const res = await fetch("/api/pins", { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.status);
      pins = (await res.json()).pins || [];
      drawPins();
      renderStats();
    } catch (e) {
      renderStats();
      setStatus("The guestbook is warming up — try again in a little while.", "err");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!chosen) { setStatus("Click the map first to choose your spot.", "err"); return; }
    submitBtn.disabled = true;
    setStatus("Dropping your pin…");
    try {
      const res = await fetch("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: chosen.lat, lng: chosen.lng, name: form.gbName.value, note: form.gbNote.value })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      pins.unshift(data.pin);
      drawPins();
      renderStats();
      if (draft) { map.removeLayer(draft); draft = null; }
      chosen = null;
      form.reset();
      whereEl.textContent = "Click anywhere on the map to drop your pin.";
      setStatus(`Thanks${data.pin.name ? ", " + data.pin.name : ""}! You're ${Math.round(milesFromHome(data.pin)).toLocaleString()} miles from Irving.`, "ok");
    } catch (err) {
      setStatus(err.message, "err");
      submitBtn.disabled = false;
    }
  });

  load();
})();
