// src/pages/PortafolioPage.jsx — Service portfolio
// GAP-PF02: Migrado localStorage → D1 (2026-07-06)
import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit2, Trash2, DollarSign, Save } from 'lucide-react';
import { d1Get, d1WriteArrayMerge } from '../lib/d1Client';

const STORAGE_KEY = 'siso_portafolio';
const loadLocal = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } };
const saveLocal = (d) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} };
const saveD1 = async (data) => { try { await d1WriteArrayMerge(STORAGE_KEY, data, 'id'); } catch (e) { console.warn('D1 save portafolio error:', e.message); } };

export default function PortafolioPage() {
  const [items, setItems] = useState(loadLocal);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', categoria: 'Exámenes ocupacionales' });
  const [showForm, setShowForm] = useState(false);

  // Cargar desde D1 al montar
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { value } = await d1Get(STORAGE_KEY);
        if (Array.isArray(value) && value.length > 0 && mounted) {
          setItems(value);
          saveLocal(value);
        }
      } catch (e) {
        console.warn('Error cargando portafolio desde D1:', e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Persistir a D1 cuando cambian items
  useEffect(() => {
    if (items.length > 0) { saveLocal(items); saveD1(items); }
  }, [items]);
  const CATS = ['Exámenes ocupacionales', 'Exámenes periódicos', 'SG-SST', 'Capacitaciones', 'Telemedicina', 'Otros'];

  const handleSave = () => {
    if (!form.nombre) { alert('Nombre requerido'); return; }
    const item = { ...form, id: `svc_${Date.now()}` };
    const u = [...items, item]; setItems(u);
    setForm({ nombre: '', descripcion: '', precio: '', categoria: 'Exámenes ocupacionales' }); setShowForm(false);
  };
  const handleDelete = (id) => { if (confirm('¿Eliminar?')) { const u = items.filter((i) => i.id !== id); setItems(u); } };

  const grouped = CATS.map((cat) => ({ cat, items: items.filter((i) => i.categoria === cat) })).filter((g) => g.items.length > 0);
  const totalValor = items.reduce((sum, i) => sum + (parseInt(i.precio) || 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Portafolio de Servicios</h1>
            <p className="text-xs text-gray-500">{items.length} servicios · {CATS.filter(c => items.some(i => i.categoria === c)).length} categorías · Total: ${totalValor.toLocaleString('es-CO')}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold"><Plus className="w-4 h-4" /> Nuevo</button>
      </div>

      {/* P3-06: Resumen por categoría */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {CATS.map(cat => {
            const count = items.filter(i => i.categoria === cat).length;
            if (count === 0) return null;
            const sumCat = items.filter(i => i.categoria === cat).reduce((s, i) => s + (parseInt(i.precio) || 0), 0);
            return (
              <div key={cat} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
                <p className="text-[10px] font-bold text-gray-500 truncate">{cat}</p>
                <p className="text-lg font-black text-emerald-700">{count}</p>
                <p className="text-[9px] text-emerald-500">${sumCat.toLocaleString('es-CO')}</p>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="bg-white border rounded-xl p-5 mb-6 space-y-3 shadow-sm">
          <h3 className="text-sm font-black text-gray-800">Nuevo Servicio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del servicio *" className="border rounded-lg px-3 py-2 text-sm" />
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="border rounded-lg px-3 py-2 text-sm">{CATS.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción..." rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
          <input value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="Precio ($)" className="border rounded-lg px-3 py-2 text-sm w-48" type="number" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">Guardar</button>
          </div>
        </div>
      )}

      {grouped.length === 0 ? <div className="text-center py-12 text-gray-400"><Briefcase className="w-12 h-12 mx-auto mb-2 opacity-40" /><p>No hay servicios registrados</p></div>
      : grouped.map((g) => (
        <div key={g.cat} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-emerald-700 uppercase">{g.cat}</h3>
            <span className="text-[10px] text-gray-500">{g.items.length} servicio(s) · ${g.items.reduce((s,i) => s + (parseInt(i.precio)||0), 0).toLocaleString('es-CO')}</span>
          </div>
          {/* P3-06: Tabla de servicios */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                  <th className="text-left py-2 px-4 font-bold">Servicio</th>
                  <th className="text-left py-2 px-4 font-bold hidden md:table-cell">Descripción</th>
                  <th className="text-right py-2 px-4 font-bold">Precio</th>
                  <th className="text-center py-2 px-4 font-bold w-16">Acción</th>
                </tr>
              </thead>
              <tbody>
                {g.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-gray-800">{item.nombre}</td>
                    <td className="py-2.5 px-4 text-gray-500 hidden md:table-cell">{item.descripcion || '—'}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-600">{item.precio ? `$${parseInt(item.precio).toLocaleString('es-CO')}` : '—'}</td>
                    <td className="py-2.5 px-4 text-center">
                      <button onClick={() => handleDelete(item.id)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
