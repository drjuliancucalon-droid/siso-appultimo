// siso-appultimo/functions/api/internal-store/portal-empresa-nit/[nit].js
// Cubre VerificacionPage.buscarPorNIT — búsqueda de trabajadores de una
// empresa por NIT, protegida por el código de acceso compartido con la
// empresa (formato EMP-XXXX-XXXX). Ver functions/api/internal-store/
// _portalEmpresaAuth.js para el mecanismo de validación y la divergencia
// deliberada respecto al bypass presente en el código real (monolito y
// refactor) cuando no hay código o no hay codigoAcceso configurado.
//
// Método: POST, no GET. El código de acceso es un secreto compartido con
// la empresa — un GET con ?code= en la URL quedaría en logs de servidor,
// proxies intermedios y en el historial del navegador. Excepción
// justificada a la regla general de "solo GET" del resto del BFF,
// documentada aquí explícitamente, no aplicada por defecto a ningún otro
// endpoint.
//
// Claves reales (VerificacionPage.jsx:65,76, confirmado en commit 6eb4574):
//   siso_portal_empresa_${nit}       → array de {docNumero, ...} (índice ligero)
//   siso_portal_doc_${docNumero}     → certificado completo por trabajador,
//                                       con fallback al registro del índice
//                                       si no existe (mismo comportamiento
//                                       real, ver App.jsx equivalente).
//
// Contrato:
//   POST /api/internal-store/portal-empresa-nit/:nit   body: { codigo }
//   200 { autorizado: true, nit, trabajadores: [{ nombres, docNumero, fechaExamen, conceptoAptitud, derivaciones, tipoExamen }, ...] }
//   404 { error: "No encontrado" }   — NIT/código inválido, no autorizado, o sin datos (todos indistinguibles)
//   405 { error: "Método no permitido" } — cualquier método distinto de POST
//   502 { error: "Error del servidor" }  — Worker falló o falta configuración

import { nitVariants, isValidNitFormat, validateAccessCode } from "../_portalEmpresaAuth.js";

const MAX_TRABAJADORES_INDIVIDUALES = 50; // límite defensivo de fetches por request

// Proyección — EXACTAMENTE los 6 campos confirmados en el render real del
// monolito (App.jsx: resultadosEmpresa.map usa .nombres, .docNumero,
// .fechaExamen, .conceptoAptitud, .derivaciones, .tipoExamen). Ningún
// campo adicional (nunca diagnóstico, restricciones, recomendaciones,
// firma, ni codigoAcceso).
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
      // Indistinguible de "NIT no existe" — nunca revela si el NIT existe,
      // si tiene código configurado, ni si el código estuvo cerca.
      return jsonResponse(404, { error: "No encontrado" });
    }

    const nitClean = String(nitRaw).replace(/\D/g, "");
    // El índice ligero puede vivir bajo cualquier variante de NIT, igual
    // que docsRecord — probar las mismas variantes, en el mismo orden.
    let indice = null;
    for (const nv of nitVariants(nitClean)) {
      if (!nv) continue;
      const val = await fetchFromWorker(env, `siso_portal_empresa_${nv}`);
      if (Array.isArray(val) && val.length > 0) { indice = val; break; }
    }
    if (!indice) {
      return jsonResponse(200, { autorizado: true, nit: matchedNit || nitClean, trabajadores: [] });
    }

    const pendientes = indice.slice(0, MAX_TRABAJADORES_INDIVIDUALES);
    const trabajadores = [];
    for (const reg of pendientes) {
      const docNumero = reg?.docNumero ? String(reg.docNumero).replace(/\s/g, "") : null;
      if (!docNumero) continue;
      let full = null;
      try {
        full = await fetchFromWorker(env, `siso_portal_doc_${docNumero}`);
      } catch { /* fallback al registro del índice, igual que el código real */ }
      const projected = projectWorkerFields(full || reg);
      if (projected) trabajadores.push(projected);
    }

    return jsonResponse(200, { autorizado: true, nit: matchedNit || nitClean, trabajadores });
  } catch (e) {
    return jsonResponse(502, { error: "Error del servidor" });
  }
}
