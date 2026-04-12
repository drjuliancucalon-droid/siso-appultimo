// src/shared/lib/formatters.js

export const numeroALetras = (num) => {
  if (!num) return "";
  const unidades = [
    "",
    "UN",
    "DOS",
    "TRES",
    "CUATRO",
    "CINCO",
    "SEIS",
    "SIETE",
    "OCHO",
    "NUEVE",
  ];
  const diez = [
    "DIEZ",
    "ONCE",
    "DOCE",
    "TRECE",
    "CATORCE",
    "QUINCE",
    "DIECISEIS",
    "DIECISIETE",
    "DIECIOCHO",
    "DIECINUEVE",
  ];
  const decenas = [
    "",
    "DIEZ",
    "VEINTE",
    "TREINTA",
    "CUARENTA",
    "CINCUENTA",
    "SESENTA",
    "SETENTA",
    "OCHENTA",
    "NOVENTA",
  ];
  const centenas = [
    "",
    "CIENTO",
    "DOSCIENTOS",
    "TRESCIENTOS",
    "CUATROCIENTOS",
    "QUINIENTOS",
    "SEISCIENTOS",
    "SETECIENTOS",
    "OCHOCIENTOS",
    "NOVECIENTOS",
  ];
  let n = parseFloat(num);
  if (n === 0) return "CERO";
  let out = "";
  if (n >= 1000000) {
    out +=
      numeroALetras(Math.floor(n / 1000000)) +
      (Math.floor(n / 1000000) === 1 ? " MILLÃ“N " : " MILLONES ");
    n %= 1000000;
  }
  if (n >= 1000) {
    if (Math.floor(n / 1000) === 1) out += "MIL ";
    else out += numeroALetras(Math.floor(n / 1000)) + " MIL ";
    n %= 1000;
  }
  if (n >= 100) {
    if (n === 100) return out + "CIEN";
    out += centenas[Math.floor(n / 100)] + " ";
    n %= 100;
  }
  if (n >= 20) {
    out += decenas[Math.floor(n / 10)];
    n %= 10;
    if (n > 0) out += " Y ";
  } else if (n >= 10) {
    out += diez[n - 10];
    n = 0;
  }
  if (n > 0) out += unidades[n];
  return out.trim();
};
export const analyzeBP = (v) => {
  if (!v || !v.includes("/")) return null;
  const [s, d] = v.split("/").map(Number);
  if (isNaN(s) || isNaN(d)) return null;
  if (s < 90 || d < 60)
    return { text: "HipotensiÃ³n", color: "text-blue-600 bg-blue-100" };
  if (s < 120 && d < 80)
    return { text: "Normotenso", color: "text-green-600 bg-green-100" };
  if (s >= 120 && s <= 129 && d < 80)
    return { text: "Elevada", color: "text-yellow-600 bg-yellow-100" };
  if ((s >= 130 && s <= 139) || (d >= 80 && d <= 89))
    return { text: "HTA Grado 1", color: "text-orange-600 bg-orange-100" };
  if (s >= 140 || d >= 90)
    return { text: "HTA Grado 2", color: "text-red-600 bg-red-100" };
  return null;
};
export const analyzeHR = (v) => {
  const h = parseInt(v);
  if (isNaN(h)) return null;
  if (h < 60)
    return { text: "Bradicardia", color: "text-blue-600 bg-blue-100" };
  if (h <= 100) return { text: "Normal", color: "text-green-600 bg-green-100" };
  return { text: "Taquicardia", color: "text-red-600 bg-red-100" };
};
export const analyzeBMI = (v) => {
  const b = parseFloat(v);
  if (isNaN(b)) return null;
  if (b < 18.5)
    return { text: "Bajo Peso", color: "text-blue-600 bg-blue-100" };
  if (b < 25) return { text: "Normal", color: "text-green-600 bg-green-100" };
  if (b < 30)
    return { text: "Sobrepeso", color: "text-orange-600 bg-orange-100" };
  if (b < 35) return { text: "Obesidad I", color: "text-red-600 bg-red-100" };
  if (b < 40) return { text: "Obesidad II", color: "text-red-700 bg-red-200" };
  return { text: "Obesidad III", color: "text-red-800 bg-red-300" };
};
export const getSpanishDate = (d) => {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  let dt;
  if (d && typeof d === "string" && d.includes("-")) {
    const [y, m, day] = d.split("-").map(Number);
    return `${day} de ${months[m - 1]} de ${y}`;
  }
  dt = d ? new Date(d) : new Date();
  return `${dt.getDate()} de ${months[dt.getMonth()]} de ${dt.getFullYear()}`;
};
export const NORMAL_DESCRIPTIONS_SYSTEMS = {
  cabeza:
    "NormocÃ©falo, sin deformidades, sin masas palpables ni dolor a la palpaciÃ³n.",
  ojos: "Pupilas isocÃ³ricas normorreactivas, conjuntivas rosadas, esclerÃ³ticas blancas, movimientos oculares conservados.",
  oidos:
    "Pabellones auriculares sin lesiones, conductos auditivos permeables, membranas timpÃ¡nicas Ã­ntegras.",
  nariz:
    "Tabique centrado, mucosa hÃºmeda rosada, sin pÃ³lipos ni secreciones patolÃ³gicas, permeabilidad nasal conservada.",
  boca: "Mucosa oral hÃºmeda rosada, orofaringe sin eritema, amÃ­gdalas no hipertrÃ³ficas, denticiÃ³n conservada.",
  cuello:
    "Cuello simÃ©trico, sin adenopatÃ­as palpables, trÃ¡quea centrada, tiroides no palpable, pulsos carotÃ­deos simÃ©tricos.",
  torax:
    "SimÃ©trico, normoexpansible, sin deformidades costales, mamas sin masas palpables.",
  corazon:
    "Ruidos cardÃ­acos rÃ­tmicos, de buena intensidad, sin soplos, no se palpan thrill.",
  pulmones:
    "Murmullo vesicular presente y simÃ©trico bilateralmente, sin agregados pulmonares (no sibilancias, no estertores).",
  abdomen:
    "Blando, depresible, no doloroso a la palpaciÃ³n, sin masas, sin organomegalias, ruidos intestinales presentes.",
  genitourinario:
    "Sin puÃ±o-percusiÃ³n renal positiva, regiÃ³n inguinal sin masas ni hernias palpables.",
  columna:
    "Sin escoliosis, sin cifosis patolÃ³gica, movilidad conservada en todos los planos, no dolor a la palpaciÃ³n de apÃ³fisis espinosas.",
  extremidades:
    "SimÃ©tricas, bien conformadas, sin edemas, pulsos perifÃ©ricos presentes y simÃ©tricos, llenado capilar <2 seg.",
  piel: "Tegumentos de coloraciÃ³n normal, hidratados, sin lesiones activas, sin cicatrices patolÃ³gicas.",
  neurologico:
    "Orientado en tiempo, lugar y persona. Pares craneales sin alteraciones. Fuerza y sensibilidad conservadas, marcha normal, coordinaciÃ³n adecuada.",
};
