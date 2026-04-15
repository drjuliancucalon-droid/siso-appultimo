// src/pages/BackupPage.jsx — Backup & Restore
// Sprint 3.6: Export/import all data as JSON
import React, { useState } from 'react';
import { Download, Upload, Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { useBackendData } from '../hooks/useBackendData';

const BACKUP_KEYS = [
  { key: 'siso_patients_drcucalon', label: 'Pacientes' },
  { key: 'siso_companies_drcucalon', label: 'Empresas' },
  { key: 'siso_users', label: 'Usuarios' },
  { key: 'siso_agendados_drcucalon', label: 'Agenda' },
  { key: 'siso_saved_bills_drcucalon', label: 'Facturas' },
  { key: 'siso_audit_log', label: 'Auditoría' },
];

export default function BackupPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleExport = async () => {
    setExporting(true); setStatus(null);
    try {
      const SB_URL = 'https://yqrrktrgoijgzccrxnpz.supabase.co';
      const SB_KEY = 'sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7';
      const backup = { version: '2.0', date: new Date().toISOString(), data: {} };

      for (const { key, label } of BACKUP_KEYS) {
        try {
          const res = await fetch(`${SB_URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(key)}&select=value`, {
            headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
          });
          if (res.ok) {
            const rows = await res.json();
            if (rows?.[0]?.value) backup.data[key] = rows[0].value;
          }
        } catch {}
      }

      const counts = Object.entries(backup.data).map(([k, v]) => `${k.replace('siso_', '').replace('_drcucalon', '')}: ${Array.isArray(v) ? v.length : 1}`);
      backup.summary = counts;

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `backup_ocupasalud_${new Date().toISOString().split('T')[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
      setStatus({ type: 'ok', msg: `Backup exportado: ${counts.length} colecciones` });
    } catch (err) { setStatus({ type: 'error', msg: err.message }); }
    finally { setExporting(false); }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true); setStatus(null);

    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      if (!backup.version || !backup.data) throw new Error('Formato de backup inválido');
      if (!confirm(`¿Importar backup del ${new Date(backup.date).toLocaleDateString('es-CO')}?\n\nColecciones: ${backup.summary?.join(', ') || 'N/A'}\n\n⚠️ Esto sobrescribirá los datos actuales.`)) {
        setImporting(false); return;
      }

      const SB_URL = 'https://yqrrktrgoijgzccrxnpz.supabase.co';
      const SB_KEY = 'sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7';
      let imported = 0;

      for (const [key, value] of Object.entries(backup.data)) {
        try {
          await fetch(`${SB_URL}/rest/v1/siso_store`, {
            method: 'POST',
            headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
          });
          imported++;
        } catch {}
      }

      setStatus({ type: 'ok', msg: `Backup importado: ${imported} colecciones restauradas` });
    } catch (err) { setStatus({ type: 'error', msg: `Error: ${err.message}` }); }
    finally { setImporting(false); e.target.value = ''; }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-800">Backup y Restauración</h1>
      </div>

      {status && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm ${status.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {status.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6 text-center">
          <Download className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 mb-2">Exportar Backup</h3>
          <p className="text-xs text-gray-500 mb-4">Descarga un archivo JSON con todos los datos (pacientes, empresas, facturas, etc.)</p>
          <button onClick={handleExport} disabled={exporting}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? 'Exportando...' : 'Exportar'}
          </button>
        </div>

        <div className="bg-white border rounded-xl p-6 text-center">
          <Upload className="w-10 h-10 text-teal-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 mb-2">Importar Backup</h3>
          <p className="text-xs text-gray-500 mb-4">Restaura datos desde un archivo JSON de backup previamente exportado</p>
          <label className="w-full py-2.5 bg-white border-2 border-emerald-300 text-emerald-700 rounded-lg font-bold text-sm hover:bg-emerald-50 flex items-center justify-center gap-2 cursor-pointer">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {importing ? 'Importando...' : 'Seleccionar archivo'}
            <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
          </label>
        </div>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
        <p className="font-bold">⚠️ Importante</p>
        <p className="mt-1">Los backups contienen datos médicos protegidos por la Ley 1581/2012. Almacénalos de forma segura y no los compartas. Retención mínima: 20 años (Res. 1995/1999).</p>
      </div>
    </div>
  );
}
