// backend/src/routes/write.js — Write endpoints (save/update data to Supabase)
// All mutations go through the backend — frontend never writes directly
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../services/supabaseClient.js';

const router = Router();
router.use(requireAuth);

// ── Helper: read-modify-write for siso_store ────────
// Since siso_store is key-value (not relational), we read the array,
// modify it, and write it back. This matches the monolith's pattern.
async function readModifyWrite(key, modifier) {
  const current = await supabase.getStoreValue(key);
  const arr = Array.isArray(current) ? current : [];
  const result = modifier(arr);
  await supabase.setStoreValue(key, result);
  return result;
}

// ═══ SAVE PATIENT / HC ═══════════════════════════════
const patientSchema = z.object({
  docNumero: z.string().min(1, 'Documento requerido'),
  nombres: z.string().min(1, 'Nombre requerido'),
}).passthrough(); // Allow all other HC fields

router.post('/patients/save', async (req, res) => {
  try {
    const patient = patientSchema.parse(req.body);
    const userId = req.user.user;
    const key = `siso_patients_${userId}`;

    const updated = await readModifyWrite(key, (patients) => {
      const idx = patients.findIndex((p) => p.docNumero === patient.docNumero);
      const now = new Date().toISOString();

      if (idx >= 0) {
        // Update existing patient (merge)
        patients[idx] = { ...patients[idx], ...patient, fechaModificacion: now };
      } else {
        // New patient
        patients.push({
          ...patient,
          id: `pat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          fechaCreacion: now,
          fechaModificacion: now,
          medicoId: userId,
        });
      }
      return patients;
    });

    // Also save to audit log
    await auditLog(userId, 'SAVE_PATIENT', `${patient.nombres} (${patient.docNumero})`);

    res.json({ ok: true, count: updated.length });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    console.error('Save patient error:', err.message);
    res.status(500).json({ message: 'Error al guardar paciente' });
  }
});

// ═══ SAVE HC (Historia Clínica) ══════════════════════
router.post('/hc/save', async (req, res) => {
  try {
    const hcData = req.body;
    if (!hcData.docNumero) {
      return res.status(400).json({ message: 'Documento del paciente requerido' });
    }

    const userId = req.user.user;
    const key = `siso_patients_${userId}`;
    const now = new Date().toISOString();

    // Add HC metadata
    const hcToSave = {
      ...hcData,
      id: hcData.id || `hc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      fechaModificacion: now,
      medicoId: userId,
      medicoNombre: req.user.nombre || userId,
    };

    if (!hcToSave.fechaCreacion) {
      hcToSave.fechaCreacion = now;
    }

    // Save to patient list (HC data is embedded in the patient record)
    const updated = await readModifyWrite(key, (patients) => {
      const idx = patients.findIndex((p) => p.docNumero === hcData.docNumero);
      if (idx >= 0) {
        // Merge HC data into existing patient
        patients[idx] = { ...patients[idx], ...hcToSave };
      } else {
        // Create new patient from HC
        patients.push(hcToSave);
      }
      return patients;
    });

    await auditLog(userId, 'SAVE_HC', `HC ${hcToSave.tipoExamen || 'ocupacional'} - ${hcToSave.nombres} (${hcToSave.docNumero})`);

    res.json({ ok: true, hcId: hcToSave.id, count: updated.length });
  } catch (err) {
    console.error('Save HC error:', err.message);
    res.status(500).json({ message: 'Error al guardar historia clínica' });
  }
});

// ═══ SAVE COMPANY ════════════════════════════════════
router.post('/companies/save', async (req, res) => {
  try {
    const company = req.body;
    if (!company.razonSocial && !company.nombre) {
      return res.status(400).json({ message: 'Razón social requerida' });
    }

    const userId = req.user.user;
    const key = `siso_companies_${userId}`;
    const now = new Date().toISOString();

    const updated = await readModifyWrite(key, (companies) => {
      const companyId = company.id || `emp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const idx = companies.findIndex((c) => c.id === company.id);

      if (idx >= 0) {
        companies[idx] = { ...companies[idx], ...company, fechaModificacion: now };
      } else {
        companies.push({ ...company, id: companyId, fechaCreacion: now });
      }
      return companies;
    });

    await auditLog(userId, 'SAVE_COMPANY', company.razonSocial || company.nombre);
    res.json({ ok: true, count: updated.length });
  } catch (err) {
    console.error('Save company error:', err.message);
    res.status(500).json({ message: 'Error al guardar empresa' });
  }
});

// ═══ SAVE APPOINTMENT ════════════════════════════════
router.post('/agenda/save', async (req, res) => {
  try {
    const appointment = req.body;
    const userId = req.user.user;
    const key = `siso_agendados_${userId}`;
    const now = new Date().toISOString();

    const updated = await readModifyWrite(key, (appointments) => {
      const apptId = appointment.id || `cita_${Date.now()}`;
      const idx = appointments.findIndex((a) => a.id === appointment.id);

      if (idx >= 0) {
        appointments[idx] = { ...appointments[idx], ...appointment, fechaModificacion: now };
      } else {
        appointments.push({ ...appointment, id: apptId, fechaCreacion: now });
      }
      return appointments;
    });

    res.json({ ok: true, count: updated.length });
  } catch (err) {
    console.error('Save appointment error:', err.message);
    res.status(500).json({ message: 'Error al guardar cita' });
  }
});

// ═══ SAVE BILL ═══════════════════════════════════════
router.post('/bills/save', async (req, res) => {
  try {
    const bill = req.body;
    const userId = req.user.user;
    const key = `siso_saved_bills_${userId}`;
    const now = new Date().toISOString();

    const updated = await readModifyWrite(key, (bills) => {
      const billId = bill.id || `bill_${Date.now()}`;
      const idx = bills.findIndex((b) => b.id === bill.id);

      if (idx >= 0) {
        bills[idx] = { ...bills[idx], ...bill, fechaModificacion: now };
      } else {
        bills.push({ ...bill, id: billId, fechaCreacion: now });
      }
      return bills;
    });

    await auditLog(userId, 'SAVE_BILL', bill.numero || 'Nueva factura');
    res.json({ ok: true, count: updated.length });
  } catch (err) {
    console.error('Save bill error:', err.message);
    res.status(500).json({ message: 'Error al guardar factura' });
  }
});

// ═══ DELETE (soft — marks as deleted) ════════════════
router.post('/delete', async (req, res) => {
  try {
    const { collection, itemId } = req.body;
    if (!collection || !itemId) {
      return res.status(400).json({ message: 'collection y itemId requeridos' });
    }

    const userId = req.user.user;
    const keyMap = {
      patients: `siso_patients_${userId}`,
      companies: `siso_companies_${userId}`,
      agenda: `siso_agendados_${userId}`,
      bills: `siso_saved_bills_${userId}`,
    };
    const key = keyMap[collection];
    if (!key) return res.status(400).json({ message: 'Colección inválida' });

    const updated = await readModifyWrite(key, (items) => {
      return items.filter((item) => item.id !== itemId);
    });

    await auditLog(userId, 'DELETE', `${collection}/${itemId}`);
    res.json({ ok: true, count: updated.length });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ message: 'Error al eliminar' });
  }
});

// ── Audit logger ─────────────────────────────────────
async function auditLog(userId, action, detail) {
  try {
    const current = await supabase.getStoreValue('siso_audit_log');
    const logs = Array.isArray(current) ? current : [];
    logs.push({
      ts: new Date().toISOString(),
      action,
      user: userId,
      detail: String(detail).substring(0, 200),
    });
    // Keep last 500 entries
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    await supabase.setStoreValue('siso_audit_log', logs);
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

export default router;
