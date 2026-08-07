#!/usr/bin/env node
// tests/security/scan-dist-for-token.mjs
// Verificación post-build (diseño BFF §14, punto 11): confirma que ningún
// artefacto generado para el NAVEGADOR (dist/, salida de `npm run build`)
// contiene el nombre del header de autenticación ni ningún valor de
// SISO_TOKEN. Ejecutar DESPUÉS de `npm run build`:
//
//   node tests/security/scan-dist-for-token.mjs
//
// Nota de arquitectura importante: Vite (`npm run build`) solo empaqueta
// src/ hacia dist/ — las Cloudflare Pages Functions en functions/ NO pasan
// por este build ni terminan en dist/; se despliegan por separado como
// funciones server-side. Por eso es estructuralmente esperable que
// "X-Siso-Token"/"SISO_TOKEN" NUNCA aparezcan en dist/: el código que los
// referencia no es parte del bundle del navegador. Este script lo confirma
// en vez de asumirlo.

import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST_DIR = "dist";
// FIX 2026-08-07 (segundo precedente de seguridad, ver CLAUDE.md): el
// escaneo original solo cubría el nombre literal del header/token de SISO.
// Ampliado tras encontrar un vector real en código heredado
// (src/shared/lib/syncManager.js) que leía window.__SISO_CONFIG?.workerToken
// y lo mandaba como X-Siso-Token desde el navegador. Los patrones de abajo
// cubren esa clase de vector en general, no solo el caso puntual ya
// corregido — para atrapar el PRÓXIMO caso similar antes de que llegue a
// producción, no solo este.
const FORBIDDEN_PATTERNS = [
  { label: "nombre del header de auth (X-Siso-Token)", re: /x-siso-token/i },
  { label: "nombre de la variable de entorno del secreto (SISO_TOKEN)", re: /siso_token\b/i },
  {
    label: "window.__SISO_CONFIG seguido de un campo tipo token/secret/key",
    // Cubre acceso vía punto Y vía corchetes ("workerToken" / ["workerToken"]),
    // con una ventana corta para tolerar minificación (alias de `window`,
    // espacios). No exige el prefijo "window." literal porque los
    // minificadores pueden renombrar ese identificador.
    re: /__SISO_CONFIG\s*(\?\.|\.|\[)[^;{}\n]{0,40}(token|secret|apikey|servicekey|privatekey)/i,
  },
  {
    label: "asignación a una variable global con TOKEN/SECRET/KEY en el nombre",
    // window.ALGO_TOKEN = ... / globalThis["ALGO_SECRET"] = ...
    // Deliberadamente exige que sea una ASIGNACIÓN sobre window/globalThis
    // (no cualquier identificador que contenga esas palabras en cualquier
    // parte del bundle) para no generar falsos positivos contra el uso ya
    // aceptado de la key pública/publishable de Supabase (sbKey, SB_KEY),
    // que no es un secreto en el mismo sentido — ver
    // docs/audits/BASELINE_D1_MONOLITH_COMPATIBILITY.md.
    re: /(window|globalThis)\s*(\.\s*[A-Za-z0-9_]*(TOKEN|SECRET|KEY)[A-Za-z0-9_]*|\[\s*["'][A-Za-z0-9_]*(TOKEN|SECRET|KEY)[A-Za-z0-9_]*["']\s*\])\s*=(?!=)/i,
  },
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function main() {
  if (!existsSync(DIST_DIR)) {
    console.error(`[scan-dist-for-token] No existe "${DIST_DIR}/" — corre "npm run build" primero.`);
    process.exit(2);
  }

  const files = walk(DIST_DIR).filter((f) => /\.(js|html|css|json|map)$/i.test(f));
  const findings = [];

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const { label, re } of FORBIDDEN_PATTERNS) {
      if (re.test(content)) {
        findings.push({ file, label });
      }
    }
  }

  if (findings.length > 0) {
    console.error(`[scan-dist-for-token] FALLO — ${findings.length} coincidencia(s) encontradas en el bundle del navegador:`);
    for (const f of findings) console.error(`  - ${f.file}: ${f.label}`);
    process.exit(1);
  }

  console.log(`[scan-dist-for-token] OK — ${files.length} archivo(s) escaneados en "${DIST_DIR}/", ninguno contiene referencias a SISO_TOKEN / X-Siso-Token.`);
  process.exit(0);
}

main();
