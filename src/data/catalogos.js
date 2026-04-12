// src/data/catalogos.js - Cat�logos est�ticos OcupaSalud

const ARL_LIST = [
  "ARL SURA",
  "POSITIVA COMPA��A DE SEGUROS",
  "AXA COLPATRIA",
  "SEGUROS BOL�VAR",
  "COLMENA SEGUROS",
  "LA EQUIDAD SEGUROS",
  "MAPFRE SEGUROS",
  "LIBERTY SEGUROS",
  "ALFA SEGUROS",
];
const AFP_LIST = [
  "COLPENSIONES",
  "PORVENIR",
  "PROTECCI�N",
  "COLFONDOS",
  "SKANDIA",
];
const EPS_LIST = [
  "SURA",
  "SANITAS",
  "NUEVA EPS",
  "SALUD TOTAL",
  "COMPENSAR",
  "COOSALUD",
  "ALIANSALUD",
  "FAMISANAR",
  "MUTUAL SER",
  "CAJACOPI",
  "ASMET SALUD",
  "CAPITAL SALUD",
  "SAVIA SALUD",
].sort();
const CONTRATO_LIST = [
  "T�rmino Indefinido",
  "T�rmino Fijo",
  "Obra o Labor",
  "Prestaci�n de Servicios",
  "Aprendizaje",
  "Ocasional o Transitorio",
];
const TURNO_LIST = ["Diurno", "Nocturno", "Mixto", "Rotativo"];
const ETNIA_LIST = [
  "Mestizo",
  "Afrocolombiano",
  "Ind�gena",
  "Raizal",
  "Palenquero",
  "Gitano / Rrom",
  "Ninguno",
];
const SPECIALTIES_LIST = [
  "Alergolog�a",
  "Anestesiolog�a",
  "Angiolog�a y Cirug�a Vascular",
  "Audiolog�a",
  "Cardiolog�a",
  "Cardiolog�a Pedi�trica",
  "Cirug�a Bari�trica",
  "Cirug�a Cardiovascular",
  "Cirug�a de Cabeza y Cuello",
  "Cirug�a de Columna",
  "Cirug�a de Mano",
  "Cirug�a de Mama y Tejidos Blandos",
  "Cirug�a de T�rax",
  "Cirug�a General",
  "Cirug�a Hepatobiliar",
  "Cirug�a Maxilofacial",
  "Cirug�a Pedi�trica",
  "Cirug�a Pl�stica y Reconstructiva",
  "Coloproctolog�a",
  "Cuidado Paliativo",
  "Cuidados Intensivos",
  "Dermatolog�a",
  "Dolor y Cuidados Paliativos",
  "Electrofisiolog�a Card�aca",
  "Endocrinolog�a",
  "Endocrinolog�a Pedi�trica",
  "Enfermer�a Profesional",
  "Epidemiolog�a",
  "Fisiatr�a (Medicina F�sica y Rehabilitaci�n)",
  "Fisioterapia",
  "Fonoaudiolog�a",
  "Gastroenterolog�a",
  "Gastroenterolog�a Pedi�trica",
  "Gen�tica M�dica",
  "Geriatr�a",
  "Ginecolog�a y Obstetricia",
  "Ginecolog�a Oncol�gica",
  "Hematolog�a",
  "Hematolog�a Pedi�trica",
  "Hepatolog�a",
  "Infectolog�a",
  "Infectolog�a Pedi�trica",
  "Inmunolog�a Cl�nica",
  "Mastolog�a",
  "Medicina Alternativa y Complementaria",
  "Medicina de Emergencias",
  "Medicina del Deporte",
  "Medicina del Dolor",
  "Medicina del Trabajo y Salud Ocupacional",
  "Medicina Est�tica",
  "Medicina Familiar",
  "Medicina Forense",
  "Medicina General",
  "Medicina Interna",
  "Medicina Nuclear",
  "Medicina Preventiva y Salud P�blica",
  "Nefrolog�a",
  "Nefrolog�a Pedi�trica",
  "Neonatolog�a",
  "Neumolog�a",
  "Neumolog�a Pedi�trica",
  "Neurocirug�a",
  "Neurofisiolog�a Cl�nica",
  "Neurolog�a",
  "Neurolog�a Pedi�trica",
  "Neuropediatr�a",
  "Neuropsicolog�a",
  "Neuropsiquiatr�a",
  "Neurorradiolog�a",
  "Nutrici�n y Diet�tica",
  "Obstetricia de Alto Riesgo",
  "Odontolog�a General",
  "Oftalmolog�a",
  "Oftalmolog�a Pedi�trica",
  "Oncolog�a",
  "Oncolog�a Pedi�trica",
  "Oncolog�a Radioter�pica",
  "Optometr�a",
  "Ortodoncia",
  "Ortopedia y Traumatolog�a",
  "Ortopedia Pedi�trica",
  "Otolog�a y Neurotolog�a",
  "Otorrinolaringolog�a",
  "Patolog�a",
  "Patolog�a Cl�nica (Laboratorio)",
  "Pediatr�a",
  "Perinatolog�a",
  "Periodoncia",
  "Podolog�a",
  "Psicolog�a Cl�nica",
  "Psicolog�a Ocupacional",
  "Psiquiatr�a",
  "Psiquiatr�a Infantil y del Adolescente",
  "Radiolog�a e Im�genes Diagn�sticas",
  "Radiolog�a Intervencionista",
  "Rehabilitaci�n Card�aca",
  "Rehabilitaci�n Neurol�gica",
  "Rehabilitaci�n Oral",
  "Rehabilitaci�n Pulmonar",
  "Reumatolog�a",
  "Reumatolog�a Pedi�trica",
  "Salud Mental Comunitaria",
  "Salud Ocupacional",
  "Terapia Ocupacional",
  "Terapia Respiratoria",
  "Toxicolog�a Cl�nica",
  "Traumatolog�a Deportiva",
  "Urolog�a",
  "Urolog�a Pedi�trica",
  "Vascular Perif�rico",
].sort();

