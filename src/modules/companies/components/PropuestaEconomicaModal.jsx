// src/modules/companies/components/PropuestaEconomicaModal.jsx
// REPLICA EXACTA del monolito: renderPropuestas L43980-45000
import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, Printer, Save, FileText } from 'lucide-react';
import { d1WriteArrayMerge } from '../../../lib/d1Client';

const formatCOP = (n) => Number(n || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
const SERVICIO_DEFAULT = { servicio: '', descripcion: '', frecuencia: 'Unica', precioUnitario: 0, cantidad: 1, subtotal: 0 };
// Lista predefinida como el monolito (selSvc)
const SERVICIOS_PREDEFINIDOS = [
  { label: 'Examen Medico Ocupacional (Ingreso)', svc: 'Examen Medico Ocupacional', desc: 'Evaluacion medica completa de ingreso segun perfil del cargo y riesgos laborales (Res. 1843/2025). Incluye: historia clinica ocupacional, examen fisico completo por sistemas, test osteomuscular, audiometria tonal, visiometria, espirometria, electrocardiograma, pruebas psicometricas basicas, concepto de aptitud laboral firmado y codigo QR de verificacion.' },
  { label: 'Examen Medico Periodico', svc: 'Examen Medico Periodico', desc: 'Evaluacion medica periodica programada segun matriz de riesgos y periodicidad definida por GTC-45 y RG-SST. Incluye HC ocupacional completa, paraclinicos ocupacionales segun riesgo, seguimiento de restricciones previas, informe colectivo anonimizado.' },
  { label: 'Examen Medico de Egreso/Retiro', svc: 'Examen Medico de Egreso', desc: 'Evaluacion medica al termino del vinculo laboral. Incluye comparativo ingreso-egreso, identificacion de posibles enfermedades laborales, HC ocupacional de cierre, concepto de egreso con estado de salud final.' },
  { label: 'Examen Post-Incapacidad/Reintegro', svc: 'Examen Post-Incapacidad', desc: 'Evaluacion medica para reintegro laboral progresivo o definitivo. Incluye: analisis de restricciones previas, pruebas funcionales especificas, plan de reintegro progresivo (Res. 1843/2025 Art. 13), recomendaciones de adaptacion del puesto.' },
  { label: 'Examen Alturas (>1.50m)', svc: 'Examen Alturas', desc: 'Certificacion para trabajo en alturas Res. 4272/2021. Incluye: HC ocupacional, valoracion osteomuscular completa, examen neurologico basico, test vestibular, examen cardiovascular, pruebas de equilibrio y coordinacion, concepto de aptitud para alturas.' },
  { label: 'Visita de Inspeccion SST / Asesoria', svc: 'Visita Inspeccion SST', desc: 'Visita tecnica a instalaciones de la empresa para verificacion de condiciones de trabajo y salud. Incluye: recorrido de inspeccion, levantamiento de matriz de riesgos GTC-45, verificacion de EPP, informe escrito con hallazgos y recomendaciones, plan de mejora.' },
  { label: 'Capacitacion / Charla SST (1h)', svc: 'Capacitacion SST', desc: 'Capacitacion presencial o virtual en SST. Temas: prevencion de riesgos laborales, higiene postural, manejo seguro de cargas, pausas activas, autocuidado, reporte de actos y condiciones inseguras. Incluye material didactico y certificado de asistencia.' },
  { label: 'Examenes Paraclinicos Ocupacionales', svc: 'Examenes Paraclinicos', desc: 'Toma y procesamiento de examenes paraclinicos ocupacionales segun perfil de riesgo: cuadro hematico, perfil lipidico, glicemia, creatinina, BUN, parcial de orina, audiometria tonal, visiometria, espirometria, electrocardiograma, pruebas psicometricas, antigeno prostático, TSH.' }
];

export default function PropuestaEconomicaModal({ company, currentUser, onClose }) {
  const userId = currentUser?.user || 'drcucalon';
  const hoy = new Date().toISOString().split('T')[0];
  const [propuestasGuardadas, setPropuestasGuardadas] = useState(() => { try { return JSON.parse(localStorage.getItem(`siso_propuestas_${userId}`) || '[]'); } catch { return []; } });
  const nextNum = useMemo(() => {
    const nums = propuestasGuardadas.map(p => parseInt(String(p.numero || '').replace(/\D/g, '')) || 0);
    return String(Math.max(0, ...nums) + 1).padStart(3, '0');
  }, [propuestasGuardadas]);

  const [activeTab, setActiveTab] = useState('propuesta');
  const [saving, setSaving] = useState(false);
  const [selSvc, setSelSvc] = useState(''); // Selector de servicios predefinidos (monolito L18562)
  const [form, setForm] = useState({
    numero: `${nextNum}`,
    fecha: hoy,
    validez: '30',
    empresa: company?.nombre || '',
    nit: company?.nit || '',
    numTrabajadores: '',
    contacto: '',
    cargo: '',        // Cambio C: cargoPropuesta → cargo (monolito)
    ciudad: currentUser?.ciudad || 'Popayan',  // Cambio C: ciudadPropuesta → ciudad
    servicios: [{ ...SERVICIO_DEFAULT }],
    observaciones: '',
  });

  const updateField = (campo, valor) => setForm(p => ({ ...p, [campo]: valor }));
  const addServicio = () => setForm(p => ({ ...p, servicios: [...p.servicios, { ...SERVICIO_DEFAULT }] }));
  const removeServicio = (i) => { if (form.servicios.length <= 1) return; const svs = [...form.servicios]; svs.splice(i, 1); setForm(p => ({ ...p, servicios: svs })); };
  const updateServicio = (i, campo, valor) => {
    const svs = [...form.servicios]; svs[i] = { ...svs[i], [campo]: valor };
    if (campo === 'precioUnitario' || campo === 'cantidad') svs[i].subtotal = (Number(svs[i].precioUnitario) || 0) * (Number(svs[i].cantidad) || 0);
    setForm(p => ({ ...p, servicios: svs }));
  };

  // Cambio B: agregar servicio predefinido (monolito L44107)
  const addServicioPredefinido = (svc) => {
    const pre = SERVICIOS_PREDEFINIDOS.find(s => s.label === svc);
    if (!pre) return;
    setForm(p => ({ ...p, servicios: [...p.servicios, { ...SERVICIO_DEFAULT, servicio: pre.svc, descripcion: pre.desc, frecuencia: 'Periodico' }] }));
    setSelSvc('');
  };

  const subtotal = form.servicios.reduce((s, sv) => s + (Number(sv.subtotal) || 0), 0);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  const handleSave = async () => {
    if (!form.empresa) { alert('El nombre de la empresa es obligatorio'); return; }
    setSaving(true);
    try {
      const propuesta = { ...form, subtotal, iva, total, creadoPor: userId, creadoEn: new Date().toISOString() };
      await d1WriteArrayMerge(`siso_propuestas_${userId}`, [propuesta], 'numero');
      const nitClean = (company?.nit || '').replace(/[^0-9]/g, '');
      if (nitClean && nitClean.length >= 3) await d1WriteArrayMerge(`siso_propuestas_${nitClean}`, [propuesta], 'numero').catch(() => {});
      const upd = [propuesta, ...propuestasGuardadas.filter(p => p.numero !== propuesta.numero)];
      localStorage.setItem(`siso_propuestas_${userId}`, JSON.stringify(upd));
      setPropuestasGuardadas(upd);
    } catch (e) { alert('Error al guardar: ' + (e.message || 'desconocido')); }
    finally { setSaving(false); }
  };

  // Cambio A+E: handlePrint idéntico al monolito (header 3 columnas + datos medico completos)
  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=920,height=1150');
    if (!w) { alert('Permita ventanas emergentes para imprimir.'); return; }
    const sf = (v) => (v || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
    const dr = currentUser || {};
    const html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Propuesta ' + sf(form.numero) + ' - ' + sf(form.empresa) + '</title>' +
      '<style>@page{size:letter portrait;margin:12mm 14mm 14mm 14mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}' +
      'body{font-family:Arial,sans-serif;color:#111;font-size:10.5pt;line-height:1.5;max-width:900px;margin:0 auto;padding:20px}' +
      '.header{display:flex;justify-content:space-between;border-bottom:4px solid #0d9488;padding-bottom:14px;margin-bottom:20px}' +
      '.hl{width:32%}.hc{width:34%;text-align:center;border-left:2px solid #99f6e4;border-right:2px solid #99f6e4;padding:0 12px}.hr{width:32%;text-align:right}' +
      '.hn{font-size:10.5pt;font-weight:900;color:#0d9488;text-transform:uppercase;margin:0}.hs{font-size:7.5pt;color:#555;margin:2px 0}' +
      '.hc-h2{font-size:14pt;font-weight:900;color:#0d9488;margin:3px 0;text-transform:uppercase}' +
      '.rw{display:flex;justify-content:space-between;margin-bottom:7px;padding:7px 12px;background:#f0fdfa;border-radius:8px}' +
      '.rwl{font-size:8pt;color:#6b7280;text-transform:uppercase;font-weight:700}.rwv{font-size:9pt;color:#111;font-weight:600}' +
      'table{width:100%;border-collapse:collapse;margin:16px 0;font-size:9pt}th{background:#0d9488;color:#fff;padding:9px 8px;text-align:left;font-weight:700;text-transform:uppercase;font-size:7.5pt}' +
      'td{padding:8px;border-bottom:1px solid #e5e7eb}tr:nth-child(even){background:#f0fdfa}' +
      '.totals{text-align:right;font-size:10pt;margin-top:10px}.totals p{margin:5px 0}' +
      '.totals .total{font-size:15pt;font-weight:900;color:#0d9488;border-top:3px solid #0d9488;padding-top:8px;margin-top:8px}' +
      '.sb{display:flex;justify-content:space-between;margin-top:26mm;border-top:1px solid #d1d5db;padding-top:10mm}' +
      '.sl{text-align:center;width:42%}.st{border-top:2px solid #222;padding-top:5px;font-size:8pt;font-weight:700}' +
      '.ft{text-align:center;font-size:7.5pt;color:#9ca3af;margin-top:14px;border-top:1px solid #e5e7eb;padding-top:10px}' +
      '@media print{body{padding:0!important}}' +
      '</style></head><body>' +
      // BOTON IMPRIMIR
      '<div style="position:fixed;top:10px;right:10px;z-index:9999"><button onclick="window.print()" style="background:#0d9488;color:#fff;border:none;padding:12px 28px;border-radius:12px;font-weight:900;cursor:pointer;font-size:12px;box-shadow:0 4px 16px rgba(0,0,0,.2)">🖨️ Imprimir / Guardar PDF</button></div>' +
      // HEADER (Cambio A: diseño 3 columnas exacto del monolito L44671-44699)
      '<div class="header">' +
      '<div class="hl"><p class="hn">' + sf(dr.nombre || 'MEDICO OCUPACIONAL') + '</p><p class="hs">' + sf(dr.titulo || 'Especialista SST') + '</p><p class="hs">Lic: ' + sf(dr.licencia || '--') + '</p><p class="hs">' + sf(dr.ciudad || '') + ' · ' + sf(dr.email || '') + '</p></div>' +
      '<div class="hc"><h2 class="hc-h2">PROPUESTA ECONOMICA</h2><p class="hs">SALUD OCUPACIONAL</p><p style="font-weight:700;font-size:8pt;color:#0d9488">No. ' + sf(form.numero) + ' · Fecha: ' + sf(form.fecha) + ' · Validez: ' + sf(form.validez || '30') + ' dias</p></div>' +
      '<div class="hr"><p class="hn">' + sf(form.empresa || 'EMPRESA CLIENTE') + '</p><p class="hs">NIT / CC: <b>' + sf(form.nit || '---') + '</b></p><p class="hs">Trabajadores: <b>' + sf(form.numTrabajadores || '---') + '</b></p>' + (form.contacto ? '<p class="hs">Atencion: ' + sf(form.contacto) + (form.cargo ? ' · ' + sf(form.cargo) : '') + '</p>' : '') + '</div>' +
      '</div>' +
      // TABLA DE SERVICIOS
      '<table><thead><tr><th>Servicio</th><th>Descripcion</th><th>Frec.</th><th style="text-align:right">Precio Unit.</th><th style="text-align:right">Cant.</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>' +
      form.servicios.map(s => '<tr><td><b>' + sf(s.servicio || '---') + '</b></td><td>' + sf(s.descripcion || '---') + '</td><td>' + sf(s.frecuencia || '---') + '</td><td style="text-align:right">' + formatCOP(s.precioUnitario) + '</td><td style="text-align:right">' + s.cantidad + '</td><td style="text-align:right"><b>' + formatCOP(s.subtotal) + '</b></td></tr>').join('') +
      '</tbody></table>' +
      // TOTALES
      '<div class="totals"><p>SUB-TOTAL: ' + formatCOP(subtotal) + '</p><p>IVA 19%: ' + formatCOP(iva) + '</p><p class="total">TOTAL: ' + formatCOP(total) + '</p></div>' +
      // CONDICIONES (monolito L44960-44970)
      '<div class="rw"><span class="rwl">Condiciones</span><span class="rwv">Validez de la oferta: ' + sf(form.validez || '30') + ' dias calendario. No incluye examenes paraclinicos. Precios en COP.</span></div>' +
      (form.observaciones ? '<div class="rw"><span class="rwl">Observaciones</span><span class="rwv">' + sf(form.observaciones).replace(/\n/g, '<br>') + '</span></div>' : '') +
      // FIRMAS (monolito L44985-45000)
      '<div class="sb"><div class="sl"><div class="st">Firma del Cliente / Responsable</div><p style="font-size:7pt;color:#6b7280">Nombre: ___________________</p><p style="font-size:7pt;color:#6b7280">CC / NIT: ___________________</p></div><div class="sl"><p style="font-weight:900;color:#0d9488;margin:0 0 2px;font-size:10pt">' + sf(dr.nombre || 'MEDICO OCUPACIONAL') + '</p><div class="st">Medico Especialista SST</div><p style="font-size:7.5pt;color:#555;margin:1px 0">Lic: ' + sf(dr.licencia || '---') + '</p><p style="font-size:7.5pt;color:#555;margin:1px 0">' + sf(form.ciudad || dr.ciudad || 'Popayan') + ', ' + sf(form.fecha || '') + '</p></div></div>' +
      // PIE DE PAGINA (Cambio D)
      '<div class="ft">SISO OcupaSalud Pro · Propuesta No. ' + sf(form.numero) + ' · Documento generado electronicamente · Ley 527/1999 · Validez juridica</div>' +
      '</body></html>';
    w.document.write(html); w.document.close(); w.focus();
  };

  const isHistorialEmpty = propuestasGuardadas.length === 0;

  // ═══ RENDER ═══
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-5 rounded-t-2xl text-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-black">Propuesta Económica</h2>
                <p className="text-xs text-teal-100">{company?.nombre || 'Empresa'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-white/20 text-white rounded-lg text-xs font-black hover:bg-white/30 disabled:opacity-50"><Save className="w-4 h-4"/>{saving ? 'Guardando...' : 'Guardar'}</button>
              <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 bg-white/20 text-white rounded-lg text-xs font-black hover:bg-white/30"><Printer className="w-4 h-4"/> Imprimir</button>
              <button onClick={onClose}><X className="w-5 h-5 text-white/70 hover:text-white"/></button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b flex-shrink-0">
          {[{ id: 'propuesta', label: '💰 Propuesta' }, { id: 'historial', label: '📋 Historial' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 text-xs font-black rounded-t-lg transition ${activeTab === t.id ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'historial' ? (
            isHistorialEmpty ? (
              <div className="text-center py-16 text-gray-400"><FileText size={40} className="mx-auto mb-2 opacity-30"/><p className="text-sm">No hay propuestas guardadas</p></div>
            ) : (
              <div className="space-y-2">
                {propuestasGuardadas.map((p, i) => (
                  <div key={p.numero || i} className="flex items-center justify-between p-3 bg-teal-50 border border-teal-200 rounded-lg">
                    <div><p className="text-xs font-black text-gray-800">{p.numero} · {p.empresa}</p><p className="text-[10px] text-gray-500">{p.fecha} · {p.servicios?.length || 0} servicios · Total: {formatCOP(p.total)}</p></div>
                    <button onClick={() => { setForm(p); setActiveTab('propuesta'); }} className="text-[10px] font-bold text-teal-700 hover:text-teal-900">👁 Ver</button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {/* Formulario */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-700 uppercase border-b pb-1">📋 Datos de la Propuesta</h3>

                <div className="grid grid-cols-3 gap-2">
                  <div><label className="block text-[9px] font-bold text-gray-500 mb-0.5">No. Propuesta</label><input value={form.numero} onChange={e => updateField('numero', e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs"/></div>
                  <div><label className="block text-[9px] font-bold text-gray-500 mb-0.5">Fecha</label><input type="date" value={form.fecha} onChange={e => updateField('fecha', e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs"/></div>
                  <div><label className="block text-[9px] font-bold text-gray-500 mb-0.5">Validez (días)</label><input value={form.validez} onChange={e => updateField('validez', e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs"/></div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-[9px] font-bold text-gray-500 mb-0.5">Empresa *</label><input value={form.empresa} onChange={e => updateField('empresa', e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs"/></div>
                  <div><label className="block text-[9px] font-bold text-gray-500 mb-0.5">NIT</label><input value={form.nit} onChange={e => updateField('nit', e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs"/></div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div><label className="block text-[9px] font-bold text-gray-500 mb-0.5">No. Trabajadores</label><input type="number" value={form.numTrabajadores} onChange={e => updateField('numTrabajadores', e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs"/></div>
                  <div><label className="block text-[9px] font-bold text-gray-500 mb-0.5">Contacto</label><input value={form.contacto} onChange={e => updateField('contacto', e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs" placeholder="Nombre persona"/></div>
                  <div><label className="block text-[9px] font-bold text-gray-500 mb-0.5">Cargo</label><input value={form.cargo} onChange={e => updateField('cargo', e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-xs" placeholder="Ej: Gerente RH"/></div>
                </div>

                {/* Cambio B: Selector de servicios predefinidos (monolito L44107) */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-[9px] font-black text-gray-600 uppercase mb-2">⚡ Agregar servicio predefinido</p>
                  <div className="flex gap-1">
                    <select value={selSvc} onChange={e => setSelSvc(e.target.value)} className="flex-1 p-1.5 border border-gray-200 rounded text-[10px]">
                      <option value="">-- Seleccionar --</option>
                      {SERVICIOS_PREDEFINIDOS.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
                    </select>
                    <button onClick={() => { if (selSvc) addServicioPredefinido(selSvc); }}
                      className="px-3 py-1.5 bg-teal-600 text-white rounded text-[10px] font-black hover:bg-teal-700">Agregar</button>
                  </div>
                </div>

                {/* Servicios manuales */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-gray-700 uppercase">Servicios</h4>
                    <button onClick={addServicio} className="flex items-center gap-1 text-[10px] font-bold text-teal-700 hover:text-teal-900"><Plus className="w-3 h-3"/> Agregar manual</button>
                  </div>
                  {form.servicios.map((s, i) => (
                    <div key={i} className="grid grid-cols-6 gap-1 mb-1.5">
                      <input placeholder="Servicio" value={s.servicio} onChange={e => updateServicio(i, 'servicio', e.target.value)} className="col-span-1 p-1 border border-gray-200 rounded text-[10px]"/>
                      <input placeholder="Descripcion" value={s.descripcion} onChange={e => updateServicio(i, 'descripcion', e.target.value)} className="col-span-2 p-1 border border-gray-200 rounded text-[10px]"/>
                      <select value={s.frecuencia} onChange={e => updateServicio(i, 'frecuencia', e.target.value)} className="p-1 border border-gray-200 rounded text-[10px]">
                        {['Unica','Periodico','Mensual','Bimestral','Trimestral','Semestral','Anual'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <input type="number" placeholder="Precio" value={s.precioUnitario || ''} onChange={e => updateServicio(i, 'precioUnitario', e.target.value)} className="p-1 border border-gray-200 rounded text-[10px]"/>
                      <input type="number" placeholder="Cant." value={s.cantidad || ''} onChange={e => updateServicio(i, 'cantidad', e.target.value)} className="p-1 border border-gray-200 rounded text-[10px]"/>
                      <button onClick={() => removeServicio(i)} className="text-red-400 hover:text-red-600 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  ))}
                </div>

                <div><label className="block text-[9px] font-bold text-gray-500 mb-0.5">Observaciones</label><textarea value={form.observaciones} onChange={e => updateField('observaciones', e.target.value)} rows={2} className="w-full p-1.5 border border-gray-200 rounded text-xs resize-none" placeholder="Condiciones adicionales, notas, etc."/></div>
              </div>

              {/* Vista previa */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm" style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt', color: '#111' }}>
                <h3 className="text-xs font-black text-gray-700 uppercase border-b pb-1 mb-3">👁 Vista Previa</h3>
                {/* Header 3 columnas (Cambio A) */}
                <div style={{ borderBottom: '3px solid #0d9488', paddingBottom: '10px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: '32%' }}>
                    <p style={{ fontSize: '9pt', fontWeight: 900, color: '#0d9488', margin: 0, textTransform: 'uppercase' }}>{currentUser?.nombre || 'MEDICO OCUPACIONAL'}</p>
                    <p style={{ fontSize: '7pt', color: '#555', margin: '1px 0' }}>{currentUser?.titulo || 'Especialista SST'}</p>
                    <p style={{ fontSize: '7pt', color: '#555', margin: '1px 0' }}>Lic: {currentUser?.licencia || '--'}</p>
                    <p style={{ fontSize: '7pt', color: '#555', margin: '1px 0' }}>{currentUser?.ciudad || ''} · {currentUser?.email || ''}</p>
                  </div>
                  <div style={{ width: '34%', textAlign: 'center', borderLeft: '1px solid #99f6e4', borderRight: '1px solid #99f6e4', padding: '0 8px' }}>
                    <p style={{ fontSize: '12pt', fontWeight: 900, color: '#0d9488', margin: '2px 0', textTransform: 'uppercase' }}>PROPUESTA ECONOMICA</p>
                    <p style={{ fontSize: '7pt', color: '#555', margin: '1px 0' }}>SALUD OCUPACIONAL</p>
                    <p style={{ fontWeight: 700, fontSize: '7pt', color: '#0d9488', margin: '2px 0 0' }}>No. {form.numero} · {form.fecha}</p>
                  </div>
                  <div style={{ width: '32%', textAlign: 'right' }}>
                    <p style={{ fontSize: '10pt', fontWeight: 900, color: '#0d9488', margin: 0, textTransform: 'uppercase' }}>{form.empresa || 'EMPRESA CLIENTE'}</p>
                    <p style={{ fontSize: '7.5pt', margin: '2px 0' }}>NIT: <b>{form.nit || '---'}</b></p>
                    <p style={{ fontSize: '7.5pt', margin: '2px 0' }}>Trab: <b>{form.numTrabajadores || '---'}</b></p>
                    {form.contacto && <p style={{ fontSize: '7.5pt', margin: '2px 0' }}>Aten: {form.contacto}{form.cargo ? ' · ' + form.cargo : ''}</p>}
                  </div>
                </div>
                {/* Tabla servicios */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
                  <thead><tr style={{ background: '#0d9488', color: '#fff' }}><th style={{ padding: '4px 6px', textAlign: 'left' }}>Servicio</th><th style={{ padding: '4px 6px', textAlign: 'left' }}>Frec.</th><th style={{ padding: '4px 6px', textAlign: 'right' }}>Precio</th><th style={{ padding: '4px 6px', textAlign: 'right' }}>Cant.</th><th style={{ padding: '4px 6px', textAlign: 'right' }}>Subtotal</th></tr></thead>
                  <tbody>{form.servicios.map((s, i) => <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}><td style={{ padding: '3px 6px' }}><b>{s.servicio || '---'}</b></td><td style={{ padding: '3px 6px' }}>{s.frecuencia || '---'}</td><td style={{ padding: '3px 6px', textAlign: 'right' }}>{formatCOP(s.precioUnitario)}</td><td style={{ padding: '3px 6px', textAlign: 'right' }}>{s.cantidad}</td><td style={{ padding: '3px 6px', textAlign: 'right' }}><b>{formatCOP(s.subtotal)}</b></td></tr>)}</tbody>
                </table>
                <div style={{ textAlign: 'right', fontSize: '9pt', marginTop: '8px' }}>
                  <p style={{ margin: '2px 0' }}>SUB-TOTAL: {formatCOP(subtotal)}</p>
                  <p style={{ margin: '2px 0' }}>IVA 19%: {formatCOP(iva)}</p>
                  <p style={{ margin: '4px 0', fontSize: '13pt', fontWeight: 900, color: '#0d9488', borderTop: '3px solid #0d9488', paddingTop: '4px' }}>TOTAL: {formatCOP(total)}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20mm', borderTop: '1px solid #d1d5db', paddingTop: '8mm' }}>
                  <div style={{ textAlign: 'center', width: '42%' }}>
                    <div style={{ borderTop: '2px solid #222', paddingTop: '3px', fontSize: '7pt', fontWeight: 700 }}>Firma del Cliente / Responsable</div>
                    <p style={{ fontSize: '6pt', color: '#6b7280' }}>Nombre: ___________________</p>
                  </div>
                  <div style={{ textAlign: 'center', width: '42%' }}>
                    <p style={{ fontWeight: 900, color: '#0d9488', margin: '0 0 2px', fontSize: '8pt' }}>{currentUser?.nombre || 'MEDICO OCUPACIONAL'}</p>
                    <div style={{ borderTop: '2px solid #222', paddingTop: '3px', fontSize: '7pt', fontWeight: 700 }}>Medico Especialista SST</div>
                    <p style={{ fontSize: '6.5pt', color: '#555', margin: '1px 0' }}>Lic: {currentUser?.licencia || '---'}</p>
                    <p style={{ fontSize: '6.5pt', color: '#555', margin: '1px 0' }}>{form.ciudad || 'Popayan'}, {form.fecha}</p>
                  </div>
                </div>
                <div style={{ fontSize: '7pt', color: '#9ca3af', marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '6px', textAlign: 'center' }}>
                  SISO OcupaSalud Pro · Propuesta No. {form.numero} · Documento electronico · Ley 527/1999
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}