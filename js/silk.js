/* =====================================================================
   BULK 3D STUDIO — silk.js
   Fondo "silk" animado en <canvas> (JS vanilla puro, sin dependencias).
   Portado y recoloreado a la paleta de marca a partir de la referencia
   React (silk-background-animation.tsx): función noise + patrón seno/coseno,
   gradiente lineal de base y overlay radial.

   Optimizaciones clave:
   - El patrón se calcula en un BUFFER chico (independiente de la resolución
     de pantalla) y se escala con suavizado → look sedoso + costo acotado,
     incluso en 4K. No se recorre pixel a pixel a innerWidth×innerHeight.
   - El canvas principal se dimensiona a CSS px con un tope de DPR sensato.
   - El loop (requestAnimationFrame) se puede pausar desde afuera cuando el
     hero sale del viewport (ver main.js: IntersectionObserver).
   - prefers-reduced-motion → un solo frame estático (renderStatic), sin loop.
   - Degradación elegante: si no hay contexto 2D, create() devuelve null y el
     hero queda con su fondo sólido --carbon (definido en CSS).

   Uso:
     const silk = window.BulkSilk.create(canvas);   // null si falla
     silk.start();          // arranca el loop
     silk.stop();           // pausa el loop
     silk.renderStatic();   // dibuja un frame fijo
     silk.resize();         // recalcula tamaños (llamar en resize)
     silk.destroy();        // limpia todo
   ===================================================================== */
(function () {
  "use strict";

  /* --------- helpers de color --------- */
  function hexToRgb(hex) {
    hex = (hex || "").trim().replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const int = parseInt(hex, 16);
    if (isNaN(int)) return { r: 0, g: 0, b: 0 };
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
  }
  function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return v || fallback;
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (e0, e1, x) => {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };

  /* --------- value noise barato y determinista (sin Math.random) --------- */
  function hash(x, y) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  }
  function pnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const tl = hash(xi, yi), tr = hash(xi + 1, yi);
    const bl = hash(xi, yi + 1), br = hash(xi + 1, yi + 1);
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    return lerp(lerp(tl, tr, u), lerp(bl, br, u), v);
  }

  function create(canvas, opts) {
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null; // sin 2D → fallback CSS (--carbon)

    opts = opts || {};
    const SPEED = opts.speed != null ? opts.speed : 1; // multiplicador de tiempo
    const DPR_CAP = opts.dprCap != null ? opts.dprCap : 1.25;

    // Paleta de marca (leída de los tokens :root)
    const carbon = hexToRgb(cssVar("--carbon", "#17150F"));
    const tinta = hexToRgb(cssVar("--tinta", "#1A1713"));
    const naranja = hexToRgb(cssVar("--naranja", "#E85D1C"));
    const naranjaHi = hexToRgb(cssVar("--naranja-hi", "#F58C28"));
    const crema = hexToRgb(cssVar("--crema", "#EEE8DE"));

    // Hilo de seda: tono cálido tenue derivado de naranja + crema (no púrpura)
    const warm = {
      r: lerp(naranja.r, crema.r, 0.55) * 0.6,
      g: lerp(naranja.g, crema.g, 0.55) * 0.6,
      b: lerp(naranja.b, crema.b, 0.55) * 0.6,
    };

    // Rotación fija (~22°) para dar el sentido diagonal de la seda
    const ANG = 0.38;
    const COSA = Math.cos(ANG), SINA = Math.sin(ANG);
    const NF = 3.0; // frecuencia del noise

    // Buffer chico donde se calcula el patrón (se escala después)
    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d");

    let W = 0, H = 0, bw = 0, bh = 0, imageData = null, scale = 1;
    let raf = 0, running = false, startTime = 0;

    function measure() {
      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(1, Math.round(rect.width));
      const cssH = Math.max(1, Math.round(rect.height));
      scale = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      W = Math.round(cssW * scale);
      H = Math.round(cssH * scale);
      canvas.width = W;
      canvas.height = H;

      // Buffer: resolución acotada (independiente del tamaño real de pantalla)
      bw = Math.min(220, Math.max(80, Math.round(cssW / 6)));
      bh = Math.max(48, Math.round(bw * (cssH / cssW)));
      buf.width = bw;
      buf.height = bh;
      imageData = bctx.createImageData(bw, bh);
      ctx.imageSmoothingEnabled = true; // upscaling suave = seda
    }

    function computeFrame(time) {
      const t = time * 0.001 * SPEED; // segundos
      const data = imageData.data;
      let p = 0;
      for (let j = 0; j < bh; j++) {
        const v = j / (bh - 1 || 1);
        for (let i = 0; i < bw; i++) {
          const u = i / (bw - 1 || 1);
          // coords rotadas
          const ru = u * COSA - v * SINA;
          const rv = u * SINA + v * COSA;
          // noise lento a la deriva
          const n = pnoise(ru * NF, rv * NF + t * 0.04);
          // patrón seno/coseno (hilos de seda cruzados)
          const w1 = Math.sin(ru * 6.2 + n * 3.0 + t * 0.30) * 0.5 + 0.5;
          const w2 = Math.sin(rv * 9.5 - n * 2.0 - t * 0.22) * 0.5 + 0.5;
          let inten = w1 * 0.6 + w2 * 0.4;
          inten = inten * inten * (3 - 2 * inten); // contraste (smoothstep)

          // base: gradiente lineal vertical carbón(arriba) → tinta(abajo)
          const baseR = lerp(carbon.r, tinta.r, v);
          const baseG = lerp(carbon.g, tinta.g, v);
          const baseB = lerp(carbon.b, tinta.b, v);

          // mezcla del hilo cálido (sutil) sobre la base
          const m = inten * 0.5;
          let R = lerp(baseR, warm.r, m);
          let G = lerp(baseG, warm.g, m);
          let B = lerp(baseB, warm.b, m);

          // toque de naranja SOLO en los picos más altos (acento, no relleno)
          const hi = smoothstep(0.72, 1.0, inten) * 0.3;
          R = lerp(R, naranjaHi.r, hi);
          G = lerp(G, naranjaHi.g, hi);
          B = lerp(B, naranjaHi.b, hi);

          data[p++] = R;
          data[p++] = G;
          data[p++] = B;
          data[p++] = 255;
        }
      }
      bctx.putImageData(imageData, 0, 0);

      // escalar el buffer al canvas (suavizado → seda)
      ctx.drawImage(buf, 0, 0, W, H);

      // overlay radial: viñeta que oscurece los bordes (profundidad)
      const g = ctx.createRadialGradient(
        W * 0.5, H * 0.42, 0,
        W * 0.5, H * 0.5, Math.max(W, H) * 0.75
      );
      g.addColorStop(0, "rgba(" + carbon.r + "," + carbon.g + "," + carbon.b + ",0)");
      g.addColorStop(1, "rgba(" + carbon.r + "," + carbon.g + "," + carbon.b + ",0.6)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function loop(now) {
      if (!running) return;
      computeFrame(now - startTime);
      raf = requestAnimationFrame(loop);
    }

    /* --------- API pública --------- */
    function start() {
      if (running) return;
      running = true;
      startTime = performance.now();
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }
    function renderStatic() {
      computeFrame(8000); // un frame fijo "lindo" del patrón
    }
    function resize() {
      const wasRunning = running;
      measure();
      if (wasRunning) {
        // redibuja ya, el loop sigue
        computeFrame(performance.now() - startTime);
      } else {
        renderStatic();
      }
    }
    function destroy() {
      stop();
    }

    measure();
    return { start, stop, renderStatic, resize, destroy, get running() { return running; } };
  }

  window.BulkSilk = { create };
})();
