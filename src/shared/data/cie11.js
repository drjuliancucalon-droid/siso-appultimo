// CIE-11: Clasificación Internacional de Enfermedades 11a Revisión
// OMS CIE-11 (2022) - Res. 1442/2024 Colombia

export const CIE11_EQUIVALENCIAS = [
  {
    cie10: "Z10.0",
    cie11: "QC00",
    desc: "EvaluaciÃ³n mÃ©dica de rutina del trabajador",
  },
  { cie10: "Z57.0", cie11: "QD84", desc: "ExposiciÃ³n ocupacional al ruido" },
  { cie10: "Z57.2", cie11: "QD86", desc: "ExposiciÃ³n ocupacional a polvo" },
  { cie10: "Z57.7", cie11: "QD8B", desc: "ExposiciÃ³n ocupacional a vibraciÃ³n" },
  {
    cie10: "Z73.0",
    cie11: "QD85.0",
    desc: "Agotamiento profesional - Burnout",
  },
  { cie10: "Z73.3", cie11: "QD85", desc: "EstrÃ©s laboral" },
  { cie10: "M54.5", cie11: "ME84.2", desc: "Lumbago no especificado" },
  { cie10: "M54.2", cie11: "ME83.1", desc: "Cervicalgia" },
  { cie10: "M54.4", cie11: "ME84.3", desc: "Lumbago con ciÃ¡tica" },
  {
    cie10: "M51.1",
    cie11: "FA81",
    desc: "Hernia de disco lumbar con radiculopatÃ­a",
  },
  {
    cie10: "M50.1",
    cie11: "FA80",
    desc: "Hernia de disco cervical con radiculopatÃ­a",
  },
  { cie10: "M51.2", cie11: "FA81.1", desc: "Desplazamiento de disco lumbar" },
  { cie10: "M50.2", cie11: "FA80.1", desc: "Desplazamiento de disco cervical" },
  { cie10: "G56.0", cie11: "8C10.0", desc: "SÃ­ndrome del tÃºnel del carpo" },
  { cie10: "G56.2", cie11: "8C10.2", desc: "LesiÃ³n del nervio cubital" },
  {
    cie10: "G54.0",
    cie11: "8C80.0",
    desc: "Trastornos de la raÃ­z nerviosa cervical",
  },
  {
    cie10: "G54.2",
    cie11: "8C80.2",
    desc: "Trastornos de la raÃ­z nerviosa lumbosacra",
  },
  { cie10: "M65.4", cie11: "FB52.1", desc: "Tenosinovitis de De Quervain" },
  {
    cie10: "M65.3",
    cie11: "FB52.2",
    desc: "Dedo en gatillo - tenosinovitis estenosante",
  },
  { cie10: "M75.0", cie11: "FB52.0", desc: "SÃ­ndrome del manguito rotador" },
  {
    cie10: "M75.3",
    cie11: "FB52.3",
    desc: "Tendinitis del hombro - impingement",
  },
  {
    cie10: "M77.1",
    cie11: "FB52.4",
    desc: "Epicondilitis lateral - codo de tenista",
  },
  {
    cie10: "M77.0",
    cie11: "FB52.5",
    desc: "Epicondilitis medial - codo de golfista",
  },
  {
    cie10: "M70.0",
    cie11: "FB52.6",
    desc: "Sinovitis crepitante crÃ³nica de mano y muÃ±eca",
  },
  {
    cie10: "H90.3",
    cie11: "AB52",
    desc: "Hipoacusia neurosensorial bilateral - NIHL",
  },
  { cie10: "H90.0", cie11: "AB51", desc: "Hipoacusia conductiva bilateral" },
  { cie10: "J62.8", cie11: "CA22.00", desc: "Silicosis" },
  { cie10: "J61", cie11: "CA22.1", desc: "Asbestosis" },
  {
    cie10: "J60",
    cie11: "CA22.0",
    desc: "Neumoconiosis de los mineros del carbÃ³n",
  },
  { cie10: "J45.0", cie11: "CA23", desc: "Asma ocupacional alÃ©rgica" },
  { cie10: "J45.1", cie11: "CA23.1", desc: "Asma ocupacional irritativa" },
  {
    cie10: "F43.1",
    cie11: "6B40",
    desc: "Trastorno de estrÃ©s postraumÃ¡tico - TEPT",
  },
  { cie10: "F43.2", cie11: "6B43", desc: "Trastorno de adaptaciÃ³n laboral" },
  { cie10: "F41.1", cie11: "6B00", desc: "Trastorno de ansiedad generalizada" },
  { cie10: "F41.2", cie11: "6B01", desc: "Trastorno mixto ansioso-depresivo" },
  { cie10: "F32.0", cie11: "6A70.0", desc: "Episodio depresivo leve" },
  { cie10: "F32.1", cie11: "6A70.1", desc: "Episodio depresivo moderado" },
  { cie10: "F32.2", cie11: "6A70.2", desc: "Episodio depresivo grave" },
  { cie10: "I10", cie11: "BA00", desc: "HipertensiÃ³n esencial (primaria)" },
  {
    cie10: "I25.1",
    cie11: "BA80",
    desc: "CardiopatÃ­a isquÃ©mica aterosclerÃ³tica",
  },
  { cie10: "E11.9", cie11: "5A11", desc: "Diabetes mellitus tipo 2" },
  { cie10: "E66.0", cie11: "5B81", desc: "Obesidad por exceso de calorÃ­as" },
  { cie10: "E78.0", cie11: "5C80", desc: "Hipercolesterolemia pura" },
  {
    cie10: "L23.5",
    cie11: "EK04.3",
    desc: "Dermatitis alÃ©rgica de contacto por quÃ­micos",
  },
  {
    cie10: "L24.2",
    cie11: "EK05.2",
    desc: "Dermatitis irritativa por disolventes",
  },
  { cie10: "C45.0", cie11: "2C26", desc: "Mesotelioma de pleura - asbestosis" },
  { cie10: "C34.0", cie11: "2C25.0", desc: "CÃ¡ncer de pulmÃ³n laboral" },
  {
    cie10: "C92.0",
    cie11: "2B33.0",
    desc: "Leucemia mieloide aguda - benceno",
  },
  {
    cie10: "T56.0",
    cie11: "NE60",
    desc: "IntoxicaciÃ³n por plomo - saturnismo",
  },
  { cie10: "T56.1", cie11: "NE61", desc: "IntoxicaciÃ³n por mercurio" },
  {
    cie10: "K21.0",
    cie11: "DA22",
    desc: "Enfermedad por reflujo gastroesofÃ¡gico",
  },
  { cie10: "R51", cie11: "MG30.0", desc: "Cefalea tensional" },
  { cie10: "J00", cie11: "CA00", desc: "Rinofaringitis aguda" },
  {
    cie10: "J06.9",
    cie11: "CA0Z",
    desc: "InfecciÃ³n aguda vÃ­as respiratorias superiores",
  },
  { cie10: "N39.0", cie11: "GC08", desc: "InfecciÃ³n de vÃ­as urinarias" },
];

export const _equivalenciaCIE11 = (cie10code) => {
  if (!cie10code) return null;
  const c = cie10code.toUpperCase().split(" ")[0].split("-")[0];
  return (
    CIE11_EQUIVALENCIAS.find((e) => e.cie10 === c || c.startsWith(e.cie10)) ||
    null
  );
};
