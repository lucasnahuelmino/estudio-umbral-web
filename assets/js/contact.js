/* ============================================================
   ESTUDIO UMBRAL · Formulario de contacto
   ---------------------------------------------------------------------------
   Comportamiento honesto:
   - Sin endpoint configurado (por defecto) valida, arma el mensaje y ofrece
     enviarlo por correo/WhatsApp. NO afirma que nada se haya enviado.
   - Con endpoint configurado hace un POST real y muestra los estados
     de carga, éxito y error.
   ============================================================ */
(function (global) {
  "use strict";

  var UMBRAL = global.UMBRAL || (global.UMBRAL = {});
  var doc = document;
  var cfg = UMBRAL.config || {};

  var form = doc.getElementById("contact-form");
  if (!form) return;

  var preparedPanel = doc.getElementById("prepared-panel");
  var errorPanel = doc.getElementById("error-panel");
  var statusEl = form.querySelector("[data-form-status]");
  var submitBtn = form.querySelector("[data-submit]");
  var submitLabel = form.querySelector("[data-submit-label]");

  var previewEl = preparedPanel.querySelector("[data-preview]");
  var mailLink = preparedPanel.querySelector("[data-mail-link]");
  var waLink = preparedPanel.querySelector("[data-wa-link]");
  var copyBtn = preparedPanel.querySelector("[data-copy]");
  var editBtn = preparedPanel.querySelector("[data-edit]");
  var copyStatus = preparedPanel.querySelector("[data-copy-status]");
  var retryBtn = errorPanel.querySelector("[data-retry]");
  var errorDetail = errorPanel.querySelector("[data-error-detail]");

  var lastMessage = "";

  /* --- Validación accesible -------------------------------------------- */
  var fields = [
    {
      id: "f-nombre",
      msg: "Escribí tu nombre (mínimo 2 caracteres).",
      test: function (v) { return v.trim().length >= 2; }
    },
    {
      id: "f-email",
      msg: "Ingresá un correo válido, por ejemplo nombre@dominio.com.",
      test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
    },
    {
      id: "f-tipo",
      msg: "Elegí el tipo de proyecto.",
      test: function (v) { return v !== ""; }
    },
    {
      id: "f-mensaje",
      msg: "Contanos un poco más: al menos 20 caracteres.",
      test: function (v) { return v.trim().length >= 20; }
    }
  ];

  function setError(field, message) {
    var input = doc.getElementById(field.id);
    var errorEl = doc.getElementById(field.id + "-error");
    if (!input || !errorEl) return;

    if (message) {
      input.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      input.removeAttribute("aria-invalid");
      errorEl.textContent = "";
      errorEl.hidden = true;
    }
  }

  function validateField(field) {
    var input = doc.getElementById(field.id);
    var ok = field.test(input.value);
    setError(field, ok ? "" : field.msg);
    return ok;
  }

  /* Validación en vivo al salir del campo, una vez que hubo un intento */
  var attempted = false;

  fields.forEach(function (field) {
    var input = doc.getElementById(field.id);
    if (!input) return;
    input.addEventListener("blur", function () {
      if (attempted) validateField(field);
    });
    input.addEventListener("input", function () {
      if (attempted && input.getAttribute("aria-invalid") === "true") validateField(field);
    });
    input.addEventListener("change", function () {
      if (attempted && input.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });

  function validateAll() {
    var firstInvalid = null;
    fields.forEach(function (field) {
      var ok = validateField(field);
      if (!ok && !firstInvalid) firstInvalid = doc.getElementById(field.id);
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  /* --- Armado del mensaje ------------------------------------------------ */
  function buildMessage() {
    var nombre = doc.getElementById("f-nombre").value.trim();
    var email = doc.getElementById("f-email").value.trim();
    var tipo = doc.getElementById("f-tipo").value;
    var mensaje = doc.getElementById("f-mensaje").value.trim();

    var lines = [
      "Nombre: " + nombre,
      "Correo: " + email,
      "Tipo de proyecto: " + tipo,
      "",
      mensaje
    ];
    return lines.join("\n");
  }

  function showPanel(panel) {
    [preparedPanel, errorPanel].forEach(function (p) {
      if (p) p.hidden = p !== panel;
    });
    form.hidden = panel === preparedPanel || panel === errorPanel;
    if (panel) {
      var heading = panel.querySelector("h3");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: false });
      }
    }
  }

  /* --- Envío ------------------------------------------------------------ */
  function setSending(sending) {
    submitBtn.disabled = sending;
    submitLabel.textContent = sending ? "Enviando…" : "Preparar mensaje";
  }

  function showPrepared(message) {
    lastMessage = message;
    previewEl.textContent = message;

    var subject = encodeURIComponent(cfg.mailSubject || "Consulta de proyecto");
    var body = encodeURIComponent(message);
    mailLink.href = "mailto:" + (cfg.email || "") + "?subject=" + subject + "&body=" + body;

    if (cfg.whatsapp) {
      waLink.hidden = false;
      waLink.href = "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(message);
    } else {
      waLink.hidden = true;
    }

    if (statusEl) statusEl.textContent = "";
    showPanel(preparedPanel);
  }

  function showError(detail) {
    errorDetail.textContent = detail ||
      "El servicio de envío no respondió. Podés reintentar o usar el correo directo.";
    if (statusEl) statusEl.textContent = "No se pudo enviar el mensaje.";
    showPanel(errorPanel);
  }

  function send(message) {
    if (!cfg.formEndpoint) {
      /* Sin backend: alternativa transparente, nunca decimos "enviado". */
      showPrepared(message);
      return;
    }

    setSending(true);
    if (statusEl) statusEl.textContent = "Enviando tu consulta…";

    fetch(cfg.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: doc.getElementById("f-nombre").value.trim(),
        email: doc.getElementById("f-email").value.trim(),
        tipo: doc.getElementById("f-tipo").value,
        mensaje: doc.getElementById("f-mensaje").value.trim(),
        website: doc.getElementById("f-web").value // honeypot
      })
    })
      .then(function (res) {
        setSending(false);
        if (!res.ok) throw new Error("HTTP " + res.status);
        if (statusEl) statusEl.textContent = "Mensaje enviado. Gracias por escribir.";
        showPanel(null);
        form.reset();
        attempted = false;
      })
      .catch(function (err) {
        setSending(false);
        showError("No se pudo contactar el servicio (" + err.message + "). Probá de nuevo o usá el correo.");
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    attempted = true;
    showPanel(null);

    var hp = doc.getElementById("f-web");
    if (hp && hp.value) return; // trampa anti-spam: se descarta en silencio

    if (!validateAll()) {
      if (statusEl) statusEl.textContent = "Revisá los campos marcados antes de continuar.";
      return;
    }

    send(buildMessage());
  });

  /* --- Acciones del panel preparado -------------------------------------- */
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      function done(ok) {
        copyStatus.textContent = ok
          ? "Mensaje copiado al portapapeles."
          : "No se pudo copiar automáticamente; seleccioná el texto de la vista previa.";
      }

      if (global.navigator.clipboard && global.navigator.clipboard.writeText) {
        global.navigator.clipboard.writeText(lastMessage)
          .then(function () { done(true); })
          .catch(function () { done(fallbackCopy()); });
      } else {
        done(fallbackCopy());
      }
    });
  }

  function fallbackCopy() {
    try {
      var ta = doc.createElement("textarea");
      ta.value = lastMessage;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      doc.body.appendChild(ta);
      ta.select();
      var ok = doc.execCommand("copy");
      doc.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  if (editBtn) {
    editBtn.addEventListener("click", function () {
      showPanel(null);
      copyStatus.textContent = "";
      doc.getElementById("f-nombre").focus();
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener("click", function () {
      showPanel(null);
      send(buildMessage());
    });
  }
})(window);