const DERIVACIONES_CATALOG = [
  {
    id: "d_med_trab",
    esp: "Medicina del Trabajo",
    motivo:
      "Valoraci�n de aptitud laboral, restricciones, seguimiento ocupacional",
    tipo: "Ocupacional",
  },
  {
    id: "d_fisiat",
    esp: "Fisiatr�a y Rehabilitaci�n",
    motivo:
      "Rehabilitaci�n funcional, valoraci�n incapacidad, prescripci�n ortesis",
    tipo: "Rehabilitaci�n",
  },
  {
    id: "d_fisio",
    esp: "Fisioterapia",
    motivo: "Rehabilitaci�n m�sculoesquel�tica, manejo del dolor, movilidad",
    tipo: "Rehabilitaci�n",
  },
  {
    id: "d_orto",
    esp: "Ortopedia y Traumatolog�a",
    motivo: "Patolog�a osteoarticular, fracturas, cirug�a ortop�dica",
    tipo: "Quir�rgica",
  },
  {
    id: "d_neuro",
    esp: "Neurolog�a",
    motivo: "Cefalea cr�nica, convulsiones, neuropat�as perif�ricas, mareo",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_cardio",
    esp: "Cardiolog�a",
    motivo:
      "HTA no controlada, arritmias, dolor tor�cico, valoraci�n cardiovascular",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_neumo",
    esp: "Neumolog�a",
    motivo:
      "EPOC, asma grave, patolog�a respiratoria ocupacional, espirometr�a",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_gastro",
    esp: "Gastroenterolog�a",
    motivo: "Patolog�a digestiva cr�nica, endoscopia, hepatopat�a",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_psiq",
    esp: "Psiquiatr�a",
    motivo:
      "Trastorno mental, depresi�n severa, ansiedad, estr�s laboral cr�nico",
    tipo: "Salud mental",
  },
  {
    id: "d_psico",
    esp: "Psicolog�a Cl�nica",
    motivo: "Apoyo emocional, factores de riesgo psicosocial, burnout",
    tipo: "Salud mental",
  },
  {
    id: "d_oftal",
    esp: "Oftalmolog�a",
    motivo: "Agudeza visual disminuida, patolog�a ocular, adaptaci�n lentes",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_orl",
    esp: "Otorrinolaringolog�a",
    motivo: "Hipoacusia, ac�fenos, v�rtigo, patolog�a ORL",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_derm",
    esp: "Dermatolog�a",
    motivo:
      "Dermatosis ocupacional, lesiones cut�neas activas, alergias d�rmicas",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_endo",
    esp: "Endocrinolog�a",
    motivo:
      "DM descompensada, hipotiroidismo, obesidad severa, s�ndrome metab�lico",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_nefro",
    esp: "Nefrolog�a",
    motivo: "IRC, proteinuria, HTA nefrog�nica, alteraci�n funci�n renal",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_reuma",
    esp: "Reumatolog�a",
    motivo: "Artritis, lupus, espondiloartritis, enfermedades autoinmunes",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_nutri",
    esp: "Nutrici�n y Diet�tica",
    motivo: "Obesidad, DM2, dislipidemia, plan nutricional terap�utico",
    tipo: "Apoyo diagn�stico",
  },
  {
    id: "d_optom",
    esp: "Optometr�a",
    motivo: "Agudeza visual, adaptaci�n de lentes correctivos, pantallas",
    tipo: "Apoyo diagn�stico",
  },
  {
    id: "d_audio",
    esp: "Audiolog�a",
    motivo: "Hipoacusia ocupacional, audiometr�a tonal, adaptaci�n aud�fonos",
    tipo: "Apoyo diagn�stico",
  },
  {
    id: "d_cirgen",
    esp: "Cirug�a General",
    motivo: "Hernias, patolog�a abdominal, procedimientos quir�rgicos menores",
    tipo: "Quir�rgica",
  },
  {
    id: "d_gineco",
    esp: "Ginecolog�a y Obstetricia",
    motivo: "Control prenatal, patolog�a ginecol�gica, restricciones embarazo",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_urol",
    esp: "Urolog�a",
    motivo:
      "Patolog�a prost�tica, litiasis renal, infecciones urinarias recurrentes",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_hemato",
    esp: "Hematolog�a",
    motivo: "Anemia cr�nica, trombocitopenia, coagulopat�as",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_oncol",
    esp: "Oncolog�a",
    motivo: "Sospecha o seguimiento de neoplasias",
    tipo: "Especialidad m�dica",
  },
  {
    id: "d_trab_soc",
    esp: "Trabajo Social",
    motivo: "Gesti�n de beneficios, calificaci�n PCL, seguimiento social",
    tipo: "Apoyo social",
  },
  {
    id: "d_medlab",
    esp: "Medicina Laboral / ARL",
    motivo: "Calificaci�n origen enfermedad, PCL, reincorporaci�n laboral",
    tipo: "Ocupacional",
  },
  {
    id: "d_urgencias",
    esp: "Urgencias / Hospitalizaci�n",
    motivo: "Remisi�n urgente a nivel hospitalario",
    tipo: "Urgente",
  },
];

