# STATE — BULK 3D STUDIO

Estado actual para retomar sin romper nada. Leer junto con `README.md`.

## Qué es
Landing one-page de impresión 3D FDM (Buenos Aires). Voseo rioplatense.
**100% estático: HTML + CSS + JS vanilla. SIN PHP, sin Node, sin build.**
Pensado para GitHub Pages / cualquier hosting estático.

## Dirección visual
**Minimalismo Exagerado**: tipografía gigante (Anton/Spectral), espacio en blanco
extremo, un solo acento naranja, esquinas a 0, hairlines, layout asimétrico.
NO tarjetas redondeadas con sombra. Pase tipográfico "fino" aplicado (menos Archivo
Black, más Anton/Spectral/Space Grotesk Medium) — alineado al manual de marca.

## Archivos
```
index.html        Sitio completo (header/footer inlineados, sin includes)
css/styles.css    Tokens en :root + estilos (mobile-first)
js/silk.js        Fondo silk del hero (canvas vanilla). window.BulkSilk.create()
js/main.js        GSAP (CDN) + animaciones + validación/envío del form
assets/           Placeholders + favicon.svg + og-image.png
.nojekyll
```
(Se eliminaron index.php, contact.php y partials/: ya no se usa PHP.)

## Tokens (`:root` en css/styles.css)
Colores: `--naranja #E85D1C` `--naranja-hi #F58C28` `--naranja-lo #D64814`
`--tinta #1A1713` `--papel #F2EEE6` `--crema #EEE8DE` `--carbon #17150F`
`--slate #6E665C` `--faint #D8D1C5` `--obrown #60260C`.
Regla: sobre oscuro el texto en `--crema` (nunca `--slate`). Naranja = acento.
Fuentes: Anton (display/hero) · Archivo Black (destacados, uso mínimo) ·
Spectral italic (énfasis serif naranja) · Space Grotesk (cuerpo/datos).

## Decisiones clave de animación (no romper)
- **Hero**: fondo silk animado en canvas (`js/silk.js`), recoloreado a la marca;
  pausa el loop fuera de viewport; frame estático con `prefers-reduced-motion`;
  fallback a `--carbon` si el canvas no inicia. Título Anton con SplitText; las
  líneas blancas usan `mix-blend-difference` (no poner transform/z-index en
  `.hero__inner`/`.hero__title` o se rompe el blend; `.hero` tiene isolation).
- **Materiales (apilado)**: es **CSS puro `position: sticky`** (NO GSAP/pin). Cada
  `.mat` es sticky y se cubre con el siguiente. Requiere que ningún ancestro tenga
  `overflow:hidden` → por eso `body` usa `overflow-x: clip`.
- **Equipamiento**: ÚNICO pin de la página (ScrollTrigger horizontal, ≥960px).
  Importante: tener dos secciones pineadas seguidas rompía el layout; por eso
  Materiales se pasó a sticky (sin pin).
- **ScrollSmoother DESACTIVADO** (`USE_SMOOTHER=false` en main.js): con scroll suave
  los pins se pisaban. Scroll nativo + ScrollToPlugin para el scroll suave del menú.

## Formulario (sin PHP)
Envía con **Formspree** vía AJAX (fetch) en `js/main.js`. En `index.html` el `action`
tiene el placeholder `TU_ID_FORMSPREE` → reemplazar por el endpoint real. Validación
en front + honeypot (`input[name=website]`). Si no está configurado, avisa y deriva
a WhatsApp/Email. WhatsApp/Email son placeholders (`wa.me/5491155512480`,
`hola@bulk3dstudio.com`).

## Cómo correrlo
Doble clic en `index.html`, o `python3 -m http.server 8000` (http://127.0.0.1:8000).

## Pendiente antes de publicar
- Reemplazar placeholders de `assets/` por fotos reales (mismos nombres).
- Configurar Formspree (ID real) y poner WhatsApp/email reales.
- `assets/printer-hero.png` quedó sin uso (el hero es el silk).
- Opcional: integrar logos originales (`logo-fondo-degrade.png`, etc.).

## Hooks de JS (mantener si se edita el HTML)
`data-hero="kicker|title|lead|cta|visual"`, `.reveal`, `.lab__line`, `[data-count]`,
`[data-parallax]`, `[data-mparallax]`, `[data-hscroll]`, `[data-hscroll-track]`,
`#heroCanvas`, `.mat-stack`/`.mat`, ids del form (`contactForm`, `formStatus`).
