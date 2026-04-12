// src/data/cie10.jsx - CIE-10 Diagn�sticos Salud Ocupacional
import React, { useState, useRef } from 'react';

const CIE10_OCUPACIONAL = [
  // Z: FACTORES DE RIESGO OCUPACIONAL
  {
    code: "Z10.0",
    desc: "Examen m�dico ocupacional - evaluaci�n ingreso/peri�dica/retiro",
  },
  { code: "Z10.1", desc: "Examen de salud de las fuerzas armadas" },
  { code: "Z13.1", desc: "Pesquisa especial de diabetes mellitus" },
  {
    code: "Z13.5",
    desc: "Pesquisa especial de trastornos visuales y de la visi�n",
  },
  { code: "Z13.6", desc: "Pesquisa especial de trastornos cardiovasculares" },
  { code: "Z56.0", desc: "Desempleo - problema relacionado con el empleo" },
  { code: "Z56.1", desc: "Cambio de empleo" },
  { code: "Z56.2", desc: "Amenaza de p�rdida del empleo" },
  { code: "Z56.3", desc: "Ritmo de trabajo penoso - carga laboral excesiva" },
  { code: "Z56.4", desc: "Desacuerdo con el jefe y compa�eros de trabajo" },
  {
    code: "Z56.5",
    desc: "Trabajo desagradable - condiciones laborales adversas",
  },
  {
    code: "Z56.6",
    desc: "Otras dificultades f�sicas relacionadas con el trabajo",
  },
  {
    code: "Z56.7",
    desc: "Otros problemas no especificados relacionados con el empleo",
  },
  {
    code: "Z57.0",
    desc: "Exposici�n ocupacional al ruido - hipoacusia laboral",
  },
  {
    code: "Z57.1",
    desc: "Exposici�n ocupacional a radiaci�n ionizante y no ionizante",
  },
  {
    code: "Z57.2",
    desc: "Exposici�n ocupacional al polvo - silicosis, neumoconiosis",
  },
  {
    code: "Z57.3",
    desc: "Exposici�n ocupacional a otros contaminantes del aire",
  },
  {
    code: "Z57.4",
    desc: "Exposici�n ocupacional a agentes t�xicos en agricultura",
  },
  {
    code: "Z57.5",
    desc: "Exposici�n ocupacional a agentes t�xicos en otras industrias",
  },
  { code: "Z57.6", desc: "Exposici�n ocupacional a temperaturas extremas" },
  { code: "Z57.7", desc: "Exposici�n ocupacional a vibraci�n" },
  { code: "Z57.8", desc: "Exposici�n ocupacional a otros factores de riesgo" },
  {
    code: "Z57.9",
    desc: "Exposici�n ocupacional a factor de riesgo no especificado",
  },
  { code: "Z73.0", desc: "S�ndrome de agotamiento - Burnout laboral" },
  { code: "Z73.1", desc: "Acentuaci�n de rasgos de la personalidad" },
  {
    code: "Z73.2",
    desc: "Falta de relajaci�n y descanso - fatiga laboral cr�nica",
  },
  {
    code: "Z73.3",
    desc: "Estr�s no clasificado en otra parte - estr�s laboral",
  },
  {
    code: "Z73.4",
    desc: "Habilidades sociales inadecuadas no clasificadas en otra parte",
  },
  {
    code: "Z73.5",
    desc: "Conflicto de rol - dificultad de conciliaci�n laboral/personal",
  },
  { code: "Z73.6", desc: "Limitaci�n de actividades debida a incapacidad" },
  {
    code: "Z76.5",
    desc: "Persona que simula enfermedad (simulador consciente)",
  },
  { code: "Z77.0", desc: "Contacto y exposici�n a metales y metaloides" },
  {
    code: "Z77.1",
    desc: "Contacto y exposici�n a materiales t�xicos y contaminantes",
  },
  // M: SISTEMA OSTEOMUSCULAR - GATISO-DME, GATISO-TME
  {
    code: "M47.8",
    desc: "Espondiloartrosis cervical - cervicoartrosis laboral",
  },
  { code: "M47.81", desc: "Espondiloartrosis cervical con mielopat�a" },
  { code: "M48.0", desc: "Estenosis espinal cervical o lumbar" },
  { code: "M50.0", desc: "Enfermedad del disco cervical con mielopat�a" },
  {
    code: "M50.1",
    desc: "Enfermedad del disco cervical con radiculopat�a - hernia cervical",
  },
  {
    code: "M50.2",
    desc: "Desplazamiento de disco cervical - hernia sin mielopat�a",
  },
  {
    code: "M51.1",
    desc: "Enfermedad del disco lumbar con radiculopat�a - lumboci�tica laboral",
  },
  {
    code: "M51.2",
    desc: "Desplazamiento de disco lumbar - hernia de disco lumbar",
  },
  { code: "M51.3", desc: "Degeneraci�n del disco intervertebral lumbar" },
  { code: "M54.2", desc: "Cervicalgia - dolor cervical laboral" },
  { code: "M54.3", desc: "Ci�tica - radiculopat�a lumbosacra" },
  { code: "M54.4", desc: "Lumbago con ci�tica" },
  {
    code: "M54.5",
    desc: "Lumbago no especificado - lumbalgia laboral cr�nica",
  },
  { code: "M54.6", desc: "Dolor en columna dorsal" },
  { code: "M60.0", desc: "Miositis infecciosa" },
  { code: "M62.4", desc: "Contractura muscular - espasmo muscular laboral" },
  { code: "M65.0", desc: "Tenosinovitis por absceso" },
  {
    code: "M65.3",
    desc: "Dedo en gatillo - tenosinovitis estenosante digital",
  },
  {
    code: "M65.4",
    desc: "Tenosinovitis de De Quervain - estiloides radial laboral",
  },
  {
    code: "M65.8",
    desc: "Otras sinovitis y tenosinovitis - tendinitis laboral",
  },
  { code: "M65.9", desc: "Sinovitis y tenosinovitis no especificada" },
  {
    code: "M70.0",
    desc: "Sinovitis crepitante cr�nica de mano y mu�eca laboral",
  },
  { code: "M70.1", desc: "Bursitis de mano" },
  { code: "M70.2", desc: "Bursitis olecraniana - trabajo manual prolongado" },
  { code: "M70.3", desc: "Otras bursitis del codo" },
  { code: "M70.4", desc: "Bursitis prepatelar" },
  { code: "M70.5", desc: "Otras bursitis de rodilla - trabajo en cuclillas" },
  {
    code: "M70.6",
    desc: "Bursitis trocant�rica - trabajo en bipedestaci�n prolongada",
  },
  {
    code: "M70.9",
    desc: "Trastorno de tejidos blandos relacionado con el uso, sin especificar",
  },
  {
    code: "M75.0",
    desc: "S�ndrome del manguito rotador - hombro doloroso laboral",
  },
  { code: "M75.1", desc: "S�ndrome del b�ceps - tendinitis bicipital laboral" },
  { code: "M75.2", desc: "Tendinitis calcificante de hombro" },
  { code: "M75.3", desc: "Tendinitis del hombro - s�ndrome de impingement" },
  { code: "M75.4", desc: "S�ndrome de roce del hombro" },
  { code: "M75.5", desc: "Bursitis del hombro laboral" },
  { code: "M75.8", desc: "Otras lesiones del hombro laboral" },
  { code: "M77.0", desc: "Epicondilitis medial - codo de golfista laboral" },
  { code: "M77.1", desc: "Epicondilitis lateral - codo de tenista laboral" },
  { code: "M79.1", desc: "Mialgia - dolor muscular difuso" },
  { code: "M79.2", desc: "Neuralgia y neuritis no especificadas" },
  { code: "M79.3", desc: "Paniculitis - dolor en tejido adiposo" },
  // G: NEUROL�GICOS - GATISO-MMSS
  { code: "G50.0", desc: "Neuralgia del trig�mino parox�stica" },
  {
    code: "G54.0",
    desc: "Trastornos de la ra�z nerviosa cervical - radiculopat�a cervical",
  },
  { code: "G54.1", desc: "Trastornos de la ra�z nerviosa tor�cica" },
  {
    code: "G54.2",
    desc: "Trastornos de la ra�z nerviosa lumbosacra - radiculopat�a lumbar",
  },
  {
    code: "G56.0",
    desc: "S�ndrome del t�nel del carpo - compresi�n nervio mediano laboral",
  },
  { code: "G56.1", desc: "Otras lesiones del nervio mediano laboral" },
  {
    code: "G56.2",
    desc: "Lesi�n del nervio cubital - par�lisis cubital laboral",
  },
  { code: "G56.3", desc: "Lesi�n del nervio radial" },
  {
    code: "G57.1",
    desc: "Meralgia parest�sica - compresi�n nervio femorocut�neo",
  },
  { code: "G57.2", desc: "Lesi�n del nervio femoral" },
  { code: "G57.3", desc: "Lesi�n del nervio ci�tico popl�teo externo" },
  { code: "G57.5", desc: "S�ndrome del t�nel del tarso" },
  {
    code: "G57.6",
    desc: "Lesi�n del nervio plantar - trabajo en bipedestaci�n",
  },
  { code: "G62.2", desc: "Polineuropat�a debida a agentes t�xicos laborales" },
  // F: TRASTORNOS MENTALES - Psicosocial, Res. 2646/2008
  {
    code: "F10.1",
    desc: "Trastornos mentales debidos al alcohol - uso nocivo",
  },
  { code: "F17.1", desc: "Trastornos debidos al tabaco - uso nocivo" },
  { code: "F32.0", desc: "Episodio depresivo leve - laboral" },
  { code: "F32.1", desc: "Episodio depresivo moderado" },
  { code: "F32.2", desc: "Episodio depresivo grave sin s�ntomas psic�ticos" },
  {
    code: "F41.0",
    desc: "Trastorno de p�nico - ansiedad parox�stica epis�dica",
  },
  {
    code: "F41.1",
    desc: "Trastorno de ansiedad generalizada - estr�s laboral",
  },
  {
    code: "F41.2",
    desc: "Trastorno mixto ansioso-depresivo - s�ndrome laboral",
  },
  { code: "F43.0", desc: "Reacci�n aguda al estr�s - accidente laboral" },
  { code: "F43.1", desc: "Trastorno de estr�s postraum�tico - TEPT laboral" },
  { code: "F43.2", desc: "Trastorno de adaptaci�n - cambio laboral" },
  { code: "F48.0", desc: "Neurastenia - agotamiento nervioso laboral" },
  { code: "F51.0", desc: "Insomnio no org�nico - trastorno del sue�o laboral" },
  // H: AUDITIVOS Y VISUALES - Higiene industrial
  {
    code: "H83.3",
    desc: "Efectos del ruido sobre el o�do interno - NIHL laboral",
  },
  { code: "H90.0", desc: "Hipoacusia conductiva bilateral" },
  { code: "H90.3", desc: "Hipoacusia neurosensorial bilateral - laboral" },
  { code: "H90.4", desc: "Hipoacusia neurosensorial unilateral" },
  { code: "H91.0", desc: "Hipoacusia otot�xica - medicamentos y disolventes" },
  {
    code: "H91.9",
    desc: "Hipoacusia no especificada - p�rdida auditiva laboral",
  },
  { code: "H52.1", desc: "Miop�a" },
  { code: "H52.2", desc: "Astigmatismo" },
  { code: "H52.4", desc: "Presbicia - visi�n afectada por edad" },
  {
    code: "H53.1",
    desc: "Alteraciones visuales subjetivas - fatiga visual por pantallas",
  },
  // J: RESPIRATORIOS - Decreto 1477/2014
  { code: "J45.0", desc: "Asma predominantemente al�rgica - asma ocupacional" },
  { code: "J45.1", desc: "Asma no al�rgica - asma irritativa laboral" },
  { code: "J60", desc: "Neumoconiosis de los mineros del carb�n" },
  { code: "J61", desc: "Neumoconiosis debida a amianto - asbestosis" },
  { code: "J62.0", desc: "Neumoconiosis debida al talco - talcosis" },
  {
    code: "J62.8",
    desc: "Neumoconiosis debida a polvos con s�lice - silicosis",
  },
  { code: "J63.0", desc: "Aluminosis pulmonar" },
  { code: "J63.2", desc: "Beriliosis pulmonar" },
  { code: "J63.4", desc: "Siderosis - polvo de hierro y �xidos" },
  { code: "J64", desc: "Neumoconiosis no especificada" },
  { code: "J66.0", desc: "Bisinosis - polvo de algod�n, tabaco, lino" },
  {
    code: "J67.0",
    desc: "Pulm�n del granjero - esporas de actinomicetos term�filos",
  },
  {
    code: "J68.0",
    desc: "Bronquitis y neumonitis por inhalaci�n de gases, humos",
  },
  { code: "J00", desc: "Rinofaringitis aguda (Resfriado com�n)" },
  {
    code: "J06.9",
    desc: "Infecci�n aguda de v�as respiratorias superiores no especificada",
  },
  { code: "J18.9", desc: "Neumon�a no especificada" },
  { code: "J30.4", desc: "Rinitis al�rgica no especificada - rinitis laboral" },
  // I: CARDIOVASCULARES
  { code: "I10", desc: "Hipertensi�n esencial (primaria)" },
  {
    code: "I11.9",
    desc: "Cardiopat�a hipertensiva sin insuficiencia card�aca",
  },
  { code: "I20.0", desc: "Angina de pecho inestable" },
  { code: "I21.0", desc: "Infarto agudo de miocardio de la pared anterior" },
  {
    code: "I25.1",
    desc: "Enfermedad ateroscler�tica del coraz�n - cardiopat�a isqu�mica",
  },
  { code: "I50.0", desc: "Insuficiencia card�aca congestiva" },
  { code: "I63.9", desc: "Infarto cerebral no especificado - ACV isqu�mico" },
  {
    code: "I83.0",
    desc: "V�rices de los miembros inferiores - trabajo prolongado de pie",
  },
  // L: DERMATOL�GICOS - exposici�n ocupacional
  {
    code: "L23.0",
    desc: "Dermatitis al�rgica de contacto debida a metales - n�quel, cromo",
  },
  {
    code: "L23.1",
    desc: "Dermatitis al�rgica de contacto por adhesivos laborales",
  },
  {
    code: "L23.5",
    desc: "Dermatitis al�rgica de contacto por otros productos qu�micos",
  },
  {
    code: "L24.2",
    desc: "Dermatitis irritativa de contacto debida a disolventes",
  },
  { code: "L24.5", desc: "Dermatitis irritativa de contacto debida a plantas" },
  {
    code: "L57.0",
    desc: "Queratosis act�nica - exposici�n solar laboral cr�nica",
  },
  // S/T: ACCIDENTES DE TRABAJO Y LESIONES
  {
    code: "S13.4",
    desc: "Esguince o torcedura de columna cervical - accidente laboral",
  },
  { code: "S22.0", desc: "Fractura de v�rtebra tor�cica" },
  { code: "S32.0", desc: "Fractura de v�rtebra lumbar" },
  { code: "S40.0", desc: "Contusi�n del hombro y del brazo" },
  { code: "S42.0", desc: "Fractura de clav�cula - accidente laboral" },
  { code: "S43.0", desc: "Luxaci�n de articulaci�n del hombro" },
  {
    code: "S52.5",
    desc: "Fractura de extremidad distal del radio - ca�da laboral",
  },
  { code: "S60.0", desc: "Contusi�n del dedo de la mano - trabajo manual" },
  { code: "S72.0", desc: "Fractura del cuello del f�mur" },
  { code: "S80.0", desc: "Contusi�n de rodilla" },
  { code: "S83.0", desc: "Luxaci�n de r�tula" },
  {
    code: "T14.0",
    desc: "Herida de lugar de cuerpo no especificado - laceraci�n laboral",
  },
  {
    code: "T56.0",
    desc: "Efecto t�xico del plomo y sus compuestos - saturnismo laboral",
  },
  {
    code: "T56.1",
    desc: "Efecto t�xico del mercurio - intoxicaci�n por mercurio",
  },
  { code: "T56.2", desc: "Efecto t�xico del manganeso y sus compuestos" },
  { code: "T56.4", desc: "Efecto t�xico del cromo y sus compuestos" },
  { code: "T57.0", desc: "Efecto t�xico del ars�nico y sus compuestos" },
  {
    code: "T65.3",
    desc: "Efecto t�xico de nitroderivados del benceno - laboral",
  },
  // C: C�NCER LABORAL - Decreto 1477/2014
  {
    code: "C34.0",
    desc: "Tumor maligno del bronquio principal - c�ncer de pulm�n laboral",
  },
  {
    code: "C34.1",
    desc: "Tumor maligno del l�bulo superior - exposici�n asbesto/s�lice",
  },
  { code: "C45.0", desc: "Mesotelioma de pleura - asbestosis mesotelial" },
  { code: "C45.1", desc: "Mesotelioma de peritoneo - asbesto" },
  {
    code: "C67.9",
    desc: "Tumor maligno de la vejiga urinaria - aminas arom�ticas",
  },
  {
    code: "C91.0",
    desc: "Leucemia linfobl�stica aguda - exposici�n a benceno",
  },
  {
    code: "C92.0",
    desc: "Leucemia mieloide aguda - benceno, radiaciones ionizantes",
  },
  // MEDICINA GENERAL FRECUENTE
  { code: "A09.9", desc: "Gastroenteritis no especificada" },
  { code: "B02.9", desc: "Herpes z�ster sin complicaciones" },
  { code: "E11.9", desc: "Diabetes mellitus tipo 2 sin complicaciones" },
  { code: "E66.0", desc: "Obesidad debida a exceso de calor�as" },
  { code: "E78.0", desc: "Hipercolesterolemia pura" },
  { code: "E78.5", desc: "Hiperlipidemia no especificada" },
  {
    code: "K21.0",
    desc: "Enfermedad por reflujo gastroesof�gico con esofagitis",
  },
  { code: "K29.7", desc: "Gastritis no especificada" },
  {
    code: "N39.0",
    desc: "Infecci�n de las v�as urinarias, sitio no especificado",
  },
  { code: "R51", desc: "Cefalea - cefalea tensional laboral" },
  {
    code: "R53",
    desc: "Malestar y fatiga - s�ndrome de fatiga cr�nica laboral",
  },
  { code: "R55", desc: "S�ncope y colapso - vagal laboral" },
];
// Buscador CIE-10 con filtrado en tiempo real (insensible a tildes y may�sculas)
const _buscarCIE10 = (query, maxResults) => {
  const max = maxResults || 12;
  if (!query || query.trim().length < 2) return [];
  const normalize = (s) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const q = normalize(query.trim());
  return CIE10_OCUPACIONAL.filter((item) => {
    return normalize(item.code).includes(q) || normalize(item.desc).includes(q);
  }).slice(0, max);
};
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
        placeholder={placeholder || "Buscar CIE-10 - c�digo o descripci�n..."}
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
            {sugerencias.length} resultado(s) � CIE-10 Salud Ocupacional �
            Decreto 1477/2014 � Res. 1843/2025
          </div>
        </div>
      )}
    </div>
  );
};

export { CIE10_OCUPACIONAL, _buscarCIE10 };
export default CIE10Input;
