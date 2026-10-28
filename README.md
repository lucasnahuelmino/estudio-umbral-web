# ESTUDIO UMBRAL — Landing demo (PROYECTO ALMATE DEMO 05)

Landing page editorial para un estudio ficticio de arquitectura residencial e
interiores. Creada como **demostración comercial de [ALMATE · Digital Studio]**:
muestra el nivel de diseño, código y accesibilidad que ALMATE entrega en un
proyecto real.

> **Aviso importante:** ESTUDIO UMBRAL es un proyecto de demostración. El
> estudio, sus proyectos, datos de contacto y textos son **ficticios**. Esta
> pieza no implica ninguna relación comercial con clientes reales, y el sitio
> no envía mensajes a ningún destino hasta que un tercero conecta un servicio
> de envío (ver [El formulario](#el-formulario)).

---

## Cómo verlo

No hay paso de build ni dependencias: es HTML + CSS + JavaScript estáticos.
Solo hace falta servir la carpeta con cualquier servidor estático (los assets
relativos no cargan bien con `file://`).

```bash
# Opción 1 · Python (incluido en la mayoría de sistemas)
python -m http.server 4173
# → abrir http://127.0.0.1:4173

# Opción 2 · Node
npx serve .
```

Requisito único para los scripts auxiliares: **Node 18+**.

---

## Estructura

```
index.html                  Toda la página (secciones + <dialog> del proyecto)
assets/
  css/
    tokens.css              Paleta, tipografías y espaciados (variables)
    base.css                Reset, tipografía base, foco, reduced-motion
    components.css          Cabecera, botones, formulario, modal, kickers
    sections.css            Layout editorial de cada sección
    fonts.css               @font-face de las fuentes locales
  fonts/                    Fraunces + Archivo (woff2, licencia OFL)
  img/                      33 fotos locales (Unsplash) + cover OG
  js/
    config.js               Único archivo de configuración (correo, WhatsApp…)
    main.js                 Menú móvil, nav activa, reveal, enlaces dinámicos
    projects.js             Abrir/cerrar modal, galería, fallback de imágenes
    contact.js              Validación, estados y envío del formulario
    data/projects.js        Contenido extendido de cada proyecto (ficha)
  favicon.svg
  site.webmanifest
scripts/
  fetch-assets.mjs          Descarga fuentes + fotos (una sola vez)
  check.mjs                 Verificación de integridad del sitio
```

**Convención de contenido:** la tarjeta de cada proyecto en `index.html` es la
fuente de verdad de título, ubicación y año; `assets/js/data/projects.js` solo
agrega el texto largo y la galería, identificándose por el `slug` del
proyecto. Si agregás o quitás una tarjeta, agregá o quitá también su entrada
en `data/projects.js`.

---

## Personalización

### Datos de contacto y formulario — `assets/js/config.js`

| Campo | Qué hace |
| --- | --- |
| `email` | Correo que usan los enlaces `mailto:` (por defecto el dominio reservado `.example`). |
| `whatsapp` | Número en formato internacional sin `+` (ej. `"5491100000000"`). Vacío `""` oculta el enlace. |
| `formEndpoint` | `null` = la demo no envía nada. Una URL = se hace un `POST` JSON real. |
| `mailSubject` | Asunto por defecto del correo preparado. |

### El formulario

Sin backend no se puede enviar correo sin mentir al usuario, así que la demo
es **transparente por defecto**: al enviar un formulario válido se muestra el
panel *"Mensaje listo para enviar"* con el asunto y cuerpo armados, y enlaces
para enviarlo por correo o WhatsApp desde la cuenta de quien consulta.

Para hacerlo funcional en un sitio real, conectá cualquier servicio de
formularios (Formspree, Basin, Netlify Forms, un Lambda propio…):

```js
// assets/js/config.js
formEndpoint: "https://formspree.io/f/TU_ID"
```

Con el endpoint configurado, el formulario hace un `POST` JSON y muestra los
estados de **carga**, **éxito** y **error** reales. También se usa el campo
*honeypot* (`#f-web`) para frenar spam básico.

### Proyectos

1. Editar o agregar tarjetas en `index.html` (sección `#proyectos`).
2. Actualizar `assets/js/data/projects.js` con el mismo `slug`.
3. Fotos en `assets/img/` (misma proporción que las existentes para no
   deformar nada; los `<img>` usan `object-fit: cover`).

### Colores y tipografía — `assets/css/tokens.css`

Toda la paleta vive en variables (`--c-ivory`, `--c-ink`, `--c-terra`…). Las
variantes de texto (`--c-stone-text`, `--c-terra-deep`, `--c-terra-on-dark`)
ya están ajustadas para cumplir contraste **WCAG AA (4.5:1)** sobre cada
fondo: si cambiás un color, verificá ese contraste antes de publicar.

---

## Scripts auxiliares

```bash
node scripts/fetch-assets.mjs   # (re)baja fuentes y fotos a assets/
node scripts/check.mjs          # verifica referencias, anclas, alt, labels…
```

`fetch-assets.mjs` no requiere dependencias: usa el `fetch` global de Node.
Si un archivo ya existe lo omite; si una foto falla, prueba el siguiente
candidate de su lista.

---

## Decisiones técnicas

- **Sin build ni framework.** Para una landing de una sola página, JS
  modular con IIFE sobre el namespace `UMBRAL` da mantenibilidad sin
  añadir tooling que haya que mantener junto al proyecto.
- **Assets 100 % locales.** Fuentes y fotos se descargan al repo: el sitio no
  depende de CDNs en tiempo de ejecución ni rompe si un tercero cambia una
  URL.
- **Sin datos inventados verificables.** No hay certificaciones, premios,
  clientes ni testimonios reales; la dirección de contacto usa el dominio
  reservado `.example` (RFC 2606) a propósito.

## Accesibilidad y performance

- Navegación completa por teclado: skip-link, foco visible, `Esc` cierra
  menú y modal y devuelve el foco al disparador, `<dialog>` nativo con
  fallback.
- Menú móvil real (`aria-expanded`, `aria-controls`), labels visibles en
  todos los campos, errores anunciados (`role="alert"` / `aria-live`),
  estados de foco, carga y error del formulario.
- Contraste AA verificado en toda la paleta; `prefers-reduced-motion`
  desactiva animaciones y scroll suave.
- Imágenes con `width`/`height` (sin saltos de layout), `loading="lazy"` y
  `decoding="async"` fuera del fold, `srcset`/`sizes` responsives.
- `<title>` y descripción únicos, Open Graph + Twitter Card, favicon SVG,
  `site.webmanifest`, datos estructurados JSON-LD y `theme-color`.

**Verificado en:** 320, 375, 414, 600, 768, 900, 1024, 1440 y 1920 px (sin
desbordes horizontales; el menú colapsa correctamente por debajo de 900 px).
Lighthouse: **100 / 100 / 100** en Accesibilidad, Buenas prácticas y SEO.

---

## Créditos y licencias

- **Tipografías:** [Fraunces](https://fonts.google.com/specimen/Fraunces) y
  [Archivo](https://fonts.google.com/specimen/Archivo), ambas bajo licencia
  [SIL Open Font License 1.1](https://openfontlicense.org/).
- **Fotografía:** imágenes de [Unsplash](https://unsplash.com/license) usadas
  como material de referencia para esta demo ficticia. El listado completo de
  URLs de origen está en `scripts/fetch-assets.mjs`.
- **Desarrollo:** ALMATE · Digital Studio.

---

Sitio demo desarrollado por **ALMATE · Digital Studio**.
