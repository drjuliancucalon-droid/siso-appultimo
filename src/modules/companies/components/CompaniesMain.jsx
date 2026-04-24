// src/modules/companies/components/CompaniesMain.jsx
// Módulo completo de empresas con tabs: Empresas + Encuestas
import React, { useState, useCallback } from 'react';
import {
  Building2, Plus, Search, X, Save, Upload,
  Users, ClipboardList, Link, Cloud, Loader2,
  CheckCircle, Clock, Trash2, RefreshCw,
} from 'lucide-react';
import { _isAdmin } from '../../../shared/data/planConfig.js';
import { useCompanies } from '../hooks/useCompanies.js';

// ─── Constantes (fuera del componente — no se recrean) ───────────────────────
const EMPRESA_TABS = [
  { id: 'lista',     label: '🏢 Empresas' },
  { id: 'encuestas', label: '📋 Encuestas' },
];

const TIPOS_EXAMEN_ENC = ['INGRESO', 'PERIODICO', 'EGRESO', 'POST_INCAPACIDAD'];

// ─── Componente ──────────────────────────────────────────────────────────────
export const CompaniesMain = ({
  companies = [],
  setCompanies,
  newComp = {},
  setNewComp,
  patientsList = [],
  currentUser,
  _syncCompanies,
  goTo,
  encuestas = [],
  setEncuestas,
  loadingEncuestas = false,
  syncStatus,
  sedeForm,
  setSedeForm,
  showAlert,
  showConfirm,
  editingCompany,
  setEditingCompany,
}) => {
  // ── Tab activo ────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('lista');

  // ── Hook de lógica de empresas ────────────────────────────────────
  const {
    searchTerm, setSearchTerm,
    showModal, setShowModal,
    formatCOP, filteredCompanies, getPatientCount,
    resetForm, handleSaveCompany, handleEditCompany, handleDeleteCompany,
    handleTogglePortal,
    handleCrearEncuesta, newEncuesta, setNewEncuesta,
    logoInputRef,
  } = useCompanies({
    companies, setCompanies, newComp, setNewComp, patientsList, currentUser,
    _syncCompanies, showAlert, showConfirm, sedeForm, setSedeForm,
    encuestas, setEncuestas, editingCompany, setEditingCompany,
  });

  // ── Acciones de encuestas ─────────────────────────────────────────
  const handleCopyLink = useCallback((token) => {
    const url =
      window.location.origin +
      window.location.pathname +
      '#encuesta?token=' + token;
    navigator.clipboard.writeText(url)
      .then(() => showAlert?.('📋 Link copiado!\n\n' + url))
      .catch(() => showAlert?.('🔗 Link: ' + url));
  }, [showAlert]);

  const handleToggleEncuesta = useCallback((enc) => {
    const updated = encuestas.map((e) =>
      e.id === enc.id
        ? { ...e, estado: e.estado === 'activa' ? 'cerrada' : 'activa' }
        : e
    );
    setEncuestas?.(updated);
    showAlert?.(enc.estado === 'activa' ? '🔒 Encuesta cerrada.' : '✅ Encuesta reactivada.');
  }, [encuestas, setEncuestas, showAlert]);

  const handleDeleteEncuesta = useCallback((enc) => {
    showConfirm?.(
      `¿Eliminar la encuesta de "${enc.empresaNombre}"?`,
      () => {
        const updated = encuestas.filter((e) => e.id !== enc.id);
        setEncuestas?.(updated);
        showAlert?.('🗑️ Encuesta eliminada.');
      }
    );
  }, [encuestas, setEncuestas, showAlert, showConfirm]);

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-4 p-4">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <Building2 className="w-6 h-6" /> Empresas
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              {companies.length} empresa{companies.length !== 1 ? 's' : ''} registrada{companies.length !== 1 ? 's' : ''}
              {' · '}{encuestas.length} encuesta{encuestas.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Indicador de sincronización */}
          <div className="flex items-center gap-2">
            {syncStatus === 'saving' && (
              <span className="flex items-center gap-1 text-xs text-purple-200">
                <Loader2 className="w-3 h-3 animate-spin" /> Guardando...
              </span>
            )}
            {syncStatus === 'ok' && (
              <span className="flex items-center gap-1 text-xs text-green-300">
                <Cloud className="w-3 h-3" /> Guardado en nube
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="flex items-center gap-1 text-xs text-amber-300">
                <RefreshCw className="w-3 h-3" /> Solo local
              </span>
            )}

            {_isAdmin(currentUser?.role) && activeTab === 'lista' && (
              <button
                onClick={() => { resetForm(); setShowModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-sm"
              >
                <Plus className="w-4 h-4" /> Nueva Empresa
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {EMPRESA_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === t.id
                ? 'bg-white shadow text-purple-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.id === 'encuestas' && encuestas.length > 0 && (
              <span className="ml-1.5 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {encuestas.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════ TAB: EMPRESAS ════════════════════════ */}
      {activeTab === 'lista' && (
        <>
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
              placeholder="Buscar por nombre, NIT, ciudad..."
            />
          </div>

          {/* Grid de empresas */}
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay empresas registradas.</p>
              {_isAdmin(currentUser?.role) && (
                <button
                  onClick={() => { resetForm(); setShowModal(true); }}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold"
                >
                  + Agregar primera empresa
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompanies.map((comp) => {
                const patCount = getPatientCount(comp);
                const encCount = encuestas.filter((e) => e.empresaId === comp.id).length;
                const venceProximo = comp.convenioVencimiento &&
                  Math.ceil((new Date(comp.convenioVencimiento) - new Date()) / 86400000) <= 30 &&
                  Math.ceil((new Date(comp.convenioVencimiento) - new Date()) / 86400000) >= 0;
                const vencido = comp.convenioVencimiento &&
                  new Date(comp.convenioVencimiento) < new Date();

                return (
                  <div
                    key={comp.id}
                    className={`bg-white border rounded-xl p-5 hover:shadow-lg transition-shadow ${
                      vencido ? 'border-red-200' : venceProximo ? 'border-amber-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-800 text-sm truncate">{comp.nombre}</p>
                        <p className="text-xs text-gray-500">NIT: {comp.nit}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] text-blue-600 font-bold">{patCount} pacientes</span>
                          {encCount > 0 && (
                            <span className="text-[10px] text-purple-600 font-bold">{encCount} encuestas</span>
                          )}
                          {comp.arl && (
                            <span className="text-[10px] text-gray-400">ARL: {comp.arl}</span>
                          )}
                        </div>
                        {(venceProximo || vencido) && (
                          <span className={`text-[10px] font-bold ${vencido ? 'text-red-600' : 'text-amber-600'}`}>
                            {vencido ? '❌ Convenio vencido' : '⚠️ Convenio próximo a vencer'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 flex-wrap">
                      <button
                        onClick={() => handleEditCompany(comp)}
                        className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleTogglePortal(comp)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          comp.portalActivo
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {comp.portalActivo ? '🌐 Portal activo' : '🔒 Portal off'}
                      </button>
                      {comp.tarifaIngreso && (
                        <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold">
                          💰 {formatCOP(comp.tarifaIngreso)}
                        </span>
                      )}
                      {_isAdmin(currentUser?.role) && (
                        <button
                          onClick={() => handleDeleteCompany(comp)}
                          className="ml-auto px-2 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs hover:bg-red-100 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════ TAB: ENCUESTAS ════════════════════════ */}
      {activeTab === 'encuestas' && (
        <div className="space-y-6">

          {/* ── Formulario crear encuesta ── */}
          <div className="bg-white border border-purple-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              Crear Nueva Encuesta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Empresa */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">
                  Empresa *
                </label>
                <select
                  value={newEncuesta.empresaId}
                  onChange={(e) => {
                    const comp = companies.find((c) => c.id === e.target.value);
                    setNewEncuesta((prev) => ({
                      ...prev,
                      empresaId: e.target.value,
                      empresaNombre: comp?.nombre || '',
                    }));
                  }}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400"
                >
                  <option value="">Seleccione empresa...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Tipo examen */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">
                  Tipo Examen
                </label>
                <select
                  value={newEncuesta.tipoExamen}
                  onChange={(e) => setNewEncuesta((p) => ({ ...p, tipoExamen: e.target.value }))}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400"
                >
                  {TIPOS_EXAMEN_ENC.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Fecha límite */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  value={newEncuesta.fechaLimite}
                  onChange={(e) => setNewEncuesta((p) => ({ ...p, fechaLimite: e.target.value }))}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <button
              onClick={handleCrearEncuesta}
              disabled={!newEncuesta.empresaId}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Link className="w-4 h-4" />
              Crear Encuesta y Generar Link
            </button>
          </div>

          {/* ── Lista de encuestas ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-gray-800 flex items-center gap-2">
                📋 Encuestas Creadas
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-black">
                  {encuestas.length}
                </span>
              </h3>

              {/* Indicador de carga Supabase */}
              {loadingEncuestas && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin" /> Cargando de la nube...
                </span>
              )}
              {!loadingEncuestas && encuestas.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <Cloud className="w-3 h-3" /> Sincronizado con Supabase
                </span>
              )}
            </div>

            {encuestas.length === 0 && !loadingEncuestas && (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay encuestas creadas aún.</p>
                <p className="text-xs mt-1">Crea una encuesta arriba para compartirla con trabajadores.</p>
              </div>
            )}

            {loadingEncuestas && encuestas.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
                <p className="text-sm">Cargando encuestas desde Supabase...</p>
              </div>
            )}

            <div className="space-y-3">
              {encuestas.map((enc) => {
                const isActiva = enc.estado === 'activa';
                const respCount = (enc.respuestas || []).length;
                const diasRestantes = enc.fechaLimite
                  ? Math.ceil((new Date(enc.fechaLimite) - new Date()) / 86400000)
                  : null;
                const vencida = diasRestantes !== null && diasRestantes < 0;

                return (
                  <div
                    key={enc.id}
                    className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${
                      !isActiva ? 'opacity-60 border-gray-200' : 'border-purple-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-gray-800 text-sm">{enc.empresaNombre}</p>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isActiva
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isActiva ? '● Activa' : '○ Cerrada'}
                          </span>
                          {respCount > 0 && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {respCount} respuesta{respCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mt-0.5">
                          <strong>{enc.tipoExamen}</strong>
                          {' · '}Creada: {enc.fechaCreacion?.split('T')[0]}
                          {enc.fechaLimite && (
                            <span className={vencida ? ' · ❌ Venció: ' + enc.fechaLimite : ` · ⏰ Límite: ${enc.fechaLimite} (${diasRestantes}d)`}>
                            </span>
                          )}
                        </p>

                        {/* Token */}
                        <p className="text-[10px] font-mono text-gray-400 mt-1">
                          Token: <strong className="text-purple-600">{enc.token}</strong>
                        </p>
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => handleCopyLink(enc.token)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200 transition"
                        >
                          <Link className="w-3 h-3" /> Copiar Link
                        </button>

                        {respCount > 0 && (
                          <button
                            onClick={() => showAlert?.(
                              `📋 ${enc.empresaNombre}\n${enc.tipoExamen}\n\n` +
                              `${respCount} respuesta${respCount !== 1 ? 's' : ''} registrada${respCount !== 1 ? 's' : ''}.\n\n` +
                              (enc.respuestas || []).slice(0, 5).map((r, i) =>
                                `${i + 1}. ${r.nombres || r.nombre || 'Sin nombre'} — ${r.docNumero || r.cedula || ''}`
                              ).join('\n')
                            )}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition"
                          >
                            <Users className="w-3 h-3" /> Respuestas ({respCount})
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleEncuesta(enc)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                            isActiva
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {isActiva ? '🔒 Cerrar' : '✅ Reactivar'}
                        </button>

                        {_isAdmin(currentUser?.role) && (
                          <button
                            onClick={() => handleDeleteEncuesta(enc)}
                            className="px-2.5 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════ MODAL EMPRESA ════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl p-5 text-white flex items-center justify-between sticky top-0">
              <h3 className="font-black text-lg">
                {editingCompany ? `Editar: ${editingCompany.nombre}` : 'Nueva Empresa'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* ── Datos básicos ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 block mb-1">Razón Social *</label>
                  <input
                    type="text"
                    value={newComp.nombre || ''}
                    onChange={(e) => setNewComp((p) => ({ ...p, nombre: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">NIT *</label>
                  <input
                    type="text"
                    value={newComp.nit || ''}
                    onChange={(e) => setNewComp((p) => ({ ...p, nit: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="900.123.456-7"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newComp.telefono || ''}
                    onChange={(e) => setNewComp((p) => ({ ...p, telefono: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    value={newComp.correo || ''}
                    onChange={(e) => setNewComp((p) => ({ ...p, correo: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Dirección</label>
                  <input
                    type="text"
                    value={newComp.direccion || ''}
                    onChange={(e) => setNewComp((p) => ({ ...p, direccion: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={newComp.ciudad || ''}
                    onChange={(e) => setNewComp((p) => ({ ...p, ciudad: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">ARL</label>
                  <select
                    value={newComp.arl || ''}
                    onChange={(e) => setNewComp((p) => ({ ...p, arl: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">Seleccionar ARL</option>
                    {['Sura', 'Positiva', 'Colmena', 'Bolívar', 'Equidad', 'Liberty', 'Alfa', 'Mapfre'].map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Clase de Riesgo</label>
                  <select
                    value={newComp.claseRiesgo || ''}
                    onChange={(e) => setNewComp((p) => ({ ...p, claseRiesgo: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">Seleccionar</option>
                    {['I — Mínimo', 'II — Bajo', 'III — Medio', 'IV — Alto', 'V — Máximo'].map((r) => (
                      <option key={r} value={r.split(' ')[0]}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 block mb-1">Actividad Económica</label>
                  <input
                    type="text"
                    value={newComp.actividadEconomica || ''}
                    onChange={(e) => setNewComp((p) => ({ ...p, actividadEconomica: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                    placeholder="Manufactura, Servicios, Comercio..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 block mb-1">Representante Legal</label>
                  <input
                    type="text"
                    value={newComp.representanteLegal || ''}
                    onChange={(e) => setNewComp((p) => ({ ...p, representanteLegal: e.target.value }))}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* ── Sección Convenio ── */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                  🤝 Convenio y Tarifas
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Inicio Convenio</label>
                    <input
                      type="date"
                      value={newComp.convenioFecha || ''}
                      onChange={(e) => setNewComp((p) => ({ ...p, convenioFecha: e.target.value }))}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Vencimiento</label>
                    <input
                      type="date"
                      value={newComp.convenioVencimiento || ''}
                      onChange={(e) => setNewComp((p) => ({ ...p, convenioVencimiento: e.target.value }))}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  {[
                    { k: 'tarifaIngreso', label: 'Tarifa Ingreso' },
                    { k: 'tarifaPeriodico', label: 'Tarifa Periódico' },
                    { k: 'tarifaEgreso', label: 'Tarifa Egreso' },
                    { k: 'tarifaConsulta', label: 'Tarifa Consulta' },
                  ].map((t) => (
                    <div key={t.k}>
                      <label className="text-xs font-bold text-gray-600 block mb-1">{t.label} (COP)</label>
                      <input
                        type="number"
                        value={newComp[t.k] || ''}
                        onChange={(e) => setNewComp((p) => ({ ...p, [t.k]: e.target.value }))}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                        placeholder="0"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Condición de Pago</label>
                    <select
                      value={newComp.condicionesPago || 'contado'}
                      onChange={(e) => setNewComp((p) => ({ ...p, condicionesPago: e.target.value }))}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="contado">Contado</option>
                      <option value="30">Crédito 30 días</option>
                      <option value="60">Crédito 60 días</option>
                      <option value="90">Crédito 90 días</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Descuento (%)</label>
                    <input
                      type="number"
                      min="0" max="100"
                      value={newComp.descuento || ''}
                      onChange={(e) => setNewComp((p) => ({ ...p, descuento: e.target.value }))}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Botón guardar */}
              <button
                onClick={handleSaveCompany}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
              >
                <Save className="w-4 h-4" />
                {editingCompany ? 'Actualizar Empresa' : 'Guardar Empresa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
