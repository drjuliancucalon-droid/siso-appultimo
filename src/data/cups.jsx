// src/data/cups.js - CUPS Salud Ocupacional Colombia
import React, { useState, useRef } from 'react';

const CUPS_OCUPACIONAL = [
  {
    code: "890301",
    desc: "Consulta de primera vez por medicina general",
    group: "Consultas",
  },
  {
    code: "890302",
    desc: "Consulta de primera vez por medicina especializada - salud ocupacional",
    group: "Consultas",
  },
  {
    code: "890401",
    desc: "Consulta de control o seguimiento por medicina general",
    group: "Consultas",
  },
  {
    code: "890403",
    desc: "Consulta de control o seguimiento por medicina del trabajo",
    group: "Consultas",
  },
  {
    code: "890701",
    desc: "Interconsulta por medicina general",
    group: "Consultas",
  },
  {
    code: "890702",
    desc: "Interconsulta por medicina especializada - salud ocupacional",
    group: "Consultas",
  },
  {
    code: "890201",
    desc: "Consulta de urgencias por medicina general",
    group: "Consultas",
  },
  {
    code: "903801",
    desc: "Evaluaci�n m�dica ocupacional de ingreso - Res. 1843/2025",
    group: "Salud Ocupacional",
  },
  {
    code: "903802",
    desc: "Evaluaci�n m�dica ocupacional peri�dica - Res. 1843/2025",
    group: "Salud Ocupacional",
  },
  {
    code: "903803",
    desc: "Evaluaci�n m�dica ocupacional de retiro/egreso",
    group: "Salud Ocupacional",
  },
  {
    code: "903804",
    desc: "Evaluaci�n m�dica post-incapacidad (>=30 d�as) - Res. 1843/2025 Art.9",
    group: "Salud Ocupacional",
  },
  {
    code: "903805",
    desc: "Evaluaci�n m�dica de retorno laboral (>90 d�as no m�dica) - Art.13",
    group: "Salud Ocupacional",
  },
  {
    code: "903806",
    desc: "Evaluaci�n m�dica ocupacional de seguimiento",
    group: "Salud Ocupacional",
  },
  {
    code: "911501",
    desc: "Audiometr�a tonal liminar v�a a�rea y �sea - hipoacusia laboral",
    group: "Audiolog�a",
  },
  {
    code: "911502",
    desc: "Audiometr�a de tamizaje (screening auditivo)",
    group: "Audiolog�a",
  },
  {
    code: "911503",
    desc: "Logoaudiometr�a - discriminaci�n verbal",
    group: "Audiolog�a",
  },
  {
    code: "911504",
    desc: "Potenciales evocados auditivos del tronco cerebral (PEATC)",
    group: "Audiolog�a",
  },
  {
    code: "911601",
    desc: "Otoscop�a - examen del conducto auditivo externo y t�mpano",
    group: "Audiolog�a",
  },
  {
    code: "921601",
    desc: "Examen optom�trico completo - agudeza visual y refracci�n",
    group: "Optometr�a",
  },
  {
    code: "921602",
    desc: "Agudeza visual - tamizaje visual laboral",
    group: "Optometr�a",
  },
  {
    code: "921603",
    desc: "Campimetr�a (campo visual) - trabajo en alturas, conductores",
    group: "Optometr�a",
  },
  {
    code: "921604",
    desc: "Visi�n de colores (Ishihara) - electr�nica y seguridad",
    group: "Optometr�a",
  },
  {
    code: "921701",
    desc: "Tonometr�a ocular - detecci�n glaucoma",
    group: "Optometr�a",
  },
  {
    code: "912701",
    desc: "Espirometr�a simple (CVF, VEF1) - exposici�n laboral a polvos",
    group: "Neumolog�a",
  },
  {
    code: "912702",
    desc: "Espirometr�a con broncodilatador - asma ocupacional",
    group: "Neumolog�a",
  },
  {
    code: "912703",
    desc: "Flujo espiratorio pico (PEF) - monitoreo asma",
    group: "Neumolog�a",
  },
  {
    code: "912704",
    desc: "Oximetr�a de pulso - saturaci�n O2 laboral",
    group: "Neumolog�a",
  },
  {
    code: "891501",
    desc: "Electroencefalograma (EEG) - epilepsia, alturas",
    group: "Neurolog�a",
  },
  {
    code: "891502",
    desc: "Electromiograf�a (EMG) - t�nel del carpo, neuropat�a laboral",
    group: "Neurolog�a",
  },
  {
    code: "891503",
    desc: "Velocidades de conducci�n nerviosa (VCN) - GATISO-MMSS",
    group: "Neurolog�a",
  },
  {
    code: "891504",
    desc: "Potenciales evocados somatosensoriales (PESS)",
    group: "Neurolog�a",
  },
  {
    code: "903001",
    desc: "Hemograma completo con diferencial - cuadro hem�tico",
    group: "Laboratorio",
  },
  {
    code: "903002",
    desc: "Glicemia en ayunas - tamizaje diabetes",
    group: "Laboratorio",
  },
  {
    code: "903003",
    desc: "Hemoglobina glicosilada (HbA1c)",
    group: "Laboratorio",
  },
  {
    code: "903004",
    desc: "Perfil lip�dico completo - colesterol HDL, LDL, triglic�ridos",
    group: "Laboratorio",
  },
  {
    code: "903005",
    desc: "Parcial de orina (uroan�lisis)",
    group: "Laboratorio",
  },
  {
    code: "903006",
    desc: "Creatinina s�rica - funci�n renal",
    group: "Laboratorio",
  },
  {
    code: "903007",
    desc: "Transaminasas ALT/AST - funci�n hep�tica, exposici�n a t�xicos",
    group: "Laboratorio",
  },
  {
    code: "903008",
    desc: "Colinesterasa s�rica - exposici�n a organofosforados",
    group: "Laboratorio",
  },
  {
    code: "903009",
    desc: "Plombemia (plomo en sangre) - exposici�n laboral a plomo",
    group: "Laboratorio",
  },
  {
    code: "903010",
    desc: "Mercurio en orina 24h - exposici�n a mercurio laboral",
    group: "Laboratorio",
  },
  {
    code: "903011",
    desc: "Manganeso en sangre - exposici�n laboral",
    group: "Laboratorio",
  },
  {
    code: "903012",
    desc: "Solventes org�nicos en orina - benceno, tolueno, xileno",
    group: "Laboratorio",
  },
  { code: "903013", desc: "Urocultivo", group: "Laboratorio" },
  {
    code: "903014",
    desc: "Coprosc�pico directo - par�sitos intestinales",
    group: "Laboratorio",
  },
  { code: "903016", desc: "Prote�na C reactiva (PCR)", group: "Laboratorio" },
  {
    code: "903017",
    desc: "VSG (velocidad de sedimentaci�n globular)",
    group: "Laboratorio",
  },
  { code: "903018", desc: "�cido �rico s�rico", group: "Laboratorio" },
  {
    code: "903019",
    desc: "TSH (hormona estimulante de tiroides)",
    group: "Laboratorio",
  },
  { code: "903020", desc: "Vitamina D 25-OH", group: "Laboratorio" },
  {
    code: "903021",
    desc: "Ant�geno de superficie hepatitis B (HBsAg)",
    group: "Laboratorio",
  },
  {
    code: "903022",
    desc: "Anti-HBs - verificaci�n vacuna hepatitis B",
    group: "Laboratorio",
  },
  { code: "903023", desc: "Prueba de VIH (ELISA)", group: "Laboratorio" },
  { code: "903024", desc: "VDRL - s�filis", group: "Laboratorio" },
  {
    code: "870101",
    desc: "Radiograf�a de columna lumbosacra AP y lateral",
    group: "Imagenolog�a",
  },
  {
    code: "870102",
    desc: "Radiograf�a de columna cervical AP y lateral",
    group: "Imagenolog�a",
  },
  {
    code: "870103",
    desc: "Radiograf�a de columna dorsal AP y lateral",
    group: "Imagenolog�a",
  },
  {
    code: "870201",
    desc: "Radiograf�a de manos bilateral AP - t�nel del carpo",
    group: "Imagenolog�a",
  },
  {
    code: "870202",
    desc: "Radiograf�a de mu�ecas bilateral",
    group: "Imagenolog�a",
  },
  {
    code: "870203",
    desc: "Radiograf�a de hombros bilateral",
    group: "Imagenolog�a",
  },
  {
    code: "870204",
    desc: "Radiograf�a de rodillas bilateral",
    group: "Imagenolog�a",
  },
  {
    code: "870205",
    desc: "Radiograf�a de tobillos y pies bilateral",
    group: "Imagenolog�a",
  },
  {
    code: "870301",
    desc: "Ecograf�a de hombro - manguito rotador, tendinitis",
    group: "Imagenolog�a",
  },
  {
    code: "870302",
    desc: "Ecograf�a de columna lumbar - hernia discal",
    group: "Imagenolog�a",
  },
  {
    code: "870303",
    desc: "Ecograf�a de mu�eca - s�ndrome del t�nel del carpo",
    group: "Imagenolog�a",
  },
  {
    code: "870304",
    desc: "Ecograf�a abdominal total - control preventivo",
    group: "Imagenolog�a",
  },
  {
    code: "870401",
    desc: "Resonancia magn�tica (RMN) de columna lumbosacra",
    group: "Imagenolog�a",
  },
  {
    code: "870402",
    desc: "Resonancia magn�tica de columna cervical",
    group: "Imagenolog�a",
  },
  {
    code: "870403",
    desc: "Resonancia magn�tica de hombro",
    group: "Imagenolog�a",
  },
  {
    code: "870501",
    desc: "Tomograf�a computarizada (TAC) de t�rax - neumoconiosis",
    group: "Imagenolog�a",
  },
  {
    code: "870502",
    desc: "Radiograf�a de t�rax PA y lateral - ILO 2011 neumoconiosis",
    group: "Imagenolog�a",
  },
  {
    code: "893001",
    desc: "Electrocardiograma (ECG) 12 derivaciones - riesgo cardiovascular",
    group: "Cardiolog�a",
  },
  {
    code: "893002",
    desc: "Ergometr�a (prueba de esfuerzo) - alturas, conductores",
    group: "Cardiolog�a",
  },
  {
    code: "893003",
    desc: "Ecocardiograma transtor�cico - cardiopat�a hipertensiva",
    group: "Cardiolog�a",
  },
  {
    code: "893004",
    desc: "Holter de 24 horas (ECG ambulatorio) - arritmias",
    group: "Cardiolog�a",
  },
  {
    code: "893005",
    desc: "Monitoreo ambulatorio de presi�n arterial (MAPA 24h)",
    group: "Cardiolog�a",
  },
  {
    code: "950801",
    desc: "Evaluaci�n psicol�gica de ingreso - factores psicosociales",
    group: "Psicolog�a",
  },
  {
    code: "950803",
    desc: "Evaluaci�n factores de riesgo psicosocial - Bater�a MinTrabajo",
    group: "Psicolog�a",
  },
  {
    code: "950804",
    desc: "Test de coordinaci�n visomotora - conductores, operadores maquinaria",
    group: "Psicolog�a",
  },
  {
    code: "950901",
    desc: "Valoraci�n psiqui�trica - trastorno mental laboral",
    group: "Psiquiatr�a",
  },
  {
    code: "951001",
    desc: "Examen toxicol�gico en orina - sustancias psicoactivas",
    group: "Toxicolog�a",
  },
  {
    code: "951002",
    desc: "Alcoholemia (etanol en sangre)",
    group: "Toxicolog�a",
  },
  {
    code: "951003",
    desc: "Metales pesados en sangre - Hg, Pb, Cd, Cr, Mn",
    group: "Toxicolog�a",
  },
  {
    code: "960101",
    desc: "Valoraci�n por fisioterapia - DME, ergonom�a laboral",
    group: "Rehabilitaci�n",
  },
  {
    code: "960102",
    desc: "Terapia f�sica - lesiones osteomusculares laborales",
    group: "Rehabilitaci�n",
  },
  {
    code: "960201",
    desc: "Terapia ocupacional - reintegro laboral",
    group: "Rehabilitaci�n",
  },
];
const _buscarCUPS = (query, maxResults) => {
  const max = maxResults || 10;
  if (!query || query.trim().length < 2) return [];
  const normalize = (s) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const q = normalize(query.trim());
  return CUPS_OCUPACIONAL.filter(
    (item) =>
      normalize(item.code).includes(q) ||
      normalize(item.desc).includes(q) ||
      normalize(item.group).includes(q)
  ).slice(0, max);
};
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
          placeholder || "Buscar CUPS - c�digo o nombre del procedimiento..."
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
            {sugerencias.length} resultado(s) � CUPS Colombia � Res. 2175/2015
            actualizada � MinSalud
          </div>
        </div>
      )}
    </div>
  );
};

export { CUPS_OCUPACIONAL, _buscarCUPS };
export default CUPSInput;
