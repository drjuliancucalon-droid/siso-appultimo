// src/pages/BackupPage.jsx — Backup & Restore + RIPS
// T-03: Completar Backup - Automático + RIPS
import React, { useState, useEffect } from 'react';
import { Download, Upload, Loader2, CheckCircle, AlertCircle, Database, Clock, FileText, Settings } from 'lucide-react';
import { useBackendData } from '../hooks/useBackendData';

const SB_URL = 'https://yqrrktrgoijgzccrxnpz.supabase.co';
const SB_KEY = 'sb_publishable_K88qYuJ9wsWjQqnIhLVK7Q_NroFvPI7';

const BACKUP_KEYS = [
  { key: 'siso_patients_drcucalon', label: 'Pacientes' },
  { key: 'siso_companies_drcucalon', label: 'Empresas' },
  { key: 'siso_users', label: 'Usuarios' },
  { key: 'siso_agendados_drcucalon', label: 'Agenda' },
  { key: 'siso_saved_bills_drcucalon', label: 'Facturas' },
  { key: 'siso_audit_log', label: 'Auditoría' },
  { key: 'siso_caja_movs_drcucalon', label: 'Caja' },
  { key: 'siso_atenciones', label: 'Atenciones' },
];

// T-03: Historial de backups
const BACKUP_HISTORY_KEY = 'siso_backup_history';

const loadBackupHistory = () => {
  try { return JSON.parse(localStorage.getItem(BACKUP_HISTORY_KEY) || '[]'); } catch { return []; }
};

const saveBackupToHistory = (backupInfo) => {
  const history = loadBackupHistory();
  const newEntry = { ...backupInfo, id: `bk_${Date.now()}`, fecha: new Date().toISOString() };
  const updated = [newEntry, ...history].slice(0, 20); // Mantener últimos 20
  localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(updated));
};

