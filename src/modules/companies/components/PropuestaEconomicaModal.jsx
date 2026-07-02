// src/modules/companies/components/PropuestaEconomicaModal.jsx
// Módulo Propuesta Económica — réplica del monolito (renderPropuestas, L43980-45000)
import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, Printer, Save, CheckCircle, FileText } from 'lucide-react';
import { d1WriteArrayMerge } from '../../../lib/d1Client';

// ─── Helpers ──────────────────────────────────────────────────────────────
const formatCOP = (n) => Number(n || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

const SERVICIO_DEFAULT = { servicio: '', descripcion: '', frecuencia: 'Única', precioUnitario: 0, cantidad: 1, subtotal: 0 };

export default function PropuestaEconomicaModal({ company, currentUser, onClose }) {
  const userId = currentUser?.user || 'drcucalon';
  const hoy = new Date().toISOString().split('T')[0];
  // ── Historial de propuestas guardadas ──────────────────────────────────
  const [propuestasGuardadas, setPropuestasGuardadas] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`siso_propuestas_${userId}`) || '[]'); } catch { return []; }
  });
  const nextNum = useMemo(() => {
    const nums = propuestasGuardadas.map(p => parseInt(String(p.numero || '').replace(/\D/g, '')) || 0);
    const max = Math.max(0, ...nums);
    return String(max + 1).padStart(3, '0');
  }, [propuestasGuardadas]);

  // ── Estado formulario ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('propuesta');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    numero: `PRP-${nextNum}`,
    fecha: hoy,
    validez: '30',
    empresa: company?.nombre || '',
    nit: company?.nit || '',
    numTrabajadores: '',
    contacto: '',
    cargoPropuesta: '',
    ciudadPropuesta: currentUser?.ciudad || 'Popayán',
    servicios: [{ ...SERVICIO_DEFAULT }],
    observaciones: '',
  });

  // ── Handlers ───────────────────────────────────────────────────────────
  const updateField = (campo, valor) => setForm(p => ({ ...p, [campo]: valor }));

  const addServicio = () => setForm(p => ({ ...p, servicios: [...p.servicios, { ...SERVICIO_DEFAULT }] }));

  const removeServicio = (i) => {
    if (form.servicios.length <= 1) return;
    const svs = [...form.servicios]; svs.splice(i, 1);
    setForm(p => ({ ...p, servicios: svs }));
  };

  const updateServicio = (i, campo, valor) => {
    const svs = [...form.servicios];
    svs[i] = { ...svs[i], [campo]: valor };
    // Recalcular subtotal
    if (campo === 'precioUnitario' || campo === 'cantidad') {
      svs[i].subtotal = (Number(svs[i].precioUnitario) || 0) * (Number(svs[i].cantidad) || 0);
    }
    setForm(p => ({ ...p, servicios: svs }));
  };

  // ── Totales ───────────────────────────────────────────────────────────
  const subtotal = form.servicios.reduce((s, sv) => s + (Number(sv.subtotal) || 0), 0);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  // ── Guardar en D1 + localStorage ──────────────────────────────────────
  const handleSave = async () => {
    if (!form.empresa) { alert('El nombre de la empresa es obligatorio'); return; }
    setSaving(true);
    try {
      const propuesta = { ...form, subtotal, iva, total, creadoPor: userId, creadoEn: new Date().toISOString() };
      // Guardar en D1 (mismo mecanismo que siso_saved_bills, siso_cartas_custodia, etc.)
      await d1WriteArrayMerge(`siso_propuestas_${userId}`, [propuesta], 'numero');
      // Guardar en D1 para portal empresa (por NIT)
      const nitClean = (company?.nit || '').replace(/[^0-9]/g, '');
      if (nitClean && nitClean.length >= 3) {
        await d1WriteArrayMerge(`siso_propuestas_${nitClean}`, [propuesta], 'numero').catch(() => {});
      }
      // Cache local (D1 es fuente de verdad)
      const updated = [propuesta, ...propuestasGuardadas.filter(p => p.numero !== propuesta.numero)];
      localStorage.setItem(`siso_propuestas_${userId}`, JSON.stringify(updated));
      setPropuestasGuardadas(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { alert('Error al guardar: ' + (e.message || 'desconocido')); }
    finally { setSaving(false); }
  };

  // ── Imprimir ──────────────────────────────────────────────────────────
  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=920,height=1150');
    if (!w) { alert('Permita ventanas emergentes para imprimir.'); return; }
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Propuesta ${form.numero}</title>
<style>@page{size:letter portrait;margin:1.5cm}*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
body{font-family:Arial,sans-serif;color:#111;font-size:10pt;line-height:1.5;max-width:800px;margin:0 auto;padding:20px}
.header{display:flex;justify-content:space-between;border-bottom:3px solid #d97706;padding-bottom:12px;margin-bottom:18px}
.header h2{font-size:15pt;font-weight:900;color:#d97706;margin:0;text-transform:uppercase}
.header .meta{text-align:right;font-size:8.5pt;color:#6b7280}
.client{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-bottom:16px}
.client p{margin:3px 0;font-size:9.5pt}
.client .name{font-size:12pt;font-weight:900;color:#92400e;margin-bottom:6px}
table{width:100%;border-collapse:collapse;margin:16px 0}
th{background:#d97706;color:#fff;padding:8px;font-size:8.5pt;text-transform:uppercase;text-align:left;font-weight:700}
td{padding:7px 8px;border-bottom:1px solid #e5e7eb;font-size:9pt}
td.right{text-align:right}
.totals{margin-top:12px;text-align:right;font-size:10pt}
.totals p{margin:4px 0}
.totals .total{font-size:14pt;font-weight:900;color:#d97706;border-top:2px solid #d97706;padding-top:6px;margin-top:6px}
.conditions{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:16px 0;font-size:9pt}
.footer{text-align:center;margin-top:40px;padding-top:16px;border-top:1px solid #d1d5db;font-size:8.5pt;color:#6b7280}
.footer .dr{font-weight:900;color:#d97706;font-size:10.5pt;margin:0}
.footer p{margin:2px 0}
@media print{body{padding:0}.no-print{display:none!important}}
button{background:#d97706;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-weight:700;cursor:pointer;font-size:11pt;margin:16px auto;display:block}
</style></head><body>
<button class="no-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
<div class="header">
  <div><h2>PROPUESTA DE SERVICIOS — SALUD OCUPACIONAL</h2><p style="font-size:9pt;color:#6b7280;margin:4px 0 0">Res. 1843/2025 · Dec. 1072/2015</p></div>
  <div class="meta">No. ${form.numero || '—'}<br>Fecha: ${form.fecha || ''}<br>Validez: ${form.validez || '30'} días</div>
</div>
<div class="client">
  <p class="name">${form.empresa || 'EMPRESA CLIENTE'}</p>
  <p>NIT / CC: ${form.nit || '—'} · Trabajadores: ${form.numTrabajadores || '—'}</p>
  ${form.contacto ? `<p>Atención: ${form.contacto}${form.cargoPropuesta ? ' · ' + form.cargoPropuesta : ''}</p>` : ''}
</div>
<table>
<thead><tr><th>Servicio</th><th>Descripción</th><th>Frecuencia</th><th class="right">Precio Unit.</th><th class="right">Cant.</th><th class="right">Subtotal</th></tr></thead>
<tbody>
${form.servicios.map((s,i) => `
<tr><td>${s.servicio || '—'}</td><td>${s.descripcion || '—'}</td><td>${s.frecuencia || '—'}</td><td class="right">${formatCOP(s.precioUnitario)}</td><td class="right">${s.cantidad}</td><td class="right">${formatCOP(s.subtotal)}</td></tr>
`).join('')}
</tbody>
</table>
<div class="totals">
  <p>Subtotal: ${formatCOP(subtotal)}</p>
  <p>IVA (19%): ${formatCOP(iva)}</p>
  <p class="total">TOTAL: ${formatCOP(total)}</p>
</div>
<div class="conditions">
  <p><b>Validez de la oferta:</b> ${form.validez || '30'} días calendario a partir de la fecha de emisión.</p>
  <p><b>Forma de pago:</b> 50% al inicio del contrato, 50% al finalizar (negociable).</p>
  <p><b>Incluye:</b> Evaluaciones médicas ocupacionales conforme a Res. 1843/2025. No incluye exámenes paraclínicos ni desplazamientos fuera de la ciudad.</p>
</div>
${form.observaciones ? `<div class="conditions"><p><b>Observaciones:</b></p><p>${form.observaciones.replace(/\n/g,'<br>')}</p></div>` : ''}
<div class="footer">
  <p class="dr">${currentUser?.nombre || 'MÉDICO OCUPACIONAL'}</p>
  <p>Médico Especialista en Salud Ocupacional · Lic. SST</p>
  <p>${form.ciudadPropuesta || currentUser?.ciudad || 'Popayán'}, ${form.fecha || ''}</p>
  <p>SISO OcupaSalud Pro · Propuesta generada electrónicamente · Ley 527/1999</p>
</div>
<script>setTimeout(()=>window.print(),300)</script></body></html>`;
    w.document.write(html); w.document.close();
  };

  // ═══ RENDER ═══
  const isHistorialEmpty = propuestasGuardadas.length === 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-500 p-5 rounded-t-2xl text-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-black">Propuesta Económica</h2>
                <p className="text-xs text-amber-100">{company?.nombre || 'Empresa'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleSave} disabled={saving}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition ${saved ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'} disabled:opacity-50`}>
                {saved ? <CheckCircle className="w-4 h-4"/> : <Save className="w-4 h-4"/>}
                {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar'}
              </button>
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/20 text-white rounded-lg text-xs font-black hover:bg-white/30 transition">
                <Printer className="w-4 h-4"/> Imprimir
              </button>
              <button onClick={onClose}><X className="w-5 h-5 text-white/70 hover:text-white" /></button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b flex-shrink-0">
          {[{ id: 'propuesta', label: '💰 Propuesta' }, { id: 'historial', label: '📋 Historial' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-xs font-black rounded-t-lg transition ${activeTab === t.id ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'historial' ? (
            isHistorialEmpty ? (
              <div className="text-center py-16 text-gray-400">
                <FileText size={40} className="mx-auto mb-2 opacity-30"/>
                <p className="text-sm">No hay propuestas guardadas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {propuestasGuardadas.map((p, i) => (
                  <div key={p.numero || i} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div>
                      <p className="text-xs font-black text-gray-800">{p.numero} · {p.empresa}</p>
                      <p className="text-[10px] text-gray-500">{p.fecha} · {p.servicios?.length || 0} servicios · Total: {formatCOP(p.total)}</p>
                    </div>
                    <button onClick={() => { setForm(p); setActiveTab('propuesta'); }}
                      className="text-[10px] font-bold text-amber-700 hover:text-amber-900">👁 Ver</button>
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
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 mb-0.5">No. Propuesta</label>
                    <input value={form.numero} onChange={e => updateField('numero', e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 mb-0.5">Fecha</label>
                    <input type="date" value={form.fecha} onChange={e => updateField('fecha', e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 mb-0.5">Validez (días)</label>
                    <input value={form.validez} onChange={e => updateField('validez', e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 mb-0.5">Empresa *</label>
                    <input value={form.empresa} onChange={e => updateField('empresa', e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 mb-0.5">NIT</label>
                    <input value={form.nit} onChange={e => updateField('nit', e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 mb-0.5">No. Trabajadores</label>
                    <input type="number" value={form.numTrabajadores} onChange={e => updateField('numTrabajadores', e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 mb-0.5">Contacto</label>
                    <input value={form.contacto} onChange={e => updateField('contacto', e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs" placeholder="Nombre persona" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 mb-0.5">Cargo</label>
                    <input value={form.cargoPropuesta} onChange={e => updateField('cargoPropuesta', e.target.value)}
                      className="w-full p-1.5 border border-gray-200 rounded text-xs" placeholder="Ej: Gerente RH" />
                  </div>
                </div>

                {/* Servicios */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-gray-700 uppercase">Servicios</h4>
                    <button onClick={addServicio}
                      className="flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-900">
                      <Plus className="w-3 h-3"/> Agregar
                    </button>
                  </div>
                  {form.servicios.map((s, i) => (
                    <div key={i} className="grid grid-cols-6 gap-1 mb-1.5">
                      <input placeholder="Servicio" value={s.servicio} onChange={e => updateServicio(i, 'servicio', e.target.value)}
                        className="col-span-1 p-1 border border-gray-200 rounded text-[10px]" />
                      <input placeholder="Descripción" value={s.descripcion} onChange={e => updateServicio(i, 'descripcion', e.target.value)}
                        className="col-span-2 p-1 border border-gray-200 rounded text-[10px]" />
                      <select value={s.frecuencia} onChange={e => updateServicio(i, 'frecuencia', e.target.value)}
                        className="p-1 border border-gray-200 rounded text-[10px]">
                        {['Única','Mensual','Bimestral','Trimestral','Semestral','Anual'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <input type="number" placeholder="Precio" value={s.precioUnitario || ''} onChange={e => updateServicio(i, 'precioUnitario', e.target.value)}
                        className="p-1 border border-gray-200 rounded text-[10px]" />
                      <input type="number" placeholder="Cant." value={s.cantidad || ''} onChange={e => updateServicio(i, 'cantidad', e.target.value)}
                        className="p-1 border border-gray-200 rounded text-[10px]" />
                      <button onClick={() => removeServicio(i)}
                        className="text-red-400 hover:text-red-600 flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-gray-500 mb-0.5">Observaciones</label>
                  <textarea value={form.observaciones} onChange={e => updateField('observaciones', e.target.value)}
                    rows={3} className="w-full p-1.5 border border-gray-200 rounded text-xs resize-none"
                    placeholder="Condiciones adicionales, notas, etc." />
                </div>
              </div>

              {/* Vista previa */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm" style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt', color: '#111' }}>
                <h3 className="text-xs font-black text-gray-700 uppercase border-b pb-1 mb-3">👁 Vista Previa</h3>
                <div style={{ borderBottom: '3px solid #d97706', paddingBottom: '10px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '13pt', fontWeight: 900, color: '#d97706', margin: 0, textTransform: 'uppercase' }}>PROPUESTA DE SERVICIOS</p>
                    <p style={{ fontSize: '8pt', color: '#6b7280', margin: '2px 0 0' }}>SALUD OCUPACIONAL · Res. 1843/2025</p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '7.5pt', color: '#6b7280' }}>
                    <p style={{ margin: 0 }}>No. {form.numero || '—'}</p>
                    <p style={{ margin: 0 }}>Fecha: {form.fecha || ''}</p>
                    <p style={{ margin: 0 }}>Validez: {form.validez || '30'} días</p>
                  </div>
                </div>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '10px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '11pt', fontWeight: 900, color: '#92400e', margin: '0 0 4px' }}>{form.empresa || 'EMPRESA CLIENTE'}</p>
                  <p style={{ fontSize: '8.5pt', margin: '2px 0', color: '#374151' }}>NIT: {form.nit || '—'} · Trabajadores: {form.numTrabajadores || '—'}</p>
                  {form.contacto && <p style={{ fontSize: '8.5pt', margin: '2px 0', color: '#374151' }}>Atención: {form.contacto}{form.cargoPropuesta ? ' · ' + form.cargoPropuesta : ''}</p>}
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
                  <thead>
                    <tr style={{ background: '#d97706', color: '#fff' }}>
                      <th style={{ padding: '5px 6px', textAlign: 'left', fontWeight: 700 }}>Servicio</th>
                      <th style={{ padding: '5px 6px', textAlign: 'left', fontWeight: 700 }}>Free.</th>
                      <th style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700 }}>Precio</th>
                      <th style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700 }}>Cant.</th>
                      <th style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700 }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.servicios.map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '4px 6px' }}>{s.servicio || '—'}</td>
                        <td style={{ padding: '4px 6px' }}>{s.frecuencia || '—'}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right' }}>{formatCOP(s.precioUnitario)}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right' }}>{s.cantidad}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right' }}>{formatCOP(s.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign: 'right', fontSize: '9pt', marginTop: '8px' }}>
                  <p style={{ margin: '2px 0' }}>Subtotal: {formatCOP(subtotal)}</p>
                  <p style={{ margin: '2px 0' }}>IVA (19%): {formatCOP(iva)}</p>
                  <p style={{ margin: '4px 0', fontSize: '12pt', fontWeight: 900, color: '#d97706', borderTop: '2px solid #d97706', paddingTop: '4px' }}>TOTAL: {formatCOP(total)}</p>
                </div>
                <div style={{ fontSize: '8pt', color: '#6b7280', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '8px', textAlign: 'center' }}>
                  <p style={{ margin: '2px 0', fontWeight: 700, color: '#d97706' }}>{currentUser?.nombre || 'MÉDICO OCUPACIONAL'}</p>
                  <p style={{ margin: '2px 0' }}>Médico Especialista en Salud Ocupacional</p>
                  <p style={{ margin: '2px 0' }}>{form.ciudadPropuesta || 'Popayán'}, {form.fecha || ''}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}