#!/usr/bin/env node
/**
 * ESTUDIO UMBRAL · Descarga de recursos
 * ---------------------------------------------------------------------------
 * Baja a assets/ las tipografías (Google Fonts, licencia OFL) y las fotografías
 * (Unsplash, licencia Unsplash) para que la demo NO dependa de servicios de
 * terceros en tiempo de ejecución: si un CDN cae, el sitio sigue funcionando.
 *
 * Uso:   node scripts/fetch-assets.mjs
 * - No requiere dependencias (usa el fetch global de Node 18+).
 * - Si un archivo ya existe se omite. Para volver a borrar algo: borrá el
 *   archivo en assets/img o assets/fonts y re-ejecutá el script.
 * - Si un candidato falla, se prueba el siguiente de la lista (fallback).
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG_DIR = path.join(ROOT, "assets", "img");
const FONT_DIR = path.join(ROOT, "assets", "fonts");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/* ------------------------------------------------------------------ utils */

const exists = (p) =>
  access(p).then(
    () => true,
    () => false
  );

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchBuffer(url, type = "application/octet-stream") {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: type },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} para ${url.slice(0, 90)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, contentType: res.headers.get("content-type") ?? "" };
}

/** JPEG válido = empieza con FFD8FF. Evita guardar páginas de error como imagen. */
const isJpeg = (buf) => buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;

async function runPool(items, limit, worker) {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    results.push(...(await Promise.all(chunk.map(worker))));
  }
  return results;
}

/* ----------------------------------------------------------------- fuentes */

const FONT_REQUESTS = [
  {
    name: "Fraunces (serif editorial)",
    url: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&display=swap",
  },
  {
    name: "Archivo (sans grotesca)",
    url: "https://fonts.googleapis.com/css2?family=Archivo:wght@400..600&display=swap",
  },
];

async function downloadFonts() {
  await mkdir(FONT_DIR, { recursive: true });
  let css = `/* Generado por scripts/fetch-assets.mjs — no editar a mano.\n   Tipografías de Google Fonts con licencia SIL Open Font License 1.1. */\n\n`;
  const ok = [];

  for (const req of FONT_REQUESTS) {
    try {
      const { buf } = await fetchBuffer(req.url, "text/css");
      let text = buf.toString("utf8");
      const urls = [...new Set(text.match(/https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2/g) ?? [])];
      if (!urls.length) throw new Error("sin woff2 en la respuesta");

      for (const fileUrl of urls) {
        const base = path.basename(new URL(fileUrl).pathname);
        const target = path.join(FONT_DIR, base);
        if (!(await exists(target))) {
          const f = await fetchBuffer(fileUrl, "font/woff2");
          await writeFile(target, f.buf);
        }
        text = text.split(fileUrl).join(`../fonts/${base}`);
      }
      css += `/* ${req.name} */\n${text.trim()}\n\n`;
      ok.push(`✔ ${req.name} (${urls.length} archivo/s)`);
    } catch (err) {
      ok.push(`✘ ${req.name} → ${err.message}`);
      css += `/* ${req.name}: descarga fallida (${err.message}). El sitio usa la pila de respaldo del sistema. */\n\n`;
    }
  }
  await writeFile(path.join(ROOT, "assets", "css", "fonts.css"), css, "utf8");
  return ok;
}

/* -------------------------------------------------------------- fotografías */

