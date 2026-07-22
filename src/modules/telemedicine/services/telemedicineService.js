/**
 * telemedicineService.js
 * Persistencia D1 (primaria) + localStorage (fallback/espejo) para Telemedicina.
 *
 * FIX 2026-07-21 (FASE 4 PROMPT_MAESTRO_IGUALACION): antes todo el estado de
 * teleconsultas/sala/sala de espera vivía solo en localStorage — se perdía al
 * cambiar de dispositivo o limpiar el navegador. Mismo patrón que sgsstService.js:
 * D1 primero (merge por id para arrays), localStorage como fallback y espejo.
 */
import { d1Get, d1Set, d1WriteArrayMerge } from '../../../lib/d1Client';
import { sp, _ls } from '../../../shared/lib/storage';

const D1_PREFIX = 'siso_telemedicina_';
const LS_CONSULTAS = 'siso_teleconsultas';
const LS_SALA = 'siso_teleSala';
const LS_ESPERA = 'siso_teleEspera';

// ─── Teleconsultas (array, merge por id) ────────────────────────────────────
export const getConsultas = async () => {
  try {
    const { value } = await d1Get(`${D1_PREFIX}teleconsultas`);
    if (Array.isArray(value)) return value;
  } catch { /* D1 no disponible, usar localStorage */ }
  return sp(LS_CONSULTAS, []);
};

export const saveConsultas = async (list) => {
  _ls.setItem(LS_CONSULTAS, JSON.stringify(list));
  try { await d1Set(`${D1_PREFIX}teleconsultas`, list); } catch { /* D1 fallback, ya quedó en LS */ }
};

export const upsertConsulta = async (consulta) => {
  try { await d1WriteArrayMerge(`${D1_PREFIX}teleconsultas`, [consulta], 'id'); } catch { /* D1 fallback */ }
  const list = sp(LS_CONSULTAS, []);
  const idx = list.findIndex((c) => c.id === consulta.id);
  const updated = idx === -1 ? [...list, consulta] : list.map((c) => (c.id === consulta.id ? consulta : c));
  _ls.setItem(LS_CONSULTAS, JSON.stringify(updated));
  return updated;
};

// ─── Sala de telemedicina activa (objeto único por médico) ──────────────────
const salaKey = (medicoId) => `${D1_PREFIX}sala_${medicoId || 'default'}`;

export const getTeleSala = async (medicoId) => {
  try {
    const { value } = await d1Get(salaKey(medicoId));
    if (value && typeof value === 'object') return value;
  } catch { /* D1 no disponible */ }
  return sp(LS_SALA, { activa: false, room: null, link: null, iniciada: null });
};

export const saveTeleSala = async (medicoId, sala) => {
  _ls.setItem(LS_SALA, JSON.stringify(sala));
  try { await d1Set(salaKey(medicoId), sala); } catch { /* D1 fallback, ya quedó en LS */ }
};

// ─── Sala de espera (array, merge por id, por médico) ───────────────────────
const esperaKey = (medicoId) => `${D1_PREFIX}espera_${medicoId || 'default'}`;

export const getTeleEspera = async (medicoId) => {
  try {
    const { value } = await d1Get(esperaKey(medicoId));
    if (Array.isArray(value)) return value;
  } catch { /* D1 no disponible */ }
  return sp(LS_ESPERA, []);
};

export const saveTeleEspera = async (medicoId, list) => {
  _ls.setItem(LS_ESPERA, JSON.stringify(list));
  try { await d1Set(esperaKey(medicoId), list); } catch { /* D1 fallback, ya quedó en LS */ }
};
