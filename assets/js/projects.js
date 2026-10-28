/* ============================================================
   ESTUDIO UMBRAL · Modal de proyecto
   Abre el <dialog> accesible con la ficha de cada proyecto:
   título y metadatos se leen del HTML (fuente única de verdad),
   el contenido extendido viene de UMBRAL.projectDetails.
   ============================================================ */
(function (global) {
  "use strict";

  var UMBRAL = global.UMBRAL || (global.UMBRAL = {});
  var doc = document;

  var dialog = doc.querySelector("[data-modal]");
  if (!dialog) return;

  var dlg = {
    index: dialog.querySelector("[data-modal-index]"),
    title: dialog.querySelector("[data-modal-title]"),
    meta: dialog.querySelector("[data-modal-meta]"),
    hero: dialog.querySelector("[data-modal-hero]"),
    heroCap: dialog.querySelector("[data-modal-herocaption]"),
    text: dialog.querySelector("[data-modal-text]"),
    specs: dialog.querySelector("[data-modal-specs]"),
    gallery: dialog.querySelector("[data-modal-gallery]"),
    prev: dialog.querySelector("[data-modal-prev]"),
    next: dialog.querySelector("[data-modal-next]"),
    close: dialog.querySelector("[data-modal-close]"),
    contact: dialog.querySelector("[data-modal-contact]")
  };

  var order = [];      // slugs en orden de aparición en la página
  var current = null;  // slug activo
  var lastTrigger = null;

  function el(tag, className, text) {
    var node = doc.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  /* --- Fuente de verdad: las tarjetas del HTML -------------------------- */
  function readCard(slug) {
    var article = doc.querySelector('[data-project="' + slug + '"]');
    if (!article) return null;

    var meta = [];
    Array.prototype.forEach.call(
      article.querySelectorAll(".project__meta-row"),
      function (row) {
        var dt = row.querySelector("dt");
        var dd = row.querySelector("dd");
        if (dt && dd) meta.push({ k: dt.textContent, v: dd.textContent });
      }
    );

    var img = article.querySelector(".project__img");
    var caption = article.querySelector(".project__caption");

    return {
      slug: slug,
      number: (article.querySelector(".project__index") || {}).textContent || "",
      title: (article.querySelector(".project__title") || {}).textContent || "",
      desc: (article.querySelector(".project__desc") || {}).textContent || "",
      meta: meta,
      img: img ? { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "" } : null,
      caption: caption ? caption.textContent : ""
    };
  }

  /* --- Render ----------------------------------------------------------- */
  function render(slug) {
    var card = readCard(slug);
    var extra = (UMBRAL.projectDetails || {})[slug];
    if (!card) return;

    current = slug;

    dlg.index.textContent = card.number.trim().slice(0, 2) || "—";
    dlg.title.textContent = card.title;

    /* metadatos de la tarjeta */
    dlg.meta.textContent = "";
    card.meta.forEach(function (m) {
      var row = el("div");
      row.appendChild(el("dt", null, m.k));
      row.appendChild(el("dd", null, m.v));
      dlg.meta.appendChild(row);
    });

    /* imagen principal */
    if (card.img) {
      dlg.hero.setAttribute("src", card.img.src);
      dlg.hero.setAttribute("alt", card.img.alt);
    }
    dlg.heroCap.textContent = card.caption + " · Ejemplo de portfolio";

    /* texto: descripción breve + párrafos extendidos */
    dlg.text.textContent = "";
    dlg.text.appendChild(el("p", null, card.desc));
    if (extra && extra.longText) {
      extra.longText.forEach(function (p) { dlg.text.appendChild(el("p", null, p)); });
    }

    /* ficha técnica */
    dlg.specs.textContent = "";
    if (extra && extra.specs) {
      extra.specs.forEach(function (s) {
        var row = el("div");
        row.appendChild(el("dt", null, s.k));
        row.appendChild(el("dd", null, s.v));
        dlg.specs.appendChild(row);
      });
    } else {
      var row = el("div");
      row.appendChild(el("dt", null, "Nota"));
      row.appendChild(el("dd", null, "Proyecto ficticio, ejemplo de portfolio."));
      dlg.specs.appendChild(row);
    }

    /* galería */
    dlg.gallery.textContent = "";
    if (extra && extra.gallery) {
      extra.gallery.forEach(function (g) {
        var fig = el("figure");
        var img = el("img");
        img.setAttribute("src", g.src);
        img.setAttribute("alt", g.alt);
        img.setAttribute("width", "1400");
        img.setAttribute("height", "1050");
        img.setAttribute("loading", "lazy");
        img.setAttribute("decoding", "async");
        img.addEventListener("error", function () { markImageError(fig, g.alt); });
        fig.appendChild(img);
        fig.appendChild(el("figcaption", null, g.cap));
        dlg.gallery.appendChild(fig);
      });
    }

    /* navegación anterior/siguiente (circular) */
    var pos = order.indexOf(slug);
    var hasMore = order.length > 1;
    dlg.prev.hidden = !hasMore;
    dlg.next.hidden = !hasMore;
    dlg.prev.disabled = !hasMore;
    dlg.next.disabled = !hasMore;

    /* reenfocar el cuerpo para lectores de pantalla */
    dialog.querySelector(".modal__body").scrollTop = 0;
  }

  /* Si una imagen del modal falla, se muestra su texto alternativo */
  function markImageError(figure, alt) {
    figure.classList.add("is-error");
    var note = el("p", "modal__img-error",
      "Imagen no disponible" + (alt ? " — " + alt : ""));
    figure.replaceChild(note, figure.querySelector("img"));
  }

  /* --- Apertura / cierre ------------------------------------------------ */
  function open(slug, trigger) {
    lastTrigger = trigger || null;
    render(slug);
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      /* navegadores sin <dialog>: fallback con aria-modal */
      dialog.setAttribute("open", "");
      dialog.setAttribute("aria-modal", "true");
    }
    doc.body.style.overflow = "hidden";
  }

  function close() {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      doc.body.style.overflow = "";
      restoreFocus();
    }
  }

  function restoreFocus() {
    if (lastTrigger && doc.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  dialog.addEventListener("close", function () {
    doc.body.style.overflow = "";
    restoreFocus();
  });

  /* Clic fuera del panel (sobre el backdrop) */
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) close();
  });

  dlg.close.addEventListener("click", close);

  dlg.prev.addEventListener("click", function () {
    var i = order.indexOf(current);
    render(order[(i - 1 + order.length) % order.length]);
  });

  dlg.next.addEventListener("click", function () {
    var i = order.indexOf(current);
    render(order[(i + 1) % order.length]);
  });

  /* "Consultar un proyecto similar": cierra y lleva al formulario */
  dlg.contact.addEventListener("click", function () {
    close();
  });

  /* --- Disparadores ----------------------------------------------------- */
  var triggers = Array.prototype.slice.call(doc.querySelectorAll("[data-open-project]"));

  triggers.forEach(function (btn) {
    btn.addEventListener("click", function () {
      open(btn.getAttribute("data-open-project"), btn);
    });
  });

  /* Orden de navegación: el de las tarjetas de la página */
  Array.prototype.forEach.call(doc.querySelectorAll("[data-project]"), function (a) {
    order.push(a.getAttribute("data-project"));
  });

  /* Imágenes del catálogo con degradación elegante si fallan */
  Array.prototype.forEach.call(doc.querySelectorAll(".project__trigger img, .hero__img, .manifesto__img, .about__img, .services__band-img"), function (img) {
    img.addEventListener("error", function () {
      var fig = img.closest("figure") || img.parentNode;
      img.style.visibility = "hidden";
      if (fig && !fig.querySelector(".img-fallback")) {
        var note = el("p", "img-fallback", img.alt || "Imagen no disponible");
        fig.classList.add("has-img-error");
        fig.appendChild(note);
      }
    });
  });

  UMBRAL.openProject = open;
})(window);