const RESTRICCIONES_CATALOG = {
  miembroSuperior: {
    label: "Miembro Superior",
    icon: "??",
    color: "blue",
    items: [
      {
        id: "ms_01",
        texto:
          "No cargar, halar o empujar objetos con peso superior a 5 kg con miembro superior afectado",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "ms_02",
        texto:
          "No realizar movimientos repetitivos de mu�eca/mano (>30 ciclos/min) con miembro afectado",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "ms_03",
        texto:
          "No mantener postura est�tica de hombro en elevaci�n superior a 60� por m�s de 2 horas continuas",
        normativa: "GTC-45 2012",
      },
      {
        id: "ms_04",
        texto:
          "No uso de herramientas vibr�tiles (martillos, pulidoras, taladros) con miembro afectado",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "ms_05",
        texto:
          "Rotaci�n de actividades cada 45 minutos para tareas manuales repetitivas",
        normativa: "Res. 1843/2025",
      },
      {
        id: "ms_06",
        texto:
          "No realizar pinza digital fina o prensi�n de fuerza sostenida por m�s de 15 minutos continuos",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "ms_07",
        texto:
          "Uso obligatorio de f�rula o soporte ortop�dico durante jornada laboral en actividades de alto riesgo",
        normativa: "Res. 0312/2019",
      },
    ],
  },
  columnaLumbar: {
    label: "Columna Lumbar",
    icon: "??",
    color: "orange",
    items: [
      {
        id: "cl_01",
        texto:
          "No levantamiento manual de cargas superiores a 12.5 kg (mujeres) / 25 kg (hombres)",
        normativa: "NTC-4241 / NIOSH",
      },
      {
        id: "cl_02",
        texto:
          "No permanecer en posici�n de pie est�tica por m�s de 2 horas continuas sin descanso postural",
        normativa: "GTC-45 2012",
      },
      {
        id: "cl_03",
        texto:
          "No permanecer en posici�n sedente por m�s de 1 hora continua sin cambio postural",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cl_04",
        texto: "No realizar flexi�n de tronco mayor a 45� con o sin carga",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cl_05",
        texto:
          "No realizar movimientos de torsi�n de columna lumbar bajo carga",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cl_06",
        texto:
          "Uso obligatorio de cintur�n lumbar en tareas de carga/descarga durante per�odo de restricci�n",
        normativa: "Res. 0312/2019",
      },
      {
        id: "cl_07",
        texto:
          "Adaptar puesto de trabajo con silla ergon�mica con soporte lumbar y reposapi�s si aplica",
        normativa: "Res. 2400/1979 Art. 381",
      },
    ],
  },
  columnaCervical: {
    label: "Columna Cervical",
    icon: "??",
    color: "purple",
    items: [
      {
        id: "cc_01",
        texto:
          "No mantener postura de flexi�n cervical mayor a 20� por m�s de 2 horas continuas (uso de pantallas/microscopia)",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cc_02",
        texto:
          "No realizar tareas con el cuello en rotaci�n m�xima sostenida por m�s de 30 minutos",
        normativa: "GTC-45 2012",
      },
      {
        id: "cc_03",
        texto:
          "Pantalla de computador a nivel de los ojos, distancia m�nima 50 cm",
        normativa: "Res. 2400/1979",
      },
      {
        id: "cc_04",
        texto:
          "No cargar objetos sobre cabeza o hombros con peso superior a 3 kg",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cc_05",
        texto:
          "Pausas activas cervicales obligatorias cada 45 minutos en tareas de trabajo visual prolongado",
        normativa: "Res. 0312/2019",
      },
    ],
  },
  columnaDorsal: {
    label: "Columna Dorsal",
    icon: "??",
    color: "teal",
    items: [
      {
        id: "cd_01",
        texto:
          "No permanecer en sedestaci�n prolongada sin soporte dorsal adecuado (>1 hora continua)",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cd_02",
        texto:
          "No realizar actividades que impliquen elevaci�n de brazos por encima de los hombros de forma repetitiva",
        normativa: "GTC-45 2012",
      },
      {
        id: "cd_03",
        texto:
          "Silla con respaldo que cubra toda la zona dorsal (v�rtebras T1-T12)",
        normativa: "Res. 2400/1979",
      },
      {
        id: "cd_04",
        texto:
          "No exposici�n a vibraci�n de cuerpo entero (manejo de veh�culos pesados, maquinaria) sin estudio de impacto",
        normativa: "GTC-45 2012",
      },
    ],
  },
  miembroInferior: {
    label: "Miembro Inferior",
    icon: "??",
    color: "green",
    items: [
      {
        id: "mi_01",
        texto:
          "No permanecer en bipedestaci�n est�tica por m�s de 2 horas continuas",
        normativa: "GTC-45 2012",
      },
      {
        id: "mi_02",
        texto:
          "No subir o bajar escaleras de forma repetitiva (>30 ascensos/d�a) en per�odo de restricci�n",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "mi_03",
        texto:
          "No trabajo en superficies irregulares o resbaladizas sin calzado de seguridad con soporte de tobillo",
        normativa: "Res. 2400/1979",
      },
      {
        id: "mi_04",
        texto:
          "Calzado ergon�mico con soporte plantar y tac�n m�ximo 3 cm durante jornada laboral",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "mi_05",
        texto:
          "No conducci�n de veh�culos pesados o maquinaria durante per�odo de restricci�n",
        normativa: "Res. 4100/2004",
      },
    ],
  },
  cardiovascular: {
    label: "Cardiovascular / Metab�lico",
    icon: "??",
    color: "red",
    items: [
      {
        id: "cv_01",
        texto:
          "No realizar actividades de alta demanda cardiovascular sin evaluaci�n cardiol�gica previa (FC >85% FCM)",
        normativa: "Res. 1843/2025",
      },
      {
        id: "cv_02",
        texto:
          "No trabajo en alturas hasta control y estabilizaci�n de cifras tensionales (TA >140/90 mmHg)",
        normativa: "Res. 4272/2021",
      },
      {
        id: "cv_03",
        texto:
          "Control m�dico peri�dico mensual de cifras tensionales mientras dure la restricci�n",
        normativa: "Res. 1843/2025",
      },
      {
        id: "cv_04",
        texto:
          "No exposici�n a temperaturas extremas (calor >35�C / fr�o <10�C) sin protecci�n individual adecuada",
        normativa: "GTC-45 2012",
      },
      {
        id: "cv_05",
        texto:
          "Plan de alimentaci�n supervisado: restricci�n de sodio, grasas saturadas y az�cares simples en jornada laboral",
        normativa: "Res. 1843/2025",
      },
      {
        id: "cv_06",
        texto:
          "No trabajos en jornadas nocturnas prolongadas (>8 h/noche) sin rotaci�n semestral supervisada",
        normativa: "Dec. 1072/2015",
      },
    ],
  },
  respiratorio: {
    label: "Respiratorio / Pulmonar",
    icon: "??",
    color: "sky",
    items: [
      {
        id: "re_01",
        texto:
          "No exposici�n a polvos org�nicos/inorg�nicos sin uso de respirador N95 o superior certificado",
        normativa: "Res. 0773/2021",
      },
      {
        id: "re_02",
        texto:
          "No exposici�n a humos de soldadura, gases de escape o vapores qu�micos sin ventilaci�n localizada extracci�n",
        normativa: "GTC-45 2012",
      },
      {
        id: "re_03",
        texto:
          "Espirometr�a de control semestral mientras persistan factores de riesgo respiratorio",
        normativa: "GATISO-ND 2012",
      },
      {
        id: "re_04",
        texto:
          "No trabajo en espacios confinados hasta nueva evaluaci�n neumol�gica con resultado apto",
        normativa: "Res. 0491/2020",
      },
      {
        id: "re_05",
        texto:
          "No exposici�n a agentes sensibilizantes respiratorios (l�tex, isocianatos, harinas) sin EPP certificado",
        normativa: "GTC-45 2012",
      },
    ],
  },
  neurologico: {
    label: "Neurol�gico / Psiqui�trico",
    icon: "??",
    color: "violet",
    items: [
      {
        id: "ne_01",
        texto:
          "No operaci�n de maquinaria peligrosa, veh�culos o equipos el�ctricos de alta tensi�n hasta concepto neurol�gico",
        normativa: "Res. 1843/2025",
      },
      {
        id: "ne_02",
        texto:
          "No trabajo en alturas hasta nueva evaluaci�n m�dica con concepto apto (Res. 4272/2021)",
        normativa: "Res. 4272/2021",
      },
      {
        id: "ne_03",
        texto:
          "No exposici�n a solventes neurot�xicos (benceno, tolueno, xileno) sin ventilaci�n y EPP certificado",
        normativa: "GTC-45 2012",
      },
      {
        id: "ne_04",
        texto:
          "Jornada laboral m�xima de 8 horas/d�a, sin horas extras durante per�odo de tratamiento psiqui�trico activo",
        normativa: "Dec. 1072/2015",
      },
      {
        id: "ne_05",
        texto:
          "No trabajo en turno nocturno rotativo durante per�odo de tratamiento de trastorno de sue�o o ansiedad severa",
        normativa: "Res. 1843/2025",
      },
      {
        id: "ne_06",
        texto:
          "Seguimiento psicol�gico laboral mensual y reporte a m�dico SST de evoluci�n cl�nica",
        normativa: "Res. 2404/2019",
      },
    ],
  },
  exposicionToxicos: {
    label: "Exposici�n a T�xicos / Qu�micos",
    icon: "??",
    color: "yellow",
    items: [
      {
        id: "et_01",
        texto:
          "No manipulaci�n directa de plaguicidas organofosforados sin equipo de protecci�n personal completo (nivel C)",
        normativa: "Res. 0031/1995",
      },
      {
        id: "et_02",
        texto:
          "No exposici�n a metales pesados (plomo, mercurio, cadmio) sin niveles biol�gicos de monitoreo vigentes",
        normativa: "GTC-45 2012",
      },
      {
        id: "et_03",
        texto:
          "Perfil toxicol�gico (colinesterasa/metales) semestral obligatorio mientras persista exposici�n",
        normativa: "Res. 1843/2025",
      },
      {
        id: "et_04",
        texto:
          "No ingesta de alimentos ni bebidas en �reas de manejo de sustancias qu�micas",
        normativa: "Res. 2400/1979",
      },
      {
        id: "et_05",
        texto:
          "Ducha de emergencia y lavaojos funcionales en �rea de trabajo como requisito para laborar con qu�micos corrosivos",
        normativa: "Res. 2400/1979",
      },
    ],
  },
  visual: {
    label: "Visual / Auditivo",
    icon: "???",
    color: "indigo",
    items: [
      {
        id: "va_01",
        texto:
          "Uso obligatorio de correcci�n �ptica (gafas con prescripci�n) durante jornada laboral en tareas de precisi�n visual",
        normativa: "Res. 2400/1979",
      },
      {
        id: "va_02",
        texto:
          "No trabajo en conducci�n nocturna de veh�culos con agudeza visual corregida inferior a 20/40",
        normativa: "Res. 4100/2004",
      },
      {
        id: "va_03",
        texto:
          "No exposici�n a radiaci�n UV/IR sin protecci�n ocular certificada (ANSI Z87.1)",
        normativa: "GTC-45 2012",
      },
      {
        id: "va_04",
        texto:
          "No exposici�n a ruido >80 dB sin uso de protecci�n auditiva de doble v�a (tap�n + orejera)",
        normativa: "Res. 1792/1990",
      },
      {
        id: "va_05",
        texto:
          "Audiometr�a de control semestral con exposici�n a ruido ocupacional =85 dB",
        normativa: "Res. 8321/1983",
      },
    ],
  },
  alturas: {
    label: "Trabajo en Alturas",
    icon: "???",
    color: "amber",
    items: [
      {
        id: "al_01",
        texto:
          "NO APTO para trabajo en alturas =1.5 metros hasta nueva evaluaci�n m�dica con concepto espec�fico",
        normativa: "Res. 4272/2021",
      },
      {
        id: "al_02",
        texto:
          "Requiere evaluaci�n especializada (neurolog�a/otorrinolaringolog�a) antes de autorizar trabajo en alturas",
        normativa: "Res. 4272/2021 Art. 10",
      },
      {
        id: "al_03",
        texto:
          "No trabajo en alturas con medicaci�n que produzca somnolencia, mareo o alteraci�n del equilibrio",
        normativa: "Res. 4272/2021",
      },
      {
        id: "al_04",
        texto:
          "Uso obligatorio de arn�s de cuerpo completo certificado y l�nea de vida en toda tarea >1.5 m",
        normativa: "Res. 4272/2021",
      },
      {
        id: "al_05",
        texto:
          "Acompa�amiento permanente de vig�a certificado en trabajo en alturas durante per�odo de restricci�n parcial",
        normativa: "Res. 4272/2021 Art. 14",
      },
    ],
  },
  dermatologico: {
    label: "Dermatol�gico",
    icon: "??",
    color: "rose",
    items: [
      {
        id: "de_01",
        texto:
          "No contacto directo con agentes irritantes/sensibilizantes cut�neos sin guantes de nitrilo/neopreno certificados",
        normativa: "GTC-45 2012",
      },
      {
        id: "de_02",
        texto:
          "No exposici�n solar directa sin protector solar SPF 50+ durante jornadas extramurales",
        normativa: "Res. 1843/2025",
      },
      {
        id: "de_03",
        texto:
          "No manipulaci�n de alimentos hasta resoluci�n completa de lesi�n cut�nea activa en manos",
        normativa: "Res. 2674/2013",
      },
      {
        id: "de_04",
        texto:
          "Control dermatol�gico mensual mientras persistan lesiones laborales activas",
        normativa: "Res. 1843/2025",
      },
    ],
  },
};

