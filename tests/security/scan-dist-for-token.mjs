#!/usr/bin/env node
// tests/security/scan-dist-for-token.mjs
// Verificación post-build: confirma que ningún artefacto generado para el
// NAVEGADOR (dist/, salida de `npm run build`) contiene el nombre del
// header de autenticación, referencias a SISO_TOKEN, ni patrones genéricos
// de fuga de secretos vía window.__SISO_CONFIG o variables globales.
// Ejecutar DESPUÉS de `npm run build`:
//
//   node tests/security/scan-dist-for-token.mjs
//
// Nota de arquitectura: Vite (`npm run build`) solo empaqueta src/ hacia
// dist/ — las Cloudflare Pages Functions en functions/ NO pasan por este
// build ni terminan en dist/; se despliegan por separado como funciones
// server-side. Por eso es estructuralmente esperable que estos patrones
// NUNCA aparezcan en dist/. Este script lo confirma en vez de asumirlo.
// Los patrones se prueban contra contenido sintético en
// tests/security/scan-dist-for-token.smoke.test.js ANTES de confiar en un
// resultado limpio contra el bundle real.
//
// Historial: reconstruido 2026-08-07 sobre la base real de producción
// (origin/main, commit 6eb4574) — la versión anterior solo existía en una
// rama de trabajo aislada que nunca llegó a main (ver CLAUDE.md).

import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { scanText } from "./tokenScanPatterns.mjs";

const DIST_DIR = "dist";

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
    for (const label of scanText(content)) {
      findings.push({ file, label });
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
