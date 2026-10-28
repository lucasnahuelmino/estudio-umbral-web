/* ============================================================
   ESTUDIO UMBRAL · Configuración
   Único archivo que hay que tocar para personalizar la demo.
   ============================================================ */
(function (global) {
  "use strict";

  var UMBRAL = global.UMBRAL || (global.UMBRAL = {});

  UMBRAL.config = {
    /* Correo del estudio (dominio reservado .example: no es real). */
    email: "hola@estudioumbral.example",

    /* WhatsApp opcional. Dejar "" para ocultar el enlace en la interfaz.
       Formato internacional sin "+" ni espacios, ej: "5491100000000". */
    whatsapp: "",

    /* Endpoint de envío del formulario.
       - null  => la demo NO envía nada: se muestra el panel de
                  "mensaje listo para enviar" con correo/WhatsApp (transparente).
       - URL   => se hace un POST JSON real a esa URL y se muestran los
                  estados de carga, éxito y error. */
    formEndpoint: null,

    /* Asunto por defecto del correo preparado. */
    mailSubject: "Consulta por un proyecto — ESTUDIO UMBRAL"
  };
})(window);
