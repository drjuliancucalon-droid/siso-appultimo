// tests/security/verify-endpoint.negative.test.js
// Pruebas negativas para /api/internal-store/verify/:codigo (Fase A, sobre
// la base real de producción, commit 6eb4574 y posteriores).
// Nunca llaman al Worker de producción — fetch global se mockea siempre.
// Token de prueba sintético, declarado como falso (ver CLAUDE.md).

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as verifyHandler from "../../functions/api/internal-store/verify/[codigo].js";

const FAKE_TEST_TOKEN = "TEST-FAKE-TOKEN-DO-NOT-USE-0000000000";

const makeContext = (codigo, envOverrides = {}) => ({
  params: { codigo },
  env: { SISO_TOKEN: FAKE_TEST_TOKEN, WORKER_URL: "https://fake-worker.test", ...envOverrides },
});

let fetchMock;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("/api/internal-store/verify/:codigo — pruebas negativas", () => {
  it("no exporta ningún handler de escritura (POST/PUT/PATCH/DELETE)", () => {
    expect(verifyHandler.onRequestPost).toBeUndefined();
    expect(verifyHandler.onRequestPut).toBeUndefined();
    expect(verifyHandler.onRequestPatch).toBeUndefined();
    expect(verifyHandler.onRequestDelete).toBeUndefined();
    expect(typeof verifyHandler.onRequestGet).toBe("function");
  });

  it("candidateKeys() solo produce los 3 patrones fijos", () => {
    expect(verifyHandler.candidateKeys("ABC123")).toEqual([
      "siso_portal_ABC123",
      "siso_portal_CV-ABC123",
      "siso_portal_doc_ABC123",
    ]);
  });

  it("rechaza formato inválido sin llamar al Worker", async () => {
    for (const codigo of ["../users", "a/b", "code;DROP", "a b", ""]) {
      const res = await verifyHandler.onRequestGet(makeContext(codigo));
      expect(res.status).toBe(404);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("código válido pero inexistente → 404 tras probar las 3 claves", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });
    const res = await verifyHandler.onRequestGet(makeContext("NOEXISTE1"));
    expect(res.status).toBe(404);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("código inválido y código inexistente son indistinguibles", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });
    const a = await verifyHandler.onRequestGet(makeContext("a/b"));
    const b = await verifyHandler.onRequestGet(makeContext("NOEXISTE2"));
    expect(a.status).toBe(b.status);
    expect(await a.json()).toEqual(await b.json());
  });

  it("SISO_TOKEN ausente → 502, nunca llama al Worker", async () => {
    const res = await verifyHandler.onRequestGet(makeContext("VALIDO123", { SISO_TOKEN: "" }));
    expect(res.status).toBe(502);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("respuesta exitosa nunca incluye el token en headers ni body", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ key: "siso_portal_VALIDO123", value: { conceptoAptitud: "APTO", cargo: "Cargo de Prueba", tipoExamen: "Periódico", nombres: "Paciente de Prueba" } }],
    });
    const res = await verifyHandler.onRequestGet(makeContext("VALIDO123"));
    const body = await res.json();
    expect(body).toEqual({ encontrado: true, codigo: "VALIDO123", conceptoAptitud: "APTO", cargo: "Cargo de Prueba", tipoExamen: "Periódico" });
    expect(body).not.toHaveProperty("nombres");
    expect(JSON.stringify(body)).not.toContain(FAKE_TEST_TOKEN);
    expect(res.headers.get("X-Siso-Token")).toBeNull();
  });
});
