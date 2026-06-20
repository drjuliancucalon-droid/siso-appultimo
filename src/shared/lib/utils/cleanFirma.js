// src/shared/lib/utils/cleanFirma.js — FIX 5
// Limpia comillas extra de firma base64 antes de guardar o publicar en D1

/**
 * cleanFirma(firma)
 * Elimina comillas dobles/simples al inicio/final de una firma base64.
 * Evita que se guarden con formato corrupto en D1.
 *
 * @param {string} firma - Firma en base64 o string
 * @returns {string} Firma limpia
 *
 * Ejemplo:
 *   cleanFirma('"data:image/png;base64,iVBORw0..."') → 'data:image/png;base64,iVBORw0...'
 *   cleanFirma("'data:image/png;base64,ABC...'") → 'data:image/png;base64,ABC...'
 */
export function cleanFirma(firma) {
  if (!firma) return '';
  return firma.replace(/^["']+|["']+$/g, '').trim();
}