// src/pages/BillingPage.jsx — Billing with tabs: Facturación + Propuestas + DIAN
// Sprint 1.6: Integrates Proposals and DIANExport
import React, { useState, useEffect } from 'react';
import { BillGenerator } from '../modules/billing/components/BillGenerator';
import { Proposals } from '../modules/billing/components/Proposals';
import { DIANExport } from '../modules/billing/components/DIANExport';
import { useBackendData } from '../hooks/useBackendData';
import { useAuthStore } from '../stores/authStore';
import { d1Get, d1WriteArrayMerge, d1Set } from '../lib/d1Client';
import { Receipt, FileText, Upload, Loader2, Cloud, HardDrive } from 'lucide-react';

const TABS = [
  { id: 'facturacion', label: 'Facturación', icon: Receipt },
  { id: 'propuestas', label: 'Propuestas', icon: FileText },
  { id: 'dian', label: 'DIAN', icon: Upload },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('facturacion');
  const currentUser = useAuthStore.getState().currentUser;
  const userId = currentUser?.user || currentUser?.usuario || 'drcucalon';
  const { data: atencionesData, loading: la } = useBackendData('/data/atenciones_cerradas', 'siso_atenciones_cerradas', 'atenciones'); const atencionesCerradas = atencionesData || []; const { data: pacientesData, loading: lp } = useBackendData('/data/patients', 'siso_patients_drcucalon', 'patients'); const patients = pacientesData || []
const { data: companies, loading: lc } = useBackendData('/data/companies', 'siso_companies', 'companies');
  const { data: bills, loading: lb, source } = useBackendData('/data/bills', 'siso_saved_bills', 'bills');

  const loading = lc || lb || la || lp;

  // FIX 2026-07-21 (Sección C): Proposals se renderizaba sin props — onSave era
  // undefined y toda propuesta guardada desde "Facturación → Propuestas" se
  // perdía en silencio (no llegaba a D1, Supabase ni localStorage). Ahora usa
  // el mismo patrón que PropuestaEconomicaModal.jsx (d1WriteArrayMerge por
  // 'numero', clave siso_propuestas_<userId>).
  const proposalsKey = `siso_propuestas_${userId}`;
  const [proposals, setProposals] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { value } = await d1Get(proposalsKey);
        if (!cancelled && Array.isArray(value)) { setProposals(value); return; }
      } catch { /* D1 no disponible */ }
      if (!cancelled) {
        try { setProposals(JSON.parse(localStorage.getItem(proposalsKey) || '[]')); } catch { setProposals([]); }
      }
    })();
    return () => { cancelled = true; };
  }, [proposalsKey]);

  const handleSaveProposal = async (prop) => {
    try { await d1WriteArrayMerge(proposalsKey, [prop], 'numero'); } catch { /* fallback abajo */ }
    setProposals((prev) => {
      const updated = [prop, ...prev.filter((p) => p.numero !== prop.numero)];
      try { localStorage.setItem(proposalsKey, JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleDeleteProposal = async (id) => {
    setProposals((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try { localStorage.setItem(proposalsKey, JSON.stringify(updated)); } catch {}
      d1Set(proposalsKey, updated).catch(() => {});
      return updated;
    });
  };

  const handleChangeStatusProposal = async (id, estado) => {
    const target = proposals.find((p) => p.id === id);
    if (!target) return;
    const updatedProp = { ...target, estado };
    await handleSaveProposal(updatedProp);
  };

  const handlePrintProposal = (prop) => {
    const w = window.open('', '_blank', 'width=900,height=1100');
    if (!w) { alert('Permita ventanas emergentes para imprimir.'); return; }
    const filas = (prop.servicios || [])
      .map((it) => `<tr><td>${it.servicio || ''}</td><td style="text-align:center">${it.cantidad || 0}</td><td style="text-align:right">$${Number(it.precio || 0).toLocaleString('es-CO')}</td><td style="text-align:right">$${((it.cantidad || 0) * (it.precio || 0)).toLocaleString('es-CO')}</td></tr>`)
      .join('');
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${prop.numero || ''} - ${prop.clienteNombre || ''}</title>
      <style>body{font-family:Arial,sans-serif;font-size:12px;color:#111;padding:20px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #ddd;padding:6px}th{background:#f3f4f6;text-align:left}.total{font-weight:bold;text-align:right;font-size:14px}</style></head>
      <body>
      <h2>Propuesta ${prop.numero || ''}</h2>
      <p><strong>Cliente:</strong> ${prop.clienteNombre || ''} ${prop.clienteNit ? '· NIT ' + prop.clienteNit : ''}</p>
      <p><strong>Fecha:</strong> ${prop.fecha || ''} · <strong>Validez:</strong> ${prop.validezDias || ''} días</p>
      <table><thead><tr><th>Servicio</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>${filas}</tbody></table>
      <p class="total">Subtotal: $${Number(prop.subtotal || 0).toLocaleString('es-CO')}<br/>${prop.iva ? 'IVA: $' + Number(prop.iva).toLocaleString('es-CO') + '<br/>' : ''}TOTAL: $${Number(prop.total || 0).toLocaleString('es-CO')}</p>
      ${prop.observaciones ? '<p><strong>Observaciones:</strong> ' + prop.observaciones + '</p>' : ''}
      <script>window.onload = () => window.print();</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Receipt className="w-6 h-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">Facturación</h1>
        </div>
        {!loading && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {source !== 'local' && source !== 'none' ? <Cloud className="w-3 h-3 text-emerald-500" /> : <HardDrive className="w-3 h-3" />}
            <span>{source === 'local' || source === 'none' ? 'Local' : 'Supabase'}</span>
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-100 text-emerald-800 shadow-sm'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'facturacion' && <BillGenerator companies={companies} savedBills={bills} atencionesCerradas={atencionesCerradas} patients={patients} />}
          {activeTab === 'propuestas' && (
            <Proposals
              proposals={proposals}
              onSave={handleSaveProposal}
              onDelete={handleDeleteProposal}
              onChangeStatus={handleChangeStatusProposal}
              onPrint={handlePrintProposal}
              doctorData={currentUser}
            />
          )}
          {activeTab === 'dian' && <DIANExport bills={bills} companies={companies} />}
        </>
      )}
    </div>
  );
}
