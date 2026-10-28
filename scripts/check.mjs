#!/usr/bin/env node
/**
 * ESTUDIO UMBRAL · Verificación de integridad
 * ---------------------------------------------------------------------------
 * Comprueba que todo lo que referencia index.html existe (imágenes, CSS, JS,
 * fuentes, enlaces internos de ancla) y que los JS pasan el parseo.
 * No requiere dependencias.
 *
 * Uso:  node scripts/check.mjs
 */

import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const exists = (p) => access(p).then(() => true, () => false);

const html = await readFile(path.join(ROOT, "index.html"), "utf8");
const problems = [];
const ok = (msg) => console.log("  ✔ " + msg);
const bad = (msg) => { problems.push(msg); console.log("  ✘ " + msg); };

/* 1 · Referencias a archivos (href/src/srcset) --------------------------- */
console.log("Referencias a archivos:");
const refs = new Set();

for (const m of html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
  const v = m[1];
  if (/^(https?:|mailto:|data:|javascript:)/.test(v)) continue;
  refs.add(v);
}
for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
  for (const part of m[1].split(",")) {
    const u = part.trim().split(/\s+/)[0];
    if (u) refs.add(u);
  }
}
for (const m of html.matchAll(/content="(assets\/[^"]+)"/g)) refs.add(m[1]);

for (const ref of [...refs].sort()) {
  const target = path.join(ROOT, ref.split("?")[0]);
  (await exists(target)) ? ok(ref) : bad("falta: " + ref);
}

/* 2 · Anclas internas ---------------------------------------------------- */
console.log("\nAnclas internas:");
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
for (const m of html.matchAll(/href="#([^"]+)"/g)) {
  const id = m[1];
  if (id === "") continue;
  ids.has(id) ? ok("#" + id) : bad("ancla rota: #" + id);
}

/* 3 · Imágenes con alt y dimensiones ------------------------------------- */
console.log("\nImágenes con alt/dimensiones:");
const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
let imgProblems = 0;
imgs.forEach((tag, i) => {
  const hasAlt = /\balt="/.test(tag);
  const hasSize = /\bwidth="/.test(tag) && /\bheight="/.test(tag);
  if (!hasAlt || !hasSize) {
    imgProblems++;
    bad(`img #${i + 1} → alt:${hasAlt} size:${hasSize} :: ${tag.slice(0, 90)}`);
  }
});
if (!imgProblems) ok(`${imgs.length} imágenes con alt y width/height`);

/* 4 · Labels de formulario ------------------------------------------------ */
console.log("\nFormulario:");
const inputs = [...html.matchAll(/<(input|select|textarea)\b[^>]*\bid="([^"]+)"[^>]*>/g)]
  .filter((m) => !/type="hidden"/.test(m[0]))
  .map((m) => ({ tag: m[1], id: m[2] }));
for (const input of inputs) {
  if (input.id === "f-web") continue; // honeypot oculto
  const hasLabel = new RegExp(`<label[^>]*for="${input.id}"`).test(html);
  hasLabel ? ok(`${input.tag}#${input.id} tiene <label>`) : bad(`${input.tag}#${input.id} sin label`);
}

/* 5 · Scripts parsean ----------------------------------------------------- */
console.log("\nSintaxis JS:");
const jsFiles = [
  "assets/js/config.js",
  "assets/js/data/projects.js",
  "assets/js/main.js",
  "assets/js/projects.js",
  "assets/js/contact.js",
  "scripts/fetch-assets.mjs"
];
for (const f of jsFiles) {
  const full = path.join(ROOT, f);
  try {
    if (f.endsWith(".mjs")) {
      // Los módulos ES se validan con el parser propio de Node.
      const res = spawnSync(process.execPath, ["--check", full], { encoding: "utf8" });
      if (res.status !== 0) throw new Error((res.stderr || "").trim().split("\n")[0]);
    } else {
      new vm.Script(await readFile(full, "utf8"), { filename: f });
    }
    ok(f);
  } catch (e) {
    bad(`${f} → ${e.message}`);
  }
}

/* 6 · CSS braces balance --------------------------------------------------- */
console.log("\nCSS:");
const cssFiles = (await import("node:fs/promises"))
  ? ["fonts.css", "tokens.css", "base.css", "components.css", "sections.css"]
  : [];
for (const f of cssFiles) {
  const p = path.join(ROOT, "assets", "css", f);
  if (!(await exists(p))) { bad(`falta ${f}`); continue; }
  const css = await readFile(p, "utf8");
  const open = (css.match(/\{/g) || []).length;
  const close = (css.match(/\}/g) || []).length;
  open === close ? ok(`assets/css/${f} (${open} bloques)`) : bad(`assets/css/${f}: {${open} }${close}`);
}

/* 7 · Palabras clave de la demo ------------------------------------------- */
console.log("\nContenido requerido:");
const required = [
  ["Crédito ALMATE", "ALMATE · Digital Studio"],
  ["Aviso de estudio ficticio", "estudio ficticio"],
  ["Identificación de ejemplos", "Ejemplo de portfolio"],
  ["Título del hero", "Espacios que"]
];
for (const [label, needle] of required) {
  html.includes(needle) ? ok(label) : bad(`no se encontró: ${needle}`);
}

console.log(
  problems.length
    ? `\n${problems.length} problema/s encontrado/s.`
    : "\nTodo en orden: sin enlaces rotos ni errores de estructura."
);
process.exitCode = problems.length ? 1 : 0;
