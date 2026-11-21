/* =========================================================
   Cute extras ♡
   1. Fun-fact gacha machine   2. Sparkle cursor trail
   ========================================================= */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Gacha — edit these facts! ---------- */
  const FACTS = [
    "I was born in Kathmandu, Nepal 🏔️",
    "I study Computer Science at UNT 💻",
    "I post Dallas hidden gems on TikTok as @shantigoestoplaces 📍",
    "I run Style by Data — fashion trends, explained with data 👗📊",
    "My first YouTube explainer was about Hindu art 🎨",
    "I built QUECOURT, a federal court database ⚖️",
    "I trained a model to tell rocks from sea mines using sonar 🌊",
    "This guestbook map is a live dataset — drop a pin and you're in it! 📌",
    "✦ RARE CAPSULE ✦ Email me and just say \"gacha\" — I'll know you found it 💌"
  ];
  const COLORS = ["#ff5fa2", "#c4b0ff", "#9fd6ff", "#ffe27a", "#b6f0d6", "#ffb43d"];

  const dial = document.getElementById("gachaDial");
  if (dial) {
    const machine = document.getElementById("gacha");
    const drop = document.getElementById("gachaDrop");
    const factEl = document.getElementById("gachaFact");
    const countEl = document.getElementById("gachaCount");
    let order = [], seen = new Set(), turns = 0, busy = false;

    const shuffle = () => {
      order = FACTS.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    };
    const updateCount = () => { countEl.textContent = `${seen.size} / ${FACTS.length} collected`; };
    updateCount();

    dial.addEventListener("click", () => {
      if (busy) return;
      busy = true;
      if (!order.length) shuffle();
      const idx = order.pop();
      turns++;
      dial.style.transform = `rotate(${turns * 360}deg)`;
      machine.classList.remove("shake"); void machine.offsetWidth; machine.classList.add("shake");
      drop.classList.remove("go");
      drop.style.setProperty("--c", COLORS[Math.floor(Math.random() * COLORS.length)]);
      setTimeout(() => {
        void drop.offsetWidth; drop.classList.add("go");
        factEl.classList.remove("pop"); void factEl.offsetWidth;
        factEl.textContent = FACTS[idx];
        factEl.classList.add("pop");
        seen.add(idx); updateCount();
        if (seen.size === FACTS.length) countEl.textContent = `${FACTS.length} / ${FACTS.length} collected — you got them all! ♡`;
        busy = false;
      }, reduceMotion ? 50 : 550);
    });
  }

  /* ---------- 2. Sparkle cursor trail (desktop only) ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    const glyphs = ["✦", "♡", "✧", "⋆"];
    const tints = ["#ff5fa2", "#c4b0ff", "#6fc3ff", "#ffb43d"];
    let last = 0;
    window.addEventListener("mousemove", (e) => {
      const now = performance.now();
      if (now - last < 70) return;
      last = now;
      const s = document.createElement("span");
      s.className = "trail";
      s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      s.style.left = e.clientX + 6 + "px";
      s.style.top = e.clientY + 6 + "px";
      s.style.color = tints[Math.floor(Math.random() * tints.length)];
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }, { passive: true });
  }
})();
