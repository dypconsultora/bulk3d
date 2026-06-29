# BULK 3D STUDIO — Landing one-page (estática)

Sitio de una sola página para **BULK 3D STUDIO**, servicio de impresión 3D FDM en
Buenos Aires. **100% estático: HTML5 + CSS + JavaScript vanilla. Sin PHP, sin Node,
sin build.** Anda directo en GitHub Pages o en cualquier hosting estático.

---

## 📁 Estructura
```
index.html        Sitio completo (una sola página)
css/styles.css    Tokens en :root + estilos
js/silk.js        Fondo "silk" animado del hero (canvas vanilla)
js/main.js        GSAP (CDN) + animaciones + validación/envío del formulario
assets/           Imágenes (placeholders) + favicon.svg + og-image.png
.nojekyll         Para que GitHub Pages sirva todo tal cual
```

---

## ▶️ Verlo localmente
La forma más simple: **doble clic en `index.html`** (se abre en el navegador).

O con un mini server estático (recomendado, igual que en producción):
```bash
cd bulk3dstudio
python3 -m http.server 8000
# abrir http://127.0.0.1:8000
```
(No hace falta PHP ni nada instalado aparte de Python, que ya viene en macOS.)

---

## 🚀 Publicar en GitHub Pages
1. Subí el repo a GitHub.
2. **Settings → Pages → Source: "Deploy from a branch" → Branch: `main` / `/ (root)` → Save.**
3. En ~1 min queda online en `https://<usuario>.github.io/<repo>/`.

También sirve en Netlify, Vercel, o cualquier hosting estático: subís los archivos y listo.

---

## ✉️ Formulario de contacto (sin servidor)
Como no hay PHP, el formulario envía con **Formspree** (gratis, sin backend):
1. Creá una cuenta en https://formspree.io → **New form** → copiá el ID.
2. En `index.html`, reemplazá `TU_ID_FORMSPREE` en el `action` del `<form>` por tu ID
   real (queda como `https://formspree.io/f/abcdwxyz`).
3. Listo: el envío funciona por AJAX, con validación y honeypot anti-spam.

Mientras no esté configurado, el form avisa y deriva a WhatsApp/Email (que siempre
funcionan). **Acordate de cambiar** el WhatsApp (`wa.me/5491155512480`) y el email
(`hola@bulk3dstudio.com`) por los reales.

---

## 🖼️ Reemplazar imágenes
En `assets/` hay placeholders con los colores de marca. Reemplazalos por tus fotos
manteniendo el mismo nombre (o actualizá el `src` en `index.html`). Recomendado WebP
o PNG optimizado. Ya usan `loading="lazy"` y `width/height` para evitar saltos (CLS).

---

## ✨ Qué incluye
**Secciones:** Hero (fondo silk) · Servicio · Tecnología · Precisión · Materiales
(apilado sticky) · Equipamiento (scroll horizontal) · Producción · Proceso · Por qué
elegirnos · Contacto · Footer.

**Animaciones (GSAP por CDN):** entrada del hero con SplitText, fondo silk animado en
canvas, reveals on-scroll, contadores, apilado de materiales con `position: sticky`,
scroll horizontal pineado en Equipamiento, marquee. Respeta `prefers-reduced-motion`
y degrada con elegancia si el CDN falla.

**Marca:** tokens de color y tipografías (Anton, Archivo Black, Spectral, Space
Grotesk) en `:root` dentro de `css/styles.css`.
