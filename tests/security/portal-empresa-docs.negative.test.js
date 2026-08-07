// tests/security/portal-empresa-docs.negative.test.js
// Pruebas negativas para /api/internal-store/portal-empresa-docs/:nit —
// mismo gate de codigoAcceso que portal-empresa-nit, alcance limitado a
// siso_portal_empresa_atenciones_<nit>. Nunca toca periodos/cuenta/
// custodia/informe ni bills/caja/custodia (ver comentario en el endpoint
// y en CLAUDE.md).

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as handler from "../../functions/api/internal-store/portal-empresa-docs/[nit].js";

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

function mockWorker(byKey) {
  fetchMock.mockImplementation(async (url) => {
    const key = decodeURIComponent(String(url).split("/store/")[1] || "");
    const value = byKey[key];
    return { ok: true, json: async () => (value !== undefined ? [{ key, value }] : []) };
  });
}

describe("/api/internal-store/portal-empresa-docs/:nit — pruebas negativas", () => {
  it("solo POST — sin handlers GET/PUT/DELETE", () => {
    expect(handler.onRequestGet).toBeUndefined();
    expect(handler.onRequestPut).toBeUndefined();
    expect(handler.onRequestDelete).toBeUndefined();
    expect(typeof handler.onRequestPost).toBe("function");
  });

  it("NIT inválido → 404 sin llamar al Worker", async () => {
    const res = await handler.onRequestPost(makeContext("x", { codigo: FAKE_CODE }));
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("código correcto → autorizado, solo 6 campos por atención, nunca periodos/cuenta/custodia", async () => {
    mockWorker({
      [`siso_portal_empresa_docs_${NIT}`]: {
        codigoAcceso: FAKE_CODE,
        periodos: [{ cuenta: { monto: 555555 }, custodia: { firma: "no debe salir" } }],
      },
      [`siso_portal_empresa_atenciones_${NIT}`]: {
        nombre: "Empresa de Prueba SAS",
        atenciones: [{
          nombres: "Paciente de Prueba", docNumero: "000000002", fechaExamen: "2026-01-02",
          conceptoAptitud: "APTO", derivaciones: [], tipoExamen: "Ingreso",
          diagnosticoPrincipal: "no debe salir",
        }],
      },
    });
    const res = await handler.onRequestPost(makeContext(NIT, { codigo: FAKE_CODE }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.autorizado).toBe(true);
    expect(body.atenciones).toHaveLength(1);
    expect(Object.keys(body.atenciones[0]).sort()).toEqual(
      ["nombres", "docNumero", "fechaExamen", "conceptoAptitud", "derivaciones", "tipoExamen"].sort()
    );
    const bodyText = JSON.stringify(body);
    expect(bodyText).not.toContain("no debe salir");
    expect(bodyText).not.toContain("555555");
    expect(bodyText).not.toContain("periodos");
    expect(bodyText).not.toContain(FAKE_TOKEN);
  });

  it("código incorrecto → mismo status/shape que NIT inexistente", async () => {
    mockWorker({ [`siso_portal_empresa_docs_${NIT}`]: { codigoAcceso: FAKE_CODE } });
    const conCodigoMalo = await handler.onRequestPost(makeContext(NIT, { codigo: "EMP-WRONG-0000" }));
    fetchMock.mockReset();
    mockWorker({});
    const nitInexistente = await handler.onRequestPost(makeContext("900888888", { codigo: FAKE_CODE }));
    expect(conCodigoMalo.status).toBe(nitInexistente.status);
    expect(await conCodigoMalo.json()).toEqual(await nitInexistente.json());
  });

  it("DIVERGENCIA DELIBERADA: NIT sin codigoAcceso nunca autoriza", async () => {
    mockWorker({});
    const res = await handler.onRequestPost(makeContext(NIT, { codigo: FAKE_CODE }));
    expect(res.status).toBe(404);
  });

  it("sin código enviado → deniega sin tocar el Worker", async () => {
    const res = await handler.onRequestPost(makeContext(NIT, {}));
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("respuesta autorizada nunca incluye codigoAcceso", async () => {
    mockWorker({
      [`siso_portal_empresa_docs_${NIT}`]: { codigoAcceso: FAKE_CODE },
      [`siso_portal_empresa_atenciones_${NIT}`]: { atenciones: [] },
    });
    const res = await handler.onRequestPost(makeContext(NIT, { codigo: FAKE_CODE }));
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain(FAKE_CODE);
  });

  it("SISO_TOKEN ausente → 502, nunca llama al Worker", async () => {
    const res = await handler.onRequestPost(makeContext(NIT, { codigo: FAKE_CODE }, { SISO_TOKEN: "" }));
    expect(res.status).toBe(502);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
