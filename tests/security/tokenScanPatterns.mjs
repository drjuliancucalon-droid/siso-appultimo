// siso-appultimo/tests/security/tokenScanPatterns.mjs
// Patrones de detección de fuga de secretos en el bundle del navegador —
// módulo puro, sin side-effects, importado tanto por el script ejecutable
// (scan-dist-for-token.mjs) como por sus propias pruebas
// (scan-dist-for-token.smoke.test.js).

export const FORBIDDEN_PATTERNS = [
  { label: "nombre del header de auth (X-Siso-Token)", re: /x-siso-token/i },
  { label: "nombre de la variable de entorno del secreto (SISO_TOKEN)", re: /siso_token\b/i },
  {
    label: "window.__SISO_CONFIG seguido de un campo tipo token/secret/key",
    re: /__SISO_CONFIG\s*(\?\.|\.|\[)[^;{}\n]{0,40}(token|secret|apikey|servicekey|privatekey)/i,
  },
  {
    label: "asignación a una variable global con TOKEN/SECRET/KEY en el nombre",
    re: /(window|globalThis)\s*(\.\s*[A-Za-z0-9_]*(TOKEN|SECRET|KEY)[A-Za-z0-9_]*|\[\s*["'][A-Za-z0-9_]*(TOKEN|SECRET|KEY)[A-Za-z0-9_]*["']\s*\])\s*=(?!=)/i,
  },
];

export function scanText(text) {
  const findings = [];
  for (const { label, re } of FORBIDDEN_PATTERNS) {
    if (re.test(text)) findings.push(label);
  }
  return findings;
}
