// siso-appultimo/functions/api/internal-store/verify/[codigo].js
// Endpoint público de verificación individual de certificados — cubre
// VerificacionPage.buscarPorCodigo y el componente WorkerPortal. Ninguno
// de los dos pasa por el gate de codigoAcceso en el código real (esa
// validación solo existe en la rama "empresa" — App.jsx:17179; la rama de
// búsqueda individual por código/cédula no la tiene).
//
// Claves confirmadas en el código real de producción (commit 6eb4574):
//   VerificacionPage.jsx:49,51 → siso_portal_${codigo}, siso_portal_doc_${documento}
//   WorkerPortal.jsx:25,37,39  → siso_portal_doc_${cc}, siso_portal_${code}, siso_portal_CV-${code}
// Unión de ambos: 3 claves candidatas fijas.
//
// Contrato:
//   GET /api/internal-store/verify/:codigo
//   200 { encontrado: true, codigo, conceptoAptitud, cargo, tipoExamen }
//   404 { error: "No encontrado" }        — no existe O formato inválido (indistinguibles)
//   502 { error: "Error del servidor" }   — el Worker falló, no respondió, o falta configuración
//
// SISO_TOKEN se lee ÚNICAMENTE de context.env.SISO_TOKEN (binding server-side
// de Cloudflare Pages) y se usa solo para la llamada servidor-a-servidor
// hacia el Worker. Nunca se incluye en la respuesta al navegador.

const CODIGO_MAX_LEN = 40;
const CODIGO_PATTERN = /^[A-Za-z0-9-]{1,40}$/;

export function candidateKeys(codigo) {
  return [
    `siso_portal_${codigo}`,
    `siso_portal_CV-${codigo}`,
    `siso_portal_doc_${codigo}`,
  ];
}

// Proyección de campos — SOLO los 3 campos autorizados para este piloto
// (concepto de aptitud, cargo, tipo de examen). Deliberadamente NO incluye
// nombres, documento, diagnóstico, restricciones, recomendaciones, firma ni
// ningún otro campo — aunque VerificacionPage.jsx/WorkerPortal.jsx sí los
// muestran hoy. Alcance de campos ya discutido y acotado en fases
// anteriores del diseño BFF; ampliarlo requiere decisión humana separada.
export function projectPublicFields(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    conceptoAptitud: typeof raw.conceptoAptitud === "string" ? raw.conceptoAptitud : null,
    cargo: typeof raw.cargo === "string" ? raw.cargo : null,
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

export async function onRequestGet(context) {
  const { params, env } = context;
  const codigoRaw = params?.codigo;

  const codigo = typeof codigoRaw === "string" ? codigoRaw.trim().toUpperCase() : "";
  if (!codigo || codigo.length > CODIGO_MAX_LEN || !CODIGO_PATTERN.test(codigo)) {
    return jsonResponse(404, { error: "No encontrado" });
  }

  if (!env?.SISO_TOKEN) {
    return jsonResponse(502, { error: "Error del servidor" });
  }

  try {
    for (const key of candidateKeys(codigo)) {
      const value = await fetchFromWorker(env, key);
      if (value) {
        const projected = projectPublicFields(value);
        if (projected) {
          return jsonResponse(200, { encontrado: true, codigo, ...projected });
        }
      }
    }
    return jsonResponse(404, { error: "No encontrado" });
  } catch (e) {
    return jsonResponse(502, { error: "Error del servidor" });
  }
}
