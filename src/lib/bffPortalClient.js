// siso-appultimo/src/lib/bffPortalClient.js
// Cliente same-origin de solo lectura para los 3 endpoints públicos del
// portal (Fase A). Sin token — nunca lo maneja, nunca lo necesita — y sin
// acceso a ninguna otra familia de clave D1 más allá de las 3 rutas
// explícitas de abajo.

export async function verifyCode(codigo) {
  const safeCodigo = typeof codigo === "string" ? codigo.trim() : "";
  if (!safeCodigo) return { ok: false, status: 400, error: "Código vacío" };

  let res;
  try {
    res = await fetch(`/api/internal-store/verify/${encodeURIComponent(safeCodigo)}`, {
      method: "GET",
      credentials: "same-origin",
    });
  } catch {
    return { ok: false, status: 0, error: "Error de red" };
  }

  let body = null;
  try { body = await res.json(); } catch { /* respuesta no-JSON inesperada */ }

  if (!res.ok) return { ok: false, status: res.status, error: body?.error || "Error" };
  return { ok: true, status: res.status, data: body };
}

export async function searchByNitPublic(nit, codigoAcceso) {
  const safeNit = typeof nit === "string" ? nit.replace(/\D/g, "") : "";
  const safeCodigo = typeof codigoAcceso === "string" ? codigoAcceso.trim() : "";
  if (!safeNit) return { ok: false, status: 400, error: "NIT vacío" };
  if (!safeCodigo) return { ok: false, status: 400, error: "Código de acceso requerido" };

  let res;
  try {
    res = await fetch(`/api/internal-store/portal-empresa-nit/${encodeURIComponent(safeNit)}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: safeCodigo }),
    });
  } catch {
    return { ok: false, status: 0, error: "Error de red" };
  }

  let body = null;
  try { body = await res.json(); } catch { /* respuesta no-JSON inesperada */ }

  if (!res.ok) return { ok: false, status: res.status, error: body?.error || "Error" };
  return { ok: true, status: res.status, data: body };
}

export async function getEmpresaDocsPublic(nit, codigoAcceso) {
  const safeNit = typeof nit === "string" ? nit.replace(/\D/g, "") : "";
  const safeCodigo = typeof codigoAcceso === "string" ? codigoAcceso.trim() : "";
  if (!safeNit) return { ok: false, status: 400, error: "NIT vacío" };
  if (!safeCodigo) return { ok: false, status: 400, error: "Código de acceso requerido" };

  let res;
  try {
    res = await fetch(`/api/internal-store/portal-empresa-docs/${encodeURIComponent(safeNit)}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: safeCodigo }),
    });
  } catch {
    return { ok: false, status: 0, error: "Error de red" };
  }

  let body = null;
  try { body = await res.json(); } catch { /* respuesta no-JSON inesperada */ }

  if (!res.ok) return { ok: false, status: res.status, error: body?.error || "Error" };
  return { ok: true, status: res.status, data: body };
}

// FIX 2026-08-07 (P0 — ver CLAUDE.md): reemplaza la descarga completa de
// siso_saved_bills_*/siso_caja_movs_*/siso_cartas_custodia_* + filtrado
// client-side en PortalEmpresaPage.cargarDocumentos(). El servidor ahora
// filtra por NIT antes de responder — el cliente nunca recibe registros de
// otras empresas.
export async function getEmpresaFinancieroPublic(nit, codigoAcceso) {
  const safeNit = typeof nit === "string" ? nit.replace(/\D/g, "") : "";
  const safeCodigo = typeof codigoAcceso === "string" ? codigoAcceso.trim() : "";
  if (!safeNit) return { ok: false, status: 400, error: "NIT vacío" };
  if (!safeCodigo) return { ok: false, status: 400, error: "Código de acceso requerido" };

  let res;
  try {
    res = await fetch(`/api/internal-store/portal-empresa-financiero/${encodeURIComponent(safeNit)}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: safeCodigo }),
    });
  } catch {
    return { ok: false, status: 0, error: "Error de red" };
  }

  let body = null;
  try { body = await res.json(); } catch { /* respuesta no-JSON inesperada */ }

  if (!res.ok) return { ok: false, status: res.status, error: body?.error || "Error" };
  return { ok: true, status: res.status, data: body };
}
