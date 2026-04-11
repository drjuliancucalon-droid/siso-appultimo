// Firma digital - Ley 527/1999 Colombia
import { _sha256 } from './crypto.js';

export const _generarHashHC = async (data) => {
  try {
    const contenido = JSON.stringify({
      id: data.id,
      nombres: data.nombres,
      docNumero: data.docNumero,
      fechaExamen: data.fechaExamen,
      conceptoAptitud: data.conceptoAptitud,
      tipoExamen: data.tipoExamen,
      diagnosticoPrincipal: data.diagnosticoPrincipal,
      medicoId: data._medicoId,
      estadoHistoria: "Cerrada",
      ts: new Date().toISOString(),
    });
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(contenido)
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return "HASH-NO-DISPONIBLE-" + Date.now();
  }
};
// Genera código de verificación QR para la HC firmada
// El código contiene: ID paciente + hash (primeros 16 chars) + fecha
export const _generarCodigoQR = (id, hash, fecha) => {
  const short = hash.substring(0, 16).toUpperCase();
  const fechaShort = (fecha || new Date().toISOString())
    .substring(0, 10)
    .replace(/-/g, "");
  return `SISO-${fechaShort}-${id.substring(0, 8).toUpperCase()}-${short}`;
};
// Formatea datos de firma para mostrar en la HC impresa
export const _formatFirmaDigital = (firma) => {
  if (!firma) return null;
  return {
    codigo: firma.codigoQR || firma.codigo,
    hash: firma.hash ? firma.hash.substring(0, 32) + "..." : null,
    firmadoPor: firma.firmadoPor,
    fechaFirma: firma.fechaFirma,
    valido: !!(firma.codigoQR && firma.hash && firma.firmadoPor),
  };
};
// ==========================================
