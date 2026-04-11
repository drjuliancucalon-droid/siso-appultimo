import React from 'react';
import {
  Printer, Save
} from "lucide-react";
// ============================================================
// TabSolicitudExamenes.jsx — Extraído del monolito App.jsx
// Usa useApp() para acceder al estado centralizado
// ============================================================
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useApp } from "../../AppContext.jsx";
// Globals (helpers, constantes, componentes base)
// Los componentes base ya están disponibles via globals
import * as G from "../../globals.jsx";

export default function TabSolicitudExamenes() {
  const app = useApp();
  const {
    // Desestructura todo el estado que necesites
    view, setView, currentUser, setCurrentUser,
    data, setData, dataType, setDataType,
    activeTab, setActiveTab,
    patientsList, setPatientsList,
    companies, setCompanies,
    usersList, setUsersList,
    billData, setBillData,
    saveStatus, setSaveStatus,
    alertMsg, setAlertMsg,
    showAlert, goTo,
    ...app_rest
  } = app;

  // ── Cuerpo original del render function ──────────────────
  const renderTabSolicitudExamenes = () => {
    // FIX: definir _billDocData/_billDocSig en scope de renderTabSolicitudExamenes
    const _examDocUser2 =
      typeof billData !== "undefined" && billData?.billDoctorId
        ? usersList?.find((u) => u.user === billData.billDoctorId)
        : null;
    const _billDocData = _examDocUser2?.doctorData || activeDoctorData;
    const _billDocSig = _examDocUser2?.doctorData?.firma || activeSignature;
    const EXAMENES_DB = [
      // Laboratorio Clínico
      "Hemograma completo (CBC)",
      "Cuadro hemático",
      "Hemograma con diferencial",
      "Hematocrito y hemoglobina",
      "Glicemia en ayunas",
      "Glicemia posprandial",
      "Hemoglobina glicosilada (HbA1c)",
      "Glucosa sérica",
      "Creatinina sérica",
      "BUN (nitrógeno ureico)",
      "Ácido úrico",
      "Urea",
      "Perfil lipídico completo",
      "Colesterol total",
      "Colesterol HDL",
      "Colesterol LDL",
      "Triglicéridos",
      "Pruebas de función hepática",
      "ALT (TGP)",
      "AST (TGO)",
      "Fosfatasa alcalina",
      "Bilirrubinas totales y fraccionadas",
      "TSH (hormona estimulante de tiroides)",
      "T3 libre",
      "T4 libre",
      "Perfil tiroideo",
      "Sodio sérico",
      "Potasio sérico",
      "Cloro sérico",
      "Calcio sérico",
      "Magnesio sérico",
      "Fósforo sérico",
      "Proteína C reactiva (PCR)",
      "PCR ultrasensible",
      "VSG (velocidad de sedimentación globular)",
      "Parcial de orina (uroanálisis)",
      "Urocultivo",
      "Coprocultivo",
      "Coproscópico",
      "Tiempo de protrombina (TP)",
      "Tiempo de tromboplastina (PTT)",
      "INR",
      "Tiempo de sangría",
      "Ferritina",
      "Hierro sérico",
      "Transferrina",
      "Saturación de transferrina",
      "Vitamina B12",
      "Ácido fólico",
      "Vitamina D (25-OH)",
      "Calcio iónico",
      "Parathormona (PTH)",
      "PSA (antígeno prostático)",
      "PSA libre",
      "AFP (alfa fetoproteína)",
      "CEA",
      "CA 19-9",
      "CA 125",
      "VDRL",
      "FTA-ABS",
      "Prueba de VIH (ELISA)",
      "Antígeno de superficie hepatitis B (HBsAg)",
      "Anti-HBs",
      "Anti-HBc total",
      "Anti-VHC",
      "Carga viral VIH",
      "PCR para hepatitis C",
      "Prueba de embarazo (Beta HCG)",
      "FSH",
      "LH",
      "Estradiol",
      "Progesterona",
      "Testosterona total",
      "Prolactina",
      "DHEA-S",
      "Cortisol sérico (8am)",
      "Cortisol en orina 24h",
      "Espermograma",
      "Proteína en orina 24h",
      "Creatinuria en orina 24h",
      // Imagenología
      "Radiografía de tórax PA y lateral",
      "Radiografía columna lumbosacra AP y lateral",
      "Radiografía columna cervical AP y lateral",
      "Radiografía de manos AP bilateral",
      "Radiografía de pelvis AP",
      "Radiografía de rodilla AP y lateral",
      "Radiografía de pies bilateral",
      "Radiografía de cráneo",
      "Radiografía de senos paranasales",
      "Ecografía abdominal total",
      "Ecografía pélvica transabdominal",
      "Ecografía pélvica transvaginal",
      "Ecografía de tiroides",
      "Ecografía de mama bilateral",
      "Ecografía de partes blandas",
      "Ecografía renal y vías urinarias",
      "Ecografía Doppler venoso miembros inferiores",
      "Ecografía Doppler arterial miembros inferiores",
      "Ecografía de cuello",
      "TAC de cráneo simple",
      "TAC de cráneo con contraste",
      "TAC de tórax simple",
      "TAC de tórax con contraste",
      "TAC de abdomen y pelvis con contraste",
      "TAC de columna lumbosacra",
      "TAC de columna cervical",
      "TAC de huesos y articulaciones",
      "Resonancia magnética de cráneo",
      "Resonancia magnética de columna lumbar",
      "Resonancia magnética de columna cervical",
      "Resonancia magnética de rodilla",
      "Resonancia magnética de hombro",
      "Resonancia magnética de cadera",
      "Gamagrafía ósea",
      "Gamagrafía tiroidea",
      "Densitometría ósea (DXA)",
      "Mamografía bilateral",
      "Mamografía digital bilateral",
      // Cardiología / Fisiología
      "Electrocardiograma (ECG) de 12 derivaciones",
      "Electrocardiograma en reposo",
      "Ecocardiograma transtorácico",
      "Ecocardiograma con Doppler",
      "Prueba de esfuerzo (ergometría)",
      "Holter de ritmo 24 horas",
      "Holter de presión arterial (MAPA)",
      "Espirometría simple",
      "Espirometría con broncodilatador",
      "Pleuroscopia",
      "Audiometría",
      "Audiometría tonal",
      "Audiometría de palabras",
      "Impedanciometría",
      "Optometría",
      "Agudeza visual",
      "Tonometría ocular",
      "Campimetría",
      "Electroencefalograma (EEG)",
      "Electromiografía (EMG)",
      "Velocidad de conducción nerviosa",
      // Procedimientos
      "Endoscopia digestiva alta",
      "Colonoscopia",
      "Colonoscopia con toma de biopsia",
      "Gastroscopia",
      "Rectosigmoidoscopia",
      "CPRE (colangiopancreatografía retrógrada)",
      "Culdocentesis",
      "Amniocentesis",
      "Biopsia de piel",
      "Biopsia de ganglio",
      "Biopsia de próstata guiada por ecografía",
      "Biopsia de mama guiada",
      "Punción lumbar",
      "Punción aspiración con aguja fina (PAAF) tiroides",
      "Drenaje de absceso",
      "Curación de herida",
      "Citología cervicouterina (PAP)",
      "Colposcopia",
      "Histeroscopia",
      "Laparoscopia diagnóstica",
      // Medicina Laboral / Ocupacional
      "Espirometría ocupacional",
      "Audiometría ocupacional",
      "Optometría ocupacional",
      "Visiometría",
      "Examen de optometría y visiometría",
      "Perfil de columna ocupacional",
      "Evaluación osteomuscular",
      "Test de Wells",
      "Test de Phalen",
      "Test de Tinel",
      "Valoración de riesgo cardiovascular (Framingham)",
      "Índice tobillo-brazo (ITB)",
      "Glicemia en ayunas (preocupacional)",
      "Perfil lipídico (preocupacional)",
      "Hemograma (preocupacional)",
      "Cuadro hemático (preocupacional)",
      "Hepatitis B antígeno (HBsAg)",
      "Serología completa",
      "Tamizaje VIH",
      // Psicología / Neuropsicología
      "Test de Minnesota (MMPI)",
      "Test de Bender",
      "Test de matrices de Raven",
      "Evaluación neuropsicológica",
      "Evaluación psicológica forense",
      "Test de personalidad",
      "Evaluación de aptitudes laborales",
      "Evaluación de estrés laboral (Bonn)",
      "Evaluación del riesgo psicosocial",
    ];
    // States moved to component level (no hooks in conditionals - React rule)
    const showSuggs = showExamSuggs;
    const setShowSuggs = setShowExamSuggs;
    const suggestions =
      examSearch.length >= 2
        ? EXAMENES_DB.filter((e) =>
            e.toLowerCase().includes(examSearch.toLowerCase())
          ).slice(0, 12)
        : [];
    // ══ B-11: Pruebas prohibidas como requisito laboral - Res. 1843/2025 Art. 10 ══
    const _PRUEBAS_PROHIBIDAS_RES1843 = [
      {
        terminos: [
          "embarazo",
          "gravidez",
          "beta hcg",
          "bhcg",
          "prueba de embarazo",
          "test de embarazo",
          "gestacion",
        ],
        nombre: "Prueba de embarazo",
      },
      {
        terminos: [
          "vih",
          "hiv",
          "sida",
          "aids",
          "prueba de vih",
          "elisa vih",
          "western blot",
        ],
        nombre: "Prueba de VIH/SIDA",
      },
      {
        terminos: [
          "serologia",
          "serológico",
          "vdrl",
          "rpr",
          "sifilis",
          "treponema",
        ],
        nombre: "Prueba serológica (sífilis/treponema)",
      },
    ];
    const _esPruebaProhibida = (nombre) => {
      const n = nombre.toLowerCase();
      return _PRUEBAS_PROHIBIDAS_RES1843.find((p) =>
        p.terminos.some((t) => n.includes(t))
      );
    };
    const addExam = (nombre) => {
      // ── Verificar si es prueba prohibida como requisito laboral ──
      const prohibida = _esPruebaProhibida(nombre);
      const tipoExActual = data?.tipoExamen || "";
      const esEvalOcupacional = ["INGRESO", "PERIODICO", "RETIRO"].includes(
        tipoExActual
      );
      if (prohibida && esEvalOcupacional) {
        // Mostrar advertencia - el médico PUEDE agregarla con justificación clínica
        showPrompt(
          `⚠️ Res. 1843/2025 Art. 10 - PRUEBA RESTRINGIDA\n\n"${prohibida.nombre}" está prohibida como requisito de ingreso o permanencia laboral.\n\nSi hay indicación CLÍNICA justificada, escriba la justificación aquí. De lo contrario, cancele.\n\nJustificación clínica (requerida):`,
          (justificacion) => {
            if (!justificacion || !justificacion.trim()) return; // canceló
            const nuevo = {
              nombre,
              fecha: new Date().toISOString().split("T")[0],
              urgente: false,
              justificacionClin: justificacion.trim(),
              alertaRes1843: true,
            };
            const updated = [...examList, nuevo];
            setExamList(updated);
            setData((p) => ({
              ...p,
              solicitudExamenes: updated,
              justificacionPruebaEspecial:
                (p.justificacionPruebaEspecial
                  ? p.justificacionPruebaEspecial + " | "
                  : "") + `${prohibida.nombre}: ${justificacion.trim()}`,
            }));
            setExamSearch("");
            setShowExamSuggs(false);
          }
        );
        return; // espera confirmación del médico
      }
      // ── Examen sin restricción - agregar normalmente ──
      const nuevo = {
        nombre,
        fecha: new Date().toISOString().split("T")[0],
        urgente: false,
      };
      const updated = [...examList, nuevo];
      setExamList(updated);
      setData((p) => ({ ...p, solicitudExamenes: updated }));
      setExamSearch("");
      setShowExamSuggs(false);
    };
    const addFreeText = () => {
      if (!examSearch.trim()) return;
      addExam(examSearch.trim());
    };
    const removeExam = (i) => {
      const updated = examList.filter((_, j) => j !== i);
      setExamList(updated);
      setData((p) => ({ ...p, solicitudExamenes: updated }));
    };
    const saveLocal = () => {
      setData((p) => ({
        ...p,
        solicitudExamenes: examList,
        solicitudExamenesDiag: diagExamen,
        solicitudExamenesJust: justExamen,
      }));
    };
    // Paquetes de exámenes por grupo/frecuencia
    const EXAM_PACKAGES = [
      {
        id: "ocup_ingreso",
        nombre: "📋 Ingreso Ocupacional",
        frecuencia: "Por evento",
        examenes: [
          "Hemograma completo (CBC)",
          "Glicemia en ayunas",
          "Perfil lipídico completo",
          "Creatinina sérica",
          "Parcial de orina (uroanálisis)",
          "Radiografía de tórax PA y lateral",
          "Electrocardiograma (ECG) de 12 derivaciones",
          "Audiometría ocupacional",
          "Optometría ocupacional",
          "Visiometría",
        ],
      },
      {
        id: "ocup_periodico",
        nombre: "🔄 Periódico Ocupacional",
        frecuencia: "Anual",
        examenes: [
          "Hemograma completo (CBC)",
          "Glicemia en ayunas",
          "Perfil lipídico completo",
          "Creatinina sérica",
          "Parcial de orina (uroanálisis)",
          "Audiometría ocupacional",
          "Optometría ocupacional",
        ],
      },
      {
        id: "alturas",
        nombre: "⛰️ Trabajo en Alturas (Res. 4272/2021)",
        frecuencia: "Anual",
        examenes: [
          "Electrocardiograma (ECG) de 12 derivaciones",
          "Espirometría simple",
          "Audiometría ocupacional",
          "Optometría ocupacional",
          "Glucosa sérica",
          "Hemograma completo (CBC)",
          "Radiografía de tórax PA y lateral",
        ],
      },
      {
        id: "alimentos",
        nombre: "🍽️ Manipulación Alimentos (Res. 2674/2013)",
        frecuencia: "Anual",
        examenes: [
          "Coproscópico",
          "Coprocultivo",
          "VDRL",
          "Parcial de orina (uroanálisis)",
          "Hemograma completo (CBC)",
          "Citología cervicouterina (PAP)",
        ],
      },
      {
        id: "cardiovascular",
        nombre: "❤️ Riesgo Cardiovascular",
        frecuencia: "Semestral",
        examenes: [
          "Perfil lipídico completo",
          "Glicemia en ayunas",
          "Hemoglobina glicosilada (HbA1c)",
          "Electrocardiograma (ECG) de 12 derivaciones",
          "Proteína C reactiva (PCR) ultrasensible",
          "Creatinina sérica",
        ],
      },
      {
        id: "respiratorio",
        nombre: "🫁 Riesgo Respiratorio (SVE)",
        frecuencia: "Anual",
        examenes: [
          "Espirometría simple",
          "Espirometría con broncodilatador",
          "Radiografía de tórax PA y lateral",
          "Hemograma completo (CBC)",
        ],
      },
      {
        id: "osteomuscular",
        nombre: "🦴 Riesgo Osteomuscular (SVE)",
        frecuencia: "Anual",
        examenes: [
          "Radiografía columna lumbosacra AP y lateral",
          "Radiografía columna cervical AP y lateral",
          "Radiografía de manos AP bilateral",
          "Electromiografía (EMG)",
        ],
      },
      {
        id: "ruido",
        nombre: "🔊 Exposición a Ruido (SVE)",
        frecuencia: "Anual",
        examenes: [
          "Audiometría ocupacional",
          "Audiometría tonal",
          "Audiometría de palabras",
          "Impedanciometría",
        ],
      },
      {
        id: "quimico",
        nombre: "⚗️ Riesgo Químico",
        frecuencia: "Anual",
        examenes: [
          "Hemograma completo (CBC)",
          "Pruebas de función hepática",
          "Creatinina sérica",
          "Parcial de orina (uroanálisis)",
          "Plomo en sangre (si exposición)",
        ],
      },
      {
        id: "visual",
        nombre: "👁️ Riesgo Visual",
        frecuencia: "Anual",
        examenes: [
          "Optometría ocupacional",
          "Agudeza visual",
          "Tonometría ocular",
          "Campimetría",
          "Visiometría",
        ],
      },
    ];
    const applyPackage = () => {
      if (!selectedPackage) return;
      const pkg = EXAM_PACKAGES.find((p) => p.id === selectedPackage);
      if (!pkg) return;
      const toAdd = pkg.examenes.filter((e) => packageChecklist[e] !== false); // por defecto todos marcados
      const nuevos = toAdd.map((nombre) => ({
        nombre,
        fecha: new Date().toISOString().split("T")[0],
        urgente: false,
        paquete: pkg.nombre,
      }));
      const updated = [...examList, ...nuevos];
      setExamList(updated);
      setData((p) => ({ ...p, solicitudExamenes: updated }));
      setSelectedPackage(null);
      setPackageChecklist({});
      setShowPackages(false);
    };
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-5">
          <h3 className="text-base font-black text-teal-800 flex items-center gap-2 mb-1">
            🔬 Solicitud de Exámenes y Procedimientos
          </h3>
          <p className="text-xs text-gray-400">
            Busque el examen o escríbalo libremente · Se imprimirá con los datos
            del paciente
          </p>
        </div>
        {/* ── PAQUETES DE EXÁMENES ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black text-indigo-800 uppercase">
              📦 Paquetes por Grupo / Frecuencia
            </p>
            <button
              onClick={() => setShowPackages((v) => !v)}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700"
            >
              {showPackages ? "✕ Cerrar" : "+ Seleccionar Paquete"}
            </button>
          </div>
          {showPackages && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {EXAM_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackage(pkg.id);
                      setPackageChecklist(
                        Object.fromEntries(pkg.examenes.map((e) => [e, true]))
                      );
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      selectedPackage === pkg.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    <p className="font-black text-gray-800">{pkg.nombre}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      🔁 {pkg.frecuencia} · {pkg.examenes.length} exámenes
                    </p>
                  </button>
                ))}
              </div>
              {selectedPackage &&
                (() => {
                  const pkg = EXAM_PACKAGES.find(
                    (p) => p.id === selectedPackage
                  );
                  return (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                      <p className="text-xs font-black text-indigo-800 mb-2">
                        {pkg.nombre} - Seleccione los exámenes a agregar:
                      </p>
                      <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto mb-3">
                        {pkg.examenes.map((ex) => (
                          <label
                            key={ex}
                            className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-white rounded p-1"
                          >
                            <input
                              type="checkbox"
                              checked={packageChecklist[ex] !== false}
                              onChange={(e) =>
                                setPackageChecklist((p) => ({
                                  ...p,
                                  [ex]: e.target.checked,
                                }))
                              }
                              className="accent-indigo-600 w-3.5 h-3.5 flex-shrink-0"
                            />
                            <span className="text-gray-700">{ex}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={applyPackage}
                          className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-lg hover:bg-indigo-700"
                        >
                          ✓ Agregar seleccionados
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPackage(null);
                            setPackageChecklist({});
                          }}
                          className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  );
                })()}
            </div>
          )}
        </div>
        {/* Buscador */}
        <div className="bg-white rounded-2xl shadow-sm border border-teal-200 p-5">
          <label className="block text-xs font-black text-teal-700 uppercase mb-2">
            Buscar o añadir examen / procedimiento
          </label>
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                {/* Buscador CUPS integrado + búsqueda libre */}
                <input
                  value={examSearch}
                  onChange={(e) => {
                    setExamSearch(e.target.value);
                    setShowExamSuggs(true);
                  }}
                  onFocus={() => setShowSuggs(true)}
                  placeholder="Buscar CUPS o examen - Ej: 903001 hemograma, 912701 espirometría, audiometría..."
                  className="w-full p-2.5 border-2 border-teal-200 rounded-xl text-sm focus:border-teal-500 outline-none"
                />
                {showSuggs && suggestions.length > 0 && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-teal-200 rounded-xl shadow-2xl z-50 w-full max-h-52 overflow-y-auto">
                    {/* CUPS matches first */}
                    {_buscarCUPS(examSearch, 5).map((item, i) => (
                      <button
                        key={"cups" + i}
                        type="button"
                        onClick={() => addExam(item.code + " - " + item.desc)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 border-b border-teal-50 last:border-none"
                      >
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: "900",
                            color: "#134e4a",
                            background: "#ccfbf1",
                            padding: "1px 5px",
                            borderRadius: "3px",
                            marginRight: "6px",
                            fontSize: "10px",
                          }}
                        >
                          {item.code}
                        </span>
                        <span className="text-gray-800">{item.desc}</span>
                        <span
                          style={{
                            fontSize: "8px",
                            color: "#0d9488",
                            marginLeft: "4px",
                          }}
                        >
                          ({item.group})
                        </span>
                      </button>
                    ))}
                    {/* Regular exam DB matches */}
                    {suggestions
                      .filter(
                        (s) =>
                          !_buscarCUPS(examSearch, 5).some((c) =>
                            s.includes(c.code)
                          )
                      )
                      .map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => addExam(s)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 border-b border-gray-50 last:border-none font-medium text-gray-800"
                        >
                          🔬 {s}
                        </button>
                      ))}
                    {examSearch.trim() &&
                      !EXAMENES_DB.some(
                        (e) => e.toLowerCase() === examSearch.toLowerCase()
                      ) && (
                        <button
                          type="button"
                          onClick={addFreeText}
                          className="w-full text-left px-3 py-2 text-xs bg-teal-50 text-teal-700 font-black border-t"
                        >
                          ✏️ Agregar "{examSearch}" como texto libre
                        </button>
                      )}
                  </div>
                )}
              </div>
              <button
                onClick={addFreeText}
                className="bg-teal-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-teal-700 whitespace-nowrap"
              >
                + Agregar
              </button>
            </div>
          </div>
          {/* Lista de exámenes agregados */}
          {examList.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase">
                Exámenes solicitados ({examList.length})
              </p>
              {examList.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2"
                >
                  <span className="text-teal-500 font-black text-sm">🔬</span>
                  <span className="flex-1 text-xs font-semibold text-gray-800">
                    {ex.nombre}
                    {ex.alertaRes1843 && (
                      <span className="ml-1 text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1 rounded font-black">
                        ⚠️ Justif. clínica - Res.1843 Art.10
                      </span>
                    )}
                  </span>
                  <label className="flex items-center gap-1 text-[10px] text-red-600 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ex.urgente || false}
                      onChange={(e) => {
                        const u = [...examList];
                        u[i] = { ...u[i], urgente: e.target.checked };
                        setExamList(u);
                        setData((p) => ({ ...p, solicitudExamenes: u }));
                      }}
                      className="accent-red-500"
                    />
                    Urgente
                  </label>
                  <button
                    onClick={() => removeExam(i)}
                    className="text-red-400 hover:text-red-600 font-black text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Diagnóstico y justificación */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
          <div>
            <label className="block text-xs font-black text-gray-600 uppercase mb-1">
              Diagnóstico / Impresión Diagnóstica
            </label>
            <input
              value={diagExamen}
              onChange={(e) => {
                setDiagExamen(e.target.value);
                setData((p) => ({
                  ...p,
                  solicitudExamenesDiag: e.target.value,
                }));
              }}
              placeholder="Ej: Hipertensión arterial esencial (I10), Diabetes tipo 2 (E11)..."
              className="w-full p-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-600 uppercase mb-1">
              Justificación / Motivo del examen
            </label>
            <textarea
              rows={3}
              value={justExamen}
              onChange={(e) => {
                setJustExamen(e.target.value);
                setData((p) => ({
                  ...p,
                  solicitudExamenesJust: e.target.value,
                }));
              }}
              placeholder="Explique el motivo clínico por el cual se solicitan los exámenes..."
              className="w-full p-2.5 border-2 border-gray-200 rounded-xl text-sm resize-none focus:border-blue-400 outline-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                saveLocal();
                showAlert("✅ Solicitud de exámenes guardada correctamente.");
              }}
              className="bg-teal-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-teal-700 flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" /> Guardar solicitud
            </button>
          </div>
        </div>
        {/* Preview de impresión */}
        {examList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-gray-600 uppercase">
                Vista previa del documento imprimible
              </p>
              <button
                onClick={() => {
                  const w = window.open("", "_blank", "width=870,height=1100");
                  if (!w) return;
                  const fd =
                    data.fechaConsulta ||
                    new Date().toLocaleDateString("es-CO");
                  const exHtml = examList
                    .map(
                      (ex, i) =>
                        `<tr style="background:${
                          i % 2 === 0 ? "#f0fdfa" : "white"
                        }"><td style="padding:7px 10px;font-size:9pt;">${
                          i + 1
                        }. ${ex.nombre}${
                          ex.urgente
                            ? ' <b style="color:#dc2626;">(URGENTE)</b>'
                            : ""
                        }</td></tr>`
                    )
                    .join("");
                  const _miIPSExam = currentUser?.empresaId
                    ? companies.find((c) => c.id === currentUser.empresaId) ||
                      null
                    : null;
                  w.document.write(
                    `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Solicitud de Exámenes</title><style>@page{size:letter portrait;margin:1.2cm 1.5cm;}body{font-family:Arial,sans-serif;font-size:9pt;color:#222;}h2{margin:0;font-size:13pt;color:#0d9488;text-transform:uppercase;}table{width:100%;border-collapse:collapse;margin-top:8px;}th{background:#0d9488;color:white;padding:7px 10px;font-size:8.5pt;text-align:left;}td{border-bottom:1px solid #e5e7eb;}p{margin:3px 0;font-size:9pt;}.sig{margin-top:40px;display:flex;justify-content:space-between;}.sig-line{border-top:1.5px solid #222;width:200px;text-align:center;padding-top:4px;font-size:8pt;font-weight:bold;}</style></head><body><div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0d9488;padding-bottom:10px;margin-bottom:14px;">${_ipsDocLeftHtml(
                      _miIPSExam,
                      _billDocData,
                      "#0d9488"
                    )}<div style="text-align:right;"><h2>Solicitud de Exámenes</h2><p>Fecha: ${fd}</p></div></div><div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:4px;padding:10px;margin-bottom:10px;"><p><b>Paciente:</b> ${
                      data.nombres || ""
                    } &nbsp; <b>Doc:</b> ${data.docTipo || "CC"} ${
                      data.docNumero || ""
                    } &nbsp; <b>Edad:</b> ${
                      data.edad || "--"
                    } años &nbsp; <b>EPS:</b> ${data.eps || "--"}</p>${
                      diagExamen
                        ? `<p style="margin-top:4px;"><b>Diagnóstico:</b> ${diagExamen}</p>`
                        : ""
                    }</div><table><thead><tr><th>Examen / Procedimiento Solicitado</th></tr></thead><tbody>${exHtml}</tbody></table>${
                      justExamen
                        ? `<div style="margin-top:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:4px;padding:8px;"><p style="font-weight:bold;font-size:8.5pt;color:#92400e;text-transform:uppercase;margin-bottom:4px;">Justificación clínica:</p><p style="white-space:pre-wrap;">${justExamen}</p></div>`
                        : ""
                    }<div class="sig"><div class="sig-line">Firma Paciente / Responsable</div><div style="text-align:center;"><img src="${
                      _billDocSig || ""
                    }" style="max-height:60px;" onerror="this.style.display='none'"/><div class="sig-line">${
                      _billDocData?.nombre || ""
                    }<br>${
                      _billDocData?.licencia || ""
                    }</div></div></div></body></html>`
                  );
                  w.document.close();
                  w.focus();
                  setTimeout(() => {
                    w.print();
                    w.close();
                  }, 700);
                }}
                className="bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Solicitud
              </button>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-teal-700 text-white px-4 py-2 text-xs font-bold uppercase">
                Exámenes Solicitados - {data.nombres || "Paciente"}
              </div>
              {examList.map((ex, i) => (
                <div
                  key={i}
                  className={`px-4 py-2 text-xs flex items-center gap-2 border-b last:border-none ${
                    i % 2 === 0 ? "bg-white" : "bg-teal-50/30"
                  }`}
                >
                  <span className="text-teal-600 font-black">{i + 1}.</span>
                  <span className="flex-1">{ex.nombre}</span>
                  {ex.urgente && (
                    <span className="text-[10px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded">
                      URGENTE
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  // ─── RENDER: TAB INCAPACIDAD GENERAL ────────────────────────────────────

  // ─────────────────────────────────────────────────────────

  return renderTabSolicitudExamenes();
}
