// tests/security/scan-dist-for-token.smoke.test.js
// Prueba de humo del detector de fuga de tokens: confirma que
// scanText() SÍ dispara contra patrones sintéticos maliciosos ANTES de
// confiar en que un resultado limpio contra el bundle real significa algo.
// Sin esto, un detector roto (regex que nunca hace match) pasaría
// silenciosamente como "todo limpio" sin haber probado nada.

import { describe, it, expect } from "vitest";
import { scanText } from "./tokenScanPatterns.mjs";

const FAKE_TOKEN = "TEST-FAKE-TOKEN-0000000000000000";

describe("scan-dist-for-token — detección con contenido sintético", () => {
  it("detecta el header X-Siso-Token", () => {
    const findings = scanText(`fetch(url,{headers:{"X-Siso-Token":"${FAKE_TOKEN}"}})`);
    expect(findings.length).toBeGreaterThan(0);
  });

  it("detecta el nombre SISO_TOKEN", () => {
    const findings = scanText(`const t=env.SISO_TOKEN||""`);
    expect(findings.length).toBeGreaterThan(0);
  });

  it("detecta window.__SISO_CONFIG.workerToken", () => {
    const findings = scanText(`window.__SISO_CONFIG.workerToken="${FAKE_TOKEN}";`);
    expect(findings).toContain("window.__SISO_CONFIG seguido de un campo tipo token/secret/key");
  });

  it("detecta una asignación global con TOKEN en el nombre", () => {
    const findings = scanText(`window.OTRO_SECRET_TOKEN = "x";`);
    expect(findings).toContain("asignación a una variable global con TOKEN/SECRET/KEY en el nombre");
  });

  it("no dispara sobre código benigno (uso ya aceptado de la key pública de Supabase)", () => {
    const findings = scanText(`const sbKey = 'sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7'; const url = sbUrl + '?apikey=' + sbKey;`);
    expect(findings).toEqual([]);
  });

  it("no dispara sobre texto sin ningún patrón relevante", () => {
    const findings = scanText(`function suma(a,b){return a+b}`);
    expect(findings).toEqual([]);
  });
});