const RECOMENDACIONES_CATALOG = {
  generales: {
    label: "Recomendaciones Generales de Salud",
    icon: "??",
    color: "emerald",
    items: [
      {
        id: "rg_01",
        texto:
          "Actividad f�sica aer�bica moderada m�nimo 150 minutos/semana (caminar, nadar, ciclismo)",
      },
      {
        id: "rg_02",
        texto:
          "Alimentaci�n balanceada: reducir ultraprocesados, az�cares y grasas saturadas. Aumentar frutas, verduras y prote�na magra",
      },
      {
        id: "rg_03",
        texto:
          "Control m�dico anual con laboratorios de seguimiento (glicemia, perfil lip�dico, hemograma)",
      },
      {
        id: "rg_04",
        texto:
          "Mantener �ndice de masa corporal entre 18.5 y 24.9 kg/m� mediante dieta y ejercicio supervisado",
      },
      {
        id: "rg_05",
        texto:
          "Hidrataci�n adecuada: m�nimo 2 litros de agua/d�a, aumentar en jornadas con exposici�n a calor",
      },
      {
        id: "rg_06",
        texto:
          "Higiene del sue�o: dormir entre 7-8 horas/noche en ambiente oscuro y silencioso",
      },
      {
        id: "rg_07",
        texto:
          "Cesaci�n tab�quica inmediata; se recomienda programa de apoyo psicol�gico y/o farmacol�gico",
      },
      {
        id: "rg_08",
        texto:
          "Moderaci�n en consumo de alcohol: m�ximo 1 unidad/d�a (mujeres) / 2 unidades/d�a (hombres)",
      },
    ],
  },
  laborales: {
    label: "Recomendaciones Laborales / Ergon�micas",
    icon: "??",
    color: "blue",
    items: [
      {
        id: "rl_01",
        texto:
          "Realizar pausas activas cada 45-60 minutos de trabajo continuo: 5 minutos de estiramiento y movimiento articular",
      },
      {
        id: "rl_02",
        texto:
          "Ajustar altura de escritorio/banco de trabajo: codos a 90�, pantalla a nivel de los ojos",
      },
      {
        id: "rl_03",
        texto:
          "Uso de silla ergon�mica con soporte lumbar ajustable, altura regulable y apoyabrazos",
      },
      {
        id: "rl_04",
        texto:
          "T�cnica correcta de levantamiento de cargas: doblar rodillas, mantener espalda recta, carga pegada al cuerpo",
      },
      {
        id: "rl_05",
        texto:
          "Rotaci�n de actividades laborales para evitar exposici�n continua a un solo factor de riesgo ergon�mico",
      },
      {
        id: "rl_06",
        texto:
          "Uso obligatorio de calzado de seguridad con soporte plantar en �reas de carga y descarga",
      },
      {
        id: "rl_07",
        texto:
          "Adaptar horario laboral para evitar trabajo en jornadas mayores a 10 horas diarias",
      },
      {
        id: "rl_08",
        texto:
          "Participar activamente en el programa de pausas activas implementado por la empresa",
      },
    ],
  },
  seguimiento: {
    label: "Seguimiento M�dico y Control",
    icon: "??",
    color: "purple",
    items: [
      {
        id: "rs_01",
        texto:
          "Control m�dico ocupacional semestral durante los pr�ximos 2 a�os",
      },
      {
        id: "rs_02",
        texto:
          "Consulta con m�dico general/especialista en las pr�ximas 4 semanas para manejo de patolog�a diagnosticada",
      },
      {
        id: "rs_03",
        texto:
          "Continuar o iniciar tratamiento farmacol�gico indicado por m�dico tratante. Reportar medicaci�n al m�dico de empresa",
      },
      {
        id: "rs_04",
        texto:
          "Adherencia a programa de vigilancia epidemiol�gica de la empresa seg�n riesgo identificado",
      },
      {
        id: "rs_05",
        texto:
          "Informar de inmediato al m�dico de empresa cualquier cambio en su condici�n de salud o aparici�n de nuevos s�ntomas",
      },
      {
        id: "rs_06",
        texto:
          "Vacunaci�n al d�a: esquema de adultos seg�n EPS + vacunas de riesgo ocupacional (hepatitis B, t�tanos, influenza)",
      },
    ],
  },
  psicosocial: {
    label: "Salud Mental / Psicosocial",
    icon: "??",
    color: "teal",
    items: [
      {
        id: "rp_01",
        texto:
          "Participar en programa de manejo del estr�s laboral y t�cnicas de mindfulness ofrecidas por la empresa o EPS",
      },
      {
        id: "rp_02",
        texto:
          "Solicitar apoyo psicol�gico a trav�s de EPS en caso de s�ntomas de ansiedad, depresi�n o burnout",
      },
      {
        id: "rp_03",
        texto:
          "Establecer l�mites claros entre vida laboral y personal: evitar trabajo fuera de horario habitual",
      },
      {
        id: "rp_04",
        texto:
          "Comunicar al jefe inmediato situaciones de acoso laboral, sobrecarga de trabajo o conflictos interpersonales",
      },
    ],
  },
};
const DEFAULT_RECOMENDACIONES_SELECTED = {
  rg_01: true, // Actividad f�sica aer�bica
  rg_02: true, // Alimentaci�n balanceada
  rg_03: true, // Control m�dico anual
  rg_05: true, // Hidrataci�n
  rg_06: true, // Higiene del sue�o
  rl_01: true, // Pausas activas
  rl_04: true, // T�cnica levantamiento cargas
  rs_01: true, // Control m�dico ocupacional semestral
  rs_05: true, // Informar cambios de salud
  rs_06: true, // Vacunaci�n al d�a
};

export { ARL_LIST, AFP_LIST, EPS_LIST, CONTRATO_LIST, TURNO_LIST, ETNIA_LIST, SPECIALTIES_LIST, DERIVACIONES_CATALOG, RESTRICCIONES_CATALOG, RECOMENDACIONES_CATALOG, DEFAULT_RECOMENDACIONES_SELECTED };