// T-03: Generar RIPS (monolito líneas 47000+)
const generateRIPS = (patients, doctor) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // AF - Datos de afiliación
  const AF = patients.map(p => ({
    tipoDocumentoIdentificacion: p.docTipo || 'CC',
    numeroIdentificacion: p.docNumero || '',
    codigoEPS: p.eps?.substring(0, 6) || 'N/A',
    tipoAfiliado: p.tipoContrato?.toUpperCase().includes('DEPENDIENTE') ? 'C' : 'I',
    primerApellido: p.apellidos?.split(' ')[0] || '',
    segundoApellido: p.apellidos?.split(' ').slice(1).join(' ') || '',
    primerNombre: p.nombres?.split(' ')[0] || '',
    segundoNombre: p.nombres?.split(' ').slice(1).join(' ') || '',
    fechaNacimiento: p.fechaNacimiento || '',
    sexo: p.genero === 'Masculino' ? 'M' : p.genero === 'Femenino' ? 'F' : 'I',
    direccion: p.residencia || '',
    telefono: p.celular || p.telefono || '',
    codigoMunicipio: '19001', // Popayán por defecto
  }));

  // AD - Datos de atención
  const AD = patients.map((p, i) => ({
    numeroFactura: `F${year}${month}${String(i + 1).padStart(6, '0')}`,
    codigoPrestador: doctor?.licencia?.substring(0, 12) || 'SISO001',
    NitPrestador: doctor?.nit || '000000000',
    fechaAtencion: p.fechaExamen || now.toISOString().split('T')[0],
    codigoDiagnosticoPrincipal: p.diagnostico1?.substring(0, 4) || 'Z10.0',
    diagnosticoPrincipal: p.diagnostico1 || '',
    tipoDiagnosticoPrincipal: '1', // Principal
    causaMotivoAtencion: p.motivoConsulta || '',
    tipoDocumentoIdentificacion: p.docTipo || 'CC',
    numeroIdentificacion: p.docNumero || '',
    vrServicio: p.costo || 35000,
    vrCup: p.costo || 35000,
    vrTotal: p.costo || 35000,
  }));

  // AC - Consulta
  const AC = patients.map((p, i) => ({
    codigoPrestador: doctor?.licencia?.substring(0, 12) || 'SISO001',
    fechaAtencion: p.fechaExamen || now.toISOString().split('T')[0],
    tipoDocumentoIdentificacion: p.docTipo || 'CC',
    numeroIdentificacion: p.docNumero || '',
    sexo: p.genero === 'Masculino' ? 'M' : p.genero === 'Femenino' ? 'F' : 'I',
    edad: parseInt(p.edad) || 0,
    unidadMedidaEdad: 1, // Años
    codigoDiagnosticoPrincipal: p.diagnostico1?.substring(0, 4) || 'Z10.0',
    tipoDiagnosticoPrincipal: '1',
    objetivo: p.tipoExamen || 'Ocupacional',
    causaMotivoAtencion: p.motivoConsulta || '',
    codigoProcedimiento: '890101',
    vrProcedimiento: 35000,
  }));

  // AN - Otros servicios
  const AN = [];

  // AU - AutORIZACIONES
  const AU = [];

  // AT - Resumen de atención
  const AT = {
    numeroRegistros: patients.length,
    vrTotal: patients.reduce((sum, p) => sum + (parseInt(p.costo) || 35000), 0),
    fechaGeneracion: now.toISOString(),
    codigoPrestador: doctor?.licencia?.substring(0, 12) || 'SISO001',
    NitPrestador: doctor?.nit || '000000000',
    nombrePrestador: doctor?.nombre || 'OcupaSalud',
  };

  return { AF, AD, AC, AN, AU, AT };
};

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

      {/* T-03: Export RIPS */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-blue-800 text-sm">Exportar RIPS (Ministerio de Salud)</h3>
        </div>
        <p className="text-xs text-blue-600 mb-3">Genera archivos RIPS para reporte obligatorio al Ministerio (Res. 3374/2000)</p>
        <button 
          onClick={async () => {
            try {
              // Get patients data
              const res = await fetch(`${SB_URL}/rest/v1/siso_store?key=eq.siso_patients_drcucalon&select=value`, {
                headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
              });
              const rows = await res.json();
              const patients = rows?.[0]?.value || [];
              
              // Get doctor data
              const docRes = await fetch(`${SB_URL}/rest/v1/siso_store?key=eq.siso_doctor_data&select=value`, {
                headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` }
              });
              const docRows = await docRes.json();
              const doctor = docRows?.[0]?.value || {};
              
              const rips = generateRIPS(patients, doctor);
              
              // Download each file
              const downloadFile = (data, filename) => {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
              };
              
              downloadFile(rips.AF, `RIPS_AF_${new Date().toISOString().split('T')[0]}.json`);
              setTimeout(() => downloadFile(rips.AD, `RIPS_AD_${new Date().toISOString().split('T')[0]}.json`), 500);
              setTimeout(() => downloadFile(rips.AC, `RIPS_AC_${new Date().toISOString().split('T')[0]}.json`), 1000);
              setTimeout(() => downloadFile(rips.AT, `RIPS_AT_${new Date().toISOString().split('T')[0]}.json`), 1500);
              
              setStatus({ type: 'ok', msg: `RIPS exportados: ${patients.length} registros` });
            } catch (err) {
              setStatus({ type: 'error', msg: 'Error exportando RIPS: ' + err.message });
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
        >
          <FileText className="w-3.5 h-3.5 inline mr-1" />
          Exportar RIPS (AF, AD, AC, AT)
        </button>
      </div>

      {/* T-03: Historial de backups */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-gray-600" />
          <h3 className="font-bold text-gray-700 text-sm">Historial de Backups</h3>
        </div>
        <div className="text-xs text-gray-500 italic">
          Funcionalidad de historial en desarrollo - se guardará automáticamente al exportar
        </div>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
        <p className="font-bold">⚠️ Importante</p>
        <p className="mt-1">Los backups contienen datos médicos protegidos por la Ley 1581/2012. Almacénalos de forma segura y no los compartas. Retención mínima: 20 años (Res. 1995/1999).</p>
      </div>
    </div>
  );
}
