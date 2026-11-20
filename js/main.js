/* =========================================================
   Shanti Tamang — personal site
   1. Projects   2. Scroll-story map   3. Playlist years
   ========================================================= */

/* ---------- 1. PROJECTS — edit this list ---------- */
const PROJECTS = [
  {
    kind: "Database · SQL",
    title: "QUECOURT",
    text: "A federal court database project: schema design, queries and data you can explore.",
    stack: ["SQL", "Database design"],
    url: "https://github.com/shantitamang21" // EDIT ME: link the QUECOURT repo
  },
  {
    kind: "Machine learning",
    title: "Rock vs. Mine sonar classifier",
    text: "Logistic regression on sonar returns to tell rocks from mines, built in Google Colab.",
    stack: ["Python", "scikit-learn", "Colab"],
    url: "https://github.com/shantitamang21" // EDIT ME: link the exact repo
  },
  {
    kind: "Machine learning",
    title: "NBA predictions",
    text: "Predicting game outcomes from team stats. Feature engineering plus model comparison.",
    stack: ["Python", "pandas", "ML"],
    url: "https://github.com/shantitamang21" // EDIT ME: link the exact repo
  },
  {
    kind: "Security",
    title: "JWKS auth server",
    text: "AES-GCM encrypted key storage, Argon2 password hashing, auth logging and rate limiting.",
    stack: ["Python", "Crypto", "REST"],
    url: "https://github.com/shantitamang21" // EDIT ME: link the exact repo
  },
  {
    kind: "Writing · Instagram",
    title: "Style by Data",
    text: "Fashion trends, nostalgia cycles and the data behind what people wear.",
    stack: ["Data storytelling", "Fashion"],
    url: "https://www.instagram.com/stylebydata/"
  },
  {
    kind: "Video · TikTok",
    title: "shantigoestoplaces",
    text: "Dallas hidden gems and places worth the drive.",
    stack: ["DFW", "Short video"],
    url: "https://www.tiktok.com/@shantigoestoplaces"
  },
  {
    kind: "Video · YouTube",
    title: "Explainers on random topics",
    text: "Deep dives on whatever I'm curious about, starting with Hindu art.",
    stack: ["Research", "Editing"],
    url: "https://www.youtube.com/@ShantiTamang-d8z"
  }
];

function renderProjects() {
  const wrap = document.getElementById("projectCards");
  wrap.innerHTML = PROJECTS.map(p => `
    <a class="card" href="${p.url}" target="_blank" rel="noopener">
      <span class="kind">${p.kind}</span>
      <h3>${p.title}</h3>
      <p>${p.text}</p>
      <div class="stack">${p.stack.map(s => `<span>${s}</span>`).join("")}</div>
    </a>`).join("");
}

/* ---------- 2. SCROLL-STORY PIXEL MAP ---------- */
// Positions are fractions of the canvas (x, y). Not to scale, just a story.
const STOPS = [
  { name: "Kathmandu", x: 0.78, y: 0.24 },
  { name: "Denton",    x: 0.44, y: 0.46 },
  { name: "Irving",    x: 0.38, y: 0.64 },
  { name: "Next",      x: 0.58, y: 0.78 }
];

const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");
const CELL = 9;
let cells = [];
let active = 0;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function sizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const r = canvas.getBoundingClientRect();
  canvas.width = r.width * dpr;
  canvas.height = r.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Build the pixel field: each cell gets a random "brightness" and phase.
  cells = [];
  for (let y = 0; y < r.height; y += CELL) {
    for (let x = 0; x < r.width; x += CELL) {
      const v = Math.random();
      cells.push({ x, y, v, p: Math.random() * Math.PI * 2 });
    }
  }
}

