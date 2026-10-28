/* ============================================================
   ESTUDIO UMBRAL · Comportamiento general
   Cabecera, menú móvil, navegación activa, revelado respetando
   prefers-reduced-motion, año dinámico y datos de contacto.
   ============================================================ */
(function (global) {
  "use strict";

  var UMBRAL = global.UMBRAL || (global.UMBRAL = {});
  var doc = document;
  var reduceMotion = global.matchMedia("(prefers-reduced-motion: reduce)");

  /* --- Cabecera: regla inferior al hacer scroll ------------------------ */
  var header = doc.querySelector("[data-header]");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", global.scrollY > 8);
    };
    onScroll();
    global.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Menú móvil ------------------------------------------------------ */
  var toggle = doc.querySelector("[data-nav-toggle]");
  var nav = doc.querySelector("[data-nav]");
  var navLabel = doc.querySelector("[data-nav-label]");

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    if (navLabel) navLabel.textContent = open ? "Cerrar" : "Menú";
    doc.body.style.overflow = open ? "hidden" : "";
    if (open) {
      var first = nav.querySelector("a");
      if (first) first.focus();
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });

    /* Al pasar a desktop, el menú debe volver a su estado natural */
    global.matchMedia("(min-width: 900px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* --- Navegación activa según sección visible ------------------------- */
  var navLinks = Array.prototype.slice.call(
    doc.querySelectorAll('.site-nav__link[href^="#"]')
  );

  if ("IntersectionObserver" in global && navLinks.length) {
    var linkById = {};
    navLinks.forEach(function (a) { linkById[a.getAttribute("href").slice(1)] = a; });

    var current = null;
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var link = linkById[entry.target.id];
        if (!link || link === current) return;
        if (current) current.removeAttribute("aria-current");
        link.setAttribute("aria-current", "true");
        current = link;
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    Object.keys(linkById).forEach(function (id) {
      var section = doc.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  /* --- Revelado de secciones -------------------------------------------
     Se aplica solo si el usuario NO pide movimiento reducido; en ese caso
     el contenido queda visible de inmediato (sin desplazamiento ni opacidad). */
  var revealables = Array.prototype.slice.call(doc.querySelectorAll(".reveal"));

  if (revealables.length) {
    if (reduceMotion.matches || !("IntersectionObserver" in global)) {
      revealables.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

      revealables.forEach(function (el, i) {
        /* escalonado discreto dentro de cada grupo */
        el.style.setProperty("--reveal-delay", (i % 3) * 70 + "ms");
        revealObserver.observe(el);
      });
    }
  }

  /* --- Año dinámico del pie -------------------------------------------- */
  var yearEl = doc.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* --- Contacto directo desde configuración ---------------------------- */
  var cfg = UMBRAL.config || {};
  var waLine = doc.querySelector("[data-whatsapp-line]");
  var waLink = doc.querySelector("[data-whatsapp-link]");
  var waNote = doc.querySelector("[data-whatsapp-note]");

  if (cfg.whatsapp && waLine && waLink) {
    waLine.hidden = false;
    waLink.href = "https://wa.me/" + cfg.whatsapp;
    waLink.textContent = "+" + cfg.whatsapp.replace(/^\+?/, "");
    if (waNote) waNote.hidden = true;
  }

  /* Vínculos mailto con el correo configurado */
  Array.prototype.forEach.call(doc.querySelectorAll('a[href^="mailto:"]'), function (a) {
    if (cfg.email && a.getAttribute("href").indexOf("estudioumbral.example") !== -1) {
      a.href = "mailto:" + cfg.email;
      if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(cfg.email) && a.textContent.indexOf("@") !== -1) {
        a.textContent = cfg.email;
      }
    }
  });

  UMBRAL.setMenu = setMenu;
})(window);
