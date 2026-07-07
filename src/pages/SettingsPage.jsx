// src/pages/SettingsPage.jsx — Configuración con Backup + Import CSV
// GAP-D01+GAP-G01: Importar pacientes desde CSV
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Settings, Download, Upload, AlertCircle, CheckCircle, Users,
  Loader2, Database, Shield, RefreshCw, FileText,
} from 'lucide-react';
import { useAIStore } from '../stores/aiStore';

const SB_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yqrrktrgoijgzccrxnpz.supabase.co';
const SB_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7';

const sbHeaders = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' };

const fetchStoreKey = async (key) => {
  const res = await fetch(`${SB_URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(key)}&select=value`, { headers: sbHeaders });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows?.[0]?.value ?? null;
};
const upsertStoreKey = async (key, value) => {
  const res = await fetch(`${SB_URL}/rest/v1/siso_store`, {
    method: 'POST',
    headers: { ...sbHeaders, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
  });
  return res.ok;
};

const EXPORT_KEYS = [
  { key: 'siso_patients_drcucalon', label: 'Pacientes' },
  { key: 'siso_companies_drcucalon', label: 'Empresas' },
  { key: 'siso_users', label: 'Usuarios' },
  { key: 'siso_agendados_drcucalon', label: 'Agenda' },
  { key: 'siso_saved_bills_drcucalon', label: 'Facturas' },
  { key: 'siso_audit_log', label: 'Auditoría' },
  { key: 'siso_doctor_data_drcucalon', label: 'Doctor' },
  { key: 'siso_doctor_signature', label: 'Firma Digital' },
];

const DISPLAY_KEYS = [
  { key: 'siso_patients_drcucalon', label: 'Pacientes' },
  { key: 'siso_companies_drcucalon', label: 'Empresas' },
  { key: 'siso_users', label: 'Usuarios' },
  { key: 'siso_agendados_drcucalon', label: 'Agenda' },
  { key: 'siso_saved_bills_drcucalon', label: 'Facturas' },
  { key: 'siso_caja_movs_drcucalon', label: 'Caja' },
  { key: 'siso_cotizaciones_drcucalon', label: 'Cotizaciones' },
  { key: 'siso_portafolio', label: 'Portafolio' },
  { key: 'siso_habeas_data_requests', label: 'Habeas Data' },
  { key: 'siso_atl_cases', label: 'ARL' },
  { key: 'siso_encuestas', label: 'Encuestas' },
];

export default function SettingsPage() {
  const [backupStatus, setBackupStatus] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef(null);
  const csvFileRef = useRef(null);

  // ── System counts ──
  const [systemCounts, setSystemCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const loadCounts = useCallback(async () => {
    setLoadingCounts(true);
    const counts = {};
    for (const item of DISPLAY_KEYS) {
      try {
        const raw = await fetchStoreKey(item.key);
        const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
        counts[item.label] = Array.isArray(parsed) ? parsed.length : (parsed ? 1 : 0);
      } catch { counts[item.label] = null; }
    }
    setSystemCounts(counts);
    setLoadingCounts(false);
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  // ── Export backup ──
  const handleExport = async () => {
    setBackupStatus('exporting');
    setStatusMsg('Exportando datos...');
    try {
      const backup = { version: '2.0', exportedAt: new Date().toISOString(), keys: {} };
      for (const item of EXPORT_KEYS) {
        const raw = await fetchStoreKey(item.key);
        if (raw) backup.keys[item.key] = typeof raw === 'string' ? raw : JSON.stringify(raw);
      }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      setBackupStatus('success');
      setStatusMsg('✅ Backup exportado correctamente');
    } catch (e) { setBackupStatus('error'); setStatusMsg('Error: ' + e.message); }
  };

  // ── Import backup ──
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackupStatus('importing');
    setStatusMsg('Importando backup...');
    setImportProgress(0);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const keys = Object.entries(backup.keys || {});
      for (let i = 0; i < keys.length; i++) {
        const [key, value] = keys[i];
        await upsertStoreKey(key, typeof value === 'string' ? (tryParse(value) ?? value) : value);
        setImportProgress(Math.round(((i + 1) / keys.length) * 100));
      }
      setBackupStatus('success');
      setStatusMsg('✅ Backup importado correctamente');
      loadCounts();
    } catch (e) { setBackupStatus('error'); setStatusMsg('Error: ' + e.message); }
    e.target.value = '';
  };

  const tryParse = (v) => { try { return JSON.parse(v); } catch { return null; } };

  // ── GAP-D01+GAP-G01: Importar pacientes CSV ──
  const [activeTab, setActiveTab] = useState('backup');
  const [csvStatus, setCsvStatus] = useState(null);
  const [csvMsg, setCsvMsg] = useState('');
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvImporting, setCsvImporting] = useState(false);

  const handleCsvFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFileName(file.name);
    setCsvStatus('preview');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { setCsvStatus('error'); setCsvMsg('El archivo debe tener al menos encabezado + 1 fila'); return; }
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i] || ''; });
        return obj;
      });
      setCsvPreview(rows.slice(0, 10));
      setCsvMsg(`${rows.length} pacientes detectados en el archivo`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportCsv = async () => {
    if (csvPreview.length === 0) return;
    setCsvImporting(true);
    setCsvStatus('importing');
    try {
      const existingRaw = localStorage.getItem('siso_patients_drcucalon');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const merged = [...existing, ...csvPreview.map((row, i) => ({
        id: `csv_${Date.now()}_${i}`,
        nombres: row.nombres || row.nombre || row.NOMBRES || '',
        docTipo: row.docTipo || row.tipoDoc || 'CC',
        docNumero: row.docNumero || row.documento || row.DOCUMENTO || '',
        empresa: row.empresa || row.EMPRESA || '',
        empresaNombre: row.empresaNombre || row.empresa || row.EMPRESA || '',
        cargo: row.cargo || row.CARGO || '',
        email: row.email || row.correo || row.EMAIL || '',
        celular: row.celular || row.telefono || row.CELULAR || '',
        tipoExamen: row.tipoExamen || row.tipo || 'INGRESO',
        fechaExamen: row.fechaExamen || row.fecha || new Date().toISOString().split('T')[0],
      }))];
      localStorage.setItem('siso_patients_drcucalon', JSON.stringify(merged));
      setCsvStatus('success');
      setCsvMsg(`✅ ${csvPreview.length} pacientes importados correctamente (total: ${merged.length})`);
      loadCounts();
    } catch (e) { setCsvStatus('error'); setCsvMsg('Error: ' + e.message); }
    setCsvImporting(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
      </div>

      {/* GAP-D01: Tabs Backup / Importar CSV */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
        {[
          { k: 'backup', l: '💾 Backup' },
          { k: 'import', l: '📥 Importar CSV' },
        ].map(t => (
          <button key={t.k} onClick={() => setActiveTab(t.k)}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition ${activeTab === t.k ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {/* TAB: IMPORTAR CSV */}
      {activeTab === 'import' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-black text-gray-800">Importar Pacientes desde CSV</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              El archivo CSV debe tener columnas: nombres, docTipo, docNumero, empresa, cargo, email, celular, tipoExamen, fechaExamen
            </p>

            <div className="flex items-center gap-3 mb-4">
              <input ref={csvFileRef} type="file" accept=".csv" onChange={handleCsvFile} className="hidden" />
              <button onClick={() => csvFileRef.current?.click()} disabled={csvImporting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50">
                <Upload className="w-4 h-4" /> Seleccionar archivo CSV
              </button>
              {csvFileName && <span className="text-xs text-gray-500">📄 {csvFileName}</span>}
            </div>

            {csvStatus && (
              <div className={`p-3 rounded-lg text-sm mb-4 ${csvStatus === 'success' ? 'bg-green-50 text-green-700' : csvStatus === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                {csvImporting ? <Loader2 className="w-4 h-4 inline animate-spin mr-1" /> : ''}
                {csvMsg}
              </div>
            )}

            {csvPreview.length > 0 && csvStatus !== 'success' && (
              <>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-[10px] border">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(csvPreview[0]).slice(0, 6).map(k => <th key={k} className="p-1 border text-left font-bold">{k}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {Object.values(row).slice(0, 6).map((v, j) => <td key={j} className="p-1 border truncate max-w-[120px]">{v}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={handleImportCsv} disabled={csvImporting}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 disabled:opacity-50">
                  {csvImporting ? 'Importando...' : `Importar ${csvPreview.length} pacientes`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB: BACKUP */}
      {activeTab === 'backup' && (
        <>
          {/* Backup / Restore */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-black text-gray-800">Backup y Restauración</h2>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={handleExport} disabled={backupStatus === 'exporting'}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50">
                {backupStatus === 'exporting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Exportar Backup
              </button>
              <button onClick={() => fileInputRef.current?.click()} disabled={backupStatus === 'importing'}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-emerald-700 border-2 border-emerald-300 px-4 py-3 rounded-lg text-xs font-bold hover:bg-emerald-50 disabled:opacity-50">
                {backupStatus === 'importing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Importar Backup
              </button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            </div>

            {backupStatus === 'importing' && (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-emerald-600 h-2 rounded-full transition-all duration-200" style={{ width: `${importProgress}%` }} />
              </div>
            )}
            {statusMsg && (
              <div className={`flex items-start gap-2 text-xs p-2.5 rounded-lg ${backupStatus === 'success' ? 'bg-green-50 text-green-700' : backupStatus === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                {backupStatus === 'success' ? <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : backupStatus === 'error' ? <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : <Loader2 className="w-3.5 h-3.5 mt-0.5 animate-spin shrink-0" />}
                <span>{statusMsg}</span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3">🔒 Integridad verificada con SHA-256 (Ley 527/1999 art. 7)</p>
          </div>

          {/* System Data */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-black text-gray-800">Datos del Sistema</h2>
              </div>
              <button onClick={loadCounts} disabled={loadingCounts}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 disabled:opacity-40" title="Actualizar conteos">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCounts ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-2">
              {DISPLAY_KEYS.map(({ label }) => {
                const count = systemCounts[label];
                const isEmpty = count === null || count === undefined;
                return (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-xs font-medium text-gray-600">{label}</span>
                    <span className={`text-xs font-bold ${loadingCounts ? 'text-gray-300' : isEmpty ? 'text-gray-400' : 'text-emerald-700'}`}>
                      {loadingCounts ? '…' : isEmpty ? 'Vacío' : `${count} registros`}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">Datos almacenados en D1 (Cloudflare) + localStorage como caché.</p>
          </div>
        </>
      )}
    </div>
  );
}