# STATE — BULK 3D STUDIO

Estado actual del proyecto para retomar sin romper nada. Leer junto con `README.md`.

## Qué es
Landing one-page, servicio de impresión 3D FDM en Buenos Aires. Voseo rioplatense.
Stack: **HTML5 + CSS + JS vanilla + PHP**. SIN Node/npm/build. GSAP por CDN.

## Dirección visual
**Minimalismo Exagerado**: tipografía gigante (Anton), espacio en blanco extremo,
un solo acento naranja, esquinas a 0, hairlines, layout asimétrico a la izquierda,
secciones oscuras (carbón) para contraste. NO usar tarjetas redondeadas con sombra.

## Archivos
```
index.php            · HTML (incluye partials con PHP). 10 secciones + hero.
contact.php          · formulario: validación server-side + mail() + honeypot.
partials/header.php  · nav sticky + menú móvil.
partials/footer.php  · footer (wordmark display + columnas).
css/styles.css       · tokens en :root + estilos. Bloque HERO maneja el silk.
js/silk.js           · fondo "silk" animado del hero (canvas vanilla). window.BulkSilk.create()
js/main.js           · GSAP (CDN) + animaciones + init del silk + validación form.
assets/              · placeholders PNG + favicon.svg + og-image.png.
                       (printer-hero.png quedó SIN uso: el hero ahora es el silk)
```

## Tokens (`:root` en css/styles.css)
Colores: `--naranja #E85D1C` `--naranja-hi #F58C28` `--naranja-lo #D64814`
`--tinta #1A1713` `--papel #F2EEE6` `--crema #EEE8DE` `--carbon #17150F`
`--slate #6E665C` `--faint #D8D1C5` `--obrown #60260C`.
Reglas: sobre oscuro el texto va en `--crema` (nunca `--slate`). Naranja = acento.
Fuentes: Anton (display/hero) · Archivo Black (titulares) · Spectral italic (énfasis serif, naranja) · Space Grotesk (cuerpo/datos).

## HERO con fondo silk (lo último que se sumó)
- `js/silk.js`: porta a canvas vanilla la lógica del silk (noise + seno/coseno +
  gradiente lineal de base + overlay radial), recoloreada a la marca (base carbón/tinta,
  hilos cálidos derivados de naranja+crema, naranja solo en los picos).
- Optimizado: el patrón se calcula en un buffer chico y se escala (costo acotado, ok en 4K),
  DPR con tope, y el loop se **pausa** cuando el hero sale del viewport (IntersectionObserver
  en main.js) y con la pestaña en segundo plano.
- `prefers-reduced-motion` → un frame estático (sin loop).
- Fallback: si el canvas no inicia, el hero queda con fondo sólido `--carbon` (CSS).
- El título `.hero__title` usa `mix-blend-mode: difference` en las líneas blancas
  (invierten sobre el silk); la palabra serif de énfasis queda en naranja legible.
  Para que el blend "vea" el canvas: `.hero` tiene `isolation:isolate`, el canvas va
  primero en el DOM con `z-index:0`, y `.hero__inner` NO lleva z-index/transform.
  ⚠️ No poner transform/z-index en `.hero__inner` ni en `.hero__title` o se rompe el blend.
- GSAP en el hero: entrada del título con **SplitText** (chars en cascada; fallback a
  slide por línea), fade del canvas, y parallax suave de la capa de texto (`.hero__bottom`,
  `data-parallax`, solo ≥768px).

## Animaciones existentes (NO romper)
reveals on-scroll con stagger, contadores (`[data-count]`), scroll horizontal de
equipamiento con pin+scrub (`[data-hscroll]`), líneas `.lab__line` que se dibujan,
nav transparente→papel (`is-scrolled`), marquee. Todo con `gsap.matchMedia()` y
`prefers-reduced-motion`. Si GSAP no carga, el sitio funciona igual (degradación).

## Hooks de JS (mantener en el HTML si se edita)
`data-hero="kicker|title|lead|cta|visual"`, `.reveal`, `.lab__line`, `[data-count]`
(+ `data-decimals/prefix/suffix`), `[data-parallax]`, `[data-mparallax]`,
`[data-hscroll]`, `[data-hscroll-track]`, `#heroCanvas`, ids del form (`contactForm`, etc.).

## Cómo correrlo (sin Node)
```bash
cd bulk3dstudio
/opt/homebrew/bin/php -S 127.0.0.1:8000 -t .   # PHP instalado vía brew en esta Mac
# abrir http://127.0.0.1:8000
```
Nota de entorno: las herramientas de preview/Chrome del asistente NO llegan a este
localhost (sandbox); verificar con `curl` o en el navegador real.

## Pendiente antes de publicar
- Reemplazar placeholders de `assets/` por fotos reales (mismos nombres).
- WhatsApp real (`wa.me/549XXXXXXXXXX`) y email destino en `contact.php`.
- Confirmar `mail()` en el hosting o pasar a SMTP/PHPMailer (ver fin de `contact.php`).
- Si llega el `silk-background-animation.tsx` original, alinear constantes de `silk.js`
  (frecuencias, rotación, velocidad) con la referencia exacta.
- Opcional: decidir si reusar `printer-hero.png` en alguna sección (hoy sin uso).

## Última verificación
PHP sin errores (4 archivos), `js/silk.js` y `js/main.js` sin errores de sintaxis (node -c),
HTTP 200 en index/css/js, 10 secciones intactas, hooks del hero presentes.
