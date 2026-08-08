// siso-appultimo/functions/api/internal-store/_portalEmpresaAuth.js
// Módulo compartido — NO es una ruta (el prefijo `_` evita que Cloudflare
// Pages lo trate como endpoint). Usado por portal-empresa-nit y
// portal-empresa-docs, que protegen la misma familia de datos con el mismo
// mecanismo: código de acceso compartido con la empresa por email,
// validado contra siso_portal_empresa_docs_<nit>.codigoAcceso.
//
// Replica exactamente el comportamiento real confirmado en:
//   ../ocupasaludparadesplegar/src/App.jsx:17183-17215 (monolito)
//   src/pages/PortalEmpresaPage.jsx:99-114 (refactor, commit 6eb4574)
// con UNA divergencia deliberada — ver DIVERGENCIA abajo.

const NIT_MIN_LEN = 3;
const NIT_MAX_LEN = 15;

function normalizeAccessCode(v) {
  return typeof v === "string" ? v.trim().toUpperCase() : "";
}

// Genera las variantes de NIT en el MISMO orden que el código real
// (App.jsx:17187-17189): NIT exacto, luego NIT+dígito de verificación
// (0-9), y por último NIT sin el último dígito — SOLO si nitClean tiene
// más de 6 caracteres (umbral real confirmado por lectura directa del
// monolito; un borrador previo de esta función usaba > 1, que no coincide
// con el código real y se corrigió aquí antes de implementar).
export function nitVariants(nitInput) {
  const nitClean = String(nitInput ?? "").replace(/\D/g, "");
  const variants = [nitClean];
  for (let dv = 0; dv <= 9; dv++) {
    variants.push(`${nitClean}${dv}`);
  }
  if (nitClean.length > 6) {
    variants.push(nitClean.slice(0, -1));
  }
  return variants;
}

export function isValidNitFormat(nitInput) {
  const nitClean = String(nitInput ?? "").replace(/\D/g, "");
  return nitClean.length >= NIT_MIN_LEN && nitClean.length <= NIT_MAX_LEN;
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

/**
 * Valida el código de acceso de una empresa contra TODAS las variantes de
 * NIT, probando cada una hasta encontrar un registro con codigoAcceso
 * configurado (docsKeyFound === true en la lógica original) y comparando
 * solo ese registro — igual que el monolito/refactor real.
 *
 * DIVERGENCIA DELIBERADA respecto al comportamiento real (ver hallazgo en
 * CLAUDE.md, "Bypass de autorización en monolito/refactor — portal empresa
 * por NIT"): tanto el monolito (App.jsx:17209-17215) como el propio
 * refactor (PortalEmpresaPage.jsx: `let codigoValido = true` inicializado
 * fuera del `if (cod)`) dejan pasar la búsqueda SIN bloquear cuando no hay
 * codigoAcceso configurado para ningún NIT — o, en el caso del refactor,
 * incluso cuando el cliente simplemente no envía ningún código. Aquí NUNCA
 * se autoriza sin un código real, no vacío, que coincida tras normalizar.
 * Ninguna ruta de bypass por ausencia de configuración ni por campo vacío.
 *
 * @returns {{ authorized: boolean, docsRecord: object|null, matchedNit: string|null }}
 *          docsRecord y matchedNit son null salvo que authorized === true —
 *          nunca se filtra el registro (incluido codigoAcceso) en un
 *          resultado no autorizado.
 */
export async function validateAccessCode(env, nitInput, codigoIngresado) {
  const codigoNormalizado = normalizeAccessCode(codigoIngresado);
  if (!codigoNormalizado) {
    // Sin código provisto → deniega sin tocar el Worker.
    return { authorized: false, docsRecord: null, matchedNit: null };
  }

  for (const nv of nitVariants(nitInput)) {
    if (!nv) continue;
    let docsRecord;
    try {
      docsRecord = await fetchFromWorker(env, `siso_portal_empresa_docs_${nv}`);
    } catch {
      continue; // esta variante falló al leer — probar la siguiente, no abortar todo
    }
    const storedCode = normalizeAccessCode(docsRecord?.codigoAcceso);
    if (storedCode.length > 0 && storedCode === codigoNormalizado) {
      return { authorized: true, docsRecord, matchedNit: nv };
    }
  }

  return { authorized: false, docsRecord: null, matchedNit: null };
}

export { fetchFromWorker, normalizeAccessCode };
