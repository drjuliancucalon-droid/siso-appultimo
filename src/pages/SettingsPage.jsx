// src/pages/SettingsPage.jsx
// Sprint 3.6: Backup/Restore + General Settings
import React, { useState, useCallback, useRef } from 'react';
import { Download, Upload, Settings, Database, AlertTriangle, CheckCircle, Loader2, Shield } from 'lucide-react';

const BACKUP_KEYS = [
  'siso_db_patients',
  'siso_companies',
  'siso_doctor_data',
  'siso_agenda',
  'siso_bills',
  'siso_habeas_data_requests',
  'siso_ai_config',
];

export default function SettingsPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [lastBackup, setLastBackup] = useState(null);
  const fileInputRef = useRef(null);

  // Export backup
  const handleExportBackup = useCallback(async () => {
    setExporting(true);
    try {
      const backup = {
        meta: {
          version: '2.0',
          app: 'SISO OcupaSalud Pro',
          exportDate: new Date().toISOString(),
          exportedBy: 'manual',
        },
        data: {},
      };

      // Collect all localStorage keys matching siso_*
      const allKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('siso_') || BACKUP_KEYS.includes(key))) {
          allKeys.push(key);
        }
      }

      for (const key of allKeys) {
        try {
          const raw = localStorage.getItem(key);
          backup.data[key] = JSON.parse(raw);
        } catch {
          backup.data[key] = localStorage.getItem(key);
        }
      }

      backup.meta.totalKeys = Object.keys(backup.data).length;

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `siso_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setLastBackup(new Date().toISOString());
      alert(`✅ Backup exportado correctamente (${Object.keys(backup.data).length} claves)`);
    } catch (err) {
      alert('❌ Error al exportar: ' + err.message);
    } finally {
      setExporting(false);
    }
  }, []);

  // Import backup
  const handleImportBackup = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportProgress(0);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const backup = JSON.parse(ev.target.result);

        // Validate structure
        if (!backup.meta || !backup.data) {
          throw new Error('Archivo de backup inválido: falta meta o data');
        }

        if (backup.meta.app !== 'SISO OcupaSalud Pro') {
          throw new Error('Este backup no es de SISO OcupaSalud Pro');
        }

        const keys = Object.keys(backup.data);
        const confirmMsg = `¿Importar backup del ${new Date(backup.meta.exportDate).toLocaleDateString('es-CO')}?\n\n` +
          `Versión: ${backup.meta.version}\n` +
          `Claves: ${keys.length}\n\n` +
          `⚠️ ESTO SOBRESCRIBIRÁ LOS DATOS ACTUALES`;

        if (!confirm(confirmMsg)) {
          setImporting(false);
          return;
        }

        // Import key by key with progress
        let imported = 0;
        for (const [key, value] of Object.entries(backup.data)) {
          try {
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, serialized);
            imported++;
            setImportProgress(Math.round((imported / keys.length) * 100));
          } catch (err) {
            console.warn(`Error importing key ${key}:`, err);
          }
        }

        alert(`✅ Backup importado correctamente (${imported}/${keys.length} claves). Recargue la página para ver los cambios.`);
      } catch (err) {
        alert('❌ Error al importar: ' + err.message);
      } finally {
        setImporting(false);
        setImportProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-7 h-7 text-emerald-600" />
        <div>
          <h1 className="text-xl font-black text-gray-800">Configuración</h1>
          <p className="text-xs text-gray-500">Backup, restauración y ajustes del sistema</p>
        </div>
      </div>

      {/* Backup section */}
      <div className="bg-white border rounded-xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-black text-gray-800 uppercase">Backup y Restauración</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export */}
          <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/50">
            <h3 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
              <Download className="w-4 h-4" /> Exportar Backup
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Descarga un archivo JSON con todos los datos almacenados localmente
              (pacientes, empresas, agenda, facturas, configuración).
            </p>
            <button
              onClick={handleExportBackup}
              disabled={exporting}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-emerald-700 disabled:opacity-50 shadow-sm w-full justify-center"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exporting ? 'Exportando...' : 'Exportar Backup'}
            </button>
            {lastBackup && (
              <p className="text-[10px] text-emerald-600 mt-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Último: {new Date(lastBackup).toLocaleString('es-CO')}
              </p>
            )}
          </div>

          {/* Import */}
          <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/50">
            <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Importar Backup
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Selecciona un archivo JSON de backup para restaurar los datos.
              <span className="text-red-600 font-bold"> Los datos actuales serán sobrescritos.</span>
            </p>
            <label className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-amber-700 cursor-pointer shadow-sm w-full justify-center">
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {importing ? `Importando... ${importProgress}%` : 'Seleccionar Archivo'}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
                disabled={importing}
              />
            </label>
            {importing && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="mt-4 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-700">
            <strong>Importante:</strong> Los backups contienen datos sensibles de pacientes protegidos por la Ley 1581/2012.
            Almacene los archivos de backup en un lugar seguro y no los comparta con terceros no autorizados.
          </div>
        </div>
      </div>

      {/* Data privacy section */}
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-black text-gray-800 uppercase">Privacidad y Seguridad</h2>
        </div>
        <div className="space-y-2 text-xs text-gray-600">
          <p>• Los datos se almacenan localmente y en Supabase con cifrado en tránsito (TLS 1.3).</p>
          <p>• Las API Keys de IA se almacenan solo en el navegador local (localStorage).</p>
          <p>• Se cumplen los requisitos de la Res. 1995/1999 (historia clínica) y Ley 1581/2012 (datos personales).</p>
          <p>• Las sesiones expiran automáticamente después de 30 minutos de inactividad.</p>
        </div>
      </div>
    </div>
  );
}
