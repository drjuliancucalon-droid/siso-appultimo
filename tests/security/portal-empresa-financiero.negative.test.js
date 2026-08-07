// tests/security/portal-empresa-financiero.negative.test.js
// Pruebas negativas para /api/internal-store/portal-empresa-financiero/:nit
// — corrige el hallazgo P0 activo (ver CLAUDE.md): antes, el navegador
// descargaba siso_saved_bills_*/siso_caja_movs_*/siso_cartas_custodia_*
// COMPLETOS y filtraba por NIT client-side. Este endpoint filtra
// server-side; el objetivo central de estas pruebas es demostrar, sobre el
// PAYLOAD DE RED crudo (no solo lo que la UI renderiza), que un NIT
// autorizado nunca recibe registros de otro NIT.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as handler from "../../functions/api/internal-store/portal-empresa-financiero/[nit].js";

const FAKE_TOKEN = "TEST-FAKE-TOKEN-DO-NOT-USE-0000000000";
const FAKE_CODE = "EMP-TEST-0000";
const NIT_A = "900000000"; // empresa autorizada en las pruebas
const NIT_B = "800111222"; // empresa "ajena" — sus registros nunca deben salir

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

describe("/api/internal-store/portal-empresa-financiero/:nit — pruebas negativas", () => {
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

  it("sin código enviado → deniega sin tocar el Worker (nunca descarga los arrays completos)", async () => {
    const res = await handler.onRequestPost(makeContext(NIT_A, {}));
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("código incorrecto → mismo status/shape que NIT inexistente", async () => {
    mockWorker({ [`siso_portal_empresa_docs_${NIT_A}`]: { codigoAcceso: FAKE_CODE } });
    const conCodigoMalo = await handler.onRequestPost(makeContext(NIT_A, { codigo: "EMP-WRONG-0000" }));
    fetchMock.mockReset();
    mockWorker({});
    const nitInexistente = await handler.onRequestPost(makeContext("900999999", { codigo: FAKE_CODE }));
    expect(conCodigoMalo.status).toBe(nitInexistente.status);
    expect(await conCodigoMalo.json()).toEqual(await nitInexistente.json());
  });

  it("DIVERGENCIA DELIBERADA: NIT sin codigoAcceso configurado nunca autoriza", async () => {
    mockWorker({});
    const res = await handler.onRequestPost(makeContext(NIT_A, { codigo: FAKE_CODE }));
    expect(res.status).toBe(404);
  });

  it("SISO_TOKEN ausente → 502, nunca intenta llamar al Worker", async () => {
    const res = await handler.onRequestPost(makeContext(NIT_A, { codigo: FAKE_CODE }, { SISO_TOKEN: "" }));
    expect(res.status).toBe(502);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("HALLAZGO PRINCIPAL — payload de red autorizado para NIT-A nunca contiene registros de NIT-B", async () => {
    const bills = [
      { id: "BILL-A1", empresaClienteId: NIT_A, empresaClienteNombre: "Empresa A SAS", concepto: "Consulta ocupacional", monto: 120000, periodo: "2026-07", pacienteNombre: "Paciente A No Debe Salir Igual", pacienteDoc: "111111111" },
      { id: "BILL-B1", empresaClienteId: NIT_B, empresaClienteNombre: "Empresa B Ajena SAS", concepto: "Consulta de otra empresa", monto: 999999, periodo: "2026-07", pacienteNombre: "Paciente B No Debe Salir Jamas", pacienteDoc: "222222222" },
    ];
    const caja = [
      { id: "CAJA-A1", empresaClienteId: NIT_A, empresaClienteNombre: "Empresa A SAS", concepto: "Ingreso A", monto: 50000, fecha: "2026-07-01", pacienteNombre: "Paciente Caja A", pacienteDoc: "333333333" },
      { id: "CAJA-B1", empresaClienteId: NIT_B, empresaClienteNombre: "Empresa B Ajena SAS", concepto: "Ingreso B secreto", monto: 777777, fecha: "2026-07-01", pacienteNombre: "Paciente Caja B No Debe Salir", pacienteDoc: "444444444" },
    ];
    const custodia = [
      { id: "CUST-A1", empresaNit: NIT_A, mesTexto: "Julio", anio: 2026, savedAt: "2026-07-15T00:00:00.000Z" },
      { id: "CUST-B1", empresaNit: NIT_B, mesTexto: "Julio-Secreto-B", anio: 2026, savedAt: "2026-07-15T00:00:00.000Z" },
    ];
    mockWorker({
      [`siso_portal_empresa_docs_${NIT_A}`]: { codigoAcceso: FAKE_CODE, nombre: "Empresa A SAS" },
      [`siso_saved_bills_drcucalon`]: bills,
      [`siso_caja_movs_drcucalon`]: caja,
      [`siso_cartas_custodia_drcucalon`]: custodia,
    });

    const res = await handler.onRequestPost(makeContext(NIT_A, { codigo: FAKE_CODE }));
    expect(res.status).toBe(200);
    const rawText = await res.text();
    const body = JSON.parse(rawText);

    // El payload de red crudo — no la UI — nunca debe contener NIT-B ni sus datos.
    expect(rawText).not.toContain(NIT_B);
    expect(rawText).not.toContain("999999");
    expect(rawText).not.toContain("777777");
    expect(rawText).not.toContain("Empresa B Ajena");
    expect(rawText).not.toContain("Julio-Secreto-B");
    expect(rawText).not.toContain("Paciente B No Debe Salir Jamas");
    expect(rawText).not.toContain("Paciente Caja B No Debe Salir");
    expect(rawText).not.toContain("222222222");
    expect(rawText).not.toContain("444444444");

    // Solo el registro de NIT-A, y solo los campos proyectados.
    expect(body.cuentas).toHaveLength(2);
    expect(body.custodia).toHaveLength(1);
    for (const c of [...body.cuentas, ...body.custodia]) {
      expect(Object.keys(c).sort()).toEqual(
        ["concepto", "monto", "periodo", "fecha", "mesTexto", "anio", "savedAt", "empresaNombre"].sort()
      );
    }
  });

  it("nunca incluye pacienteNombre/pacienteDoc/medicoId/medicoNombre/tipoConsulta/codigoVerificacion aunque el Worker los devuelva", async () => {
    mockWorker({
      [`siso_portal_empresa_docs_${NIT_A}`]: { codigoAcceso: FAKE_CODE, nombre: "Empresa A SAS" },
      [`siso_saved_bills_drcucalon`]: [],
      [`siso_caja_movs_drcucalon`]: [
        { id: "CAJA-A2", empresaClienteId: NIT_A, empresaClienteNombre: "Empresa A SAS", concepto: "Ingreso", monto: 1000, fecha: "2026-07-01", pacienteNombre: "No Debe Salir", pacienteDoc: "555555555", medicoId: "drcucalon", medicoNombre: "No Debe Salir Doctor", tipoConsulta: "Periódico", codigoVerificacion: "CV-SECRETO", _autoGenerated: true },
      ],
      [`siso_cartas_custodia_drcucalon`]: [],
    });
    const res = await handler.onRequestPost(makeContext(NIT_A, { codigo: FAKE_CODE }));
    const rawText = await res.text();
    expect(rawText).not.toContain("pacienteNombre");
    expect(rawText).not.toContain("pacienteDoc");
    expect(rawText).not.toContain("medicoId");
    expect(rawText).not.toContain("medicoNombre");
    expect(rawText).not.toContain("tipoConsulta");
    expect(rawText).not.toContain("codigoVerificacion");
    expect(rawText).not.toContain("CV-SECRETO");
    expect(rawText).not.toContain("No Debe Salir");
    expect(rawText).not.toContain("555555555");
  });

  it("respuesta autorizada nunca incluye codigoAcceso ni el token", async () => {
    mockWorker({
      [`siso_portal_empresa_docs_${NIT_A}`]: { codigoAcceso: FAKE_CODE, nombre: "Empresa A SAS" },
      [`siso_saved_bills_drcucalon`]: [],
      [`siso_caja_movs_drcucalon`]: [],
      [`siso_cartas_custodia_drcucalon`]: [],
    });
    const res = await handler.onRequestPost(makeContext(NIT_A, { codigo: FAKE_CODE }));
    const rawText = await res.text();
    expect(rawText).not.toContain(FAKE_CODE);
    expect(rawText).not.toContain(FAKE_TOKEN);
  });

  it("respeta el tope defensivo de 30 registros por familia", async () => {
    const muchos = Array.from({ length: 50 }, (_, i) => ({
      id: `CAJA-A-${i}`, empresaClienteId: NIT_A, empresaClienteNombre: "Empresa A SAS",
      concepto: `Ingreso ${i}`, monto: i, fecha: "2026-07-01",
    }));
    mockWorker({
      [`siso_portal_empresa_docs_${NIT_A}`]: { codigoAcceso: FAKE_CODE, nombre: "Empresa A SAS" },
      [`siso_saved_bills_drcucalon`]: [],
      [`siso_caja_movs_drcucalon`]: muchos,
      [`siso_cartas_custodia_drcucalon`]: [],
    });
    const res = await handler.onRequestPost(makeContext(NIT_A, { codigo: FAKE_CODE }));
    const body = await res.json();
    expect(body.cuentas.length).toBeLessThanOrEqual(30);
  });
});
