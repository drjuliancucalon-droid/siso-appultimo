// src/lib/migrateStorage.js — SPRINT R-2 FASE R-1
// Migración one-shot: localStorage viejo → D1/cloud
// Ejecutada UNA vez por usuario al confirmar login exitoso
import { d1WriteArrayMerge } from './d1Client';

const MIGRATION_FLAG = 'siso_migrated_v2';

/**
 * migrateLocalStorageToCloud(userId)
 * Lee las 3 claves viejas del localStorage (sin userId)
 * y las escribe a D1 con sufijo _<userId>.
 * Si todo OK, marca siso_migrated_v2 = 'true'.
 * Si cualquier escritura falla, NO marca y permite reintento.
 */
export async function migrateLocalStorageToCloud(userId) {
  const yaFue = localStorage.getItem(MIGRATION_FLAG) === 'true';
  if (yaFue) {
    // Verificar que realmente migró — si D1 vacío, resetear flag
    try {
      const { d1Get } = await import('./d1Client');
      const { value } = await d1Get(`siso_patients_${userId}`);
      // BUG-A-02: considerar 0 o 1 (registro QA) como migración inválida
      if (!Array.isArray(value) || value.length <= 1) {
        console.warn('[MIGRACIÓN R-1] Flag activo pero D1 con 0/1 registros — resetando para re-migrar');
        localStorage.removeItem(MIGRATION_FLAG);
      } else {
        console.log('[MIGRACIÓN R-1] Ya migrado para', userId, `(${value.length} pacientes en D1)`);
        return true;
      }
    } catch {
      // Si D1 no responde, no resetear — reintentar en próximo login
      console.warn('[MIGRACIÓN R-1] No se pudo verificar D1, reintentando en próximo login');
      return false;
    }
  }

  console.log('[MIGRACIÓN R-1] Iniciando migración localStorage → D1 para', userId);
  let allOk = true;

  // ── 1. Pacientes (siso_db_patients → siso_db_patients_<userId>) ─────────
  try {
    const raw = localStorage.getItem('siso_db_patients');
    if (raw) {
      const pacientes = JSON.parse(raw);
      if (Array.isArray(pacientes) && pacientes.length > 0) {
        console.log(`[MIGRACIÓN R-1] Migrando ${pacientes.length} pacientes...`);
        await d1WriteArrayMerge(`siso_patients_${userId}`, pacientes, 'docNumero');
        console.log(`[MIGRACIÓN R-1] ✅ Pacientes migrados`);
      }
    }
  } catch (e) {
    console.error('[MIGRACIÓN R-1] ❌ Error pacientes:', e.message);
    allOk = false;
  }

  // ── 2. Empresas (siso_companies → siso_companies_<userId>) ──────────────
  try {
    const raw = localStorage.getItem('siso_companies');
    if (raw) {
      const empresas = JSON.parse(raw);
      if (Array.isArray(empresas) && empresas.length > 0) {
        console.log(`[MIGRACIÓN R-1] Migrando ${empresas.length} empresas...`);
        await d1WriteArrayMerge(`siso_companies_${userId}`, empresas, 'id');
        console.log(`[MIGRACIÓN R-1] ✅ Empresas migradas`);
      }
    }
  } catch (e) {
    console.error('[MIGRACIÓN R-1] ❌ Error empresas:', e.message);
    allOk = false;
  }

  // ── 3. Agenda (siso_agendados → siso_agendados_<userId>, MERGE) ─────────
  try {
    const raw = localStorage.getItem('siso_agendados');
    if (raw) {
      const citas = JSON.parse(raw);
      if (Array.isArray(citas) && citas.length > 0) {
        // Filtrar duplicados por id para no romper datos de Supabase
        console.log(`[MIGRACIÓN R-1] Migrando ${citas.length} citas...`);
        await d1WriteArrayMerge(`siso_agendados_${userId}`, citas, 'id');
        console.log(`[MIGRACIÓN R-1] ✅ Agenda migrada`);
      }
    }
  } catch (e) {
    console.error('[MIGRACIÓN R-1] ❌ Error agenda:', e.message);
    allOk = false;
  }

  if (allOk) {
    localStorage.setItem(MIGRATION_FLAG, 'true');
    console.log('[MIGRACIÓN R-1] ✅ Migración completa — flag seteado');
    return true;
  } else {
    console.warn('[MIGRACIÓN R-1] ⚠️ Migración parcial — se reintentará en próximo login');
    return false;
  }
}