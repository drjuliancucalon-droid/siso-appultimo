// tests/security/portal-empresa-nit.negative.test.js
// Pruebas negativas para /api/internal-store/portal-empresa-nit/:nit —
// gate de codigoAcceso + variantes de NIT (Fase A).
// Nunca llama al Worker real. Token y códigos de acceso sintéticos,
// declarados como falsos (ver CLAUDE.md).

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as handler from "../../functions/api/internal-store/portal-empresa-nit/[nit].js";
import { nitVariants } from "../../functions/api/internal-store/_portalEmpresaAuth.js";

const FAKE_TOKEN = "TEST-FAKE-TOKEN-DO-NOT-USE-0000000000";
const FAKE_CODE = "EMP-TEST-0000";
const NIT = "900000000";

const makeContext = (nit, body, envOverrides = {}) => ({
  params: { nit },
  env: { SISO_TOKEN: FAKE_TOKEN, WORKER_URL: "https://fake-worker.test", ...envOverrides },
  request: { json: async () => body },
});

let fetchMock;
beforeEach(() => { fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock); });
afterEach(() => { vi.unstubAllGlobals(); });

// Mock de Worker configurable: responde según la clave pedida.
function mockWorker(byKey) {
  fetchMock.mockImplementation(async (url) => {
    const key = decodeURIComponent(String(url).split("/store/")[1] || "");
    const value = byKey[key];
    return { ok: true, json: async () => (value !== undefined ? [{ key, value }] : []) };
  });
}

describe("nitVariants() — orden y umbral confirmados contra el código real", () => {
  it("genera [nitExacto, +0..+9, sinUltimoDigito] solo si length > 6", () => {
    const v = nitVariants("900123456"); // 9 dígitos, > 6
    expect(v[0]).toBe("900123456");
    expect(v.slice(1, 11)).toEqual(["9001234560", "9001234561", "9001234562", "9001234563", "9001234564", "9001234565", "9001234566", "9001234567", "9001234568", "9001234569"]);
    expect(v[11]).toBe("90012345"); // sin el último dígito
    expect(v).toHaveLength(12);
  });

  it("NO agrega la variante sin último dígito si length <= 6", () => {
    const v = nitVariants("123456"); // exactamente 6
    expect(v).toHaveLength(11); // exacto + 10 variantes de DV, sin la última
  });
});

describe("/api/internal-store/portal-empresa-nit/:nit — pruebas negativas", () => {
  it("no exporta handlers GET/PUT/PATCH/DELETE — solo POST", () => {
    expect(handler.onRequestGet).toBeUndefined();
    expect(handler.onRequestPut).toBeUndefined();
    expect(handler.onRequestDelete).toBeUndefined();
    expect(typeof handler.onRequestPost).toBe("function");
  });

  it("NIT con formato inválido → 404 sin llamar al Worker", async () => {
    const res = await handler.onRequestPost(makeContext("ab", { codigo: FAKE_CODE }));
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("código de acceso correcto → autorizado, exactamente los 6 campos proyectados", async () => {
    mockWorker({
      [`siso_portal_empresa_docs_${NIT}`]: { codigoAcceso: FAKE_CODE, periodos: [{ cuenta: { monto: 999999 } }] },
      [`siso_portal_empresa_${NIT}`]: [{ docNumero: "000000001" }],
      "siso_portal_doc_000000001": {
        nombres: "Paciente de Prueba", docNumero: "000000001", fechaExamen: "2026-01-01",
        conceptoAptitud: "APTO", derivaciones: [], tipoExamen: "Periódico",
        diagnosticoPrincipal: "no debe salir", cargo: "no proyectado",
      },
    });
    const res = await handler.onRequestPost(makeContext(NIT, { codigo: FAKE_CODE }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.autorizado).toBe(true);
    expect(body.trabajadores).toHaveLength(1);
    expect(Object.keys(body.trabajadores[0]).sort()).toEqual(
      ["nombres", "docNumero", "fechaExamen", "conceptoAptitud", "derivaciones", "tipoExamen"].sort()
    );
    expect(JSON.stringify(body)).not.toContain("no debe salir");
    expect(JSON.stringify(body)).not.toContain(FAKE_TOKEN);
    expect(JSON.stringify(body)).not.toContain("999999"); // nunca toca periodos/cuenta
  });

  it("código de acceso incorrecto → mismo status/shape que NIT inexistente", async () => {
    mockWorker({ [`siso_portal_empresa_docs_${NIT}`]: { codigoAcceso: FAKE_CODE } });
    const conCodigoMalo = await handler.onRequestPost(makeContext(NIT, { codigo: "EMP-WRONG-0000" }));
    fetchMock.mockReset();
    mockWorker({}); // NIT que no existe en absoluto
    const nitInexistente = await handler.onRequestPost(makeContext("900999999", { codigo: FAKE_CODE }));
    expect(conCodigoMalo.status).toBe(nitInexistente.status);
    expect(await conCodigoMalo.json()).toEqual(await nitInexistente.json());
  });

  it("DIVERGENCIA DELIBERADA: NIT sin codigoAcceso configurado nunca autoriza, sin importar el código enviado", async () => {
    mockWorker({}); // ninguna variante tiene codigoAcceso
    const res = await handler.onRequestPost(makeContext(NIT, { codigo: FAKE_CODE }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: "No encontrado" });
  });

  it("sin código enviado por el cliente → deniega sin tocar el Worker", async () => {
    const res = await handler.onRequestPost(makeContext(NIT, { codigo: "" }));
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("NIT con dígito de verificación distinto al almacenado, pero código correcto → autorizado (variantes funcionan)", async () => {
    const nitConDV = NIT + "3"; // el cliente envía el NIT+DV
    // El registro real vive bajo el NIT exacto (una de las variantes que sí prueba nitVariants(nitConDV): sin el último dígito → NIT original)
    mockWorker({
      [`siso_portal_empresa_docs_${NIT}`]: { codigoAcceso: FAKE_CODE },
      [`siso_portal_empresa_${NIT}`]: [],
    });
    const res = await handler.onRequestPost(makeContext(nitConDV, { codigo: FAKE_CODE }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.autorizado).toBe(true);
  });

  it("respuesta autorizada nunca incluye codigoAcceso en el body", async () => {
    mockWorker({
      [`siso_portal_empresa_docs_${NIT}`]: { codigoAcceso: FAKE_CODE },
      [`siso_portal_empresa_${NIT}`]: [],
    });
    const res = await handler.onRequestPost(makeContext(NIT, { codigo: FAKE_CODE }));
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain(FAKE_CODE);
    expect(body).not.toHaveProperty("codigoAcceso");
  });

  it("SISO_TOKEN ausente → 502, nunca intenta llamar al Worker", async () => {
    const res = await handler.onRequestPost(makeContext(NIT, { codigo: FAKE_CODE }, { SISO_TOKEN: "" }));
    expect(res.status).toBe(502);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
