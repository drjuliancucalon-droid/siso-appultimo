import React, { useState, useEffect, useRef, useCallback } from "react";
import { AppProvider } from './context/AppContext.jsx';
import PlanesPage from './pages/PlanesPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import VerificationPage from './pages/VerificationPage.jsx';
import PortalTrabajadorPage from './pages/PortalTrabajadorPage.jsx';
import HabeasDataPage from './pages/HabeasDataPage.jsx';
import PerfilIPSPage from './pages/PerfilIPSPage.jsx';
import ReportePage from './pages/ReportePage.jsx';
import CompaniesPage from './pages/CompaniesPage.jsx';
import CajaPage from './pages/CajaPage.jsx';
import AgendaPage from './pages/AgendaPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import BillPage from './pages/BillPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import CertificadoPage from './pages/CertificadoPage.jsx';
import PatientsPage from './pages/PatientsPage.jsx';
import SVEPage from './pages/SVEPage.jsx';
import ARLPage from './pages/ARLPage.jsx';
import TelemedicinaPage from './pages/TelemedicinaPage.jsx';
import TabAdjuntos from './pages/TabAdjuntos.jsx';
import PropuestasPage from './pages/PropuestasPage.jsx';
import TabSolicitudExamenes from './pages/TabSolicitudExamenes.jsx';
import TabIncapacidadGeneral from './pages/TabIncapacidadGeneral.jsx';
import AsistenciaAgendaPage from './pages/AsistenciaAgendaPage.jsx';
import PortafolioPage from './pages/PortafolioPage.jsx';
import CotizacionesInlinePage from './pages/CotizacionesInlinePage.jsx';
import CotizacionesPage from './pages/CotizacionesPage.jsx';
import ContabilidadPage from './pages/ContabilidadPage.jsx';
import SuperAdminPage from './pages/SuperAdminPage.jsx';
import ChangePasswordForm from './pages/ChangePasswordForm.jsx';
import NotificacionModal from './pages/NotificacionModal.jsx';
import PortalEmpresaPage from './pages/PortalEmpresaPage.jsx';
import EvolucionModal from './pages/EvolucionModal.jsx';
import MensajesOverlay from './pages/MensajesOverlay.jsx';
import HistoriaOcupacional from './pages/HistoriaOcupacional.jsx';
import HistoriaGeneral from './pages/HistoriaGeneral.jsx';
import Navbar from './pages/Navbar.jsx';
import {
  User,
  FileText,
  Stethoscope,
  ClipboardList,
  Printer,
  Activity,
  Building2,
  FileCheck,
  AlertCircle,
  Sparkles,
  BrainCircuit,
  Loader2,
  Save,
  History,
  CheckCircle2,
  Trash2,
  Eye,
  LogOut,
  Users,
  BarChart3,
  PlusCircle,
  Search,
  Cloud,
  ShieldCheck,
  UserPlus,
  AlertTriangle,
  Pill,
  GraduationCap,
  Clock,
  ShieldAlert,
  UploadCloud,
  FileSignature,
  Share2,
  Plus,
  HardDrive,
  UserCheck,
  ChevronDown,
  Lock,
  Unlock,
  FileSearch,
  Banknote,
  Receipt,
  Pencil,
  X,
  Heart,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  WifiOff,
  Wifi,
  Shield,
  MessageSquare,
  Download,
  Upload,
} from "lucide-react";
import { _memStore, _ls, _ss, sp, sps } from './utils/storage.js';
import { sanitizeInput, validatePasswordStrength, _auditLog, _rl, SESSION_TIMEOUT_MS, _resetSessionTimer, _clearSessionTimer } from './utils/security.js';
import { _sha256, _pbkdf2Hash, _verifyPassword, _hashSync, _H, _sanitize, _safeLogoUrl, _ipsDocLeftHtml } from './utils/crypto.js';
import { _PROXY_URL, _cfgRaw, _cfgSafeUrl, _cfgSafeKey, _SB_URL, _SB_KEY, _SB_SERVICE_KEY, _SB_HEADERS, _securePost, _SB_KEYS, _SB_KEY_PREFIXES, _sbRl, _rlCheck, _sbSet, _sbGetAll, _sbDelete, _sbQueue, _SB_BUCKET, _validateMimeType, _sbStorageUpload, _sbStorageGetSignedUrl, _sbStorageDelete, _syncState, _sync, _patKey, _patKeyCloud, _compKey, _compKeyCloud } from './utils/supabase.js';
import { PLAN_CONFIG, ORG_DEFAULT_ID, ORG_CONFIG_DEFAULT, _genOrgId, _isAdmin, _isAdminEmpresa, _isEmpresaUser, _isAdminOrEmpresa, _canUse, _contarHC, SECRETARIA_PERMISOS_DEFAULT, MEDICO_SIEMPRE_PUEDE, _secretariaPuede, _secretariaMedicoAsignado } from './data/planConfig.js';
import { ARL_LIST, AFP_LIST, EPS_LIST, CONTRATO_LIST, TURNO_LIST, ETNIA_LIST, SPECIALTIES_LIST } from './data/catalogos.js';
import { MEDICAMENTOS_CO_CUSTOM_KEY, getCustomMeds, addCustomMed, MEDICAMENTOS_CO_BASE, getAllMeds, MEDICAMENTOS_CO } from './data/medicamentos.js';
import { DERIVACIONES_CATALOG } from './data/derivaciones.js';
import { RESTRICCIONES_CATALOG } from './data/restricciones.js';
import { RECOMENDACIONES_CATALOG, DEFAULT_RECOMENDACIONES_SELECTED } from './data/recomendaciones.js';
import { CIE10_OCUPACIONAL, _buscarCIE10 } from './data/cie10.js';
import { CIE11_EQUIVALENCIAS, _equivalenciaCIE11 } from './data/cie11.js';
import { CUPS_OCUPACIONAL, _buscarCUPS } from './data/cups.js';
import { DEFAULT_DOCTOR_DATA, initialOccupPatientState, initialGeneralPatientState, initialUsers, initialCompanyState } from './data/initialStates.js';
import { AI_CONFIG_VERSION, fetchWithTimeout, AI_PROVIDERS, parseAIJSON } from './utils/aiProviders.js';
import { _totpBase32Chars, _totpBase32ToBytes, _totpGenSecret, _totpVerify, _totpGetOtpAuthUrl, _totpGetQRCodeUrl } from './utils/totp.js';
import { _generarHashHC, _generarCodigoQR, _formatFirmaDigital, _generarFHIRPatient, _generarFHIRPractitioner, _generarFHIRObservation, _generarFHIRBundle, validarRIPSPaciente, validarRIPSLote, _generarRIPSJson, _descargarRIPSJson, _generarRDA, _descargarRDA, _generarFacturaDIAN_UBL, _generarPaqueteRetencion, _generarCertificadoHTMLNormalizado } from './utils/normativa.js';
import { numeroALetras, analyzeBP, analyzeHR, analyzeBMI, getSpanishDate, NORMAL_DESCRIPTIONS_SYSTEMS } from './utils/formatters.js';

// [EXTRACTED: utils/security.js]

// [EXTRACTED: utils/storage.js]
// [EXTRACTED: utils/supabase.js - config]
// [EXTRACTED: data/planConfig.js]

// [EXTRACTED: utils/supabase.js - ops]
// [EXTRACTED: utils/crypto.js]
// [EXTRACTED: data/catalogos.js + DEFAULT_DOCTOR_DATA]
// [EXTRACTED: data/medicamentos.js]
// [EXTRACTED: data/derivaciones.js]
// [EXTRACTED: data/restricciones.js]
// ==========================================
// MÓDULO: RESTRICCIONES CHECKLIST PANEL
// ==========================================
const RestriccionesChecklistPanel = ({
  selected,
  onChange,
  onClose,
  onApply,
  isGenerating,
  onGenerate,
}) => {
  const [expandido, setExpandido] = useState({});
  const countSelected = Object.values(selected).filter(Boolean).length;
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    teal: "bg-teal-50 border-teal-200 text-teal-800",
    green: "bg-green-50 border-green-200 text-green-800",
    red: "bg-red-50 border-red-200 text-red-800",
    sky: "bg-sky-50 border-sky-200 text-sky-800",
    violet: "bg-violet-50 border-violet-200 text-violet-800",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    rose: "bg-rose-50 border-rose-200 text-rose-800",
  };
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4"
      onClick={handleBackdrop}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ height: "90vh", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3.5 rounded-t-2xl text-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <h2 className="font-black text-base">
                  Restricciones Médico-Laborales
                </h2>
                <p className="text-xs text-red-100">
                  Seleccione por segmento · GTC-45 / GATISO
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {countSelected > 0 && (
                <span className="bg-white/25 px-3 py-1 rounded-full text-sm font-bold">
                  {countSelected} seleccionadas
                </span>
              )}
              <button onClick={onClose}>
                <X className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
        {/* Lista scrollable */}
        <div
          className="overflow-y-auto p-4 space-y-1.5"
          style={{ flex: "1 1 0", minHeight: 0 }}
        >
          {Object.entries(RESTRICCIONES_CATALOG).map(([catKey, catData]) => {
            const selectedInCat = catData.items.filter(
              (i) => selected[i.id]
            ).length;
            const colors =
              colorMap[catData.color] ||
              "bg-gray-50 border-gray-200 text-gray-800";
            return (
              <div
                key={catKey}
                className={`border rounded-xl overflow-hidden ${
                  selectedInCat > 0 ? "border-red-300" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() =>
                    setExpandido((p) => ({ ...p, [catKey]: !p[catKey] }))
                  }
                  className={`w-full flex justify-between items-center px-4 py-3 text-left font-bold text-sm transition ${colors}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{catData.icon}</span>
                    <span>{catData.label}</span>
                    {selectedInCat > 0 && (
                      <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {selectedInCat}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform flex-shrink-0 ${
                      expandido[catKey] ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {expandido[catKey] && (
                  <div className="px-3 pt-1 pb-2 space-y-1 bg-white">
                    {catData.items.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-start gap-2 px-2 py-2.5 rounded-lg cursor-pointer transition ${
                          selected[item.id]
                            ? "bg-red-50 border border-red-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {selected[item.id] ? (
                            <CheckSquare className="w-4 h-4 text-red-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={!!selected[item.id]}
                          onChange={() =>
                            onChange((p) => ({ ...p, [item.id]: !p[item.id] }))
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-relaxed ${
                              selected[item.id]
                                ? "text-red-800 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {item.texto}
                          </p>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {item.normativa}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Footer siempre visible */}
        <div className="border-t px-5 py-4 flex justify-between items-center flex-shrink-0 bg-gray-50 rounded-b-2xl gap-3">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generar con IA
          </button>
          <button
            onClick={onApply || onClose}
            className="flex items-center gap-2 bg-red-600 text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-red-700 shadow-md"
          >
            <CheckSquare className="w-5 h-5" />
            {countSelected > 0
              ? `✅ Aplicar ${countSelected} restricciones`
              : "✅ Aplicar selección"}
          </button>
        </div>
      </div>
    </div>
  );
};
// [EXTRACTED: data/recomendaciones.js]
// [EXTRACTED: utils/aiProviders.js]
// [EXTRACTED: utils/normativa.js - part 1]
// [EXTRACTED: data/cie11.js]
const CIE11Badge = ({ cie10value }) => {
  if (!cie10value || cie10value.trim().length < 3) return null;
  const eq = _equivalenciaCIE11(cie10value);
  if (!eq) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        background: "#fef9c3",
        border: "1px solid #fbbf24",
        borderRadius: "5px",
        padding: "2px 7px",
        marginTop: "2px",
        fontSize: "9px",
        color: "#78350f",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontWeight: "900", color: "#92400e", flexShrink: 0 }}>
        CIE-11:
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontWeight: "800",
          background: "#fde68a",
          padding: "1px 4px",
          borderRadius: "3px",
          flexShrink: 0,
        }}
      >
        {eq.cie11}
      </span>
      <span style={{ color: "#713f12", flex: 1 }}>{eq.desc}</span>
      <span
        style={{
          fontSize: "8px",
          color: "#b45309",
          fontStyle: "italic",
          flexShrink: 0,
        }}
      >
        Res. 1442/2024
      </span>
    </div>
  );
};
// [EXTRACTED: data/cups.js]
const CUPSInput = ({ value, onChange, placeholder, className }) => {
  const [query, setQuery] = React.useState(value || "");
  const [sugerencias, setSugerencias] = React.useState([]);
  const [abierto, setAbierto] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    setQuery(value || "");
  }, [value]);
  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange && onChange(v);
    if (v.trim().length >= 2) {
      const r = _buscarCUPS(v);
      setSugerencias(r);
      setAbierto(r.length > 0);
    } else {
      setSugerencias([]);
      setAbierto(false);
    }
  };
  const seleccionar = (item) => {
    const completo = item.code + " - " + item.desc;
    setQuery(completo);
    onChange && onChange(completo);
    setSugerencias([]);
    setAbierto(false);
  };
  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <input
        value={query}
        onChange={handleInput}
        onFocus={() => {
          if (sugerencias.length > 0) setAbierto(true);
        }}
        placeholder={
          placeholder || "Buscar CUPS - código o nombre del procedimiento..."
        }
        className={
          className ||
          "w-full p-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-teal-400 outline-none border-gray-300"
        }
        autoComplete="off"
        spellCheck="false"
      />
      {abierto && sugerencias.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "white",
            border: "2px solid #0d9488",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {sugerencias.map((item, ixd) => (
            <div
              key={ixd}
              onMouseDown={(e) => {
                e.preventDefault();
                seleccionar(item);
              }}
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f0fdfa")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              <div style={{ flexShrink: 0, textAlign: "center" }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: "900",
                    color: "#134e4a",
                    fontSize: "10px",
                    background: "#ccfbf1",
                    padding: "2px 5px",
                    borderRadius: "4px",
                    display: "block",
                  }}
                >
                  {item.code}
                </span>
                <span
                  style={{
                    fontSize: "8px",
                    color: "#0d9488",
                    fontWeight: "700",
                    display: "block",
                    marginTop: "1px",
                  }}
                >
                  {item.group}
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "#374151",
                  lineHeight: "1.4",
                  flex: 1,
                }}
              >
                {item.desc}
              </span>
            </div>
          ))}
          <div
            style={{
              padding: "3px 10px",
              background: "#f0fdfa",
              fontSize: "9px",
              color: "#6b7280",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            {sugerencias.length} resultado(s) · CUPS Colombia · Res. 2175/2015
            actualizada · MinSalud
          </div>
        </div>
      )}
    </div>
  );
};
// [EXTRACTED: data/cie10.js]
// Componente CIE10Input: autocomplete en tiempo real al escribir
const CIE10Input = ({ value, onChange, placeholder, className, name }) => {
  const [query, setQuery] = React.useState(value || "");
  const [sugerencias, setSugerencias] = React.useState([]);
  const [abierto, setAbierto] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    setQuery(value || "");
  }, [value]);
  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange && onChange(v);
    if (v.trim().length >= 2) {
      const r = _buscarCIE10(v);
      setSugerencias(r);
      setAbierto(r.length > 0);
    } else {
      setSugerencias([]);
      setAbierto(false);
    }
  };
  const seleccionar = (item) => {
    const completo = item.code + " - " + item.desc;
    setQuery(completo);
    onChange && onChange(completo);
    setSugerencias([]);
    setAbierto(false);
  };
  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <input
        name={name}
        value={query}
        onChange={handleInput}
        onFocus={() => {
          if (sugerencias.length > 0) setAbierto(true);
        }}
        placeholder={placeholder || "Buscar CIE-10 - código o descripción..."}
        className={
          className ||
          "w-full p-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-400 outline-none border-gray-300"
        }
        autoComplete="off"
        spellCheck="false"
      />
      {abierto && sugerencias.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "white",
            border: "2px solid #10b981",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {sugerencias.map((item, idx) => (
            <div
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                seleccionar(item);
              }}
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#ecfdf5")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: "900",
                  color: "#065f46",
                  fontSize: "11px",
                  minWidth: "54px",
                  background: "#d1fae5",
                  padding: "2px 5px",
                  borderRadius: "4px",
                  flexShrink: 0,
                }}
              >
                {item.code}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#374151",
                  lineHeight: "1.4",
                }}
              >
                {item.desc}
              </span>
            </div>
          ))}
          <div
            style={{
              padding: "3px 10px",
              background: "#f0fdf4",
              fontSize: "9px",
              color: "#6b7280",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            {sugerencias.length} resultado(s) · CIE-10 Salud Ocupacional ·
            Decreto 1477/2014 · Res. 1843/2025
          </div>
        </div>
      )}
    </div>
  );
};
// [EXTRACTED: utils/formatters.js]
// [EXTRACTED: data/initialStates.js]
// ==========================================
// MÓDULO 6: COMPONENTES UI REUTILIZABLES
// ==========================================
// ══ B-07: Validador de contraseña centralizado (OWASP A07 + política SISO) ══
const _validarContrasena = (pw) => {
  const errores = [];
  if (!pw || pw.length < 10) errores.push("Mínimo 10 caracteres");
  if (!/[A-Z]/.test(pw)) errores.push("Al menos 1 letra mayúscula");
  if (!/[a-z]/.test(pw)) errores.push("Al menos 1 letra minúscula");
  if (!/[0-9]/.test(pw)) errores.push("Al menos 1 número");
  if (!/[^A-Za-z0-9]/.test(pw))
    errores.push("Al menos 1 carácter especial (!@#$%...)");
  const comunes = [
    "password",
    "contraseña",
    "123456",
    "qwerty",
    "admin",
    "siso",
    "medico",
    "doctor",
    "cucalon",
  ];
  if (comunes.some((c) => pw.toLowerCase().includes(c)))
    errores.push("No usar palabras comunes o el nombre del sistema");
  return {
    valida: errores.length === 0,
    errores,
    fortaleza: Math.max(0, 5 - errores.length),
  };
};
const _FortalezaPass = ({ pw }) => {
  if (!pw) return null;
  const { valida, errores, fortaleza } = _validarContrasena(pw);
  const colores = [
    "bg-red-500",
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-400",
    "bg-emerald-500",
  ];
  const labels = [
    "",
    "Muy débil",
    "Débil",
    "Aceptable",
    "Fuerte",
    "Muy fuerte",
  ];
  return (
    <div className="mt-1">
      <div className="flex gap-0.5 mb-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full ${
              n <= fortaleza ? colores[fortaleza] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p
        className={`text-[10px] font-bold ${
          valida ? "text-emerald-700" : "text-red-600"
        }`}
      >
        {valida ? `✅ ${labels[fortaleza]}` : `⚠️ ${errores[0]}`}
      </p>
    </div>
  );
};
// SEC-F1-06: Content Security Policy via meta tag
const SecurityHeaders = () => (
  <>
    <meta httpEquiv="Content-Security-Policy" content="default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.groq.com https://api.together.xyz https://openrouter.ai https://api.anthropic.com; font-src 'self' https:; frame-ancestors 'none';" />
    <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
    <meta httpEquiv="X-Frame-Options" content="DENY" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
  </>
);
const PrintStyles = () => (
  <style>{`
    /* ═══════════════════════════════════════════════════════
       OCUPASALUD v3 - PRINT STYLES PREMIUM
       Continuidad total · Sin cortes · Colores exactos
    ═══════════════════════════════════════════════════════ */
    @media print {
      @page { size: letter portrait; margin: 1.1cm 1.3cm 1.3cm 1.3cm; }
      /* Colores exactos */
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
      /* Ocultar UI */
      .no-print, nav, button:not(.print-show), input[type="file"], [data-no-print] { display: none !important; }
      /* Ocultar overlays del entorno de desarrollo (CodeSandbox, React DevTools, error overlay) */
      #webpack-dev-server-client-overlay, #webpack-dev-server-client-overlay-div,
      [id*="sandbox"], [class*="sandbox"], [id*="codesandbox"],
      iframe[src*="sandbox"], iframe[src*="csb.app"],
      div[style*="z-index: 2147483647"], div[style*="z-index:2147483647"],
      #__vconsole, .ReactQueryDevtools, #react-query-devtools-btn { display: none !important; }
      /* Body */
      body { background: white !important; margin: 0 !important; padding: 0 !important; font-family: Arial, Helvetica, sans-serif !important; font-size: 8.5pt !important; line-height: 1.4 !important; color: #111 !important; }
      /* Eliminar fondo gris del wrapper que causa aspecto nublado */
      .min-h-screen, .bg-gray-100, main { background: white !important; }
      /* Eliminar sombras y bordes redondeados en impresión */
      .shadow-2xl, .shadow-xl, .shadow-lg, .shadow-md, .shadow-sm, .shadow { box-shadow: none !important; }
      .rounded-2xl, .rounded-xl, .rounded-lg, .rounded-md, .rounded { border-radius: 0 !important; }
      /* Carta: flujo continuo, sin sombra, sin borde */
      .carta-visual { width: 100% !important; max-width: 100% !important; min-height: unset !important; height: auto !important; padding: 0 !important; margin: 0 auto !important; box-shadow: none !important; border-radius: 0 !important; page-break-inside: auto !important; break-inside: auto !important; background: white !important; }
      /* Secciones con fondo: flujo continuo, permitir cortes naturales */
      .bg-emerald-50, .bg-blue-50, .bg-orange-50, .bg-red-50, .bg-teal-50, .bg-yellow-50, .bg-purple-50, .bg-gray-50, .bg-gray-100 { page-break-inside: auto !important; break-inside: auto !important; }
      /* Bloques individuales: no cortar */
      .print-break-avoid, .signature-block, table { page-break-inside: avoid !important; break-inside: avoid !important; }
      tr { page-break-inside: avoid !important; break-inside: avoid !important; }
      /* Títulos no solos al final */
      h1, h2, h3, h4 { page-break-after: avoid !important; break-after: avoid !important; orphans: 3 !important; widows: 3 !important; }
      p { orphans: 3 !important; widows: 3 !important; }
      /* Saltos: solo page-break tiene salto real; section-break fluye continuo */
      .print-page-break { page-break-before: always !important; break-before: page !important; margin-top: 0 !important; padding-top: 0 !important; }
      .print-section-break, .report-section-break { page-break-before: auto !important; break-before: auto !important; margin-top: 4mm !important; padding-top: 0 !important; }
      /* Espaciados compactos */
      .mb-6{margin-bottom:3.5mm!important} .mb-5{margin-bottom:3mm!important} .mb-4{margin-bottom:2.5mm!important} .mb-3{margin-bottom:2mm!important} .mb-2{margin-bottom:1.5mm!important} .mb-1{margin-bottom:1mm!important}
      .mt-10{margin-top:4mm!important} .mt-8{margin-top:3.5mm!important} .mt-6{margin-top:3mm!important} .mt-4{margin-top:2mm!important}
      .gap-6{gap:3.5mm!important} .gap-4{gap:2.5mm!important} .gap-3{gap:2mm!important} .gap-2{gap:1.5mm!important}
      .space-y-4>*+*{margin-top:2.5mm!important} .space-y-3>*+*{margin-top:2mm!important} .space-y-2>*+*{margin-top:1.5mm!important} .space-y-1>*+*{margin-top:1mm!important}
      /* Padding compacto */
      .p-6{padding:3.5mm!important} .p-5{padding:3mm!important} .p-4{padding:2.5mm!important} .p-3{padding:2mm!important} .p-2{padding:1.5mm!important} .p-1{padding:1mm!important}
      .py-4{padding-top:2mm!important;padding-bottom:2mm!important} .py-3{padding-top:1.5mm!important;padding-bottom:1.5mm!important} .py-2{padding-top:1mm!important;padding-bottom:1mm!important}
      .px-4{padding-left:2.5mm!important;padding-right:2.5mm!important} .px-3{padding-left:2mm!important;padding-right:2mm!important} .px-2{padding-left:1.5mm!important;padding-right:1.5mm!important}
      /* Colores de fondo exactos */
      .bg-emerald-50{background-color:#ecfdf5!important} .bg-emerald-100{background-color:#d1fae5!important}
      .bg-emerald-600{background-color:#059669!important;color:white!important} .bg-emerald-700{background-color:#047857!important;color:white!important}
      .bg-blue-50{background-color:#eff6ff!important} .bg-blue-100{background-color:#dbeafe!important}
      .bg-blue-600{background-color:#2563eb!important;color:white!important}
      .bg-gray-50{background-color:#f9fafb!important} .bg-gray-100{background-color:#f3f4f6!important}
      .bg-gray-800{background-color:#1f2937!important;color:white!important}
      .bg-orange-50{background-color:#fff7ed!important} .bg-red-50{background-color:#fef2f2!important}
      .bg-red-100{background-color:#fee2e2!important} .bg-red-600{background-color:#dc2626!important;color:white!important}
      .bg-teal-50{background-color:#f0fdfa!important} .bg-yellow-50{background-color:#fefce8!important}
      .bg-purple-50{background-color:#faf5ff!important} .bg-slate-800{background-color:#1e293b!important;color:white!important}
      .bg-indigo-600{background-color:#4f46e5!important;color:white!important}
      .bg-amber-100{background-color:#fef3c7!important} .bg-green-100{background-color:#dcfce7!important}
      /* Tipografía */
      p, span, td, th, li { font-size: 8.5pt !important; }
      .text-xs{font-size:7pt!important} .text-sm{font-size:8pt!important} .text-base{font-size:9pt!important}
      .text-lg{font-size:10.5pt!important} .text-xl{font-size:12pt!important} .text-2xl{font-size:14pt!important}
      h1{font-size:14pt!important} h2{font-size:11pt!important} h3{font-size:9.5pt!important} h4{font-size:9pt!important}
      /* Firma siempre visible */
      .signature-block { display: flex !important; visibility: visible !important; }
      .hidden { display: none !important; }
      .print\:flex { display: flex !important; }
      .print\:block { display: block !important; }
      .print\:inline { display: inline !important; }
      .print\:inline-block { display: inline-block !important; }
      .print\:hidden { display: none !important; }
      .print\:shadow-none { box-shadow: none !important; }
      .print\:border-black { border-color: #000 !important; }
      .print\:bg-transparent { background-color: transparent !important; }
      .print\:border-gray-300 { border-color: #d1d5db !important; }
      /* Tablas */
      table { width: 100% !important; border-collapse: collapse !important; }
      th, td { padding: 1.5mm 2mm !important; font-size: 8pt !important; }
      /* Inputs transparentes */
      input, select, textarea { border: none !important; border-bottom: 0.5pt solid #888 !important; background: transparent !important; padding: 0 !important; font-size: 8pt !important; font-weight: 600 !important; -webkit-appearance: none !important; box-shadow: none !important; outline: none !important; }
      /* Checkboxes: mantener visible su estado */
      input[type="checkbox"] { -webkit-appearance: checkbox !important; appearance: checkbox !important; border: none !important; border-bottom: none !important; width: 12px !important; height: 12px !important; }
      /* Select: mostrar valor sin flecha */
      select { -webkit-appearance: none !important; border-bottom: 0.5pt solid #888 !important; }
      /* Asegurar que la firma del médico se muestre en impresión */
      .signature-block, .print\\:flex { display: flex !important; visibility: visible !important; }
      .hidden.print\\:flex { display: flex !important; }
      .hidden.print\\:block { display: block !important; }
      /* Textarea: mostrar todo el texto sin recortar */
      textarea, [contenteditable], .text-libre { height: auto !important; max-height: none !important; overflow: visible !important; resize: none !important; white-space: pre-wrap !important; word-wrap: break-word !important; break-inside: avoid !important; page-break-inside: avoid !important; }
      /* Contenedores de texto libre - sin truncar */
      .overflow-y-auto, .overflow-auto, .overflow-hidden { overflow: visible !important; max-height: none !important; }
      /* Ocultar etiquetas "sugerido por IA" y "generado por IA" al imprimir */
      .ai-label-print-hide, [data-ai-label] { display: none !important; }
      /* Reportes IA: ajustar cuadros al contenido, no estirar */
      .bg-amber-50, .bg-emerald-50, .bg-indigo-50, .bg-blue-50 { page-break-inside: avoid !important; break-inside: avoid !important; }
      .whitespace-pre-wrap { white-space: pre-wrap !important; word-wrap: break-word !important; }
      /* Reportes: ocultar botones y etiquetas de IA */
      [class*="BrainCircuit"], .no-print, button { display: none !important; }
      button.print-show { display: inline-flex !important; }
      ::placeholder { color: transparent !important; }
      /* Grid y flex */
      .grid { display: grid !important; }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
      .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
      .flex { display: flex !important; }
      .flex-col { flex-direction: column !important; }
      /* Bordes y sombras */
      .rounded-xl, .rounded-2xl, .rounded-lg { border-radius: 3px !important; }
      .rounded-full { border-radius: 50% !important; }
      .shadow, .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl { box-shadow: none !important; }
    }
    /* Animaciones pantalla */
    @keyframes fade-in { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
    .animate-fade-in { animation: fade-in 0.25s ease-out both; }
    .checklist-item { transition: background 0.1s; }
    /* GLOBAL: Todos los textareas redimensionables y auto-expandibles */
    textarea { resize: vertical !important; min-height: 60px; field-sizing: content; overflow-y: hidden; }
  `}</style>
);
// DoctorSignature: muestra imagen de firma + datos completos del profesional debajo
const DoctorSignature = ({ signature, data, showData = true }) => {
  const doc = data || DEFAULT_DOCTOR_DATA;
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="h-16 w-52 flex items-center justify-center mb-0.5">
        {signature ? (
          <img
            src={signature}
            alt="Firma"
            className="max-h-full max-w-full object-contain drop-shadow-sm"
          />
        ) : (
          <div className="h-14 w-full border-b-2 border-dashed border-gray-400 flex items-end justify-center pb-1">
            <span className="text-[9px] text-gray-300 italic">Firma</span>
          </div>
        )}
      </div>
      {showData && (
        <div className="text-center border-t-2 border-gray-900 pt-1 w-full">
          <p className="font-black text-[10px] uppercase tracking-tight text-gray-900 leading-tight">
            {doc.nombre || "Nombre del Profesional"}
          </p>
          <p className="text-[9px] text-gray-700 font-semibold leading-tight">
            {doc.titulo || "Especialista SST"}
          </p>
          <p className="text-[9px] text-gray-600 leading-tight">
            C.C. {doc.cedula || "--"}
          </p>
          <p className="text-[9px] font-black text-emerald-700 leading-tight">
            RM: {doc.licencia || "--"}
          </p>
          {doc.celular && (
            <p className="text-[9px] text-gray-500 leading-tight">
              Tel: {doc.celular}
            </p>
          )}
          {doc.ciudad && (
            <p className="text-[9px] text-gray-500 leading-tight">
              {doc.ciudad}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
// PERF-02: memo evita re-render cuando signature/data no cambian (se usa en ~15 lugares)
const DoctorSignatureMemo = React.memo(DoctorSignature);
// BrandLogo: logotipo compacto para cabecera de documentos
const BrandLogo = ({ data }) => {
  const doc = data || DEFAULT_DOCTOR_DATA;
  const parts = (doc.nombre || "").trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length > 2 ? 2 : 1][0]}`
      : "DR";
  return (
    <div className="flex items-center space-x-2">
      <div className="h-10 w-10 bg-gradient-to-tr from-emerald-700 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0">
        <div className="flex flex-col items-center leading-none">
          <Stethoscope className="w-3.5 h-3.5 mb-0.5" strokeWidth={2.5} />
          <span className="text-[10px] font-black tracking-tighter">
            {initials}
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-[10px] font-black text-gray-900 uppercase leading-tight whitespace-normal break-words">
          {doc.nombre || "MÉDICO"}
        </p>
        <div className="h-0.5 w-8 bg-gradient-to-r from-emerald-500 to-teal-400 my-0.5 rounded-full" />
        <p className="text-[8px] font-bold text-gray-500 uppercase whitespace-normal break-words">
          {doc.titulo || "Salud Ocupacional"}
        </p>
        <p className="text-[8px] font-bold text-emerald-600 whitespace-normal break-words">
          RM: {doc.licencia || "--"}
        </p>
        {doc.ciudad && (
          <p className="text-[8px] text-gray-400 whitespace-normal break-words">
            {doc.ciudad}
          </p>
        )}
      </div>
    </div>
  );
};
const InputGroup = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  width = "w-full",
  disabled = false,
  alertInfo = null,
  list,
}) => (
  <div className={`mb-2 ${width} px-1.5 print:mb-1`}>
    <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate">
      {label}
      {required && <span className="text-red-500 no-print"> *</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        list={list}
        className={`w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none text-xs ${
          disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
        } print:text-[9px] print:p-0 print:border-none`}
      />
      {alertInfo && (
        <div
          className={`absolute right-0 -top-5 text-[9px] font-bold px-2 py-0.5 rounded-full no-print ${alertInfo.color}`}
        >
          {alertInfo.text}
        </div>
      )}
    </div>
  </div>
);
const SelectGroup = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  width = "w-full",
  disabled = false,
}) => (
  <div className={`mb-2 ${width} px-1.5 print:mb-1`}>
    <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase truncate">
      {label}
      {required && <span className="text-red-500 no-print"> *</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 outline-none text-xs bg-white appearance-none ${
          disabled ? "bg-gray-50 cursor-not-allowed" : ""
        } print:text-[9px] print:p-0 print:border-none`}
      >
        <option value="">Seleccione...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-gray-400 no-print" />
    </div>
  </div>
);
const TextAreaGroup = ({
  label,
  name,
  value,
  onChange,
  rows = 3,
  placeholder = "",
}) => (
  <div className="mb-2 w-full px-1.5 print:mb-1">
    <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">
      {label}
    </label>
    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full p-1.5 border border-gray-200 rounded focus:ring-2 focus:ring-emerald-400 outline-none text-xs print:text-[9px] print:p-0 print:border-none resize-none"
    />
  </div>
);
const SectionTitle = ({ title, icon: Icon, color }) => {
  const c = color || "emerald";
  return (
    <div
      className="print-break-avoid"
      style={{ pageBreakInside: "avoid", pageBreakAfter: "avoid" }}
    >
      <div
        className={`w-full border-b border-${c}-400 mb-2 mt-3 pb-0.5 flex items-center bg-${c}-50 p-1.5 rounded-t print:bg-transparent print:border-gray-400 print:mt-2 print:mb-1 print:p-0`}
      >
        <Icon className={`mr-2 w-4 h-4 text-${c}-600 print:hidden`} />
        <h3
          className={`text-xs font-bold uppercase tracking-wide text-${c}-800 print:text-black`}
        >
          {title}
        </h3>
      </div>
    </div>
  );
};
// ==========================================
// MÓDULO 6B: PLAN GATE - Control de acceso por plan
// Uso: <PlanGate feature="ia_analisis" requiredPlan="pro" currentUser={currentUser}>
//        <contenido restringido />
//      </PlanGate>
// ==========================================
const PlanGate = ({
  feature,
  requiredPlan,
  currentUser,
  children,
  fallback,
  inline,
}) => {
  if (_canUse(feature, currentUser)) return children;
  const plan = PLAN_CONFIG[currentUser?.license || "libre"];
  const req  = PLAN_CONFIG[requiredPlan] || PLAN_CONFIG.starter;
  const isExpired = plan && plan.price > 0 && currentUser?.licenseExpiry
    && new Date(currentUser.licenseExpiry) < new Date();
  if (fallback) return fallback;
  if (inline)
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-black text-amber-700 cursor-default"
        title={isExpired ? "Plan vencido — comunícate con tu administrador" : `Disponible en plan ${req.label}`}
      >
        {isExpired ? "⏰ Plan vencido" : `🔒 ${req.label}`}
      </span>
    );
  if (isExpired) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 text-center space-y-4 shadow-sm">
        <div className="text-5xl">⏰</div>
        <div>
          <p className="font-black text-amber-900 text-lg">¡Tu plan ha vencido!</p>
          <p className="text-amber-700 text-sm mt-1">
            Tu suscripción <strong>{plan.label}</strong> expiró el{" "}
            <strong>{new Date(currentUser.licenseExpiry).toLocaleDateString("es-CO", { day:"numeric", month:"long", year:"numeric" })}</strong>.
            <br/>Tu información está segura. Solo necesitas renovar para continuar.
          </p>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-4 text-left space-y-2 max-w-sm mx-auto">
          <p className="text-xs font-black text-amber-800 uppercase tracking-wide mb-2">💬 Renueva tu plan fácilmente</p>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-base">👨‍⚕️</span>
            <span><strong>Dr. Julián Cucalón</strong> — OcupaSalud</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-base">📱</span>
            <a href="tel:+573182213979" className="font-bold text-amber-700 hover:underline">318 221 3979</a>
            <span className="text-gray-400 text-xs">(llamada o WhatsApp)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-base">📧</span>
            <a href="mailto:dr.juliancucalon@gmail.com" className="font-bold text-amber-700 hover:underline text-xs">dr.juliancucalon@gmail.com</a>
          </div>
          <a href="https://wa.me/573182213979?text=Hola%20Dr.%20Cucal%C3%B3n%2C%20quiero%20renovar%20mi%20plan%20OcupaSalud" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-black transition">
            💬 Escribir por WhatsApp ahora
          </a>
        </div>
        <p className="text-[10px] text-amber-600">Una vez renovado, tu acceso se restablece en segundos ✅</p>
      </div>
    );
  }
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-5 text-center space-y-3">
      <div className="text-3xl">🔒</div>
      <div>
        <p className="font-black text-gray-800 text-sm">Disponible en plan {req.label}</p>
        <p className="text-gray-500 text-xs mt-1">{req.priceLabel} · Desbloquea esta y muchas funciones más</p>
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={() => { if (window._sisoGoTo) window._sisoGoTo("planes"); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition">
          ⬆️ Ver planes y precios
        </button>
        <a href="https://wa.me/573182213979?text=Hola%20Dr.%20Cucal%C3%B3n%2C%20me%20interesa%20el%20plan%20OcupaSalud" target="_blank" rel="noreferrer" className="text-xs text-green-700 font-bold hover:underline">
          💬 Consultar por WhatsApp · 318 221 3979
        </a>
      </div>
    </div>
  );
};

// ==========================================
// MÓDULO 6C: LICENCIAS TAB - componente propio (no IIFE, para cumplir Rules of Hooks)
// Props: usersList, setUsersList, patientsList, currentUser, setCurrentUser,
//        _sync, pendingActivationPlan, setPendingActivationPlan
// ==========================================
const LicenciasTab = ({
  usersList,
  setUsersList,
  patientsList,
  currentUser,
  setCurrentUser,
  _sync,
  pendingActivationPlan,
  setPendingActivationPlan,
}) => {
  // ══ GUARD: solo administrador puede gestionar licencias ══
  if (currentUser?.role !== "administrador") {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 text-center space-y-3">
        <div className="text-4xl">🔒</div>
        <p className="font-black text-red-800 text-lg">Acceso denegado</p>
        <p className="text-red-600 text-sm">
          La gestión de planes y licencias es{" "}
          <strong>exclusiva del administrador</strong>.
        </p>
        <p className="text-red-500 text-xs">
          Si necesitas un cambio de plan, comunícate con el administrador de tu
          cuenta.
        </p>
      </div>
    );
  }

  const [licEditId, setLicEditId] = React.useState(null);
  const [licForm, setLicForm] = React.useState({});
  const [licSaved, setLicSaved] = React.useState(false);
  const [licErrors, setLicErrors] = React.useState([]); // validación método de pago

  const planOrder = ["libre", "starter", "pro", "clinica"];
  const planColors = {
    libre: "gray",
    starter: "teal",
    pro: "blue",
    clinica: "purple",
  };

  // ── Auto-apertura cuando viene de "Activar para usuario" en renderPlanes ──
  React.useEffect(() => {
    if (!pendingActivationPlan) return;
    // Abrir el primer usuario que no sea el admin activo, o el primero de la lista
    const target =
      usersList.find((u) => u.activo !== false && u.user !== "drcucalon") ||
      usersList.find((u) => u.activo !== false);
    if (target) {
      const today = new Date().toISOString().split("T")[0];
      const exp = new Date();
      exp.setMonth(exp.getMonth() + 1);
      setLicEditId(target.id || target.user);
      setLicForm({
        license: pendingActivationPlan,
        licenseStarted: today,
        licenseExpiry: exp.toISOString().split("T")[0],
        monto: PLAN_CONFIG[pendingActivationPlan]?.price || 0,
        formaPago: "Transferencia",
        tipo: "manual",
        notas: "",
      });
    }
  }, [pendingActivationPlan]);

  const openEdit = (u) => {
    setLicEditId(u.id || u.user);
    setLicForm({
      license: u.license || "libre",
      licenseExpiry: u.licenseExpiry || "",
      licenseStarted:
        u.licenseStarted || new Date().toISOString().split("T")[0],
      monto: "",
      formaPago: "Transferencia",
      tipo: "manual",
      notas: "",
    });
    setLicSaved(false);
    if (pendingActivationPlan) setPendingActivationPlan(null); // limpiar luego de abrir
  };

  const saveLic = (u) => {
    // ══ VALIDACIÓN ESTRICTA POR MÉTODO DE PAGO ══
    const errors = [];
    const monto = Number(licForm.monto) || 0;
    const planPrecio = PLAN_CONFIG[licForm.license]?.price || 0;

    if (licForm.license !== "libre") {
      // 1. Planes de pago: monto requerido salvo prueba/cortesía
      if (["manual", "referido"].includes(licForm.tipo)) {
        if (!licForm.monto || monto <= 0)
          errors.push(
            "💰 El monto cobrado es obligatorio para activación manual o referido."
          );
        if (monto < planPrecio * 0.5)
          errors.push(
            `💰 El monto ($${monto.toLocaleString(
              "es-CO"
            )}) parece muy bajo para el plan ${
              PLAN_CONFIG[licForm.license]?.label
            } ($${planPrecio.toLocaleString("es-CO")}/mes). Verifica.`
          );
      }
      // 2. Cortesía: requiere nota de justificación
      if (licForm.tipo === "cortesia") {
        if (!licForm.notas || licForm.notas.trim().length < 10)
          errors.push(
            "📝 Las activaciones por cortesía requieren justificación en las notas (mínimo 10 caracteres)."
          );
      }
      // 3. Transferencia/Nequi/Daviplata: requieren método y monto
      if (
        ["Transferencia", "Nequi", "Daviplata"].includes(licForm.formaPago) &&
        licForm.tipo !== "prueba" &&
        licForm.tipo !== "cortesia"
      ) {
        if (!licForm.monto || monto <= 0)
          errors.push(
            `📲 ${licForm.formaPago}: debes registrar el monto recibido para confirmar el pago.`
          );
      }
      // 4. Fecha de vencimiento requerida para planes de pago
      if (!licForm.licenseExpiry)
        errors.push("📅 Define una fecha de vencimiento para el plan.");
      // 5. Prueba: máx. 30 días
      if (licForm.tipo === "prueba" && licForm.licenseExpiry) {
        const dias = Math.ceil(
          (new Date(licForm.licenseExpiry) - new Date()) / 86400000
        );
        const maxPrueba = PLAN_CONFIG[licForm.license]?.trialDays || 15;
        if (dias > maxPrueba)
          errors.push(
            `⏰ Período de prueba máximo: ${maxPrueba} días. Ajusta la fecha de vencimiento.`
          );
      }
    }

    if (errors.length > 0) {
      setLicErrors(errors);
      return;
    }
    setLicErrors([]);

    const today = new Date().toISOString().split("T")[0];
    const upd = usersList.map((usr) =>
      usr.id === u.id || usr.user === u.user
        ? {
            ...usr,
            license: licForm.license,
            licenseExpiry: licForm.licenseExpiry || null,
            licenseStarted: licForm.licenseStarted || today,
          }
        : usr
    );
    setUsersList(upd);
    _sync("siso_users", JSON.stringify(upd));
    _sbSet("siso_users", upd); // sync inmediato a nube
    if (currentUser?.user === u.user) {
      setCurrentUser((prev) => ({
        ...prev,
        license: licForm.license,
        licenseExpiry: licForm.licenseExpiry || null,
        licenseStarted: licForm.licenseStarted || new Date().toISOString().split("T")[0],
      }));
    }
    setLicSaved(true);
    setPendingActivationPlan(null);
    setTimeout(() => {
      setLicEditId(null);
      setLicSaved(false);
    }, 1400);
  };

  const getDaysLeft = (u) => {
    if (!u.licenseExpiry || u.license === "libre") return null;
    return Math.ceil((new Date(u.licenseExpiry) - new Date()) / 86400000);
  };

  const getStatusBadge = (u) => {
    const plan = PLAN_CONFIG[u.license || "libre"];
    const d = getDaysLeft(u);
    if (!u.license || u.license === "libre")
      return (
        <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          🆓 Libre
        </span>
      );
    if (d !== null && d < 0)
      return (
        <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
          ❌ Vencido
        </span>
      );
    if (d !== null && d <= 7)
      return (
        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          ⏰ Vence en {d}d
        </span>
      );
    const hcU = _contarHC(patientsList, u.user);
    if (plan.maxHC < 9999) {
      const pct = hcU / plan.maxHC;
      if (pct >= 1)
        return (
          <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            🔴 Límite HC
          </span>
        );
      if (pct >= 0.8)
        return (
          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            🟡 80% HC
          </span>
        );
    }
    return (
      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
        ✅ Activo
      </span>
    );
  };

  const activeUsers = usersList.filter((u) => u.activo !== false);
  const ingresos = activeUsers.reduce(
    (s, u) => s + (PLAN_CONFIG[u.license || "libre"]?.price || 0),
    0
  );
  const vencenProx = activeUsers.filter((u) => {
    if (!u.licenseExpiry || !u.license || u.license === "libre") return false;
    const d = Math.ceil((new Date(u.licenseExpiry) - new Date()) / 86400000);
    return d >= 0 && d <= 7;
  });
  const pendingPlan = PLAN_CONFIG[pendingActivationPlan];

  return (
    <div className="space-y-5">
      {/* ── BANNER GUÍA: aparece cuando viene desde "Activar para usuario" ── */}
      {pendingActivationPlan && pendingPlan && (
        <div className="bg-blue-600 text-white rounded-xl px-5 py-4 flex items-start gap-4">
          <div className="text-3xl mt-0.5">🎯</div>
          <div className="flex-1">
            <p className="font-black text-base">
              Activando plan {pendingPlan.label} - {pendingPlan.priceLabel}
            </p>
            <p className="text-blue-100 text-sm mt-1">
              Se ha abierto automáticamente el editor del primer usuario.
              <br />
              <strong>¿Cómo funciona?</strong> Selecciona el usuario, confirma
              las fechas, el monto recibido y haz clic en{" "}
              <em>"💾 Guardar cambios"</em>.
            </p>
            <ol className="text-blue-100 text-xs mt-2 space-y-0.5 list-decimal list-inside">
              <li>
                Verifica que el plan seleccionado sea{" "}
                <strong>{pendingPlan.label}</strong>
              </li>
              <li>
                Ajusta la fecha de vencimiento (por defecto: 1 mes desde hoy)
              </li>
              <li>Ingresa el monto cobrado y la forma de pago</li>
              <li>
                Haz clic en <strong>💾 Guardar cambios</strong>
              </li>
            </ol>
          </div>
          <button
            onClick={() => setPendingActivationPlan(null)}
            className="text-blue-200 hover:text-white text-lg font-black leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── MÉTRICAS ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: "💰",
            label: "Ingresos estimados/mes",
            value: `$${ingresos.toLocaleString("es-CO")} COP`,
            sub: `${
              activeUsers.filter((u) => u.license && u.license !== "libre")
                .length
            } usuarios de pago`,
            bg: "bg-emerald-900",
          },
          {
            icon: "👥",
            label: "Usuarios activos",
            value: `${activeUsers.length} usuarios`,
            sub: `L:${
              activeUsers.filter((u) => !u.license || u.license === "libre")
                .length
            }  S:${
              activeUsers.filter((u) => u.license === "starter").length
            }  P:${activeUsers.filter((u) => u.license === "pro").length}  C:${
              activeUsers.filter((u) => u.license === "clinica").length
            }`,
            bg: "bg-slate-800",
          },
          {
            icon: "⏰",
            label: "Vencen en 7 días",
            value: `${vencenProx.length} usuarios`,
            sub:
              vencenProx.map((u) => u.name || u.user).join(", ") || "Ninguno",
            bg: "bg-amber-800",
          },
        ].map((m) => (
          <div key={m.label} className={`${m.bg} rounded-xl p-4 text-white`}>
            <p className="text-2xl mb-1">{m.icon}</p>
            <p className="text-lg font-black">{m.value}</p>
            <p className="text-xs opacity-70 mt-0.5">{m.label}</p>
            <p className="text-[10px] opacity-50 mt-1 truncate">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* ── TABLA DE USUARIOS ── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <span className="text-sm font-black text-gray-800">
            👥 Usuarios y Planes
          </span>
          <span className="text-xs text-gray-400">
            - Clic en ⚙️ Editar para asignar o cambiar el plan de un usuario
          </span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 font-black text-gray-600">
                Usuario
              </th>
              <th className="text-left px-3 py-2 font-black text-gray-600">
                Plan actual
              </th>
              <th className="text-center px-3 py-2 font-black text-gray-600">
                HC usadas
              </th>
              <th className="text-center px-3 py-2 font-black text-gray-600">
                Vence
              </th>
              <th className="text-center px-3 py-2 font-black text-gray-600">
                Estado
              </th>
              <th className="text-center px-3 py-2 font-black text-gray-600">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.map((u, i) => {
              const plan = PLAN_CONFIG[u.license || "libre"];
              const hcU = _contarHC(patientsList, u.user);
              const dLeft = getDaysLeft(u);
              const isEditing = licEditId === (u.id || u.user);
              const col = planColors[u.license || "libre"];
              return (
                <React.Fragment key={u.user}>
                  <tr
                    className={`border-t border-gray-50 ${
                      isEditing
                        ? "bg-blue-50"
                        : i % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50/30"
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <p className="font-black text-gray-800">
                        {u.name || u.user}
                      </p>
                      <p className="text-gray-400">
                        @{u.user} · {u.role}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`font-black text-${col}-700 bg-${col}-50 px-2 py-0.5 rounded-full text-[11px]`}
                      >
                        {plan.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={
                          plan.maxHC < 9999 && hcU / plan.maxHC >= 0.8
                            ? "font-black text-amber-600"
                            : "text-gray-600"
                        }
                      >
                        {hcU}
                        {plan.maxHC < 9999 ? `/${plan.maxHC}` : ""}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-500 text-[11px]">
                      {u.licenseExpiry && u.license !== "libre" ? (
                        dLeft !== null ? (
                          dLeft < 0 ? (
                            <span className="text-red-500 font-black">
                              Vencido
                            </span>
                          ) : (
                            <span
                              className={
                                dLeft <= 7 ? "text-amber-600 font-black" : ""
                              }
                            >
                              {new Date(u.licenseExpiry).toLocaleDateString(
                                "es-CO"
                              )}
                            </span>
                          )
                        ) : (
                          "-"
                        )
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {getStatusBadge(u)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={() =>
                          isEditing ? setLicEditId(null) : openEdit(u)
                        }
                        className={`text-[11px] font-black px-2 py-1 rounded-lg transition ${
                          isEditing
                            ? "bg-gray-200 text-gray-600"
                            : "text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100"
                        }`}
                      >
                        {isEditing ? "✕ Cerrar" : "⚙️ Editar"}
                      </button>
                    </td>
                  </tr>

                  {/* ── PANEL EDITOR INLINE ── */}
                  {isEditing && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-5 bg-blue-50 border-t border-blue-100"
                      >
                        <p className="text-[10px] font-black text-blue-800 uppercase mb-3">
                          Editando licencia de {u.name || u.user}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {/* Plan */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Plan a activar
                            </label>
                            <select
                              value={licForm.license}
                              onChange={(e) =>
                                setLicForm((p) => ({
                                  ...p,
                                  license: e.target.value,
                                }))
                              }
                              className="w-full p-2 border-2 border-blue-300 rounded-lg text-xs bg-white font-bold focus:outline-none focus:border-blue-500"
                            >
                              {planOrder.map((pk) => (
                                <option key={pk} value={pk}>
                                  {PLAN_CONFIG[pk].label} -{" "}
                                  {PLAN_CONFIG[pk].priceLabel}
                                </option>
                              ))}
                            </select>
                          </div>
                          {/* Fecha inicio */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Fecha de inicio
                            </label>
                            <input
                              type="date"
                              value={licForm.licenseStarted}
                              onChange={(e) =>
                                setLicForm((p) => ({
                                  ...p,
                                  licenseStarted: e.target.value,
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                            />
                          </div>
                          {/* Fecha vencimiento */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Fecha vencimiento
                            </label>
                            <input
                              type="date"
                              value={licForm.licenseExpiry}
                              onChange={(e) =>
                                setLicForm((p) => ({
                                  ...p,
                                  licenseExpiry: e.target.value,
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                            />
                          </div>
                          {/* Tipo */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Tipo de activación
                            </label>
                            <select
                              value={licForm.tipo}
                              onChange={(e) =>
                                setLicForm((p) => ({
                                  ...p,
                                  tipo: e.target.value,
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white"
                            >
                              <option value="manual">
                                Manual (pago verificado)
                              </option>
                              <option value="prueba">Prueba gratuita</option>
                              <option value="referido">Referido</option>
                              <option value="cortesia">Cortesía</option>
                            </select>
                          </div>
                          {/* Monto */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Monto cobrado (COP)
                            </label>
                            <input
                              type="number"
                              value={licForm.monto}
                              onChange={(e) =>
                                setLicForm((p) => ({
                                  ...p,
                                  monto: e.target.value,
                                }))
                              }
                              placeholder={
                                PLAN_CONFIG[licForm.license]?.price || 0
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                            />
                          </div>
                          {/* Forma de pago */}
                          <div>
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Forma de pago
                            </label>
                            <select
                              value={licForm.formaPago}
                              onChange={(e) =>
                                setLicForm((p) => ({
                                  ...p,
                                  formaPago: e.target.value,
                                }))
                              }
                              className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white"
                            >
                              <option>Transferencia</option>
                              <option>Nequi</option>
                              <option>Daviplata</option>
                              <option>Efectivo</option>
                              <option>Cortesía</option>
                            </select>
                          </div>
                          {/* Restricciones por método de pago */}
                          <div className="col-span-2 md:col-span-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <p className="text-[10px] font-black text-blue-800 uppercase mb-2">
                              📋 Restricciones según método de pago y tipo de
                              activación
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {[
                                {
                                  tipo: "Transferencia / Nequi / Daviplata",
                                  rule: "Monto cobrado obligatorio. Se registra para control de ingresos.",
                                },
                                {
                                  tipo: "Efectivo",
                                  rule: "Monto recomendado. Verificar recibo físico.",
                                },
                                {
                                  tipo: "Manual (pago verificado)",
                                  rule: "Requiere monto ≥ 50% del precio del plan.",
                                },
                                {
                                  tipo: "Prueba gratuita",
                                  rule: `Máx. ${
                                    PLAN_CONFIG[licForm.license]?.trialDays ||
                                    15
                                  } días. Monto = $0. Sin restricción de nota.`,
                                },
                                {
                                  tipo: "Referido",
                                  rule: "Requiere monto cobrado. Anota quién refirió en notas.",
                                },
                                {
                                  tipo: "Cortesía",
                                  rule: "Monto = $0 permitido PERO notas con justificación son OBLIGATORIAS (≥10 caracteres).",
                                },
                              ].map((r) => (
                                <div
                                  key={r.tipo}
                                  className={`text-[10px] py-1 ${
                                    licForm.formaPago ===
                                      r.tipo.split(" / ")[0] ||
                                    licForm.tipo ===
                                      r.tipo
                                        .split("(")[0]
                                        .trim()
                                        .toLowerCase()
                                        .replace(" ", "_")
                                      ? "text-blue-800 font-bold"
                                      : "text-blue-600"
                                  }`}
                                >
                                  <span className="font-black">
                                    • {r.tipo}:
                                  </span>{" "}
                                  {r.rule}
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Notas */}
                          <div className="col-span-2 md:col-span-3">
                            <label className="block text-[10px] font-black text-gray-600 mb-1">
                              Notas internas{" "}
                              {licForm.tipo === "cortesia" ? (
                                <span className="text-red-600">
                                  * OBLIGATORIO para cortesía
                                </span>
                              ) : (
                                "(recomendado)"
                              )}
                            </label>
                            <input
                              value={licForm.notas}
                              onChange={(e) => {
                                setLicForm((p) => ({
                                  ...p,
                                  notas: e.target.value,
                                }));
                                setLicErrors([]);
                              }}
                              placeholder={
                                licForm.tipo === "cortesia"
                                  ? "Ej: Cortesía por ser médico fundador del proyecto."
                                  : "Ej: Pago recibido Nequi 300 123 4567 · Referido por Dr. Pérez"
                              }
                              className={`w-full p-2 border rounded-lg text-xs ${
                                licForm.tipo === "cortesia"
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-200"
                              }`}
                            />
                          </div>
                        </div>
                        {/* Errores de validación */}
                        {licErrors.length > 0 && (
                          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 space-y-1">
                            <p className="text-xs font-black text-red-800 mb-1">
                              ⛔ Corrige los siguientes errores antes de
                              guardar:
                            </p>
                            {licErrors.map((e, i) => (
                              <p key={i} className="text-xs text-red-700">
                                • {e}
                              </p>
                            ))}
                          </div>
                        )}
                        {/* Botones de acción */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => {
                              setLicErrors([]);
                              saveLic(u);
                            }}
                            className={`px-5 py-2 rounded-lg text-xs font-black transition ${
                              licSaved
                                ? "bg-emerald-500 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {licSaved ? "✅ ¡Guardado!" : "💾 Guardar cambios"}
                          </button>
                          <button
                            onClick={() => {
                              setLicEditId(null);
                              setPendingActivationPlan(null);
                            }}
                            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition"
                          >
                            Cancelar
                          </button>
                          {licForm.license !== "libre" && (
                            <button
                              onClick={() => {
                                const hoy = new Date();
                                hoy.setDate(
                                  hoy.getDate() +
                                    (PLAN_CONFIG[licForm.license]?.trialDays ||
                                      15)
                                );
                                setLicForm((p) => ({
                                  ...p,
                                  licenseExpiry: hoy
                                    .toISOString()
                                    .split("T")[0],
                                  tipo: "prueba",
                                }));
                              }}
                              className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-200 transition"
                            >
                              🎁 +
                              {PLAN_CONFIG[licForm.license]?.trialDays || 15}d
                              prueba
                            </button>
                          )}
                          {licForm.license !== "libre" && (
                            <button
                              onClick={() => {
                                const hoy = new Date();
                                hoy.setMonth(hoy.getMonth() + 1);
                                setLicForm((p) => ({
                                  ...p,
                                  licenseExpiry: hoy
                                    .toISOString()
                                    .split("T")[0],
                                }));
                              }}
                              className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-200 transition"
                            >
                              +1 mes
                            </button>
                          )}
                          {licForm.license !== "libre" && (
                            <button
                              onClick={() => {
                                const hoy = new Date();
                                hoy.setFullYear(hoy.getFullYear() + 1);
                                setLicForm((p) => ({
                                  ...p,
                                  licenseExpiry: hoy
                                    .toISOString()
                                    .split("T")[0],
                                }));
                              }}
                              className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-200 transition"
                            >
                              +1 año
                            </button>
                          )}
                        </div>
                        {/* Resumen de lo que se va a guardar */}
                        <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200 text-xs text-gray-600 flex flex-wrap gap-4">
                          <span>
                            📋 Plan:{" "}
                            <strong className="text-blue-700">
                              {PLAN_CONFIG[licForm.license]?.label}
                            </strong>
                          </span>
                          <span>
                            📅 Vence:{" "}
                            <strong>
                              {licForm.licenseExpiry || "sin fecha"}
                            </strong>
                          </span>
                          <span>
                            💳 Pago: <strong>{licForm.formaPago}</strong>
                          </span>
                          {licForm.monto > 0 && (
                            <span>
                              💰{" "}
                              <strong>
                                ${Number(licForm.monto).toLocaleString("es-CO")}{" "}
                                COP
                              </strong>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// MÓDULO 7: PANEL DE CONFIGURACIÓN DE IA
// ==========================================
const AIConfigPanel = ({ aiConfig, onSave, onClose }) => {
  const [cfg, setCfg] = useState(() => ({
    ...aiConfig,
    keys: { ...aiConfig.keys },
  }));
  const [testStatus, setTestStatus] = useState({});
  const [showKey, setShowKey] = useState({});
  const [activeGuide, setActiveGuide] = useState(null);
  const PROVIDER_INFO = {
    gemini: {
      label: "Google Gemini",
      sub: "2.0 Flash · 1.5 Flash",
      badge: "🟢 Gratis · Alta calidad",
      badgeClass: "bg-blue-100 text-blue-800",
      link: "https://aistudio.google.com/apikey",
      color: "blue",
      steps: [
        "1️⃣ Haz clic en el botón 'Obtener key →' de abajo",
        "2️⃣ Inicia sesión con tu cuenta de Google (Gmail)",
        "3️⃣ Aparecerá el panel de 'API Keys'. Clic en 'Create API Key'",
        "4️⃣ Selecciona 'Create API key in new project' (es gratis)",
        "5️⃣ Se genera una key que empieza con 'AIza...' → cópiala",
        "6️⃣ Regresa aquí, pégala en el campo y presiona 'Probar'",
        "💡 Tip: Gemini es el más recomendado por calidad y velocidad",
      ],
    },
    groq: {
      label: "Groq",
      sub: "Llama 3.3 70B · Ultra-rápido",
      badge: "🟢 Gratis · Más rápido",
      badgeClass: "bg-green-100 text-green-800",
      link: "https://console.groq.com/keys",
      color: "green",
      steps: [
        "1️⃣ Haz clic en el botón 'Obtener key →' de abajo",
        "2️⃣ Crea cuenta gratis con Google o GitHub (botón 'Sign Up')",
        "3️⃣ Una vez dentro, ya estarás en la sección 'API Keys'",
        "4️⃣ Clic en 'Create API Key' → ponle cualquier nombre → 'Submit'",
        "5️⃣ Copia la key que empieza con 'gsk_...'",
        "6️⃣ Regresa aquí, pégala en el campo y presiona 'Probar'",
        "💡 Tip: Groq es el más rápido pero tiene límite de 30 peticiones/minuto",
      ],
    },
    together: {
      label: "Together AI",
      sub: "Llama 3.3 70B · Muy estable",
      badge: "🟢 Gratis · Sin límite diario",
      badgeClass: "bg-teal-100 text-teal-800",
      link: "https://api.together.ai/settings/api-keys",
      color: "teal",
      steps: [
        "1️⃣ Haz clic en el botón 'Obtener key →' de abajo",
        "2️⃣ Clic en 'Sign Up' o 'Continue with Google' (cuenta gratis)",
        "3️⃣ En el panel, ve a Settings → API Keys (menú izquierdo)",
        "4️⃣ Clic en 'Create new API key' → ponle nombre → crear",
        "5️⃣ Copia la key que aparece (solo se muestra una vez)",
        "6️⃣ Regresa aquí, pégala en el campo y presiona 'Probar'",
        "💡 Tip: Together AI no tiene límite diario. Ideal como respaldo",
      ],
    },
    openrouter: {
      label: "OpenRouter",
      sub: "10 modelos free · Máximo respaldo",
      badge: "🟢 Gratis · Multi-modelo",
      badgeClass: "bg-purple-100 text-purple-800",
      link: "https://openrouter.ai/keys",
      color: "purple",
      steps: [
        "1️⃣ Haz clic en el botón 'Obtener key →' de abajo",
        "2️⃣ Clic en 'Sign in' → usa tu cuenta de Google o GitHub",
        "3️⃣ En el menú superior, clic en 'Keys'",
        "4️⃣ Clic en 'Create Key' → ponle nombre → 'Create'",
        "5️⃣ Copia la key que empieza con 'sk-or-...'",
        "6️⃣ Regresa aquí, pégala en el campo y presiona 'Probar'",
        "💡 Tip: OpenRouter da acceso a múltiples modelos con una sola key",
      ],
    },
  };
  const colorMap = {
    blue: {
      border: "border-blue-400",
      bg: "bg-blue-50",
      text: "text-blue-700",
      btn: "bg-blue-600 hover:bg-blue-700",
      ring: "ring-blue-400",
    },
    green: {
      border: "border-green-400",
      bg: "bg-green-50",
      text: "text-green-700",
      btn: "bg-green-600 hover:bg-green-700",
      ring: "ring-green-400",
    },
    teal: {
      border: "border-teal-400",
      bg: "bg-teal-50",
      text: "text-teal-700",
      btn: "bg-teal-600 hover:bg-teal-700",
      ring: "ring-teal-400",
    },
    purple: {
      border: "border-purple-400",
      bg: "bg-purple-50",
      text: "text-purple-700",
      btn: "bg-purple-600 hover:bg-purple-700",
      ring: "ring-purple-400",
    },
  };
  const testProvider = async (providerKey) => {
    const key = cfg.keys?.[providerKey];
    if (!key || !key.trim()) {
      setTestStatus((p) => ({
        ...p,
        [providerKey]: {
          ok: false,
          msg: "⚠️ Ingrese su API Key primero (ver pasos arriba)",
        },
      }));
      setActiveGuide(providerKey);
      return;
    }
    setTestStatus((p) => ({
      ...p,
      [providerKey]: { ok: null, msg: "⏳ Probando conexión..." },
    }));
    try {
      const provider = AI_PROVIDERS[providerKey];
      const text = await provider.call(
        "Responde SOLO con la palabra: CONECTADO",
        "Eres un asistente. Responde únicamente con la palabra CONECTADO.",
        key.trim()
      );
      const ok = !!text && text.length > 0;
      setTestStatus((p) => ({
        ...p,
        [providerKey]: {
          ok,
          msg: ok
            ? `✅ ¡Funciona! Respuesta: "${text
                .slice(0, 40)
                .replace(/\n/g, " ")}"`
            : "⚠️ Respuesta vacía",
        },
      }));
    } catch (e) {
      const msg = e.message || "";
      let hint = "";
      if (
        msg.includes("401") ||
        msg.includes("403") ||
        msg.includes("invalid") ||
        msg.includes("Invalid") ||
        msg.includes("API Key inválida")
      )
        hint =
          providerKey === "together"
            ? " → Key inválida. En api.together.ai copia SOLO la key del campo texto, NO el código Python."
            : " → Key inválida: renuévala siguiendo los pasos.";
      else if (
        msg.includes("429") ||
        msg.includes("rate") ||
        msg.includes("limit")
      )
        hint = " → Límite de uso alcanzado: crea una key nueva.";
      else if (
        msg.includes("Failed to fetch") ||
        msg.includes("network") ||
        msg.includes("CORS") ||
        msg.includes("CORS bloqueado")
      )
        hint =
          " → CORS bloqueado: Groq no funciona desde este dominio. Usa Gemini u OpenRouter como proveedor principal.";
      else if (msg.includes("404"))
        hint = " → Modelo no disponible, prueba otro proveedor.";
      setTestStatus((p) => ({
        ...p,
        [providerKey]: { ok: false, msg: `❌ ${msg.slice(0, 100)}${hint}` },
      }));
    }
  };
  const anyWorking = Object.values(testStatus).some((s) => s.ok === true);
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-3"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-4 text-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-6 h-6" />
              <div>
                <h2 className="text-base font-black">
                  Configuración de IA - 4 Proveedores Gratuitos
                </h2>
                <p className="text-xs text-indigo-200">
                  Cada uno necesita su propia API Key gratuita (se obtiene en 2
                  min)
                </p>
              </div>
            </div>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-white/70 hover:text-white" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="p-4 space-y-3">
            {/* Estado general */}
            {anyWorking ? (
              <div className="bg-green-50 border border-green-300 rounded-xl p-3 text-xs text-green-800 flex gap-2 items-start">
                <span className="text-base">✅</span>
                <div>
                  <strong>¡Al menos un proveedor funciona!</strong> La IA está
                  operativa. Guarda la configuración para usar los que funcionan
                  como respaldo automático.
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex gap-2 items-start">
                <span className="text-base">⚡</span>
                <div>
                  <strong>
                    Las keys preconfiguradas pueden haber expirado
                  </strong>{" "}
                  (son públicas y se agotan con el uso).
                  <span className="block mt-1">
                    Obtén tu propia key gratuita en cualquier proveedor - toma
                    solo 2 minutos. Haz clic en{" "}
                    <strong>"📋 Cómo obtener"</strong> de cualquier proveedor
                    para ver los pasos.
                  </span>
                </div>
              </div>
            )}
            {/* Selector proveedor activo */}
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide mb-1.5">
                Proveedor principal (los demás son respaldo automático)
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(PROVIDER_INFO).map(([k, info]) => {
                  const st = testStatus[k];
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() =>
                        setCfg((p) => ({ ...p, activeProvider: k }))
                      }
                      className={`flex items-center gap-2 p-2 rounded-xl border-2 text-left transition ${
                        cfg.activeProvider === k
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          cfg.activeProvider === k
                            ? "border-indigo-500 bg-indigo-500"
                            : "border-gray-300"
                        }`}
                      >
                        {cfg.activeProvider === k && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-gray-800">
                          {info.label}
                        </p>
                        <p className="text-[9px] text-gray-500 truncate">
                          {info.sub}
                        </p>
                      </div>
                      {st && (
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            st.ok === true
                              ? "bg-green-500"
                              : st.ok === false
                              ? "bg-red-400"
                              : "bg-yellow-400"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Cards de proveedores */}
            {Object.entries(PROVIDER_INFO).map(([k, info]) => {
              const c = colorMap[info.color];
              const st = testStatus[k];
              const isGuideOpen = activeGuide === k;
              return (
                <div
                  key={k}
                  className={`rounded-xl border-2 overflow-hidden ${
                    cfg.activeProvider === k ? c.border : "border-gray-200"
                  }`}
                >
                  {/* Header de la card */}
                  <div
                    className={`flex justify-between items-center p-2.5 ${
                      cfg.activeProvider === k ? c.bg : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-black text-gray-800">
                        {info.label}
                      </span>
                      <span
                        className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${info.badgeClass}`}
                      >
                        {info.badge}
                      </span>
                      {st?.ok === true && (
                        <span className="ml-1 text-[9px] font-bold text-green-600">
                          ✅ Activa
                        </span>
                      )}
                      {st?.ok === false && (
                        <span className="ml-1 text-[9px] font-bold text-red-600">
                          ❌ Falla
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => setActiveGuide(isGuideOpen ? null : k)}
                        className={`text-[9px] px-2 py-1 rounded-lg font-bold border transition ${
                          isGuideOpen
                            ? c.btn + " text-white"
                            : "border-gray-300 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        📋 {isGuideOpen ? "Ocultar" : "Cómo obtener"}
                      </button>
                      <a
                        href={info.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-[9px] px-2 py-1 rounded-lg font-bold ${c.btn} text-white`}
                      >
                        🔗 Obtener key
                      </a>
                    </div>
                  </div>
                  {/* Guía paso a paso */}
                  {isGuideOpen && (
                    <div className={`p-3 border-t ${c.bg}`}>
                      <p
                        className={`text-[10px] font-black ${c.text} uppercase mb-2`}
                      >
                        Pasos para obtener tu key gratuita:
                      </p>
                      <ol className="space-y-1">
                        {info.steps.map((step, i) => (
                          <li key={i} className="flex gap-2 items-start">
                            <span
                              className={`flex-shrink-0 w-4 h-4 rounded-full ${c.btn} text-white text-[9px] font-black flex items-center justify-center`}
                            >
                              {i + 1}
                            </span>
                            <span className="text-[10px] text-gray-700">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {/* Input de key */}
                  <div className="p-2.5 bg-white">
                    <div className="relative flex gap-1.5">
                      <input
                        type={showKey[k] ? "text" : "password"}
                        placeholder={`Pega aquí tu API Key de ${info.label}...`}
                        value={cfg.keys?.[k] || ""}
                        onChange={(e) =>
                          setCfg((p) => ({
                            ...p,
                            keys: { ...p.keys, [k]: e.target.value },
                          }))
                        }
                        className="flex-1 pr-7 p-1.5 border border-gray-200 rounded-lg text-[10px] font-mono focus:ring-2 focus:ring-indigo-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowKey((p) => ({ ...p, [k]: !p[k] }))
                        }
                        className="absolute right-20 top-1.5 text-gray-400 hover:text-gray-600 text-[10px]"
                      >
                        {showKey[k] ? "🙈" : "👁"}
                      </button>
                      <button
                        type="button"
                        onClick={() => testProvider(k)}
                        className={`flex-shrink-0 text-[10px] px-3 py-1.5 rounded-lg font-black text-white flex items-center gap-1 ${c.btn}`}
                      >
                        <Activity className="w-2.5 h-2.5" /> Probar
                      </button>
                    </div>
                    {st && (
                      <p
                        className={`text-[10px] mt-1.5 font-bold rounded-lg px-2 py-1 leading-tight ${
                          st.ok === null
                            ? "text-blue-700 bg-blue-50"
                            : st.ok
                            ? "text-green-700 bg-green-50"
                            : "text-red-700 bg-red-50"
                        }`}
                      >
                        {st.msg}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Footer fijo */}
        <div className="flex gap-2 p-4 border-t bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="py-2 px-4 border-2 border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave(cfg);
              onClose();
            }}
            className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
// ==========================================
// MÓDULO 9: PANEL DE RECOMENDACIONES CHECKLIST
// ==========================================
const RecomendacionesChecklistPanel = ({
  selected,
  onChange,
  onClose,
  onApply,
  isGenerating,
  onGenerate,
}) => {
  const [expandido, setExpandido] = useState({});
  const countSelected = Object.values(selected).filter(Boolean).length;
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  const colorMap = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    teal: "bg-teal-50 border-teal-200 text-teal-800",
  };
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-5 rounded-t-2xl text-white flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-black">Recomendaciones Médicas</h2>
                <p className="text-xs text-emerald-100">
                  Checklist de Recomendaciones por Categoría
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                {countSelected} seleccionadas
              </span>
              <button onClick={onClose}>
                <X className="w-5 h-5 text-white/70 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {Object.entries(RECOMENDACIONES_CATALOG).map(([catKey, catData]) => {
            const selectedInCat = catData.items.filter(
              (i) => selected[i.id]
            ).length;
            const colors = colorMap[catData.color] || colorMap.emerald;
            return (
              <div
                key={catKey}
                className={`border rounded-xl overflow-hidden ${
                  selectedInCat > 0 ? "border-emerald-300" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() =>
                    setExpandido((p) => ({ ...p, [catKey]: !p[catKey] }))
                  }
                  className={`w-full flex justify-between items-center p-3 text-left font-bold text-sm transition ${colors}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{catData.icon}</span>
                    <span>{catData.label}</span>
                    {selectedInCat > 0 && (
                      <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {selectedInCat}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      expandido[catKey] ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {expandido[catKey] && (
                  <div className="p-2 space-y-1 bg-white">
                    {catData.items.map((item) => (
                      <label
                        key={item.id}
                        className={`checklist-item flex items-start gap-2 p-2 rounded-lg cursor-pointer transition ${
                          selected[item.id]
                            ? "bg-emerald-50 border border-emerald-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {selected[item.id] ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={!!selected[item.id]}
                          onChange={() =>
                            onChange((p) => ({ ...p, [item.id]: !p[item.id] }))
                          }
                        />
                        <p
                          className={`text-xs leading-relaxed ${
                            selected[item.id]
                              ? "text-emerald-800 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {item.texto}
                        </p>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="border-t p-4 flex justify-between items-center flex-shrink-0 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Generar con IA
          </button>
          <button
            onClick={onApply || onClose}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700"
          >
            ✅ Aplicar {countSelected} Recomendaciones
          </button>
        </div>
      </div>
    </div>
  );
};
// ==========================================
// MÓDULO: FÓRMULA MÉDICA Y DERIVACIONES
// ==========================================
const MedicamentoAutocomplete = ({
  value,
  onChange,
  placeholder,
  onSelectMed,
}) => {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const [customMeds, setCustomMeds] = useState(() => getCustomMeds());
  const ref = useRef(null);
  const allMeds = [...MEDICAMENTOS_CO_BASE, ...customMeds];
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const res = [];
    allMeds.forEach((med) => {
      if (med.g.toLowerCase().includes(q))
        res.push({
          label: med.g,
          sub: `${med.cat} · ${med.dosis}`,
          full: med.g,
          dosis: med.dosis,
          presentaciones: med.p,
          isGeneric: true,
        });
      med.p.forEach((p) => {
        if (p.toLowerCase().includes(q))
          res.push({
            label: p,
            sub: `${med.g} · ${med.cat}`,
            full: p,
            dosis: med.dosis,
            presentaciones: med.p,
            isGeneric: false,
          });
      });
    });
    setSuggestions(res.slice(0, 10));
    setShow(true);
  }, [query, customMeds]);
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const handleAddCustom = () => {
    if (!query.trim() || query.length < 3) return;
    const exists = allMeds.some(
      (m) =>
        m.g.toLowerCase() === query.toLowerCase() ||
        m.p.some((p) => p.toLowerCase() === query.toLowerCase())
    );
    if (!exists) {
      const newEntry = {
        g: query.trim(),
        p: [query.trim()],
        cat: "Personalizado",
        dosis: "Según prescripción",
      };
      addCustomMed(newEntry);
      setCustomMeds((prev) => [...prev, newEntry]);
    }
    onChange(query.trim());
    if (onSelectMed)
      onSelectMed({
        label: query.trim(),
        dosis: "",
        presentaciones: [query.trim()],
      });
    setSuggestions([]);
    setShow(false);
  };
  return (
    <div className="relative" ref={ref}>
      <div className="flex gap-1">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => query.length >= 2 && setShow(true)}
          placeholder={placeholder || "Nombre genérico o comercial..."}
          className="flex-1 p-1.5 border border-gray-200 rounded-l text-xs focus:ring-2 focus:ring-emerald-400 outline-none"
        />
        <button
          type="button"
          onClick={handleAddCustom}
          title="Agregar como medicamento personalizado"
          className="px-2 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-r text-xs font-bold hover:bg-emerald-200 flex items-center gap-0.5"
        >
          <Plus className="w-3 h-3" /> Añadir
        </button>
      </div>
      {show && suggestions.length > 0 && (
        <div className="absolute z-50 bg-white border border-emerald-200 rounded-xl shadow-xl mt-1 w-full max-h-52 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(s.label);
                onChange(s.label);
                if (onSelectMed) onSelectMed(s);
                setSuggestions([]);
                setShow(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 border-b border-gray-50 last:border-none"
            >
              <div className="flex items-center gap-1.5">
                <Pill className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <p className="text-xs font-bold text-emerald-900">{s.label}</p>
                {s.isGeneric && (
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded">
                    Genérico
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 ml-5">{s.sub}</p>
            </button>
          ))}
          {suggestions.length === 0 && query.length >= 2 && (
            <div className="px-3 py-2 text-[10px] text-gray-400 italic">
              No encontrado -- pulse "Añadir" para agregarlo a su base de datos
            </div>
          )}
        </div>
      )}
      {show && suggestions.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 bg-white border border-emerald-200 rounded-xl shadow-xl mt-1 w-full">
          <div className="px-3 py-2 text-[10px] text-gray-400 italic flex items-center gap-2">
            <AlertCircle className="w-3 h-3" />
            No encontrado en base de datos -- pulse "Añadir" para guardarlo.
          </div>
        </div>
      )}
    </div>
  );
};
const TabFormulaDerivacion = ({
  data,
  setData,
  activeDoctorData,
  activeSignature,
  forceTab,
}) => {
  const [activeSubTab, setActiveSubTab] = React.useState(forceTab || "formula");
  // When forceTab changes (switching between separate tabs), update active sub-tab
  React.useEffect(() => {
    if (forceTab) setActiveSubTab(forceTab);
  }, [forceTab]);
  const [newMed, setNewMed] = React.useState({
    nombre: "",
    presentacion: "",
    dosis: "",
    frecuencia: "",
    duracion: "",
    indicaciones: "",
  });
  const [newDeriv, setNewDeriv] = React.useState({
    especialidad: "",
    motivo: "",
    urgencia: "Electiva",
    observaciones: "",
  });
  const [derivSearch, setDerivSearch] = React.useState("");
  const [showDerivSugg, setShowDerivSugg] = React.useState(false);
  const derivRef = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => {
      if (derivRef.current && !derivRef.current.contains(e.target))
        setShowDerivSugg(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const addMedicamento = () => {
    if (!newMed.nombre) return;
    setData((p) => ({
      ...p,
      formulaMedicamentos: [
        ...(p.formulaMedicamentos || []),
        { ...newMed, id: Date.now() },
      ],
    }));
    setNewMed({
      nombre: "",
      presentacion: "",
      dosis: "",
      frecuencia: "",
      duracion: "",
      indicaciones: "",
    });
  };
  const removeMed = (id) =>
    setData((p) => ({
      ...p,
      formulaMedicamentos: (p.formulaMedicamentos || []).filter(
        (m) => m.id !== id
      ),
    }));
  const addDerivacion = () => {
    if (!newDeriv.especialidad) return;
    setData((p) => ({
      ...p,
      derivaciones: [
        ...(p.derivaciones || []),
        { ...newDeriv, id: Date.now() },
      ],
    }));
    setNewDeriv({
      especialidad: "",
      motivo: "",
      urgencia: "Electiva",
      observaciones: "",
    });
    setDerivSearch("");
  };
  const removeDerivacion = (id) =>
    setData((p) => ({
      ...p,
      derivaciones: (p.derivaciones || []).filter((d) => d.id !== id),
    }));
  const filteredDeriv =
    derivSearch.length >= 1
      ? DERIVACIONES_CATALOG.filter(
          (d) =>
            d.esp.toLowerCase().includes(derivSearch.toLowerCase()) ||
            d.motivo.toLowerCase().includes(derivSearch.toLowerCase())
        ).slice(0, 15)
      : [];
  const today = new Date().toISOString().split("T")[0];
  // ── Genera ventana de impresión premium con HTML nativo ──────────────────
  // No captura innerHTML (pierde íconos). Genera HTML directamente del state.
  const buildPrintHeader = (titleDoc, accentColor) => {
    const fechaDoc =
      data.fechaExamen ||
      data.fechaConsulta ||
      new Date().toLocaleDateString("es-CO");
    // FIX M-04: sanitizar TODOS los campos de usuario para document.write
    const docName = _sanitize(activeDoctorData?.nombre || "");
    const docTitulo = _sanitize(activeDoctorData?.titulo || "");
    const docLic = _sanitize(activeDoctorData?.licencia || "");
    const docCiudad = _sanitize(activeDoctorData?.ciudad || "");
    const docCel = _sanitize(activeDoctorData?.celular || "");
    const docEmail = _sanitize(activeDoctorData?.email || "");
    const pNombre = _sanitize(data.nombres || "---");
    const pDocTipo = _sanitize(data.docTipo || "CC");
    const pDocNum = _sanitize(data.docNumero || "---");
    const pEdad = _sanitize(String(data.edad || "--"));
    const pGenero = _sanitize(data.genero || "---");
    const pEps = _sanitize(data.eps || "---");
    const pArl = _sanitize(data.arl || "---");
    const pAfp = _sanitize(data.afp || "---");
    const pEmpresa = _sanitize(data.empresaNombre || "---");
    const pCargo = _sanitize(data.cargo || "---");
    const pTipo = _sanitize(data.tipoExamen || data.motivoConsulta || "---");
    const pId = _sanitize((data.id || "").toString().slice(-6) || "------");
    const accentSafe = /^#[0-9a-fA-F]{3,6}$/.test(accentColor)
      ? accentColor
      : "#059669";

    // ── PASO 2: Cabecera IPS — columna izquierda muestra empresa si hay empresaId ──
    const miIPS = currentUser?.empresaId
      ? companies.find((c) => c.id === currentUser.empresaId)
      : null;
    const leftColumn = miIPS
      ? (() => {
          const ipsNombre = _sanitize(miIPS.nombre || "");
          const ipsNit = _sanitize(miIPS.nit || "");
          const ipsDv = _sanitize(miIPS.dv || "");
          const ipsDir = _sanitize(miIPS.direccion || "");
          const ipsCiudad = _sanitize(miIPS.ciudad || "");
          const ipsTel = _sanitize(miIPS.telefono || "");
          const ipsEmail = _sanitize(miIPS.correo || "");
          const ipsLema = _sanitize(miIPS.lema || "");
          const ipsLogo = _safeLogoUrl(miIPS.logo || ""); // SEC-FIX-02
          const logoHtml = ipsLogo
            ? `<img src="${ipsLogo}" style="max-height:40px;max-width:90px;object-fit:contain;display:block;margin-bottom:4px;" />`
            : "";
          return `<div style="width:32%;padding-right:8px;">
            ${logoHtml}
            <p style="font-size:10pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:0 0 2px 0;">${ipsNombre}</p>
            ${
              ipsNit
                ? `<p style="font-size:7.5pt;color:#555;margin:1px 0;">NIT: ${ipsNit}${
                    ipsDv ? "-" + ipsDv : ""
                  }</p>`
                : ""
            }
            ${
              ipsDir
                ? `<p style="font-size:7.5pt;color:#555;margin:1px 0;">${ipsDir}${
                    ipsCiudad ? " · " + ipsCiudad : ""
                  }</p>`
                : ""
            }
            ${
              ipsTel
                ? `<p style="font-size:7.5pt;color:#555;margin:1px 0;">Tel: ${ipsTel}</p>`
                : ""
            }
            ${
              ipsEmail
                ? `<p style="font-size:7.5pt;color:#555;margin:1px 0;">${ipsEmail}</p>`
                : ""
            }
            ${
              ipsLema
                ? `<p style="font-size:7pt;color:#888;font-style:italic;margin:2px 0;">${ipsLema}</p>`
                : ""
            }
          </div>`;
        })()
      : `<div style="width:32%;padding-right:8px;">
          <p style="font-size:10.5pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:0 0 3px 0;">${docName}</p>
          <p style="font-size:7.5pt;color:#555;margin:1px 0;">${docTitulo}</p>
          <p style="font-size:7.5pt;color:#555;margin:1px 0;">Lic. Med.: ${docLic}</p>
          <p style="font-size:7.5pt;color:#555;margin:1px 0;">${docCiudad} | Cel: ${docCel}</p>
          <p style="font-size:7.5pt;color:#555;margin:1px 0;">${docEmail}</p>
        </div>`;

    return `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${accentSafe};padding-bottom:10px;margin-bottom:14px;">
        ${leftColumn}
        <div style="width:34%;text-align:center;border-left:1px solid #ddd;border-right:1px solid #ddd;padding:0 10px;">
          <p style="font-size:13pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:2px 0;">${_sanitize(
      titleDoc
    )}</p>
          <p style="font-size:7pt;color:#888;margin:2px 0;">Res. 1995&#x2F;1999 · Res. 1843&#x2F;2025</p>
          <p style="font-size:8pt;font-weight:700;color:#333;margin:5px 0 2px 0;">Fecha: ${_sanitize(
            fechaDoc
          )}</p>
          <p style="font-size:7.5pt;color:#666;margin:1px 0;">Reg. # ${pId}</p>
        </div>
        <div style="width:32%;text-align:right;padding-left:8px;">
          <p style="font-size:10.5pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:0 0 3px 0;">${pNombre}</p>
          <p style="font-size:7.5pt;color:#444;margin:1px 0;">${pDocTipo}: <b>${pDocNum}</b> &nbsp;|&nbsp; Edad: <b>${pEdad} años</b></p>
          <p style="font-size:7.5pt;color:#444;margin:1px 0;">Sexo: ${pGenero} &nbsp;|&nbsp; EPS: <b>${pEps}</b></p>
          <p style="font-size:7.5pt;color:#444;margin:1px 0;">ARL: <b>${pArl}</b> &nbsp;|&nbsp; AFP: ${pAfp}</p>
          <p style="font-size:7.5pt;color:#444;margin:1px 0;">Empresa: <b>${pEmpresa}</b></p>
          <p style="font-size:7.5pt;color:#444;margin:1px 0;">Cargo: <b>${pCargo}</b> | Tipo: ${pTipo}</p>
        </div>
      </div>`;
  };
  const baseWindowStyle = `
    @page{size:letter portrait;margin:1.1cm 1.3cm 1.3cm 1.3cm;}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
    body{font-family:Arial,Helvetica,sans-serif;font-size:9.5pt;color:#111;margin:0;padding:0;line-height:1.45;}
    .badge{display:inline-block;padding:1px 7px;border-radius:50px;font-size:7.5pt;font-weight:700;}
    .section-title{font-size:8.5pt;font-weight:900;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1.5px solid currentColor;padding-bottom:3px;margin:12px 0 6px 0;}
    .med-card{border:1px solid #d1fae5;border-left:4px solid #059669;border-radius:4px;padding:6px 10px;margin-bottom:6px;page-break-inside:avoid;background:#f0fdf4;}
    .med-num{background:#059669;color:white;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:8pt;font-weight:900;flex-shrink:0;}
    .deriv-card{border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:4px;padding:8px 10px;margin-bottom:7px;page-break-inside:avoid;background:#eff6ff;}
    .urgente{background:#fee2e2;color:#dc2626;} .prioritaria{background:#fef3c7;color:#92400e;} .electiva{background:#dcfce7;color:#166534;}
    .sig-block{display:flex;justify-content:space-between;align-items:flex-end;margin-top:18mm;padding-top:0;}
    .sig-line{text-align:center;width:42%;}
    .sig-line-top{border-top:2px solid #222;padding-top:4px;font-size:7.5pt;font-weight:700;}
    @media print{body{font-size:9pt;} .no-print{display:none!important;}}
  `;
  const openSingleMedWindow = (med, idx) => {
    const w = window.open("", "_blank", "width=600,height=700");
    if (!w) return;
    const accent = "#059669";
    const header = buildPrintHeader("Prescripción Individual", accent);
    const singleMedHtml = `
      <div class="med-card" style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;">
        <span class="med-num">${idx + 1}</span>
        <div style="flex:1;">
          <p style="font-size:12pt;font-weight:900;color:#065f46;margin:0 0 4px 0;">${_sanitize(
            med.nombre || ""
          )} <span style="font-size:9pt;font-weight:400;color:#555;">(${_sanitize(
      med.presentacion || ""
    )})</span></p>
          <p style="font-size:9.5pt;color:#374151;margin:2px 0;"><b>Dosis:</b> ${_sanitize(
            med.dosis || "--"
          )} &nbsp;·&nbsp; <b>Frecuencia:</b> ${_sanitize(
      med.frecuencia || "--"
    )} &nbsp;·&nbsp; <b>Duración:</b> ${_sanitize(med.duracion || "--")}</p>
          ${
            med.indicaciones
              ? `<p style="font-size:9pt;color:#92400e;font-style:italic;margin:4px 0;">⚠ ${_sanitize(
                  med.indicaciones
                )}</p>`
              : ""
          }
        </div>
      </div>
      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:8px 12px;margin-top:8px;">
        <p style="font-size:8.5pt;"><b>Diagnóstico:</b> ${_sanitize(
          data.diagnosticoPrincipal ||
            (data.diagnosticos || [])[0]?.descripcion ||
            "--"
        )}</p>
        <p style="font-size:8.5pt;"><b>Control en:</b> ${_sanitize(
          data.frecuenciaSeguimiento || data.plan?.controlEn || "--"
        )}</p>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:16mm;padding-top:0;">
        <div style="text-align:center;width:42%;">
          <div style="border-top:2px solid #222;padding-top:4px;font-size:7.5pt;font-weight:700;">Firma del Paciente / Responsable</div>
          <p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Nombre: _______________________</p>
          <p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Documento: ____________________</p>
        </div>
        <div style="text-align:center;width:42%;">
          ${
            activeSignature
              ? `<img src="${activeSignature}" style="max-height:50px;max-width:130px;object-fit:contain;display:block;margin:0 auto 4px;"/>`
              : '<div style="height:50px;"></div>'
          }
          <div style="border-top:2px solid #222;padding-top:4px;">
            <p style="font-size:8.5pt;font-weight:900;margin:2px 0;">${_sanitize(
              activeDoctorData?.nombre || ""
            )}</p>
            <p style="font-size:7.5pt;color:#555;margin:1px 0;">${_sanitize(
              activeDoctorData?.titulo || ""
            )}</p>
            <p style="font-size:7.5pt;color:#555;margin:1px 0;">Lic: ${_sanitize(
              activeDoctorData?.licencia || ""
            )}</p>
          </div>
        </div>
      </div>`;
    w.document
      .write(`<!DOCTYPE html><html lang="es"><head><title>Receta - ${_sanitize(
      med.nombre
    )}</title><meta charset="UTF-8"/><style>
${baseWindowStyle}
.print-toolbar{position:fixed;top:0;left:0;right:0;background:#065f46;color:white;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.25);}
.print-toolbar .ptitle{flex:1;font-size:9.5pt;font-weight:700;}
.print-toolbar button{border:none;padding:6px 14px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;}
.print-toolbar button.btn-print{background:#10b981;color:white;}
.print-toolbar button.btn-close{background:#ef4444;color:white;}
.print-toolbar .hint{font-size:7.5pt;color:#6ee7b7;}
[contenteditable]{outline:1.5px dashed #6ee7b7;border-radius:3px;padding:1px 3px;cursor:text;}
[contenteditable]:focus{outline:2px solid #10b981;background:#ecfdf5;}
body{padding-top:52px;}
@media print{.print-toolbar{display:none!important;}[contenteditable]{outline:none!important;background:transparent!important;}}
</style></head><body>
<div class="print-toolbar">
  <span class="ptitle">💊 Receta - ${_sanitize(med.nombre)}</span>
  <span class="hint">Edita el texto antes de imprimir</span>
  <button class="btn-print" onclick="window.print()">🖨️ Imprimir receta</button>
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
</div>
<div contenteditable="false">${header}</div>
<div contenteditable="true" spellcheck="false">${singleMedHtml}</div>
</body></html>`);
    w.document.close();
    w.focus();
  };

  const openPrintWindow = (section, titleDoc) => {
    const w = window.open("", "_blank", "width=870,height=1100");
    if (!w) return;
    const accentFormula = "#059669";
    const accentDeriv = "#2563eb";
    const accent = section === "formula" ? accentFormula : accentDeriv;
    const header = buildPrintHeader(titleDoc, accent);
    let bodyHtml = "";
    if (section === "formula") {
      const meds = data.formulaMedicamentos || [];
      const medsHtml =
        meds.length > 0
          ? meds
              .map(
                (m, i) => `
        <div class="med-card" style="display:flex;gap:10px;align-items:flex-start;">
          <span class="med-num">${i + 1}</span>
          <div style="flex:1;">
            <p style="font-size:10pt;font-weight:900;color:#065f46;margin:0 0 2px 0;">${_sanitize(
              m.nombre || ""
            )} <span style="font-size:8pt;font-weight:400;color:#6b7280;">${_sanitize(
                  m.presentacion || ""
                )}</span></p>
            <p style="font-size:8.5pt;color:#374151;margin:1px 0;"><b>Dosis:</b> ${_sanitize(
              m.dosis || "--"
            )} &nbsp;·&nbsp; <b>Frec.:</b> ${_sanitize(
                  m.frecuencia || "--"
                )} &nbsp;·&nbsp; <b>Duración:</b> ${_sanitize(
                  m.duracion || "--"
                )}</p>
            ${
              m.indicaciones
                ? `<p style="font-size:8pt;color:#92400e;font-style:italic;margin:2px 0;">&#9888; ${_sanitize(
                    m.indicaciones
                  )}</p>`
                : ""
            }
          </div>
        </div>`
              )
              .join("")
          : '<p style="color:#9ca3af;font-style:italic;text-align:center;padding:12px 0;">Sin medicamentos prescritos.</p>';
      const dx = _sanitize(
        data.diagnosticoPrincipal ||
          (data.diagnosticos || [])[0]?.descripcion ||
          data.diagnosticos?.[0]?.cie10 ||
          "--"
      );
      const control = _sanitize(
        data.frecuenciaSeguimiento || data.plan?.controlEn || "--"
      );
      const planMeds =
        !meds.length && data.plan?.medicamentos
          ? `<div style="margin-top:10px;"><p style="font-weight:700;font-size:8.5pt;color:#374151;border-bottom:1px solid #d1d5db;padding-bottom:3px;margin-bottom:5px;">PRESCRIPCIÓN</p><p style="font-size:8.5pt;white-space:pre-wrap;">${_sanitize(
              data.plan.medicamentos
            )}</p></div>`
          : "";
      bodyHtml = `
        <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:10px 12px;margin-bottom:12px;">
          <p class="section-title" style="color:#065f46;">&#128138; Prescripción Médica</p>
          ${medsHtml}${planMeds}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;border-top:1px solid #a7f3d0;padding-top:8px;">
            <p style="font-size:8.5pt;"><b>Diagnóstico:</b> ${dx}</p>
            <p style="font-size:8.5pt;"><b>Control en:</b> ${control}</p>
          </div>
        </div>
        <div class="sig-block">
          <div class="sig-line">
            <div class="sig-line-top">Firma del Paciente / Responsable</div>
            <p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Nombre: _______________________</p>
            <p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Documento: ____________________</p>
          </div>
          <div class="sig-line" style="text-align:center;">
            ${
              activeSignature
                ? `<img src="${activeSignature}" style="max-height:55px;max-width:150px;object-fit:contain;" alt="Firma"/>`
                : '<div style="height:55px;border-bottom:2px solid #222;"></div>'
            }
            <p style="font-size:8.5pt;font-weight:900;margin:3px 0;">${_sanitize(
              activeDoctorData?.nombre || ""
            )}</p>
            <p style="font-size:7.5pt;color:#555;margin:1px 0;">${_sanitize(
              activeDoctorData?.titulo || ""
            )}</p>
            <p style="font-size:7.5pt;color:#555;margin:1px 0;">Lic: ${_sanitize(
              activeDoctorData?.licencia || ""
            )}</p>
          </div>
        </div>`;
    } else if (section === "derivacion") {
      const derivs = data.derivaciones || [];
      const derivHtml =
        derivs.length > 0
          ? derivs
              .map((d, i) => {
                const urgClass =
                  d.urgencia === "Urgente"
                    ? "urgente"
                    : d.urgencia === "Prioritaria"
                    ? "prioritaria"
                    : "electiva";
                return `
          <div class="deriv-card">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
              <span style="background:#2563eb;color:white;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:8pt;font-weight:900;">${
                i + 1
              }</span>
              <span style="font-size:10.5pt;font-weight:900;color:#1e3a8a;">${_sanitize(
                d.especialidad || "--"
              )}</span>
              <span class="badge ${urgClass}">${_sanitize(
                  d.urgencia || "Electiva"
                )}</span>
            </div>
            <p style="font-size:8.5pt;color:#374151;margin:3px 0;"><b>Motivo:</b> ${_sanitize(
              d.motivo || "--"
            )}</p>
            ${
              d.observaciones
                ? `<p style="font-size:8pt;color:#6b7280;font-style:italic;margin:2px 0;">${_sanitize(
                    d.observaciones
                  )}</p>`
                : ""
            }
          </div>`;
              })
              .join("")
          : '<p style="color:#9ca3af;font-style:italic;text-align:center;padding:12px 0;">Sin derivaciones registradas.</p>';
      bodyHtml = `
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:4px;padding:10px 12px;margin-bottom:12px;">
          <p class="section-title" style="color:#1e3a8a;">&#127973; Derivaciones / Interconsultas</p>
          ${derivHtml}
        </div>
        <div class="sig-block">
          <div class="sig-line">
            <div class="sig-line-top">Firma del Paciente / Responsable</div>
            <p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Nombre: _______________________</p>
          </div>
          <div class="sig-line" style="text-align:center;">
            ${
              activeSignature
                ? `<img src="${activeSignature}" style="max-height:55px;max-width:150px;object-fit:contain;" alt="Firma"/>`
                : '<div style="height:55px;border-bottom:2px solid #222;"></div>'
            }
            <p style="font-size:8.5pt;font-weight:900;margin:3px 0;">${
              activeDoctorData?.nombre || ""
            }</p>
            <p style="font-size:7.5pt;color:#555;margin:1px 0;">${
              activeDoctorData?.titulo || ""
            }</p>
          </div>
        </div>`;
    }
    w.document.write(`<!DOCTYPE html><html lang="es"><head><title>${_sanitize(
      titleDoc
    )} - ${_sanitize(data.nombres)}</title><meta charset="UTF-8"/><style>
${baseWindowStyle}
.print-toolbar{position:fixed;top:0;left:0;right:0;background:#1e3a5f;color:white;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.25);}
.print-toolbar .ptitle{flex:1;font-size:9.5pt;font-weight:700;letter-spacing:.2px;}
.print-toolbar button{background:white;color:#1e3a5f;border:none;padding:6px 14px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;margin:0;}
.print-toolbar button.btn-print{background:#10b981;color:white;}
.print-toolbar button.btn-close{background:#ef4444;color:white;}
.print-toolbar .hint{font-size:7.5pt;color:#93c5fd;margin-left:4px;}
[contenteditable]{outline:1.5px dashed #93c5fd;border-radius:3px;padding:1px 3px;cursor:text;}
[contenteditable]:focus{outline:2px solid #3b82f6;background:#eff6ff;}
[contenteditable]:hover{outline:1.5px solid #60a5fa;}
body{padding-top:52px;}
@media print{.print-toolbar{display:none!important;}[contenteditable]{outline:none!important;background:transparent!important;}}
</style></head><body>
<div class="print-toolbar">
  <span class="ptitle">✏️ ${_sanitize(titleDoc)} - ${_sanitize(
      data.nombres
    )}</span>
  <span class="hint">Haz clic en cualquier texto para editar antes de imprimir</span>
  <button class="btn-print" onclick="window.print()">🖨️ Imprimir ahora</button>
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
</div>
<div contenteditable="false">${header}</div><div contenteditable="true" spellcheck="false">${bodyHtml}</div></body></html>`);
    w.document.close();
    w.focus();
    // No auto-print - el usuario edita y luego hace clic en "Imprimir ahora"
  };
  return (
    <div
      className="bg-white mx-auto shadow-2xl print:shadow-none carta-visual"
      style={{
        width: "21.59cm",
        minHeight: "auto",
        padding: "1.2cm",
        boxSizing: "border-box",
      }}
    >
      {/* Cabecera */}
      <div className="flex justify-between items-center border-b-2 border-emerald-500 pb-3 mb-3 print:border-black">
        <div className="w-1/3">
          <BrandLogo data={activeDoctorData} />
        </div>
        <div className="w-1/3 text-center">
          <h1 className="text-sm font-black text-gray-800 uppercase">
            {activeSubTab === "formula"
              ? "Fórmula Médica"
              : "Derivación / Interconsulta"}
          </h1>
          <p className="text-[9px] text-gray-500">
            Res. 1995/1999 · Res. 1843/2025
          </p>
        </div>
        <div className="w-1/3 text-right text-[9px] text-gray-500">
          <p className="font-black text-gray-800 text-[10px]">{data.nombres}</p>
          <p>
            {data.docTipo || "CC"}: {data.docNumero} · {data.edad} años
          </p>
          <p>Empresa: {data.empresaNombre || "--"}</p>
          <p>Cargo: {data.cargo || "--"}</p>
          <p>
            EPS: {data.eps || "--"} · ARL: {data.arl || "--"}
          </p>
          <p>Fecha: {data.fechaExamen || today}</p>
        </div>
      </div>
      {/* Tabs + botones de impresión individual */}
      <div className="flex gap-2 mb-4 no-print flex-wrap items-center justify-between">
        <div className="flex gap-2">
          {[
            { k: "formula", l: "💊 Fórmula Médica" },
            { k: "derivacion", l: "🏥 Derivaciones" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setActiveSubTab(t.k)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === t.k
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {activeSubTab === "formula" && (
            <button
              onClick={() => openPrintWindow("formula", "Fórmula Médica")}
              className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700"
            >
              <Printer className="w-3 h-3" /> Imprimir Fórmula
            </button>
          )}
          {activeSubTab === "derivacion" && (
            <button
              onClick={() =>
                openPrintWindow("derivacion", "Derivación / Interconsulta")
              }
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700"
            >
              <Printer className="w-3 h-3" /> Imprimir Derivación
            </button>
          )}
        </div>
      </div>
      {/* ══ FÓRMULA ══ */}
      <div
        id="print-formula-sec"
        className={activeSubTab !== "formula" ? "hidden print:block" : ""}
      >
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3 print:bg-transparent print:border-gray-300">
          <h3 className="font-black text-emerald-900 text-xs uppercase mb-3 flex items-center gap-2">
            <Pill className="w-4 h-4" /> Prescripción Médica
          </h3>
          {/* Input nuevo medicamento */}
          <div className="no-print mb-3 bg-white p-3 rounded-lg border border-emerald-100 space-y-2">
            <p className="text-[10px] font-bold text-gray-600 uppercase">
              Agregar Medicamento a la Fórmula
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Medicamento
                </label>
                <MedicamentoAutocomplete
                  value={newMed.nombre}
                  onChange={(v) => setNewMed((p) => ({ ...p, nombre: v }))}
                  onSelectMed={(s) =>
                    setNewMed((p) => ({
                      ...p,
                      nombre: s.label,
                      presentacion:
                        p.presentacion || s.presentaciones?.[0] || "",
                      dosis: p.dosis || s.dosis || "",
                    }))
                  }
                  placeholder="Buscar por nombre genérico o comercial..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Presentación
                </label>
                <input
                  value={newMed.presentacion}
                  onChange={(e) =>
                    setNewMed((p) => ({ ...p, presentacion: e.target.value }))
                  }
                  placeholder="Ej: 500mg tab"
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Dosis
                </label>
                <input
                  value={newMed.dosis}
                  onChange={(e) =>
                    setNewMed((p) => ({ ...p, dosis: e.target.value }))
                  }
                  placeholder="Ej: 1 tableta"
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Frecuencia
                </label>
                <input
                  value={newMed.frecuencia}
                  onChange={(e) =>
                    setNewMed((p) => ({ ...p, frecuencia: e.target.value }))
                  }
                  placeholder="Ej: c/8 horas"
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Duración
                </label>
                <input
                  value={newMed.duracion}
                  onChange={(e) =>
                    setNewMed((p) => ({ ...p, duracion: e.target.value }))
                  }
                  placeholder="Ej: 7 días"
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Indicaciones especiales
                </label>
                <input
                  value={newMed.indicaciones}
                  onChange={(e) =>
                    setNewMed((p) => ({ ...p, indicaciones: e.target.value }))
                  }
                  placeholder="Ej: con comida"
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
            </div>
            <button
              onClick={addMedicamento}
              type="button"
              className="w-full bg-emerald-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" /> Agregar a la Fórmula
            </button>
          </div>
          {/* Lista */}
          {(data.formulaMedicamentos || []).length > 0 ? (
            <div className="space-y-2">
              {(data.formulaMedicamentos || []).map((med, idx) => (
                <div
                  key={med.id || idx}
                  className="bg-white border border-emerald-200 rounded-lg p-2 flex gap-3 items-start print:border-gray-300 print-break-avoid"
                >
                  <div className="bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-sm text-gray-900">
                      {med.nombre}{" "}
                      <span className="font-normal text-gray-500 text-xs">
                        {med.presentacion}
                      </span>
                    </p>
                    <p className="text-xs text-gray-700 mt-0.5">
                      <b>Dosis:</b> {med.dosis}&nbsp;·&nbsp;<b>Frec:</b>{" "}
                      {med.frecuencia}&nbsp;·&nbsp;<b>Dur:</b> {med.duracion}
                    </p>
                    {med.indicaciones && (
                      <p className="text-[10px] text-amber-700 mt-0.5 italic">
                        ⚠ {med.indicaciones}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 no-print">
                    <button
                      onClick={() => openSingleMedWindow(med, idx)}
                      title="Imprimir esta receta individual"
                      className="flex items-center gap-0.5 bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-lg px-2 py-1 text-[10px] font-bold transition"
                    >
                      <Printer className="w-3 h-3" /> Imprimir
                    </button>
                    <button
                      onClick={() => removeMed(med.id || idx)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-xs italic py-3">
              Sin medicamentos en la fórmula.
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">
                Diagnóstico
              </label>
              <input
                value={data.diagnosticoPrincipal || ""}
                readOnly
                className="w-full p-1.5 border-b border-gray-300 text-xs bg-transparent font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 mb-0.5 uppercase">
                Control en
              </label>
              <input
                value={data.frecuenciaSeguimiento || ""}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    frecuenciaSeguimiento: e.target.value,
                  }))
                }
                placeholder="Ej: 15 días"
                className="w-full p-1.5 border-b border-gray-300 text-xs outline-none"
              />
            </div>
          </div>
        </div>
        {/* Firma fórmula - solo impresión */}
        <div className="hidden print:flex mt-8 justify-between items-end px-2 signature-block">
          <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
            <p className="text-[10px] font-bold">
              Firma del Paciente / Responsable
            </p>
            <p className="text-[9px] text-gray-500">
              Nombre: ____________________________
            </p>
          </div>
          <div className="text-center w-2/5">
            <DoctorSignature
              signature={activeSignature}
              data={activeDoctorData}
              showData={true}
            />
          </div>
        </div>
      </div>
      {/* ══ DERIVACIONES ══ */}
      <div
        id="print-deriv-sec"
        className={activeSubTab !== "derivacion" ? "hidden print:block" : ""}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 print:bg-transparent print:border-gray-300">
          <h3 className="font-black text-blue-900 text-xs uppercase mb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Derivaciones / Interconsultas
          </h3>
          {/* Formulario agregar derivación */}
          <div
            className="no-print mb-3 bg-white p-3 rounded-lg border border-blue-100"
            ref={derivRef}
          >
            <p className="text-[10px] font-bold text-gray-600 uppercase mb-2">
              Agregar Derivación
            </p>
            {/* Barra de búsqueda interactiva de especialidades */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-blue-400 pointer-events-none" />
              <input
                value={derivSearch}
                onChange={(e) => {
                  setDerivSearch(e.target.value);
                  setShowDerivSugg(true);
                }}
                onFocus={() => setShowDerivSugg(true)}
                placeholder="Filtrar especialidad por nombre o motivo..."
                className="w-full pl-8 p-1.5 border border-blue-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-300 outline-none"
              />
              {showDerivSugg && filteredDeriv.length > 0 && (
                <div className="absolute z-50 bg-white border border-blue-200 rounded-xl shadow-xl mt-0.5 w-full max-h-48 overflow-y-auto">
                  {filteredDeriv.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setNewDeriv((p) => ({
                          ...p,
                          especialidad: d.esp,
                          motivo: d.motivo,
                        }));
                        setDerivSearch(d.esp);
                        setShowDerivSugg(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-50 border-b border-gray-50 last:border-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-800 text-xs">
                          {d.esp}
                        </span>
                        {d.tipo && (
                          <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 rounded">
                            {d.tipo}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                        {d.motivo}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Chips de especialidades frecuentes */}
            <div className="flex flex-wrap gap-1 mb-2">
              {SPECIALTIES_LIST.map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() =>
                    setNewDeriv((p) => ({ ...p, especialidad: sp }))
                  }
                  className={`text-[9px] px-2 py-0.5 rounded-full border font-bold transition-all ${
                    newDeriv.especialidad === sp
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Especialidad seleccionada
                </label>
                <input
                  value={newDeriv.especialidad}
                  onChange={(e) =>
                    setNewDeriv((p) => ({ ...p, especialidad: e.target.value }))
                  }
                  placeholder="Especialidad..."
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Urgencia
                </label>
                <select
                  value={newDeriv.urgencia}
                  onChange={(e) =>
                    setNewDeriv((p) => ({ ...p, urgencia: e.target.value }))
                  }
                  className="w-full p-1.5 border rounded text-xs"
                >
                  <option>Electiva</option>
                  <option>Prioritaria</option>
                  <option>Urgente</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Motivo de la derivación{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={newDeriv.motivo}
                  onChange={(e) =>
                    setNewDeriv((p) => ({ ...p, motivo: e.target.value }))
                  }
                  placeholder="Describa el motivo clínico de la derivación..."
                  className="w-full p-1.5 border rounded text-xs resize-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">
                  Observaciones
                </label>
                <input
                  value={newDeriv.observaciones}
                  onChange={(e) =>
                    setNewDeriv((p) => ({
                      ...p,
                      observaciones: e.target.value,
                    }))
                  }
                  placeholder="Antecedentes relevantes, información adicional..."
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
            </div>
            <button
              onClick={addDerivacion}
              type="button"
              className="w-full bg-blue-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-1 mt-2"
            >
              <Plus className="w-3 h-3" /> Agregar Derivación
            </button>
          </div>
          {/* Lista derivaciones */}
          {(data.derivaciones || []).length > 0 ? (
            <div className="space-y-2">
              {(data.derivaciones || []).map((der, idx) => (
                <div
                  key={der.id || idx}
                  className="bg-white border border-blue-200 rounded-lg p-2.5 print:border-gray-300 print-break-avoid"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-black text-sm text-blue-900">
                          {der.especialidad}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            der.urgencia === "Urgente"
                              ? "bg-red-100 text-red-700"
                              : der.urgencia === "Prioritaria"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {der.urgencia}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">
                        <b>Motivo:</b> {der.motivo}
                      </p>
                      {der.observaciones && (
                        <p className="text-[10px] text-gray-500 mt-0.5 italic">
                          {der.observaciones}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeDerivacion(der.id || idx)}
                      className="text-red-400 hover:text-red-600 no-print ml-2 flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-xs italic py-3">
              No hay derivaciones registradas.
            </p>
          )}
        </div>
        {/* Firma derivación - solo impresión */}
        <div className="hidden print:flex mt-8 justify-between items-end px-2 signature-block">
          <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
            <p className="text-[10px] font-bold">
              Firma del Paciente / Responsable
            </p>
            <p className="text-[9px] text-gray-500">
              Nombre: ____________________________
            </p>
          </div>
          <div className="text-center w-2/5">
            <DoctorSignature
              signature={activeSignature}
              data={activeDoctorData}
              showData={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
// ==========================================
// MÓDULO 10: COMPONENTE PRINCIPAL APP
// ==========================================
// ── LoginForm: inputs controlados (sin document.getElementById) ──────────────
// ══════════════════════════════════════════════════════════════════════════
// B-19 CONSENTIMIENTO INFORMADO DIGITAL
// Ley 23/1981 (ética médica) + Res. 8430/1993 (investigación en salud)
// Ley 1581/2012 (habeas data) + Res. 1843/2025 Art. 12
// ══════════════════════════════════════════════════════════════════════════
const ConsentimientoModal = ({
  data,
  onConfirmar,
  onCerrar,
  estadoCerrada,
}) => {
  const { useState: useLocalState } = React;
  const [nombre, setNombre] = useLocalState(
    data.consentimientoNombrePaciente || ""
  );
  const [aceptado, setAceptado] = useLocalState(false);
  const [error, setError] = useLocalState("");
  const fechaHoy = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const horaAhora = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleConfirmar = () => {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio || nombreLimpio.length < 3) {
      setError(
        "Ingrese su nombre completo tal como aparece en el documento de identidad."
      );
      return;
    }
    if (!aceptado) {
      setError("Debe marcar la casilla de aceptación para continuar.");
      return;
    }
    const ts = new Date().toISOString();
    onConfirmar({
      consentimientoInformado: true,
      consentimientoNombrePaciente: nombreLimpio,
      tipoConsentimiento: "Digital",
      fechaConsentimiento: ts.split("T")[0],
      consentimientoTimestamp: ts,
      consentimientoIp: "sesión-web",
      consentimientoVersion: "v2025-1843",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ci-titulo"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2
              id="ci-titulo"
              className="text-white font-black text-base uppercase tracking-wide"
            >
              Consentimiento Informado
            </h2>
            <p className="text-emerald-200 text-xs mt-0.5">
              Ley 23/1981 · Res. 8430/1993 · Ley 1581/2012 · Res. 1843/2025
              Art.12
            </p>
          </div>
          {!estadoCerrada && (
            <button
              onClick={onCerrar}
              className="text-emerald-200 hover:text-white text-xl font-black leading-none"
              aria-label="Cerrar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Cuerpo scrollable */}
        <div className="overflow-y-auto flex-grow px-6 py-4 text-xs text-gray-700 space-y-3">
          <p className="font-bold text-gray-900 text-sm">
            AUTORIZACIÓN PARA EVALUACIÓN MÉDICA OCUPACIONAL
          </p>
          <p>
            Yo, el/la trabajador(a) identificado(a) con el nombre y documento
            que diligencie a continuación, en ejercicio de mi capacidad legal y
            actuando de manera libre y voluntaria, <strong>AUTORIZO</strong> al
            profesional de medicina del trabajo y salud ocupacional a:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Realizar la evaluación médica ocupacional de ingreso, periódica o
              de egreso, según corresponda, de conformidad con la{" "}
              <strong>Resolución 1843 de 2025</strong> y la Resolución 2346 de
              2007.
            </li>
            <li>
              Recopilar, almacenar y procesar mis datos personales y de salud
              con fines exclusivamente médico-ocupacionales, en cumplimiento de
              la <strong>Ley 1581 de 2012</strong> (Habeas Data) y el Decreto
              1377 de 2013.
            </li>
            <li>
              Compartir el <em>Certificado de Aptitud Laboral</em> con la
              empresa contratante o solicitante de la evaluación, en los
              términos del artículo 12 de la Resolución 1843 de 2025.
            </li>
          </ul>
          <p>
            <strong>Confidencialidad:</strong> Mi historia clínica ocupacional
            es un documento privado. Su acceso está restringido únicamente al
            equipo de salud tratante y a las autoridades que lo requieran por
            mandato legal (<strong>Ley 23 de 1981, Art. 37</strong>). El médico
            está sujeto al secreto profesional.
          </p>
          <p>
            <strong>Derechos como titular de datos (Ley 1581/2012):</strong>{" "}
            Tengo derecho a conocer, actualizar, rectificar y solicitar la
            supresión de mis datos personales. Puedo ejercer estos derechos
            directamente ante el médico tratante.
          </p>
          <p>
            <strong>Voluntariedad:</strong> Entiendo que puedo revocar esta
            autorización en cualquier momento, aunque ello puede implicar la
            imposibilidad de emitir el certificado de aptitud laboral requerido
            por mi empleador.
          </p>
          <p className="text-gray-500 italic">
            Fecha y hora de este acto:{" "}
            <strong>
              {fechaHoy}, {horaAhora}
            </strong>
          </p>
        </div>

        {/* Zona de firma */}
        {!estadoCerrada ? (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0 space-y-3">
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1">
                Nombre completo del trabajador{" "}
                <span className="text-red-600">*</span>
                <span className="font-normal text-gray-400 ml-1">
                  (tal como aparece en su documento de identidad)
                </span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setError("");
                }}
                placeholder="Ej: JUAN CARLOS PÉREZ GÓMEZ"
                className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                autoComplete="off"
              />
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aceptado}
                onChange={(e) => {
                  setAceptado(e.target.checked);
                  setError("");
                }}
                className="mt-0.5 w-4 h-4 accent-emerald-600 flex-shrink-0"
              />
              <span className="text-xs text-gray-700 leading-relaxed">
                He leído, comprendido y acepto voluntariamente el presente
                consentimiento informado. Confirmo que la información es veraz y
                que actúo sin presión alguna.
              </span>
            </label>
            {error && (
              <p className="text-red-600 text-xs font-bold">⚠️ {error}</p>
            )}
            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={onCerrar}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={!nombre.trim() || !aceptado}
                className="px-5 py-2 text-xs font-black text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                ✅ Confirmar consentimiento
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200 px-6 py-4 bg-emerald-50 flex-shrink-0">
            <p className="text-xs text-emerald-800 font-bold">
              ✅ Consentimiento registrado - Historia clínica cerrada (solo
              lectura)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function LoginForm({ onLogin, blockedUntil, attempts }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [remaining, setRemaining] = useState(0);
  // SEGURIDAD: countdown del bloqueo
  React.useEffect(() => {
    if (!blockedUntil) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const secs = Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
      setRemaining(secs);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [blockedUntil]);
  const isBlocked = blockedUntil && Date.now() < blockedUntil;
  // SEC-FIX-03: Limitar longitud de inputs para prevenir DoS y fuzzing (CWE-400)
  const MAX_USER_LEN = 64;
  const MAX_PASS_LEN = 128;
  const submit = () => {
    if (isBlocked) return;
    const user = u.trim().slice(0, MAX_USER_LEN);
    const pass = p.trim().slice(0, MAX_PASS_LEN);
    if (user && pass) onLogin(user, pass);
  };
  return (
    <div className="space-y-4 mb-6">
      {isBlocked && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-center">
          <p className="text-red-700 font-black text-sm">🔒 Acceso bloqueado</p>
          <p className="text-red-500 text-xs mt-1">
            Espere <span className="font-black">{remaining}s</span> antes de
            intentar de nuevo
          </p>
        </div>
      )}
      {!isBlocked && attempts > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-2 text-center">
          <p className="text-yellow-700 text-xs font-bold">
            ⚠️ {attempts} intento{attempts > 1 ? "s" : ""} fallido
            {attempts > 1 ? "s" : ""}. Máx. 5 antes del bloqueo.
          </p>
        </div>
      )}
      <input
        value={u}
        onChange={(e) => setU(e.target.value.slice(0, MAX_USER_LEN))}
        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
        placeholder="Usuario"
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoComplete="username"
        maxLength={MAX_USER_LEN}
        disabled={isBlocked}
      />
      <input
        type="password"
        value={p}
        onChange={(e) => setP(e.target.value.slice(0, MAX_PASS_LEN))}
        className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
        placeholder="Contraseña"
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoComplete="current-password"
        maxLength={MAX_PASS_LEN}
        disabled={isBlocked}
      />
      <button
        onClick={submit}
        disabled={isBlocked}
        className={`w-full py-3 rounded-xl font-black text-sm transition shadow-lg ${
          isBlocked
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90"
        }`}
      >
        {isBlocked ? `Bloqueado (${remaining}s)` : "Iniciar Sesión"}
      </button>
    </div>
  );
}
// ══════════════════════════════════════════════════════════
// MÓDULO NORMATIVO 1: AVISO DE PRIVACIDAD (Ley 1581/2012)
// Decreto 1078/2015 Art. 2.2.2.25.2.2 - Tratamiento datos sensibles (deroga Decreto 1377/2013)
// ══════════════════════════════════════════════════════════

// ══ B-15: NotificacionModal extraído a src/pages/NotificacionModal.jsx ══

// [EXTRACTED: utils/normativa.js - factura]

// [EXTRACTED: utils/totp.js]
// [EXTRACTED: utils/normativa.js - paquete+cert]

// ══════════════════════════════════════════════════════════════════════════
// PORTAL PÚBLICO DEL TRABAJADOR - Acceso sin login
// Solo requiere: código de verificación de HC O número de cédula
// Consulta DIRECTA a Supabase (no usa estado del App)
// SEC-13: Sin acceso a datos de otros pacientes
const PORTAL_URL = "https://fw5fnt.csb.app/#portaltrabajador";
// ══════════════════════════════════════════════════════════════════════════
// PORTAL PÚBLICO DEL TRABAJADOR - v2 - Acceso sin login
// URL: https://fw5fnt.csb.app/#portaltrabajador
// Búsqueda por código de verificación O número de cédula
// Query directo a Supabase clave pública 'siso_portal_{codigo}'
// Compatible: Chrome, Firefox, Safari, Edge, Opera (todos los navegadores)
// SEC-13: Nunca expone datos de otros pacientes
// NORMATIVO: Res. 2346/2007 Art.14 · Ley 1581/2012 · Res. 1843/2025
// ══════════════════════════════════════════════════════════════════════════
const PortalPublicoTrabajador = ({ sbUrl, sbKey, onVolver }) => {
  const { useState, useCallback, useRef } = React;
  const [busqueda, setBusqueda] = React.useState("");
  const [tipoBusqueda, setTipoBusqueda] = React.useState("codigo");
  const [resultado, setResultado] = React.useState(null);
  const [error, setError] = React.useState("");
  const [cargando, setCargando] = React.useState(false);
  const [intentos, setIntentos] = React.useState(0);
  const [bloqueadoHasta, setBloqueadoHasta] = React.useState(0);
  const MAX_INTENTOS = 6;
  const BLOQUEO_MS = 5 * 60 * 1000; // 5 minutos

  // Fetch con timeout compatible con todos los navegadores (sin AbortSignal.timeout)
  const fetchConTimeout = (url, opts, ms = 10000) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { ...opts, signal: ctrl.signal }).finally(() =>
      clearTimeout(timer)
    );
  };

  const buscar = async () => {
    const ahora = Date.now();
    if (ahora < bloqueadoHasta) {
      const restMin = Math.ceil((bloqueadoHasta - ahora) / 60000);
      setError(
        `🔒 Demasiados intentos. Espere ${restMin} minuto(s) antes de intentar.`
      );
      return;
    }
    const q = busqueda.trim();
    if (!q) {
      setError("Ingrese su código de verificación o número de cédula.");
      return;
    }
    if (q.length < 4) {
      setError("El código o cédula debe tener al menos 4 caracteres.");
      return;
    }
    setCargando(true);
    setError("");
    setResultado(null);
    try {
      // ── Construcción de claves de búsqueda ───────────────────────────────────
      // Formatos históricos coexistentes:
      //   ANTIGUO: CV-XXXXXXXXX  (p.ej. CV-I64CIYHE7)  - 71 HCs
      //   NUEVO:   SISO-YYYYMMDD-ID-HASH16              - desde 2026-03
      // El portal busca con el prefijo siso_portal_ en Supabase
      // Para búsqueda por código: intentar la clave exacta
      // Para búsqueda por cédula: intentar siso_portal_doc_CEDULA

      const headers = {
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      const fetchKey = async (key) => {
        const url = `${sbUrl}/rest/v1/siso_store?key=eq.${encodeURIComponent(
          key
        )}&select=value`;
        const r = await fetchConTimeout(url, { headers }, 12000);
        if (!r.ok) return { ok: false, status: r.status, text: r.statusText };
        const rows = await r.json();
        const val = rows && rows.length > 0 ? rows[0].value : null;
        return {
          ok: true,
          data: val ? (typeof val === "string" ? JSON.parse(val) : val) : null,
        };
      };

      // Intentar todas las variantes de clave posibles
      let pac = null;
      let firstError = null;
      if (tipoBusqueda === "codigo") {
        const qUp = q.toUpperCase();
        // 1) Clave exacta tal como viene
        const r1 = await fetchKey("siso_portal_" + qUp);
        if (!r1.ok) {
          firstError = r1;
        } else if (r1.data) {
          pac = r1.data;
        }
        // 2) Si el código no tiene prefijo CV- ni SISO-, probar con CV- delante
        if (!pac && !qUp.startsWith("CV-") && !qUp.startsWith("SISO-")) {
          const r2 = await fetchKey("siso_portal_CV-" + qUp);
          if (r2.ok && r2.data) pac = r2.data;
        }
        // 3) Probar código exacto sin normalizar (algunos códigos tienen minúsculas)
        if (!pac && qUp !== q.trim()) {
          const r3 = await fetchKey("siso_portal_" + q.trim());
          if (r3.ok && r3.data) pac = r3.data;
        }
        // 4) Buscar por código directamente en siso_store (formato antiguo no-portal)
        if (!pac) {
          const r4 = await fetchKey(qUp);
          if (r4.ok && r4.data && r4.data.codigoVerificacion) pac = r4.data;
        }
        // 5) Búsqueda por dígito verificador flexible (sin guión, con guión)
        if (!pac) {
          const codeNoDash = qUp.replace(/-/g, "");
          const r5 = await fetchKey("siso_portal_" + codeNoDash);
          if (r5.ok && r5.data) pac = r5.data;
        }
      } else {
        // Búsqueda por cédula
        const docClean = q.replace(/\s/g, "");
        const r1 = await fetchKey("siso_portal_doc_" + docClean);
        if (!r1.ok) {
          firstError = r1;
        } else if (r1.data) pac = r1.data;
      }

      if (firstError && !pac) {
        if (firstError.status === 401 || firstError.status === 403) {
          setError(
            "⚙️ El portal requiere configuración en Supabase.\nEjecute en el SQL Editor de Supabase:\nCREATE POLICY portal_public_read ON siso_store FOR SELECT USING (key LIKE 'siso_portal_%');"
          );
        } else {
          setError(`Error ${firstError.status}: ${firstError.text}`);
        }
        return;
      }
      setIntentos((prev) => {
        const n = prev + 1;
        if (n >= MAX_INTENTOS) setBloqueadoHasta(Date.now() + BLOQUEO_MS);
        return n;
      });
      if (!pac) {
        setError(
          tipoBusqueda === "codigo"
            ? "❌ Código no encontrado. Aceptamos formatos CV-XXXXXXX y SISO-FECHA-ID-HASH. Verifique mayúsculas y que la HC esté cerrada."
            : "❌ Número de cédula no encontrado. Solo aparecen evaluaciones con historia cerrada."
        );
      } else {
        setResultado(pac);
      }
    } catch (e) {
      if (e.name === "AbortError")
        setError(
          "⏱️ Tiempo de espera agotado. Verifique su conexión a internet."
        );
      else setError("Error de conexión: " + (e.message || "desconocido"));
    } finally {
      setCargando(false);
    }
  };

  const colorAptitud = (c = "") => {
    const cl = (c || "").toLowerCase();
    if (cl.includes("no apto"))
      return {
        bg: "bg-red-50",
        text: "text-red-800",
        badge: "bg-red-100 text-red-800 border-red-300",
        dot: "🔴",
      };
    if (
      cl.includes("condicion") ||
      cl.includes("condición") ||
      cl.includes("restricc")
    )
      return {
        bg: "bg-amber-50",
        text: "text-amber-800",
        badge: "bg-amber-100 text-amber-800 border-amber-300",
        dot: "🟡",
      };
    if (cl.includes("apto"))
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-800",
        badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
        dot: "🟢",
      };
    return {
      bg: "bg-gray-50",
      text: "text-gray-700",
      badge: "bg-gray-100 text-gray-700 border-gray-300",
      dot: "⚪",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 font-sans flex flex-col">
      {/* ── Barra superior ── */}
      <div className="bg-gradient-to-r from-teal-700 to-blue-700 px-5 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
            🧑‍💼
          </div>
          <div>
            <h1 className="text-white font-black text-sm tracking-tight">
              Portal del Trabajador
            </h1>
            <p className="text-teal-200 text-[10px]">
              Servicio Médico Ocupacional · SISO OcupaSalud
            </p>
          </div>
        </div>
        {onVolver && (
          <button
            onClick={onVolver}
            className="text-white/80 text-xs hover:text-white font-bold flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
          >
            ← Volver al sistema
          </button>
        )}
      </div>

      <div className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4 mt-2">
        {/* ── Instrucciones ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">📋</span>
            <div>
              <h2 className="font-black text-gray-800 text-sm">
                Consulta tu evaluación médica
              </h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Ingresa el código entregado por el médico o tu número de cédula
                para ver el resultado de tu examen de aptitud laboral.
              </p>
            </div>
          </div>
        </div>

        {/* ── Formulario ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          {/* Selector tipo búsqueda */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            {[
              { v: "codigo", label: "🔑 Código", hint: "SISO-2025-XXXX" },
              { v: "cedula", label: "🪪 Cédula", hint: "1234567890" },
            ].map((opt) => (
              <button
                key={opt.v}
                onClick={() => {
                  setTipoBusqueda(opt.v);
                  setBusqueda("");
                  setError("");
                  setResultado(null);
                }}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition ${
                  tipoBusqueda === opt.v
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Input */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
              {tipoBusqueda === "codigo"
                ? "Código de verificación"
                : "Número de cédula (sin puntos ni espacios)"}
            </label>
            <input
              value={busqueda}
              onChange={(e) =>
                setBusqueda(
                  tipoBusqueda === "codigo"
                    ? e.target.value.toUpperCase().trim()
                    : e.target.value.trim()
                )
              }
              onKeyDown={(e) => e.key === "Enter" && !cargando && buscar()}
              className="w-full p-3 border-2 border-gray-200 focus:border-teal-400 rounded-xl text-sm font-mono font-bold tracking-widest focus:outline-none transition"
              placeholder={
                tipoBusqueda === "codigo"
                  ? "Ej: SISO-2025-XXXX"
                  : "Ej: 1234567890"
              }
              maxLength={50}
              autoFocus
              autoComplete="off"
            />
          </div>
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              <pre className="whitespace-pre-wrap font-sans">{error}</pre>
            </div>
          )}
          {/* Botón buscar */}
          <button
            onClick={buscar}
            disabled={
              cargando || !busqueda.trim() || Date.now() < bloqueadoHasta
            }
            className="w-full py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <span className="animate-spin">⏳</span> Consultando...
              </>
            ) : (
              "🔍 Consultar resultado"
            )}
          </button>
          <p className="text-[9px] text-gray-400 text-center">
            Consulta segura y confidencial · Solo verás tus propios datos
            {intentos > 0 && ` · Intentos: ${intentos}/${MAX_INTENTOS}`}
          </p>
        </div>

        {/* ── Resultado ── */}
        {resultado &&
          (() => {
            const col = colorAptitud(resultado.conceptoAptitud);
            return (
              <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
                {/* Header resultado */}
                <div className={`px-5 py-4 ${col.bg} border-b border-gray-100`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        Resultado de tu evaluación
                      </p>
                      <p className={`font-black text-base mt-0.5 ${col.text}`}>
                        {col.dot}{" "}
                        {resultado.conceptoAptitud || "Pendiente de concepto"}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${col.badge}`}
                    >
                      {resultado.estadoHistoria || "Cerrada"}
                    </span>
                  </div>
                </div>
                {/* Datos */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["👤 Nombre", resultado.nombres],
                      [
                        "🪪 Documento",
                        `${resultado.docTipo || "CC"} ${resultado.docNumero}`,
                      ],
                      ["🏭 Empresa", resultado.empresaNombre || "--"],
                      ["💼 Cargo", resultado.cargo || "--"],
                      ["🔬 Tipo de examen", resultado.tipoExamen || "--"],
                      ["📅 Fecha evaluación", resultado.fechaExamen || "--"],
                      ["👨‍⚕️ Médico evaluador", resultado.medicoNombre || "--"],
                      [
                        "🔑 Código verificación",
                        resultado.codigoVerificacion || "--",
                      ],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="bg-gray-50 rounded-lg p-2.5 min-w-0"
                      >
                        <p className="text-[9px] font-black text-gray-400 uppercase truncate">
                          {k}
                        </p>
                        <p className="text-xs font-bold text-gray-800 mt-0.5 break-words">
                          {v || "--"}
                        </p>
                      </div>
                    ))}
                  </div>
                  {resultado.restricciones && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-[10px] font-black text-amber-700 uppercase mb-1">
                        ⚠️ Restricciones / Recomendaciones
                      </p>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {resultado.restricciones}
                      </p>
                    </div>
                  )}
                  {/* ── DESCARGAR CERTIFICADO PDF ─────────────────────────── */}
                  <button
                    onClick={() => {
                      const docData = resultado._doctorData || {
                        nombre: resultado.medicoNombre || "MÉDICO OCUPACIONAL",
                        titulo: "Médico Especialista en Salud Ocupacional",
                        licencia: "--",
                        ciudad: "Popayán",
                        email: "",
                      };
                      const firma = resultado._firma || "";
                      const _miIPS0 = currentUser?.empresaId
                        ? companies.find(
                            (c) => c.id === currentUser.empresaId
                          ) || null
                        : null;
                      const html = _generarCertificadoHTMLNormalizado(
                        resultado,
                        docData,
                        firma,
                        _miIPS0
                      );
                      const w = window.open(
                        "",
                        "_blank",
                        "width=920,height=1150"
                      );
                      if (!w) {
                        alert(
                          "El navegador bloqueó la ventana emergente. Permita los popups para descargar el certificado."
                        );
                        return;
                      }
                      // Inyectar botón flotante de descarga
                      const htmlConBtn = html.replace(
                        "</body>",
                        '<div class="np-dl">' +
                          '<button onclick="window.print()">📥 Guardar / Imprimir PDF</button>' +
                          "<p>En el diálogo de impresión,<br/>selecciona <b>Guardar como PDF</b></p>" +
                          "</div></body>"
                      );
                      w.document.write(htmlConBtn);
                      w.document.close();
                      w.focus();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2.5 shadow-sm transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 10v6m0 0l-3-3m3 3l3-3M3 17a3 3 0 003 3h12a3 3 0 003-3v-1M3 17V7a3 3 0 013-3h8l5 5v8"
                      />
                    </svg>
                    Descargar Certificado PDF
                  </button>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[10px] text-blue-700 leading-relaxed">
                    <p className="font-black mb-0.5">
                      🔒 Información confidencial - Res. 1995/1999
                    </p>
                    <p>
                      Tu historia clínica completa es custodiada por el médico
                      ocupacional. Para consultas sobre tu resultado, comunícate
                      con el servicio médico.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
      <div className="text-center pb-4 pt-2 text-[9px] text-gray-300">
        SISO OcupaSalud v4 · Res. 2346/2007 · Ley 1581/2012 · Res. 1843/2025
      </div>
    </div>
  );
};

const PrivacyModal = ({ onAccept }) => (
  <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 font-sans">
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-black text-base uppercase tracking-tight">
              Política de Privacidad y Tratamiento de Datos
            </h2>
            <p className="text-blue-100 text-[11px] font-medium">
              Ley 1581 de 2012 · Decreto 1078 de 2015
            </p>
          </div>
        </div>
      </div>
      <div className="p-5 max-h-72 overflow-y-auto text-xs text-gray-700 space-y-3 leading-relaxed">
        <p>
          <span className="font-black text-gray-900">
            Responsable del tratamiento:
          </span>{" "}
          El profesional médico registrado en esta plataforma es el responsable
          del tratamiento de los datos personales y de salud gestionados en
          OCUPASALUD.
        </p>
        <p>
          <span className="font-black text-gray-900">Datos tratados:</span>{" "}
          Datos de identificación, datos de salud (historia clínica,
          diagnósticos, resultados de exámenes) y datos laborales de los
          trabajadores evaluados.
        </p>
        <p>
          <span className="font-black text-gray-900">Finalidad:</span> Gestión
          de historias clínicas ocupacionales, emisión de certificados de
          aptitud laboral y cumplimiento del Sistema de Gestión de Seguridad y
          Salud en el Trabajo (SG-SST) conforme a la Res. 1843/2025 (deroga Res.
          2346/2007).
        </p>
        <p>
          <span className="font-black text-gray-900">Base legal:</span> El
          tratamiento de datos de salud está autorizado por la Ley 1562/2012
          (riesgos laborales) y la Resolución 1843/2025 (evaluaciones médicas
          ocupacionales - deroga Res. 2346/2007).
        </p>
        <p>
          <span className="font-black text-gray-900">Confidencialidad:</span>{" "}
          Las historias clínicas son documentos privados sometidos a reserva.
          Solo personal médico autorizado puede acceder a ellas (Res. 1995/1999
          Art. 14). Se conservan por un mínimo de 20 años (Res. 1995/1999 Art.
          15 - Archivo de Gestión 5 años + Central 10 años + Histórico 5 años).
        </p>
        <p>
          <span className="font-black text-gray-900">
            Derechos del titular (Habeas Data):
          </span>{" "}
          Conocer, actualizar, rectificar y suprimir sus datos personales. Para
          ejercer estos derechos contacte directamente al médico responsable.
        </p>
        <p className="text-[10px] text-gray-400 border-t pt-2">
          Al continuar usando esta plataforma, el profesional médico declara
          conocer y cumplir las obligaciones del responsable del tratamiento
          establecidas en la Ley 1581 de 2012 y sus decretos reglamentarios.
        </p>
      </div>
      <div className="px-5 pb-5">
        <button
          onClick={onAccept}
          className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white py-3 rounded-xl font-black text-sm hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" /> He leído y acepto la Política de
          Privacidad
        </button>
        <p className="text-[10px] text-center text-gray-400 mt-2">
          Esta aceptación queda registrada con fecha y hora
        </p>
        <button
          onClick={onAccept}
          className="mt-2 w-full text-[10px] text-blue-500 underline hover:text-blue-700"
        >
          Ya acepté anteriormente - Continuar al sistema
        </button>
      </div>
    </div>
  </div>
);
// ── AgendaFieldInput: componente de campo de formulario de agenda
// DEBE estar fuera del App/renderAgenda para que React no lo destruya en cada keystroke
const AgendaFieldF = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  opts,
  width = "flex-1",
  list,
  req,
  placeholder,
}) => (
  <div className={width + " min-w-[120px] px-1 mb-2"}>
    <label className="block text-[9px] font-black text-gray-500 uppercase mb-0.5">
      {label}
      {req && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {opts ? (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-300 bg-white"
      >
        <option value="">-</option>
        {opts.map((o) => (
          <option key={o.v || o} value={o.v || o}>
            {o.l || o}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        list={list}
        placeholder={placeholder || ""}
        className="w-full p-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-300"
      />
    )}
  </div>
);
// ══ B-07: ChangePasswordForm extraído a src/pages/ChangePasswordForm.jsx ══

// ============================================================
// FASE 1 — ESTABILIZACIÓN: SEGURIDAD Y RESILIENCIA
// ============================================================

// SEC-F1-01: HTTPS enforcement (producción)
if (typeof window !== "undefined" && window.location.protocol === "http:" && 
    !window.location.hostname.includes("localhost") && 
    !window.location.hostname.includes("127.0.0.1") &&
    !window.location.hostname.includes("csb.app")) {
  window.location.replace("https:" + window.location.href.substring(5));
}

// SEC-F1-02: Error Boundary — Previene pantalla blanca ante errores
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (typeof console !== 'undefined') console.error("[SISO]", error?.message || error);
    try {
      const logs = JSON.parse(localStorage.getItem("siso_error_log") || "[]");
      logs.push({
        ts: new Date().toISOString(),
        msg: error?.message || String(error),
        stack: error?.stack?.substring(0, 500) || "",
        component: errorInfo?.componentStack?.substring(0, 300) || "",
      });
      if (logs.length > 50) logs.splice(0, logs.length - 50);
      localStorage.setItem("siso_error_log", JSON.stringify(logs));
    } catch (_) {}
  }
  render() {
    if (this.state.hasError) {
      return React.createElement("div", {
        style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1e293b, #0f172a)", fontFamily: "Arial, sans-serif", padding: "20px" }
      }, React.createElement("div", {
        style: { background: "white", borderRadius: "16px", padding: "40px", maxWidth: "480px", width: "100%", textAlign: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }
      }, [
        React.createElement("div", { key: "icon", style: { fontSize: "48px", marginBottom: "16px" } }, "⚠️"),
        React.createElement("h1", { key: "title", style: { fontSize: "20px", fontWeight: "900", color: "#1e293b", marginBottom: "8px" } }, "OcupaSalud — Error inesperado"),
        React.createElement("p", { key: "msg", style: { fontSize: "13px", color: "#64748b", marginBottom: "20px", lineHeight: "1.5" } },
          "Se produjo un error en la aplicación. Sus datos están seguros en la nube. Intente recargar la página."
        ),
        React.createElement("p", { key: "detail", style: { fontSize: "11px", color: "#94a3b8", marginBottom: "20px", background: "#f8fafc", padding: "10px", borderRadius: "8px", wordBreak: "break-word" } },
          this.state.error?.message || "Error desconocido"
        ),
        React.createElement("div", { key: "btns", style: { display: "flex", gap: "10px", justifyContent: "center" } }, [
          React.createElement("button", {
            key: "reload",
            onClick: () => window.location.reload(),
            style: { background: "#059669", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }
          }, "🔄 Recargar"),
          React.createElement("button", {
            key: "reset",
            onClick: () => { this.setState({ hasError: false, error: null, errorInfo: null }); },
            style: { background: "#e2e8f0", color: "#334155", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }
          }, "↩ Reintentar"),
        ]),
      ]));
    }
    return this.props.children;
  }
}

// SEC-F1-03: Cifrado AES-GCM para datos sensibles en localStorage
const _ENCRYPT_KEY_NAME = "siso_enc_key";
const _getEncryptKey = async () => {
  try {
    const stored = _ss.getItem(_ENCRYPT_KEY_NAME);
    if (stored) {
      const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
      return await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
    }
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const exported = await crypto.subtle.exportKey("raw", key);
    _ss.setItem(_ENCRYPT_KEY_NAME, btoa(String.fromCharCode(...new Uint8Array(exported))));
    return key;
  } catch { return null; }
};
const _encryptData = async (plainText) => {
  try {
    const key = await _getEncryptKey();
    if (!key) return plainText;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return "ENC:" + btoa(String.fromCharCode(...combined));
  } catch { return plainText; }
};
const _decryptData = async (cipherText) => {
  try {
    if (!cipherText || !cipherText.startsWith("ENC:")) return cipherText;
    const key = await _getEncryptKey();
    if (!key) return cipherText;
    const combined = Uint8Array.from(atob(cipherText.slice(4)), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return new TextDecoder().decode(decrypted);
  } catch { return cipherText; }
};

// B-27: PWA - Registro SW si existe (offline support)
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

// ── App principal envuelta en ErrorBoundary ──
function AppInner() {
  const [view, setView] = useState(() => {
    // Restaurar vista activa al recargar - si había sesión activa
    try {
      const sess = JSON.parse(_ls.getItem("siso_session") || "null");
      if (sess?.user && sess?.view && sess.view !== "login") return sess.view;
    } catch {}
    return "login";
  });
  const [navStack, setNavStack] = useState(() => {
    try {
      const sess = JSON.parse(_ls.getItem("siso_session") || "null");
      return sess?.navStack || [];
    } catch {
      return [];
    }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    // Restaurar usuario de sesión al recargar
    try {
      const sess = JSON.parse(_ls.getItem("siso_session") || "null");
      if (sess?.user) {
        // Verificar que el usuario sigue existiendo en la lista guardada
        const users = JSON.parse(_ls.getItem("siso_users") || "[]");
        const found = users.find((u) => u.user === sess.user);
        if (!found) return null;
        // Migración: si doctorData.nombre está vacío, rellenar desde initialUsers (no sobreescribir datos ya guardados)
        const init = initialUsers.find((i) => i.user === found.user);
        if (init && init.doctorData?.nombre && !found.doctorData?.nombre) {
          // Usar init como base, sobreescribir solo con valores no vacíos del stored
          const mergedDoc = Object.fromEntries(
            Object.entries(init.doctorData).map(([k, v]) => [k, found.doctorData?.[k] || v])
          );
          return { ...found, doctorData: mergedDoc };
        }
        return found;
      }
    } catch {}
    return null;
  });
  // SEGURIDAD: protección fuerza bruta
  // ══ B-05: Rate limiting persistente en localStorage (OWASP A07) ══
  const [loginAttempts, setLoginAttempts] = useState(() => {
    const stored = parseInt(_ls.getItem("siso_login_attempts") || "0");
    return isNaN(stored) ? 0 : stored;
  });
  const [loginBlockedUntil, setLoginBlockedUntil] = useState(() => {
    const stored = parseInt(_ls.getItem("siso_login_blocked_until") || "0");
    return stored > Date.now() ? stored : null;
  });
  // NORMATIVO: Ley 1581/2012 - aceptación política de privacidad
  const [privacidadAceptada, setPrivacidadAceptada] = useState(() => {
    try {
      return !!JSON.parse(_ls.getItem("siso_privacidad_aceptada") || "false");
    } catch {
      return false;
    }
  });
  const handleAceptarPrivacidad = () => {
    const registro = { fecha: new Date().toISOString(), version: "1.0" };
    _sync("siso_privacidad_aceptada", JSON.stringify(registro));
    setPrivacidadAceptada(true);
  };
  // NORMATIVO: Res. 1888/2025 RDA - Función de registro de auditoría (reemplaza Res. 1918/2009 Art. 8)
  // NORMATIVO: Res. 1888/2025 RDA - Registro de Datos Autorizados (trazabilidad completa)
  // Campos obligatorios: usuario, accion, seccion, pacienteId, timestamp ISO, userAgent
  const logAccess = (accion, pacienteId, extra, seccion) => {
    const entrada = {
      id: Date.now(),
      fecha: new Date().toISOString(), // timestamp ISO 8601 completo (Res. 1888/2025)
      usuario: currentUser?.user || "sistema",
      nombreUsuario: currentUser?.name || "Sistema",
      rol: currentUser?.role || "desconocido",
      accion, // 'Apertura'|'Guardado'|'Cierre'|'Edicion'|'Login'|'Impresion'|'Exportacion'
      seccion: seccion || extra || null, // sección específica accedida (RDA)
      tipo: extra || null,
      pacienteId: pacienteId || null,
      userAgent:
        typeof navigator !== "undefined"
          ? navigator.userAgent?.substring(0, 120) || "N/A"
          : "N/A",
      sesionId: currentUser?.sesionId || null,
    };
    setAuditLog((prev) => {
      const nuevo = [entrada, ...prev].slice(0, 1000); // Res. 1888/2025: conservar ≥1000 registros
      setTimeout(() => _sync("siso_audit_log", JSON.stringify(nuevo)), 0);
      return nuevo;
    });
  };
  // SUPABASE: estado del indicador de sincronización en la nube
  const [syncStatus, setSyncStatus] = useState("idle");
  const [showSyncReport, setShowSyncReport] = useState(false);
  const [syncReport, setSyncReport] = useState(null); // 'idle'|'loading'|'syncing'|'ok'|'error'
  const [alertMsg, setAlertMsg] = useState("");
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [promptConfig, setPromptConfig] = useState(null);
  const [promptValue, setPromptValue] = useState("");
  const [aiConfig, setAiConfig] = useState({
    activeProvider: "gemini",
    keys: { groq: "", gemini: "", openrouter: "", together: "" },
  });
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiStatus, setAiStatus] = useState(null); // null | 'ok' | 'error'
  const [companies, setCompanies] = useState([]);
  const [usersList, setUsersList] = useState(initialUsers);
  const [usersReady, setUsersReady] = useState(false); // FIX: esperar Supabase antes de login
  const [patientsList, setPatientsList] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [savedBills, setSavedBills] = useState([]);
  // ── Atenciones cerradas desde agenda (tiempo real) ────────────────────────
  const [atencionesCerradas, setAtencionesCerradas] = useState(() => {
    try {
      return JSON.parse(_ls.getItem("siso_atenciones_cerradas") || "[]");
    } catch {
      return [];
    }
  });
  const [doctorSignature, setDoctorSignature] = useState(null);
  // NORMATIVO: Res. 1888/2025 RDA - Log de auditoría de accesos (trazabilidad completa)
  const [auditLog, setAuditLog] = useState(() => {
    try {
      return JSON.parse(_ls.getItem("siso_audit_log") || "[]");
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return (
        JSON.parse(_ls.getItem("siso_session") || "null")?.activeTab || "form"
      );
    } catch {
      return "form";
    }
  });
  const [data, setData] = useState(() => {
    try {
      const saved = _ls.getItem("siso_active_form");
      if (saved) return { ...initialOccupPatientState, ...JSON.parse(saved) };
    } catch {}
    return initialOccupPatientState;
  });
  const [dataType, setDataType] = useState(() => {
    try {
      return (
        JSON.parse(_ls.getItem("siso_session") || "null")?.dataType ||
        "ocupacional"
      );
    } catch {
      return "ocupacional";
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingRestr, setIsGeneratingRestr] = useState(false);
  const [isGeneratingReco, setIsGeneratingReco] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  // ── GUARD: cambios sin guardar en HC ─────────────────────────────────────
  const [_hcDirty, _setHcDirty] = useState(false);
  const [_exitHcConfirm, _setExitHcConfirm] = useState(null); // { onProceed }
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [historyNotification, setHistoryNotification] = useState(null);
  const [showRestriccionesPanel, setShowRestriccionesPanel] = useState(false);
  const [showRecomendacionesPanel, setShowRecomendacionesPanel] =
    useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [ripsModalData, setRipsModalData] = useState(null); // {json: string, filename: string}
  const [backupModalData, setBackupModalData] = useState(null); // {json: string, filename: string}
  const [hcChoiceAgenda, setHcChoiceAgenda] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [genPatSearch, setGenPatSearch] = useState(""); // búsqueda paciente HC General
  const [examSearch, setExamSearch] = useState(""); // solicitud examenes
  const [examList, setExamList] = useState([]); // lista exámenes solicitados
  const [showExamSuggs, setShowExamSuggs] = useState(false);
  const [diagExamen, setDiagExamen] = useState("");
  const [justExamen, setJustExamen] = useState("");
  const [printPreview, setPrintPreview] = useState(null); // 'prescripcion'|'examenes'|'incapacidad'|null
  const [selectedCompanyReport, setSelectedCompanyReport] = useState("");
  const [reporteActiveTab, setReporteActiveTab] = useState("estadisticas"); // 'estadisticas' | 'certificados'
  const [certSelected, setCertSelected] = useState({}); // {[patientId]: bool}
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportAIResult, setReportAIResult] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showExportTable, setShowExportTable] = useState(false);
  const [precioPorPaciente, setPrecioPorPaciente] = useState("");
  // Exportar tabla de pacientes como CSV (sin datos sensibles -- confidencialidad Res.1843/2025 Art.19)
  const exportPatientTable = (patients, compName) => {
    const headers = [
      "N°",
      "Nombre_Trabajador",
      "Tipo_Doc",
      "Documento",
      "Sexo",
      "Edad",
      "Cargo",
      "Empresa",
      "EPS",
      "ARL",
      "Tipo_Examen",
      "Enfasis",
      "Fecha_Examen",
    ];
    const rows = patients.map((p, idx) => [
      idx + 1,
      p.nombres || "N/R",
      p.docTipo || "CC",
      p.docNumero || "N/R",
      p.genero === "Masculino"
        ? "M"
        : p.genero === "Femenino"
        ? "F"
        : p.genero || "N/R",
      p.edad || "N/R",
      p.cargo || "N/R",
      p.empresaNombre || "N/R",
      p.eps || "N/R",
      p.arl || "N/R",
      p.tipoExamen || "N/R",
      p.enfasisExamen || "N/R",
      p.fechaExamen || "N/R",
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    // Descarga CSV sin createObjectURL (compatible sandbox)
    const b64csv = btoa(unescape(encodeURIComponent("\uFEFF" + csv)));
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8;base64," + b64csv;
    a.download = `Trabajadores_${compName.replace(/\s/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  // B-20: DIAN Facturación Electrónica
  const [showDianPanel, setShowDianPanel] = useState(false);
  // Modal datos paciente para secretaria (sin ficha clínica)
  const [showSecretariaPatientModal, setShowSecretariaPatientModal] = useState(null);
  // Selector médico para reportes
  const [selectedMedicoReport, setSelectedMedicoReport] = useState("");
  // Modal checklist "Todo"
  const [showTodoChecklist, setShowTodoChecklist] = useState(false);
  const [todoSelection, setTodoSelection] = useState({
    certificado: true, hcCompleta: true, incapacidad: true,
    formula: true, derivaciones: true, examenes: true,
  });
  const [dianProvider, setDianProvider] = useState("siigo"); // 'siigo' | 'alegra' | 'manual'
  const [dianApiKey, setDianApiKey] = useState(() => {
    try {
      return _ss.getItem("siso_dian_apikey") || "";
    } catch {
      return "";
    }
  });
  const [billData, setBillData] = useState({
    number: "01",
    type: "empresa",
    companyId: "",
    clientName: "",
    clientNit: "",
    medicoId: "",
    tipoServicio: "ingreso",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    amountWords: "",
    concept:
      "EXAMENES MEDICOS OCUPACIONALES E INFORME DE SALUD DE LOS TRABAJADORES",
    bankName: "",
    accountType: "",
    accountNumber: "",
    totalPacientes: 0,
    precioPaciente: 0,
    billDoctorId: "",
    emitidaPor: "organizacion", // FASE 2: 'organizacion' | 'medico_independiente'
  });
  const [savedBillsList, setSavedBillsList] = useState([]);
  // ── B-F1-03 Portafolio de servicios ──────────────────────────────────
  const [portafolioItems, setPortafolioItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("siso_portafolio") || "[]");
    } catch {
      return [];
    }
  });
  const [portafolioForm, setPortafolioForm] = useState({
    nombre: "",
    codigo: "",
    precio: "",
    unidad: "Sesión",
    descripcion: "",
  });
  const [portafolioEditId, setPortafolioEditId] = useState(null);
  // ── B-F1-04 Cotizaciones ──────────────────────────────────────────────
  const [cotizaciones, setCotizaciones] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("siso_cotizaciones") || "[]");
    } catch {
      return [];
    }
  });
  const [cotizacionForm, setCotizacionForm] = useState({
    clienteNombre: "",
    clienteEmpresa: "",
    clienteEmail: "",
    clienteTel: "",
    items: [],
    notas: "",
    validezDias: 30,
    fecha: new Date().toISOString().split("T")[0],
    estado: "Pendiente",
  });
  const [cotizacionView, setCotizacionView] = useState("list");
  const [cotizacionSelId, setCotizacionSelId] = useState(null);
  // ── B-F2-01 Caja diaria ───────────────────────────────────────────────
  const [cajaMovimientos, setCajaMovimientos] = useState(() => {
    try {
      // PASO 6: usar clave aislada por empresa/usuario (si hay sesión guardada)
      const sess = JSON.parse(localStorage.getItem("siso_session") || "{}");
      const suf = sess?.empresaId
        ? "empresa_" + sess.empresaId
        : sess?.user || "shared";
      const scoped = JSON.parse(
        localStorage.getItem(`siso_caja_${suf}`) || "null"
      );
      if (scoped !== null) return scoped;
      return JSON.parse(localStorage.getItem("siso_caja") || "[]");
    } catch {
      return [];
    }
  });
  const [cajaForm, setCajaForm] = useState({
    tipo: "ingreso",
    concepto: "",
    monto: "",
    formaPago: "Efectivo",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [cajaTab, setCajaTab] = useState("hoy");
  // PASO 4: filtros de periodo en caja
  const [cajaFiltroPeriodo, setCajaFiltroPeriodo] = useState("hoy");
  const [cajaFiltroDesde, setCajaFiltroDesde] = useState("");
  const [cajaFiltroHasta, setCajaFiltroHasta] = useState("");
  // PASO 5: Módulo Contabilidad
  const [contabTab, setContabTab] = useState("resumen");
  const [contabPeriodo, setContabPeriodo] = useState("mes");
  // ── B-F2-04 Asistencia agenda ─────────────────────────────────────────
  const [asistenciaFecha, setAsistenciaFecha] = useState(
    new Date().toISOString().split("T")[0]
  );
  // ── B-F2-05 Evoluciones HC ────────────────────────────────────────────
  const [evolucionForm, setEvolucionForm] = useState({
    texto: "",
    nuevoConcept: "",
    fecha: new Date().toISOString().split("T")[0],
    // Sub-consulta completa (se llena al abrir modal de Evolución)
    codigoEvolucion: "",
    activeEvTab: "nota",
    motivoConsulta: "",
    diagnosticos: [{ cie10: "", descripcion: "", tipo: "Principal" }],
    planConducta: "",
    recomendaciones: "",
    formulaMedicamentos: [],
    derivaciones: [],
    incapacidad: {
      aplica: false,
      dias: 0,
      origen: "Común",
      diagnostico: "",
      desde: "",
      hasta: "",
    },
  });
  const [showEvolucionModal, setShowEvolucionModal] = useState(false);
  // ── B-PKG: Package de exámenes ────────────────────────────────────────────
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageChecklist, setPackageChecklist] = useState({});
  const [showPackages, setShowPackages] = useState(false);
  const [newComp, setNewComp] = useState(initialCompanyState);
  // ── PASO 1: Perfil IPS ──────────────────────────────────────────────────────
  const [ipsPerfilForm, setIpsPerfilForm] = useState({
    nombre: "",
    nit: "",
    dv: "",
    direccion: "",
    ciudad: "",
    telefono: "",
    correo: "",
    actividad: "",
    lema: "",
    logo: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationFound, setVerificationFound] = useState(null);
  const [activeUserMgmtTab, setActiveUserMgmtTab] = useState("list");
  const [pendingActivationPlan, setPendingActivationPlan] = useState(null); // plan pre-seleccionado desde renderPlanes
  const [sbCloudData, setSbCloudData] = useState(null); // datos reales de Supabase para almacenamiento
  const [sbLoading, setSbLoading] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    user: "",
    pass: "",
    name: "",
    role: "medico",
    license: "libre",
    secretariaPermisos: { ...SECRETARIA_PERMISOS_DEFAULT },
    medicosAsignados: [],
  });
  const [userEditId, setUserEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [propForm, setPropForm] = useState({
    empresa: "",
    nit: "",
    contacto: "",
    cargo: "",
    fecha: new Date().toISOString().split("T")[0],
    ciudad: "",
    numTrabajadores: "",
    servicios: [],
    observaciones: "",
    validez: "30",
    numero: "001",
  });
  const [selSvc, setSelSvc] = useState("");
  const [propModulo, setPropModulo] = useState("propuesta"); // 'propuesta' | 'cotizacion'
  // ── MENSAJERÍA INTERNA ──────────────────────────────────────────
  const [mensajes, setMensajes] = useState([]); // [{id,from,to,text,fecha,leido,respuesta,respondido}]
  const [showMensajePanel, setShowMensajePanel] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false); // B-19
  // B-18: 2FA TOTP
  const [twoFAStep, setTwoFAStep] = useState(null); // null | {user, foundUser}
  const [twoFAToken, setTwoFAToken] = useState("");
  const [twoFAError, setTwoFAError] = useState("");
  // B-22: Habeas Data - Ley 1581/2012
  const [habeasRequests, setHabeasRequests] = useState(() => {
    try {
      return JSON.parse(_ls.getItem("siso_habeas_requests") || "[]");
    } catch {
      return [];
    }
  });
  const [showHabeasModal, setShowHabeasModal] = useState(false);
  const [habeasForm, setHabeasForm] = useState({
    nombre: "",
    documento: "",
    tipo: "",
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  // Portal Público (acceso sin login)
  const [showPortalPublico, setShowPortalPublico] = useState(false);
  // B-29: IA Resumen
  const [aiResumen, setAiResumen] = React.useState("");
  const [aiCargando, setAiCargando] = React.useState(false);
  // B-26: ARL
  const [arlTab, setArlTab] = useState("at");
  // B-31: SVE
  const [svePrograma, setSvePrograma] = useState("DME");
  const [sveFiltroEmpresa, setSveFiltroEmpresa] = useState("");
  const [sveAIAnalisis, setSveAIAnalisis] = useState(null);
  const [sveAICargando, setSveAIAnalisisCargando] = useState(false);
  const [sveAIFiltroEmpresa, setSveAIFiltroEmpresa] = useState("");

  const [arlForm, setArlForm] = useState({});
  const [arlGuardados, setArlGuardados] = useState(() =>
    sp("siso_arl_reportes", [])
  );
  // B-15: Notificaciones
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifData, setNotifData] = useState({});
  // B-24: Portal del Trabajador
  const [portalCodigo, setPortalCodigo] = useState("");
  const [portalPaciente, setPortalPaciente] = useState(null);
  const [portalMultiple, setPortalMultiple] = useState([]); // múltiples HCs por cédula
  // B-21: Diagnóstico Epidemiológico
  const [epiEmpresa, setEpiEmpresa] = useState("todas");
  const [epiPeriodo, setEpiPeriodo] = useState("anio");
  const [epiTab, setEpiTab] = useState("resumen");
  // B-17: Telemedicina (Jitsi Meet)
  const [teleconsultas, setTeleconsultas] = useState(() => {
    try {
      return JSON.parse(_ls.getItem("siso_teleconsultas") || "[]");
    } catch {
      return [];
    }
  });
  const [teleForm, setTeleForm] = useState({
    paciente: "",
    documento: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: "",
    motivo: "",
    notas: "",
    consentimientoTele: false,
  });
  const [teleSalaActiva, setTeleSalaActiva] = useState(null); // {roomName, paciente, fecha, hora}
  const [teleTab, setTeleTab] = useState("nueva"); // 'nueva' | 'historial'
  const [mensajeRespuesta, setMensajeRespuesta] = useState(""); // texto de respuesta libre
  // ── AGENDA / SALA DE ESPERA ─────────────────────────────────────
  const [agendados, setAgendados] = useState([]); // [{id,nombre,doc,tipo,medicoId,hora,estado:'espera'|'atendiendo'|'atendido',horaInicio,horaFin}]
  const [showAgenda, setShowAgenda] = useState(false);
  const [agendaForm, setAgendaForm] = useState({
    // Identificación
    nombre: "",
    docTipo: "CC",
    docNumero: "",
    // Sociodemográficos
    fechaNacimiento: "",
    edad: "",
    genero: "",
    estadoCivil: "",
    escolaridad: "",
    grupoSanguineo: "",
    grupoEtnico: "",
    identidadGenero: "",
    // Contacto
    celular: "",
    telefono: "",
    email: "",
    residencia: "",
    zonaResidencia: "",
    estrato: "",
    tipoVivienda: "",
    numPersonasCargo: "",
    // Afiliaciones
    eps: "",
    arl: "",
    afp: "",
    nivelRiesgoARL: "",
    // Laboral
    empresa: "",
    cargo: "",
    dependencia: "",
    tipoContrato: "",
    turnoTrabajo: "",
    antiguedadEmpresa: "",
    // Agenda
    medicoId: "",
    tipoConsulta: "ingreso",
    fechaCita: "",
    horaCita: "",
    observacion: "",
    // Búsqueda
    _busquedaQuery: "",
    _showSuggs: false,
  });
  const [agendaSuggs, setAgendaSuggs] = useState([]);
  const [agendaTab, setAgendaTab] = useState("hoy"); // 'hoy' | 'proximas' | 'nueva'
  const [showComposeMensaje, setShowComposeMensaje] = useState(false);
  const [composeMensaje, setComposeMensaje] = useState({
    destinatarios: [],
    texto: "",
  });
  const fileInputRef = useRef(null);
  const fileInputSigRef = useRef(null);
  const csvInputRef = useRef(null);
  // ── SEGURIDAD: Auto-logout por inactividad (30 min) ─────────────────────
  const _inactivityRef = useRef(null);
  const _warnRef = useRef(null);
  const [inactivityWarning, setInactivityWarning] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(0);
  // ── EMPRESAS (component-level to avoid React #310) ──
  const [companiesTab, setCompaniesTab] = useState("lista");
  const [editingCompany, setEditingCompany] = useState(null);
  // ── CAJA POR MÉDICO (component-level) ──
  const [cajaMedicoPeriodo, setCajaMedicoPeriodo] = useState("mes");
  const [porcentajeMedico, setPorcentajeMedico] = useState(60); // % honorarios médico vs clínica
  // ── FASE 2: Médico de turno activo ──────────────────────────────────────
  const [medicoTurnoActivo, setMedicoTurnoActivo] = useState(() => {
    try {
      return localStorage.getItem("siso_medico_turno") || "";
    } catch {
      return "";
    }
  });
  // ── FASE 2: Lista de organizaciones (multi-tenant) ──────────────────────
  const [orgsList, setOrgsList] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("siso_orgs_list") || "null"
      );
      if (saved && Array.isArray(saved)) return saved;
    } catch {
      /* */
    }
    return [{ ...ORG_CONFIG_DEFAULT }]; // organización inicial
  });
  // ── FASE 2: Org activa para super_admin (puede navegar entre orgs) ───────
  const [activeOrgId, setActiveOrgId] = useState(ORG_DEFAULT_ID);
  // ── FASE 2: Tab panel super_admin ────────────────────────────────────────
  const [superAdminTab, setSuperAdminTab] = useState("orgs");
  // ── FASE 2: Form nueva organización ──────────────────────────────────────
  const [newOrgForm, setNewOrgForm] = useState({
    orgName: "",
    orgNit: "",
    adminUser: "",
    adminName: "",
    adminEmail: "",
    plan: "pro",
  });
  // ── PORTAL EMPRESA (component-level) ──
  const [portalEmpresaCodigo, setPortalEmpresaCodigo] = useState("");
  const [portalEmpresaEncontrada, setPortalEmpresaEncontrada] = useState(null);
  const [portalEmpresaPacientes, setPortalEmpresaPacientes] = useState([]);
  const [portalEmpresaTab, setPortalEmpresaTab] = useState("trabajadores");
  const [portalEmpresaBuscando, setPortalEmpresaBuscando] = useState(false);
  const [portalEmpresaFiltroDoc, setPortalEmpresaFiltroDoc] = useState(""); // filtro cédula en portal empresa
  const [portalActivadoInfo, setPortalActivadoInfo] = useState(null); // {empresa, portalCode} post-activación
  // ── PORTAL EMPRESA ADMIN (FASE 2) ──
  const [portalEmpresaAdmin, setPortalEmpresaAdmin] = useState(null); // empresa admin logueado
  const [portalAdminTab, setPortalAdminTab] = useState("medicos");
  const [portalAdminLoginUser, setPortalAdminLoginUser] = useState("");
  const [portalAdminLoginPass, setPortalAdminLoginPass] = useState("");
  const [nuevoMedicoEmpForm, setNuevoMedicoEmpForm] = useState({
    nombre: "",
    user: "",
    pass: "",
    rol: "medico",
  });
  const [sedeForm, setSedeForm] = useState({
    nombre: "",
    ciudad: "",
    direccion: "",
  });
  // ── IPS: Credenciales IPS desde Super Admin ──
  const [ipsCredForm, setIpsCredForm] = useState({
    nombre: "",
    user: "",
    pass: "",
    empresaId: null,
  });
  const [ipsEditingEmpId, setIpsEditingEmpId] = useState(null);
  const activeDoctorData = currentUser?.doctorData || DEFAULT_DOCTOR_DATA;
  const activeSignature = currentUser?.doctorData?.signature || doctorSignature;
  // ── Bloque 4-A: useMemo para cómputos costosos (bajo rendimiento) ─────────
  const _memoPatients = React.useMemo(() => patientsList, [patientsList]);
  const _memoCompanies = React.useMemo(() => companies, [companies]);
  const _memoBills = React.useMemo(() => savedBillsList, [savedBillsList]);
  const _memoReports = React.useMemo(() => savedReports, [savedReports]);
  const _memoPatientsCount = React.useMemo(() => patientsList.length, [patientsList]);
  const _memoClosedHCs = React.useMemo(
    () => patientsList.filter(p => p.estadoHistoria === "Cerrada" && !p._archivado),
    [patientsList]
  );
  // Debounce ref para guardado de caja (evita escrituras en cada keystroke)
  const _cajaSaveTimer = useRef(null);
  const saveCajaDebounced = React.useCallback((movs) => {
    if (_cajaSaveTimer.current) clearTimeout(_cajaSaveTimer.current);
    _cajaSaveTimer.current = setTimeout(() => {
      try {
        const suf = currentUser?.empresaId
          ? "empresa_" + currentUser.empresaId
          : currentUser?.user || "shared";
        localStorage.setItem(`siso_caja_${suf}`, JSON.stringify(movs));
        _sbSet(`siso_caja_movs_${suf}`, movs);
      } catch {}
    }, 800);
  }, [currentUser]);
  const showAlert = (msg) => setAlertMsg(msg);
  const showConfirm = (msg, onConfirm) => setConfirmConfig({ msg, onConfirm });
  const showPrompt = (msg, onSubmit, type = "text") => {
    setPromptValue("");
    setPromptConfig({ msg, onSubmit, type });
  };
  // B-24: Detectar acceso público al portal desde URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#portaltrabajador" || hash === "#portal") {
      history.replaceState(null, "", window.location.pathname);
      setShowPortalPublico(true);
    }
    // Deep-link: #portalempresa?code=EMP-XXXX-XXXX
    if (hash.startsWith("#portalempresa")) {
      const params = new URLSearchParams(
        hash.replace("#portalempresa", "").replace("?", "")
      );
      const code = params.get("code");
      if (code) setPortalEmpresaCodigo(code);
      history.replaceState(null, "", window.location.pathname);
      setView("portalempresa");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Portal empresa: auto-buscar empresa cuando llega deep-link con código
  useEffect(() => {
    if (
      view === "portalempresa" &&
      portalEmpresaCodigo &&
      !portalEmpresaEncontrada
    ) {
      const q = portalEmpresaCodigo.trim().toLowerCase();
      const emp = companies.find(
        (c) =>
          c.nit === q ||
          c.nit === portalEmpresaCodigo.trim() ||
          (c.id && c.id === q) ||
          (c.portalCode && c.portalCode.toLowerCase() === q) ||
          c.nombre?.toLowerCase().includes(q)
      );
      if (emp && emp.portalActivo) {
        const pacs = patientsList.filter(
          (p) =>
            (p.empresaId === emp.id || p.empresaNit === emp.nit) &&
            p.estadoHistoria === "Cerrada" &&
            !p._archivado
        );
        setPortalEmpresaEncontrada(emp);
        setPortalEmpresaPacientes(pacs);
      }
    }
  }, [view, portalEmpresaCodigo]); // eslint-disable-line react-hooks/exhaustive-deps

  // SUPABASE: conectar callback de status al estado React
  useEffect(() => {
    _syncState.callback = setSyncStatus;
    return () => {
      _syncState.callback = null;
    };
  }, []);

  // ══ POLLING DE PERMISOS: recarga usersList desde Supabase cada 30 seg ══════
  // Garantiza que los cambios del admin se apliquen en tiempo real para cualquier
  // usuario activo (especialmente secretarias cuyo admin modifica sus permisos)
  useEffect(() => {
    if (!currentUser) return; // solo si hay sesión activa
    const _reloadUsersFromCloud = async () => {
      try {
        // Estrategia 1: clave dedicada de permisos (más ligera, solo para secretaria)
        if (currentUser.role === "secretaria") {
          const permKey = `siso_permisos_${currentUser.user}`;
          const r = await fetch(
            `${_SB_URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(permKey)}&select=value,updated_at`,
            { headers: _SB_HEADERS }
          );
          if (r.ok) {
            const rows = await r.json();
            if (rows && rows.length > 0 && rows[0].value) {
              const permData = rows[0].value;
              const localRaw = _ls.getItem(permKey);
              const localData = localRaw ? JSON.parse(localRaw) : null;
              // Solo actualizar si hay cambios nuevos
              if (!localData || permData.updatedAt !== localData.updatedAt) {
                _ls.setItem(permKey, JSON.stringify(permData));
                // Actualizar usersList en memoria con los nuevos permisos
                setUsersList(prev => prev.map(u =>
                  u.user === currentUser.user
                    ? { ...u, secretariaPermisos: permData.secretariaPermisos, medicosAsignados: permData.medicosAsignados }
                    : u
                ));
                // Actualizar currentUser para que _secretariaPuede lo refleje inmediatamente
                setCurrentUser(prev => ({
                  ...prev,
                  secretariaPermisos: permData.secretariaPermisos,
                  medicosAsignados: permData.medicosAsignados,
                }));
              }
            }
          }
          return; // para secretaria, la clave dedicada es suficiente
        }
        // Estrategia 2: para admin/médico, recargar siso_users completo (menos frecuente)
        // Solo cuando la lista local parece desactualizada
      } catch (_) { /* silencioso */ }
    };
    // Ejecutar inmediatamente al montar/cambiar currentUser
    _reloadUsersFromCloud();
    // Polling cada 30 segundos mientras la sesión esté activa
    const _pollInterval = setInterval(_reloadUsersFromCloud, 30000);
    return () => clearInterval(_pollInterval);
  }, [currentUser?.user]); // eslint-disable-line react-hooks/exhaustive-deps
  // ══ B-09: Seguridad de cabeceras ═══════════════════════════════════════════
  // NOTA: El meta CSP ha sido eliminado porque causa el error 'unsafe-eval'.
  // Razón técnica: CodeSandbox/React/Babel usan eval() internamente para el
  // compilador en tiempo real (HMR). Un meta CSP sin 'unsafe-eval' bloquea el
  // propio bundler, rompiendo la aplicación.
  // La política CSP correcta debe ir en los HTTP headers del servidor:
  //   Content-Security-Policy: script-src 'self' 'unsafe-inline' 'unsafe-eval' ...
  // Solo X-Frame-Options se mantiene (es seguro y no interfiere con nada).
  useEffect(() => {
    // SEC-FIX-08a: X-Frame-Options - previene clickjacking (CWE-1021)
    if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
      const xfo = document.createElement("meta");
      xfo.httpEquiv = "X-Frame-Options";
      xfo.content = "SAMEORIGIN";
      document.head.appendChild(xfo);
    }
    // SEC-FIX-08b: Referrer-Policy - no expone URL en peticiones externas (CWE-200)
    if (!document.querySelector('meta[name="referrer"]')) {
      const rp = document.createElement("meta");
      rp.name = "referrer";
      rp.content = "strict-origin-when-cross-origin";
      document.head.appendChild(rp);
    }
    // SEC-FIX-08c: Permissions-Policy - restringe APIs del navegador no usadas
    if (!document.querySelector('meta[http-equiv="Permissions-Policy"]')) {
      const pp = document.createElement("meta");
      pp.httpEquiv = "Permissions-Policy";
      pp.content = "geolocation=(), microphone=(), camera=(), payment=()";
      document.head.appendChild(pp);
    }
  }, []);
  // ── PERF-01: CSS Global — Print + Mobile + content-visibility ─────────────
  useEffect(() => {
    if (document.getElementById("siso-perf-styles")) return;
    const style = document.createElement("style");
    style.id = "siso-perf-styles";
    style.textContent = `
      /* ── PRINT: evitar texto cortado en historias clínicas ── */
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-size: 9pt !important; }

        /* Todos los contenedores de texto: wrap completo, nunca cortar */
        p, span, div, td, th, li, label, input, textarea, pre {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          white-space: pre-wrap !important;
          overflow: visible !important;
          max-width: 100% !important;
        }

        /* Tablas: 100% ancho, sin overflow */
        table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
        td, th { word-break: break-word !important; overflow-wrap: break-word !important; vertical-align: top !important; padding: 3px 5px !important; }

        /* Secciones que NO deben cortarse entre páginas */
        .no-break-inside, section, article, .rounded-2xl, .rounded-xl, .bg-white {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        /* Grids y flex en columna única para impresión */
        .grid, .grid-cols-2, .grid-cols-3, .grid-cols-4 {
          display: block !important;
        }

        /* Ocultar elementos no imprimibles */
        .no-print, button:not(.print-btn), nav, [class*="no-print"] {
          display: none !important;
        }

        /* Asegurar que el contenido de textareas se vea completo */
        textarea, [contenteditable] {
          height: auto !important;
          min-height: unset !important;
          overflow: visible !important;
          white-space: pre-wrap !important;
        }

        /* Campos de formulario visibles */
        input[type="text"], input[type="date"], select {
          border: none !important;
          border-bottom: 1px solid #ccc !important;
          padding: 0 !important;
        }

        /* Saltos de página antes de secciones principales */
        .page-break-before { page-break-before: always !important; }

        /* Tamaño de página */
        @page { size: letter portrait; margin: 1.5cm; }
      }

      /* ── MOBILE: responsive para Android e iOS ── */
      @media (max-width: 768px) {
        /* Navbar compacta */
        nav { flex-wrap: wrap !important; gap: 4px !important; padding: 8px !important; }
        nav button, nav a { font-size: 11px !important; padding: 6px 8px !important; }

        /* Formularios en columna única */
        .grid-cols-2, .grid-cols-3, .grid-cols-4 {
          grid-template-columns: 1fr !important;
        }

        /* Tablas scroll horizontal */
        table { display: block !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }

        /* Touch targets mínimo 44px (Apple HIG / WCAG 2.5.5) */
        button, a, [role="button"], input[type="submit"] {
          min-height: 44px !important;
          min-width: 44px !important;
        }

        /* Texto legible en mobile */
        body, p, span, td, th { font-size: 14px !important; line-height: 1.5 !important; }
        h1 { font-size: 20px !important; }
        h2 { font-size: 17px !important; }
        h3 { font-size: 15px !important; }

        /* Contenedores: ancho completo sin overflow */
        .max-w-4xl, .max-w-5xl, .max-w-6xl, .max-w-7xl {
          max-width: 100% !important;
          padding-left: 12px !important;
          padding-right: 12px !important;
        }

        /* Modales ocupan pantalla completa */
        .fixed.inset-0 > div { width: 96vw !important; max-width: 96vw !important; margin: 0 auto !important; }

        /* Inputs más grandes para touch */
        input, select, textarea {
          font-size: 16px !important; /* Evita zoom automático en iOS */
          padding: 10px 12px !important;
        }
      }

      /* ── EXTRA SMALL: teléfonos 360px ── */
      @media (max-width: 480px) {
        .grid-cols-2 { grid-template-columns: 1fr !important; }
        .flex.gap-2, .flex.gap-3 { flex-wrap: wrap !important; }
        .text-xs { font-size: 12px !important; }
        .px-4 { padding-left: 10px !important; padding-right: 10px !important; }
      }

      /* ── PERF: content-visibility para carga inicial rápida ── */
      /* Solo aplica a secciones que no están visibles al inicio */
      .siso-lazy-section {
        content-visibility: auto;
        contain-intrinsic-size: 0 400px;
      }

      /* Smooth scrolling nativo (sin JS) */
      html { scroll-behavior: smooth; }

      /* Evitar parpadeo/reflow en imágenes */
      img { max-width: 100%; height: auto; }
    `;
    document.head.appendChild(style);
  }, []);
  // Load desde localStorage (inmediato) + Supabase (en background, gana si más reciente)
  useEffect(() => {
    // 1. Carga local inmediata para que la UI no espere
    const sessionUser = (() => {
      try {
        return JSON.parse(_ls.getItem("siso_session") || "null")?.user;
      } catch {
        return null;
      }
    })();
    setCompanies(sp(_compKey(sessionUser || "shared"), []));
    // Pacientes: cargar SOLO los del usuario de sesión activa (aislamiento absoluto)
    // Si no hay sesión guardada, dejar la lista vacía - se cargará en handleLogin
    if (sessionUser) {
      setPatientsList(sp(_patKey(sessionUser), []));
    }
    // NO cargar 'siso_db_patients' genérico - mezclaria pacientes de todos los médicos
    // ══ FIX DEFINITIVO: Cargar usuarios con persistencia real ══
    const storedUsers = sp("siso_users", null);
    if (storedUsers && Array.isArray(storedUsers) && storedUsers.length > 0) {
      const fixed = storedUsers.map((u) => {
        const init = initialUsers.find((i) => i.user === u.user);
        if (!u.passHash && init) {
          return { ...u, passHash: init.passHash, mustChangePassword: true };
        }
        if (init && init.doctorData?.nombre && !u.doctorData?.nombre) {
          return { ...u, doctorData: { ...init.doctorData, ...(u.doctorData || {}) } };
        }
        return u;
      });
      setUsersList(fixed);
      setUsersReady(true);
    } else {
      // ══ Cache vacío — ESPERAR a Supabase antes de permitir login ══
      (async () => {
        try {
          // Timeout de 8 segundos para no bloquear la UI si no hay internet
          const cloud = await Promise.race([
            _sbGetAll(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000))
          ]);
          if (cloud && cloud["siso_users"]?.value && Array.isArray(cloud["siso_users"].value) && cloud["siso_users"].value.length > 0) {
            let cloudUsers = cloud["siso_users"].value;
            // ══ MERGE: para cada usuario, verificar si hay doctorData dedicada más reciente ══
            cloudUsers = cloudUsers.map(u => {
              const dedicatedDD = cloud[`siso_doctor_data_${u.user}`]?.value;
              if (dedicatedDD && typeof dedicatedDD === "object") {
                return { ...u, doctorData: { ...(u.doctorData || {}), ...dedicatedDD } };
              }
              return u;
            });
            setUsersList(cloudUsers);
            _ls.setItem("siso_users", JSON.stringify(cloudUsers));
            // También restaurar firma, empresas y otros datos del médico
            if (cloud["siso_doctor_signature"]?.value) {
              setDoctorSignature(cloud["siso_doctor_signature"].value);
              _ls.setItem("siso_doctor_signature", cloud["siso_doctor_signature"].value);
            }
            if (cloud["siso_companies"]?.value && Array.isArray(cloud["siso_companies"].value)) {
              setCompanies(cloud["siso_companies"].value);
              _ls.setItem("siso_companies", JSON.stringify(cloud["siso_companies"].value));
            }
            // Restaurar AI config
            if (cloud["siso_ai_config_provider"]?.value) {
              const prov = cloud["siso_ai_config_provider"].value;
              setAiConfig(prev => ({ ...prev, activeProvider: prov.activeProvider || prev.activeProvider }));
              _ls.setItem("siso_ai_config_provider", JSON.stringify(prov));
            }
            // [SISO] Restauración desde Supabase completada
          } else {
            setUsersList(initialUsers);
          }
        } catch (err) {
          if (typeof console !== 'undefined') console.error("[SISO]", err?.message || err);
          setUsersList(initialUsers);
        } finally {
          setUsersReady(true);
        }
      })();
    }
    setSavedReports(sp("siso_saved_reports", []));
    setMensajes(sp("siso_mensajes", []));
    // PASO 6: cargar datos aislados por empresa/usuario desde sesión previa
    const _initSess = (() => {
      try {
        return JSON.parse(_ls.getItem("siso_session") || "{}");
      } catch {
        return {};
      }
    })();
    const _initSuf = _initSess?.empresaId
      ? "empresa_" + _initSess.empresaId
      : _initSess?.user || "shared";
    setAgendados(
      sp(`siso_agendados_${_initSuf}`, null) ?? sp("siso_agendados", [])
    );
    setAtencionesCerradas(
      sp(`siso_atenciones_${_initSuf}`, null) ??
        sp("siso_atenciones_cerradas", [])
    );
    setSavedBillsList(
      sp(`siso_saved_bills_${_initSuf}`, null) ?? sp("siso_saved_bills", [])
    );
    setDoctorSignature(_ls.getItem("siso_doctor_signature") || null);
    const emptyKeys = { groq: "", gemini: "", openrouter: "", together: "" };
    const savedProvider = sp("siso_ai_config_provider", {
      activeProvider: "gemini",
    });
    const savedKeys = sps("siso_ai_keys", emptyKeys);
    const mergedKeys = { ...emptyKeys, ...savedKeys };
    _ls.setItem("siso_ai_config_version", AI_CONFIG_VERSION);
    setAiConfig({
      activeProvider: savedProvider.activeProvider || "gemini",
      keys: mergedKeys,
    });
    // 2. Carga desde Supabase en background (datos más actualizados / otros dispositivos)
    setSyncStatus("loading");
    _sbGetAll().then((cloud) => {
      if (!cloud) {
        setSyncStatus("error");
        return;
      }
      // Para cada colección: si Supabase tiene datos más recientes, actualizar local y estado
      const applyCloud = (key, setter, fallback, localKey) => {
        if (!cloud[key]) return;
        const cloudVal = cloud[key].value;
        const cloudTs = new Date(cloud[key].updatedAt || 0).getTime();
        const localRaw = _ls.getItem(localKey || key);
        // Supabase siempre gana: tiene los datos de todos los dispositivos
        if (cloudVal !== null && cloudVal !== undefined) {
          const asString = JSON.stringify(cloudVal);
          _ls.setItem(localKey || key, asString);
          if (Array.isArray(cloudVal)) setter(cloudVal);
          else setter(cloudVal);
        }
      };
      // Pacientes: cargados por usuario específico en handleLogin - no cargar genérico
      // Empresas: se cargan por usuario en handleLogin, no aquí
      applyCloud("siso_saved_bills", setSavedBillsList, [], "siso_saved_bills");
      applyCloud(
        "siso_saved_reports",
        setSavedReports,
        [],
        "siso_saved_reports"
      );
      applyCloud("siso_audit_log", setAuditLog, [], "siso_audit_log");
      applyCloud("siso_mensajes", setMensajes, [], "siso_mensajes");
      applyCloud("siso_agendados", setAgendados, [], "siso_agendados");
      applyCloud(
        "siso_atenciones_cerradas",
        setAtencionesCerradas,
        [],
        "siso_atenciones_cerradas"
      );
      // Usuarios: PREFERIR datos de nube sobre initialUsers (FIX: persistencia de contraseña y datos médico)
      if (
        cloud["siso_users"]?.value &&
        Array.isArray(cloud["siso_users"].value) &&
        cloud["siso_users"].value.length > 0
      ) {
        const cloudUsers = cloud["siso_users"].value;
        setUsersList((prev) => {
          // Cloud users take priority - update existing + add new
          const merged = prev.map((localUser) => {
            const cloudVersion = cloudUsers.find((cu) => cu.user === localUser.user);
            if (cloudVersion) {
              // Cloud tiene este usuario - usar datos de nube (contraseña, doctorData, etc.)
              return {
                ...localUser,
                ...cloudVersion,
                // Preservar campos estructurales del initialUsers si no existen en cloud
                id: localUser.id || cloudVersion.id,
              };
            }
            return localUser;
          });
          // Agregar usuarios que solo existen en nube
          cloudUsers.forEach((cu) => {
            if (!merged.find((u) => u.user === cu.user)) merged.push(cu);
          });
          _ls.setItem("siso_users", JSON.stringify(merged));
          return merged;
        });
      }
      // Doctor signature
      if (cloud["siso_doctor_signature"]?.value) {
        const sig = cloud["siso_doctor_signature"].value;
        setDoctorSignature(sig);
        _ls.setItem("siso_doctor_signature", sig);
      }
      // AI provider
      if (cloud["siso_ai_config_provider"]?.value) {
        const prov = cloud["siso_ai_config_provider"].value;
        setAiConfig((prev) => ({
          ...prev,
          activeProvider: prov.activeProvider || prev.activeProvider,
        }));
      }
      setSyncStatus("ok");
      // Intentar vaciar la cola de pendientes
      _sbQueue.flush();
    });
  }, []);
  // ── AUTO-GUARDADO CADA 2 MINUTOS ─────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || view !== "historia") return;
    const timer = setInterval(() => {
      if (data.id && data.nombres) {
        const toSave = {
          ...data,
          fechaExamen:
            data.fechaExamen || new Date().toISOString().split("T")[0],
          _autoSaved: new Date().toISOString(),
        };
        const list = [...patientsList];
        const idx = list.findIndex((p) => p.id === toSave.id);
        if (idx >= 0) list[idx] = toSave;
        else list.push(toSave);
        setPatientsList(list);
        _syncPatients(list);
        setSaveStatus("auto");
        setTimeout(() => setSaveStatus(""), 2000);
      }
    }, 120000); // 2 minutos
    return () => clearInterval(timer);
  }, [currentUser, view, data, patientsList]);
  // ── BEFOREUNLOAD: advertir al recargar/cerrar pestaña con HC sucia ────────
  useEffect(() => {
    if (!_hcDirty || view !== "historia") return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [_hcDirty, view]);
  // ── AUTOGUARDADO RÁPIDO CADA 15 SEGUNDOS EN LOCALSTORAGE ─────────────────
  useEffect(() => {
    if (view !== "historia" || !data.nombres) return;
    const autoSaveInterval = setInterval(() => {
      try {
        const saveData = { ...data, _autoSaved: new Date().toISOString(), _userId: currentUser?.user };
        _ls.setItem("siso_active_form", JSON.stringify(saveData));
        _ls.setItem("siso_autosave_" + (data.id || "new"), JSON.stringify(saveData));
      } catch (_eAuto) { /* silencioso */ }
    }, 15000);
    return () => clearInterval(autoSaveInterval);
  }, [view, data, currentUser]);
  // ── GUARDAR EN SUPABASE CADA 60 SEGUNDOS SI HAY CAMBIOS ─────────────────
  useEffect(() => {
    if (view !== "historia" || !data.id || !data.nombres) return;
    const cloudSaveInterval = setInterval(() => {
      if (_hcDirty) {
        try {
          const key = "siso_autosave_cloud_" + (currentUser?.user || "anon") + "_" + data.id;
          _sbSet(key, { ...data, _cloudSaved: new Date().toISOString() });
        } catch (_eCloud) { /* silencioso */ }
      }
    }, 60000);
    return () => clearInterval(cloudSaveInterval);
  }, [view, data, _hcDirty, currentUser]);
  // Auto-IMC
  useEffect(() => {
    if (data.peso && data.talla) {
      const p = parseFloat(data.peso),
        t = parseFloat(data.talla) / 100;
      if (t > 0)
        setData((prev) => ({ ...prev, imc: (p / (t * t)).toFixed(2) }));
    }
  }, [data.peso, data.talla]);
  // Auto bill amount words
  useEffect(() => {
    if (billData.amount)
      setBillData((p) => ({
        ...p,
        amountWords:
          numeroALetras(billData.amount).toLowerCase() + " pesos mcte",
      }));
    else setBillData((p) => ({ ...p, amountWords: "" }));
  }, [billData.amount]);
  // ── AUTO-SYNC A SUPABASE CADA 2 MINUTOS ─────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const AUTO_INTERVAL_MS = 2 * 60 * 1000; // 2 minutos
    const doAutoBackup = async () => {
      try {
        if (_syncState.callback) _syncState.callback("syncing");
        // Sincronizar todas las colecciones a Supabase
        // PASO 6: usar claves aisladas por empresa/usuario
        const _asSuf = currentUser?.empresaId
          ? "empresa_" + currentUser.empresaId
          : currentUser?.user || "shared";
        const tasks = [
          _sbSet(_patKeyCloud(currentUser?.user || "shared"), patientsList),
          _sbSet(_compKeyCloud(currentUser?.user || "shared"), companies),
          _sbSet("siso_users", usersList),
          _sbSet(`siso_saved_bills_${_asSuf}`, savedBillsList),
          _sbSet("siso_saved_reports", savedReports),
          _sbSet("siso_audit_log", auditLog),
          _sbSet("siso_mensajes", mensajes),
          _sbSet(`siso_agendados_${_asSuf}`, agendados),
          _sbSet(`siso_atenciones_${_asSuf}`, atencionesCerradas),
          _sbSet("siso_ai_config_provider", {
            activeProvider: aiConfig.activeProvider,
          }),
        ];
        if (doctorSignature)
          tasks.push(_sbSet("siso_doctor_signature", doctorSignature));
        // FIX: Guardar doctorData del usuario actual como clave dedicada
        if (currentUser?.doctorData && currentUser?.user) {
          tasks.push(_sbSet(`siso_doctor_data_${currentUser.user}`, currentUser.doctorData));
        }
        // Bloque 3: módulos que antes solo vivían en localStorage
        const _u = currentUser?.user || "shared";
        if (cajaMovimientos?.length)
          tasks.push(_sbSet(`siso_caja_movs_${_u}`, cajaMovimientos));
        if (arlGuardados?.length)
          tasks.push(_sbSet(`siso_arl_${_u}`, arlGuardados));
        if (teleconsultas?.length)
          tasks.push(_sbSet(`siso_teleconsultas_${_u}`, teleconsultas));
        if (habeasRequests?.length)
          tasks.push(_sbSet(`siso_habeas_${_u}`, habeasRequests));
        // API keys del usuario actual
        const currentKeys = sps("siso_ai_keys", aiConfig.keys || {});
        if (currentUser?.user)
          tasks.push(_sbSet(`siso_ai_keys_${currentUser.user}`, currentKeys));
        const results = await Promise.all(tasks);
        const allOk = results.every(Boolean);
        if (_syncState.callback) _syncState.callback(allOk ? "ok" : "error");
        // Vaciar cola de pendientes
        await _sbQueue.flush();
      } catch (err) {
        if (typeof console !== 'undefined') console.error("[SISO]", err?.message || err);
        if (_syncState.callback) _syncState.callback("error");
      }
    };
    const timer = setInterval(doAutoBackup, AUTO_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [
    currentUser,
    patientsList,
    companies,
    usersList,
    savedReports,
    savedBillsList,
    aiConfig,
    doctorSignature,
    propForm,
    cajaMovimientos,
    arlGuardados,
    teleconsultas,
    habeasRequests,
  ]);
  // ── PERSISTENCIA DE SESIÓN: guarda estado completo en localStorage ────────
  useEffect(() => {
    if (!currentUser) return;
    _ls.setItem(
      "siso_last_activity",
      JSON.stringify({
        user: currentUser.user,
        ts: new Date().toISOString(),
        patientsCount: patientsList.length,
        companiesCount: companies.length,
      })
    );
  }, [
    currentUser,
    patientsList,
    companies,
    savedBillsList,
    savedReports,
    aiConfig,
  ]);
  // ── FIX: Auto-expandir textareas al escribir (delegación global) ──
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "TEXTAREA") {
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
      }
    };
    document.addEventListener("input", handler);
    return () => document.removeEventListener("input", handler);
  }, []);
  // ── SEC-F1-05: Prevenir pérdida de datos al cerrar pestaña ──
  useEffect(() => {
    const handler = (e) => {
      if (_hcDirty && view === "historia") {
        e.preventDefault();
        e.returnValue = "Tiene cambios sin guardar en la historia clínica. ¿Desea salir?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [_hcDirty, view]);
  // ── SEC-F1-06: Timeout de sesión inactiva (30 min) ──
  useEffect(() => {
    if (!currentUser) return;
    const resetTimer = () => _resetSessionTimer(() => {
      showAlert("⏰ Sesión expirada por inactividad (30 minutos).\nSus datos están guardados. Debe iniciar sesión nuevamente.");
      setCurrentUser(null);
      _ls.removeItem("siso_session");
      setView("login");
      _auditLog("SessionTimeout", currentUser?.user, "Sesión expirada por inactividad 30 min");
    });
    resetTimer();
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));
    return () => {
      _clearSessionTimer();
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, [currentUser]);
  // ── PERSISTENCIA DE VISTA Y SESIÓN: guarda la vista activa y usuario para restaurar al recargar
  useEffect(() => {
    if (currentUser && view !== "login") {
      _ls.setItem(
        "siso_session",
        JSON.stringify({
          user: currentUser.user,
          empresaId: currentUser.empresaId || null,
          view,
          navStack,
          activeTab,
          dataType,
        })
      );
    } else if (!currentUser) {
      // Al cerrar sesión, limpiar la sesión guardada
      _ls.removeItem("siso_session");
      _ls.removeItem("siso_active_form");
    }
  }, [currentUser, view, navStack, activeTab, dataType]);
  // ── PASO 1: Cargar datos empresa cuando se navega a perfilips ──────────────
  useEffect(() => {
    if (view !== "perfilips" || currentUser?.role !== "admin_empresa") return;
    const me = companies.find((c) => c.id === currentUser.empresaId) || {};
    setIpsPerfilForm({
      nombre: me.nombre || "",
      nit: me.nit || "",
      dv: me.dv || "",
      direccion: me.direccion || "",
      ciudad: me.ciudad || "",
      telefono: me.telefono || "",
      correo: me.correo || "",
      actividad: me.actividad || "",
      lema: me.lema || "",
      logo: me.logo || "",
      _loaded: true,
    });
  }, [view, currentUser?.empresaId, companies]);
  // ── PERSISTENCIA DEL FORMULARIO ACTIVO: guarda el borrador en tiempo real
  useEffect(() => {
    if (!currentUser || view !== "historia") return;
    // Solo guardar si hay datos mínimos para no sobreescribir con formulario vacío
    if (data && (data.nombres || data.id)) {
      _ls.setItem("siso_active_form", JSON.stringify(data));
    }
  }, [data, currentUser, view]);
  const _TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos
  const _WARN_MS = 29 * 60 * 1000; // aviso 1 min antes
  const _resetInactivity = React.useCallback(() => {
    setInactivityWarning(false);
    clearTimeout(_inactivityRef.current);
    clearTimeout(_warnRef.current);
    if (!currentUser) return;
    _warnRef.current = setTimeout(() => {
      setInactivityWarning(true);
      let secs = 60;
      setInactivityCountdown(secs);
      const cd = setInterval(() => {
        secs--;
        setInactivityCountdown(secs);
        if (secs <= 0) {
          clearInterval(cd);
        }
      }, 1000);
    }, _WARN_MS);
    _inactivityRef.current = setTimeout(() => {
      setCurrentUser(null);
      setView("login");
      setInactivityWarning(false);
      _ls.removeItem("siso_session");
      _ls.removeItem("siso_active_form");
      showAlert(
        "⏱️ Sesión cerrada por inactividad (30 min). Vuelva a iniciar sesión."
      );
    }, _TIMEOUT_MS);
  }, [currentUser]);
  React.useEffect(() => {
    if (!currentUser) return;
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    events.forEach((ev) =>
      window.addEventListener(ev, _resetInactivity, { passive: true })
    );
    _resetInactivity();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, _resetInactivity));
      clearTimeout(_inactivityRef.current);
      clearTimeout(_warnRef.current);
    };
  }, [currentUser, _resetInactivity]);
  // ── MOTOR IA ──────────────────────────────────────────────────────────────
  const callAI = useCallback(
    async (prompt, expectJson = false) => {
      const systemPrompt = expectJson
        ? `Eres médico especialista en Medicina del Trabajo y Salud Ocupacional en Colombia, con más de 15 años de experiencia en evaluaciones de aptitud laboral, ingresos, egresos, seguimientos periódicos y post-incapacidad, manejo de enfermedades laborales, calificación de origen y PCL, y gestión de programas de vigilancia epidemiológica (PVE) conforme a la Res. 1843/2025 (deroga 2346/2007), Res. 2404/2019, Dec. 1072/2015 y Ley 1562/2012. Cuando la consulta sea de medicina general, actúas como médico general con especialización en medicina interna y más de 15 años de experiencia clínica. Redactas con lenguaje técnico-médico formal, directo y puntual. RESPONDE ÚNICAMENTE CON JSON VÁLIDO, sin texto previo, sin bloques markdown, sin explicaciones adicionales. El JSON debe comenzar con { y terminar con }.`
        : `Eres médico especialista en Medicina del Trabajo y Salud Ocupacional en Colombia, con más de 15 años de experiencia en evaluaciones ocupacionales (ingreso, egreso, periódico, reintegro, post-incapacidad), restricciones médico-laborales, enfermedades laborales, vigilancia epidemiológica, calificación de origen y pérdida de capacidad laboral (PCL). Conoces a fondo la normativa vigente: Res. 1843/2025 (norma vigente, deroga Res. 2346/2007), Res. 2404/2019, Dec. 1072/2015, GTC-45:2012, GATISO-DME, GATISO-TME, Ley 1562/2012 y Res. 0312/2019. Cuando la consulta corresponde a medicina general, actúas como médico general con especialización clínica y más de 15 años de experiencia, manejando patología ambulatoria, crónica y aguda con criterio clínico sólido. Tu lenguaje es técnico, formal, directo y puntual. Respondes en español.`;
      // Orden de prioridad fijo: gemini → openrouter → groq → together
      // Groq puede fallar por CORS según el dominio; gemini y openrouter son más estables en browser
      const PRIORITY_ORDER = ["gemini", "openrouter", "groq", "together"];
      const activeKey = aiConfig.activeProvider || "gemini";
      // Poner el activo primero, luego el resto en orden de prioridad
      const fallbackOrder = [
        activeKey,
        ...PRIORITY_ORDER.filter((k) => k !== activeKey),
      ].filter((v, i, a) => a.indexOf(v) === i); // deduplicar
      let lastError = null;
      for (const providerKey of fallbackOrder) {
        const provider = AI_PROVIDERS[providerKey];
        if (!provider) continue;
        const key = aiConfig.keys?.[providerKey];
        if (!key || key === "auto") continue; // skip si no tiene key válida
        try {
          // [SEGURIDAD] log eliminado
          const text = await provider.call(prompt, systemPrompt, key);
          if (text && text.trim().length > 10) {
            setAiStatus("ok");
            // [SEGURIDAD] log eliminado
            return text; // ← BUG CORREGIDO: return siempre, no solo si no es activeKey
          }
        } catch (e) {
          if (typeof console !== 'undefined') console.error("[SISO][IA]", e?.message || e);
          lastError = e;
        }
      }
      setAiStatus("error");
      const providerNames = fallbackOrder
        .map((k) => AI_PROVIDERS[k]?.name || k)
        .join(", ");
      throw new Error(
        `⚠️ IA no disponible. Probados: ${providerNames}\n` +
          `Último error: ${lastError?.message || "sin respuesta"}\n\n` +
          `SOLUCIÓN: Abra ⚙️ IA → use el botón "Probar" en cada proveedor → obtenga una key nueva gratis en el enlace que aparece → guarde.\n` +
          `Las keys gratuitas expiran o alcanzan su límite. Renovarlas toma menos de 2 minutos.`
      );
    },
    [aiConfig]
  );
  // ── GENERACIÓN IA COMPLETA (Concepto + Diagnósticos) ─────────────────────
  const generateAIAnalysis = async () => {
    if (!_canUse("ia_analisis", currentUser)) {
      showAlert(
        "🔒 El análisis IA está disponible en el plan ⭐ Pro ($79.000/mes).\n\nMenú → ⭐ Ver Planes para actualizar."
      );
      return;
    }
    if (!data.cargo) {
      showAlert("Ingrese el cargo del trabajador para usar el análisis IA.");
      return;
    }
    setIsGenerating(true);
    const hallazgos =
      Object.entries(data.examenFisicoSistemas || {})
        .filter(([, v]) => v.estado === "Anormal")
        .map(([k, v]) => `${k}: ${v.hallazgo}`)
        .join("; ") || "Sin hallazgos patológicos";
    const antecedentes =
      Object.entries(data.antecedentesAgrupados || {})
        .filter(([, v]) => v.val)
        .map(([k, v]) => `${k}: ${v.det}`)
        .join(" | ") || "Niega";
    const riesgos =
      Object.entries(data.riesgos || {})
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", ") || "No reportados";
    // ── Contexto clínico adaptado al TIPO DE EXAMEN ──────────────────────────
    const _tipoExamen = (data.tipoExamen || "").toUpperCase();
    const _contextoTipo = (() => {
      if (_tipoExamen.includes("INGRESO"))
        return "EXAMEN DE INGRESO: Evalúa la aptitud INICIAL para el cargo. Las recomendaciones deben incluir: (A) Medidas preventivas desde el inicio de la relación laboral, (B) Identificación de factores de riesgo preexistentes vs laborales, (C) Línea de base para seguimiento futuro, (D) Programa de inducción en SST, (E) Exámenes paraclínicos de ingreso recomendados según riesgos.";
      if (
        _tipoExamen.includes("PERIÓDICO") ||
        _tipoExamen.includes("PERIODICO")
      )
        return "EXAMEN PERIÓDICO: Evalúa cambios en el estado de salud respecto al examen anterior. Las recomendaciones deben incluir: (A) Comparación con hallazgos previos y tendencias, (B) Seguimiento de patologías crónicas ya identificadas, (C) Adherencia a PVE (Programas de Vigilancia Epidemiológica) activos, (D) Refuerzo de medidas de control de riesgos laborales, (E) Indicadores de salud ocupacional: ausentismo, accidentes recientes.";
      if (_tipoExamen.includes("EGRESO") || _tipoExamen.includes("RETIRO"))
        return "EXAMEN DE EGRESO: Evalúa el estado de salud AL FINALIZAR el vínculo laboral. Las recomendaciones deben incluir: (A) Detección de enfermedades o secuelas de origen laboral (Decreto 1477/2014), (B) Determinación de origen laboral o común de hallazgos, (C) Indicar si el trabajador requiere seguimiento médico post-retiro, (D) Documentación de condiciones para eventual reporte a ARL, (E) Concepto sobre relación de causalidad con el cargo/empresa.";
      if (
        _tipoExamen.includes("POST") ||
        _tipoExamen.includes("INCAPACIDAD") ||
        _tipoExamen.includes("REINTEGRO")
      )
        return "EXAMEN POST-INCAPACIDAD / REINTEGRO LABORAL: Evalúa aptitud para retornar al trabajo tras incapacidad. Las recomendaciones deben incluir: (A) Condiciones específicas para el reintegro (gradual, modificado, pleno), (B) Restricciones temporales o permanentes con plazos y seguimiento, (C) Adaptaciones del puesto de trabajo necesarias, (D) Plan de rehabilitación laboral si aplica, (E) Criterios de seguimiento médico post-reintegro, (F) Articular con ARL para plan de reincorporación.";
      if (_tipoExamen.includes("SEGUIMIENTO"))
        return "EXAMEN DE SEGUIMIENTO: Evalúa la evolución de condiciones ya identificadas. Las recomendaciones deben incluir: (A) Respuesta al tratamiento o intervención previa, (B) Actualización del concepto de aptitud si hay cambios clínicos, (C) Ajuste de restricciones según evolución, (D) Próxima cita de seguimiento, (E) Indicadores de mejora o deterioro documentados.";
      // Default genérico
      return "Evalúa la aptitud del trabajador según los hallazgos clínicos actuales. Las recomendaciones deben ser específicas para el cargo, la empresa y los riesgos identificados.";
    })();

    const prompt = `Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en evaluaciones ocupacionales en Colombia (ingresos, egresos, periódicos, reintegros, post-incapacidad). Analiza con criterio clínico-ocupacional experto la siguiente historia y genera el concepto médico ocupacional conforme a Res. 1843/2025 (norma vigente - deroga Res. 2346/2007). Devuelve ÚNICAMENTE JSON válido sin markdown ni texto adicional.

DATOS DEL TRABAJADOR:
Cargo: ${data.cargo} | Empresa: ${data.empresaNombre} (${data.actividadEconomica || "N/E"}) | Tipo examen: ${data.tipoExamen} | Énfasis: ${data.enfasisExamen}
Edad: ${data.edad}a | Género: ${data.genero} | Escolaridad: ${data.escolaridad} | ARL: ${data.arl || "N/R"}
Signos vitales: TA ${data.ta || "N/R"} | FC ${data.fc || "N/R"} | IMC ${data.imc || "N/R"} | Talla ${data.talla || "N/R"}cm | Peso ${data.peso || "N/R"}kg
Hallazgos físicos patológicos: ${hallazgos}
Antecedentes personales relevantes: ${antecedentes}
Riesgos ocupacionales identificados: ${riesgos}
Hábitos: Tabaquismo ${data.habitos?.fuma} | Alcohol ${data.habitos?.alcohol} | Actividad física ${data.habitos?.deporte}

CONTEXTO ESPECÍFICO DEL TIPO DE EXAMEN: ${_contextoTipo}

CRITERIOS OBLIGATORIOS:
1) El concepto de aptitud debe citar el artículo de la Res. 1843/2025 correspondiente (norma vigente desde 29 abril 2025 - Res. 2346/2007 derogada).
2) Si es egreso o post-incapacidad, incluir análisis de reintegro laboral.
3) Las restricciones deben ser operativas, cuantificables y con base normativa (GTC-45, GATISO).
4) Las recomendaciones deben ser específicas para el cargo y los riesgos, no genéricas, y deben responder al contexto del tipo de examen indicado arriba.
5) DERIVACIONES: Si hay hallazgos anormales, OBLIGATORIO generar MÍNIMO 3 derivaciones a especialidades pertinentes. Especialidades disponibles: Medicina Interna, Cardiología, Neumología, Ortopedia, Traumatología, Neurología, Oftalmología, Otorrinolaringología, Dermatología, Urología, Gastroenterología, Endocrinología, Reumatología, Psiquiatría, Psicología, Fisiatría (Medicina Física y Rehabilitación), Cirugía General, Nutrición, Optometría, Audiología, Fonoaudiología, Terapia Física, Terapia Ocupacional, Salud Ocupacional, Toxicología. Selecciona las más pertinentes según hallazgos clínicos.
6) RESTRICCIONES: Cada restricción debe incluir TIPO (Temporal/Permanente), DURACIÓN si temporal (ej: "30 días", "3 meses"), SEGMENTO corporal afectado (Columna lumbar, MMSS, MMII, Cervical, Postural, Visual, Auditivo, General), y BASE NORMATIVA (GTC-45:2012, GATISO-DME, GATISO-TME, Res. 1843/2025, Res. 2404/2019). Formato: "[TEMPORAL - 30 días] (Columna lumbar) No levantar cargas >12.5kg — GATISO-DME 2015"
7) EXÁMENES PARACLÍNICOS: SOLO si el cargo y los riesgos ocupacionales lo justifican clínicamente, sugerir exámenes paraclínicos pertinentes (laboratorios, imagenología, pruebas funcionales, audiometría, espirometría, optometría, visiometría, electrocardiograma, etc.). Si el trabajador está APTO sin hallazgos relevantes, devolver array vacío []. NO inventar exámenes innecesarios. Usar criterio clínico real.
8) FÓRMULA MÉDICA: SOLO si los hallazgos clínicos REQUIEREN tratamiento farmacológico, incluir formulaMedica y formulaMedicamentos. Si NO se requiere medicación (trabajador sano, examen de ingreso normal, etc.), devolver cadena vacía y array vacío respectivamente. NO prescribir medicamentos innecesarios.
9) INCAPACIDAD: SOLO si hay hallazgos que REALMENTE limitan temporalmente la capacidad laboral, indicar aplica:true con días y motivo. En la mayoría de exámenes ocupacionales de rutina, aplica:false.
10) SVE: SOLO recomendar Sistemas de Vigilancia Epidemiológica que REALMENTE apliquen según los hallazgos clínicos encontrados y los riesgos del cargo. Si no hay hallazgos que lo justifiquen, devolver array vacío []. NO incluir SVE genéricos ni condicionales tipo "si aplica".

JSON REQUERIDO (sin markdown, sin texto adicional):
{"diagnosticoPrincipal":"Z10.0 - EXAMEN MÉDICO OCUPACIONAL","diagnosticoSecundario1":"CIE-10 con descripción del hallazgo clínico o cadena vacía","diagnosticoSecundario2":"CIE-10 con segundo hallazgo o cadena vacía","conceptoAptitud":"Concepto de aptitud laboral (APTO/APTO CON RESTRICCIONES/NO APTO) con justificación cargo-hallazgos. NO mencionar diagnósticos específicos, medicamentos, ni tratamientos. Solo aptitud y condiciones laborales. Conforme Res. 1843/2025 Art. 20","vigencia":"X meses con justificación clínica","recomendaciones":"Mínimo 10 recomendaciones de medicina preventiva y salud ocupacional enfocadas en cargo y riesgos. NO incluir medicamentos ni tratamiento farmacológico. NO referir tratamiento médico actual","restriccionesTexto":"Restricciones médico-laborales con formato: [TIPO - DURACIÓN] (Segmento) Descripción cuantificable — Base normativa. Mínimo 5 si hay hallazgos anormales","derivaciones":[{"especialidad":"Nombre de especialidad","motivo":"Motivo clínico concreto basado en hallazgos","urgencia":"Electiva/Prioritaria/Urgente"}],"examenesSugeridos":["Solo si aplica según cargo y riesgos, sino array vacío []"],"interconsultaResumen":"Resumen clínico para interconsulta o cadena vacía","incapacidadSugerida":{"aplica":false,"dias":0,"motivo":"","diagnosticoCIE":""},"formulaMedica":"Solo si requiere tratamiento farmacológico, sino cadena vacía","formulaMedicamentos":[],"analisisClinico":"Análisis clínico detallado con lenguaje técnico-formal de médico especialista en medicina laboral con más de 15 años de experiencia. Incluir: interpretación de hallazgos, correlación cargo-riesgos ocupacionales, referencias a normativa colombiana (Dec. 1072/2015, Res. 2346/2007, Res. 1843/2025). Mínimo 200 palabras.","sveRecomendado":["Solo SVE que realmente apliquen según hallazgos, sino array vacío []"]}`;    try {
      let text;
      try {
        text = await callAI(prompt, true);
      } catch (_e1) {
        // Retry con prompt simplificado
        try {
          text = await callAI("Analiza esta HC ocupacional y devuelve JSON con campos: diagnosticoPrincipal, conceptoAptitud, recomendaciones, restriccionesTexto, derivaciones[], examenesSugeridos[], analisisClinico, sveRecomendado[], incapacidadSugerida, formulaMedica, formulaMedicamentos[], vigencia, diagnosticoSecundario1, diagnosticoSecundario2, interconsultaResumen. Datos: " + JSON.stringify({cargo: data.cargo, hallazgos, antecedentes, riesgos, edad: data.edad, tipoExamen: data.tipoExamen, empresa: data.empresaNombre}), true);
        } catch (_e2) {
          throw _e1;
        }
      }
      const parsed = parseAIJSON(text);
      // Para énfasis OCUPACIONAL: diagnóstico principal siempre Z10.0 (examen ocupacional)
      // Los diagnósticos encontrados pasan a secundarios
      const isOcupacional =
        (data.enfasisExamen || "GENERAL").toUpperCase() !== "GENERAL" ||
        [
          "INGRESO",
          "PERIODICO",
          "PERIÓDICO",
          "EGRESO",
          "RETIRO",
          "POST-INCAPACIDAD",
          "REINTEGRO",
          "SEGUIMIENTO",
        ].some((t) => (data.tipoExamen || "").toUpperCase().includes(t));
      const dxPrincipalFinal = "Z10.0 - EXAMEN MÉDICO OCUPACIONAL";
      // El dx que traería la IA como principal pasa a secundario1 si es ocupacional
      const aiDxPrincipal = parsed.diagnosticoPrincipal || "";
      const dxSec1Final = isOcupacional
        ? aiDxPrincipal && !aiDxPrincipal.includes("Z10")
          ? aiDxPrincipal
          : parsed.diagnosticoSecundario1 || ""
        : parsed.diagnosticoSecundario1 || "";
      const dxSec2Final = isOcupacional
        ? aiDxPrincipal &&
          !aiDxPrincipal.includes("Z10") &&
          parsed.diagnosticoSecundario1
          ? parsed.diagnosticoSecundario1
          : parsed.diagnosticoSecundario2 || ""
        : parsed.diagnosticoSecundario2 || "";
      setData((prev) => ({
        ...prev,
        diagnosticoPrincipal: isOcupacional
          ? dxPrincipalFinal
          : parsed.diagnosticoPrincipal || prev.diagnosticoPrincipal,
        diagnosticoSecundario1: dxSec1Final || prev.diagnosticoSecundario1,
        diagnosticoSecundario2: dxSec2Final || prev.diagnosticoSecundario2,
        conceptoAptitud: parsed.conceptoAptitud || prev.conceptoAptitud,
        vigencia: parsed.vigencia || prev.vigencia,
        recomendaciones: parsed.recomendaciones || prev.recomendaciones,
        analisisRestricciones:
          parsed.restriccionesTexto || prev.analisisRestricciones,
        formulaMedica: parsed.formulaMedica || prev.formulaMedica,
        formulaMedicamentos: parsed.formulaMedicamentos?.length
          ? parsed.formulaMedicamentos.map((m, i) => ({
              ...m,
              id: Date.now() + i,
            }))
          : prev.formulaMedicamentos,
      }));
      // Aplicar también derivaciones, exámenes, interconsulta e incapacidad si la IA los sugirió
      if (parsed.derivaciones?.length > 0) {
        const newDervs = parsed.derivaciones.map((d, i) => ({
          id: Date.now() + i,
          especialidad: d.especialidad || "",
          motivo: d.motivo || "",
          urgencia: d.urgencia || "Electiva",
          _fromAI: true,
        }));
        setData((prev) => ({
          ...prev,
          derivaciones: [...(prev.derivaciones || []), ...newDervs],
        }));
      }
      if (parsed.examenesSugeridos?.length > 0) {
        setData((prev) => {
          const existingExams = prev.solicitudExamenes || [];
          const existingNames = new Set(existingExams.map(e => (e.nombre || '').toLowerCase()));
          const newAIExams = parsed.examenesSugeridos
            .filter(name => !existingNames.has(name.toLowerCase()))
            .map(name => ({
              nombre: name,
              fecha: new Date().toISOString().split("T")[0],
              urgente: false,
              incluirEnRecomendaciones: false,
              _fromAI: true,
            }));
          return {
            ...prev,
            solicitudExamenes: [...existingExams, ...newAIExams],
            paraclinicosCheck: {
              ...(prev.paraclinicosCheck || {}),
              _aiSugeridos: parsed.examenesSugeridos.join("\n"),
            },
          };
        });
      }
      if (
        parsed.incapacidadSugerida?.aplica &&
        parsed.incapacidadSugerida.dias > 0
      ) {
        setData((prev) => ({
          ...prev,
          incapacidad: {
            ...(prev.incapacidad || {}),
            dias: parsed.incapacidadSugerida.dias,
            motivo:
              parsed.incapacidadSugerida.motivo ||
              prev.incapacidad?.motivo ||
              "",
            diagnosticoCIE:
              parsed.incapacidadSugerida.diagnosticoCIE ||
              prev.incapacidad?.diagnosticoCIE ||
              dxSec1Final ||
              "",
          },
        }));
      }
      // ── Guardar Análisis Clínico IA (campo independiente) ──
      if (parsed.analisisClinico) {
        setData((prev) => ({
          ...prev,
          analisisIA: parsed.analisisClinico,
        }));
      }
      // ── Guardar SVE Recomendado por IA ──
      if (parsed.sveRecomendado?.length > 0) {
        setData((prev) => ({
          ...prev,
          sveRecomendado: parsed.sveRecomendado.filter(s => s && s.length > 5),
        }));
      }
      const extraMsg = [
        parsed.derivaciones?.length > 0
          ? `\n• ${parsed.derivaciones.length} derivación(es) sugerida(s)`
          : "",
        parsed.examenesSugeridos?.length > 0
          ? `\n• ${parsed.examenesSugeridos.length} examen(es) sugerido(s)`
          : "",
        parsed.incapacidadSugerida?.aplica
          ? `\n• Incapacidad sugerida: ${parsed.incapacidadSugerida.dias} días`
          : "",
        parsed.analisisClinico
          ? `\n• Análisis clínico generado`
          : "",
        parsed.sveRecomendado?.length > 0
          ? `\n• ${parsed.sveRecomendado.filter(s => s && s.length > 5).length} SVE sugerido(s)`
          : "",
      ].join("");
      showAlert(
        "✅ Análisis IA completado.\n• Diagnóstico principal: Z10.0 - EXAMEN MÉDICO OCUPACIONAL\n• Diagnósticos secundarios incluidos si hay hallazgos." +
          extraMsg +
          "\n\nRevise y ajuste los campos según su criterio clínico."
      );
    } catch (e) {
      showAlert(
        `Error IA: ${e.message}\n\nConfigure un proveedor de IA en el botón ⚙️ IA o verifique su conexión.`
      );
    } finally {
      setIsGenerating(false);
    }
  };
  // ── GENERACIÓN IA SOLO RESTRICCIONES ─────────────────────────────────────
  const generateAIRestricciones = async () => {
    setIsGeneratingRestr(true);
    const hallazgos =
      Object.entries(data.examenFisicoSistemas || {})
        .filter(([, v]) => v.estado === "Anormal")
        .map(([k, v]) => `${k}: ${v.hallazgo}`)
        .join("; ") || "Sin hallazgos";
    const osteo = Object.entries(data.maniobrasOsteomusculares || {})
      .filter(([, v]) => v.estado === "Anormal")
      .map(([k, v]) => `${k}: ${v.hallazgo}`)
      .join("; ");
    const prompt = `Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en Colombia, experto en restricciones médico-laborales, reintegro laboral y vigilancia epidemiológica. Con base en los hallazgos clínicos del trabajador, genera las restricciones médico-laborales correspondientes. Devuelve ÚNICAMENTE JSON válido sin markdown.

DATOS: Cargo: ${data.cargo} | Empresa: ${data.empresaNombre} | Tipo examen: ${data.tipoExamen}
Riesgos ocupacionales: ${Object.entries(data.riesgos || {}).filter(([, v]) => v).map(([k]) => k).join(", ") || "No reportados"}
Hallazgos físicos patológicos: ${hallazgos}
Maniobras osteomusculares positivas: ${osteo || "Ninguna"}
IMC: ${data.imc} | TA: ${data.ta} | Diagnóstico principal: ${data.diagnosticoPrincipal}

INSTRUCCIÓN: Genera restricciones médico-laborales en formato estructurado. Cada restricción DEBE incluir:
- TIPO: "Temporal" o "Permanente" (si es temporal, indicar duración exacta)
- DURACIÓN: Tiempo específico (ej: "30 días", "3 meses", "6 semanas") o "N/A" si permanente
- SEGMENTO: Segmento corporal afectado (Columna lumbar, Columna cervical, Miembro superior derecho/izquierdo, Miembro inferior, Mano/muñeca, Hombro, Rodilla, Cadera, Postural, Visual, Auditivo, Cardiovascular, Respiratorio, General)
- DESCRIPCIÓN: Operativa y cuantificable (en kg, min, grados, ciclos/min o frecuencias)
- NORMATIVA: Base legal específica (GTC-45:2012, GATISO-DME 2006, GATISO-Hombro doloroso, GATISO-TME, Res. 1843/2025 Art. 13, Res. 2404/2019, Res. 2844/2007)

Si el examen es egreso, post-incapacidad o retorno-laboral (Res. 1843/2025 Art. 13), incluir restricciones de reintegro progresivo.

JSON REQUERIDO (sin markdown):
{"restricciones":[{"texto":"Descripción completa de la restricción","tipo":"Temporal","duracion":"30 días","segmento":"Columna lumbar","normativa":"GATISO-DME 2006","descripcion":"No levantar cargas superiores a 12.5 kg de forma repetitiva"}]}`;
    try {
      const text = await callAI(prompt, true);
      const parsed = parseAIJSON(text);
      const lista = (parsed.restricciones || [])
        .map(
          (r, i) =>
            `${i + 1}. [${(r.tipo || "TEMPORAL").toUpperCase()}${
              r.duracion && r.duracion !== "N/A" ? " - " + r.duracion : ""
            }] (${r.segmento || "General"}) ${r.descripcion || r.texto || ""} — ${r.normativa || "GTC-45"}`
        )
        .join("\n");
      setData((prev) => ({ ...prev, analisisRestricciones: lista }));
      showAlert(
        "✅ Restricciones generadas por IA con tipo, duración y base normativa. Revise y ajuste según criterio clínico."
      );
    } catch (e) {
      showAlert(`Error IA Restricciones: ${e.message}`);
    } finally {
      setIsGeneratingRestr(false);
    }
  };
  // ── GENERACIÓN IA SOLO RECOMENDACIONES ───────────────────────────────────
  const generateAIRecomendaciones = async () => {
    setIsGeneratingReco(true);
    const prompt = `Eres médico especialista en Medicina del Trabajo con más de 15 años de experiencia en Colombia. Genera recomendaciones médico-laborales y de promoción de la salud ESPECÍFICAS para el trabajador evaluado. No uses recomendaciones genéricas. Responde en texto plano numerado, sin JSON, en español formal y directo.
DATOS: Cargo: ${data.cargo} | Empresa: ${
      data.empresaNombre
    } | Actividad económica: ${data.actividadEconomica || "N/E"}
Riesgos laborales identificados: ${
      Object.entries(data.riesgos || {})
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", ") || "N/R"
    }
IMC: ${data.imc} | TA: ${data.ta} | Tabaquismo: ${
      data.habitos?.fuma
    } | Alcohol: ${data.habitos?.alcohol} | Actividad física: ${
      data.habitos?.deporte
    }
Diagnóstico principal: ${data.diagnosticoPrincipal}
Tipo de examen: ${data.tipoExamen}
INSTRUCCIÓN: Genera mínimo 12 recomendaciones numeradas diferenciando: (A) Recomendaciones médicas y de estilo de vida (B) Recomendaciones ergonómicas específicas para el cargo (C) Recomendaciones de vigilancia epidemiológica y seguimiento (D) Recomendaciones al empleador conforme Res. 1843/2025 y Dec. 1072/2015. Lenguaje técnico-médico, formal, directo y puntual.`;
    try {
      const text = await callAI(prompt, false);
      setData((prev) => ({ ...prev, recomendaciones: text.trim() }));
      showAlert("✅ Recomendaciones generadas por IA.");
    } catch (e) {
      showAlert(`Error IA Recomendaciones: ${e.message}`);
    } finally {
      setIsGeneratingReco(false);
    }
  };
  // ── GENERACIÓN IA MEDICINA GENERAL ───────────────────────────────────────
  const generateAIGeneral = async () => {
    if (!_canUse("ia_analisis", currentUser)) {
      showAlert(
        "🔒 El análisis IA está disponible en el plan ⭐ Pro ($79.000/mes).\n\nMenú → ⭐ Ver Planes para actualizar."
      );
      return;
    }
    if (!data.motivoConsulta) {
      showAlert("Ingrese el motivo de consulta para usar IA.");
      return;
    }
    setIsGenerating(true);
    const prompt = `Eres médico general con más de 15 años de experiencia clínica en Colombia, especializado en medicina ambulatoria, patología crónica y aguda. Analiza la consulta médica del paciente con criterio clínico sólido y elabora el plan de manejo completo. Devuelve ÚNICAMENTE JSON.
DATOS DEL PACIENTE: ${data.nombres} | Edad: ${data.edad}a | Género: ${
      data.genero
    }
Motivo de consulta: ${data.motivoConsulta}
Enfermedad actual: ${data.enfermedadActual || "No detallada"}
Antecedentes: ${JSON.stringify(data.antecedentes || {})}
Examen físico: TA ${data.examenFisico?.ta || "N/R"} | FC ${
      data.examenFisico?.fc || "N/R"
    } | Temp ${data.examenFisico?.temp || "N/R"} | IMC ${
      data.examenFisico?.imc || "N/R"
    }
Hallazgos físicos: ${data.examenFisico?.hallazgos || "Ninguno referido"}
Revisión por sistemas: ${JSON.stringify(data.revisionSistemas || {})}
INSTRUCCIÓN: El análisis clínico debe ser razonado, con diagnóstico diferencial implícito. La conducta debe ser específica para este paciente. Los medicamentos deben incluir principio activo, presentación, dosis, frecuencia y duración. Las remisiones deben justificarse clínicamente. El control debe ser en tiempo específico. Lenguaje técnico-médico formal y directo.
JSON REQUERIDO (sin markdown, sin texto adicional):
{"diagnosticos":[{"cie10":"CIE-10","descripcion":"Nombre diagnóstico completo","tipo":"Principal/Secundario/Presuntivo"}],"plan":{"conducta":"Conducta médica detallada y razonada","medicamentos":"Resumen breve del plan farmacológico","formulaMedicamentos":[{"nombre":"Nombre genérico (principio activo)","presentacion":"Forma farmacéutica y concentración - ej: Tableta 500mg","dosis":"Cantidad por toma - ej: 1 tableta","frecuencia":"Intervalo - ej: cada 8 horas","duracion":"Ej: 7 días","indicaciones":"Indicación especial o cadena vacía"}],"paraclinicosSolicitados":"Paraclínicos con justificación clínica","remisiones":"Remisiones a especialista justificadas clínicamente o 'No aplica'","recomendaciones":"Recomendaciones específicas al paciente: dieta, actividad, signos de alarma, medidas no farmacológicas","controlEn":"Control en X días/semanas con criterios específicos"},"analisis":"Razonamiento clínico del caso en 4-5 líneas: hipótesis diagnóstica, correlación clínica y justificación del plan"}`;
    try {
      const text = await callAI(prompt, true);
      const parsed = parseAIJSON(text);
      setData((prev) => ({
        ...prev,
        diagnosticos: parsed.diagnosticos?.length
          ? parsed.diagnosticos
          : prev.diagnosticos,
        plan: { ...prev.plan, ...parsed.plan },
        formulaMedicamentos: parsed.plan?.formulaMedicamentos?.length
          ? parsed.plan.formulaMedicamentos.map((m, i) => ({
              ...m,
              id: Date.now() + i,
            }))
          : parsed.formulaMedicamentos?.length
          ? parsed.formulaMedicamentos.map((m, i) => ({
              ...m,
              id: Date.now() + i,
            }))
          : prev.formulaMedicamentos,
        enfermedadActual:
          prev.enfermedadActual ||
          (parsed.analisis
            ? `ANÁLISIS IA: ${parsed.analisis}`
            : prev.enfermedadActual),
      }));
      showAlert("✅ Análisis IA completado para consulta general.");
    } catch (e) {
      showAlert(`Error IA: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  // ── GENERACIÓN REPORTE IA ─────────────────────────────────────────────────
  const generateAIReport = async (stats, total, companyName) => {
    if (!_canUse("ia_reporte", currentUser)) {
      showAlert(
        "🔒 Los reportes IA están disponibles en el plan ⭐ Pro ($79.000/mes).\n\nMenú → ⭐ Ver Planes para actualizar."
      );
      return;
    }
    setIsGeneratingReport(true);
    const fmtDist = (obj) =>
      Object.entries(obj || {})
        .sort(([, a], [, b]) => b - a)
        .map(([k, v]) => `${k}:${v}(${((v / total) * 100).toFixed(1)}%)`)
        .join(" | ");
    const datosBase = [
      `Empresa: "${companyName}" | Trabajadores: ${total}`,
      `SOCIODEM: Género: ${fmtDist(stats.genero)} | Edad: ${fmtDist(
        stats.edad
      )} | Escolaridad: ${fmtDist(stats.escolaridad)} | E.civil: ${fmtDist(
        stats.estadoCivil
      )} | Estrato: ${fmtDist(stats.estrato)}`,
      `OCUPACIONAL: Cargos: ${fmtDist(stats.cargo)} | Contrato: ${fmtDist(
        stats.tipoContrato
      )} | Turno: ${fmtDist(stats.turnoTrabajo)} | Antigüedad: ${fmtDist(
        stats.antiguedad
      )} | Tipo examen: ${fmtDist(stats.tipoExamen)}`,
      `CLÍNICO: IMC: ${fmtDist(stats.imc)} | TA: ${fmtDist(
        stats.ta
      )} | Diagnósticos: ${fmtDist(stats.diagnosticos)} | Aptitud: ${fmtDist(
        stats.conceptoAptitud
      )} | Hallazgos: ${fmtDist(stats.hallazgos)}`,
      `ANTECEDENTES: Cardio ${stats.antecCardio || 0} | Resp ${
        stats.antecResp || 0
      } | Osteo ${stats.antecOsteo || 0} | Neuro ${
        stats.antecNeuro || 0
      } | Metab ${stats.antecMetab || 0} | Qx ${stats.antecQuirurg || 0}`,
      `REV SISTEMAS: Cardio ${stats.revCardio || 0} | Resp ${
        stats.revResp || 0
      } | Osteo ${stats.revOsteo || 0} | Neuro ${stats.revNeuro || 0} | GI ${
        stats.revGastro || 0
      }`,
      `RIESGOS: ${fmtDist(stats.riesgos)} | Tabaco ${
        stats.fumadores || 0
      } | Alcohol ${stats.alcohol || 0} | Deporte ${stats.deporte || 0}`,
    ].join("\n");
    // LLAMADA 1 - campos cortos: resumen, PVE, tabla, normativa
    const prompt1 =
      "Médico especialista Medicina del Trabajo Colombia. Datos:\n" +
      datosBase +
      "\n\nDevuelve ÚNICAMENTE JSON sin markdown con 4 claves exactas:" +
      '{"resumenEjecutivo":"4 líneas gerencia: hallazgos críticos, morbilidad, aptitud, acciones. Max 400 chars.",' +
      '"pveRecomendados":["PVE Osteomuscular - Res.2404/2019","PVE Cardiovascular - Res.2404/2019","PVE Psicosocial - Res.2404/2019","PVE Auditivo - Res.2400/1979","PVE Visual - Res.2400/1979"],' +
      '"tabla":[{"diagnostico":"CIE-10 descripción","cantidad":0,"porcentaje":"0%","relacion":"probable/posible/no relacionado"}],' +
      '"matrizLegalNormativa":"Res.1843/2025, Dec.1072/2015, Res.0312/2019, Ley 1562/2012, Res.2404/2019 - cumplimiento verificado."}';
    // LLAMADA 2 - conclusiones + análisis justificado + recomendaciones (Punto 11)
    const prompt2 =
      "Eres médico especialista en Medicina del Trabajo y Salud Ocupacional en Colombia con más de 15 años de experiencia (Res.1843/2025, Dec.1072/2015, Res.0312/2019, GTC-45:2012). Datos:\n" +
      datosBase +
      "\n\nElabora un informe técnico-epidemiológico completo con las siguientes 3 secciones:" +
      "\n\n1. ANÁLISIS JUSTIFICADO (mínimo 300 palabras): Interpretación epidemiológica de los resultados colectivos. Prevalencia de patologías con soporte estadístico. Distribución por cargo/área. Factores de riesgo identificados según GTC-45. Correlación entre morbilidad encontrada y exposición ocupacional. Mención de normativa aplicable." +
      "\n\n2. CONCLUSIONES (mínimo 200 palabras): Resumen ejecutivo de los hallazgos más relevantes. Indicadores epidemiológicos críticos. Nivel de cumplimiento del SG-SST. Riesgos prioritarios identificados." +
      "\n\n3. RECOMENDACIONES (mínimo 250 palabras): Acciones correctivas específicas. Programas de vigilancia epidemiológica (PVE/SVE) sugeridos con base normativa. Ajustes en el SG-SST conforme Res. 0312/2019. Seguimiento médico prioritario por grupos de riesgo. Cronograma sugerido de intervenciones." +
      '\n\nDevuelve ÚNICAMENTE JSON válido sin markdown: {"analisisJustificado":"texto completo sección 1","conclusiones":"texto completo sección 2","recomendacionesInforme":"texto completo sección 3"}';
    try {
      const [text1, text2] = await Promise.all([
        callAI(prompt1, true),
        callAI(prompt2, true),
      ]);
      const parte1 = parseAIJSON(text1);
      const parte2 = parseAIJSON(text2);
      setReportAIResult({ ...parte1, conclusiones: parte2.conclusiones || "", analisisJustificado: parte2.analisisJustificado || "", recomendacionesInforme: parte2.recomendacionesInforme || "" });
    } catch (e) {
      showAlert(`⚠️ Error IA Reporte: ${e.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };
  // ── HANDLERS GENERALES ────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (view === "historia") _setHcDirty(true);
  };
  // ── GUARDADO MANUAL EN NUBE CON REPORTE ─────────────────────────────────
  const handleManualCloudSave = async () => {
    setSyncStatus("syncing");
    const ts = new Date().toISOString();
    const currentKeys = sps("siso_ai_keys", aiConfig.keys || {});
    const keysGuardadas = Object.entries(currentKeys)
      .filter(([, v]) => v && v.length > 8)
      .map(([k]) => k);
    const _bkSuf = currentUser?.empresaId ? "empresa_" + currentUser.empresaId : currentUser?.user || "shared";
    const tasks = {
      [`Pacientes / HC (${currentUser?.user})`]: _sbSet(
        _patKeyCloud(currentUser?.user || "shared"),
        patientsList
      ),
      Empresas: _sbSet(_compKeyCloud(currentUser?.user || "shared"), companies),
      "Usuarios y perfiles": _sbSet("siso_users", usersList),
      "Facturas / Cuentas de cobro": _sbSet(`siso_saved_bills_${_bkSuf}`, savedBillsList),
      "Informes guardados": _sbSet("siso_saved_reports", savedReports),
      "Log de auditoría": _sbSet("siso_audit_log", auditLog),
      "Mensajes internos": _sbSet("siso_mensajes", mensajes),
      "Agenda / Citas": _sbSet(`siso_agendados_${_bkSuf}`, agendados),
      "Atenciones cerradas": _sbSet(`siso_atenciones_${_bkSuf}`, atencionesCerradas),
      "Configuración IA (proveedor)": _sbSet("siso_ai_config_provider", {
        activeProvider: aiConfig.activeProvider,
      }),
      ...(doctorSignature
        ? { "Firma digital": _sbSet("siso_doctor_signature", doctorSignature) }
        : {}),
      ...(currentUser?.doctorData && currentUser?.user
        ? { [`Datos médico (${currentUser.user})`]: _sbSet(`siso_doctor_data_${currentUser.user}`, currentUser.doctorData) }
        : {}),
      ...(currentUser?.user && keysGuardadas.length
        ? {
            [`API Keys (${keysGuardadas.join(", ")})`]: _sbSet(
              `siso_ai_keys_${currentUser.user}`,
              currentKeys
            ),
          }
        : {}),
    };
    const results = {};
    for (const [label, promise] of Object.entries(tasks)) {
      try {
        results[label] = await promise;
      } catch {
        results[label] = false;
      }
    }
    await _sbQueue.flush();
    const allOk = Object.values(results).every(Boolean);
    setSyncStatus(allOk ? "ok" : "error");
    setSyncReport({
      ts,
      results,
      summary: {
        pacientes: patientsList.length,
        empresas: companies.length,
        usuarios: usersList.length,
        facturas: savedBillsList.length,
        informes: savedReports.length,
        auditLog: auditLog.length,
        firma: !!doctorSignature,
        apiKeys: keysGuardadas,
      },
    });
    setShowSyncReport(true);
  };
  const handleSaveAIConfig = (cfg) => {
    setAiConfig(cfg);
    // Keys en sessionStorage (seguridad) + Supabase (persistencia por usuario)
    const keysJson = JSON.stringify(cfg.keys || {});
    _ss.setItem("siso_ai_keys", keysJson);
    _sync(
      "siso_ai_config_provider",
      JSON.stringify({ activeProvider: cfg.activeProvider })
    );
    // Guardar keys en Supabase bajo clave específica del usuario
    const userKey = `siso_ai_keys_${currentUser?.user || "default"}`;
    _sbSet(userKey, cfg.keys || {}).then(() => {});
    // También guardar en localStorage para fallback offline
    _ls.setItem("siso_ai_config_version", "v3");
    showAlert("✅ Configuración de IA guardada en la nube.");
  };
  
const handleLogin = (u, p) => {
    // SEC: Rate limiting - verificar bloqueo
    if (_rl.isBlocked()) {
      showAlert(`⛔ Demasiados intentos fallidos. Intente de nuevo en ${_rl.getRemainingMin()} minuto(s).`);
      return;
    }

  
// ============================================================
    // FIX C-01: SOLO comparar contra passHash (SHA-256) - eliminado fallback texto plano
    _sha256(p).then(async (hash) => {
      // Migración automática: si el usuario tiene .pass en texto plano (versión anterior),
      // se migra a passHash en este momento sin exponer el texto plano
      const migratedList = usersList.map((usr) => {
        if (!usr.passHash && usr.pass) {
          // Programar migración asíncrona
          _sha256(usr.pass).then((h) => {
            const updated = usersList.map((x) =>
              x.id === usr.id ? { ...x, passHash: h, pass: undefined } : x
            );
            _sync("siso_users", JSON.stringify(updated));
          });
        }
        return usr;
      });
      // SEC-09: verificar con PBKDF2 (salt) o SHA-256 legacy (sin salt)
      let found = null;
      for (const x of migratedList) {
        if (x.user === u) {
          const ok = await _verifyPassword(p, x.passHash, x.passSalt);
          if (ok) {
            found = x;
            break;
          }
        }
      }
      // CAMBIO 7 - SEC: Fallback a Supabase si usuario no hallado en lista local
      // Resuelve el caso de nuevo dispositivo / caché borrado / contraseña cambiada
      if (!found) {
        try {
          const cloudData = await _sbGetAll();
          if (cloudData?.["siso_users"]?.value && Array.isArray(cloudData["siso_users"].value)) {
            const cloudUserList = cloudData["siso_users"].value;
            // FIX: REEMPLAZAR usuarios locales con datos de nube (no solo agregar faltantes)
            setUsersList(() => {
              _ls.setItem("siso_users", JSON.stringify(cloudUserList));
              return cloudUserList;
            });
            // También restaurar firma y empresas desde nube
            if (cloudData["siso_doctor_signature"]?.value) {
              setDoctorSignature(cloudData["siso_doctor_signature"].value);
              _ls.setItem("siso_doctor_signature", cloudData["siso_doctor_signature"].value);
            }
            if (cloudData["siso_companies"]?.value && Array.isArray(cloudData["siso_companies"].value)) {
              setCompanies(cloudData["siso_companies"].value);
              _ls.setItem("siso_companies", JSON.stringify(cloudData["siso_companies"].value));
            }
            // Re-verificar credenciales contra lista de Supabase
            for (const x of cloudUserList) {
              if (x.user === u) {
                const ok = await _verifyPassword(p, x.passHash, x.passSalt);
                if (ok) {
                  // Merge doctorData dedicada si existe
                  const dedicatedDD = cloudData[`siso_doctor_data_${x.user}`]?.value;
                  found = dedicatedDD && typeof dedicatedDD === "object"
                    ? { ...x, doctorData: { ...(x.doctorData || {}), ...dedicatedDD } }
                    : x;
                  break;
                }
              }
            }
            // Restaurar AI keys si existen
            if (found) {
              const aiKeysCloud = cloudData[`siso_ai_keys_${found.user}`]?.value;
              if (aiKeysCloud && typeof aiKeysCloud === "object") {
                _ss.setItem("siso_ai_keys", JSON.stringify(aiKeysCloud));
                setAiConfig(prev => ({ ...prev, keys: aiKeysCloud }));
              }
            }
          }
        } catch (err) {
          if (typeof console !== 'undefined') console.error("[SISO]", err?.message || err);
        }
      }
      if (found && found.activo === false) {
        showAlert(
          "⛔ Esta cuenta está desactivada. Contacte al administrador."
        );
        return;
      }
      if (found) {
        // B-18: Si el usuario tiene 2FA activo, pausar y pedir token
        if (found.twoFA?.enabled && found.twoFA?.secret) {
          setTwoFAStep({ foundUser: found });
          setTwoFAToken("");
          setTwoFAError("");
          return;
        }
        // ══ B-05: Resetear contador de intentos fallidos en login exitoso ══
        setLoginAttempts(0);
        _ls.removeItem("siso_login_attempts");
        _ls.removeItem("siso_login_blocked_until");
        // CIBERSEGURIDAD: Agregar sesionId único al usuario (trazabilidad RDA Res. 1888/2025)
        const sesId =
          "SES-" +
          Date.now().toString(36).toUpperCase() +
          "-" +
          Math.random().toString(36).substr(2, 6).toUpperCase();
        // FASE 2: Asegurar que el usuario tiene orgId (migración automática de datos existentes)
        const foundConOrg = found.orgId
          ? found
          : { ...found, orgId: ORG_DEFAULT_ID };
        const foundConSesion = { ...foundConOrg, sesionId: sesId };
        // ── Para secretaria: cargar permisos actualizados desde Supabase al login ──
        // Esto garantiza que los permisos del admin estén vigentes desde el primer momento
        const _initWithPermisos = async (baseSesion) => {
          if (baseSesion.role === "secretaria") {
            try {
              const permKey = `siso_permisos_${baseSesion.user}`;
              const r = await fetch(
                `${_SB_URL}/rest/v1/siso_store?key=eq.${encodeURIComponent(permKey)}&select=value`,
                { headers: _SB_HEADERS }
              );
              if (r.ok) {
                const rows = await r.json();
                if (rows && rows.length > 0 && rows[0].value) {
                  const permData = rows[0].value;
                  _ls.setItem(permKey, JSON.stringify(permData));
                  // Fusionar permisos frescos de Supabase con el objeto de sesión
                  const sesionConPermisos = {
                    ...baseSesion,
                    secretariaPermisos: permData.secretariaPermisos || baseSesion.secretariaPermisos,
                    medicosAsignados: permData.medicosAsignados || baseSesion.medicosAsignados || [],
                  };
                  setCurrentUser(sesionConPermisos);
                  // También actualizar usersList local
                  setUsersList(prev => prev.map(u =>
                    u.user === baseSesion.user ? { ...u, ...sesionConPermisos } : u
                  ));
                  return;
                }
              }
            } catch (_) { /* silencioso, usar permisos locales */ }
          }
          setCurrentUser(baseSesion);
        };
        _initWithPermisos(foundConSesion);
        // CIBERSEGURIDAD: Activar timer de sesión 30 min (Punto 4 - Supabase/sesión segura)
        _resetSessionTimer(() => {
          setCurrentUser(null);
          setView("login");
          _ls.removeItem("siso_session");
        });
        const entrada = {
          id: Date.now(),
          fecha: new Date().toISOString(),
          usuario: found.user,
          nombreUsuario: found.name,
          rol: found.role,
          sesionId: sesId,
          accion: "Login",
          pacienteId: null,
          tipo: "Autenticación",
          userAgent:
            typeof navigator !== "undefined"
              ? navigator.userAgent?.substring(0, 120)
              : "N/A",
        };
        setAuditLog((prev) => {
          const n = [entrada, ...prev].slice(0, 500);
          setTimeout(() => _sync("siso_audit_log", JSON.stringify(n)), 0);
          return n;
        });
        // Al hacer login: cargar pacientes del médico específico (aislamiento)
        // ── IPS: si el usuario tiene empresaId, usar storage compartido de empresa ──
        const _storageUserId = found.empresaId
          ? "empresa_" + found.empresaId
          : found.user;
        const userPatKey = _patKey(_storageUserId);
        const userPatKeyCloud = _patKeyCloud(_storageUserId);
        const localPats = sp(userPatKey, []);
        // IPS: migración — si el usuario tenía datos personales, copiarlos al bucket empresa
        if (found.empresaId) {
          const personalPats = sp(_patKey(found.user), []);
          if (personalPats.length > 0 && localPats.length === 0) {
            // Primera vez con empresaId: migrar datos personales al bucket empresa
            _ls.setItem(userPatKey, JSON.stringify(personalPats));
            setPatientsList(personalPats);
          } else if (personalPats.length > 0 && localPats.length > 0) {
            // Merge: agregar pacientes personales que no estén en el bucket empresa
            const existingIds = new Set(localPats.map((p) => p.id));
            const nuevos = personalPats.filter((p) => !existingIds.has(p.id));
            if (nuevos.length > 0) {
              const merged = [...localPats, ...nuevos];
              _ls.setItem(userPatKey, JSON.stringify(merged));
              setPatientsList(merged);
            } else {
              setPatientsList(localPats);
            }
          } else {
            setPatientsList(localPats);
          }
        } else {
          setPatientsList(localPats); // inmediato desde local
        }
        _ls.setItem("siso_active_form", ""); // limpiar borrador del usuario anterior
        // Cargar desde Supabase: pacientes propios, empresas propias + API keys
        const userCompKey = _compKey(_storageUserId);
        const userCompKeyCloud = _compKeyCloud(_storageUserId);
        let localComps = sp(userCompKey, []);
        // ── IPS: si empresa user no tiene companies, copiar del admin de la org ──
        if (found.empresaId && localComps.length === 0) {
          // Buscar companies en el storage del admin de la org
          const allUsers = JSON.parse(_ls.getItem("siso_users") || "[]");
          const orgAdmins = allUsers.filter(
            (u) =>
              u.orgId === found.orgId &&
              (_isAdmin(u.role) || u.role === "super_admin")
          );
          for (const adm of orgAdmins) {
            const admComps = sp(_compKey(adm.user), []);
            if (admComps.length > 0) {
              // Copiar la empresa específica + "PARTICULAR" si existe
              const miEmpresa = admComps.filter(
                (c) => c.id === found.empresaId
              );
              if (miEmpresa.length > 0) {
                localComps = miEmpresa;
                _ls.setItem(userCompKey, JSON.stringify(localComps));
                break;
              }
            }
          }
        }
        setCompanies(localComps);
        // ── PASO 6: cargar caja, agenda, atenciones y facturas aislados por empresa ──
        const _loadScoped = (scopedKey, globalKey) => {
          const s = sp(scopedKey, null);
          if (s !== null) return s;
          // Migración: si hay datos en clave global, copiar a clave propia
          const g = sp(globalKey, []);
          if (g.length > 0) {
            try {
              _ls.setItem(scopedKey, JSON.stringify(g));
            } catch {}
          }
          return g;
        };
        setCajaMovimientos(
          _loadScoped(`siso_caja_${_storageUserId}`, "siso_caja")
        );
        setAgendados(
          _loadScoped(`siso_agendados_${_storageUserId}`, "siso_agendados")
        );
        setAtencionesCerradas(
          _loadScoped(
            `siso_atenciones_${_storageUserId}`,
            "siso_atenciones_cerradas"
          )
        );
        setSavedBillsList(
          _loadScoped(`siso_saved_bills_${_storageUserId}`, "siso_saved_bills")
        );
        _sbGetAll().then((cloud) => {
          if (!cloud) return;
          // Pacientes del usuario específico (o empresa compartida)
          const cloudPats = cloud?.[userPatKeyCloud]?.value;
          const currentLocalPats = sp(userPatKey, []);
          if (
            Array.isArray(cloudPats) &&
            cloudPats.length >= currentLocalPats.length
          ) {
            setPatientsList(cloudPats);
            _ls.setItem(userPatKey, JSON.stringify(cloudPats));
          }
          // Empresas del usuario específico (o empresa compartida)
          const cloudComps = cloud?.[userCompKeyCloud]?.value;
          if (
            Array.isArray(cloudComps) &&
            cloudComps.length >= localComps.length
          ) {
            setCompanies(cloudComps);
            _ls.setItem(userCompKey, JSON.stringify(cloudComps));
          } else if (localComps.length === 0) {
            // Si no hay empresas propias, verificar clave legacy compartida
            const legacyComps = cloud?.["siso_companies"]?.value;
            if (Array.isArray(legacyComps) && legacyComps.length > 0) {
              const mine = legacyComps.filter(
                (co) => co._userId === found.user || !co._userId
              );
              if (mine.length > 0) {
                setCompanies(mine);
                _ls.setItem(userCompKey, JSON.stringify(mine));
                // Migrar automáticamente a clave propia
                _sbSet(userCompKeyCloud, mine);
              }
            }
          }
          // ══ FIX DEFINITIVO: Restaurar TODOS los datos del usuario desde Supabase ══
          // 1. API keys del usuario
          const aiKeyCloud = cloud?.[`siso_ai_keys_${found.user}`]?.value;
          if (aiKeyCloud && typeof aiKeyCloud === "object") {
            _ss.setItem("siso_ai_keys", JSON.stringify(aiKeyCloud));
            setAiConfig((prev) => ({ ...prev, keys: aiKeyCloud }));
          }
          // 2. DoctorData desde clave DEDICADA (siempre la más actualizada)
          const doctorDataCloud = cloud?.[`siso_doctor_data_${found.user}`]?.value;
          // 3. DoctorData desde siso_users (embebido en el array de usuarios)
          const cloudUsersList = cloud?.["siso_users"]?.value;
          const cloudUserEntry = Array.isArray(cloudUsersList)
            ? cloudUsersList.find(u => u.user === found.user) : null;
          // 4. Merge: prioridad = dedicado > embebido en users > local
          const mergedDoctorData = {
            ...(found.doctorData || {}),
            ...(cloudUserEntry?.doctorData || {}),
            ...(doctorDataCloud && typeof doctorDataCloud === "object" ? doctorDataCloud : {}),
          };
          const hasDoctorData = mergedDoctorData.nombre || mergedDoctorData.licencia || mergedDoctorData.cedula;
          if (hasDoctorData) {
            setCurrentUser((prev) => ({
              ...prev,
              doctorData: mergedDoctorData,
            }));
            // Persistir en usersList y localStorage para próxima carga
            setUsersList((prev) => {
              const updated = prev.map((u) =>
                u.user === found.user ? { ...u, doctorData: mergedDoctorData } : u
              );
              _ls.setItem("siso_users", JSON.stringify(updated));
              return updated;
            });
          }
          // 5. Firma digital
          if (cloud?.["siso_doctor_signature"]?.value) {
            setDoctorSignature(cloud["siso_doctor_signature"].value);
            _ls.setItem("siso_doctor_signature", cloud["siso_doctor_signature"].value);
          }
          // 6. Si el usuario en nube tiene firma embebida en doctorData
          if (mergedDoctorData.signature && !doctorSignature) {
            setDoctorSignature(mergedDoctorData.signature);
          }
          // 7. AI provider config
          if (cloud?.["siso_ai_config_provider"]?.value) {
            const prov = cloud["siso_ai_config_provider"].value;
            setAiConfig((prev) => ({
              ...prev,
              activeProvider: prov.activeProvider || prev.activeProvider,
            }));
            _ls.setItem("siso_ai_config_provider", JSON.stringify(prov));
          }
        });
        // ══ B-07: Si primer login, forzar cambio de contraseña ══
        if (foundConSesion.mustChangePassword) {
          goTo("changePassword");
        } else {
          goTo("dashboard");
        }
      } else {
        // ══ B-05: Rate limiting mejorado - 15 min, persistente, con audit log ══
        setLoginAttempts((prev) => {
          const next = prev + 1;
          _ls.setItem("siso_login_attempts", String(next));
          if (next >= 5) {
            const blockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutos (OWASP rec.)
            setLoginBlockedUntil(blockedUntil);
            _ls.setItem("siso_login_blocked_until", String(blockedUntil));
            // Registrar en audit log como evento de seguridad
            const alertaSeguridad = {
              id: Date.now(),
              fecha: new Date().toISOString(),
              usuario: u,
              tipo: "ALERTA_SEGURIDAD",
              descripcion: `Login bloqueado tras 5 intentos fallidos para usuario: ${u}`,
              ip: "cliente-web",
            };
            setAuditLog((prev2) => {
              const n = [alertaSeguridad, ...prev2].slice(0, 500);
              setTimeout(() => _sync("siso_audit_log", JSON.stringify(n)), 0);
              return n;
            });
            showAlert(
              "🔒 Acceso bloqueado por 15 minutos debido a múltiples intentos fallidos.\nSi olvidó su contraseña, contacte al administrador del sistema."
            );
          } else {
            showAlert(
              `⚠️ Credenciales incorrectas. Intentos fallidos: ${next}/5. Tras 5 intentos se bloqueará el acceso por 15 minutos.`
            );
          }
          return next;
        });
      }
    });
  };
  // B-18: Verificar token TOTP
  const handleVerify2FA = async () => {
    if (!twoFAStep) return;
    const { foundUser } = twoFAStep;
    const ok = await _totpVerify(foundUser.twoFA.secret, twoFAToken.trim());
    if (!ok) {
      setTwoFAError(
        "❌ Código incorrecto. Verifique su app autenticadora e intente de nuevo."
      );
      setTwoFAToken("");
      return;
    }
    // Código correcto - continuar con el flujo normal de login
    setTwoFAStep(null);
    setTwoFAError("");
    setLoginAttempts(0);
    _ls.removeItem("siso_login_attempts");
    _ls.removeItem("siso_login_blocked_until");
    const sesId =
      "SES-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random().toString(36).substr(2, 6).toUpperCase();
    const foundConSesion = { ...foundUser, sesionId: sesId };
    setCurrentUser(foundConSesion);
    _resetSessionTimer(() => {
      setCurrentUser(null);
      setView("login");
      _ls.removeItem("siso_session");
    });
    const entrada = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      usuario: foundUser.user,
      nombreUsuario: foundUser.name,
      rol: foundUser.role,
      accion: "LOGIN_2FA_OK",
      sesionId: sesId,
    };
    setAuditLog((prev) => {
      const n = [entrada, ...prev].slice(0, 500);
      setTimeout(() => _sync("siso_audit_log", JSON.stringify(n)), 100);
      return n;
    });
    const userPatKey = _patKey(foundUser.user);
    const localPats = sp(userPatKey, []);
    setPatientsList(localPats);
    _ls.setItem("siso_active_form", "");
    const userCompKey = _compKey(foundUser.user);
    setCompanies(sp(userCompKey, []));
    if (foundUser.mustChangePassword) {
      goTo("changePassword");
    } else {
      goTo("dashboard");
    }
  };
  // ── Guard: visibilidad de HC según rol y org (FASE 2) ───────────────────
  const canViewPatient = (p) => {
    if (!p) return false;
    if (!currentUser) return false;
    // FASE 2: super_admin ve TODOS los pacientes de todas las orgs
    if (currentUser.role === "super_admin") return true;
    // FASE 2: aislamiento multi-org — si el paciente tiene _orgId de otra org: denegar
    const myOrgId = currentUser.orgId || ORG_DEFAULT_ID;
    if (p._orgId && p._orgId !== myOrgId) return false;
    if (_isAdmin(currentUser.role)) return true;
    // ── IPS: admin_empresa ve TODOS los pacientes de su empresa ──
    if (currentUser.role === "admin_empresa") {
      if (!currentUser.empresaId) return false;
      const empA = companies.find((c) => c.id === currentUser.empresaId);
      return (
        p.empresaId === currentUser.empresaId ||
        (empA && p.empresaNit === empA.nit)
      );
    }
    if (currentUser.role === "medico") {
      // IPS: médico vinculado a empresa → ve TODOS los pacientes de la empresa (cross-read)
      if (currentUser.empresaId) {
        const emp = companies.find((c) => c.id === currentUser.empresaId);
        return (
          p.empresaId === currentUser.empresaId ||
          (emp && p.empresaNit === emp.nit)
        );
      }
      // Médico sin empresa: ve todos los pacientes de la org (con lectura cruzada)
      if (!p._medicoId) return true; // paciente sin asignar
      if (p._medicoId === currentUser.user) return true;
      // Otro médico de la misma org: acceso en modo lectura ✅ (Fase 2 req.)
      return true;
    }
    if (currentUser.role === "secretaria") {
      // Secretaria siempre puede ver pacientes de sus médicos asignados
      return _secretariaMedicoAsignado(currentUser, p._medicoId || "", usersList);
    }
    return false;
  };
  // FASE 2: ¿el médico actual es el autor de esta HC? (controla edición vs lectura)
  const isHcOwner = (p) => {
    if (!p || !currentUser) return false;
    if (currentUser.role === "super_admin") return true;
    if (_isAdmin(currentUser.role)) return true;
    return !p._medicoId || p._medicoId === currentUser.user;
  };
  const openPatient = (p) => {
    if (!canViewPatient(p)) {
      showAlert(
        "⛔ No tiene permiso para ver esta historia clínica.\nSolo puede acceder a historias creadas por usted."
      );
      return;
    }
    // SECRETARIA: puede ver datos del paciente pero NO la ficha clínica
    if (currentUser?.role === "secretaria") {
      setShowSecretariaPatientModal(p);
      return;
    }
    // ── Verificar si hay datos autoguardados más recientes ──
    try {
      const _autoRaw = _ls.getItem("siso_autosave_" + p.id);
      if (_autoRaw) {
        const _autoSaved = JSON.parse(_autoRaw);
        if (_autoSaved && _autoSaved._autoSaved) {
          const _autoTime = new Date(_autoSaved._autoSaved);
          const _dataTime = new Date(p.fechaRegistro || p.fechaExamen || 0);
          if (_autoTime > _dataTime && (Date.now() - _autoTime.getTime()) < 86400000) {
            if (window.confirm("Se encontraron datos autoguardados más recientes (" + _autoTime.toLocaleString("es-CO") + "). ¿Desea recuperarlos?")) {
              setData({ ...p, ..._autoSaved, id: p.id });
              setDataType((p.type || _autoSaved.type || "ocupacional"));
              setActiveTab((p.type || _autoSaved.type) === "general" ? "formGeneral" : "form");
              _setHcDirty(false);
              setView("historia");
              return;
            }
          }
        }
      }
    } catch (_eRecover) { /* silencioso, continuar con datos originales */ }
    setData(p);
    setDataType(p.type || "ocupacional");
    setActiveTab(p.type === "general" ? "formGeneral" : "form");
    _setHcDirty(false);
    setView("historia");
  };
  const handleNewOccupHistory = () => {
    if (currentUser?.role === "secretaria") {
      if (!_secretariaPuede("pacientes_crear", currentUser, usersList)) {
        showAlert(
          "⛔ No tiene permiso para crear pacientes. Solicite acceso al administrador."
        );
        return;
      }
    }
    // ── PLAN GATE: verificar límite de HC (super_admin, admin y admin_empresa exentos) ──
    if (!_isAdminOrEmpresa(currentUser?.role)) {
      const plan = PLAN_CONFIG[currentUser?.license || "libre"];
      const usadas = _contarHC(patientsList, currentUser?.user);
      if (usadas >= plan.maxHC) {
        showAlert(
          `🔒 Plan ${plan.label}: límite de ${plan.maxHC} historias clínicas alcanzado.\n\nActualiza tu plan para continuar creando HC.\nMenú → ⭐ Ver Planes`
        );
        return;
      }
    }
    const newId = Date.now().toString();
    const folioNum =
      "HC-" +
      new Date().getFullYear() +
      "-" +
      String(
        patientsList.filter((p) => p.fechaExamen && !p._archivado).length + 1
      ).padStart(4, "0");
    // FASE 2: org_id se asigna automáticamente al crear HC
    const myOrgId = currentUser?.orgId || ORG_DEFAULT_ID;
    // FASE 2: Médico de turno — si admin/secretaria crea HC, proponer turno activo
    const medicoDefault =
      _isAdmin(currentUser?.role) || currentUser?.role === "secretaria"
        ? medicoTurnoActivo || currentUser?.user
        : currentUser?.user;
    // ── IPS: auto-tag empresa si el usuario pertenece a una empresa ──
    const _empresaAutoTag = {};
    if (currentUser?.empresaId) {
      const _empAT = companies.find((c) => c.id === currentUser.empresaId);
      _empresaAutoTag.empresaId = currentUser.empresaId;
      if (_empAT) {
        _empresaAutoTag.empresaNombre = _empAT.nombre || "";
        _empresaAutoTag.empresaNit = _empAT.nit || "";
      }
    }
    setData({
      ...initialOccupPatientState,
      id: newId,
      _medicoId: medicoDefault,
      _orgId: myOrgId,
      folioHC: folioNum,
      ..._empresaAutoTag,
    });
    setDataType("ocupacional");
    setHistoryNotification(null);
    setActiveTab("form");
    _setHcDirty(false);
    goTo("historia");
    logAccess("Apertura", newId, "ocupacional"); // AUDIT: Res. 1888/2025 RDA
  };
  const handleNewGeneralHistory = () => {
    if (currentUser?.role === "secretaria") {
      if (!_secretariaPuede("pacientes_crear", currentUser, usersList)) {
        showAlert(
          "⛔ No tiene permiso para crear pacientes. Solicite acceso al administrador."
        );
        return;
      }
    }
    // ── PLAN GATE: verificar límite de HC (super_admin, admin y admin_empresa exentos) ──
    if (!_isAdminOrEmpresa(currentUser?.role)) {
      const plan = PLAN_CONFIG[currentUser?.license || "libre"];
      const usadas = _contarHC(patientsList, currentUser?.user);
      if (usadas >= plan.maxHC) {
        showAlert(
          `🔒 Plan ${plan.label}: límite de ${plan.maxHC} historias clínicas alcanzado.\n\nActualiza tu plan para continuar creando HC.\nMenú → ⭐ Ver Planes`
        );
        return;
      }
    }
    const newId = Date.now().toString();
    const myOrgId = currentUser?.orgId || ORG_DEFAULT_ID;
    const medicoDefault2 =
      _isAdmin(currentUser?.role) || currentUser?.role === "secretaria"
        ? medicoTurnoActivo || currentUser?.user
        : currentUser?.user;
    // ── IPS: auto-tag empresa para HC general ──
    const _empresaAutoTag2 = {};
    if (currentUser?.empresaId) {
      const _empAT2 = companies.find((c) => c.id === currentUser.empresaId);
      _empresaAutoTag2.empresaId = currentUser.empresaId;
      if (_empAT2) {
        _empresaAutoTag2.empresaNombre = _empAT2.nombre || "";
        _empresaAutoTag2.empresaNit = _empAT2.nit || "";
      }
    }
    setData({
      ...initialGeneralPatientState,
      id: newId,
      _medicoId: medicoDefault2,
      _orgId: myOrgId,
      ..._empresaAutoTag2,
    });
    setDataType("general");
    setActiveTab("formGeneral");
    _setHcDirty(false);
    goTo("historia");
    logAccess("Apertura", newId, "general"); // AUDIT: Res. 1888/2025 RDA
  };
  // Guardar pacientes bajo la clave del usuario activo (aislamiento por médico)
  // ── IPS: si el usuario tiene empresaId, usar storage compartido de empresa ──
  const _syncPatients = (list) => {
    const _suid = currentUser?.empresaId
      ? "empresa_" + currentUser.empresaId
      : currentUser?.user || "shared";
    const key = _patKey(_suid);
    const cloudKey = _patKeyCloud(_suid);
    _ls.setItem(key, JSON.stringify(list));
    setTimeout(() => {
      if (_syncState.callback) _syncState.callback("syncing");
    }, 0);
    _sbSet(cloudKey, list).then((ok) => {
      if (!ok) _sbQueue.pending[cloudKey] = list;
      setTimeout(() => {
        if (_syncState.callback) _syncState.callback(ok ? "ok" : "error");
      }, 0);
    });
  };
  const _syncCompanies = (list) => {
    const _suid2 = currentUser?.empresaId
      ? "empresa_" + currentUser.empresaId
      : currentUser?.user || "shared";
    const key = _compKey(_suid2);
    const cloudKey = _compKeyCloud(_suid2);
    _ls.setItem(key, JSON.stringify(list));
    _sbSet(cloudKey, list).then((ok) => {
      if (!ok) _sbQueue.pending[cloudKey] = list;
    });
  };
  // NORMATIVO: Res. 1843/2025 Art. 9 y 13 - Verificar alertas de evaluación obligatoria
  const checkAlertasObligatorias = (d) => {
    const alertas = [];
    // ══ B-10 Res. 1843/2025 Art. 4 - Periodicidad máxima 3 años ══
    // Validación de periodicidad vencida (>3 años sin evaluación) se maneja en CardPaciente con badge
    if (
      d.diasIncapacidad &&
      parseInt(d.diasIncapacidad) >= 30 &&
      d.tipoExamen !== "POST-INCAPACIDAD"
    ) {
      alertas.push(
        "⚠️ ALERTA Res. 1843/2025 Art. 9: Trabajador con ≥30 días de incapacidad - se requiere evaluación POST-INCAPACIDAD obligatoria."
      );
    }
    if (
      d.diasAusenciaNoMedica &&
      parseInt(d.diasAusenciaNoMedica) > 90 &&
      d.tipoExamen !== "RETORNO-LABORAL"
    ) {
      alertas.push(
        "⚠️ ALERTA Res. 1843/2025 Art. 13: Ausencia >90 días (no médica) - se requiere evaluación de RETORNO LABORAL obligatoria."
      );
    }
    return alertas;
  };
  const handleSavePatient = () => {
    // Verificar alertas normativas antes de guardar
    const alertasObl = checkAlertasObligatorias(data);
    if (alertasObl.length > 0) {
      showAlert(alertasObl.join("\n\n"));
    }
    const toSave = {
      ...data,
      _medicoId: currentUser?.user,
      fechaExamen: data.fechaExamen || new Date().toISOString().split("T")[0],
    };
    const list = [...patientsList];
    const idx = list.findIndex((p) => p.id === toSave.id);
    if (idx >= 0) list[idx] = toSave;
    else list.push(toSave);
    setPatientsList(list);
    _syncPatients(list);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(""), 2500);
    _setHcDirty(false);
    logAccess("Guardado", toSave.id, dataType); // AUDIT: Res. 1888/2025 RDA
  };
  const handleCloseHistory = () => {
    if (!data.conceptoAptitud && dataType === "ocupacional") {
      showAlert("Debe generar el concepto de aptitud antes de cerrar.");
      return;
    }
    // NORMATIVO: Res. 1843/2025 - aviso no-bloqueante de vigencia
    if (dataType === "ocupacional" && !data.vigencia) {
      showAlert(
        "⚠️ Recuerde registrar la vigencia del concepto de aptitud (Res. 1843/2025). Puede editar la HC para añadirla."
      );
    }
    showConfirm(
      "¿Cerrar la historia clínica? No podrá editarla sin código de auditoría.",
      async () => {
        // NORMATIVO: Ley 527/1999 - Firma electrónica con hash SHA-256 para integridad del documento
        const hashHC = await _generarHashHC(data);
        const fechaFirma = new Date().toISOString();
        const baseCode =
          data.codigoVerificacion ||
          "CV-" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const codigoQR = _generarCodigoQR(
          data.id || baseCode,
          hashHC,
          fechaFirma
        );
        const firmaDigital = {
          hash: hashHC,
          codigoQR,
          firmadoPor: currentUser?.name || currentUser?.user || "médico",
          medicoId: currentUser?.user,
          fechaFirma,
          ley: "Ley 527/1999 - Decreto 2364/2012",
          verificable: true,
        };
        const code = codigoQR; // El código de verificación ES el código QR
        const closed = {
          ...data,
          estadoHistoria: "Cerrada",
          codigoVerificacion: code,
          firmaDigital,
        };
        setData(closed);
        const list = [...patientsList];
        const idx = list.findIndex((p) => p.id === closed.id);
        if (idx >= 0) list[idx] = closed;
        else list.push(closed);
        setPatientsList(list);
        _syncPatients(list);
        // PORTAL PÚBLICO: guardar resumen en clave pública (sin RLS)
        // Política SQL necesaria: CREATE POLICY portal_public_read ON siso_store FOR SELECT USING (key LIKE 'siso_portal_%');
        const portalData = {
          // ── Identificación paciente ─────────────────────────────────────────
          nombres: closed.nombres,
          docTipo: closed.docTipo,
          docNumero: closed.docNumero,
          eps: closed.eps || "",
          edad: closed.edad || "",
          empresaNombre: closed.empresaNombre || closed.empresa || "",
          empresaNit: closed.empresaNit || "",
          arl: closed.arl || "",
          cargo: closed.cargo,
          tipoExamen: closed.tipoExamen,
          enfasisExamen: closed.enfasisExamen || "GENERAL",
          fechaExamen: closed.fechaExamen,
          vigencia: closed.vigencia || "1 año",
          conceptoAptitud: closed.conceptoAptitud,
          codigoVerificacion: code,
          estadoHistoria: "Cerrada",
          fechaCierre: new Date().toISOString().split("T")[0],
          // ── Restricciones y recomendaciones completas ───────────────────────
          restricciones:
            closed.analisisRestricciones || closed.restricciones || "",
          restriccionesChecklist: closed.restriccionesChecklist || {},
          recomendaciones: closed.recomendaciones || "",
          recomendacionesMedicas: closed.recomendacionesMedicas || "",
          recomendacionesOcupacionales:
            closed.recomendacionesOcupacionales || "",
          recomendacionesChecklist: closed.recomendacionesChecklist || {},
          diagnosticoPrincipal: closed.diagnosticoPrincipal || "",
          // ── Datos completos del médico (para generar PDF en portal) ─────────
          medicoNombre: activeDoctorData?.nombre || currentUser?.name || "",
          _doctorData: {
            nombre:
              activeDoctorData?.nombre ||
              currentUser?.name ||
              "MÉDICO OCUPACIONAL",
            titulo:
              activeDoctorData?.titulo ||
              "Médico Especialista en Salud Ocupacional",
            licencia: activeDoctorData?.licencia || "--",
            ciudad: activeDoctorData?.ciudad || "Popayán",
            email: activeDoctorData?.email || "",
            cel: activeDoctorData?.cel || "",
          },
          _firma: activeSignature || "",
        };
        _sbSet("siso_portal_" + code, portalData);
        if (closed.docNumero)
          _sbSet(
            "siso_portal_doc_" + closed.docNumero.replace(/\s/g, ""),
            portalData
          );
        // FIX: también guardar con formato alternativo para compatibilidad con códigos viejos
        if (code && !code.startsWith("CV-")) {
          _sbSet("siso_portal_CV-" + code, portalData);
        }
        // ── Auto-marcar paciente agendado como "Visto" (tiempo real) ──────────
        if (data._agendaId) {
          const horaFin = new Date().toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const updAg = agendados.map((a) =>
            a.id === data._agendaId
              ? {
                  ...a,
                  estado: "atendido",
                  horaFin,
                  vistoEn: new Date().toISOString(),
                }
              : a
          );
          setAgendados(updAg);
          // PASO 6: clave aislada
          const _hcSuf = currentUser?.empresaId
            ? "empresa_" + currentUser.empresaId
            : currentUser?.user || "shared";
          _sync(`siso_agendados_${_hcSuf}`, JSON.stringify(updAg));
          _sbSet(`siso_agendados_${_hcSuf}`, updAg);
          // ── Registrar en Atenciones Recientes ────────────────────────────────
          const agOrig = agendados.find((a) => a.id === data._agendaId);
          const nuevaAtencion = {
            id: "ac_" + Date.now(),
            agendaId: data._agendaId,
            pacienteId: closed.id,
            nombre: closed.nombres || agOrig?.nombre || "",
            docNumero: closed.docNumero || agOrig?.docNumero || "",
            empresa: closed.empresa || agOrig?.empresa || "",
            cargo: closed.cargo || agOrig?.cargo || "",
            tipo: dataType,
            tipoConsulta: agOrig?.tipoConsulta || closed.motivoConsulta || "",
            conceptoAptitud: closed.conceptoAptitud || "",
            codigoVerificacion: code,
            medicoId: closed._medicoId || agOrig?.medicoId || currentUser?.user,
            medicoNombre: agOrig?.medicoNombre || currentUser?.name || "",
            fechaAtencion: new Date().toISOString().split("T")[0],
            horaInicio: agOrig?.horaInicio || agOrig?.horaCita || "",
            horaFin,
            cerradaEn: new Date().toISOString(),
            estadoHistoria: "Cerrada",
          };
          const updAC = [nuevaAtencion, ...atencionesCerradas].slice(0, 100); // máx 100 registros
          setAtencionesCerradas(updAC);
          _sync(`siso_atenciones_${_hcSuf}`, JSON.stringify(updAC));
          _sbSet(`siso_atenciones_${_hcSuf}`, updAC);
        }
        // ── PASO 3: Auto-facturación — generar movimiento en Caja ─────────────────
        try {
          const agOrig2 = data._agendaId
            ? agendados.find((a) => a.id === data._agendaId)
            : null;
          const _tipoConsulta = (
            agOrig2?.tipoConsulta ||
            data.tipoExamen ||
            closed.tipoExamen ||
            "general"
          ).toLowerCase();
          // Calcular tarifa: convenio empresa → tarifa médico → 0
          const _empCliente = companies.find(
            (c) =>
              c.id === closed.empresaId ||
              c.nit === closed.empresaNit ||
              c.nombre === closed.empresaNombre
          );
          let _tarifa = 0;
          if (_empCliente) {
            if (_tipoConsulta.includes("ingreso"))
              _tarifa = Number(_empCliente.tarifaIngreso || 0);
            else if (
              _tipoConsulta.includes("periodico") ||
              _tipoConsulta.includes("periódico")
            )
              _tarifa = Number(_empCliente.tarifaPeriodico || 0);
            else if (
              _tipoConsulta.includes("egreso") ||
              _tipoConsulta.includes("retiro")
            )
              _tarifa = Number(_empCliente.tarifaEgreso || 0);
            else _tarifa = Number(_empCliente.tarifaConsulta || 0);
          }
          if (!_tarifa)
            _tarifa = Number(activeDoctorData?.tarifaExamenOcup || 0);
          const _tipoLabel = _tipoConsulta.includes("ingreso")
            ? "Examen Ingreso"
            : _tipoConsulta.includes("periodico") ||
              _tipoConsulta.includes("periódico")
            ? "Examen Periódico"
            : _tipoConsulta.includes("egreso") ||
              _tipoConsulta.includes("retiro")
            ? "Examen Egreso"
            : _tipoConsulta.includes("general")
            ? "Consulta General"
            : "Examen Médico";
          const autoMov = {
            id: "mob_" + Date.now(),
            tipo: "ingreso",
            concepto: `${_tipoLabel} · ${_sanitize(
              closed.nombres || ""
            )} · ${_sanitize(
              closed.empresaNombre || agOrig2?.empresa || "Particular"
            )}`,
            monto: String(_tarifa),
            formaPago: "Por cobrar",
            estado: "pendiente",
            fecha: new Date().toISOString().split("T")[0],
            pacienteId: closed.id,
            pacienteNombre: closed.nombres || "",
            pacienteDoc: closed.docNumero || "",
            agendaId: data._agendaId || null,
            tipoConsulta: _tipoConsulta,
            empresaClienteId: _empCliente?.id || "",
            empresaClienteNombre:
              closed.empresaNombre || agOrig2?.empresa || "Particular",
            medicoId: currentUser?.user,
            medicoNombre: activeDoctorData?.nombre || currentUser?.name || "",
            codigoVerificacion: code,
            _autoGenerated: true,
            ...(currentUser?.empresaId
              ? { empresaId: currentUser.empresaId }
              : {}),
          };
          const nuevosCaja = [...cajaMovimientos, autoMov];
          saveCaja(nuevosCaja);
        } catch (_autoErr) {
          if (typeof console !== 'undefined') console.error("[SISO]", _autoErr?.message || _autoErr);
        }
        showAlert(
          `✅ Historia cerrada y firmada digitalmente.\n📋 Código QR: ${code}\n🔐 Hash integridad: ${hashHC.substring(
            0,
            20
          )}...\n⚖️ Válido: Ley 527/1999 - Decreto 2364/2012`
        );
        logAccess("Cierre", data.id, dataType); // AUDIT: Res. 1888/2025 RDA
      }
    );
  };

  // B-29: Resumen IA de HC (Claude API)
  const handleAiResumen = async (hcData) => {
    if (!_canUse("ia_resumen", currentUser)) {
      showAlert(
        "🔒 El resumen IA está disponible en el plan ⭐ Pro ($79.000/mes).\n\nMenú → ⭐ Ver Planes para actualizar."
      );
      return;
    }
    if (!hcData) return;
    setAiCargando(true);
    setAiResumen("");
    try {
      const prompt = `Eres un médico especialista en salud ocupacional. Resume de forma clara y profesional esta evaluación médica ocupacional para uso interno del médico tratante. Sé conciso (máximo 150 palabras). Datos: Paciente: ${
        hcData.nombres || "--"
      } | Empresa: ${hcData.empresaNombre || hcData.empresa || "--"} | Cargo: ${
        hcData.cargo || "--"
      } | Examen: ${hcData.tipoExamen || "--"} | Concepto: ${
        hcData.conceptoAptitud || "--"
      } | Restricciones: ${hcData.restricciones || "ninguna"} | Diagnósticos: ${
        (hcData.diagnosticos || [])
          .map((d) => d.descripcion || d.codigo)
          .filter(Boolean)
          .join(", ") || "--"
      } | Fecha: ${hcData.fechaExamen || "--"}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const d = await res.json();
      const txt =
        (d.content || []).find((b) => b.type === "text")?.text ||
        "Sin respuesta del modelo.";
      setAiResumen(txt);
    } catch (e) {
      setAiResumen("Error al generar resumen: " + e.message);
    } finally {
      setAiCargando(false);
    }
  };

  // ══ B-08: Notas aclaratorias - Res. 1995/1999 + Res. 3100/2019 ══
  // Una HC firmada NO se modifica. Solo se agregan notas aclaratorias con trazabilidad completa.
  const handleEditHistory = () => {
    if (currentUser?.role === "secretaria") {
      showAlert("⛔ La secretaria no puede modificar historias clínicas.");
      return;
    }
    // Selector de acción mediante showPrompt (selector de número)
    showPrompt(
      `📋 HC Cerrada - ${data.nombres}\nCódigo: ${
        data.codigoVerificacion || "-"
      }\n\nEscriba el número de la opción:\n1 - Evolución clínica + Re-emitir documentos\n2 - Nota Aclaratoria\n3 - Reapertura (solo Administrador)${currentUser?.role === "super_admin" ? "\n4 - Editar HC (Super Administrador - Código 9207)" : ""}`,
      (opcion) => {
        const op = (opcion || "").trim();
        if (op === "4" && currentUser?.role === "super_admin") {
          // Editar HC cerrada - solo super_admin con código 9207
          showPrompt("🔐 Ingrese el código de autorización (9207):", (code) => {
            if (code !== "9207") {
              showAlert("⛔ Código incorrecto. Acceso denegado.");
              return;
            }
            // Reabrir HC para edición manteniendo todos los datos
            setData((p) => ({
              ...p,
              _cerrada: false,
              _editadaPorAdmin: true,
              _editTimestamp: new Date().toISOString(),
              _editAutor: currentUser?.name || currentUser?.user,
              _codigoOriginal: p.codigoVerificacion,
            }));
            _auditLog("EditHC_SuperAdmin", currentUser?.user, `HC ${data.codigoVerificacion} editada con código 9207`);
            showAlert("✅ HC abierta para edición.\nAl guardar/cerrar se generará un nuevo código vinculado al original.");
          });
          return;
        }
        if (op === "1") {
          // Evolución - escribe nota clínica + puede re-emitir documentos bajo el mismo código
          setShowEvolucionModal(true);
        } else if (op === "2") {
          // Nota aclaratoria
          showPrompt(
            "Escriba la nota aclaratoria (se registrará con su nombre, fecha y hora):",
            (nota) => {
              if (!nota || nota.trim().length < 10) {
                showAlert("La nota debe tener al menos 10 caracteres.");
                return;
              }
              const notaAclaratoria = {
                id: Date.now(),
                fecha: new Date().toISOString(),
                autor: currentUser?.name || currentUser?.user,
                rol: currentUser?.role,
                contenido: nota.trim(),
                hcId: data.id,
                codigoHC:
                  data.codigoVerificacion ||
                  data.firmaDigital?.codigoQR ||
                  "N/A",
              };
              setData((p) => ({
                ...p,
                notasAclaratorias: [
                  ...(p.notasAclaratorias || []),
                  notaAclaratoria,
                ],
              }));
              setTimeout(() => {
                const updPats = patientsList.map((p) =>
                  p.id === data.id
                    ? {
                        ...p,
                        notasAclaratorias: [
                          ...(p.notasAclaratorias || []),
                          notaAclaratoria,
                        ],
                      }
                    : p
                );
                setPatientsList(updPats);
                _sync(_patKey(currentUser?.user), JSON.stringify(updPats));
              }, 0);
              logAccess("NotaAclaratoria", data.id, dataType);
              showAlert(
                `✅ Nota aclaratoria registrada.\nAutor: ${
                  notaAclaratoria.autor
                }\nFecha: ${new Date(notaAclaratoria.fecha).toLocaleString(
                  "es-CO"
                )}\n\nLa HC original permanece intacta.`
              );
            }
          );
        } else if (op === "3") {
          // Reapertura (solo admin)
          if (currentUser?.role !== "administrador") {
            showAlert(
              "⛔ Solo el administrador puede reabrir una HC firmada.\nUse la opción 1 (Evolución) o 2 (Nota Aclaratoria)."
            );
            return;
          }
          showPrompt("Código de administrador:", (adminCode) => {
            _sha256(adminCode).then((h) => {
              const storedCode = _ls.getItem("siso_admin_code_hash") || "";
              if (!storedCode) {
                showAlert(
                  "Configure el código de administrador primero desde el panel de usuarios."
                );
                return;
              }
              if (h !== storedCode) {
                showAlert("⛔ Código incorrecto.");
                return;
              }
              showPrompt(
                "Motivo de reapertura (mín. 20 caracteres - queda en auditoría):",
                (reason) => {
                  if (!reason || reason.trim().length < 20) {
                    showAlert("El motivo debe tener al menos 20 caracteres.");
                    return;
                  }
                  setData((p) => ({
                    ...p,
                    estadoHistoria: "Abierta",
                    conteoEdiciones: (p.conteoEdiciones || 0) + 1,
                    motivoEdicion: reason,
                    reaperturas: [
                      ...(p.reaperturas || []),
                      {
                        fecha: new Date().toISOString(),
                        autor: currentUser?.name,
                        motivo: reason,
                        codigoAnterior: data.codigoVerificacion,
                      },
                    ],
                  }));
                  logAccess("ReaperturaAdmin", data.id, dataType);
                  showAlert(
                    "⚠️ HC reabierta. Este evento quedó registrado en el audit log."
                  );
                }
              );
            });
          });
        } else {
          showAlert("Opción no válida. Ingrese 1, 2 o 3.");
        }
      }
    );
  };
  const handleCompanySelect = (e) => {
    const id = e.target.value;
    if (!id || id === "particular") {
      setData((p) => ({
        ...p,
        empresaId: "particular",
        empresaNombre: "PARTICULAR / INDEPENDIENTE",
        empresaNit: "",
        actividadEconomica: "",
      }));
      return;
    }
    const c = companies.find((x) => x.id === id);
    if (c)
      setData((p) => ({
        ...p,
        empresaId: c.id,
        empresaNombre: c.nombre,
        empresaNit: c.nit + (c.dv ? `-${c.dv}` : ""),
        actividadEconomica: c.actividad,
      }));
  };
  // NORMATIVO: Res. 1995/1999 Art. 15 - RETENCIÓN DOCUMENTAL MÍNIMA 20 AÑOS
  // Se reemplaza el borrado definitivo por ARCHIVADO para cumplir con la obligación de conservación
  const handleDeletePatient = (id) => {
    const pac = patientsList.find((p) => p.id === id);
    if (!pac) return;
    // Si la HC tiene menos de 20 años desde su creación, no se puede eliminar definitivamente
    const fechaCreacion = pac.fechaExamen || pac.fechaCreacion || null;
    const aniosTranscurridos = fechaCreacion
      ? new Date().getFullYear() - new Date(fechaCreacion).getFullYear()
      : 0;
    if (pac.estadoHistoria === "Cerrada" || aniosTranscurridos < 20) {
      showConfirm(
        `⚠️ RETENCIÓN DOCUMENTAL (Res. 1995/1999 Art. 15)
Esta historia clínica debe conservarse mínimo 20 años.
¿Desea ARCHIVAR el registro en vez de eliminarlo?
(Quedará oculto pero conservado para cumplimiento legal)`,
        () => {
          const upd = patientsList.map((p) =>
            p.id === id
              ? {
                  ...p,
                  _archivado: true,
                  _fechaArchivado: new Date().toISOString(),
                  _archivadoPor: currentUser?.user,
                }
              : p
          );
          setPatientsList(upd);
          _syncPatients(upd);
          logAccess("Archivado", id, "retención-documental", "Gestión HC");
          showAlert(
            "✅ Registro archivado correctamente.\nSe conserva según Res. 1995/1999 Art. 15 (20 años mínimo)."
          );
        }
      );
    } else {
      showConfirm(
        "¿Eliminar este registro? Han transcurrido más de 20 años desde su creación.",
        () => {
          const upd = patientsList.filter((p) => p.id !== id);
          setPatientsList(upd);
          _syncPatients(upd);
          logAccess("Eliminacion", id, "borrado-definitivo", "Gestión HC");
        }
      );
    }
  };
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDoctorSignature(reader.result);
      _sync("siso_doctor_signature", reader.result);
      showAlert("Firma actualizada.");
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };
  const handleExportData = (userId) => {
    // Full backup: all platform data + custom meds + signatures embedded per user
    const customMeds = getCustomMeds();
    // Ensure every user carries their signature inside doctorData
    const usersWithSigs = usersList.map((u) => {
      // If this is the currently active user, also capture the live doctorSignature state
      const isActive = u.id === currentUser?.id || u.user === currentUser?.user;
      const sig =
        u.doctorData?.signature || (isActive ? doctorSignature : null);
      return {
        ...u,
        doctorData: {
          ...(u.doctorData || DEFAULT_DOCTOR_DATA),
          signature: sig || u.doctorData?.signature || null,
        },
      };
    });
    // Leer keys desde sessionStorage para capturar las más recientes (incluye sesión actual)
    const savedKeys = sps("siso_ai_keys", aiConfig.keys || {});
    const aiConfigBackup = { ...aiConfig, keys: savedKeys };
    const backup = {
      version: "3.1",
      backupDate: new Date().toISOString(),
      platform: "OCUPASALUD v3.0",
      exportedBy: currentUser?.name || "Sistema",
      patients: patientsList,
      companies,
      users: usersWithSigs, // ← firmas embebidas en cada usuario
      savedReports,
      savedBills: savedBillsList,
      atencionesCerradas,
      aiConfig: aiConfigBackup, // ← keys incluidas desde sessionStorage
      customMedicamentos: customMeds,
      propuestas: propForm ? [propForm] : [],
    };
    const dateStr = new Date().toISOString().split("T")[0];
    const userStr =
      (currentUser?.name || "").replace(/\s+/g, "_") || "OCUPASALUD";
    const backupFilename = `BACKUP_${userStr}_${dateStr}.json`;
    const sigsCount = usersWithSigs.filter(
      (u) => u.doctorData?.signature
    ).length;
    // Mostrar en modal (compatible sandbox + descarga en browser real)
    setBackupModalData({
      json: JSON.stringify(backup, null, 2),
      filename: backupFilename,
      summary: `${patientsList.length} pacientes · ${companies.length} empresas · ${usersList.length} usuarios · ${sigsCount} firma(s) · ${customMeds.length} meds personalizados`,
    });
  };
  const handleImportData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // SEGURIDAD FIX 6: Validar tipo MIME y tamaño antes de leer
    if (
      file.type &&
      file.type !== "application/json" &&
      !file.name.endsWith(".json")
    ) {
      showAlert(
        "❌ Archivo inválido. Solo se permiten archivos .json de backup de OCUPASALUD."
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10 MB máximo
      showAlert("❌ Archivo demasiado grande (máximo 10 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        // SEGURIDAD: validar estructura mínima del backup
        const hasKnownKeys =
          d &&
          typeof d === "object" &&
          (d.patients ||
            d.companies ||
            d.users ||
            d.savedBills ||
            d.savedReports);
        if (!hasKnownKeys) {
          showAlert(
            "❌ Archivo no reconocido. El backup debe ser generado por OCUPASALUD."
          );
          return;
        }
        // Pacientes
        if (d.patients) {
          const cur = [...patientsList];
          d.patients.forEach((p) => {
            const i = cur.findIndex((x) => x.id === p.id);
            if (i >= 0) cur[i] = p;
            else cur.push(p);
          });
          setPatientsList(cur);
          _syncPatients(cur);
        }
        // Empresas
        if (d.companies) {
          const cur = [...companies];
          d.companies.forEach((c) => {
            if (!cur.find((x) => x.id === c.id)) cur.push(c);
          });
          setCompanies(cur);
          _syncCompanies(cur);
        }
        // Usuarios con sus firmas embebidas en doctorData
        if (d.users && Array.isArray(d.users)) {
          const cur = [...usersList];
          d.users.forEach((u) => {
            const idx = cur.findIndex(
              (x) => x.id === u.id || x.user === u.user
            );
            if (idx >= 0) {
              // Merge: conservar firma si viene en el backup
              cur[idx] = {
                ...cur[idx],
                ...u,
                doctorData: {
                  ...(cur[idx].doctorData || {}),
                  ...(u.doctorData || {}),
                  // Firma: priorizar la del backup si existe
                  signature:
                    u.doctorData?.signature ||
                    cur[idx].doctorData?.signature ||
                    null,
                },
              };
            } else {
              cur.push(u);
            }
          });
          setUsersList(cur);
          _sync("siso_users", JSON.stringify(cur));
          // Si el usuario activo tiene firma en el backup, actualizar la firma activa
          const activeRestored = d.users.find(
            (u) => u.id === currentUser?.id || u.user === currentUser?.user
          );
          if (activeRestored?.doctorData?.signature) {
            setDoctorSignature(activeRestored.doctorData.signature);
            _sync("siso_doctor_signature", activeRestored.doctorData.signature);
          }
        }
        // Configuración IA - FIX C-03: keys a sessionStorage, proveedor a localStorage
        if (d.aiConfig) {
          setAiConfig(d.aiConfig);
          _ss.setItem("siso_ai_keys", JSON.stringify(d.aiConfig.keys || {}));
          _sync(
            "siso_ai_config_provider",
            JSON.stringify({ activeProvider: d.aiConfig.activeProvider })
          );
        }
        // Cuentas de cobro
        if (d.savedBills && Array.isArray(d.savedBills)) {
          setSavedBillsList(d.savedBills);
          const _bSuf = currentUser?.empresaId
            ? "empresa_" + currentUser.empresaId
            : currentUser?.user || "shared";
          _sync(`siso_saved_bills_${_bSuf}`, JSON.stringify(d.savedBills));
        }
        // Informes / reportes guardados
        if (d.savedReports && Array.isArray(d.savedReports)) {
          setSavedReports(d.savedReports);
          _sync("siso_saved_reports", JSON.stringify(d.savedReports));
        }
        // Medicamentos personalizados
        if (
          d.customMedicamentos &&
          Array.isArray(d.customMedicamentos) &&
          d.customMedicamentos.length > 0
        ) {
          _ls.setItem("siso_custom_meds", JSON.stringify(d.customMedicamentos));
        }
        // Propuestas
        if (
          d.propuestas &&
          Array.isArray(d.propuestas) &&
          d.propuestas.length > 0
        ) {
          setPropForm(d.propuestas[0]);
        }
        const sigsRestored = (d.users || []).filter(
          (u) => u.doctorData?.signature
        ).length;
        const billsR = (d.savedBills || []).length;
        const repsR = (d.savedReports || []).length;
        // AUTO-SYNC PORTAL: publicar certificados en Supabase al restaurar backup
        const closedPats = (d.patients || []).filter(
          (p) => p.codigoVerificacion && p.estadoHistoria === "Cerrada"
        );
        if (closedPats.length > 0) {
          let synced = 0;
          for (const p of closedPats) {
            const portalData = {
              nombres: p.nombres || "",
              docTipo: p.docTipo || "CC",
              docNumero: p.docNumero || "",
              eps: p.eps || "",
              edad: p.edad || "",
              empresaNombre: p.empresaNombre || p.empresa || "",
              empresaNit: p.empresaNit || "",
              arl: p.arl || "",
              cargo: p.cargo || "",
              tipoExamen: p.tipoExamen || "",
              enfasisExamen: p.enfasisExamen || "GENERAL",
              fechaExamen: p.fechaExamen || "",
              vigencia: p.vigencia || "1 año",
              conceptoAptitud: p.conceptoAptitud || "",
              restricciones: p.analisisRestricciones || p.restricciones || "",
              restriccionesChecklist: p.restriccionesChecklist || {},
              recomendaciones: p.recomendaciones || "",
              recomendacionesMedicas: p.recomendacionesMedicas || "",
              recomendacionesOcupacionales:
                p.recomendacionesOcupacionales || "",
              recomendacionesChecklist: p.recomendacionesChecklist || {},
              diagnosticoPrincipal: p.diagnosticoPrincipal || "",
              codigoVerificacion: p.codigoVerificacion,
              medicoNombre:
                p.medicoNombre ||
                activeDoctorData?.nombre ||
                currentUser?.name ||
                "",
              estadoHistoria: "Cerrada",
              fechaCierre: p.fechaExamen || "",
              _doctorData: {
                nombre:
                  activeDoctorData?.nombre ||
                  currentUser?.name ||
                  "MÉDICO OCUPACIONAL",
                titulo:
                  activeDoctorData?.titulo ||
                  "Médico Especialista en Salud Ocupacional",
                licencia: activeDoctorData?.licencia || "--",
                ciudad: activeDoctorData?.ciudad || "Popayán",
                email: activeDoctorData?.email || "",
              },
              _firma: activeSignature || "",
            };
            const code = p.codigoVerificacion;
            await _sbSet("siso_portal_" + code, portalData);
            if (p.docNumero)
              await _sbSet(
                "siso_portal_doc_" + p.docNumero.replace(/\s/g, ""),
                portalData
              );
            // compatibilidad códigos viejos CV-
            if (!code.startsWith("CV-"))
              await _sbSet("siso_portal_CV-" + code, portalData);
            synced++;
          }
          showAlert(
            `✅ Restauración completada.\n📁 ${
              (d.patients || []).length
            } pacientes · ${(d.companies || []).length} empresas · ${
              (d.users || []).length
            } usuarios\n✍️ ${sigsRestored} firma(s) · 🧾 ${billsR} cuentas · 📊 ${repsR} informes restaurados\n☁️ ${synced} certificado(s) sincronizados al Portal del Trabajador`
          );
        } else {
          showAlert(
            `✅ Restauración completada.\n📁 ${
              (d.patients || []).length
            } pacientes · ${(d.companies || []).length} empresas · ${
              (d.users || []).length
            } usuarios\n✍️ ${sigsRestored} firma(s) · 🧾 ${billsR} cuentas · 📊 ${repsR} informes restaurados`
          );
        }
      } catch (err) {
        showAlert(
          "Error al leer el archivo de backup. Verifique que sea un archivo JSON válido de OCUPASALUD."
        );
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };
  const handleNameChange = (e) => {
    const val = e.target.value;
    setData((p) => ({ ...p, nombres: val }));
    setHistoryNotification(null);
    if (val.length >= 3) {
      const _ownPats = _isAdmin(currentUser?.role)
        ? patientsList
        : currentUser?.role === "secretaria"
        ? (() => {
            const secU = usersList.find(u => u.user === currentUser.user);
            const asig = secU?.medicosAsignados || [];
            return asig.length > 0
              ? patientsList.filter(p => !p._medicoId || asig.includes(p._medicoId))
              : patientsList;
          })()
        : patientsList.filter(
            (p) => !p._medicoId || p._medicoId === currentUser?.user
          );
      const matches = _ownPats.filter((p) =>
        p.nombres?.toLowerCase().includes(val.toLowerCase())
      );
      const seen = new Set();
      const uniq = [];
      matches
        .sort(
          (a, b) => new Date(b.fechaExamen || 0) - new Date(a.fechaExamen || 0)
        )
        .forEach((m) => {
          if (!seen.has(m.docNumero)) {
            seen.add(m.docNumero);
            const hc = patientsList.filter(
              (h) => h.docNumero === m.docNumero && h.fechaExamen
            ).length;
            uniq.push({ ...m, historyCount: hc });
          }
        });
      setPatientSuggestions(uniq.slice(0, 8));
    } else setPatientSuggestions([]);
  };
  const selectPatientSuggestion = (p) => {
    if (p.historyCount > 0) setHistoryNotification(p.historyCount);
    else setHistoryNotification(null);
    // Memoria de antecedentes: copia todos los datos clínicos previos del paciente
    setData((prev) => ({
      ...prev,
      // ── Datos personales ──
      nombres: p.nombres,
      docNumero: p.docNumero,
      edad: p.edad,
      fechaNacimiento: p.fechaNacimiento || "",
      genero: p.genero,
      estadoCivil: p.estadoCivil,
      escolaridad: p.escolaridad,
      telefono: p.telefono || "",
      email: p.email || "",
      celular: p.celular || "",
      eps: p.eps || "",
      afp: p.afp || "",
      arl: p.arl || "",
      nivelRiesgoARL: p.nivelRiesgoARL || "",
      grupoSanguineo: p.grupoSanguineo || "",
      foto: p.foto || "",
      lateralidad: p.lateralidad || "",
      estrato: p.estrato || "",
      zonaResidencia: p.zonaResidencia || "",
      grupoEtnico: p.grupoEtnico || "",
      identidadGenero: p.identidadGenero || "",
      // ── Datos laborales ──
      cargo: p.cargo,
      dependencia: p.dependencia || "",
      turnoTrabajo: p.turnoTrabajo || "",
      tipoContrato: p.tipoContrato || "",
      antiguedadEmpresa: p.antiguedadEmpresa || "",
      ingresosMensuales: p.ingresosMensuales || "",
      numPersonasCargo: p.numPersonasCargo || "",
      empresaId:
        prev.empresaId !== "particular"
          ? prev.empresaId
          : p.empresaId || "particular",
      empresaNombre:
        prev.empresaId !== "particular"
          ? prev.empresaNombre
          : p.empresaNombre || "PARTICULAR",
      empresaNit:
        prev.empresaId !== "particular" ? prev.empresaNit : p.empresaNit || "",
      actividadEconomica:
        prev.empresaId !== "particular"
          ? prev.actividadEconomica
          : p.actividadEconomica || "",
      // ── ANTECEDENTES POR MEMORIA (núcleo de la función) ──
      antecedentesAgrupados: p.antecedentesAgrupados
        ? JSON.parse(JSON.stringify(p.antecedentesAgrupados))
        : initialOccupPatientState.antecedentesAgrupados,
      antecedentes: p.antecedentes
        ? { ...p.antecedentes }
        : { ...initialOccupPatientState.antecedentes },
      habitos: p.habitos
        ? { ...p.habitos }
        : { ...initialOccupPatientState.habitos },
      vacunacionCompleta: p.vacunacionCompleta || false,
      vacunas: p.vacunas || [],
      // ── Riesgos previos ──
      riesgos: p.riesgos
        ? { ...p.riesgos }
        : { ...initialOccupPatientState.riesgos },
      // ── Pausa: NO copiar examen físico, diagnósticos, conceptos - son propios de cada evaluación ──
    }));
    setPatientSuggestions([]);
  };
  const handleOpenHistoryModal = async (
    docNumber,
    searchAllDoctors = false
  ) => {
    let records = patientsList.filter(
      (p) => p.docNumero === docNumber && p.fechaExamen
    );
    // Para consultar certificados de TODOS los médicos (solo certificados)
    if (searchAllDoctors) {
      try {
        const cloud = await _sbGetAll();
        if (cloud) {
          Object.entries(cloud).forEach(([key, entry]) => {
            if (
              key.startsWith("siso_patients_") &&
              Array.isArray(entry.value)
            ) {
              const otherRecs = entry.value.filter(
                (p) =>
                  p.docNumero === docNumber &&
                  p.fechaExamen &&
                  p.conceptoAptitud
              );
              records = [...records, ...otherRecs];
            }
          });
        }
      } catch (e) {
        /* sin internet: solo los locales */
      }
    }
    const unique = records.filter(
      (r, i, arr) => arr.findIndex((x) => x.id === r.id) === i
    );
    setHistoryRecords(
      unique.sort((a, b) => new Date(b.fechaExamen) - new Date(a.fechaExamen))
    );
    setShowHistoryModal(true);
  };
  // ── APLICAR CHECKLIST DE RESTRICCIONES AL TEXTO ───────────────────────────
  const applyRestriccionesChecklist = (checklist) => {
    setData((prev) => ({ ...prev, restriccionesChecklist: checklist }));
    const selectedItems = [];
    Object.entries(RESTRICCIONES_CATALOG).forEach(([, seg]) => {
      seg.items.forEach((item) => {
        if (checklist[item.id])
          selectedItems.push(
            `• [PREVENTIVA] ${item.texto} -- ${item.normativa}`
          );
      });
    });
    if (selectedItems.length > 0) {
      setData((prev) => ({
        ...prev,
        analisisRestricciones:
          (prev.analisisRestricciones
            ? prev.analisisRestricciones + "\n\n"
            : "") +
          "RESTRICCIONES SELECCIONADAS EN CHECKLIST:\n" +
          selectedItems.join("\n"),
        restriccionesChecklist: checklist,
      }));
    }
  };
  const applyRecomendacionesChecklist = (checklist) => {
    const selectedItems = [];
    Object.entries(RECOMENDACIONES_CATALOG).forEach(([, cat]) => {
      cat.items.forEach((item) => {
        if (checklist[item.id]) selectedItems.push(`• ${item.texto}`);
      });
    });
    if (selectedItems.length > 0) {
      setData((prev) => ({
        ...prev,
        recomendaciones:
          (prev.recomendaciones ? prev.recomendaciones + "\n\n" : "") +
          "RECOMENDACIONES SELECCIONADAS:\n" +
          selectedItems.join("\n"),
        recomendacionesChecklist: checklist,
      }));
    }
  };
  const handlePrint = (title) => {
    const orig = document.title;
    document.title = `[OCUPASALUD] ${title || "Documento"}`;
    // ── Inyectar estilos de impresión mejorados para reportes ──
    const _printStyleId = "siso-report-print-styles";
    let _printStyle = document.getElementById(_printStyleId);
    if (!_printStyle) {
      _printStyle = document.createElement("style");
      _printStyle.id = _printStyleId;
      _printStyle.textContent = `
        @media print {
          @page { size: letter portrait; margin: 1.1cm 1.3cm 1.3cm 1.3cm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          /* Tablas de reportes: bordes y colores */
          table { width: 100% !important; border-collapse: collapse !important; page-break-inside: auto !important; }
          table th { background-color: #1e293b !important; color: white !important; padding: 5px 8px !important; font-size: 8.5pt !important; font-weight: 700 !important; text-align: left !important; border: 1px solid #334155 !important; }
          table td { padding: 4px 8px !important; font-size: 8.5pt !important; border: 1px solid #e2e8f0 !important; }
          table tr:nth-child(even) { background-color: #f8fafc !important; }
          /* Gráficos y estadísticas con colores */
          canvas, svg { max-width: 100% !important; }
          .chart-container, [class*="chart"], [class*="graph"] { page-break-inside: avoid !important; break-inside: avoid !important; }
          /* Saltos de página entre secciones de reporte */
          .report-section, .print-page-break { page-break-before: always !important; break-before: page !important; }
          .report-section:first-child { page-break-before: auto !important; break-before: auto !important; }
          /* Estadísticas cards */
          .stat-card, [class*="stat"] { page-break-inside: avoid !important; break-inside: avoid !important; }
          /* Ocultar botones y controles */
          button:not(.print-show), .no-print, nav, [data-no-print] { display: none !important; }
          /* Body limpio */
          body { background: white !important; }
        }
      `;
      document.head.appendChild(_printStyle);
    }
    window.print();
    document.title = orig;
  };
  // ══ FIX: Imprimir HC como documento HTML limpio (sin sobreposición) ══
  const _printHCClean = () => {
    const _e = (v) => String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const _nl2br = (v) => _e(v).replace(/\n/g, "<br/>");
    const doc = activeDoctorData || {};
    const sig = activeSignature || "";
    const sigHtml = sig ? `<img src="${sig}" style="max-height:65px;display:block;margin:0 auto 4px;" alt="Firma"/>` : '<div style="height:60px;"></div>';
    const _miIPS = currentUser?.empresaId ? companies.find(c => c.id === currentUser.empresaId) : null;
    const ipsName = _miIPS?.nombre || doc.nombre || "OcupaSalud";
    const fmtList = (txt) => {
      const s = Array.isArray(txt) ? txt.join("\n") : String(txt || "");
      if (!s.trim()) return "";
      const lines = s.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.some(l => /^[•*\-\d]/.test(l))) {
        return '<ul style="margin:4px 0;padding-left:16px;">' + lines.map(l => '<li style="margin-bottom:2px;font-size:9pt;">' + _e(l).replace(/^[•*\-]+\s*/, "").replace(/^\d+\.\s*/, "") + '</li>').join("") + '</ul>';
      }
      return '<p style="font-size:9pt;white-space:pre-wrap;line-height:1.5;">' + _nl2br(s) + '</p>';
    };
    const sec = (icon, text) => `<div style="background:#ecfdf5;border-left:4px solid #065f46;padding:6px 12px;margin:14px 0 6px 0;font-weight:900;font-size:9.5pt;text-transform:uppercase;color:#065f46;">${icon} ${_e(text)}</div>`;
    const r2 = (l1,v1,l2,v2) => `<tr><th style="background:#d1fae5;font-weight:700;width:20%;font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;">${_e(l1)}</th><td style="font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;width:30%;">${_e(v1)}</td><th style="background:#d1fae5;font-weight:700;width:20%;font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;">${_e(l2)}</th><td style="font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;width:30%;">${_e(v2)}</td></tr>`;
    const r1 = (l,v) => `<tr><th style="background:#d1fae5;font-weight:700;width:28%;font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;">${_e(l)}</th><td style="font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;" colspan="3">${typeof v === "string" && v.includes("<") ? v : _e(v)}</td></tr>`;
    const tb = (rows) => `<table style="width:100%;border-collapse:collapse;">${rows}</table>`;

    const sections = [];

    // ═══ HEADER ═══
    sections.push(`<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #065f46;padding-bottom:10px;margin-bottom:12px;">
      <div><div style="font-size:12pt;font-weight:900;color:#065f46;">${_e(ipsName)}</div>
      <p style="font-size:8pt;color:#555;">${_e(doc.titulo || "Médico Especialista SST")}</p>
      <p style="font-size:8pt;color:#555;">Lic: ${_e(doc.licencia || "--")} · ${_e(doc.ciudad || "")}</p>
      ${doc.celular ? "<p style=\"font-size:7.5pt;color:#888;\">Tel: " + _e(doc.celular) + (doc.email ? " · " + _e(doc.email) : "") + "</p>" : ""}</div>
      <div style="text-align:right;"><div style="font-size:13pt;font-weight:900;color:#065f46;text-transform:uppercase;">HISTORIA CLÍNICA ${_e(dataType === "ocupacional" ? "OCUPACIONAL" : "GENERAL")}</div>
      <p style="font-size:8.5pt;color:#555;">Fecha: ${_e(data.fechaExamen || data.fechaConsulta || new Date().toLocaleDateString("es-CO"))}</p>
      <p style="font-size:8pt;color:#888;">Tipo: ${_e(data.tipoExamen || "CONSULTA")} · ${_e(data.enfasisExamen || "")}</p>
      ${data.codigoVerificacion ? "<p style=\"font-size:7.5pt;font-family:monospace;color:#065f46;font-weight:900;\">Código: " + _e(data.codigoVerificacion) + "</p>" : ""}</div></div>`);

    // ═══ 1. DATOS DEL PACIENTE ═══
    sections.push(sec("👤", "Datos del Paciente") + tb(
      r2("Nombres", data.nombres, "Documento", (data.docTipo||"CC")+" "+(data.docNumero||"")) +
      r2("Fecha Nac.", data.fechaNacimiento, "Edad", (data.edad||"--")+" años") +
      r2("Género", data.genero, "Estado Civil", data.estadoCivil) +
      r2("EPS", data.eps, "AFP", data.afp) +
      r2("ARL", data.arl, "Nivel Riesgo", data.nivelRiesgoARL) +
      r2("Teléfono", data.celular||data.telefono, "Email", data.email) +
      r2("Residencia", data.residencia, "Escolaridad", data.escolaridad) +
      r2("Grupo Sang.", data.grupoSanguineo, "Lateralidad", data.lateralidad)
    ));

    // ═══ 2. DATOS LABORALES ═══
    if (dataType === "ocupacional") {
      sections.push(sec("🏢", "Datos Laborales") + tb(
        r2("Empresa", data.empresaNombre||data.empresa, "NIT", data.empresaNit||"") +
        r2("Cargo", data.cargo, "Dependencia", data.dependencia) +
        r2("Contrato", data.tipoContrato, "Turno", data.turnoTrabajo) +
        r2("Antigüedad", data.antiguedadEmpresa, "Tipo Examen", data.tipoExamen)
      ));
    }

    // ═══ 3. MOTIVO DE CONSULTA ═══
    const motivoTxt = data.motivoConsulta || data.enfermedadActual || data.sintomatologia || "";
    if (motivoTxt) sections.push(sec("🩺", "Motivo de Consulta / Enfermedad Actual") + `<div style="padding:6px 10px;">${fmtList(motivoTxt)}</div>`);

    // ═══ 4. HÁBITOS ═══
    const hab = data.habitos || {};
    if (hab.fuma || hab.alcohol || hab.deporte) {
      sections.push(sec("🚬", "Hábitos") + tb(
        r2("Tabaquismo", hab.fuma||"No", "Alcohol", hab.alcohol||"No") +
        r2("Actividad Física", hab.deporte||"No", "Sustancias", hab.drogas||"No")
      ));
    }

    // ═══ 5. ANTECEDENTES ═══
    const antFields = [
      ["Personales", data.antecedentesPersonales], ["Familiares", data.antecedentesFamiliares],
      ["Quirúrgicos", data.antecedentesQuirurgicos], ["Toxicológicos", data.antecedentesToxicologicos],
      ["Alérgicos", data.antecedentesAlergicos], ["Traumáticos", data.antecedentesTraumaticos],
      ["Gineco-obstétricos", data.antecedentesGinecoObstetricos], ["Ocupacionales", data.antecedentesOcupacionales],
      ["Farmacológicos", data.antecedentesFarmacologicos], ["Hospitalarios", data.antecedentesHospitalarios],
    ].filter(([,v]) => v);
    if (antFields.length > 0) {
      sections.push(sec("📋", "Antecedentes") + tb(antFields.map(([l,v]) => r1(l,v)).join("")));
    }

    // ═══ 6. REVISIÓN POR SISTEMAS ═══
    const revSis = data.revisionSistemas || {};
    const revEntries = Object.entries(revSis).filter(([,v]) => v && v !== "Normal" && v !== "Niega" && v !== "false" && v !== false);
    if (revEntries.length > 0) {
      sections.push(sec("📝", "Revisión por Sistemas") + tb(revEntries.map(([k,v]) => r1(k.charAt(0).toUpperCase()+k.slice(1), typeof v === "object" ? JSON.stringify(v) : v)).join("")));
    }

    // ═══ 7. EXAMEN FÍSICO — SIGNOS VITALES ═══
    const vitalRows = [
      data.talla ? r2("Talla", data.talla+" cm", "Peso", (data.peso||"--")+" kg") : "",
      data.imc ? r2("IMC", data.imc, "Clasificación", data.clasificacionIMC||"") : "",
      data.tensionArterial ? r2("T.A.", data.tensionArterial, "F.C.", (data.frecuenciaCardiaca||"--")+" lpm") : "",
      data.frecuenciaRespiratoria ? r2("F.R.", data.frecuenciaRespiratoria+" rpm", "Temperatura", (data.temperatura||"--")+"°C") : "",
      data.satO2 ? r2("SpO2", data.satO2+"%", "Perímetro Abd.", data.perimetroAbdominal||"--") : "",
    ].filter(Boolean).join("");
    sections.push(sec("🔍", "Examen Físico") + (vitalRows ? tb(vitalRows) : ""));

    // ═══ 8. EXAMEN FÍSICO POR SISTEMAS ═══
    const efSis = data.examenFisicoSistemas || {};
    const efEntries = Object.entries(efSis);
    if (efEntries.length > 0) {
      const sysLabels = {cabeza:"Cabeza",ojos:"Ojos",oidos:"Oídos",nariz:"Nariz",boca:"Boca/Faringe",cuello:"Cuello",torax:"Tórax",corazon:"Corazón",pulmones:"Pulmones",abdomen:"Abdomen",genitourinario:"Genitourinario",columna:"Columna",extremidades:"Extremidades",piel:"Piel/Faneras",neurologico:"Neurológico"};
      const sysRows = efEntries.map(([k,v]) => {
        const label = sysLabels[k] || k;
        const estado = v?.estado || "Normal";
        const hallazgo = v?.hallazgo || "";
        const color = estado === "Anormal" ? "#dc2626" : "#065f46";
        return `<tr><td style="font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;width:25%;font-weight:700;">${_e(label)}</td><td style="font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;width:15%;color:${color};font-weight:700;">${_e(estado)}</td><td style="font-size:8.5pt;padding:4px 8px;border:1px solid #ccc;">${_e(hallazgo)}</td></tr>`;
      }).join("");
      sections.push(`<table style="width:100%;border-collapse:collapse;margin-top:4px;"><thead><tr><th style="background:#065f46;color:white;padding:4px 8px;font-size:8pt;text-align:left;">Sistema</th><th style="background:#065f46;color:white;padding:4px 8px;font-size:8pt;">Estado</th><th style="background:#065f46;color:white;padding:4px 8px;font-size:8pt;text-align:left;">Hallazgo</th></tr></thead><tbody>${sysRows}</tbody></table>`);
    }

    // ═══ 9. MANIOBRAS OSTEOMUSCULARES ═══
    const manio = data.maniobrasOsteomusculares || {};
    const manioEntries = Object.entries(manio).filter(([,v]) => v?.estado && v.estado !== "Normal");
    if (manioEntries.length > 0) {
      sections.push(sec("🦴", "Maniobras Osteomusculares") + tb(manioEntries.map(([k,v]) => r2(k.charAt(0).toUpperCase()+k.slice(1), v.estado, "Hallazgo", v.hallazgo||"")).join("")));
    }

    // ═══ 10. RIESGOS OCUPACIONALES ═══
    const riesgos = data.riesgos || {};
    const riesgoEntries = Object.entries(riesgos).filter(([,v]) => v);
    if (riesgoEntries.length > 0) {
      sections.push(sec("⚠️", "Factores de Riesgo Ocupacional") + tb(riesgoEntries.map(([k,v]) => r1(k.charAt(0).toUpperCase()+k.slice(1).replace(/([A-Z])/g," $1"), typeof v === "object" ? JSON.stringify(v) : v)).join("")));
    }

    // ═══ 11. DIAGNÓSTICOS ═══
    const dxList = data.diagnosticos?.length ? data.diagnosticos : [];
    sections.push(sec("🏥", "Diagnósticos") + tb(
      r2("Dx Principal", data.diagnosticoPrincipal||"Z10.0", "Dx Secundario 1", data.diagnosticoSecundario1||"") +
      (data.diagnosticoSecundario2 ? r1("Dx Secundario 2", data.diagnosticoSecundario2) : "") +
      dxList.map((d,i) => r1(`Dx ${i+1} (${d.tipo||"—"})`, (d.cie10||"")+" "+(d.descripcion||""))).join("")
    ));

    // ═══ 12. CONCEPTO DE APTITUD ═══
    sections.push(sec("✅", "Concepto de Aptitud y Recomendaciones") +
      `<div style="background:#065f46;color:white;text-align:center;padding:10px;border-radius:6px;font-size:12pt;font-weight:900;margin:8px 0;text-transform:uppercase;">${_e(data.conceptoAptitud||"PENDIENTE")}</div>` +
      (data.vigencia ? `<p style="text-align:center;font-size:8.5pt;color:#555;margin-bottom:8px;">Vigencia: ${_e(data.vigencia)}</p>` : ""));

    // ═══ 13. RECOMENDACIONES ═══
    const recomTxt = [data.recomendacionesOcupacionales, data.recomendacionesMedicas, data.recomendaciones].filter(Boolean).join("\n");
    if (recomTxt) sections.push(`<div style="margin:8px 0;"><strong style="font-size:9.5pt;color:#065f46;">RECOMENDACIONES:</strong>${fmtList(recomTxt)}</div>`);

    // ═══ 14. RESTRICCIONES ═══
    const restricTxt = Array.isArray(data.analisisRestricciones) ? data.analisisRestricciones.join("\n") : (data.analisisRestricciones || data.restricciones || "");
    if (restricTxt) sections.push(`<div style="margin:8px 0;"><strong style="font-size:9.5pt;color:#dc2626;">RESTRICCIONES LABORALES:</strong>${fmtList(restricTxt)}</div>`);

    // ═══ 15. ANÁLISIS CLÍNICO ═══
    if (data.analisisIA) sections.push(sec("🧠", "Análisis Clínico") + `<div style="padding:6px 10px;font-size:9pt;white-space:pre-wrap;line-height:1.5;">${_nl2br(data.analisisIA)}</div>`);

    // ═══ 16. SVE ═══
    if (data.sveRecomendado?.length > 0) sections.push(sec("🛡️", "Sistema de Vigilancia Epidemiológica") + '<ul style="padding-left:16px;margin:4px 0;">' + data.sveRecomendado.map(s => '<li style="font-size:9pt;margin-bottom:3px;">' + _e(s) + '</li>').join("") + '</ul>');

    // ═══ 17. DERIVACIONES ═══
    const derivs = data.derivaciones || [];
    if (derivs.length > 0) {
      sections.push(sec("🔗", "Derivaciones / Interconsultas") + '<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="background:#2563eb;color:white;padding:4px 8px;font-size:8pt;">Especialidad</th><th style="background:#2563eb;color:white;padding:4px 8px;font-size:8pt;">Motivo</th><th style="background:#2563eb;color:white;padding:4px 8px;font-size:8pt;">Urgencia</th></tr></thead><tbody>' + derivs.map((d,i) => '<tr style="background:' + (i%2===0 ? "#eff6ff" : "white") + '"><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;font-weight:700;">' + _e(d.especialidad) + '</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;">' + _e(d.motivo) + '</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;">' + _e(d.urgencia) + '</td></tr>').join("") + '</tbody></table>');
    }

    // ═══ 18. FÓRMULA MÉDICA ═══
    const meds = data.formulaMedicamentos || [];
    if (meds.length > 0) {
      sections.push(sec("💊", "Fórmula Médica") + '<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="background:#7c3aed;color:white;padding:4px 8px;font-size:8pt;">Medicamento</th><th style="background:#7c3aed;color:white;padding:4px 8px;font-size:8pt;">Presentación</th><th style="background:#7c3aed;color:white;padding:4px 8px;font-size:8pt;">Dosis</th><th style="background:#7c3aed;color:white;padding:4px 8px;font-size:8pt;">Frecuencia</th><th style="background:#7c3aed;color:white;padding:4px 8px;font-size:8pt;">Duración</th></tr></thead><tbody>' + meds.map((m,i) => '<tr style="background:' + (i%2===0 ? "#faf5ff" : "white") + '"><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;font-weight:700;">' + _e(m.nombre) + '</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;">' + _e(m.presentacion) + '</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;">' + _e(m.dosis) + '</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;">' + _e(m.frecuencia) + '</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:8.5pt;">' + _e(m.duracion) + '</td></tr>').join("") + '</tbody></table>');
    }

    // ═══ 19. INCAPACIDAD ═══
    const inc = data.incapacidad || {};
    if (inc.aplica || inc.dias > 0) {
      sections.push(sec("🏥", "Incapacidad Médica") + tb(
        r2("Días", inc.dias||0, "Origen", inc.origen||"Enfermedad General") +
        r2("Desde", inc.desde||"--", "Hasta", inc.hasta||"--") +
        r1("Diagnóstico", inc.diagnosticoCIE||inc.diagnostico||"--")
      ));
    }

    // ═══ 20. NOTAS ACLARATORIAS ═══
    const notas = data.notasAclaratorias || [];
    if (notas.length > 0) {
      sections.push(sec("📌", "Notas Aclaratorias") + notas.map(n => `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:4px;padding:8px;margin:4px 0;font-size:8.5pt;"><strong>${_e(n.fecha ? new Date(n.fecha).toLocaleString("es-CO") : "")} — ${_e(n.autor||"")}</strong><br/>${_e(n.contenido||"")}</div>`).join(""));
    }

    // ═══ 21. EVOLUCIONES ═══
    const evols = data.evoluciones || [];
    if (evols.length > 0) {
      sections.push(sec("📜", "Evoluciones Clínicas") + evols.map(ev => `<div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:4px;padding:8px;margin:4px 0;font-size:8.5pt;"><strong>${_e(ev.fecha||"")} — ${_e(ev.medico||"")} · Código: ${_e(ev.codigoEvolucion||"")}</strong><br/>${_e(ev.motivoConsulta||"")}${ev.texto ? "<br/>"+_e(ev.texto) : ""}${ev.nuevoConcept ? "<br/><strong>Concepto:</strong> "+_e(ev.nuevoConcept) : ""}</div>`).join(""));
    }

    // ═══ FIRMA ═══
    sections.push(`<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:30px;padding-top:10px;border-top:2px solid #d1d5db;">
    <div style="text-align:center;width:40%;"><div style="height:50px;"></div><div style="border-top:1.5px solid #333;padding-top:4px;font-size:8pt;font-weight:700;">Firma del Trabajador<br/>${_e(data.docTipo||"CC")}: ${_e(data.docNumero||"")}</div></div>
    <div style="text-align:center;width:40%;">${sigHtml}<div style="border-top:1.5px solid #333;padding-top:4px;font-size:8pt;font-weight:700;">${_e(doc.nombre||"")}<br/>${_e(doc.titulo||"")}<br/>C.C. ${_e(doc.cedula||"")}<br/>RM: ${_e(doc.licencia||"")}<br/>${_e(doc.ciudad||"")}</div></div></div>`);

    // ═══ CÓDIGO VERIFICACIÓN ═══
    if (data.codigoVerificacion) {
      sections.push(`<div style="text-align:center;margin-top:12px;background:#f0fdf4;border:1.5px solid #86efac;border-radius:6px;padding:8px;"><p style="font-size:7.5pt;font-weight:900;color:#6b7280;text-transform:uppercase;">Historia Clínica Firmada y Cerrada</p><p style="font-size:11pt;font-family:monospace;font-weight:900;color:#065f46;letter-spacing:2px;">${_e(data.codigoVerificacion)}</p></div>`);
    }

    // ═══ EXÁMENES SOLICITADOS (HOJA APARTE) ═══
    const examList = data.solicitudExamenes || [];
    if (examList.length > 0) {
      sections.push('<div style="page-break-before:always;">' + sec("🔬", "Paraclínicos y Exámenes Solicitados") + '<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="background:#0d9488;color:white;padding:6px 10px;font-size:8.5pt;text-align:left;">N°</th><th style="background:#0d9488;color:white;padding:6px 10px;font-size:8.5pt;text-align:left;">Examen / Procedimiento</th><th style="background:#0d9488;color:white;padding:6px 10px;font-size:8.5pt;text-align:center;">Urgente</th></tr></thead><tbody>' + examList.map((ex,i) => '<tr style="background:' + (i%2===0 ? "#f0fdfa" : "white") + '"><td style="padding:5px 8px;font-size:8.5pt;border:1px solid #ccc;">' + (i+1) + '</td><td style="padding:5px 8px;font-size:8.5pt;border:1px solid #ccc;">' + _e(ex.nombre) + '</td><td style="padding:5px 8px;font-size:8.5pt;border:1px solid #ccc;text-align:center;">' + (ex.urgente ? "⚡ SÍ" : "") + '</td></tr>').join("") + '</tbody></table></div>');
    }

    // ═══ ENSAMBLAR DOCUMENTO ═══
    const w = window.open("", "_blank", "width=870,height=1100");
    if (!w) { showAlert("Permita las ventanas emergentes para imprimir."); return; }
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>[OCUPASALUD] ${_e(data.nombres||"HC")}</title>
    <style>@page{size:letter portrait;margin:1.1cm 1.4cm 1.3cm 1.4cm;}*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5pt;color:#111;margin:0;padding:14mm 16mm;line-height:1.4;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:4px 8px;font-size:8.5pt;}th{font-weight:700;text-align:left;background:#d1fae5;}p{margin:3px 0;}ul{margin:4px 0;padding-left:16px;}li{margin-bottom:2px;font-size:9pt;}.np-bar{position:fixed;top:0;left:0;right:0;background:#065f46;color:#fff;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;}.np-bar button{border:none;padding:6px 16px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;background:#10b981;color:#fff;}@media print{.np-bar{display:none!important;}body{padding:0;}}</style></head><body>
    <div class="np-bar"><span style="flex:1;font-weight:700;">📋 HC ${_e(data.nombres||"")} — ${_e(data.codigoVerificacion||"")}</span><button onclick="window.print()">📥 Guardar / Imprimir PDF</button><button onclick="window.close()" style="background:#ef4444;">✕ Cerrar</button></div>
    <div style="margin-top:50px;">${sections.join("")}</div></body></html>`);
    w.document.close();
    w.focus();
  };
  // ── Navegación con historial -- permite ← Volver sin volver al login ──────
  // Helper: mostrar diálogo guardar-antes-de-salir si la HC tiene cambios pendientes
  const _maybeExitHC = (proceed) => {
    if (view === "historia" && _hcDirty && (data.id || data.nombres)) {
      _setExitHcConfirm({ onProceed: proceed });
    } else {
      proceed();
    }
  };
  const _goToDirect = (newView) => {
    // ── Guardar HC en localStorage antes de cambiar de vista ──
    if (view === "historia" && data.nombres) {
      try {
        _ls.setItem("siso_active_form", JSON.stringify({ ...data, _autoSaved: new Date().toISOString() }));
      } catch (_eSave) { /* silencioso */ }
    }
    // Al entrar al dashboard, asegurar que todos los datos del _ls estén cargados
    if (newView === "dashboard") {
      // AISLAMIENTO: usar clave específica del usuario activo (o empresa compartida)
      const _activeUser = currentUser?.user;
      if (_activeUser) {
        const _suidGoTo = currentUser?.empresaId
          ? "empresa_" + currentUser.empresaId
          : _activeUser;
        const snPat = sp(_patKey(_suidGoTo), null);
        if (snPat !== null) setPatientsList(snPat);
        const snComp = sp(_compKey(_suidGoTo), null);
        if (snComp !== null) setCompanies(snComp);
      }
      const snBills = sp("siso_saved_bills", null);
      if (snBills !== null) setSavedBillsList(snBills);
      const snRep = sp("siso_saved_reports", null);
      if (snRep !== null) setSavedReports(snRep);
      // FIX C-03: cargar proveedor desde localStorage; keys desde sessionStorage
      const snAIProvider = sp("siso_ai_config_provider", null);
      const snAIKeys = sps("siso_ai_keys", null);
      if (snAIProvider !== null)
        setAiConfig((prev) => ({
          ...prev,
          activeProvider: snAIProvider.activeProvider || prev.activeProvider,
          keys: snAIKeys || prev.keys,
        }));
    }
    setNavStack((prev) => [...prev, view]); // guardar vista actual en historial
    setView(newView);
    // Registrar globalmente para que PlanGate pueda navegar sin prop drilling
    window._sisoGoTo = goTo;
  };
  const goTo = (newView) => {
    if (newView !== "historia") {
      _maybeExitHC(() => _goToDirect(newView));
    } else {
      _goToDirect(newView);
    }
  };
  const _goBackDirect = () => {
    setNavStack((prev) => {
      // Filtrar 'login' del historial para nunca volver al login por accidente
      const filtered = prev.filter((v) => v !== "login");
      if (filtered.length === 0) {
        setView("dashboard");
        return [];
      }
      const last = filtered[filtered.length - 1];
      setView(last);
      return filtered.slice(0, -1);
    });
  };
  const goBack = () => {
    _maybeExitHC(_goBackDirect);
  };
  // ═══ APP CONTEXT — expone todo el estado y helpers a las páginas extraídas ═══
  const appContext = {
    view, setView, navStack, setNavStack, currentUser, setCurrentUser,
    loginAttempts, setLoginAttempts, loginBlockedUntil, setLoginBlockedUntil,
    privacidadAceptada, setPrivacidadAceptada, syncStatus, setSyncStatus,
    showSyncReport, setShowSyncReport, syncReport, setSyncReport,
    alertMsg, setAlertMsg, confirmConfig, setConfirmConfig,
    promptConfig, setPromptConfig, promptValue, setPromptValue,
    aiConfig, setAiConfig, showAIConfig, setShowAIConfig, aiStatus, setAiStatus,
    companies, setCompanies, usersList, setUsersList, usersReady, setUsersReady,
    patientsList, setPatientsList, savedReports, setSavedReports,
    savedBills, setSavedBills, atencionesCerradas, setAtencionesCerradas,
    doctorSignature, setDoctorSignature, auditLog, setAuditLog,
    activeTab, setActiveTab, data, setData, dataType, setDataType,
    isGenerating, setIsGenerating, isGeneratingRestr, setIsGeneratingRestr,
    isGeneratingReco, setIsGeneratingReco, saveStatus, setSaveStatus,
    patientSuggestions, setPatientSuggestions,
    historyNotification, setHistoryNotification,
    showRestriccionesPanel, setShowRestriccionesPanel,
    showRecomendacionesPanel, setShowRecomendacionesPanel,
    showHistoryModal, setShowHistoryModal,
    ripsModalData, setRipsModalData, backupModalData, setBackupModalData,
    hcChoiceAgenda, setHcChoiceAgenda,
    historyRecords, setHistoryRecords, patientSearchTerm, setPatientSearchTerm,
    genPatSearch, setGenPatSearch,
    examSearch, setExamSearch, examList, setExamList,
    showExamSuggs, setShowExamSuggs,
    diagExamen, setDiagExamen, justExamen, setJustExamen,
    printPreview, setPrintPreview,
    selectedCompanyReport, setSelectedCompanyReport,
    selectedMedicoReport, setSelectedMedicoReport,
    reporteActiveTab, setReporteActiveTab, certSelected, setCertSelected,
    reportStartDate, setReportStartDate, reportEndDate, setReportEndDate,
    reportAIResult, setReportAIResult, isGeneratingReport, setIsGeneratingReport,
    showExportTable, setShowExportTable,
    precioPorPaciente, setPrecioPorPaciente,
    showDianPanel, setShowDianPanel,
    showSecretariaPatientModal, setShowSecretariaPatientModal,
    showTodoChecklist, setShowTodoChecklist, todoSelection, setTodoSelection,
    dianProvider, setDianProvider, dianApiKey, setDianApiKey,
    billData, setBillData, savedBillsList, setSavedBillsList,
    portafolioItems, setPortafolioItems, portafolioForm, setPortafolioForm,
    portafolioEditId, setPortafolioEditId,
    cotizaciones, setCotizaciones, cotizacionForm, setCotizacionForm,
    cotizacionView, setCotizacionView, cotizacionSelId, setCotizacionSelId,
    cajaMovimientos, setCajaMovimientos, cajaForm, setCajaForm,
    cajaTab, setCajaTab, cajaFiltroPeriodo, setCajaFiltroPeriodo,
    cajaFiltroDesde, setCajaFiltroDesde, cajaFiltroHasta, setCajaFiltroHasta,
    contabTab, setContabTab, contabPeriodo, setContabPeriodo,
    asistenciaFecha, setAsistenciaFecha,
    evolucionForm, setEvolucionForm, showEvolucionModal, setShowEvolucionModal,
    selectedPackage, setSelectedPackage, packageChecklist, setPackageChecklist,
    showPackages, setShowPackages, newComp, setNewComp,
    ipsPerfilForm, setIpsPerfilForm,
    verificationCode, setVerificationCode, verificationFound, setVerificationFound,
    activeUserMgmtTab, setActiveUserMgmtTab,
    pendingActivationPlan, setPendingActivationPlan,
    sbCloudData, setSbCloudData, sbLoading, setSbLoading,
    newUserForm, setNewUserForm, userEditId, setUserEditId, editForm, setEditForm,
    propForm, setPropForm, selSvc, setSelSvc, propModulo, setPropModulo,
    mensajes, setMensajes, showMensajePanel, setShowMensajePanel,
    showConsentModal, setShowConsentModal,
    twoFAStep, setTwoFAStep, twoFAToken, setTwoFAToken, twoFAError, setTwoFAError,
    habeasRequests, setHabeasRequests, showHabeasModal, setShowHabeasModal,
    habeasForm, setHabeasForm, showPortalPublico, setShowPortalPublico,
    arlTab, setArlTab, svePrograma, setSvePrograma,
    sveFiltroEmpresa, setSveFiltroEmpresa,
    sveAIAnalisis, setSveAIAnalisis, sveAICargando, setSveAIAnalisisCargando,
    sveAIFiltroEmpresa, setSveAIFiltroEmpresa,
    arlForm, setArlForm, arlGuardados, setArlGuardados,
    showNotifModal, setShowNotifModal, notifData, setNotifData,
    portalCodigo, setPortalCodigo, portalPaciente, setPortalPaciente,
    portalMultiple, setPortalMultiple,
    epiEmpresa, setEpiEmpresa, epiPeriodo, setEpiPeriodo, epiTab, setEpiTab,
    teleconsultas, setTeleconsultas, teleForm, setTeleForm,
    teleSalaActiva, setTeleSalaActiva, teleTab, setTeleTab,
    mensajeRespuesta, setMensajeRespuesta,
    agendados, setAgendados, showAgenda, setShowAgenda,
    agendaForm, setAgendaForm, agendaSuggs, setAgendaSuggs, agendaTab, setAgendaTab,
    showComposeMensaje, setShowComposeMensaje, composeMensaje, setComposeMensaje,
    companiesTab, setCompaniesTab, editingCompany, setEditingCompany,
    cajaMedicoPeriodo, setCajaMedicoPeriodo,
    porcentajeMedico, setPorcentajeMedico,
    medicoTurnoActivo, setMedicoTurnoActivo,
    orgsList, setOrgsList, activeOrgId, setActiveOrgId,
    superAdminTab, setSuperAdminTab, newOrgForm, setNewOrgForm,
    portalEmpresaCodigo, setPortalEmpresaCodigo,
    portalEmpresaEncontrada, setPortalEmpresaEncontrada,
    portalEmpresaPacientes, setPortalEmpresaPacientes,
    portalEmpresaTab, setPortalEmpresaTab,
    portalEmpresaBuscando, setPortalEmpresaBuscando,
    portalEmpresaFiltroDoc, setPortalEmpresaFiltroDoc,
    portalActivadoInfo, setPortalActivadoInfo,
    portalEmpresaAdmin, setPortalEmpresaAdmin,
    portalAdminTab, setPortalAdminTab,
    portalAdminLoginUser, setPortalAdminLoginUser,
    portalAdminLoginPass, setPortalAdminLoginPass,
    nuevoMedicoEmpForm, setNuevoMedicoEmpForm,
    sedeForm, setSedeForm, ipsCredForm, setIpsCredForm,
    ipsEditingEmpId, setIpsEditingEmpId,
    showConsentimiento, setShowConsentimiento,
    _hcDirty, _setHcDirty, _exitHcConfirm, _setExitHcConfirm,
    activeDoctorData, activeSignature,
    fileInputRef, fileInputSigRef, csvInputRef,
    goTo, goBack, showAlert, handleChange, handleNameChange, handleSavePatient,
    handleCloseHistory, handleEditHistory, handlePrint, logAccess,
    canViewPatient, isHcOwner, openPatient, handleNewOccupHistory, handleNewGeneralHistory,
    selectPatientSuggestion, generateAIAnalysis, generateAIRestricciones, generateAIRecomendaciones,
    applyRestriccionesChecklist, applyRecomendacionesChecklist, handleManualCloudSave,
    handleExportData, handleImportData, handleSignatureUpload, handleLogin, handleSaveAIConfig,
    exportPatientTable, _printHCClean, handleAceptarPrivacidad,
    renderNavbar,
    BrandLogo, DoctorSignature, DoctorSignatureMemo, LoginForm,
    InputGroup, PlanGate,
    _isAdmin, _isAdminEmpresa, _isAdminOrEmpresa, _canUse, _contarHC,
    _generarCertificadoHTMLNormalizado,
    PLAN_CONFIG, SECRETARIA_PERMISOS_DEFAULT, DEFAULT_DOCTOR_DATA, ORG_DEFAULT_ID,
    _ls, _sbSet, _sbGet, _SB_URL, _SB_KEY,
    sanitizeInput,
    // Helpers for extracted pages
    SectionTitle, SelectGroup, TextAreaGroup, CIE10Input, CIE11Badge, CUPSInput,
    MedicamentoAutocomplete, ConsentimientoModal,
    handleCompanySelect, handleOpenHistoryModal, generateAIGeneral,
    analyzeBP, analyzeHR, analyzeBMI, NORMAL_DESCRIPTIONS_SYSTEMS,
    EPS_LIST, ARL_LIST, AFP_LIST, TURNO_LIST, CONTRATO_LIST,
    DEFAULT_RECOMENDACIONES_SELECTED,
    inactivityWarning, inactivityCountdown, _resetInactivity,
    handleVerify2FA,
    _sync, _secretariaPuede,
  };
  // ─────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  // [EXTRACTED: pages/Navbar.jsx]
  const renderNavbar = () => <Navbar />;
  // ─── RENDER: DASHBOARD ────────────────────────────────────────────────────
  // ─── RENDER: HC OCUPACIONAL ───────────────────────────────────────────────
  // [EXTRACTED: pages/HistoriaOcupacional.jsx]
  // ─── RENDER: HC MEDICINA GENERAL ─────────────────────────────────────────
  // [EXTRACTED: pages/HistoriaGeneral.jsx]
  // ─── RENDER: CERTIFICADO ──────────────────────────────────────────────────
  // [EXTRACTED: pages/CertificadoPage.jsx]
  // ─── RENDER: REPORTES ─────────────────────────────────────────────────────
  // ─── RENDER: PACIENTES ────────────────────────────────────────────────────
  // ══ B-12: Helper de periodicidad - Res. 1843/2025 Art. 4 (max 3 años entre evaluaciones) ══
  // [EXTRACTED with PatientsPage: _getPeriodicidadStatus]
  // [EXTRACTED: pages/PatientsPage.jsx]
  // ─── RENDER: EMPRESAS ─────────────────────────────────────────────────────
  // ─── RENDER: VERIFICACIÓN ─────────────────────────────────────────────────
  // ─── RENDER: CUENTAS DE COBRO ─────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  // B-24: PORTAL DEL TRABAJADOR - Solo lectura con código de verificación
  // Res. 2346/2007 Art. 14 · Ley 1581/2012 - Acceso del titular a su HC
  // ══════════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════════
  // B-31: SVE - Sistema Vigilancia Epidemiológica - Res. 2346/2007 · Res. 1843/2025
  // ══════════════════════════════════════════════════════════════════════════
  // [EXTRACTED: pages/SVEPage.jsx]

  // ══════════════════════════════════════════════════════════════════════════
  // B-26: ARL - Reporte AT/EL - Decreto 1072/2015 · Res. 0312/2019
  // ══════════════════════════════════════════════════════════════════════════
  // [EXTRACTED: pages/ARLPage.jsx]

  // ══════════════════════════════════════════════════════════════════════════
  // B-22: HABEAS DATA - Módulo de Derechos del Titular
  // Ley 1581 de 2012 · Decreto 1078 de 2015 (DUR MinTIC) · Res. SIC 2023
  // ══════════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════════
  // B-17: TELEMEDICINA - Jitsi Meet (Res. 2654/2019)
  // Videoconsulta integrada con consentimiento digital, sin costo por minuto
  // ══════════════════════════════════════════════════════════════════════════
  // [EXTRACTED: pages/TelemedicinaPage.jsx]

  // ══════════════════════════════════════════════════════════════════════════
  // B-16: ADJUNTOS DE PARACLÍNICOS - Supabase Storage
  // Res. 1843/2025 Art.12 - Espirometría, Audiometría, RX, Laboratorios
  // ══════════════════════════════════════════════════════════════════════════
  // [EXTRACTED: pages/TabAdjuntos.jsx]

  // ─── ROUTER ───────────────────────────────────────────────────────────────
  // ─── RENDER: GESTIÓN DE USUARIOS ─────────────────────────────────────────
  // ─── RENDER: PLANES Y PRECIOS ────────────────────────────────────────────

  // ─── RENDER: PROPUESTAS ECONÓMICAS ───────────────────────────────────────
  // ══════════════════════════════════════════════════════
  // B-F1-03: PORTAFOLIO DE SERVICIOS / LISTA DE PRECIOS
  // ══════════════════════════════════════════════════════
  // [EXTRACTED: pages/PropuestasPage.jsx]
  // ─── RENDER: TAB SOLICITUD EXÁMENES ─────────────────────────────────────
  // [EXTRACTED: pages/TabSolicitudExamenes.jsx]
  // ─── RENDER: TAB INCAPACIDAD GENERAL ────────────────────────────────────
  // [EXTRACTED: pages/TabIncapacidadGeneral.jsx]
  // ─── RENDER: AGENDA / SALA DE ESPERA ───────────────────────────────────────
  // ─── RENDER: REPORTE ASISTENCIA AGENDA ──────────────────────────────────────
  // [EXTRACTED: pages/AsistenciaAgendaPage.jsx]

  // ─── RENDER: PORTAFOLIO DE SERVICIOS (B-F1-03) ──────────────────────────────
  // [EXTRACTED: pages/PortafolioPage.jsx]

  // ─── RENDER: COTIZACIONES FORMALES (B-F1-04) ────────────────────────────────
  // ── renderCotizacionesInline: contenido de cotizaciones embebido en propuestas ──
  // [EXTRACTED: pages/CotizacionesInlinePage.jsx]

  // [EXTRACTED: pages/CotizacionesPage.jsx]

  // ─── RENDER: MÓDULO CONTABILIDAD (PASO 5) ────────────────────────────────────
  // [EXTRACTED: pages/ContabilidadPage.jsx]

  // ─── RENDER: PERFIL IPS / MI EMPRESA (PASO 1) ────────────────────────────────

  // ─── RENDER: CAJA DIARIA + COMPROBANTES + CUENTAS COBRAR (B-F2-01/02/03) ────

  // ══════════════════════════════════════════════════════════════════════════
  // FASE 2 — PANEL GLOBAL SUPER ADMIN
  // Gestión de todas las organizaciones. Solo visible para rol super_admin.
  // ══════════════════════════════════════════════════════════════════════════
  // [EXTRACTED: pages/SuperAdminPage.jsx]

  // ─── RENDER: PORTAL EMPRESA-CLIENTE (B-F2-06) ──────────────────────────────
  // [EXTRACTED: pages/PortalEmpresaPage.jsx]

  // ─── RENDER: EVOLUCIONES CLÍNICAS MODAL (B-F2-05 EXPANDIDO) ──────────────
  // [EXTRACTED: pages/EvolucionModal.jsx]

  // ─── RENDER: MENSAJERÍA INTERNA ────────────────────────────────────────────
  // Called inline as overlay + floating panel - not a full-page view
  // [EXTRACTED: pages/MensajesOverlay.jsx]
  // ── B-F1-03: Persistir portafolio ──────────────────────────────────────
  const savePortafolio = (items) => {
    setPortafolioItems(items);
    try {
      localStorage.setItem("siso_portafolio", JSON.stringify(items));
    } catch {}
  };
  // ── B-F1-04: Persistir cotizaciones ──────────────────────────────────
  const saveCotizaciones = (list) => {
    setCotizaciones(list);
    try {
      localStorage.setItem("siso_cotizaciones", JSON.stringify(list));
    } catch {}
  };
  const nextCotizNum = () => {
    const max = cotizaciones.reduce(
      (m, c) => Math.max(m, parseInt(c.numero || "0") || 0),
      0
    );
    return String(max + 1).padStart(4, "0");
  };
  // ── B-F2-01: Persistir caja ───────────────────────────────────────────
  const saveCaja = (movs) => {
    setCajaMovimientos(movs);
    try {
      // PASO 6: clave aislada por empresa/usuario
      const suf = currentUser?.empresaId
        ? "empresa_" + currentUser.empresaId
        : currentUser?.user || "shared";
      localStorage.setItem(`siso_caja_${suf}`, JSON.stringify(movs));
      _sbSet(`siso_caja_movs_${suf}`, movs); // Bloque 3: sync Supabase
    } catch {}
  };
  // ── B-F2-01/02: Generar comprobante ──────────────────────────────────
  const openComprobanteWindow = (tipo, mov) => {
    const doc = activeDoctorData;
    const _miIPSComp = currentUser?.empresaId
      ? companies.find((c) => c.id === currentUser.empresaId) || null
      : null;
    const num = mov.id || Date.now();
    const fecha = mov.fecha || new Date().toLocaleDateString("es-CO");
    const tipoLabel =
      tipo === "ingreso"
        ? "COMPROBANTE DE INGRESO"
        : tipo === "egreso"
        ? "COMPROBANTE DE EGRESO"
        : "RECIBO DE CAJA";
    const _compLeftHtml = _miIPSComp
      ? `<div style="text-align:left;">
          ${
            _safeLogoUrl(_miIPSComp.logo || "") // SEC-FIX-02
              ? `<img src="${_safeLogoUrl(_miIPSComp.logo)}" style="max-height:36px;max-width:90px;object-fit:contain;display:block;margin-bottom:3px;"/>`
              : ""
          }
          <div style="font-size:11px;font-weight:900;color:#1a1a1a;">${_sanitize(
            _miIPSComp.nombre || ""
          )}</div>
          ${
            _miIPSComp.nit
              ? `<div style="font-size:9px;color:#555;">NIT: ${_sanitize(
                  _miIPSComp.nit
                )}${_miIPSComp.dv ? "-" + _sanitize(_miIPSComp.dv) : ""}</div>`
              : ""
          }
          ${
            _miIPSComp.direccion
              ? `<div style="font-size:9px;color:#555;">${_sanitize(
                  _miIPSComp.direccion
                )}${
                  _miIPSComp.ciudad ? " · " + _sanitize(_miIPSComp.ciudad) : ""
                }</div>`
              : ""
          }
          ${
            _miIPSComp.telefono
              ? `<div style="font-size:9px;color:#555;">Tel: ${_sanitize(
                  _miIPSComp.telefono
                )}</div>`
              : ""
          }
        </div>`
      : `<div style="text-align:left;">
          <div style="font-size:11px;font-weight:900;color:#1a1a1a;">${_sanitize(
            doc?.nombre || ""
          )}</div>
          <div style="font-size:9px;color:#555;">${_sanitize(
            doc?.titulo || ""
          )}</div>
          <div style="font-size:9px;color:#555;">Lic: ${_sanitize(
            doc?.licencia || ""
          )} · ${_sanitize(doc?.ciudad || "")}</div>
        </div>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${tipoLabel}</title>
<style>
body{font-family:Arial,sans-serif;margin:0;padding:24px;font-size:11px;color:#111}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1a1a1a;padding-bottom:12px;margin-bottom:16px}
.title{font-size:14px;font-weight:900;text-transform:uppercase;margin:4px 0;text-align:right}
.sub{font-size:10px;color:#555;text-align:right}
table{width:100%;border-collapse:collapse;margin-top:8px}
th{background:#1a1a1a;color:#fff;padding:6px 8px;text-align:left;font-size:10px}
td{padding:5px 8px;border-bottom:1px solid #ddd;font-size:11px}
.total-row td{font-weight:900;font-size:13px;background:#f0f0f0}
.firma{margin-top:40px;text-align:right}
.firma-line{border-top:1px solid #555;width:200px;margin-left:auto;padding-top:4px;font-size:10px;text-align:center}
.no-print{margin-top:16px;display:flex;gap:8px;justify-content:center}
@media print{.no-print{display:none}}
</style></head><body>
<div class="header">
${_compLeftHtml}
<div>
<div class="title">${tipoLabel}</div>
<div class="sub">No. ${num} · Fecha: ${fecha}</div>
</div>
</div>
<table>
<tr><th>Campo</th><th>Detalle</th></tr>
<tr><td>Concepto</td><td>${mov.concepto || ""}</td></tr>
<tr><td>Forma de pago</td><td>${mov.formaPago || ""}</td></tr>
<tr class="total-row"><td>MONTO</td><td>$ ${Number(
      mov.monto || 0
    ).toLocaleString("es-CO")} COP</td></tr>
</table>
<div class="firma">
<div class="firma-line">${_sanitize(doc?.nombre || "")}<br/>${_sanitize(
      doc?.titulo || ""
    )}<br/>Lic: ${_sanitize(doc?.licencia || "")}</div>
</div>
<div class="no-print">
<button onclick="window.print()" style="background:#1a1a1a;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-weight:900;cursor:pointer">🖨️ Imprimir</button>
<button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-weight:900;cursor:pointer">✕ Cerrar</button>
</div></body></html>`;
    const w = window.open("", "_blank", "width=560,height=620");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };
  // ── B-F1-05: Carné manipulación alimentos ────────────────────────────
  const openCarnetAlimentos = (paciente, docData) => {
    const doc = docData || activeDoctorData;
    const p = paciente || {};
    const empresa = companies.find((c) => c.id === p.empresaId);
    const fechaVig = p.vigencia
      ? new Date(
          new Date(p.fechaConsulta || Date.now()).getTime() +
            parseInt(p.vigencia) * 24 * 60 * 60 * 1000
        ).toLocaleDateString("es-CO")
      : "Ver concepto médico";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Carné Manipulación de Alimentos</title>
<style>
@media print{body{margin:0}@page{size:8.5cm 5.5cm;margin:0}}
body{font-family:Arial,sans-serif;margin:0;background:#f5f5f5}
.carne{width:8.5cm;height:5.5cm;background:#fff;border:2px solid #1a6b2f;border-radius:8px;
  overflow:hidden;display:flex;flex-direction:column;padding:8px;box-sizing:border-box;
  margin:10px auto;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.hdr{background:#1a6b2f;color:#fff;text-align:center;padding:3px;border-radius:4px;margin-bottom:4px}
.hdr h1{font-size:7px;margin:0;font-weight:900;text-transform:uppercase}
.body{display:flex;gap:6px;flex:1}
.foto{width:35px;height:45px;border:1px solid #1a6b2f;border-radius:4px;
  display:flex;align-items:center;justify-content:center;font-size:18px;
  background:#f0faf0;flex-shrink:0;overflow:hidden}
.foto img{width:100%;height:100%;object-fit:cover}
.info{flex:1;font-size:7px;line-height:1.4}
.info .nom{font-weight:900;font-size:8px;color:#1a6b2f}
.bottom{display:flex;justify-content:space-between;align-items:flex-end;margin-top:3px}
.firma{text-align:center;font-size:6px;border-top:1px solid #333;padding-top:1px;width:60px}
.valid{background:#d1fae5;border:1px solid #1a6b2f;border-radius:4px;padding:2px 6px;
  font-size:7px;font-weight:900;color:#065f46;text-align:center}
.no-print{text-align:center;padding:10px;display:flex;gap:8px;justify-content:center}
@media print{.no-print{display:none}}
</style></head><body>
<div class="carne">
<div class="hdr"><h1>🍽️ Carné Médico - Manipulación de Alimentos</h1></div>
<div class="body">
<div class="foto">${
      p.fotoPaciente ? `<img src="${p.fotoPaciente}" alt="Foto"/>` : "📷"
    }</div>
<div class="info">
<div class="nom">${p.nombres || "Paciente"}</div>
<div><b>Doc:</b> ${p.docTipo || "CC"} ${p.docNumero || ""}</div>
<div><b>Empresa:</b> ${empresa?.nombre || p.empresaId || "Particular"}</div>
<div><b>Cargo:</b> ${p.cargo || "-"}</div>
<div><b>Concepto:</b> ${p.conceptoAptitud || "APTO"}</div>
<div><b>Fecha:</b> ${
      p.fechaConsulta || new Date().toLocaleDateString("es-CO")
    }</div>
</div></div>
<div class="bottom">
<div class="firma">${doc?.nombre || ""}<br/>${doc?.titulo || ""}<br/>Lic: ${
      doc?.licencia || ""
    }</div>
<div class="valid">✅ VÁLIDO<br/>Hasta: ${fechaVig}</div>
</div></div>
<div class="no-print">
<button onclick="window.print()" style="background:#1a6b2f;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:900;cursor:pointer">🖨️ Imprimir Carné</button>
<button onclick="window.close()" style="background:#666;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-weight:900;cursor:pointer">✕ Cerrar</button>
</div></body></html>`;
    const w = window.open("", "_blank", "width=380,height=320");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };
  const renderCurrentView = () => {
    // NORMATIVO: Ley 1581/2012 - mostrar aviso si no ha sido aceptado
    if (!privacidadAceptada)
      return <PrivacyModal onAccept={handleAceptarPrivacidad} />;
    if (view === "login") {
      // ══ FIX: Mostrar carga mientras se recuperan usuarios de Supabase ══
      if (!usersReady) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center font-sans p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden animate-fade-in p-10 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <Cloud className="w-8 h-8 text-emerald-600 animate-pulse" />
              </div>
              <h2 className="text-lg font-black text-gray-800 mb-2">Conectando...</h2>
              <p className="text-sm text-gray-500">Restaurando datos desde la nube</p>
              <div className="mt-4 flex justify-center">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
              <p className="text-[10px] text-gray-400 mt-3">Si tarda más de 10 segundos, verifique su conexión a internet.</p>
            </div>
          </div>
        );
      }
      // B-18: Intercepción 2FA - mostrar pantalla de verificación TOTP
      if (twoFAStep)
        return (
          <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center font-sans p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden animate-fade-in">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  Verificación 2FA
                </h1>
                <p className="text-indigo-200 text-sm mt-1">
                  Autenticación de dos factores activa
                </p>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Ingrese el código de 6 dígitos de su aplicación autenticadora
                </p>
                <p className="text-xs text-center text-gray-400">
                  (Google Authenticator · Authy · Microsoft Authenticator)
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFAToken}
                  onChange={(e) => {
                    setTwoFAToken(e.target.value.replace(/\D/g, ""));
                    setTwoFAError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerify2FA();
                  }}
                  placeholder="000000"
                  className="w-full p-3 border-2 border-indigo-200 rounded-xl text-center text-3xl font-black tracking-[0.5em] focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
                {twoFAError && (
                  <p className="text-red-600 text-xs text-center font-bold">
                    {twoFAError}
                  </p>
                )}
                <button
                  onClick={handleVerify2FA}
                  disabled={twoFAToken.length !== 6}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl transition shadow-lg"
                >
                  ✅ Verificar código
                </button>
                <button
                  onClick={() => {
                    setTwoFAStep(null);
                    setTwoFAToken("");
                    setTwoFAError("");
                  }}
                  className="w-full py-2 text-gray-500 text-xs hover:text-gray-700"
                >
                  ← Volver al inicio de sesión
                </button>
              </div>
            </div>
          </div>
        );
      return <LoginPage />;
    }
    if (view === "dashboard") return <DashboardPage />;
    if (view === "superadmin") return <SuperAdminPage />;
    if (view === "planes") return <PlanesPage />;
    if (view === "portaltrabajador") return <PortalTrabajadorPage />;
    if (view === "portalempresa") return <PortalEmpresaPage />;
    if (view === "habeasdata") return <HabeasDataPage />;
    if (view === "arl") return <ARLPage />;
    if (view === "sve") return <SVEPage />;
    if (view === "telemedicina") return <TelemedicinaPage />;
    if (view === "agenda") return <AgendaPage />;
    if (view === "asistencia") return <AsistenciaAgendaPage />;
    if (view === "patients") return <PatientsPage />;
    // ══ B-07: Pantalla cambio de contraseña obligatorio (primer login o forzado) ══
    if (view === "changePassword")
      return (
        <ChangePasswordForm
          currentUser={currentUser}
          usersList={usersList}
          setUsersList={setUsersList}
          setCurrentUser={setCurrentUser}
          _sync={_sync}
          _patKey={_patKey}
          goTo={goTo}
          showAlert={showAlert}
        />
      );
    if (view === "companies") return <CompaniesPage />;
    if (view === "reporte") return <ReportePage />;
    if (view === "bill") return <BillPage />;
    if (view === "verification") return <VerificationPage />;
    if (view === "users") return <UsersPage />;
    if (view === "portafolio") return <PortafolioPage />;
    if (view === "caja") return <CajaPage />;
    if (view === "perfilips") return <PerfilIPSPage />;
    if (view === "contabilidad") return <ContabilidadPage />;
    if (view === "cotizaciones") {
      if (propModulo !== "cotizacion") setPropModulo("cotizacion");
      return <PropuestasPage />;
    }
    if (view === "propuestas") return <PropuestasPage />;
    if (view === "historia") {
      // FIX: _billDocData necesario para incapacidad, fórmula, derivación
      const _billDocUser = billData.billDoctorId
        ? usersList.find((u) => u.user === billData.billDoctorId)
        : null;
      const _billDocData = _billDocUser?.doctorData || activeDoctorData;
      const _billDocSig = _billDocUser?.doctorData?.firma || activeSignature;
      return (
        <div className="min-h-screen flex flex-col bg-gray-100 font-sans print:bg-white">
          {saveStatus === "saved" && (
            <div className="fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 no-print animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> ✅ Guardado
            </div>
          )}
          {inactivityWarning && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[9998] flex items-center gap-3 no-print">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-black text-sm">⏱️ Sesión por expirar</p>
                <p className="text-xs">
                  Cierre automático en{" "}
                  <span className="font-black">{inactivityCountdown}s</span> por
                  inactividad
                </p>
              </div>
              <button
                onClick={_resetInactivity}
                className="ml-4 bg-white text-red-600 px-3 py-1 rounded-lg font-black text-xs hover:bg-red-50"
              >
                Continuar
              </button>
            </div>
          )}
          {saveStatus === "auto" && (
            <div className="fixed top-4 right-4 bg-blue-400 text-white px-3 py-1.5 rounded-lg shadow-lg z-50 flex items-center gap-2 no-print animate-fade-in text-xs">
              <RefreshCw className="w-3 h-3" /> Autoguardado
            </div>
          )}
          {renderNavbar()}
          <main className="flex-grow p-6 max-w-5xl mx-auto w-full print:p-0">
            {dataType === "ocupacional" &&
              activeTab === "form" &&
              <HistoriaOcupacional />}
            {dataType === "general" &&
              activeTab === "formGeneral" &&
              <HistoriaGeneral />}
            {dataType === "ocupacional" &&
              activeTab === "certificado" &&
              <CertificadoPage />}
            {dataType === "ocupacional" &&
              (activeTab === "formulaTab" || activeTab === "derivacionTab") && (
                <TabFormulaDerivacion
                  data={data}
                  setData={setData}
                  _billDocData={_billDocData}
                  _billDocSig={_billDocSig}
                  onPrint={handlePrint}
                  forceTab={
                    activeTab === "derivacionTab" ? "derivacion" : "formula"
                  }
                />
              )}
            {dataType === "ocupacional" &&
              activeTab === "solicitudExamenes" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-teal-50">
                    <span className="text-sm font-black text-teal-800">
                      🔬 Solicitud de Exámenes Paraclínicos
                    </span>
                    <span className="text-[10px] text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">
                      HC Ocupacional
                    </span>
                  </div>
                  <div className="p-4"><TabSolicitudExamenes /></div>
                </div>
              )}
            {dataType === "ocupacional" && activeTab === "adjuntos" && (
              <div><TabAdjuntos /></div>
            )}
            {/* B-F1-05: CARNÉ MANIPULACIÓN ALIMENTOS */}
            {dataType === "ocupacional" &&
              activeTab === "carnetAlimentos" &&
              (() => {
                const doc = activeDoctorData;
                const sig = activeSignature;
                const printCarnet = () => {
                  const vigencia = (() => {
                    const d = new Date(
                      data.fechaExamen || new Date().toISOString().split("T")[0]
                    );
                    d.setFullYear(d.getFullYear() + 1);
                    return d.toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  })();
                  const _miIPSCarnet = currentUser?.empresaId
                    ? companies.find((c) => c.id === currentUser.empresaId) ||
                      null
                    : null;
                  const _carnetIpsBrand = _miIPSCarnet
                    ? `<div style="display:flex;align-items:center;gap:6px;border-bottom:1px solid #d1fae5;padding-bottom:5px;margin-bottom:7px;">
                        ${
                          _safeLogoUrl(_miIPSCarnet.logo || "") // SEC-FIX-02
                            ? `<img src="${_safeLogoUrl(_miIPSCarnet.logo)}" style="max-height:20px;max-width:50px;object-fit:contain;"/>`
                            : ""
                        }
                        <span style="font-size:8px;font-weight:900;color:#065f46;text-transform:uppercase;">${_sanitize(
                          _miIPSCarnet.nombre || ""
                        )}</span>
                        ${
                          _miIPSCarnet.nit
                            ? `<span style="font-size:7px;color:#888;margin-left:auto;">NIT: ${_sanitize(
                                _miIPSCarnet.nit
                              )}</span>`
                            : ""
                        }
                      </div>`
                    : "";
                  const html = `<!DOCTYPE html><html><head><title>Carné - ${
                    data.nombres || "Paciente"
                  }</title>
                <style>
                  body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5}
                  .card{width:8.56cm;min-height:5.4cm;background:white;border-radius:12px;padding:14px;box-shadow:0 4px 12px rgba(0,0,0,.15);margin:auto;border-top:5px solid #16a34a}
                  .header{display:flex;align-items:center;gap:10px;margin-bottom:10px;border-bottom:1px solid #e5e7eb;padding-bottom:8px}
                  .photo{width:50px;height:50px;border-radius:50%;border:2px solid #16a34a;object-fit:cover;background:#dcfce7;display:flex;align-items:center;justify-content:center;font-size:20px;overflow:hidden}
                  .badge{background:#dcfce7;color:#15803d;font-size:9px;font-weight:bold;padding:2px 8px;border-radius:12px;text-transform:uppercase}
                  .sig{max-width:100px;max-height:40px}
                  .no-print{margin-bottom:16px}
                  @media print{.no-print{display:none}body{background:white;padding:0}.card{box-shadow:none}}
                </style></head><body>
                <div class="no-print">
                  <button onclick="document.body.contentEditable='true'" style="margin-right:8px;padding:6px 14px;background:#4B5563;color:white;border:none;border-radius:6px;cursor:pointer">✏️ Editar</button>
                  <button onclick="window.print()" style="padding:6px 14px;background:#16a34a;color:white;border:none;border-radius:6px;cursor:pointer">🖨️ Imprimir</button>
                </div>
                <div class="card">
                  ${_carnetIpsBrand}
                  <div class="header">
                    ${
                      data.fotoPaciente
                        ? `<div class="photo"><img src="${data.fotoPaciente}" style="width:100%;height:100%;object-fit:cover"/></div>`
                        : '<div class="photo" style="font-size:22px;display:flex;align-items:center;justify-content:center">👤</div>'
                    }
                    <div style="flex:1">
                      <div class="badge">🍽️ Manipulación de Alimentos</div>
                      <p style="margin:3px 0;font-size:13px;font-weight:bold">${
                        data.nombres || ""
                      }</p>
                      <p style="margin:2px 0;font-size:10px;color:#6b7280">CC ${
                        data.docNumero || ""
                      }</p>
                      <p style="margin:2px 0;font-size:10px;color:#6b7280">${
                        data.cargo || ""
                      }</p>
                    </div>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px;font-size:10px">
                    <div><span style="color:#9ca3af">Empresa:</span><br><strong>${
                      companies.find((c) => c.id === data.empresaId)?.nombre ||
                      "Particular"
                    }</strong></div>
                    <div><span style="color:#9ca3af">Concepto:</span><br><strong style="color:#15803d">✅ APTO</strong></div>
                    <div><span style="color:#9ca3af">Fecha evaluación:</span><br><strong>${
                      data.fechaExamen || data.fechaConsulta || ""
                    }</strong></div>
                    <div><span style="color:#9ca3af">Vigente hasta:</span><br><strong style="color:#dc2626">${vigencia}</strong></div>
                  </div>
                  <div style="display:flex;justify-content:flex-end;align-items:flex-end;border-top:1px solid #e5e7eb;padding-top:6px">
                    <div style="text-align:center">
                      ${
                        sig
                          ? `<img src="${sig}" class="sig"/><br>`
                          : '<div style="width:100px;border-top:1px solid #333;margin-bottom:3px"></div>'
                      }
                      <p style="margin:0;font-size:8px;font-weight:bold">${
                        doc.nombre || ""
                      }</p>
                      <p style="margin:0;font-size:7px;color:#6b7280">Lic. ${
                        doc.licencia || ""
                      }</p>
                    </div>
                  </div>
                </div>
                </body></html>`;
                  const w = window.open("", "_blank", "width=500,height=420");
                  w.document.write(html);
                  w.document.close();
                };
                return (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
                        🍽️ Carné de Aptitud - Manipulación de Alimentos
                      </h3>
                      <button
                        onClick={printCarnet}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm"
                      >
                        🖨️ Imprimir Carné
                      </button>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                      <p className="text-xs text-emerald-800 font-bold mb-2">
                        Vista previa del carné (8.56 × 5.4 cm)
                      </p>
                      <div className="bg-white rounded-xl p-3 shadow border-t-4 border-emerald-500 max-w-xs">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100 mb-2">
                          {data.fotoPaciente ? (
                            <img
                              src={data.fotoPaciente}
                              className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center text-lg">
                              👤
                            </div>
                          )}
                          <div>
                            <span className="text-[9px] bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded-full">
                              🍽️ Manipulación de Alimentos
                            </span>
                            <p className="font-black text-gray-800 text-sm">
                              {data.nombres || "-"}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {data.cargo || ""}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] mb-2">
                          <div>
                            <span className="text-gray-400">Empresa:</span>
                            <br />
                            <strong>
                              {companies.find((c) => c.id === data.empresaId)
                                ?.nombre || "Particular"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-gray-400">Concepto:</span>
                            <br />
                            <strong className="text-emerald-700">
                              ✅ APTO
                            </strong>
                          </div>
                          <div>
                            <span className="text-gray-400">Evaluación:</span>
                            <br />
                            <strong>
                              {data.fechaExamen || data.fechaConsulta || "-"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-gray-400">Vigencia:</span>
                            <br />
                            <strong className="text-red-600">1 año</strong>
                          </div>
                        </div>
                        <div className="text-right border-t border-gray-100 pt-1">
                          <p className="text-[9px] font-bold">
                            {doc.nombre || ""}
                          </p>
                          <p className="text-[8px] text-gray-400">
                            Lic. {doc.licencia || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    {!data.fotoPaciente && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                        💡 Tip: Agrega la foto del paciente en la sección "Datos
                        Sociodemográficos" para que aparezca en el carné.
                      </div>
                    )}
                  </div>
                );
              })()}
            {activeTab === "incapacidad" && (
              <div
                className="bg-white mx-auto shadow-2xl print:shadow-none carta-visual"
                style={{
                  width: "21.59cm",
                  minHeight: "auto",
                  padding: "1.5cm",
                  boxSizing: "border-box",
                }}
              >
                <div className="text-center border-b-2 border-gray-800 pb-2 mb-4">
                  <div className="flex justify-center">
                    <BrandLogo data={_billDocData} />
                  </div>
                  <h2 className="text-2xl font-black uppercase mt-2">
                    Certificado de Incapacidad Médica
                  </h2>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-1 text-gray-700">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        className="w-full p-1.5 border rounded font-bold bg-white"
                        value={data.incapacidad?.fechaInicio || ""}
                        onChange={(e) =>
                          setData((p) => ({
                            ...p,
                            incapacidad: {
                              ...p.incapacidad,
                              fechaInicio: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-gray-700">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        className="w-full p-1.5 border rounded font-bold bg-white"
                        value={data.incapacidad?.fechaFin || ""}
                        onChange={(e) => {
                          const start = new Date(data.incapacidad?.fechaInicio);
                          const end = new Date(e.target.value);
                          const dias =
                            Math.ceil(
                              Math.abs(end - start) / (1000 * 60 * 60 * 24)
                            ) + 1;
                          setData((p) => ({
                            ...p,
                            incapacidad: {
                              ...p.incapacidad,
                              fechaFin: e.target.value,
                              dias: dias > 0 ? dias : 0,
                            },
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
                    <p className="text-xs font-bold text-emerald-700 uppercase mb-1">
                      Días
                    </p>
                    <p className="text-4xl font-black text-emerald-900">
                      {data.incapacidad?.dias || 0}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold">
                      {numeroALetras(data.incapacidad?.dias || 0)} DÍAS
                    </p>
                  </div>
                  <div className="space-y-3">
                    <select
                      value={data.incapacidad?.origen || "Enfermedad General"}
                      onChange={(e) =>
                        setData((p) => ({
                          ...p,
                          incapacidad: {
                            ...p.incapacidad,
                            origen: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border rounded text-xs font-bold"
                    >
                      <option value="Enfermedad General">
                        Enfermedad General
                      </option>
                      <option value="Accidente de Trabajo">
                        Accidente de Trabajo
                      </option>
                      <option value="Enfermedad Laboral">
                        Enfermedad Laboral
                      </option>
                    </select>
                    <textarea
                      rows={3}
                      value={data.incapacidad?.diagnostico || ""}
                      onChange={(e) =>
                        setData((p) => ({
                          ...p,
                          incapacidad: {
                            ...p.incapacidad,
                            diagnostico: e.target.value,
                          },
                        }))
                      }
                      placeholder="Diagnóstico (CIE-10)..."
                      className="w-full p-2 border rounded text-xs resize-none"
                    />
                  </div>
                </div>
                <div className="mt-10 flex justify-end px-4">
                  <div className="text-center w-1/3">
                    <DoctorSignature
                      signature={_billDocSig}
                      data={_billDocData}
                      showData={true}
                    />
                  </div>
                </div>
              </div>
            )}
            {/* ══ TAB: SOLICITUD DE EXÁMENES ══ */}
            {dataType === "general" &&
              activeTab === "solicitudExamenes" &&
              <TabSolicitudExamenes />}
            {/* ══ TAB: INCAPACIDAD MÉDICA (HC GENERAL) ══ */}
            {dataType === "general" &&
              activeTab === "incapacidadGeneral" &&
              <TabIncapacidadGeneral />}
            {activeTab === "ordenMedica" &&
              (() => {
                const buildGnHeader = (titleDoc, accent) => {
                  const fd = _sanitize(
                    data.fechaConsulta || new Date().toLocaleDateString("es-CO")
                  );
                  const accentSafe = /^#[0-9a-fA-F]{3,6}$/.test(accent)
                    ? accent
                    : "#2563eb";
                  const _miIPSGn = currentUser?.empresaId
                    ? companies.find((c) => c.id === currentUser.empresaId) ||
                      null
                    : null;
                  const pNom = _sanitize(data.nombres || "---");
                  const pDTipo = _sanitize(data.docTipo || "CC");
                  const pDNum = _sanitize(data.docNumero || "---");
                  const pEdad = _sanitize(String(data.edad || "--"));
                  const pSexo = _sanitize(data.genero || "---");
                  const pEps = _sanitize(data.eps || "---");
                  const pMotivo = _sanitize(data.motivoConsulta || "---");
                  return `<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${accentSafe};padding-bottom:10px;margin-bottom:14px;">
                  ${_ipsDocLeftHtml(_miIPSGn, _billDocData, accentSafe)}
                  <div style="width:34%;text-align:center;border-left:1px solid #ddd;border-right:1px solid #ddd;padding:0 10px;">
                    <p style="font-size:13pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:2px 0;">${_sanitize(
                    titleDoc
                  )}</p>
                    <p style="font-size:7pt;color:#888;margin:2px 0;">Res. 1995&#x2F;1999 · Cons. Gral.</p>
                    <p style="font-size:8pt;font-weight:700;color:#333;margin:5px 0 2px 0;">Fecha: ${fd}</p>
                  </div>
                  <div style="width:32%;text-align:right;padding-left:8px;">
                    <p style="font-size:10.5pt;font-weight:900;color:${accentSafe};text-transform:uppercase;margin:0 0 3px 0;">${pNom}</p>
                    <p style="font-size:7.5pt;color:#444;margin:1px 0;">${pDTipo}: <b>${pDNum}</b> · Edad: <b>${pEdad} años</b></p>
                    <p style="font-size:7.5pt;color:#444;margin:1px 0;">Sexo: ${pSexo} · EPS: <b>${pEps}</b></p>
                    <p style="font-size:7.5pt;color:#444;margin:1px 0;">Motivo: ${pMotivo}</p>
                  </div>
                </div>`;
                };
                const baseStyle = `@page{size:letter portrait;margin:1.1cm 1.3cm 1.3cm 1.3cm;}*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}body{font-family:Arial,Helvetica,sans-serif;font-size:9.5pt;color:#111;margin:0;padding:0;line-height:1.45;}.sec-title{font-size:8.5pt;font-weight:900;text-transform:uppercase;border-bottom:1.5px solid currentColor;padding-bottom:3px;margin:10px 0 6px 0;}.med-card{border:1px solid #d1fae5;border-left:4px solid #059669;border-radius:4px;padding:6px 10px;margin-bottom:6px;page-break-inside:avoid;background:#f0fdf4;}.deriv-card{border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:4px;padding:8px 10px;margin-bottom:7px;page-break-inside:avoid;background:#eff6ff;}.badge{display:inline-block;padding:1px 7px;border-radius:50px;font-size:7.5pt;font-weight:700;}.urgente{background:#fee2e2;color:#dc2626;}.prioritaria{background:#fef3c7;color:#92400e;}.electiva{background:#dcfce7;color:#166534;}.sig-block{display:flex;justify-content:space-between;align-items:flex-end;margin-top:18mm;}.sig-line{text-align:center;width:42%;}.sig-top{border-top:2px solid #222;padding-top:4px;font-size:7.5pt;font-weight:700;}.block-avoid{page-break-inside:avoid;}`;
                const sigBlock = `<div class="sig-block"><div class="sig-line"><div class="sig-top">Firma Paciente / Responsable</div><p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Nombre: ___________________</p></div><div class="sig-line">${
                  _billDocSig
                    ? `<img src="${_billDocSig}" style="max-height:55px;max-width:150px;" alt="Firma"/>`
                    : '<div style="height:55px;border-bottom:2px solid #222;"></div>'
                }<p style="font-size:8.5pt;font-weight:900;margin:3px 0;">${
                  _billDocData?.nombre || ""
                }</p><p style="font-size:7.5pt;color:#555;margin:1px 0;">${
                  _billDocData?.titulo || ""
                }</p></div></div>`;
                const printSection = (sectionId, titleDoc) => {
                  const w = window.open("", "_blank", "width=870,height=1100");
                  if (!w) return;
                  let accent = "#2563eb";
                  let bodyHtml = "";
                  if (sectionId === "gn-prescripcion") {
                    accent = "#059669";
                    const meds = data.formulaMedicamentos || [];
                    const medsHtml =
                      meds.length > 0
                        ? meds
                            .map(
                              (m, i) =>
                                `<div class="med-card" style="display:flex;gap:8px;align-items:flex-start;"><span style="background:#059669;color:white;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:8pt;font-weight:900;flex-shrink:0;">${
                                  i + 1
                                }</span><div style="flex:1;"><p style="font-size:10pt;font-weight:900;color:#065f46;margin:0 0 2px 0;">${
                                  m.nombre || ""
                                } <span style="font-size:8pt;font-weight:400;color:#6b7280;">${
                                  m.presentacion || ""
                                }</span></p><p style="font-size:8.5pt;color:#374151;margin:1px 0;"><b>Dosis:</b> ${
                                  m.dosis || "--"
                                } · <b>Frec.:</b> ${
                                  m.frecuencia || "--"
                                } · <b>Duración:</b> ${m.duracion || "--"}</p>${
                                  m.indicaciones
                                    ? `<p style="font-size:8pt;color:#92400e;font-style:italic;margin:2px 0;">&#9888; ${m.indicaciones}</p>`
                                    : ""
                                }</div></div>`
                            )
                            .join("")
                        : '<p style="color:#9ca3af;font-style:italic;text-align:center;padding:12px;">Sin medicamentos.</p>';
                    const planMeds =
                      !meds.length && data.plan?.medicamentos
                        ? `<div style="margin-top:8px;white-space:pre-wrap;font-size:8.5pt;">${data.plan.medicamentos}</div>`
                        : "";
                    const dx =
                      (data.diagnosticos || [])[0]?.descripcion ||
                      data.diagnosticoPrincipal ||
                      "--";
                    bodyHtml = `<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:10px 12px;margin-bottom:12px;"><p class="sec-title" style="color:#065f46;">&#128138; Prescripción Médica</p>${medsHtml}${planMeds}<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;border-top:1px solid #a7f3d0;padding-top:8px;"><p style="font-size:8.5pt;"><b>Diagnóstico:</b> ${dx}</p><p style="font-size:8.5pt;"><b>Control en:</b> ${
                      data.plan?.controlEn || "--"
                    }</p></div></div>${sigBlock}`;
                  } else if (sectionId === "gn-examenes") {
                    accent = "#0d9488";
                    const dxs = (data.diagnosticos || [])
                      .map(
                        (d, i) =>
                          `<p class="block-avoid" style="font-size:8.5pt;margin:2px 0;"><b>${
                            d.cie10 || ""
                          }</b>${d.cie10 ? " - " : ""} ${d.descripcion || ""} ${
                            d.tipo
                              ? `<span style="color:#9ca3af;">(${d.tipo})</span>`
                              : ""
                          }</p>`
                      )
                      .join("");
                    const paracl = data.plan?.paraclinicosSolicitados
                      ? `<div class="block-avoid" style="margin-top:10px;"><p class="sec-title" style="color:#0d9488;">&#128300; Paraclínicos / Exámenes Solicitados</p><p style="font-size:8.5pt;white-space:pre-wrap;line-height:1.5;">${data.plan.paraclinicosSolicitados}</p></div>`
                      : "";
                    const remis = data.plan?.remisiones
                      ? `<div class="block-avoid" style="margin-top:10px;"><p class="sec-title" style="color:#0d9488;">&#128279; Remisiones / Interconsultas</p><p style="font-size:8.5pt;white-space:pre-wrap;">${data.plan.remisiones}</p></div>`
                      : "";
                    const recos = data.plan?.recomendaciones
                      ? `<div class="block-avoid" style="margin-top:10px;"><p class="sec-title" style="color:#0d9488;">&#9989; Recomendaciones</p><p style="font-size:8.5pt;white-space:pre-wrap;line-height:1.6;">${data.plan.recomendaciones}</p></div>`
                      : "";
                    const conducta = data.plan?.conducta
                      ? `<div class="block-avoid" style="margin-top:10px;"><p class="sec-title" style="color:#0d9488;">&#128203; Conducta Médica</p><p style="font-size:8.5pt;white-space:pre-wrap;">${data.plan.conducta}</p></div>`
                      : "";
                    bodyHtml = '<div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:4px;padding:10px 12px;margin-bottom:12px;">'
                      + (dxs ? '<div style="margin-bottom:8px;"><p class="sec-title" style="color:#0d9488;">&#128203; Diagnósticos</p>' + dxs + '</div>' : "")
                      + conducta + remis + '</div>'
                      + (recos ? '<div style="margin-top:8px;">' + recos + '</div>' : "")
                      + (paracl ? '<div style="page-break-before:always;"><p style="font-size:7pt;color:#bbb;margin-bottom:8px;">— Hoja de Paraclínicos y Exámenes Solicitados —</p>' + paracl + '</div>' : "")
                      + sigBlock;
                  } else if (sectionId === "gn-derivaciones") {
                    accent = "#7c3aed";
                    const derivList = data.derivaciones || [];
                    const derivHtml =
                      derivList.length > 0
                        ? derivList
                            .map(
                              (d, i) =>
                                `<div style="margin-bottom:8px;border:1px solid #ddd6fe;border-radius:6px;padding:8px 10px;background:${
                                  i % 2 === 0 ? "#faf5ff" : "white"
                                };"><p style="font-weight:900;font-size:9.5pt;margin:0 0 2px;">${_sanitize(
                                  d.especialidad || "--"
                                )} <span style="font-size:8pt;color:#888;font-weight:400;">(${_sanitize(
                                  d.urgencia || "Electiva"
                                )})</span></p><p style="font-size:8pt;color:#444;margin:1px 0;"><b>Motivo:</b> ${_sanitize(
                                  d.motivo || "--"
                                )}</p>${
                                  d.observaciones
                                    ? `<p style="font-size:7.5pt;color:#666;margin-top:2px;font-style:italic;">${_sanitize(
                                        d.observaciones
                                      )}</p>`
                                    : ""
                                }</div>`
                            )
                            .join("")
                        : '<p style="color:#888;font-style:italic;font-size:8.5pt;">Sin derivaciones registradas.</p>';
                    bodyHtml = `<div style="background:#faf5ff;border:1px solid #ddd6fe;border-radius:4px;padding:10px 12px;margin-bottom:12px;">${derivHtml}</div>`;
                  } else if (sectionId === "gn-incapacidad") {
                    accent = "#dc2626";
                    bodyHtml = `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:4px;padding:12px;margin-bottom:12px;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;"><div style="font-size:8.5pt;"><p><b>Paciente:</b> ${
                      data.nombres || "--"
                    }</p><p><b>CC:</b> ${
                      data.docNumero || "--"
                    }</p><p><b>Edad:</b> ${
                      data.edad || "--"
                    } años</p><p><b>EPS:</b> ${
                      data.eps || "--"
                    }</p></div><div style="text-align:center;background:#fee2e2;border-radius:4px;padding:8px;"><p style="font-size:8pt;font-weight:900;color:#dc2626;text-transform:uppercase;margin:0 0 4px 0;">Días de Incapacidad</p><p style="font-size:28pt;font-weight:900;color:#dc2626;line-height:1;margin:0;">${
                      data.incapacidad?.dias || 0
                    }</p><p style="font-size:8pt;color:#dc2626;font-weight:700;">${numeroALetras(
                      data.incapacidad?.dias || 0
                    )} DÍAS</p></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:8.5pt;"><p><b>Origen:</b> ${
                      data.incapacidad?.origen || "--"
                    }</p><p><b>Fecha inicio:</b> ${
                      data.incapacidad?.desde || "--"
                    }</p><p><b>Fecha fin:</b> ${
                      data.incapacidad?.hasta || "--"
                    }</p><p><b>Diagnóstico:</b> ${
                      data.incapacidad?.diagnostico || "--"
                    }</p></div></div>${sigBlock}`;
                  }
                  w.document
                    .write(`<!DOCTYPE html><html lang="es"><head><title>${_sanitize(
                    titleDoc
                  )}</title><meta charset="UTF-8"/><style>
${baseStyle}
.print-toolbar{position:fixed;top:0;left:0;right:0;background:#1e3a5f;color:white;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.25);}
.print-toolbar .ptitle{flex:1;font-size:9.5pt;font-weight:700;}
.print-toolbar button{background:white;color:#1e3a5f;border:none;padding:6px 14px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;}
.print-toolbar button.btn-print{background:#10b981;color:white;}
.print-toolbar button.btn-close{background:#ef4444;color:white;}
.print-toolbar .hint{font-size:7.5pt;color:#93c5fd;}
[contenteditable]{outline:1.5px dashed #93c5fd;border-radius:3px;padding:1px 3px;cursor:text;}
[contenteditable]:focus{outline:2px solid #3b82f6;background:#eff6ff;}
body{padding-top:52px;}
@media print{.print-toolbar{display:none!important;}[contenteditable]{outline:none!important;background:transparent!important;}}
</style></head><body>
<div class="print-toolbar">
  <span class="ptitle">✏️ ${_sanitize(titleDoc)}</span>
  <span class="hint">Haz clic en cualquier texto para editar</span>
  <button class="btn-print" onclick="window.print()">🖨️ Imprimir ahora</button>
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
</div>
<div contenteditable="false">${buildGnHeader(
                    titleDoc,
                    accent
                  )}</div><div contenteditable="true" spellcheck="false">${bodyHtml}</div></body></html>`);
                  w.document.close();
                  w.focus();
                  // No auto-print - usuario edita y hace clic en Imprimir
                };
                // ── Impresión individual de receta (HC General) ──
                const openSingleMedWindow = (med, mIdx) => {
                  const w = window.open("", "_blank", "width=600,height=700");
                  if (!w) return;
                  const accent = "#059669";
                  const hdr = buildGnHeader("Receta Médica", accent);
                  const docSig = _billDocSig || null;
                  const singleHtml = `
                  <div class="med-card" style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;">
                    <span class="med-num">${mIdx + 1}</span>
                    <div style="flex:1;">
                      <p style="font-size:12pt;font-weight:900;color:#065f46;margin:0 0 4px 0;">${_sanitize(
                        med.nombre || ""
                      )} <span style="font-size:9pt;font-weight:400;color:#555;">(${_sanitize(
                    med.presentacion || ""
                  )})</span></p>
                      <p style="font-size:9.5pt;color:#374151;margin:2px 0;"><b>Dosis:</b> ${_sanitize(
                        med.dosis || "--"
                      )} &nbsp;·&nbsp; <b>Frecuencia:</b> ${_sanitize(
                    med.frecuencia || "--"
                  )} &nbsp;·&nbsp; <b>Duración:</b> ${_sanitize(
                    med.duracion || "--"
                  )}</p>
                      ${
                        med.indicaciones
                          ? `<p style="font-size:9pt;color:#92400e;font-style:italic;margin:4px 0;">⚠ ${_sanitize(
                              med.indicaciones
                            )}</p>`
                          : ""
                      }
                    </div>
                  </div>
                  <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;padding:8px 12px;margin-top:8px;">
                    <p style="font-size:8.5pt;"><b>Diagnóstico:</b> ${_sanitize(
                      (data.diagnosticos || [])[0]?.descripcion || "--"
                    )}</p>
                    <p style="font-size:8.5pt;"><b>Control en:</b> ${_sanitize(
                      data.plan?.controlEn || "--"
                    )}</p>
                    <p style="font-size:8.5pt;"><b>Motivo:</b> ${_sanitize(
                      data.motivoConsulta || "--"
                    )}</p>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:16mm;">
                    <div style="text-align:center;width:42%;">
                      <div style="border-top:2px solid #222;padding-top:4px;font-size:7.5pt;font-weight:700;">Firma del Paciente / Responsable</div>
                      <p style="font-size:7.5pt;color:#6b7280;margin:2px 0;">Nombre: _______________________</p>
                    </div>
                    <div style="text-align:center;width:42%;">
                      ${
                        docSig
                          ? `<img src="${docSig}" style="max-height:50px;max-width:130px;object-fit:contain;display:block;margin:0 auto 4px;"/>`
                          : '<div style="height:50px;"></div>'
                      }
                      <div style="border-top:2px solid #222;padding-top:4px;">
                        <p style="font-size:8.5pt;font-weight:900;margin:2px 0;">${_sanitize(
                          _billDocData?.nombre || ""
                        )}</p>
                        <p style="font-size:7.5pt;color:#555;margin:1px 0;">${_sanitize(
                          _billDocData?.titulo || ""
                        )}</p>
                        <p style="font-size:7.5pt;color:#555;margin:1px 0;">Lic: ${_sanitize(
                          _billDocData?.licencia || ""
                        )}</p>
                      </div>
                    </div>
                  </div>`;
                  w.document
                    .write(`<!DOCTYPE html><html lang="es"><head><title>Receta - ${_sanitize(
                    med.nombre
                  )}</title><meta charset="UTF-8"/><style>
${baseStyle}
.print-toolbar{position:fixed;top:0;left:0;right:0;background:#065f46;color:white;padding:8px 14px;display:flex;align-items:center;gap:10px;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.25);}
.print-toolbar .ptitle{flex:1;font-size:9.5pt;font-weight:700;}
.print-toolbar button{border:none;padding:6px 14px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;}
.print-toolbar button.btn-print{background:#10b981;color:white;}
.print-toolbar button.btn-close{background:#ef4444;color:white;}
.print-toolbar .hint{font-size:7.5pt;color:#6ee7b7;}
[contenteditable]{outline:1.5px dashed #6ee7b7;border-radius:3px;padding:1px 3px;cursor:text;}
[contenteditable]:focus{outline:2px solid #10b981;background:#ecfdf5;}
body{padding-top:52px;}
@media print{.print-toolbar{display:none!important;}[contenteditable]{outline:none!important;background:transparent!important;}}
</style></head><body>
<div class="print-toolbar">
  <span class="ptitle">💊 Receta - ${_sanitize(med.nombre)}</span>
  <span class="hint">Edita antes de imprimir</span>
  <button class="btn-print" onclick="window.print()">🖨️ Imprimir receta</button>
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
</div>
<div contenteditable="false">${hdr}</div>
<div contenteditable="true" spellcheck="false">${singleHtml}</div>
</body></html>`);
                  w.document.close();
                  w.focus();
                };
                return (
                  <div className="space-y-4">
                    {/* ── ENTRADA INTERACTIVA: FÓRMULA Y DERIVACIONES (mismo componente HC Ocup) ── */}
                    <div className="no-print">
                      <TabFormulaDerivacion
                        data={data}
                        setData={setData}
                        _billDocData={_billDocData}
                        _billDocSig={_billDocSig}
                        onPrint={handlePrint}
                      />
                    </div>
                    {/* ══ BARRA SELECCIÓN DE SECCIONES ══ */}
                    <div
                      className="no-print bg-white border border-blue-100 rounded-2xl shadow-sm p-4 mx-auto"
                      style={{ maxWidth: "21.59cm" }}
                    >
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-3 flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5 text-blue-500" />{" "}
                        Documentos - Haga clic para ver y luego imprimir
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            const el =
                              document.getElementById("gn-prescripcion");
                            if (el)
                              el.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                        >
                          💊 Prescripción Médica
                        </button>
                        <button
                          onClick={() => {
                            const el = document.getElementById("gn-examenes");
                            if (el)
                              el.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition"
                        >
                          🔬 Exámenes y Recomendaciones
                        </button>
                        <button
                          onClick={() => {
                            const el =
                              document.getElementById("gn-derivaciones");
                            if (el)
                              el.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                        >
                          🔀 Derivaciones / Interconsultas
                        </button>
                        {data.incapacidad?.aplica && (
                          <button
                            onClick={() => {
                              const el =
                                document.getElementById("gn-incapacidad");
                              if (el)
                                el.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition"
                          >
                            🏥 Incapacidad
                          </button>
                        )}
                        <div className="ml-auto flex gap-2">
                          <button
                            onClick={() =>
                              printSection(
                                "gn-prescripcion",
                                "Prescripción Médica"
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          >
                            <Printer className="w-3 h-3" /> Presc.
                          </button>
                          <button
                            onClick={() =>
                              printSection(
                                "gn-examenes",
                                "Exámenes y Recomendaciones"
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition"
                          >
                            <Printer className="w-3 h-3" /> Exám.
                          </button>
                          <button
                            onClick={() =>
                              printSection(
                                "gn-derivaciones",
                                "Derivaciones / Interconsultas"
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition"
                          >
                            <Printer className="w-3 h-3" /> Deriv.
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-700 text-white hover:bg-slate-800 transition"
                          >
                            <Printer className="w-3 h-3" /> Todo
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* ══ SECCIÓN: PRESCRIPCIÓN ══ */}
                    <div
                      id="gn-prescripcion"
                      className="bg-white mx-auto shadow-xl print:shadow-none carta-visual"
                      style={{
                        width: "21.59cm",
                        padding: "1.2cm",
                        boxSizing: "border-box",
                      }}
                    >
                      <div className="flex justify-between items-center border-b-2 border-blue-500 pb-3 mb-4 print:border-black">
                        <div className="w-1/3">
                          <BrandLogo data={_billDocData} />
                        </div>
                        <div className="w-1/3 text-center">
                          <h2 className="text-sm font-black uppercase text-gray-800">
                            Prescripción Médica
                          </h2>
                          <p className="text-[9px] text-gray-500">
                            Fórmula Médica -- Res. 1995/1999
                          </p>
                        </div>
                        <div className="w-1/3 text-right text-[9px] text-gray-500">
                          <p className="font-bold">{data.nombres}</p>
                          <p>
                            CC: {data.docNumero} · {data.edad} años
                          </p>
                          <p>{data.fechaConsulta}</p>
                        </div>
                      </div>
                      {/* ── Datos del paciente horizontal ── */}
                      <div className="grid grid-cols-5 gap-1 mb-4 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 print:bg-transparent print:border print:border-gray-400">
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            Paciente
                          </p>
                          <p className="text-[10px] font-black text-gray-900">
                            {data.nombres || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            Documento
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.docTipo || "CC"}: {data.docNumero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            Edad / Género
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.edad || "--"} años · {data.genero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            EPS
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.eps || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-emerald-600 uppercase">
                            Dx Principal
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {(data.diagnosticos || [])[0]?.cie10 || "--"}{" "}
                            {(data.diagnosticos || [])[0]?.descripcion || ""}
                          </p>
                        </div>
                      </div>
                      {(data.formulaMedicamentos || []).length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {(data.formulaMedicamentos || []).map((med, idx) => (
                            <div
                              key={idx}
                              className="flex gap-3 border border-gray-200 rounded-lg p-2 print-break-avoid print:border-gray-300"
                            >
                              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs flex-shrink-0">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <p className="font-black text-sm text-gray-900">
                                  {med.nombre}{" "}
                                  <span className="font-normal text-gray-500 text-xs">
                                    {med.presentacion}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-700">
                                  <b>Dosis:</b> {med.dosis} · <b>Cada:</b>{" "}
                                  {med.frecuencia} · <b>Por:</b> {med.duracion}
                                </p>
                                {med.indicaciones && (
                                  <p className="text-[10px] italic text-amber-700">
                                    ⚠ {med.indicaciones}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => openSingleMedWindow(med, idx)}
                                title="Imprimir esta receta individual"
                                className="no-print flex items-center gap-0.5 bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-lg px-2 py-1 text-[10px] font-bold transition self-start shrink-0"
                              >
                                <Printer className="w-3 h-3" /> Receta
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : data.plan?.medicamentos ? (
                        <div className="mb-4">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-200 mb-2 text-gray-600">
                            Prescripción
                          </h4>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">
                            {data.plan.medicamentos}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic py-4 text-center">
                          Sin medicamentos prescritos.
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                        <p>
                          <b>Diagnóstico:</b>{" "}
                          {(data.diagnosticos || [])[0]?.descripcion ||
                            data.diagnosticoPrincipal ||
                            "--"}
                        </p>
                        <p>
                          <b>Control en:</b>{" "}
                          {data.plan?.controlEn ||
                            data.frecuenciaSeguimiento ||
                            "--"}
                        </p>
                      </div>
                      <div className="hidden print:flex mt-8 justify-between items-end signature-block">
                        <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
                          <p className="text-[10px] font-bold">
                            Firma Paciente / Responsable
                          </p>
                        </div>
                        <div className="text-center w-2/5">
                          <DoctorSignature
                            signature={_billDocSig}
                            data={_billDocData}
                            showData={true}
                          />
                        </div>
                      </div>
                    </div>
                    {/* ══ SECCIÓN: EXÁMENES Y RECOMENDACIONES ══ */}
                    <div
                      id="gn-examenes"
                      className="bg-white mx-auto shadow-xl print:shadow-none carta-visual print-page-break"
                      style={{
                        width: "21.59cm",
                        padding: "1.2cm",
                        boxSizing: "border-box",
                      }}
                    >
                      <div className="flex justify-between items-center border-b-2 border-teal-500 pb-3 mb-4 print:border-black">
                        <div className="w-1/3">
                          <BrandLogo data={_billDocData} />
                        </div>
                        <div className="w-1/3 text-center">
                          <h2 className="text-sm font-black uppercase text-gray-800">
                            Exámenes y Recomendaciones
                          </h2>
                          <p className="text-[9px] text-gray-500">
                            Orden Médica -- Res. 1995/1999
                          </p>
                        </div>
                        <div className="w-1/3 text-right text-[9px] text-gray-500">
                          <p className="font-bold">{data.nombres}</p>
                          <p>CC: {data.docNumero}</p>
                          <p>{data.fechaConsulta}</p>
                        </div>
                      </div>
                      {/* ── Datos del paciente horizontal ── */}
                      <div className="grid grid-cols-5 gap-1 mb-4 bg-teal-50 border border-teal-100 rounded-xl px-4 py-2.5 print:bg-transparent print:border print:border-gray-400">
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            Paciente
                          </p>
                          <p className="text-[10px] font-black text-gray-900">
                            {data.nombres || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            Documento
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.docTipo || "CC"}: {data.docNumero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            Edad / Género
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.edad || "--"} años · {data.genero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            EPS
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.eps || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-teal-600 uppercase">
                            Motivo de Consulta
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800 truncate">
                            {data.motivoConsulta || "--"}
                          </p>
                        </div>
                      </div>
                      {data.diagnosticos?.length > 0 && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Diagnósticos
                          </h4>
                          {data.diagnosticos.map((d, i) => (
                            <p key={i} className="text-xs mb-1">
                              <b>{d.cie10}</b> -- {d.descripcion}{" "}
                              <span className="text-gray-400">({d.tipo})</span>
                            </p>
                          ))}
                        </div>
                      )}
                      {data.plan?.paraclinicosSolicitados && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Paraclínicos / Exámenes Solicitados
                          </h4>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">
                            {data.plan.paraclinicosSolicitados}
                          </p>
                        </div>
                      )}
                      {data.plan?.remisiones && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Remisiones / Interconsultas
                          </h4>
                          <p className="text-xs whitespace-pre-wrap">
                            {data.plan.remisiones}
                          </p>
                        </div>
                      )}
                      {data.plan?.recomendaciones && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Recomendaciones al Paciente
                          </h4>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">
                            {data.plan.recomendaciones}
                          </p>
                        </div>
                      )}
                      {data.plan?.conducta && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                            Conducta Médica
                          </h4>
                          <p className="text-xs whitespace-pre-wrap">
                            {data.plan.conducta}
                          </p>
                        </div>
                      )}
                      <div className="hidden print:flex mt-8 justify-between items-end signature-block">
                        <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
                          <p className="text-[10px] font-bold">
                            Firma Paciente / Responsable
                          </p>
                        </div>
                        <div className="text-center w-2/5">
                          <DoctorSignature
                            signature={_billDocSig}
                            data={_billDocData}
                            showData={true}
                          />
                        </div>
                      </div>
                    </div>
                    {/* ══ SECCIÓN: DERIVACIONES / INTERCONSULTAS ══ */}
                    <div
                      id="gn-derivaciones"
                      className="bg-white mx-auto shadow-xl print:shadow-none carta-visual print-page-break"
                      style={{
                        width: "21.59cm",
                        padding: "1.2cm",
                        boxSizing: "border-box",
                      }}
                    >
                      <div className="flex justify-between items-center border-b-2 border-purple-500 pb-3 mb-4 print:border-black">
                        <div className="w-1/3">
                          <BrandLogo data={_billDocData} />
                        </div>
                        <div className="w-1/3 text-center">
                          <h2 className="text-sm font-black uppercase text-gray-800">
                            Derivaciones / Interconsultas
                          </h2>
                          <p className="text-[9px] text-gray-500">
                            Orden Médica - Res. 1995/1999
                          </p>
                        </div>
                        <div className="w-1/3 text-right text-[9px] text-gray-500">
                          <p className="font-bold">{data.fechaConsulta}</p>
                        </div>
                      </div>
                      {/* Datos paciente horizontal */}
                      <div className="grid grid-cols-5 gap-1 mb-4 bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5 print:bg-transparent print:border print:border-gray-400">
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            Paciente
                          </p>
                          <p className="text-[10px] font-black text-gray-900">
                            {data.nombres || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            Documento
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.docTipo || "CC"}: {data.docNumero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            Edad / Género
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.edad || "--"} años · {data.genero || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            EPS
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.eps || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-purple-600 uppercase">
                            Fecha
                          </p>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {data.fechaConsulta || "--"}
                          </p>
                        </div>
                      </div>
                      {/* Diagnóstico de referencia */}
                      {(data.diagnosticos || []).length > 0 && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-purple-200 mb-2 text-purple-700">
                            Diagnóstico de Referencia
                          </h4>
                          {data.diagnosticos.map((d, i) => (
                            <p key={i} className="text-xs mb-1">
                              <b>{d.cie10}</b> - {d.descripcion}{" "}
                              <span className="text-gray-400">({d.tipo})</span>
                            </p>
                          ))}
                        </div>
                      )}
                      {/* Lista de derivaciones */}
                      {(data.derivaciones || []).length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {(data.derivaciones || []).map((der, idx) => (
                            <div
                              key={idx}
                              className="border border-purple-200 rounded-lg p-3 print-break-avoid print:border-gray-300 bg-purple-50/40 print:bg-transparent"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-black text-xs flex-shrink-0">
                                      {idx + 1}
                                    </span>
                                    <p className="font-black text-sm text-gray-900">
                                      {der.especialidad || "--"}
                                    </p>
                                    <span
                                      className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                                        der.urgencia === "Urgente"
                                          ? "bg-red-100 text-red-700"
                                          : der.urgencia === "Prioritaria"
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {der.urgencia || "Electiva"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-700 ml-8">
                                    <b>Motivo:</b> {der.motivo || "--"}
                                  </p>
                                  {der.observaciones && (
                                    <p className="text-[10px] italic text-purple-700 ml-8 mt-0.5">
                                      📝 {der.observaciones}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-print py-6 text-center text-xs text-gray-400 italic border border-dashed border-purple-200 rounded-xl">
                          Sin derivaciones registradas. Use el formulario de
                          arriba para agregar.
                        </div>
                      )}
                      {/* Plan de conducta si aplica */}
                      {data.plan?.conducta && (
                        <div className="mb-3 print-break-avoid">
                          <h4 className="font-bold text-xs uppercase border-b border-purple-200 mb-2 text-purple-700">
                            Plan de Conducta
                          </h4>
                          <p className="text-xs whitespace-pre-wrap leading-relaxed">
                            {data.plan.conducta}
                          </p>
                        </div>
                      )}
                      {/* Firma */}
                      <div className="hidden print:flex mt-8 justify-between items-end signature-block">
                        <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
                          <p className="text-[10px] font-bold">
                            Firma Paciente / Responsable
                          </p>
                        </div>
                        <div className="text-center w-2/5">
                          <DoctorSignature
                            signature={_billDocSig}
                            data={_billDocData}
                            showData={true}
                          />
                        </div>
                      </div>
                    </div>
                    {/* ══ SECCIÓN: INCAPACIDAD ══ */}
                    {data.incapacidad?.aplica && (
                      <div
                        id="gn-incapacidad"
                        className="bg-white mx-auto shadow-xl print:shadow-none carta-visual print-page-break"
                        style={{
                          width: "21.59cm",
                          padding: "1.2cm",
                          boxSizing: "border-box",
                        }}
                      >
                        <div className="flex justify-between items-center border-b-2 border-red-500 pb-3 mb-4 print:border-black">
                          <div className="w-1/3">
                            <BrandLogo data={_billDocData} />
                          </div>
                          <div className="w-1/3 text-center">
                            <h2 className="text-sm font-black uppercase text-gray-800">
                              Certificado de Incapacidad Médica
                            </h2>
                            <p className="text-[9px] text-gray-500">
                              Formulario -- Res. 1995/1999
                            </p>
                          </div>
                          <div className="w-1/3 text-right text-[9px] text-gray-500">
                            <p className="font-bold">{data.fechaConsulta}</p>
                            <p className="text-[8px]">Res. 1995/1999</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                          <div className="bg-gray-50 p-3 rounded-lg print:bg-transparent print:border print:border-gray-300">
                            <p>
                              <b>Paciente:</b> {data.nombres}
                            </p>
                            <p>
                              <b>CC:</b> {data.docNumero}
                            </p>
                            <p>
                              <b>Edad:</b> {data.edad} años
                            </p>
                            <p>
                              <b>EPS:</b> {data.eps}
                            </p>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg text-center print:bg-transparent print:border print:border-gray-300">
                            <p className="text-[10px] font-bold text-red-700 uppercase">
                              Días de Incapacidad
                            </p>
                            <p className="text-5xl font-black text-red-900">
                              {data.incapacidad?.dias || 0}
                            </p>
                            <p className="text-[10px] text-red-700 font-bold">
                              {numeroALetras(data.incapacidad?.dias || 0)} DÍAS
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4 text-xs print-break-avoid">
                          <p>
                            <b>Origen:</b>{" "}
                            {data.incapacidad?.origen || "Enfermedad General"}
                          </p>
                          <p>
                            <b>Fecha inicio:</b>{" "}
                            {data.incapacidad?.desde || "--"}
                          </p>
                          <p>
                            <b>Fecha fin:</b> {data.incapacidad?.hasta || "--"}
                          </p>
                          <p>
                            <b>Diagnóstico:</b>{" "}
                            {data.incapacidad?.diagnostico ||
                              data.diagnosticoPrincipal ||
                              "--"}
                          </p>
                        </div>
                        {data.plan?.medicamentos && (
                          <div className="mb-3">
                            <h4 className="font-bold text-xs uppercase border-b border-gray-300 mb-2 text-gray-600">
                              Tratamiento
                            </h4>
                            <p className="text-xs whitespace-pre-wrap">
                              {data.plan.medicamentos}
                            </p>
                          </div>
                        )}
                        <div className="hidden print:flex mt-8 justify-between items-end signature-block">
                          <div className="text-center w-2/5 pt-8 border-t-2 border-gray-800">
                            <p className="text-[10px] font-bold">
                              Firma Paciente / Responsable
                            </p>
                          </div>
                          <div className="text-center w-2/5">
                            <DoctorSignature
                              signature={_billDocSig}
                              data={_billDocData}
                              showData={true}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
          </main>
        </div>
      );
    }
    return <LoginPage />;
  };
  // ─── RETURN PRINCIPAL ─────────────────────────────────────────────────────
  return (
    <AppProvider value={appContext}>
    <>
      <PrintStyles />
      <SecurityHeaders />
      {showPortalPublico ? (
        <PortalPublicoTrabajador
          sbUrl={_SB_URL}
          sbKey={_SB_KEY}
          onVolver={currentUser ? () => setShowPortalPublico(false) : null}
        />
      ) : (
        renderCurrentView()
      )}
      <MensajesOverlay />
      {showNotifModal && (
        <NotificacionModal
          data={notifData}
          onCerrar={() => setShowNotifModal(false)}
        />
      )}
      {/* Modal Alert */}
      {/* Modal RIPS - muestra JSON para copiar/descargar - sin bloquear sandbox */}
      {ripsModalData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[300] p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
            style={{ maxHeight: "88vh" }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-orange-200 bg-orange-50 rounded-t-2xl">
              <div>
                <p className="font-black text-orange-800 text-sm flex items-center gap-2">
                  <FileCheck className="w-4 h-4" /> RIPS JSON - Res. 2275/2023
                </p>
                <p className="text-[10px] text-orange-600 mt-0.5">
                  {ripsModalData.filename}
                </p>
              </div>
              <button
                onClick={() => setRipsModalData(null)}
                className="text-gray-400 hover:text-gray-700 text-xl font-black"
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
              <p className="text-[11px] text-amber-800 font-bold">
                ⚠️ Para radicar ante MinSalud se requiere firma digital DIAN
                certificada (Certicámara/GSE).
              </p>
              <p className="text-[10px] text-amber-600 mt-0.5">
                Copie el JSON o descárguelo. Este archivo cumple la estructura
                Res. 2275/2023.
              </p>
            </div>
            <textarea
              readOnly
              value={ripsModalData.json}
              className="flex-1 font-mono text-[10px] p-4 bg-gray-900 text-green-300 resize-none outline-none"
              style={{ minHeight: "300px" }}
            />
            <div className="flex gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(ripsModalData.json)
                    .then(() => showAlert("✅ JSON copiado al portapapeles"))
                    .catch(() =>
                      showAlert("Use Ctrl+A / Ctrl+C en el área de texto")
                    );
                }}
                className="flex-1 bg-orange-600 text-white font-bold text-xs py-2 rounded-xl hover:bg-orange-700 flex items-center justify-center gap-1"
              >
                📋 Copiar JSON
              </button>
              <button
                onClick={() => {
                  try {
                    const b64 = btoa(
                      unescape(encodeURIComponent(ripsModalData.json))
                    );
                    const a = document.createElement("a");
                    a.href = "data:application/json;base64," + b64;
                    a.download = ripsModalData.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } catch (e) {
                    showAlert(
                      "Use el botón Copiar y guarde en un archivo .json"
                    );
                  }
                }}
                className="flex-1 bg-gray-700 text-white font-bold text-xs py-2 rounded-xl hover:bg-gray-800 flex items-center justify-center gap-1"
              >
                ⬇️ Descargar .json
              </button>
              <button
                onClick={() => setRipsModalData(null)}
                className="px-4 bg-gray-100 text-gray-600 font-bold text-xs py-2 rounded-xl hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Backup - mismo patrón que RIPS */}
      {backupModalData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[300] p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
            style={{ maxHeight: "88vh" }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-200 bg-emerald-50 rounded-t-2xl">
              <div>
                <p className="font-black text-emerald-800 text-sm flex items-center gap-2">
                  <HardDrive className="w-4 h-4" /> Backup Completo SISO
                </p>
                <p className="text-[10px] text-emerald-600 mt-0.5">
                  {backupModalData.filename}
                </p>
                {backupModalData.summary && (
                  <p className="text-[9px] text-emerald-500 mt-0.5">
                    📦 {backupModalData.summary}
                  </p>
                )}
              </div>
              <button
                onClick={() => setBackupModalData(null)}
                className="text-gray-400 hover:text-gray-700 text-xl font-black"
              >
                ✕
              </button>
            </div>
            <textarea
              readOnly
              value={backupModalData.json}
              className="flex-1 font-mono text-[10px] p-4 bg-gray-900 text-green-300 resize-none outline-none"
              style={{ minHeight: "300px" }}
            />
            <div className="flex gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  navigator.clipboard
                    ?.writeText(backupModalData.json)
                    .then(() => showAlert("✅ Backup copiado al portapapeles"))
                    .catch(() =>
                      showAlert("Use Ctrl+A / Ctrl+C en el área de texto")
                    );
                }}
                className="flex-1 bg-emerald-600 text-white font-bold text-xs py-2 rounded-xl hover:bg-emerald-700"
              >
                📋 Copiar JSON
              </button>
              <button
                onClick={() => {
                  try {
                    const b64 = btoa(
                      unescape(encodeURIComponent(backupModalData.json))
                    );
                    const a = document.createElement("a");
                    a.href = "data:application/json;base64," + b64;
                    a.download = backupModalData.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } catch (e) {
                    showAlert(
                      "Use el botón Copiar y guarde en un archivo .json"
                    );
                  }
                }}
                className="flex-1 bg-gray-700 text-white font-bold text-xs py-2 rounded-xl hover:bg-gray-800"
              >
                ⬇️ Descargar .json
              </button>
              <button
                onClick={() => setBackupModalData(null)}
                className="px-4 bg-gray-100 text-gray-600 font-bold text-xs py-2 rounded-xl hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal Imprimir Todo (Checklist de documentos) ───────────── */}
      {showTodoChecklist && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[210] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white">
              <h3 className="text-lg font-black">📄 Imprimir Documentos</h3>
              <p className="text-emerald-100 text-xs mt-0.5">Seleccione los documentos a imprimir para: <span className="font-bold text-white">{data.nombres || "Paciente"}</span></p>
            </div>
            <div className="p-5 space-y-3">
              {[
                { key: "hcCompleta", label: "📋 Historia Clínica Completa", desc: "HC con todos los hallazgos y concepto" },
                { key: "certificado", label: "📜 Certificado de Aptitud", desc: "Certificado médico ocupacional" },
                { key: "formula", label: "💊 Fórmula Médica", desc: "Prescripción de medicamentos" },
                { key: "incapacidad", label: "🏥 Incapacidad", desc: "Certificado de incapacidad médica" },
                { key: "derivaciones", label: "🔬 Derivaciones / Interconsultas", desc: "Remisiones a especialistas" },
                { key: "examenes", label: "🧪 Solicitud de Exámenes", desc: "Exámenes paraclínicos solicitados" },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-emerald-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={todoSelection[key] || false}
                    onChange={(e) => setTodoSelection((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="mt-0.5 w-5 h-5 rounded accent-emerald-600"
                  />
                  <div>
                    <p className="font-bold text-sm text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => setShowTodoChecklist(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const sel = todoSelection;
                  const doc = activeDoctorData || {};
                  const sig = activeSignature || "";
                  const _miIPS = currentUser?.empresaId ? companies.find(c => c.id === currentUser.empresaId) : null;
                  const ipsName = _miIPS?.nombre || doc.nombre || "OcupaSalud";
                  const _e = (v) => String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                  const _nl2br = (v) => _e(v).replace(/\n/g, "<br/>");
                  const sigHtml = sig ? '<img src="' + sig + '" style="max-height:60px;display:block;margin:0 auto 4px;" alt="Firma"/>' : '<div style="height:55px;"></div>';
                  const headerHTML = '<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #065f46;padding-bottom:10px;margin-bottom:12px;">'
                    + '<div><div style="font-size:12pt;font-weight:900;color:#065f46;">' + _e(ipsName) + '</div>'
                    + '<p style="font-size:8pt;color:#555;">' + _e(doc.titulo || "Médico Especialista SST") + '</p>'
                    + '<p style="font-size:8pt;color:#555;">Lic: ' + _e(doc.licencia || "--") + ' · ' + _e(doc.ciudad || "") + '</p></div>'
                    + '<div style="text-align:right;"><div style="font-size:11pt;font-weight:900;color:#065f46;">OCUPASALUD</div>'
                    + '<p style="font-size:8pt;color:#555;">Paciente: ' + _e(data.nombres) + '</p>'
                    + '<p style="font-size:8pt;color:#555;">Doc: ' + _e((data.docTipo || "CC") + " " + (data.docNumero || "")) + '</p>'
                    + '<p style="font-size:8pt;color:#888;">Fecha: ' + _e(data.fechaExamen || new Date().toLocaleDateString("es-CO")) + '</p></div></div>';
                  const footerHTML = '<div style="margin-top:20px;text-align:center;border-top:2px solid #065f46;padding-top:10px;">'
                    + sigHtml
                    + '<p style="font-size:9pt;font-weight:900;color:#065f46;">' + _e(doc.nombre || "") + '</p>'
                    + '<p style="font-size:8pt;color:#555;">' + _e(doc.titulo || "") + ' · Lic. ' + _e(doc.licencia || "") + '</p>'
                    + '</div>';
                  const pages = [];
                  if (sel.hcCompleta) {
                    pages.push('<div>' + headerHTML + '<h2 style="color:#065f46;font-size:11pt;margin:10px 0;">HISTORIA CLÍNICA ' + _e(dataType === "ocupacional" ? "OCUPACIONAL" : "GENERAL") + '</h2>'
                      + '<table style="width:100%;border-collapse:collapse;font-size:9pt;">'
                      + '<tr><th style="background:#d1fae5;padding:4px 8px;border:1px solid #ccc;width:25%;">Cargo</th><td style="padding:4px 8px;border:1px solid #ccc;">' + _e(data.cargo) + '</td><th style="background:#d1fae5;padding:4px 8px;border:1px solid #ccc;width:25%;">Empresa</th><td style="padding:4px 8px;border:1px solid #ccc;">' + _e(data.empresaNombre) + '</td></tr>'
                      + '<tr><th style="background:#d1fae5;padding:4px 8px;border:1px solid #ccc;">Tipo Examen</th><td style="padding:4px 8px;border:1px solid #ccc;">' + _e(data.tipoExamen) + '</td><th style="background:#d1fae5;padding:4px 8px;border:1px solid #ccc;">Concepto</th><td style="padding:4px 8px;border:1px solid #ccc;">' + _e(data.conceptoAptitud) + '</td></tr>'
                      + '<tr><th style="background:#d1fae5;padding:4px 8px;border:1px solid #ccc;">Dx Principal</th><td style="padding:4px 8px;border:1px solid #ccc;" colspan="3">' + _e(data.diagnosticoPrincipal) + '</td></tr>'
                      + '</table>'
                      + (data.recomendaciones ? '<div style="margin-top:10px;"><b style="color:#065f46;">Recomendaciones:</b><p style="font-size:9pt;white-space:pre-wrap;">' + _nl2br(data.recomendaciones) + '</p></div>' : '')
                      + (data.analisisRestricciones ? '<div style="margin-top:10px;"><b style="color:#065f46;">Restricciones:</b><p style="font-size:9pt;white-space:pre-wrap;">' + _nl2br(data.analisisRestricciones) + '</p></div>' : '')
                      + footerHTML + '</div>');
                  }
                  if (sel.certificado) {
                    try {
                      const certHtml = _generarCertificadoHTMLNormalizado(data, doc, sig, _miIPS);
                      const bodyMatch = certHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
                      pages.push('<div>' + (bodyMatch ? bodyMatch[1] : certHtml) + '</div>');
                    } catch (_eCert) {
                      pages.push('<div>' + headerHTML + '<h2 style="color:#065f46;font-size:11pt;margin:10px 0;">CERTIFICADO DE APTITUD</h2><p style="font-size:9pt;">' + _e(data.conceptoAptitud || "No generado") + '</p>' + footerHTML + '</div>');
                    }
                  }
                  if (sel.formula && (data.formulaMedica || data.formulaMedicamentos?.length)) {
                    let formulaBody = '<h2 style="color:#065f46;font-size:11pt;margin:10px 0;">FÓRMULA MÉDICA</h2>';
                    if (data.formulaMedica) formulaBody += '<p style="font-size:9pt;white-space:pre-wrap;">' + _nl2br(data.formulaMedica) + '</p>';
                    if (data.formulaMedicamentos?.length) {
                      formulaBody += '<table style="width:100%;border-collapse:collapse;font-size:9pt;margin-top:8px;"><tr><th style="background:#1e293b;color:white;padding:4px 8px;border:1px solid #334155;">Medicamento</th><th style="background:#1e293b;color:white;padding:4px 8px;border:1px solid #334155;">Dosis</th><th style="background:#1e293b;color:white;padding:4px 8px;border:1px solid #334155;">Frecuencia</th><th style="background:#1e293b;color:white;padding:4px 8px;border:1px solid #334155;">Duración</th></tr>';
                      data.formulaMedicamentos.forEach(m => { formulaBody += '<tr><td style="padding:4px 8px;border:1px solid #e2e8f0;">' + _e(m.nombre) + '</td><td style="padding:4px 8px;border:1px solid #e2e8f0;">' + _e(m.dosis) + '</td><td style="padding:4px 8px;border:1px solid #e2e8f0;">' + _e(m.frecuencia) + '</td><td style="padding:4px 8px;border:1px solid #e2e8f0;">' + _e(m.duracion) + '</td></tr>'; });
                      formulaBody += '</table>';
                    }
                    pages.push('<div>' + headerHTML + formulaBody + footerHTML + '</div>');
                  }
                  if (sel.incapacidad && data.incapacidad?.dias) {
                    pages.push('<div>' + headerHTML + '<h2 style="color:#065f46;font-size:11pt;margin:10px 0;">CERTIFICADO DE INCAPACIDAD</h2>'
                      + '<table style="width:100%;border-collapse:collapse;font-size:9pt;">'
                      + '<tr><th style="background:#d1fae5;padding:4px 8px;border:1px solid #ccc;width:30%;">Días</th><td style="padding:4px 8px;border:1px solid #ccc;">' + _e(data.incapacidad.dias) + '</td></tr>'
                      + '<tr><th style="background:#d1fae5;padding:4px 8px;border:1px solid #ccc;">Motivo</th><td style="padding:4px 8px;border:1px solid #ccc;">' + _e(data.incapacidad.motivo) + '</td></tr>'
                      + '<tr><th style="background:#d1fae5;padding:4px 8px;border:1px solid #ccc;">Diagnóstico CIE</th><td style="padding:4px 8px;border:1px solid #ccc;">' + _e(data.incapacidad.diagnosticoCIE) + '</td></tr>'
                      + '</table>' + footerHTML + '</div>');
                  }
                  if (sel.derivaciones && data.derivaciones?.length) {
                    let derivBody = '<h2 style="color:#065f46;font-size:11pt;margin:10px 0;">DERIVACIONES / INTERCONSULTAS</h2>'
                      + '<table style="width:100%;border-collapse:collapse;font-size:9pt;"><tr><th style="background:#1e293b;color:white;padding:4px 8px;border:1px solid #334155;">#</th><th style="background:#1e293b;color:white;padding:4px 8px;border:1px solid #334155;">Especialidad</th><th style="background:#1e293b;color:white;padding:4px 8px;border:1px solid #334155;">Motivo</th><th style="background:#1e293b;color:white;padding:4px 8px;border:1px solid #334155;">Urgencia</th></tr>';
                    data.derivaciones.forEach((d, i) => { derivBody += '<tr><td style="padding:4px 8px;border:1px solid #e2e8f0;text-align:center;">' + (i+1) + '</td><td style="padding:4px 8px;border:1px solid #e2e8f0;">' + _e(d.especialidad) + '</td><td style="padding:4px 8px;border:1px solid #e2e8f0;">' + _e(d.motivo) + '</td><td style="padding:4px 8px;border:1px solid #e2e8f0;">' + _e(d.urgencia) + '</td></tr>'; });
                    derivBody += '</table>';
                    if (data.interconsultaResumen) derivBody += '<div style="margin-top:8px;"><b>Resumen clínico:</b><p style="font-size:9pt;">' + _nl2br(data.interconsultaResumen || "") + '</p></div>';
                    pages.push('<div>' + headerHTML + derivBody + footerHTML + '</div>');
                  }
                  if (sel.examenes && data.solicitudExamenes?.length) {
                    let examBody = '<h2 style="color:#065f46;font-size:11pt;margin:10px 0;">SOLICITUD DE EXÁMENES PARACLÍNICOS</h2>'
                      + '<table style="width:100%;border-collapse:collapse;font-size:9pt;"><tr><th style="background:#1e293b;color:white;padding:4px 8px;border:1px solid #334155;">#</th><th style="background:#1e293b;color:white;padding:4px 8px;border:1px solid #334155;">Examen</th><th style="background:#1e293b;color:white;padding:4px 8px;border:1px solid #334155;">Fecha</th><th style="background:#1e293b;color:white;padding:4px 8px;border:1px solid #334155;">Urgente</th></tr>';
                    data.solicitudExamenes.forEach((ex, i) => { examBody += '<tr><td style="padding:4px 8px;border:1px solid #e2e8f0;text-align:center;">' + (i+1) + '</td><td style="padding:4px 8px;border:1px solid #e2e8f0;">' + _e(ex.nombre) + '</td><td style="padding:4px 8px;border:1px solid #e2e8f0;">' + _e(ex.fecha || "") + '</td><td style="padding:4px 8px;border:1px solid #e2e8f0;">' + (ex.urgente ? "Sí" : "No") + '</td></tr>'; });
                    examBody += '</table>';
                    pages.push('<div>' + headerHTML + examBody + footerHTML + '</div>');
                  }
                  if (pages.length === 0) { showAlert("No hay documentos seleccionados o los documentos seleccionados no tienen datos."); return; }
                  const fullHTML = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Documentos - ' + _e(data.nombres) + '</title><style>'
                    + 'body{font-family:Arial,Helvetica,sans-serif;font-size:9pt;margin:20px;color:#111;}'
                    + 'table{width:100%;border-collapse:collapse;} th{text-align:left;}'
                    + '@page{size:letter portrait;margin:1.1cm 1.3cm;}'
                    + '@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important;} button,.np-bar{display:none!important;} body{margin:0;padding:0;}}'
                    + '.page-section{page-break-after:always;} .page-section:last-child{page-break-after:auto;}'
                    + '.np-bar{position:fixed;top:0;left:0;right:0;background:#065f46;color:#fff;padding:7px 14px;display:flex;align-items:center;gap:10px;z-index:9999;}'
                    + '.np-bar span{flex:1;font-size:9pt;font-weight:700;} .np-bar button{border:none;padding:5px 14px;border-radius:6px;font-weight:900;cursor:pointer;font-size:9pt;background:#10b981;color:#fff;}'
                    + 'body{padding-top:45px;} @media print{body{padding-top:0!important;}}'
                    + '</style></head><body>'
                    + '<div class="np-bar"><span>📄 Documentos de ' + _e(data.nombres) + ' (' + pages.length + ' sección' + (pages.length > 1 ? "es" : "") + ')</span>'
                    + '<button onclick="window.print()">🖨️ Imprimir / PDF</button>'
                    + '<button onclick="window.close()" style="background:#ef4444;">✕ Cerrar</button></div>'
                    + pages.map(p => '<div class="page-section">' + p + '</div>').join('')
                    + '</body></html>';
                  const w = window.open("", "_blank", "width=900,height=1100");
                  if (w) { w.document.write(fullHTML); w.document.close(); w.focus(); }
                  else { showAlert("El navegador bloqueó la ventana emergente. Permita los popups."); }
                  setShowTodoChecklist(false);
                }}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-sm"
              >
                🖨️ Imprimir Selección
              </button>
            </div>
          </div>
        </div>
      )}
      {alertMsg && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in">
            <AlertCircle className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <p className="text-gray-800 font-bold mb-5 whitespace-pre-wrap text-sm">
              {alertMsg}
            </p>
            <button
              onClick={() => setAlertMsg("")}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold w-full hover:bg-blue-700"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
      {/* Modal Confirm */}
      {confirmConfig && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in">
            <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
            <p className="text-gray-800 font-bold mb-5 text-sm">
              {confirmConfig.msg}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmConfig(null)}
                className="flex-1 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmConfig.onConfirm();
                  setConfirmConfig(null);
                }}
                className="flex-1 py-2 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 text-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal Guardar antes de salir de HC ──────────────────────────── */}
      {_exitHcConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[210] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-gray-800 font-black text-base mb-1">¿Guardar antes de salir?</h3>
            <p className="text-gray-500 text-xs mb-5">
              Tiene cambios sin guardar en esta Historia Clínica.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const proceed = _exitHcConfirm.onProceed;
                  _setExitHcConfirm(null);
                  handleSavePatient();
                  proceed();
                }}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-sm flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Guardar y salir
              </button>
              <button
                onClick={() => {
                  const proceed = _exitHcConfirm.onProceed;
                  _setExitHcConfirm(null);
                  _setHcDirty(false);
                  proceed();
                }}
                className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 text-sm"
              >
                Salir sin guardar
              </button>
              <button
                onClick={() => _setExitHcConfirm(null)}
                className="w-full py-2 text-gray-400 hover:text-gray-600 text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Modal elección tipo HC desde Agenda ─────────────────────────── */}
      {hcChoiceAgenda && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[210] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-4 text-white">
              <h3 className="text-lg font-black">Iniciar Atención Médica</h3>
              <p className="text-blue-100 text-xs mt-0.5">
                Paciente:{" "}
                <span className="font-bold text-white">
                  {hcChoiceAgenda.nombre}
                </span>
              </p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-5 text-center font-medium">
                Seleccione el tipo de Historia Clínica a abrir:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    abrirHCDesdeAgenda(hcChoiceAgenda, "ocupacional")
                  }
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition group"
                >
                  <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                    <span className="text-3xl">🏭</span>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-emerald-800 text-sm">
                      HC Ocupacional
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">
                      Examen médico laboral · Aptitud
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => abrirHCDesdeAgenda(hcChoiceAgenda, "general")}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition group"
                >
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                    <span className="text-3xl">🏥</span>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-blue-800 text-sm">
                      HC General
                    </p>
                    <p className="text-[10px] text-blue-600 mt-0.5">
                      Consulta médica · Fórmula
                    </p>
                  </div>
                </button>
              </div>
              <button
                onClick={() => setHcChoiceAgenda(null)}
                className="mt-4 w-full py-2 text-gray-500 text-sm font-bold hover:text-gray-700 hover:bg-gray-50 rounded-xl transition"
              >
                ✕ Cancelar - volver a la agenda
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Evolución Clínica - GLOBAL (visible desde cualquier tab) */}
      <EvolucionModal />
      {/* Modal Prompt */}
      {promptConfig && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center animate-fade-in">
            <p className="text-gray-800 font-bold mb-3 text-sm">
              {promptConfig.msg}
            </p>
            <input
              autoFocus
              type={promptConfig.type}
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  promptConfig.onSubmit(promptValue);
                  setPromptConfig(null);
                }
              }}
              className="w-full border-2 border-emerald-400 p-2.5 rounded-xl mb-4 text-sm focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setPromptConfig(null)}
                className="flex-1 py-2 border border-gray-200 rounded-xl font-bold text-gray-600 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  promptConfig.onSubmit(promptValue);
                  setPromptConfig(null);
                }}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 text-sm"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal datos paciente — Vista secretaria */}
      {showSecretariaPatientModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowSecretariaPatientModal(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h2 className="font-black text-base">👤 Datos del Paciente</h2>
                <p className="text-blue-100 text-xs mt-0.5">Vista secretaría — Solo datos administrativos</p>
              </div>
              <button onClick={() => setShowSecretariaPatientModal(null)} className="text-white/80 hover:text-white text-xl font-black">✕</button>
            </div>
            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide mb-2">Datos Personales</p>
                <div className="grid grid-cols-2 gap-2">
                  {[["Nombres completos", showSecretariaPatientModal.nombres],["Documento", (showSecretariaPatientModal.docTipo||"CC")+" "+showSecretariaPatientModal.docNumero],["Edad", showSecretariaPatientModal.edad ? showSecretariaPatientModal.edad+" años" : "—"],["Género", showSecretariaPatientModal.genero],["Estado Civil", showSecretariaPatientModal.estadoCivil],["Grupo Sanguíneo", showSecretariaPatientModal.grupoSanguineo]].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-[9px] font-black text-gray-400 uppercase">{label}</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-wide mb-2">Contacto</p>
                <div className="grid grid-cols-2 gap-2">
                  {[["Celular", showSecretariaPatientModal.celular||showSecretariaPatientModal.telefono],["Email", showSecretariaPatientModal.email],["Residencia", showSecretariaPatientModal.residencia],["EPS", showSecretariaPatientModal.eps]].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-[9px] font-black text-blue-400 uppercase">{label}</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wide mb-2">Datos Laborales</p>
                <div className="grid grid-cols-2 gap-2">
                  {[["Empresa", showSecretariaPatientModal.empresaNombre||showSecretariaPatientModal.empresa],["Cargo", showSecretariaPatientModal.cargo],["ARL", showSecretariaPatientModal.arl],["Tipo Examen", showSecretariaPatientModal.tipoExamen],["Fecha Examen", showSecretariaPatientModal.fechaExamen],["Médico", usersList.find(u => u.user === showSecretariaPatientModal._medicoId)?.name || showSecretariaPatientModal._medicoId]].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <p className="text-[9px] font-black text-indigo-400 uppercase">{label}</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
              {showSecretariaPatientModal.estadoHistoria === "Cerrada" && showSecretariaPatientModal.conceptoAptitud && (
                <div className={`border-2 rounded-xl p-3 text-center ${showSecretariaPatientModal.conceptoAptitud.toLowerCase().includes("no apto") ? "bg-red-50 border-red-300" : "bg-emerald-50 border-emerald-300"}`}>
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Concepto de Aptitud</p>
                  <p className="text-xs font-black text-emerald-700">{showSecretariaPatientModal.conceptoAptitud}</p>
                  <p className="text-[9px] text-gray-400 mt-1">Código: {showSecretariaPatientModal.codigoVerificacion || "—"}</p>
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <span className="text-base flex-shrink-0">🔒</span>
                <p className="text-xs text-amber-700 leading-relaxed"><strong>Ficha clínica restringida.</strong> Solo el médico tratante puede abrir el contenido clínico.</p>
              </div>
              <button onClick={() => { const p = showSecretariaPatientModal; setShowSecretariaPatientModal(null); setAgendaForm(prev => ({...prev, nombre: p.nombres||"", docTipo: p.docTipo||"CC", docNumero: p.docNumero||"", celular: p.celular||p.telefono||"", empresa: p.empresaNombre||p.empresa||"", cargo: p.cargo||"", medicoId: p._medicoId||prev.medicoId||"", eps: p.eps||"", _busquedaQuery: p.nombres||""})); goTo("agenda"); }} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 transition">
                📅 Agendar este paciente
              </button>
            </div>
          </div>
        </div>
      )}
      {/* AI Config Panel */}
      {showAIConfig && (
        <AIConfigPanel
          aiConfig={aiConfig}
          onSave={handleSaveAIConfig}
          onClose={() => setShowAIConfig(false)}
        />
      )}
      {/* ── MODAL REPORTE DE GUARDADO EN NUBE ── */}
      {showSyncReport && syncReport && (
        <div
          className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowSyncReport(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-violet-100 p-2 rounded-xl">
                  <Cloud className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-base">
                    Reporte de Guardado en Nube
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    {new Date(syncReport.ts).toLocaleString("es-CO")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncReport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Resumen numérico */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                {
                  label: "Pacientes",
                  val: syncReport.summary.pacientes,
                  icon: "👥",
                },
                {
                  label: "Empresas",
                  val: syncReport.summary.empresas,
                  icon: "🏢",
                },
                {
                  label: "Usuarios",
                  val: syncReport.summary.usuarios,
                  icon: "👤",
                },
                {
                  label: "Facturas",
                  val: syncReport.summary.facturas,
                  icon: "🧾",
                },
                {
                  label: "Informes",
                  val: syncReport.summary.informes,
                  icon: "📄",
                },
                {
                  label: "Audit log",
                  val: syncReport.summary.auditLog,
                  icon: "🛡️",
                },
              ].map(({ label, val, icon }) => (
                <div
                  key={label}
                  className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100"
                >
                  <p className="text-lg">{icon}</p>
                  <p className="text-lg font-black text-violet-700">{val}</p>
                  <p className="text-[10px] text-gray-500 font-semibold">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            {/* Detalle por colección */}
            <div className="space-y-1.5 mb-4">
              <p className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
                Detalle de sincronización
              </p>
              {Object.entries(syncReport.results).map(([label, ok]) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                    ok
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <span>{label}</span>
                  <span>
                    {ok ? "✅ Guardado" : "❌ Error - guardado local"}
                  </span>
                </div>
              ))}
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                  syncReport.summary.firma
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                <span>✍️ Firma digital</span>
                <span>
                  {syncReport.summary.firma
                    ? "✅ Guardada"
                    : "- Sin firma registrada"}
                </span>
              </div>
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                  syncReport.summary.apiKeys.length
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <span>🔑 API Keys IA</span>
                <span>
                  {syncReport.summary.apiKeys.length
                    ? `✅ ${syncReport.summary.apiKeys.join(", ")}`
                    : "⚠ Sin keys configuradas"}
                </span>
              </div>
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-xs text-violet-800 font-semibold text-center mb-3">
              {Object.values(syncReport.results).every(Boolean)
                ? "☁️ Todo guardado correctamente en Supabase. Puede acceder desde cualquier dispositivo."
                : "⚠️ Algunos elementos fallaron. Están guardados localmente y se sincronizarán automáticamente."}
            </div>
            <button
              onClick={() => setShowSyncReport(false)}
              className="w-full bg-violet-600 text-white py-2.5 rounded-xl font-black text-sm hover:bg-violet-700"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      {/* Restricciones Checklist Panel */}
      {showRestriccionesPanel && (
        <RestriccionesChecklistPanel
          selected={data.restriccionesChecklist || {}}
          onChange={(fn) =>
            setData((p) => ({
              ...p,
              restriccionesChecklist: fn(p.restriccionesChecklist || {}),
            }))
          }
          onClose={() => setShowRestriccionesPanel(false)}
          onApply={() => {
            applyRestriccionesChecklist(data.restriccionesChecklist || {});
            setShowRestriccionesPanel(false);
          }}
          isGenerating={isGeneratingRestr}
          onGenerate={generateAIRestricciones}
        />
      )}
      {/* Recomendaciones Checklist Panel */}
      {showRecomendacionesPanel && (
        <RecomendacionesChecklistPanel
          selected={data.recomendacionesChecklist || {}}
          onChange={(fn) =>
            setData((p) => ({
              ...p,
              recomendacionesChecklist: fn(p.recomendacionesChecklist || {}),
            }))
          }
          onClose={() => setShowRecomendacionesPanel(false)}
          onApply={() => {
            applyRecomendacionesChecklist(data.recomendacionesChecklist || {});
            setShowRecomendacionesPanel(false);
          }}
          isGenerating={isGeneratingReco}
          onGenerate={generateAIRecomendaciones}
        />
      )}
    </>
    </AppProvider>
  );
}

// ── Export: App envuelta en ErrorBoundary ──
export default function App() {
  return React.createElement(AppErrorBoundary, null, React.createElement(AppInner));
}
