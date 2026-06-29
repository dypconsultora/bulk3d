<?php
/**
 * Header / Nav — sticky, transparente arriba, con fondo papel + sombra al scrollear.
 * Se incluye desde index.php con <?php include 'partials/header.php'; ?>
 */
?>
<a class="skip-link" href="#main">Saltar al contenido</a>

<header class="site-header" id="siteHeader" data-header>
  <div class="container header__inner">
    <!-- Wordmark -->
    <a href="#hero" class="wordmark" aria-label="BULK 3D STUDIO — inicio">
      <span class="wordmark__bulk">BULK</span><span class="wordmark__rest">&nbsp;3D&nbsp;STUDIO</span>
    </a>

    <!-- Navegación principal (desktop) -->
    <nav class="nav" aria-label="Navegación principal">
      <ul class="nav__list">
        <li><a href="#servicio"    class="nav__link">Servicios</a></li>
        <li><a href="#tecnologia"  class="nav__link">Tecnología</a></li>
        <li><a href="#materiales"  class="nav__link">Materiales</a></li>
        <li><a href="#equipamiento" class="nav__link">Equipamiento</a></li>
        <li><a href="#proceso"     class="nav__link">Proceso</a></li>
        <li><a href="#contacto"    class="nav__link">Contacto</a></li>
      </ul>
    </nav>

    <a href="#contacto" class="btn btn--primary btn--sm nav__cta">Pedí tu presupuesto</a>

    <!-- Toggle móvil -->
    <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="mobileMenu" aria-label="Abrir menú">
      <span class="nav-toggle__bar"></span>
      <span class="nav-toggle__bar"></span>
      <span class="nav-toggle__bar"></span>
    </button>
  </div>

  <!-- Menú móvil -->
  <div class="mobile-menu" id="mobileMenu" hidden>
    <nav aria-label="Navegación móvil">
      <ul class="mobile-menu__list">
        <li><a href="#servicio"    class="mobile-menu__link">Servicios</a></li>
        <li><a href="#tecnologia"  class="mobile-menu__link">Tecnología</a></li>
        <li><a href="#materiales"  class="mobile-menu__link">Materiales</a></li>
        <li><a href="#equipamiento" class="mobile-menu__link">Equipamiento</a></li>
        <li><a href="#proceso"     class="mobile-menu__link">Proceso</a></li>
        <li><a href="#contacto"    class="mobile-menu__link">Contacto</a></li>
      </ul>
      <a href="#contacto" class="btn btn--primary mobile-menu__cta">Pedí tu presupuesto</a>
    </nav>
  </div>
</header>
