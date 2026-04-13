import React from "react";
import {
  AlertTriangle, BarChart3, Building2, Clock, Eye, FileCheck, FileSearch,
  FileText, HardDrive, Heart, Receipt, Shield, Stethoscope, Trash2,
  UserCheck, Users, Lock
} from "lucide-react";
import {
  _canUse, _isAdmin, _isAdminEmpresa, _isAdminOrEmpresa,
  _secretariaPuede, _contarHC, PLAN_CONFIG,
} from "../shared/data/planConfig.js";
import { getSpanishDate } from "../shared/lib/formatters.js";

const DashboardPage = (props) => {
  const {
    currentUser, usersList, companies, patientsList,
    data, setData, setDataType, setActiveTab,
    activeDoctorData, savedBillsList, orgsList,
    cajaMovimientos, setCajaTab,
    renderNavbar, goTo, showAlert,
    medicoTurnoActivo, handleNewOccupHistory, handleNewGeneralHistory,
    openPatient, setUserEditId, setEditForm, setActiveUserMgmtTab,
  } = props;

  return (
<div className="min-h-screen bg-gray-50 font-sans">
  {renderNavbar()}
  <div className="max-w-6xl mx-auto p-8">
    <div className="mb-8">
      {/* Î“Ã¶Ã‡Î“Ã¶Ã‡ IPS: Banner de empresa cuando el usuario tiene empresaId Î“Ã¶Ã‡Î“Ã¶Ã‡ */}
      {currentUser?.empresaId &&
        (() => {
          const _miEmpBanner = companies.find(
            (c) => c.id === currentUser.empresaId
          );
          return (
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-4 mb-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-black text-lg tracking-tight">
                    {_miEmpBanner?.nombre || "IPS"}
                  </p>
                  <p className="text-teal-100 text-xs">
                    NIT: {_miEmpBanner?.nit || "Î“Ã‡Ã¶"} â”¬â•–{" "}
                    {_miEmpBanner?.ciudad || ""} â”¬â•–{" "}
                    {currentUser.role === "admin_empresa"
                      ? "Admin IPS"
                      : currentUser.role === "medico"
                      ? "Mâ”œâŒdico IPS"
                      : "Secretaria IPS"}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h2 className="text-2xl font-black text-gray-800">
          {currentUser?.empresaId ? "Panel IPS" : "Panel Principal"}
        </h2>
        {/* FASE 2: Indicador mâ”œâŒdico de turno */}
        {_isAdmin(currentUser?.role) && (
          <div className="flex items-center gap-2">
            {medicoTurnoActivo ? (
              <div
                onClick={() =>
                  goTo("users") ||
                  setTimeout(() => setActiveUserMgmtTab("reasignacion"), 50)
                }
                className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-green-100 transition"
                title="Click para cambiar mâ”œâŒdico de turno"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-black text-green-700">
                  â‰¡Æ’âŒâ•‘ Turno:{" "}
                  {usersList.find((u) => u.user === medicoTurnoActivo)
                    ?.name || medicoTurnoActivo}
                </span>
              </div>
            ) : (
              <div
                onClick={() =>
                  goTo("users") ||
                  setTimeout(() => setActiveUserMgmtTab("reasignacion"), 50)
                }
                className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-amber-100 transition"
              >
                <span className="text-xs text-amber-600 font-bold">
                  Î“ÃœÃ¡âˆ©â••Ã… Sin mâ”œâŒdico de turno
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-gray-500 text-sm">
        {getSpanishDate(null)} -- {currentUser?.name}
        {currentUser?.role === "super_admin" && (
          <span className="ml-2 text-purple-600 font-bold">
            Î“Â¡Ã‰ Super Admin â”¬â•– {orgsList.length} orgs
          </span>
        )}
      </p>
      {/* Î“Ã¶Ã‡Î“Ã¶Ã‡ PLAN STATUS BANNER Î“Ã¶Ã‡Î“Ã¶Ã‡ */}
      {(() => {
        const plan = PLAN_CONFIG[currentUser?.license || "libre"];
        const hcUsadas = _contarHC(patientsList, currentUser?.user);
        const pct =
          plan.maxHC < 9999
            ? Math.round((hcUsadas / plan.maxHC) * 100)
            : -1;
        const _expDays = currentUser?.licenseExpiry
          ? Math.ceil(
              (new Date(currentUser.licenseExpiry) - new Date()) / 86400000
            )
          : 99;
        const isExpiring =
          plan.price > 0 && _expDays >= 0 && _expDays <= 7
            ? _expDays
            : false;
        const colorMap = {
          libre: "gray",
          starter: "teal",
          pro: "blue",
          clinica: "purple",
        };
        const col = colorMap[currentUser?.license || "libre"];
        return (
          <div
            className={`mt-3 flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl bg-${col}-50 border border-${col}-200`}
          >
            <span className={`font-black text-${col}-700 text-sm`}>
              {plan.label}
            </span>
            <span className="text-gray-400 text-xs">â”¬â•–</span>
            {plan.maxHC < 9999 ? (
              <span
                className={`text-xs font-bold ${
                  pct >= 100
                    ? "text-red-600"
                    : pct >= 80
                    ? "text-amber-600"
                    : "text-gray-600"
                }`}
              >
                â‰¡Æ’Ã´Ã¯ {hcUsadas}/{plan.maxHC} HC {pct >= 80 && "Î“ÃœÃ¡âˆ©â••Ã…"}
              </span>
            ) : (
              <span className="text-xs text-gray-500">
                â‰¡Æ’Ã´Ã¯ HC ilimitadas
              </span>
            )}
            {isExpiring !== false && isExpiring >= 0 && (
              <span className="text-xs font-bold text-amber-600">
                Î“Ã…â–‘ Vence en {isExpiring}d
              </span>
            )}
            {plan.price === 0 && (
              <button
                onClick={() => goTo("planes")}
                className={`ml-auto text-xs font-black bg-${col}-600 text-white px-3 py-1 rounded-lg hover:opacity-90 transition`}
              >
                Î“Â¼Ã¥âˆ©â••Ã… Ver planes
              </button>
            )}
          </div>
        );
      })()}
    </div>
    {/* Stats Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {(() => {
        // Î“Ã¶Ã‡Î“Ã¶Ã‡ IPS: scope stats to empresa patients Î“Ã¶Ã‡Î“Ã¶Ã‡
        const _scopedPats = currentUser?.empresaId
          ? patientsList.filter((p) => {
              const _scEmp = companies.find(
                (c) => c.id === currentUser.empresaId
              );
              return (
                p.empresaId === currentUser.empresaId ||
                (_scEmp && p.empresaNit === _scEmp.nit)
              );
            })
          : patientsList;
        const _scopedComps = currentUser?.empresaId
          ? companies.filter((c) => c.id === currentUser.empresaId)
          : companies;
        return [
          {
            label: "Historias Registradas",
            value: _scopedPats.filter((p) => p.fechaExamen).length,
            color: "emerald",
            icon: FileText,
          },
          {
            label: "Empresas",
            value: _scopedComps.length,
            color: "purple",
            icon: Building2,
          },
          {
            label: "HC Cerradas",
            value: _scopedPats.filter((p) => p.estadoHistoria === "Cerrada")
              .length,
            color: "red",
            icon: Lock,
          },
          {
            label: "HC Abiertas",
            value: _scopedPats.filter(
              (p) => p.estadoHistoria !== "Cerrada" && p.fechaExamen
            ).length,
            color: "blue",
            icon: Lock,
          ...(_isAdminOrEmpresa(currentUser?.role)
            ? [
                {
                  label: currentUser?.empresaId
                    ? "Mâ”œâŒdicos IPS"
                    : "Mâ”œâŒdicos activos",
                  value: currentUser?.empresaId
                    ? usersList.filter(
                        (u) =>
                          u.empresaId === currentUser.empresaId &&
                          u.role === "medico" &&
                          u.activo !== false
                      ).length
                    : usersList.filter(
                        (u) => u.role === "medico" && u.activo !== false
                      ).length,
                  color: "indigo",
                  icon: Users,
                },
                {
                  label: "Cuentas pendientes",
                  value: savedBillsList.filter((b) => !b.pagada).length,
                  color: "orange",
                  icon: Receipt,
                },
                ...(!currentUser?.empresaId
                  ? [
                      {
                        label: "Convenios por vencer",
                        value: companies.filter((c) => {
                          if (!c.convenioVencimiento) return false;
                          const d = new Date(c.convenioVencimiento);
                          const h = new Date();
                          const en30 = new Date(h);
                          en30.setDate(en30.getDate() + 30);
                          return d >= h && d <= en30;
                        }).length,
                        color: "amber",
                        icon: Building2,
                      },
                    ]
                  : []),
              ]
            : []),
        ];
      })().map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-xl p-4 shadow-sm border border-${card.color}-100`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">
                {card.label}
              </p>
              <p
                className={`text-3xl font-black text-${card.color}-600 mt-1`}
              >
                {card.value}
              </p>
            </div>
            <div className={`bg-${card.color}-50 p-2 rounded-lg`}>
              <card.icon className={`w-5 h-5 text-${card.color}-600`} />
            </div>
          </div>
        </div>
      ))}
    </div>
    {/* Î“Ã¶Ã‡Î“Ã¶Ã‡ ACCIONES PRINCIPALES Î“Ã¶Ã‡Î“Ã¶Ã‡ */}
    {["medico", "administrador", "secretaria", "admin_empresa", "super_admin"].includes(
      currentUser?.role
    ) && (
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={handleNewOccupHistory}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all text-left"
        >
          <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-white/5 rounded-full" />
          <div className="relative">
            <div className="bg-white/20 w-9 h-9 rounded-xl flex items-center justify-center mb-3">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-black text-white text-sm leading-tight">
              Nueva HC Ocupacional
            </h3>
            <p className="text-emerald-100 text-[11px] mt-0.5">
              Evaluaciâ”œâ”‚n mâ”œâŒdica del trabajo
            </p>
          </div>
        </button>
        <button
          onClick={handleNewGeneralHistory}
          className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all text-left"
        >
          <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-white/5 rounded-full" />
          <div className="relative">
            <div className="bg-white/20 w-9 h-9 rounded-xl flex items-center justify-center mb-3">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-black text-white text-sm leading-tight">
              Nueva HC General
            </h3>
            <p className="text-blue-100 text-[11px] mt-0.5">
              Consulta medicina general
            </p>
          </div>
        </button>
      </div>
    )}

    {/* Î“Ã¶Ã‡Î“Ã¶Ã‡ Mâ”œÃ´DULOS AGRUPADOS Î“Ã¶Ã‡Î“Ã¶Ã‡ */}
    <div className="space-y-4 mb-6">
      {/* Gestiâ”œâ”‚n Clâ”œÂ¡nica */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          â‰¡Æ’âŒâ•‘ Gestiâ”œâ”‚n Clâ”œÂ¡nica
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => goTo("patients")}
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-teal-200 hover:bg-teal-50/40 transition group shadow-sm"
          >
            <div className="bg-teal-50 p-2 rounded-lg group-hover:bg-teal-100 transition flex-shrink-0">
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Pacientes
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Expedientes
              </p>
            </div>
          </button>
          <button
            onClick={() => goTo("agenda")}
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-blue-200 hover:bg-blue-50/40 transition group shadow-sm"
          >
            <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition flex-shrink-0 text-base leading-none flex items-center justify-center w-8 h-8">
              â‰¡Æ’Ã¹Ã´âˆ©â••Ã…
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Agenda
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Sala de espera
              </p>
            </div>
          </button>
          <button
            onClick={() => goTo("verification")}
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-cyan-200 hover:bg-cyan-50/40 transition group shadow-sm"
          >
            <div className="bg-cyan-50 p-2 rounded-lg group-hover:bg-cyan-100 transition flex-shrink-0">
              <FileSearch className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Verificar
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Certificados
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Administraciâ”œâ”‚n */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          â‰¡Æ’Ã†â• Administraciâ”œâ”‚n
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => goTo("companies")}
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-purple-200 hover:bg-purple-50/40 transition group shadow-sm"
          >
            <div className="bg-purple-50 p-2 rounded-lg group-hover:bg-purple-100 transition flex-shrink-0">
              <Building2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Empresas
              </p>
              <p className="text-[10px] text-gray-400 truncate">Clientes</p>
            </div>
          </button>
          <button
            onClick={() => {
              goTo("users");
              if (
                !_isAdmin(currentUser?.role) &&
                !_isAdminEmpresa(currentUser?.role)
              ) {
                const me = usersList.find(
                  (u) => u.user === currentUser?.user
                );
                if (me) {
                  setTimeout(() => {
                    setUserEditId(me.id || me.user);
                    setEditForm({
                      ...me,
                      doctorData: {
                        ...DEFAULT_DOCTOR_DATA,
                        ...(me.doctorData || {}),
                      },
                    });
                  }, 50);
                }
              }
            }}
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-violet-200 hover:bg-violet-50/40 transition group shadow-sm"
          >
            <div className="bg-violet-50 p-2 rounded-lg group-hover:bg-violet-100 transition flex-shrink-0">
              <UserCheck className="w-4 h-4 text-violet-600" />
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Usuarios
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {currentUser?.role === "admin_empresa"
                  ? "Mâ”œâŒdicos IPS"
                  : "Accesos"}
              </p>
            </div>
          </button>
          {currentUser?.role === "admin_empresa" ? (
            <button
              onClick={() => goTo("perfilips")}
              className="bg-white border border-blue-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-blue-300 hover:bg-blue-50/40 transition group shadow-sm"
            >
              <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition flex-shrink-0">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left min-w-0">
                <p className="font-black text-gray-800 text-xs leading-tight">
                  Mi Empresa
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  Logo â”¬â•– NIT â”¬â•– IPS
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => goTo("portafolio")}
              className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-indigo-200 hover:bg-indigo-50/40 transition group shadow-sm"
            >
              <div className="bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-100 transition flex-shrink-0 text-base leading-none flex items-center justify-center w-8 h-8">
                â‰¡Æ’Ã†â•
              </div>
              <div className="text-left min-w-0">
                <p className="font-black text-gray-800 text-xs leading-tight">
                  Portafolio
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  Precios â”¬â•– Servicios
                </p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Financiero y Reportes */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          â‰¡Æ’Ã†â–‘ Financiero & Reportes
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() =>
              _canUse("factura_basica", currentUser)
                ? goTo("bill")
                : showAlert(
                    "â‰¡Æ’Ã¶Ã† Cuentas de Cobro estâ”œÃ­ disponible en el plan â‰¡Æ’Ã®â–’ Starter ($45.000/mes).\n\nMenâ”œâ•‘ Î“Ã¥Ã† Î“Â¡Ã‰ Ver Planes"
                  )
            }
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-orange-200 hover:bg-orange-50/40 transition group shadow-sm"
          >
            <div
              className={`${
                _canUse("factura_basica", currentUser)
                  ? "bg-orange-50"
                  : "bg-gray-50"
              } p-2 rounded-lg group-hover:bg-orange-100 transition flex-shrink-0`}
            >
              <Receipt
                className={`w-4 h-4 ${
                  _canUse("factura_basica", currentUser)
                    ? "text-orange-600"
                    : "text-gray-400"
                }`}
              />
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Cuentas de Cobro{" "}
                {!_canUse("factura_basica", currentUser) && (
                  <span className="text-[8px] bg-amber-100 text-amber-700 px-0.5 rounded">
                    â‰¡Æ’Ã¶Ã†
                  </span>
                )}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Facturaciâ”œâ”‚n
              </p>
            </div>
          </button>
          {(currentUser?.role !== "secretaria" ||
            _secretariaPuede("caja", currentUser, usersList)) && (
            <button
              onClick={() => goTo("caja")}
              className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-green-200 hover:bg-green-50/40 transition group shadow-sm"
            >
              <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 transition flex-shrink-0 text-base leading-none flex items-center justify-center w-8 h-8">
                â‰¡Æ’Ã†â–‘
              </div>
              <div className="text-left min-w-0">
                <p className="font-black text-gray-800 text-xs leading-tight">
                  Mâ”œâ”‚dulo Financiero
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  Caja â”¬â•– Cuentas
                </p>
              </div>
            </button>
          )}
          <button
            onClick={() =>
              _canUse("reportes_basicos", currentUser)
                ? goTo("reporte")
                : showAlert("â‰¡Æ’Ã¶Ã† Reportes disponible en plan Starter+")
            }
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-indigo-200 hover:bg-indigo-50/40 transition group shadow-sm"
          >
            <div className="bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-100 transition flex-shrink-0">
              <BarChart3
                className={`w-4 h-4 ${
                  _canUse("reportes_basicos", currentUser)
                    ? "text-indigo-600"
                    : "text-gray-400"
                }`}
              />
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Reportes{" "}
                {!_canUse("reportes_basicos", currentUser) && (
                  <span className="text-[8px] bg-amber-100 text-amber-700 px-0.5 rounded">
                    â‰¡Æ’Ã¶Ã†
                  </span>
                )}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Diagnâ”œâ”‚stico
              </p>
            </div>
          </button>
          <button
            onClick={() =>
              _canUse("propuestas", currentUser)
                ? goTo("propuestas")
                : showAlert(
                    "â‰¡Æ’Ã¶Ã† Propuestas Econâ”œâ”‚micas estâ”œÃ­ disponible en el plan â‰¡Æ’Ã®â–’ Starter ($45.000/mes).\n\nMenâ”œâ•‘ Î“Ã¥Ã† Î“Â¡Ã‰ Ver Planes"
                  )
            }
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-teal-200 hover:bg-teal-50/40 transition group shadow-sm"
          >
            <div
              className={`${
                _canUse("propuestas", currentUser)
                  ? "bg-teal-50"
                  : "bg-gray-50"
              } p-2 rounded-lg group-hover:bg-teal-100 transition flex-shrink-0`}
            >
              <FileText
                className={`w-4 h-4 ${
                  _canUse("propuestas", currentUser)
                    ? "text-teal-600"
                    : "text-gray-400"
                }`}
              />
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Propuestas{" "}
                {!_canUse("propuestas", currentUser) && (
                  <span className="text-[8px] bg-amber-100 text-amber-700 px-0.5 rounded">
                    â‰¡Æ’Ã¶Ã†
                  </span>
                )}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Cotizaciones
              </p>
            </div>
          </button>
          {_isAdminOrEmpresa(currentUser?.role) && (
            <button
              onClick={() => goTo("contabilidad")}
              className="bg-white border border-green-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-green-300 hover:bg-green-50/40 transition group shadow-sm"
            >
              <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 transition flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-left min-w-0">
                <p className="font-black text-gray-800 text-xs leading-tight">
                  Contabilidad
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  P&L â”¬â•– KPIs â”¬â•– Fiscal
                </p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Mâ”œâ”‚dulos Especializados */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          Î“ÃœÃ­ Mâ”œâ”‚dulos Especializados
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <button
            onClick={() =>
              _canUse("sve_starter", currentUser)
                ? goTo("sve")
                : showAlert(
                    "â‰¡Æ’Ã¶Ã† SVE estâ”œÃ­ disponible en el plan â‰¡Æ’Ã®â–’ Starter ($45.000/mes, 2 programas) o Î“Â¡Ã‰ Pro ($79.000/mes, 7 programas).\n\nMenâ”œâ•‘ Î“Ã¥Ã† Î“Â¡Ã‰ Ver Planes"
                  )
            }
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-teal-200 hover:bg-teal-50/40 transition group shadow-sm"
          >
            <div
              className={`${
                _canUse("sve_starter", currentUser)
                  ? "bg-teal-50"
                  : "bg-gray-50"
              } p-2 rounded-lg group-hover:bg-teal-100 transition flex-shrink-0`}
            >
              <BarChart3
                className={`w-4 h-4 ${
                  _canUse("sve_starter", currentUser)
                    ? "text-teal-600"
                    : "text-gray-400"
                }`}
              />
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                SVE{" "}
                {!_canUse("sve_starter", currentUser) && (
                  <span className="text-[8px] bg-amber-100 text-amber-700 px-0.5 rounded">
                    â‰¡Æ’Ã¶Ã†
                  </span>
                )}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Vigilancia epidemiolâ”œâ”‚gica
              </p>
            </div>
          </button>
          <button
            onClick={() =>
              _canUse("arl", currentUser)
                ? goTo("arl")
                : showAlert(
                    "â‰¡Æ’Ã¶Ã† Mâ”œâ”‚dulo ARL estâ”œÃ­ disponible en el plan Î“Â¡Ã‰ Pro ($79.000/mes).\n\nMenâ”œâ•‘ Î“Ã¥Ã† Î“Â¡Ã‰ Ver Planes"
                  )
            }
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-red-200 hover:bg-red-50/40 transition group shadow-sm"
          >
            <div
              className={`${
                _canUse("arl", currentUser) ? "bg-red-50" : "bg-gray-50"
              } p-2 rounded-lg group-hover:bg-red-100 transition flex-shrink-0`}
            >
              <AlertTriangle
                className={`w-4 h-4 ${
                  _canUse("arl", currentUser)
                    ? "text-red-600"
                    : "text-gray-400"
                }`}
              />
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Mâ”œâ”‚dulo ARL{" "}
                {!_canUse("arl", currentUser) && (
                  <span className="text-[8px] bg-amber-100 text-amber-700 px-0.5 rounded">
                    â‰¡Æ’Ã¶Ã†
                  </span>
                )}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Reportes AT/EL
              </p>
            </div>
          </button>
          <button
            onClick={() => goTo("portafolio")}
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-indigo-200 hover:bg-indigo-50/40 transition group shadow-sm"
          >
            <div className="bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-100 transition flex-shrink-0 text-base leading-none flex items-center justify-center w-8 h-8">
              â‰¡Æ’Ã†â•
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Portafolio
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Precios â”¬â•– Servicios
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Portales y Acceso Externo */}
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          â‰¡Æ’Ã®Ã‰ Portales & Acceso Externo
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => goTo("portaltrabajador")}
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-teal-200 hover:bg-teal-50/40 transition group shadow-sm"
          >
            <div className="bg-teal-50 p-2 rounded-lg group-hover:bg-teal-100 transition flex-shrink-0">
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Portal Trabajador
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Consulta câ”œâ”‚digo
              </p>
            </div>
          </button>
          <button
            onClick={() => goTo("portalempresa")}
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-indigo-200 hover:bg-indigo-50/40 transition group shadow-sm"
          >
            <div className="bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-100 transition flex-shrink-0">
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Portal Empresa
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Acceso convenio
              </p>
            </div>
          </button>
          <button
            onClick={() => goTo("habeasdata")}
            className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-indigo-200 hover:bg-indigo-50/40 transition group shadow-sm"
          >
            <div className="bg-indigo-50 p-2 rounded-lg group-hover:bg-indigo-100 transition flex-shrink-0">
              <Shield className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-left min-w-0">
              <p className="font-black text-gray-800 text-xs leading-tight">
                Habeas Data
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Derechos titulares
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Super Admin */}
      {currentUser?.role === "super_admin" && (
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            Î“Â¡Ã‰ Super Admin
          </p>
          <button
            onClick={() => goTo("superadmin")}
            className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-4 flex items-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="bg-purple-500/40 p-2.5 rounded-xl flex-shrink-0 relative">
              <span className="text-xl">Î“Â¡Ã‰</span>
            </div>
            <div className="relative">
              <p className="font-black text-white text-sm">Panel Global</p>
              <p className="text-purple-200 text-[11px]">
                Super Admin â”¬â•– {orgsList.length} organizaciones
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
    {/* ADMIN ALERTS PANEL */}
    {_isAdminOrEmpresa(currentUser?.role) &&
      (() => {
        const hoy = new Date();
        const en30 = new Date(hoy);
        en30.setDate(en30.getDate() + 30);
        const conveniosAlerta = companies.filter(
          (c) =>
            c.convenioVencimiento &&
            new Date(c.convenioVencimiento) <= en30 &&
            new Date(c.convenioVencimiento) >= hoy
        );
        const cuentasPend = savedBillsList.filter((b) => !b.pagada);
        const hcAbiertas = patientsList.filter(
          (p) =>
            p.estadoHistoria !== "Cerrada" && p.fechaExamen && !p._archivado
        );
        const medsinFirma = usersList.filter(
          (u) =>
            u.role === "medico" &&
            !u.doctorData?.firma &&
            u.activo !== false
        );
        const alertas = [
          ...conveniosAlerta.map((c) => ({
            tipo: "amber",
            msg: `Î“ÃœÃ¡âˆ©â••Ã… Convenio prâ”œâ”‚ximo a vencer: ${c.nombre} (${c.convenioVencimiento})`,
            accion: () => goTo("companies"),
          })),
          ...(cuentasPend.length > 5
            ? [
                {
                  tipo: "red",
                  msg: `â‰¡Æ’Ã†â”‚ ${
                    cuentasPend.length
                  } cuentas de cobro pendientes por $ ${cuentasPend
                    .reduce((s, b) => s + Number(b.amount || 0), 0)
                    .toLocaleString("es-CO")}`,
                  accion: () => {
                    goTo("caja");
                    setTimeout(() => setCajaTab("cuentas"), 100);
                  },
                },
              ]
            : []),
          ...(hcAbiertas.length > 3
            ? [
                {
                  tipo: "blue",
                  msg: `â‰¡Æ’Ã´Ã¯ ${hcAbiertas.length} HCs sin cerrar`,
                  accion: () => {},
                },
              ]
            : []),
          ...medsinFirma.map((m) => ({
            tipo: "purple",
            msg: `Î“Â£Ã¬âˆ©â••Ã… ${m.name || m.user} no tiene firma digital cargada`,
            accion: () => goTo("users"),
          })),
        ];
        if (alertas.length === 0) return null;
        return (
          <div className="mb-4 space-y-2">
            {alertas.slice(0, 5).map((a, i) => (
              <div
                key={i}
                onClick={a.accion}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:opacity-80 transition bg-${a.tipo}-50 border-${a.tipo}-200`}
              >
                <p
                  className={`text-xs font-bold text-${a.tipo}-800 flex-1`}
                >
                  {a.msg}
                </p>
                <span
                  className={`text-[10px] text-${a.tipo}-600 font-black`}
                >
                  Ver Î“Ã¥Ã†
                </span>
              </div>
            ))}
          </div>
        );
      })()}
    {/* Î“Ã¶Ã‡Î“Ã¶Ã‡ PRODUCTIVIDAD POR Mâ”œÃ«DICO - admin + admin_empresa (FASE 5) Î“Ã¶Ã‡Î“Ã¶Ã‡ */}
    {_isAdminOrEmpresa(currentUser?.role) &&
      (() => {
        const medicosActivos = usersList.filter(
          (u) =>
            [
              "medico",
              "administrador",
              "super_admin",
              "admin_empresa",
            ].includes(u.role) &&
            u.activo !== false &&
            // IPS: scope to empresa doctors
            (currentUser?.empresaId
              ? u.empresaId === currentUser.empresaId
              : true)
        );
        if (medicosActivos.length === 0) return null;
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        const movsDelMes = cajaMovimientos.filter(
          (m) => m.tipo === "ingreso" && m.fecha >= inicioMes
        );
        const totalMes = movsDelMes.reduce(
          (s, m) => s + Number(m.monto || 0),
          0
        );
        return (
          <div className="mb-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-black text-sm flex items-center gap-2">
                â‰¡Æ’Ã´Ã¨ Productividad por Mâ”œâŒdico{" "}
                <span className="text-gray-400 font-normal text-xs">
                  (mes actual)
                </span>
              </h3>
              <button
                onClick={() => {
                  goTo("caja");
                  setTimeout(() => setCajaTab("por_medico"), 100);
                }}
                className="text-[10px] text-gray-300 hover:text-white font-black"
              >
                Ver detalle Î“Ã¥Ã†
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    {[
                      "Mâ”œâŒdico",
                      "Atenciones",
                      "HCs cerradas",
                      "HCs abiertas",
                      "Ingresos mes",
                      "% del total",
                    ].map((h) => (
                      <th key={h} className="p-2 text-left font-black">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {medicosActivos.map((med, i) => {
                    const movsMed = movsDelMes.filter(
                      (m) =>
                        m.medicoId === med.user ||
                        (!m.medicoId && _isAdmin(med.role))
                    );
                    const ingresosMed = movsMed.reduce(
                      (s, m) => s + Number(m.monto || 0),
                      0
                    );
                    const atenMed = movsMed.filter(
                      (m) => m.pacienteId
                    ).length;
                    const pacsMed = patientsList.filter(
                      (p) =>
                        !p._archivado &&
                        (p.medicoId === med.user ||
                          (!p.medicoId && _isAdmin(med.role)))
                    );
                    const hcCerradas = pacsMed.filter(
                      (p) => p.estadoHistoria === "Cerrada"
                    ).length;
                    const hcAbiertas = pacsMed.filter(
                      (p) => p.estadoHistoria !== "Cerrada" && p.fechaExamen
                    ).length;
                    const pct =
                      totalMes > 0
                        ? ((ingresosMed / totalMes) * 100).toFixed(1)
                        : "0";
                    return (
                      <tr
                        key={med.user}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-2 font-bold text-gray-800">
                          {med.name || med.user}
                        </td>
                        <td className="p-2 text-center">{atenMed}</td>
                        <td className="p-2 text-center text-emerald-700 font-bold">
                          {hcCerradas}
                        </td>
                        <td className="p-2 text-center text-amber-600 font-bold">
                          {hcAbiertas}
                        </td>
                        <td className="p-2 font-black text-emerald-700">
                          $ {ingresosMed.toLocaleString("es-CO")}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-indigo-500 h-1.5 rounded-full"
                                style={{
                                  width: `${Math.min(100, Number(pct))}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-black">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    {/* Recent Records */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-black text-gray-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" /> Registros Recientes
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
            <tr>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Paciente</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Concepto</th>
              <th className="p-3 text-center">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patientsList
              .filter(
                (p) => p.fechaExamen && !p._archivado && canViewPatient(p)
              )
              .slice(-20)
              .reverse()
              .map((p, i) => (
                <tr
                  key={`${p.id}-${i}`}
                  className="border-b border-gray-50 hover:bg-gray-50 transition"
                >
                  <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                    {p.fechaExamen}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-gray-800 text-xs">
                      {p.nombres}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {p.docNumero} â”¬â•– {p.cargo || "Sin cargo"}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        p.type === "general"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {p.type === "general" ? "General" : "Ocupacional"}
                    </span>
                  </td>
                  <td className="p-3 text-[10px] text-gray-600 max-w-[200px] truncate">
                    {p.conceptoAptitud || "--"}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        p.estadoHistoria === "Cerrada"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {p.estadoHistoria || "Abierta"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => openPatient(p)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200"
                        title="Editar/Ver"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (!canViewPatient(p)) {
                            showAlert(
                              "Î“Â¢Ã¶ Solo puede acceder a historias creadas por usted."
                            );
                            return;
                          }
                          setData(p);
                          setDataType(p.type || "ocupacional");
                          setActiveTab(
                            p.type === "general"
                              ? "formGeneral"
                              : "certificado"
                          );
                          goTo("historia");
                        }}
                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-200"
                        title="Certificado"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePatient(p.id)}
                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 border border-red-200"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {p.estadoHistoria === "Cerrada" &&
                        p.type === "ocupacional" && (
                          <button
                            onClick={async () => {
                              try {
                                const pkg = await _generarPaqueteRetencion(
                                  p,
                                  activeDoctorData
                                );
                                const blob = new Blob(
                                  [JSON.stringify(pkg, null, 2)],
                                  { type: "application/json" }
                                );
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download =
                                  "HC_" +
                                  (p.docNumero || "").replace(/\s+/g, "_") +
                                  "_SHA256.json";
                                a.click();
                                URL.revokeObjectURL(url);
                                showAlert(
                                  "Î“Â£Ã  Preservado.\nSHA-256: " +
                                    pkg.hashSHA256.substring(0, 16) +
                                    "..."
                                );
                              } catch (e) {
                                showAlert("Error: " + e.message);
                              }
                            }}
                            className="p-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 border border-purple-200"
                            title="Preservar HC 20 aâ”œâ–’os (Res.1995/1999)"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      {p.estadoHistoria === "Cerrada" &&
                        p.type === "ocupacional" && (
                          <button
                            onClick={() => {
                              const bundle = _generarFHIRBundle(
                                p,
                                activeDoctorData
                              );
                              const blob = new Blob(
                                [JSON.stringify(bundle, null, 2)],
                                { type: "application/fhir+json" }
                              );
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download =
                                "FHIR_" +
                                (p.docNumero || "").replace(/\s+/g, "_") +
                                ".json";
                              a.click();
                              URL.revokeObjectURL(url);
                              showAlert(
                                "\u2705 FHIR R4 exportado.\nRes. 1888/2025 RDA"
                              );
                            }}
                            className="p-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200"
                            title="Exportar FHIR R4 (Res. 1888/2025)"
                          >
                            <span className="text-[10px] font-black">
                              FHIR
                            </span>
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            {patientsList.filter((p) => p.fechaExamen && !p._archivado)
              .length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-gray-400 text-sm"
                >
                  No hay registros aâ”œâ•‘n. Cree una nueva historia clâ”œÂ¡nica.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
  );
};

export default DashboardPage;
