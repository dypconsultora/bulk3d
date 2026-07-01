/* =====================================================================
   BULK 3D STUDIO — main.js
   Animaciones con GSAP + ScrollTrigger (cargados por CDN en index.php).
   Todo se adapta con gsap.matchMedia() y respeta prefers-reduced-motion.
   El sitio funciona aunque GSAP no cargue (degradación elegante).
   ===================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     0. Navegación (sin dependencias de GSAP) — siempre funciona
  ------------------------------------------------------------------ */
  const header = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  // Header: transparente arriba → fondo papel + sombra al scrollear
  const onScrollHeader = () => {
    if (window.scrollY > 24) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  // Toggle del menú móvil
  if (navToggle && mobileMenu) {
    const closeMenu = () => {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Abrir menú");
      mobileMenu.hidden = true;
    };
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navToggle.setAttribute("aria-label", open ? "Abrir menú" : "Cerrar menú");
      mobileMenu.hidden = open;
    });
    // Cerrar al tocar un link o presionar Escape
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", closeMenu)
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ------------------------------------------------------------------
     0.4 Selector día / noche (independiente de GSAP). El tema inicial ya
     lo aplica el script inline del <head> (anti-parpadeo).
  ------------------------------------------------------------------ */
  const themeSwitch = document.getElementById("themeSwitch");
  if (themeSwitch) {
    const root = document.documentElement;
    const opts = themeSwitch.querySelectorAll("[data-theme-set]");
    const sync = () => {
      const dark = root.getAttribute("data-theme") === "dark";
      opts.forEach((o) =>
        o.setAttribute(
          "aria-pressed",
          String(o.dataset.themeSet === (dark ? "dark" : "light"))
        )
      );
    };
    sync();
    opts.forEach((o) =>
      o.addEventListener("click", () => {
        const dark = o.dataset.themeSet === "dark";
        if (dark) root.setAttribute("data-theme", "dark");
        else root.removeAttribute("data-theme");
        try {
          localStorage.setItem("bulk-theme", dark ? "dark" : "light");
        } catch (e) {}
        sync();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      })
    );
  }

  /* ------------------------------------------------------------------
     0.5 Fondo SILK del hero (independiente de GSAP).
     Funciona aunque GSAP no cargue. Si el canvas no inicia → fallback CSS
     (el hero queda con su fondo sólido --carbon).
  ------------------------------------------------------------------ */
  (function initSilk() {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas || !window.BulkSilk) return;
    const silk = window.BulkSilk.create(canvas);
    if (!silk) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const hero = document.getElementById("hero");
    const isHeroVisible = () => {
      if (!hero) return true;
      const r = hero.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };

    if (reduceMotion) {
      // Sin animar: un único frame estático.
      silk.renderStatic();
    } else {
      silk.start();
      // Pausa el loop cuando el hero sale del viewport (ahorra CPU/batería).
      if ("IntersectionObserver" in window && hero) {
        new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => (e.isIntersecting ? silk.start() : silk.stop()));
          },
          { threshold: 0 }
        ).observe(hero);
      }
      // Pausa también con la pestaña en segundo plano.
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silk.stop();
        else if (isHeroVisible()) silk.start();
      });
    }

    // Recalcular tamaños al redimensionar (debounce).
    let rT;
    window.addEventListener("resize", () => {
      clearTimeout(rT);
      rT = setTimeout(() => silk.resize(), 150);
    });
  })();

  /* ------------------------------------------------------------------
     Guardas: si GSAP no está disponible, dejamos todo visible y salimos.
  ------------------------------------------------------------------ */
  if (typeof window.gsap === "undefined") {
    console.warn("[BULK] GSAP no cargó: el sitio funciona sin animaciones.");
    return;
  }

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Registrar plugins disponibles
  gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);
  const hasSplitText = typeof window.SplitText !== "undefined";
  const hasSmoother = typeof window.ScrollSmoother !== "undefined";

  // Marca al <html> que JS está activo → habilita estados iniciales del CSS
  if (!prefersReduced) document.documentElement.classList.add("js-anim");

  /* ------------------------------------------------------------------
     Si el usuario pidió menos movimiento: sin animaciones de scroll.
     Anclas con scroll suave nativo respetado por el navegador.
  ------------------------------------------------------------------ */
  if (prefersReduced) {
    return;
  }

  /* ------------------------------------------------------------------
     1. Smooth scroll premium (ScrollSmoother) — DESACTIVADO.
        Con ScrollSmoother, dos secciones pineadas seguidas (Materiales +
        Equipamiento) se pisaban/saltaban porque el pin usa transform. Con
        scroll nativo los pins usan position:fixed y son confiables.
        El scroll suave al hacer clic en el menú se mantiene (ScrollToPlugin).
  ------------------------------------------------------------------ */
  const USE_SMOOTHER = false;
  let smoother = null;
  if (USE_SMOOTHER && hasSmoother && document.getElementById("smooth-wrapper")) {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.1,
      effects: false,
      normalizeScroll: true,
    });
  }

  /* ------------------------------------------------------------------
     2. Scroll suave en los enlaces internos (#ancla)
  ------------------------------------------------------------------ */
  const headerH = () =>
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--header-h")
    ) || 80;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (smoother) {
        smoother.scrollTo(target, true, `top ${headerH()}px`);
      } else if (window.ScrollToPlugin) {
        gsap.to(window, {
          duration: 0.8,
          ease: "power2.inOut",
          scrollTo: { y: target, offsetY: headerH() },
        });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ------------------------------------------------------------------
     3. matchMedia: animaciones adaptadas a viewport
  ------------------------------------------------------------------ */
  const mm = gsap.matchMedia();

  /* ===== 3a. HERO (corre en todos los tamaños) ===== */
  mm.add("all", () => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    let split = null;

    // El canvas silk entra con un fade suave
    tl.from('[data-hero="visual"]', { opacity: 0, duration: 1.2, ease: "power1.out" }, 0);

    // Kicker (afecta a la etiqueta y al meta, ambos data-hero="kicker")
    tl.from('[data-hero="kicker"]', { y: 20, opacity: 0, duration: 0.6 }, 0.1);

    // Título — cascada con SplitText (chars) si está disponible; cada línea
    // está en .d-line (overflow:hidden), así los chars suben dentro de su máscara.
    const titleEl = document.querySelector('[data-hero="title"]');
    const lineSpans = titleEl
      ? gsap.utils.toArray(titleEl.querySelectorAll(".d-line > span"))
      : [];

    if (hasSplitText && lineSpans.length) {
      try {
        split = new SplitText(lineSpans, { type: "chars", charsClass: "h-char" });
      } catch (e) {
        split = null;
      }
    }

    if (split && split.chars.length) {
      tl.set(split.chars, { yPercent: 120, opacity: 0 }, "<");
      tl.to(
        split.chars,
        { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.022, ease: "power4.out" },
        "-=0.15"
      );
    } else {
      // Fallback: revelado por línea (sin SplitText)
      tl.set(lineSpans, { yPercent: 110 }, "<");
      tl.to(
        lineSpans,
        { yPercent: 0, duration: 1, stagger: 0.12, ease: "power4.out" },
        "-=0.15"
      );
    }

    // Bajada + CTAs (fromTo + immediateRender:false → si no corre, quedan visibles)
    tl.fromTo('[data-hero="lead"]',
      { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, immediateRender: false }, "-=0.45");
    tl.fromTo('[data-hero="cta"]',
      { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, immediateRender: false }, "-=0.35");

    // Limpieza: revertir SplitText y matar la timeline al recalcular matchMedia
    return () => {
      if (split) split.revert();
      tl.kill();
    };
  });

  /* ===== 3b. Parallax (solo desktop/tablet, evita jank en mobile) ===== */
  mm.add("(min-width: 768px)", () => {
    // Parallax suave de la capa de texto del hero (bajada + CTAs) sobre el silk
    const heroImg = document.querySelector("[data-parallax]");
    if (heroImg) {
      const depth = parseFloat(heroImg.dataset.parallax) || 0.15;
      gsap.to(heroImg, {
        yPercent: depth * 100,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // Parallax leve en imágenes de las máquinas
    gsap.utils.toArray("[data-mparallax]").forEach((img) => {
      gsap.fromTo(
        img,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: img,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });
  });

  /* ===== 3c. Reveals on scroll (fade + translateY con stagger) ===== */
  mm.add("all", () => {
    const reveals = gsap.utils.toArray(".reveal");
    reveals.forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });

    // Stagger en grupos de tarjetas/filas hermanas
    gsap.utils
      .toArray(".elist, .stats, .substats, .why-grid, .prod-grid")
      .forEach((group) => {
        const items = group.querySelectorAll(".reveal");
        if (items.length < 2) return;
        ScrollTrigger.create({
          trigger: group,
          start: "top 80%",
          once: true,
          onEnter: () => {
            gsap.to(items, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
              stagger: 0.1,
              overwrite: true,
            });
          },
        });
      });
  });

  /* ===== 3d. Labels: la línea se "dibuja" (scaleX 0→1) ===== */
  mm.add("all", () => {
    gsap.utils.toArray(".lab__line").forEach((line) => {
      gsap.fromTo(
        line,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: line, start: "top 90%", once: true },
        }
      );
    });
  });

  /* ===== 3e. Contadores animados ===== */
  mm.add("all", () => {
    gsap.utils.toArray("[data-count]").forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: end,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = prefix + obj.val.toFixed(decimals) + suffix;
            },
          });
        },
      });
    });
  });

  /* ===== Materiales: el apilado ahora es 100% CSS (position: sticky) =====
     Sin GSAP/pin: así Equipamiento queda como ÚNICO pin de la página y se
     elimina el conflicto entre dos secciones pineadas seguidas (era lo que
     hacía que las impresoras se pisaran con los materiales). Ver styles.css. */

  /* ===== Equipamiento: scroll horizontal PINEADO (solo desktop ≥960) =====
     Al llegar, la sección se frena (pin) y las impresoras se desplazan al
     costado con el scroll; al final hace una pausa y sigue. El panel es opaco
     y ocupa todo el viewport (CSS) para cubrir lo de atrás. En mobile: nativo. */
  mm.add("(min-width: 960px)", () => {
    const wrap = document.querySelector("[data-hscroll]");
    const track = document.querySelector("[data-hscroll-track]");
    if (!wrap || !track) return;

    const getScrollAmount = () => track.scrollWidth - window.innerWidth;
    const MOVE_FACTOR = 1.5;                          // recorrido (más = más lento)
    const getHold = () => window.innerHeight * 1.2;   // pausa al final

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: () => "+=" + (getScrollAmount() * MOVE_FACTOR + getHold()),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });
    tl.to(track, {
      x: () => -getScrollAmount(),
      ease: "none",
      duration: getScrollAmount() * MOVE_FACTOR,
    });
    tl.to({}, { duration: getHold() });               // se queda la última visible

    return () => tl.kill();
  });

  /* ------------------------------------------------------------------
     4. Refresh tras cargar fuentes/imágenes (evita posiciones erróneas)
  ------------------------------------------------------------------ */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener("load", () => ScrollTrigger.refresh());

  /* ------------------------------------------------------------------
     5. Formulario de contacto SIN PHP — validación + envío AJAX a Formspree.
        Si el endpoint sigue siendo el placeholder (TU_ID_FORMSPREE), no envía
        y guía a WhatsApp/Email. Honeypot anti-spam incluido.
  ------------------------------------------------------------------ */
  const form = document.getElementById("contactForm");
  if (form) {
    const statusEl = document.getElementById("formStatus");
    const submitLabel = form.querySelector(".form__submit-label");

    const setError = (field, msg) => {
      const input = form.querySelector(`#${field}`);
      const errEl = form.querySelector(`[data-error-for="${field}"]`);
      if (errEl) errEl.textContent = msg || "";
      if (input) {
        input.classList.toggle("is-invalid", !!msg);
        if (msg) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      }
    };

    const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const showStatus = (msg, ok) => {
      if (!statusEl) return;
      statusEl.hidden = false;
      statusEl.textContent = msg;
      statusEl.classList.toggle("form__alert--ok", ok);
      statusEl.classList.toggle("form__alert--err", !ok);
    };

    const validate = () => {
      let ok = true;
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      if (name.length < 2) { setError("name", "Ingresá tu nombre."); ok = false; }
      else setError("name", "");
      if (!validateEmail(email)) { setError("email", "Ingresá un email válido."); ok = false; }
      else setError("email", "");
      if (message.length < 10) { setError("message", "Contanos un poco más (mín. 10 caracteres)."); ok = false; }
      else setError("message", "");
      return ok;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate()) {
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      // Honeypot: si el campo oculto viene completo, es un bot → éxito silencioso.
      if (form.website && form.website.value) {
        showStatus("¡Gracias! Tu mensaje fue enviado.", true);
        form.reset();
        return;
      }
      // Endpoint sin configurar todavía.
      if (form.action.indexOf("TU_ID_FORMSPREE") !== -1) {
        showStatus("El formulario todavía no está conectado. Escribinos por WhatsApp o email mientras tanto.", false);
        return;
      }

      if (submitLabel) submitLabel.textContent = "Enviando…";
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          showStatus("¡Gracias! Tu mensaje fue enviado. Te respondemos a la brevedad.", true);
          form.reset();
        } else {
          showStatus("No pudimos enviar el mensaje. Probá de nuevo o escribinos por WhatsApp.", false);
        }
      } catch (err) {
        showStatus("Error de conexión. Probá de nuevo o escribinos por WhatsApp.", false);
      } finally {
        if (submitLabel) submitLabel.textContent = "Enviar mensaje";
      }
    });

    // Validación en vivo al salir de cada campo (blur)
    ["name", "email", "message"].forEach((field) => {
      const input = form.querySelector(`#${field}`);
      if (!input) return;
      input.addEventListener("blur", () => {
        const v = input.value.trim();
        if (field === "name") setError("name", v.length >= 2 ? "" : "Ingresá tu nombre.");
        if (field === "email") setError("email", validateEmail(v) ? "" : "Ingresá un email válido.");
        if (field === "message") setError("message", v.length >= 10 ? "" : "Contanos un poco más (mín. 10 caracteres).");
      });
    });
  }
})();
