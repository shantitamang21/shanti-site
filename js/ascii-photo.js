/* =========================================================
   ASCII photo effect
   Usage in HTML:
     <figure class="ascii-photo" data-src="images/my-photo.jpg" data-cell="9"></figure>
   The photo is shown soft and grainy, and the bright / high-contrast
   parts of it are traced with glowing ASCII characters.
   Options (data-attributes):
     data-cell       character size in px (default 9; smaller = more detail)
     data-threshold  0-1, how much of the image gets characters (default 0.55)
     data-color      character color (default #ffb3dc, soft pink)
   ========================================================= */
(function () {
  const RAMP = " .:-=+#";            // dark -> bright
  const EDGE = { h: "-", v: "|", d1: "/", d2: "\\" };

  function build(fig, img) {
    const cell = +fig.dataset.cell || 9;
    const threshold = fig.dataset.threshold ? +fig.dataset.threshold : 0.55;
    const color = fig.dataset.color || "#ffb3dc";

    const W = fig.clientWidth || 600;
    const H = Math.round(W * img.naturalHeight / img.naturalWidth);
    const dpr = window.devicePixelRatio || 1;

    const canvas = document.createElement("canvas");
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // 1. Soft, slightly dark photo underneath
    ctx.filter = "blur(2px) brightness(.72) saturate(.9)";
    ctx.drawImage(img, 0, 0, W, H);
    ctx.filter = "none";

    // 2. Sample the photo on a grid
    const cols = Math.floor(W / (cell * 0.75)), rows = Math.floor(H / (cell * 1.15));
    const s = document.createElement("canvas");
    s.width = cols; s.height = rows;
    const sctx = s.getContext("2d", { willReadFrequently: true });
    sctx.drawImage(img, 0, 0, cols, rows);
    const px = sctx.getImageData(0, 0, cols, rows).data;
    const lum = new Float32Array(cols * rows);
    for (let i = 0; i < cols * rows; i++) lum[i] = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255;

    // Normalise so it works on dark and bright photos alike
    let lo = 1, hi = 0;
    for (const v of lum) { if (v < lo) lo = v; if (v > hi) hi = v; }
    const span = Math.max(0.05, hi - lo);
    const L = (x, y) => (lum[Math.min(rows - 1, Math.max(0, y)) * cols + Math.min(cols - 1, Math.max(0, x))] - lo) / span;

    // 3. Draw characters where the image is bright or has strong edges
    ctx.font = `600 ${Math.round(cell * 0.9)}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textBaseline = "top";
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = cell * 0.35;
    const cw = W / cols;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = L(x, y);
        // Sobel edge strength + direction
        const gx = L(x + 1, y - 1) + 2 * L(x + 1, y) + L(x + 1, y + 1) - L(x - 1, y - 1) - 2 * L(x - 1, y) - L(x - 1, y + 1);
        const gy = L(x - 1, y + 1) + 2 * L(x, y + 1) + L(x + 1, y + 1) - L(x - 1, y - 1) - 2 * L(x, y - 1) - L(x + 1, y - 1);
        const g = Math.hypot(gx, gy);
        let ch = null;
        if (g > 1.1) {
          const a = Math.atan2(gy, gx) * 180 / Math.PI;
          const t = ((a % 180) + 180) % 180;
          ch = t < 22.5 || t >= 157.5 ? EDGE.v : t < 67.5 ? EDGE.d2 : t < 112.5 ? EDGE.h : EDGE.d1;
        } else if (v > threshold) {
          ch = RAMP[Math.min(RAMP.length - 1, Math.floor(((v - threshold) / (1 - threshold)) * (RAMP.length - 1)) + 1)];
        }
        if (ch && ch !== " ") {
          ctx.globalAlpha = Math.min(0.95, 0.35 + v * 0.6);
          ctx.fillText(ch, x * cw, y * (H / rows));
        }
      }
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;

    // 4. Film grain
    const grain = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = grain.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 22;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(grain, 0, 0);

    fig.innerHTML = "";
    fig.appendChild(canvas);
    if (fig.dataset.caption) {
      const c = document.createElement("figcaption");
      c.textContent = fig.dataset.caption;
      fig.appendChild(c);
    }
  }

  function init(fig) {
    const src = fig.dataset.src;
    if (!src) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      build(fig, img);
      let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => build(fig, img), 200); });
    };
    img.src = src;
  }

  window.asciiPhoto = { build, init };
  const run = () => document.querySelectorAll(".ascii-photo[data-src]").forEach(init);
  document.fonts ? document.fonts.ready.then(run) : run();
})();