/** slot → candidatos (IDs de Unsplash) + tamaños [ancho] o [ancho, alto]. */
const IMAGES = {
  "hero-main": { ids: ["1600585154340-be6161a56a0c", "1616486338812-3dadae4b4ace", "1580587771525-78b9dba3b914"], sizes: [[1800], [1000]] },
  "hero-detail": { ids: ["1502672260266-1c1ef2d93688", "1524758631624-e2822e304c36"], sizes: [[900]] },
  "proj-terreno": { ids: ["1600596542815-ffad4c1539a9", "1580587771525-78b9dba3b914", "1512917774080-9991f1c4c750"], sizes: [[1400], [800]] },
  "proj-mitre": { ids: ["1600566753190-17f0baa2a6c3", "1618221195710-dd6b41faaea6", "1554995207-c18c203602cb"], sizes: [[1200], [800]] },
  "proj-cauce": { ids: ["1524758631624-e2822e304c36", "1560448204-e02f11c3d0e2", "1502672260266-1c1ef2d93688"], sizes: [[1200], [800]] },
  "proj-loma": { ids: ["1600585152220-90363fe7e115", "1523217582562-09d0def993a6", "1449844908441-8829872d2607"], sizes: [[1200], [800]] },
  "proj-pehuen": { ids: ["1583847268964-b28dc8f51f92", "1479839672679-a46483c0e7c8", "1518005020951-eccb494ad742"], sizes: [[1800], [1000]] },
  "proj-ribera": { ids: ["1600607687939-ce8a6c25118c", "1600210492486-724fe5c67fb0", "1560448205-4d9b3e6bb6db"], sizes: [[1400], [800]] },
  "manifesto-detail": { ids: ["1541123437800-1bb1317badc2", "1493809842364-78817add7ffb", "1509644851169-2acc08aa25b5"], sizes: [[1000]] },
  "services-band": { ids: ["1503387762-592deb58ef4e", "1416331108676-a22ccb276e35"], sizes: [[1600], [900]] },
  "about-studio": { ids: ["1497366216548-37526070297c", "1524758631624-e2822e304c36"], sizes: [[1200], [800]] },
  "og-cover": { ids: ["1600585154340-be6161a56a0c", "1600596542815-ffad4c1539a9"], sizes: [[1200, 630]] },

  "g-terreno-a": { ids: ["1600607687920-4e2a09cf159d", "1600566753086-00f18fb6b3ea"], sizes: [[1400]] },
  "g-terreno-b": { ids: ["1600585154526-990dced4db0d", "1600047509807-ba8f99d2cdde"], sizes: [[1400]] },
  "g-mitre-a": { ids: ["1600566753086-00f18fb6b3ea", "1616594039964-ae9021a400a0"], sizes: [[1400]] },
  "g-mitre-b": { ids: ["1600573472592-401b489a3cdc", "1616137466211-f939a420be84"], sizes: [[1400]] },
  "g-cauce-a": { ids: ["1560448204-e02f11c3d0e2", "1522708323590-d24dbb6b0267"], sizes: [[1400]] },
  "g-cauce-b": { ids: ["1531835551805-16d864c8d311", "1556909114-f6e7ad7d3136"], sizes: [[1400]] },
  "g-loma-a": { ids: ["1600585152915-d208bec867a1", "1600585154084-4e5fe7c39198"], sizes: [[1400]] },
  "g-loma-b": { ids: ["1600210491369-e753d80a41f3", "1600489000022-c2086d79f9d4"], sizes: [[1400]] },
  "g-pehuen-a": { ids: ["1509644851169-2acc08aa25b5", "1494526585095-c41746248156"], sizes: [[1400]] },
  "g-pehuen-b": { ids: ["1600607687644-c7171b42498f", "1615874959474-d609969a20ed"], sizes: [[1400]] },
  "g-ribera-a": { ids: ["1600566752355-35792bedcfea", "1600566752229-250ed79470f8"], sizes: [[1400]] },
  "g-ribera-b": { ids: ["1617806118233-18e1de247200", "1631679706909-1844bbd07221"], sizes: [[1400]] },
};

const unsplashUrl = (id, w, h) => {
  const params = new URLSearchParams({ fm: "jpg", q: "72", fit: "crop", w: String(w) });
  if (h) params.set("h", String(h));
  return `https://images.unsplash.com/photo-${id}?${params}`;
};

async function downloadSlot([slot, def]) {
  const report = { slot, files: [], failed: false };
  for (const [w, h] of def.sizes) {
    const fileName = h ? `${slot}-${w}x${h}.jpg` : `${slot}-${w}.jpg`;
    const target = path.join(IMG_DIR, fileName);
    if (await exists(target)) {
      report.files.push(`${fileName} (ya existía)`);
      continue;
    }
    let saved = false;
    for (const id of def.ids) {
      try {
        const { buf } = await fetchBuffer(unsplashUrl(id, w, h), "image/*");
        if (!isJpeg(buf)) throw new Error("respuesta no-JPEG");
        if (buf.length < 15000) throw new Error(`archivo sospechoso (${buf.length} B)`);
        await writeFile(target, buf);
        report.files.push(`${fileName} ← photo-${id} (${Math.round(buf.length / 1024)} KB)`);
        saved = true;
        break;
      } catch (err) {
        await sleep(400); // breve pausa antes del siguiente candidato
        report.lastError = err.message;
      }
    }
    if (!saved) {
      report.failed = true;
      report.files.push(`✘ ${fileName} → sin candidato válido (${report.lastError ?? "n/d"})`);
    }
  }
  return report;
}

/* ------------------------------------------------------------------- main */

async function main() {
  console.log("ESTUDIO UMBRAL · fetch-assets\n");
  await mkdir(IMG_DIR, { recursive: true });
  await mkdir(path.join(ROOT, "assets", "css"), { recursive: true });

  console.log("Tipografías:");
  (await downloadFonts()).forEach((l) => console.log("  " + l));

  console.log("\nFotografías (Unsplash → assets/img):");
  const reports = await runPool(Object.entries(IMAGES), 5, downloadSlot);
  for (const r of reports) {
    console.log(`  ${r.failed ? "✘" : "✔"} ${r.slot}`);
    r.files.forEach((f) => console.log("      " + f));
  }

  const failed = reports.filter((r) => r.failed);
  console.log(
    `\nListo: ${reports.length - failed.length}/${reports.length} slots completos.` +
      (failed.length ? `\n⚠ Revisá: ${failed.map((f) => f.slot).join(", ")}` : "")
  );
}

main().catch((err) => {
  console.error("Error general:", err);
  process.exitCode = 1;
});
