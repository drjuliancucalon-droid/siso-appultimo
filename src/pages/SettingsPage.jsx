// src/pages/SettingsPage.jsx
// Sprint 3.6: Settings with Backup/Restore + AI Config
import React, { useState, useCallback, useRef } from 'react';
import { Settings, Download, Upload, AlertCircle, CheckCircle, Loader2, Database, Shield, Key } from 'lucide-react';

const BACKUP_KEYS = [
  'siso_db_patients',
  'siso_companies',
  'siso_doctor_data',
  'siso_agenda',
  'siso_bills',
  'siso_habeas_data_requests',
];

const getAllLocalStorageData = () => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('siso_') || key.startsWith('auth_')) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key));
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }
  }
  return data;
};

export default function SettingsPage() {
  const [backupStatus, setBackupStatus] = useState(null); // 'exporting' | 'importing' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef(null);

  // ── Export Backup ──
  const handleExport = useCallback(() => {
    setBackupStatus('exporting');
    setStatusMsg('Preparando backup...');
    try {
      const data = getAllLocalStorageData();
      const backup = {
        _meta: {
          version: '2.0',
          app: 'SISO OcupaSalud Pro',
          exportedAt: new Date().toISOString(),
          keyCount: Object.keys(data).length,
        },
        data,
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `siso_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStatus('success');
      setStatusMsg(`✅ Backup exportado: ${Object.keys(data).length} claves`);
    } catch (err) {
      setBackupStatus('error');
      setStatusMsg(`❌ Error: ${err.message}`);
    }
  }, []);

  // ── Import Backup ──
  const handleImport = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBackupStatus('importing');
    setStatusMsg('Leyendo archivo...');
    setImportProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);

        // Validate structure
        if (!backup._meta || !backup.data) {
          throw new Error('Formato de backup inválido. Debe tener _meta y data.');
        }

        const keys = Object.keys(backup.data);
        if (keys.length === 0) {
          throw new Error('El backup está vacío.');
        }

        if (!confirm(`¿Importar backup de ${backup._meta.exportedAt}?\nContiene ${keys.length} claves.\n\n⚠️ Esto REEMPLAZARÁ los datos actuales.`)) {
          setBackupStatus(null);
          return;
        }

        // Import key by key
        keys.forEach((key, idx) => {
          const value = backup.data[key];
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          setImportProgress(Math.round(((idx + 1) / keys.length) * 100));
        });

        setBackupStatus('success');
        setStatusMsg(`✅ Importadas ${keys.length} claves. Recarga la página para ver los cambios.`);
      } catch (err) {
        setBackupStatus('error');
        setStatusMsg(`❌ Error: ${err.message}`);
      }
    };
    reader.onerror = () => {
      setBackupStatus('error');
      setStatusMsg('❌ Error al leer el archivo');
    };
    reader.readAsText(file);
    event.target.value = '';
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-2.5 rounded-xl">
          <Settings className="w-6 h-6 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-800">Configuración</h1>
          <p className="text-xs text-gray-500">Backup, restauración y ajustes del sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backup/Restore Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-black text-gray-800">Backup y Restauración</h2>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Exporta o importa todos los datos del sistema en formato JSON.
            El backup incluye pacientes, empresas, agenda, facturación y configuración.
          </p>

          <div className="flex gap-3 mb-4">
            <button
              onClick={handleExport}
              disabled={backupStatus === 'exporting'}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
            >
              {backupStatus === 'exporting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Exportar Backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={backupStatus === 'importing'}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-emerald-700 border-2 border-emerald-300 px-4 py-3 rounded-lg text-xs font-bold hover:bg-emerald-50 disabled:opacity-50"
            >
              {backupStatus === 'importing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Importar Backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          {/* Progress */}
          {backupStatus === 'importing' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-emerald-600 h-2 rounded-full transition-all" style={{ width: `${importProgress}%` }} />
            </div>
          )}

          {/* Status message */}
          {statusMsg && (
            <div className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
              backupStatus === 'success' ? 'bg-green-50 text-green-700' :
              backupStatus === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {backupStatus === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> :
               backupStatus === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> :
               <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {statusMsg}
            </div>
          )}
        </div>

        {/* Data info card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-black text-gray-800">Datos del Sistema</h2>
          </div>
          <div className="space-y-2">
            {BACKUP_KEYS.map((key) => {
              let count = '—';
              try {
                const val = JSON.parse(localStorage.getItem(key) || 'null');
                if (Array.isArray(val)) count = `${val.length} registros`;
                else if (val && typeof val === 'object') count = 'Configurado';
                else count = 'Vacío';
              } catch { count = 'N/A'; }
              return (
                <div key={key} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-xs font-medium text-gray-600">{key.replace('siso_', '').replace(/_/g, ' ')}</span>
                  <span className="text-xs text-emerald-700 font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
