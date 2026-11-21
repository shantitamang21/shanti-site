/* =========================================================
   Critters ♡ — little coffee + plant friends
   Put <span class="critter" data-c="coffee"></span> anywhere.
   Types: coffee, plant, cactus, monstera, books, sun
   Click the coffee to chat, click a plant to water it.
   ========================================================= */
(function () {
  const INK = "#3d2b4f", BLUSH = "#ff9ec7";
  const face = (cx, cy, s = 1) => `
    <g class="cr-face">
      <circle class="cr-eye" cx="${cx - 7 * s}" cy="${cy}" r="${2.6 * s}" fill="${INK}"/>
      <circle class="cr-eye" cx="${cx + 7 * s}" cy="${cy}" r="${2.6 * s}" fill="${INK}"/>
      <ellipse cx="${cx - 12 * s}" cy="${cy + 5 * s}" rx="${3.6 * s}" ry="${2.2 * s}" fill="${BLUSH}"/>
      <ellipse cx="${cx + 12 * s}" cy="${cy + 5 * s}" rx="${3.6 * s}" ry="${2.2 * s}" fill="${BLUSH}"/>
      <path d="M${cx - 3.5 * s} ${cy + 4 * s} q${3.5 * s} ${3.5 * s} ${7 * s} 0" stroke="${INK}" stroke-width="${2 * s}" fill="none" stroke-linecap="round"/>
    </g>`;
  const S = `stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"`;

  const SVG = {
    coffee: `<svg viewBox="0 0 90 100" aria-hidden="true">
      <g class="cr-steam" fill="none" stroke="#c9b7d9" stroke-width="3" stroke-linecap="round">
        <path d="M32 26 q-6 -8 0 -14 q6 -6 0 -12"/><path d="M46 24 q-6 -8 0 -14 q6 -6 0 -12"/><path d="M60 26 q-6 -8 0 -14 q6 -6 0 -12"/>
      </g>
      <path d="M70 46 q16 0 16 14 q0 14 -18 14" fill="none" ${S} stroke-width="5"/>
      <path d="M70 46 q16 0 16 14 q0 14 -18 14" fill="none" stroke="#ffc6df" stroke-width="2"/>
      <path d="M18 34 h56 v38 q0 22 -28 22 q-28 0 -28 -22z" fill="#ffc6df" ${S}/>
      <ellipse cx="46" cy="34" rx="28" ry="7" fill="#8a5a44" ${S}/>
      <path d="M30 34 q8 4 16 0 q8 -4 16 0" fill="none" stroke="#f3d7b8" stroke-width="2" stroke-linecap="round"/>
      <path d="M40 80 l6 5 l6 -5" fill="#ff5fa2" stroke="none"/>
      ${face(46, 58, 1.1)}
    </svg>`,

    plant: `<svg viewBox="0 0 90 110" aria-hidden="true">
      <g class="cr-leaves">
        <path d="M45 62 C40 40 22 30 12 34 C14 50 30 60 45 62z" fill="#8fe0b0" ${S}/>
        <path d="M45 62 C50 40 68 30 78 34 C76 50 60 60 45 62z" fill="#7fd8a6" ${S}/>
        <path d="M45 62 C38 36 44 14 46 8 C52 20 56 40 45 62z" fill="#a6ecc3" ${S}/>
        <path d="M45 62 v-8" ${S}/>
      </g>
      <path d="M20 62 h50 l-6 42 h-38z" fill="#ffb98a" ${S}/>
      <rect x="16" y="58" width="58" height="12" rx="4" fill="#ff9d6b" ${S}/>
      ${face(45, 84, 1)}
    </svg>`,

    cactus: `<svg viewBox="0 0 80 110" aria-hidden="true">
      <g class="cr-leaves">
        <path d="M28 70 V30 q0 -14 12 -14 q12 0 12 14 V70z" fill="#9be3b6" ${S}/>
        <path d="M28 48 h-8 q-6 0 -6 -6 v-10 q0 -4 4 -4 q4 0 4 4 v6 h6" fill="#9be3b6" ${S}/>
        <path d="M52 40 h8 q6 0 6 -6 v-8 q0 -4 -4 -4 q-4 0 -4 4 v4 h-6" fill="#9be3b6" ${S}/>
        <g stroke="${INK}" stroke-width="1.6" stroke-linecap="round"><path d="M34 30 l-3 -2"/><path d="M46 38 l3 -2"/><path d="M34 52 l-3 -2"/><path d="M46 58 l3 -2"/></g>
        <circle cx="40" cy="15" r="5" fill="#ff5fa2" ${S} stroke-width="2"/>
        ${face(40, 42, .8)}
      </g>
      <path d="M18 70 h44 l-5 34 h-34z" fill="#c4b0ff" ${S}/>
      <rect x="14" y="66" width="52" height="10" rx="4" fill="#ad95ff" ${S}/>
    </svg>`,

    monstera: `<svg viewBox="0 0 110 130" aria-hidden="true">
      <g class="cr-leaves">
        <path d="M55 82 C34 70 10 66 6 44 C24 34 46 46 55 82z" fill="#6fcf9a" ${S}/>
        <path d="M55 82 C76 70 100 66 104 44 C86 34 64 46 55 82z" fill="#7fd8a6" ${S}/>
        <path d="M55 82 C44 56 40 28 56 6 C72 28 66 56 55 82z" fill="#8fe0b0" ${S}/>
        <g fill="#fff8f1" stroke="${INK}" stroke-width="1.8"><ellipse cx="24" cy="52" rx="4" ry="2.4" transform="rotate(25 24 52)"/><ellipse cx="86" cy="52" rx="4" ry="2.4" transform="rotate(-25 86 52)"/><ellipse cx="56" cy="34" rx="2.4" ry="4.4"/></g>
      </g>
      <path d="M24 82 h62 l-7 44 h-48z" fill="#ffe27a" ${S}/>
      <rect x="20" y="78" width="70" height="12" rx="5" fill="#ffd34d" ${S}/>
      ${face(55, 106, 1.1)}
    </svg>`,

    books: `<svg viewBox="0 0 100 80" aria-hidden="true">
      <rect x="10" y="54" width="80" height="18" rx="3" fill="#9fd6ff" ${S}/>
      <rect x="16" y="36" width="70" height="18" rx="3" fill="#ffc6df" ${S}/>
      <rect x="8" y="18" width="74" height="18" rx="3" fill="#c4b0ff" ${S}/>
      <path d="M18 63 h40 M24 45 h30 M16 27 h44" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" opacity=".5"/>
      <text x="62" y="31" font-family="Pixelify Sans, monospace" font-size="9" fill="${INK}">SQL</text>
    </svg>`,

    sun: `<svg viewBox="0 0 100 100" aria-hidden="true">
      <g class="cr-rays" stroke="${INK}" stroke-width="2.5" stroke-linecap="round">
        <path d="M50 4 v12 M50 84 v12 M4 50 h12 M84 50 h12 M17 17 l9 9 M74 74 l9 9 M83 17 l-9 9 M26 74 l-9 9"/>
      </g>
      <circle cx="50" cy="50" r="26" fill="#ffe27a" ${S}/>
      ${face(50, 50, 1.1)}
    </svg>`
  };

  const SAYINGS = {
    coffee: ["sip ♡", "one more commit ☕", "SQL tastes better with coffee", "brewing data…", "you're doing great!", "refill pls 🥺", "decaf? never."],
    plant: ["thank you! 💧", "growing ✦", "photosynthesizing…", "more sun please ☀", "I feel loved ♡"],
    cactus: ["ouch—jk ♡", "no water needed, I'm fine", "spiky but sweet", "low maintenance queen"],
    monstera: ["big leaf energy 🌿", "thank you! 💧", "I'm thriving ✦", "new leaf unlocked!"],
    books: ["read me ♡", "chapter 1: SELECT *", "so many tabs…"],
    sun: ["good morning ☀", "stay sunny ✦", "hi hi hi!"]
  };

  function bubble(el, text) {
    const b = document.createElement("span");
    b.className = "cr-bubble";
    b.textContent = text;
    el.appendChild(b);
    setTimeout(() => b.remove(), 1600);
  }

  document.querySelectorAll(".critter[data-c]").forEach(el => {
    const type = el.dataset.c;
    if (!SVG[type]) return;
    el.innerHTML = SVG[type];
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", `A cute ${type}. Click to say hi.`);
    let growth = 0;
    const poke = () => {
      const lines = SAYINGS[type] || ["hi ♡"];
      bubble(el, lines[Math.floor(Math.random() * lines.length)]);
      el.classList.remove("cr-pop"); void el.offsetWidth; el.classList.add("cr-pop");
      if (["plant", "monstera", "cactus"].includes(type) && growth < 3) {
        growth++;
        el.style.setProperty("--grow", 1 + growth * 0.06);
        const drop = document.createElement("span");
        drop.className = "cr-drop"; drop.textContent = "💧";
        el.appendChild(drop); setTimeout(() => drop.remove(), 900);
      }
    };
    el.addEventListener("click", poke);
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); poke(); } });
  });

  // Blink every few seconds
  setInterval(() => {
    document.querySelectorAll(".critter").forEach(el => {
      if (Math.random() < 0.35) { el.classList.add("cr-blink"); setTimeout(() => el.classList.remove("cr-blink"), 160); }
    });
  }, 2600);
})();
