// siso-appultimo/functions/api/internal-store/portal-empresa-docs/[nit].js
// Cubre la porción de PortalEmpresaPage.jsx que lee
// siso_portal_empresa_atenciones_${nit} — protegida por el mismo gate de
// codigoAcceso que portal-empresa-nit (misma familia de datos, mismo
// mecanismo, ver _portalEmpresaAuth.js).
//
// DECISIÓN DE ALCANCE, documentada explícitamente porque no fue
// especificada campo por campo de antemano: siso_portal_empresa_docs_${nit}
// (el objeto que SÍ lee PortalEmpresaPage.jsx.cargarDocumentos) tiene un
// array `periodos[]` donde CADA periodo mezcla intrínsecamente `informe`,
// `cuenta` (facturación) y `custodia` (cartas de custodia) — no son campos
// separables de esa estructura sin filtrar periodo por periodo. Como la
// instrucción es "nunca tocar bills/caja/custodia", este endpoint NO
// proyecta absolutamente nada de `periodos[]`/`cuenta`/`custodia`/`informe`
// — solo usa docsRecord internamente (vía validateAccessCode) para el gate,
// nunca lo devuelve. Lo único que se proyecta es
// siso_portal_empresa_atenciones_${nit}, con los mismos 6 campos ya
// aprobados para portal-empresa-nit (misma naturaleza de dato: certificados
// de trabajadores, no facturación).
//
// `cargarDocumentos()` en PortalEmpresaPage.jsx sigue usando d1Client.js
// sin cambios para periodos/cuenta/custodia/informe y para
// siso_saved_bills_*/siso_caja_movs_*/siso_cartas_custodia_* — coexistencia
// temporal explícita, ver CLAUDE.md.
//
// Método: POST (mismo razonamiento que portal-empresa-nit — código de
// acceso nunca en query string).
//
// Contrato:
//   POST /api/internal-store/portal-empresa-docs/:nit   body: { codigo }
//   200 { autorizado: true, nit, atenciones: [{ nombres, docNumero, fechaExamen, conceptoAptitud, derivaciones, tipoExamen }, ...] }
//   404 { error: "No encontrado" }
//   405 { error: "Método no permitido" }
//   502 { error: "Error del servidor" }

import { nitVariants, isValidNitFormat, validateAccessCode } from "../_portalEmpresaAuth.js";

function projectWorkerFields(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    nombres: typeof raw.nombres === "string" ? raw.nombres : null,
    docNumero: typeof raw.docNumero === "string" || typeof raw.docNumero === "number" ? String(raw.docNumero) : null,
    fechaExamen: typeof raw.fechaExamen === "string" ? raw.fechaExamen : null,
    conceptoAptitud: typeof raw.conceptoAptitud === "string" ? raw.conceptoAptitud : null,
    derivaciones: Array.isArray(raw.derivaciones) ? raw.derivaciones : null,
    tipoExamen: typeof raw.tipoExamen === "string" ? raw.tipoExamen : null,
  };
}

async function fetchFromWorker(env, key) {
  const workerUrl = env.WORKER_URL || "https://siso-api.dr-juliancucalon.workers.dev";
  const res = await fetch(`${workerUrl}/store/${encodeURIComponent(key)}`, {
    headers: { "X-Siso-Token": env.SISO_TOKEN || "" },
  });
  if (!res.ok) throw new Error(`worker_status_${res.status}`);
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0].value : null;
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { params, env, request } = context;
  const nitRaw = params?.nit;

  if (!isValidNitFormat(nitRaw)) {
    return jsonResponse(404, { error: "No encontrado" });
  }

  if (!env?.SISO_TOKEN) {
    return jsonResponse(502, { error: "Error del servidor" });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(404, { error: "No encontrado" });
  }
  const codigo = typeof body?.codigo === "string" ? body.codigo : "";

  try {
    const { authorized, matchedNit } = await validateAccessCode(env, nitRaw, codigo);
    if (!authorized) {
      return jsonResponse(404, { error: "No encontrado" });
    }

    const nitClean = String(nitRaw).replace(/\D/g, "");
    // Fusión multi-NIT por docNumero, igual que cargarDocumentos() real —
    // pero SOLO de atenciones, nunca de periodos/cuenta/custodia/informe.
    const vistos = new Set();
    const atenciones = [];
    for (const nv of nitVariants(nitClean)) {
      if (!nv) continue;
      let grupo;
      try {
        grupo = await fetchFromWorker(env, `siso_portal_empresa_atenciones_${nv}`);
      } catch { continue; }
      if (!grupo || typeof grupo !== "object" || !Array.isArray(grupo.atenciones)) continue;
      for (const a of grupo.atenciones) {
        const dn = a?.docNumero ? String(a.docNumero).replace(/\s/g, "") : null;
        if (!dn || vistos.has(dn)) continue;
        const projected = projectWorkerFields(a);
        if (projected) { atenciones.push(projected); vistos.add(dn); }
      }
    }

    return jsonResponse(200, { autorizado: true, nit: matchedNit || nitClean, atenciones });
  } catch (e) {
    return jsonResponse(502, { error: "Error del servidor" });
  }
}
