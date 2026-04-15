// backend/src/routes/data.js — Data endpoints for patients, companies, users
// Reads from Supabase siso_store (key-value) and returns structured data
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { supabase } from '../services/supabaseClient.js';

const router = Router();

// All data routes require authentication
router.use(requireAuth);

// ── Helper: get store value with user-scoped key ────
async function getUserScopedData(baseKey, userId) {
  // Try user-specific key first, then shared
  const userKey = `${baseKey}_${userId}`;
  let data = await supabase.getStoreValue(userKey);
  if (data) return { data, key: userKey };

  // Try shared key
  const sharedKey = `${baseKey}_shared`;
  data = await supabase.getStoreValue(sharedKey);
  if (data) return { data, key: sharedKey };

  // Try base key
  data = await supabase.getStoreValue(baseKey);
  return { data: data || [], key: baseKey };
}

// ═══ PATIENTS ════════════════════════════════════════
router.get('/patients', async (req, res) => {
  try {
    const userId = req.user.user; // e.g., 'drcucalon'
    const { data } = await getUserScopedData('siso_patients', userId);
    const patients = Array.isArray(data) ? data : [];
    res.json({ patients, count: patients.length });
  } catch (err) {
    console.error('Error fetching patients:', err.message);
    res.status(500).json({ message: 'Error al obtener pacientes' });
  }
});

router.get('/patients/db', async (req, res) => {
  try {
    const userId = req.user.user;
    const { data } = await getUserScopedData('siso_db_patients', userId);
    const patients = Array.isArray(data) ? data : [];
    res.json({ patients, count: patients.length });
  } catch (err) {
    console.error('Error fetching patient DB:', err.message);
    res.status(500).json({ message: 'Error al obtener base de pacientes' });
  }
});

// ═══ COMPANIES ═══════════════════════════════════════
router.get('/companies', async (req, res) => {
  try {
    const userId = req.user.user;
    const { data } = await getUserScopedData('siso_companies', userId);
    const companies = Array.isArray(data) ? data : [];
    res.json({ companies, count: companies.length });
  } catch (err) {
    console.error('Error fetching companies:', err.message);
    res.status(500).json({ message: 'Error al obtener empresas' });
  }
});

// ═══ USERS (admin only) ═════════════════════════════
router.get('/users', requireRole('administrador', 'super_admin'), async (req, res) => {
  try {
    const data = await supabase.getStoreValue('siso_users');
    const users = Array.isArray(data) ? data : [];
    // Strip sensitive data
    const safeUsers = users.map(({ passHash, passSalt, ...u }) => u);
    res.json({ users: safeUsers, count: safeUsers.length });
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// ═══ AGENDA ══════════════════════════════════════════
router.get('/agenda', async (req, res) => {
  try {
    const userId = req.user.user;
    const { data } = await getUserScopedData('siso_agendados', userId);
    const appointments = Array.isArray(data) ? data : [];
    res.json({ appointments, count: appointments.length });
  } catch (err) {
    console.error('Error fetching agenda:', err.message);
    res.status(500).json({ message: 'Error al obtener agenda' });
  }
});

// ═══ BILLS ═══════════════════════════════════════════
router.get('/bills', async (req, res) => {
  try {
    const userId = req.user.user;
    const { data } = await getUserScopedData('siso_saved_bills', userId);
    const bills = Array.isArray(data) ? data : [];
    res.json({ bills, count: bills.length });
  } catch (err) {
    console.error('Error fetching bills:', err.message);
    res.status(500).json({ message: 'Error al obtener facturas' });
  }
});

// ═══ DOCTOR DATA ═════════════════════════════════════
router.get('/doctor', async (req, res) => {
  try {
    const userId = req.user.user;
    const data = await supabase.getStoreValue(`siso_doctor_data_${userId}`);
    res.json({ doctor: data || null });
  } catch (err) {
    console.error('Error fetching doctor data:', err.message);
    res.status(500).json({ message: 'Error al obtener datos del médico' });
  }
});

// ═══ AI KEYS (user-specific, never exposed to frontend) ═══
router.get('/ai-config', async (req, res) => {
  try {
    const userId = req.user.user;
    const data = await supabase.getStoreValue(`siso_ai_keys_${userId}`);
    // Only return which providers are configured, not the actual keys
    if (data && typeof data === 'object') {
      const status = {};
      for (const [provider, key] of Object.entries(data)) {
        status[provider] = !!key?.trim();
      }
      res.json({ providers: status });
    } else {
      res.json({ providers: {} });
    }
  } catch (err) {
    console.error('Error fetching AI config:', err.message);
    res.status(500).json({ message: 'Error al obtener config IA' });
  }
});

// ═══ AUDIT LOG ═══════════════════════════════════════
router.get('/audit', requireRole('administrador', 'super_admin'), async (req, res) => {
  try {
    const data = await supabase.getStoreValue('siso_audit_log');
    const logs = Array.isArray(data) ? data : [];
    res.json({ logs, count: logs.length });
  } catch (err) {
    console.error('Error fetching audit log:', err.message);
    res.status(500).json({ message: 'Error al obtener log de auditoría' });
  }
});

export default router;