function drawMap(t = 0) {
  const W = canvas.clientWidth, H = canvas.clientHeight;
  ctx.fillStyle = "#d6453d";
  ctx.fillRect(0, 0, W, H);

  // pixel field
  for (const c of cells) {
    const tw = reduceMotion ? 0 : Math.sin(t / 900 + c.p) * 0.5 + 0.5;
    if (c.v > 0.93) {
      ctx.fillStyle = `rgba(242,165,65,${0.55 + tw * 0.45})`;    // marigold sparkles
      ctx.fillRect(c.x + 2, c.y + 2, CELL - 4, CELL - 4);
    } else if (c.v > 0.55) {
      ctx.fillStyle = `rgba(20,26,46,${0.12 + c.v * 0.18})`;       // texture
      ctx.fillRect(c.x + 1, c.y + 1, CELL - 2, CELL - 2);
    }
  }

  // route up to the active stop
  ctx.setLineDash([3, 6]);
  ctx.strokeStyle = "#f6efe3";
  ctx.lineWidth = 2;
  ctx.beginPath();
  STOPS.slice(0, active + 1).forEach((s, i) => {
    const px = s.x * W, py = s.y * H;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // markers + labels for visited stops
  ctx.font = "600 15px 'JetBrains Mono', monospace";
  STOPS.slice(0, active + 1).forEach((s, i) => {
    const px = s.x * W, py = s.y * H;
    const isNow = i === active;
    ctx.fillStyle = "#141a2e";
    ctx.fillRect(px - 9, py - 9, 18, 18);
    ctx.fillStyle = isNow ? "#f2a541" : "#f6efe3";
    ctx.fillRect(px - 6, py - 6, 12, 12);

    const label = s.name;
    const tw = ctx.measureText(label).width;
    const boxW = tw + 18;
    const lx = px + 16 + boxW > W ? px - 16 - boxW : px + 16, ly = py - 30;
    ctx.fillStyle = isNow ? "#f2a541" : "#141a2e";
    ctx.fillRect(lx, ly, tw + 18, 26);
    ctx.fillStyle = isNow ? "#141a2e" : "#f6efe3";
    ctx.fillText(label, lx + 9, ly + 18);
  });
}

function loop(t) {
  drawMap(t);
  if (!reduceMotion) requestAnimationFrame(loop);
}

function setActive(i) {
  active = i;
  document.querySelectorAll(".stop").forEach(el => el.classList.toggle("active", +el.dataset.i === i));
  document.querySelectorAll("#stopIndex li").forEach(el => el.classList.toggle("active", +el.dataset.i === i));
  const stop = document.querySelector(`.stop[data-i="${i}"]`);
  document.getElementById("mapCaptionText").textContent = stop.dataset.caption;
  document.getElementById("mapCaptionNum").textContent = "ST 0" + (i + 1);
  if (reduceMotion) drawMap();
}

function initStory() {
  sizeCanvas();
  window.addEventListener("resize", () => { sizeCanvas(); drawMap(); });

  // Whichever stop crosses the middle of the screen becomes active.
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setActive(+e.target.dataset.i); });
  }, { rootMargin: "-45% 0px -45% 0px" });
  document.querySelectorAll(".stop").forEach(el => io.observe(el));

  // Clicking a number in the index scrolls to that stop.
  document.querySelectorAll("#stopIndex li").forEach(li => {
    li.style.cursor = "pointer";
    li.addEventListener("click", () =>
      document.querySelector(`.stop[data-i="${li.dataset.i}"]`).scrollIntoView({ behavior: "smooth", block: "center" }));
  });

  setActive(0);
  requestAnimationFrame(loop);
}

/* ---------- 3. PLAYLIST YEARS ---------- */
// Real data comes from data/eras.json (make it with tools/spotify_to_eras.py).
// If that file is missing, this sample data is shown instead.
function sampleMonths(seed, n, base) {
  let s = seed;
  return Array.from({ length: n }, () => {
    s = (s * 9301 + 49297) % 233280;
    return Math.round(base * (0.3 + (s / 233280) * 1.4));
  });
}
const SAMPLE_ERAS = [
  { title: "Where it started",        years: "Before 2020", vibe: "Write what you were listening to here.", top_artist: "—", months: sampleMonths(3, 24, 400) },
  { title: "Moving to Texas",         years: "2020 – 2022", vibe: "New place, new playlists.",               top_artist: "—", months: sampleMonths(7, 24, 900) },
  { title: "First years at UNT",      years: "2022 – 2024", vibe: "Study sessions and long drives.",         top_artist: "—", months: sampleMonths(11, 24, 1500) },
  { title: "Late-night data era",     years: "2025 – now",  vibe: "SQL, pandas and something on repeat.",    top_artist: "—", months: sampleMonths(19, 22, 2000) }
];

function renderEras(eras, isSample) {
  document.getElementById("dataNote").textContent =
    isSample ? "Sample data — run tools/spotify_to_eras.py to load yours" : "From my Spotify streaming history";

  const max = Math.max(...eras.flatMap(e => e.months));
  const wrap = document.getElementById("eras");
  wrap.innerHTML = eras.map((e, i) => {
    const hours = Math.round(e.months.reduce((a, b) => a + b, 0) / 60);
    return `
      <div class="era">
        <div class="num">${String(i).padStart(2, "0")}</div>
        <div>
          <h3>${e.title}</h3>
          <div class="when">${e.years}</div>
          <div class="vibe">${e.vibe}</div>
        </div>
        <div>
          <div class="chart">
            ${e.months.map(m => `<div style="height:0" data-h="${(m / max) * 100}" title="${m} min"></div>`).join("")}
          </div>
          <div class="meta">${hours.toLocaleString()} hours · top artist: ${e.top_artist}</div>
        </div>
      </div>`;
  }).join("");

  // Grow the bars when each era scrolls into view.
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.querySelectorAll(".chart div").forEach(b => b.style.height = b.dataset.h + "%");
      io.unobserve(en.target);
    });
  }, { threshold: 0.3 });
  wrap.querySelectorAll(".era").forEach(el => io.observe(el));
}

async function initEras() {
  try {
    const res = await fetch("data/eras.json", { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length || data[0].sample) throw new Error("sample");
    renderEras(data, false);
  } catch {
    renderEras(SAMPLE_ERAS, true);
  }
}

/* ---------- Nav highlight + boot ---------- */
function initNav() {
  const links = [...document.querySelectorAll(".topnav a[href^='#']")].filter(a => a.getAttribute("href") !== "#top");
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-50% 0px -50% 0px" });
  ["about", "building", "years", "contact"].forEach(id => io.observe(document.getElementById(id)));
}

document.getElementById("yr").textContent = new Date().getFullYear();
renderProjects();
initStory();
initEras();
initNav();
