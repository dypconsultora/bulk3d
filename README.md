# BULK 3D STUDIO — Landing one-page

Sitio de una sola página para **BULK 3D STUDIO**, servicio de impresión 3D FDM en
Buenos Aires. Construido con **HTML5 + CSS + JavaScript vanilla + PHP**. Sin Node,
sin npm, sin build tools: se sube tal cual a cualquier hosting con PHP y funciona.

---

## 📁 Estructura

```
index.php            HTML del sitio (usa includes PHP de partials)
contact.php          Procesa el formulario y manda el mail con mail()
partials/header.php  Nav sticky + menú móvil
partials/footer.php  Pie de página
css/styles.css       Tokens en :root + todos los estilos
js/main.js           GSAP (CDN) + animaciones
assets/              Placeholders: printer-hero, h2d, x1c, h2s, p1s, a1, a1mini,
                     pla, petg, abs, tpu, favicon.svg, og-image.png
README.md            Este archivo
```

---

## ▶️ Cómo probarlo localmente (sin Node)

Necesitás **PHP instalado** (viene en macOS; en Windows usá XAMPP/Laragon).

### Opción A — Servidor embebido de PHP (lo más rápido)

```bash
cd bulk3dstudio
php -S localhost:8000
```

Abrí **http://localhost:8000** en el navegador.

> macOS reciente no trae PHP por defecto. Instalalo con: `brew install php`.

### Opción B — XAMPP / Laragon (Windows o Mac)

1. Copiá la carpeta `bulk3dstudio` dentro de `htdocs` (XAMPP) o `www` (Laragon).
2. Iniciá Apache desde el panel.
3. Entrá a `http://localhost/bulk3dstudio/`.

---

## 🚀 Subirlo a un hosting PHP (producción)

1. Subí **todos los archivos** por FTP a la carpeta pública (`public_html`,
   `httpdocs` o equivalente).
2. Listo: el sitio queda en tu dominio. No hay nada que compilar.

### Para que ande el formulario

El formulario usa la función **`mail()`** de PHP. La mayoría de los hostings la
traen configurada. En `contact.php` editá arriba de todo:

```php
$DESTINO = "hola@bulk3dstudio.com";   // tu casilla real
```

**¿`mail()` no envía o cae en spam?** Es común en hostings compartidos. Pasá a
**SMTP con PHPMailer** (sin Composer): instrucciones paso a paso al final de
`contact.php`. Recomendado usar un `From:` de tu propio dominio
(ej. `no-reply@bulk3dstudio.com`).

---

## 🖼️ Reemplazar las imágenes (placeholders)

En `assets/` hay placeholders generados con los colores de marca. Reemplazalos por
tus fotos **manteniendo el mismo nombre de archivo** (o actualizá el `src` en
`index.php`). Nombres esperados:

| Archivo            | Uso                          |
|--------------------|------------------------------|
| `printer-hero.png` | Impresora del hero (parallax)|
| `h2d / x1c / h2s / p1s / a1 / a1mini .png` | Las 6 Bambu Lab |
| `pla / petg / abs / tpu .png` | Los 4 materiales    |
| `og-image.png`     | Imagen para compartir (1200×630) |
| `favicon.svg`      | Favicon                      |

Recomendado: exportar en **WebP** o PNG optimizado. Las imágenes ya usan
`loading="lazy"` y `width/height` para evitar saltos de layout (CLS).

---

## ✨ Qué incluye

**Secciones:** Header sticky · Hero · Servicio · Tecnología · Precisión ·
Materiales · Equipamiento (scroll horizontal) · Producción · Proceso ·
Por qué elegirnos · CTA/Contacto · Footer.

**Animaciones (GSAP + ScrollTrigger por CDN):**
- Hero en cascada con revelado de título por líneas (SplitText si está disponible).
- Parallax de la impresora y de las máquinas (solo desktop/tablet).
- Reveals on-scroll con stagger en todas las secciones.
- Contadores animados (0.1mm · ±0.2% · 100% · 500+ · 72hs).
- Equipamiento con **scroll horizontal pineado** (pin + scrub) en desktop;
  scroll táctil nativo en mobile.
- Líneas/kickers que se "dibujan" (scaleX 0→1).
- Marquee de formatos en loop.
- Smooth scroll opcional con ScrollSmoother.
- Nav transparente → fondo papel + sombra al cruzar el hero.

**Accesibilidad y performance:**
- `prefers-reduced-motion` respetado (apaga scrub/parallax y deja todo visible).
- HTML semántico, foco visible, skip-link, `aria-label`, contraste AA.
- Solo se animan `transform` y `opacity`; `gsap.matchMedia()` recorta animaciones
  en mobile. Si el CDN de GSAP falla, el sitio funciona igual (degradación elegante).
- SEO: `<title>`, meta description, Open Graph, favicon y JSON-LD (LocalBusiness).

---

## 🎨 Tokens de diseño

Todos los colores, tipografías y espaciados están en `:root` dentro de
`css/styles.css`. Cambiá ahí para reajustar la identidad.

Tipografías (Google Fonts): **Anton**, **Archivo Black**, **Spectral**,
**Space Grotesk**.

---

## ⚙️ Versión de GSAP

Se carga **GSAP 3.12.5** por CDN (cdnjs) en `index.php`: core + ScrollTrigger +
ScrollToPlugin + SplitText + ScrollSmoother. Si querés otra versión, cambiá la URL.
