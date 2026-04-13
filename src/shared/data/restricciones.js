// RESTRICCIONES_CATALOG - Catálogo de restricciones médico-laborales
// Extraído de App.jsx - Módulo compartido

export const RESTRICCIONES_CATALOG = {
  miembroSuperior: {
    label: "Miembro Superior",
    icon: "ðŸ¦¾",
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
          "No realizar movimientos repetitivos de muÃ±eca/mano (>30 ciclos/min) con miembro afectado",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "ms_03",
        texto:
          "No mantener postura estÃ¡tica de hombro en elevaciÃ³n superior a 60Â° por mÃ¡s de 2 horas continuas",
        normativa: "GTC-45 2012",
      },
      {
        id: "ms_04",
        texto:
          "No uso de herramientas vibrÃ¡tiles (martillos, pulidoras, taladros) con miembro afectado",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "ms_05",
        texto:
          "RotaciÃ³n de actividades cada 45 minutos para tareas manuales repetitivas",
        normativa: "Res. 1843/2025",
      },
      {
        id: "ms_06",
        texto:
          "No realizar pinza digital fina o prensiÃ³n de fuerza sostenida por mÃ¡s de 15 minutos continuos",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "ms_07",
        texto:
          "Uso obligatorio de fÃ©rula o soporte ortopÃ©dico durante jornada laboral en actividades de alto riesgo",
        normativa: "Res. 0312/2019",
      },
    ],
  },
  columnaLumbar: {
    label: "Columna Lumbar",
    icon: "ðŸ¦´",
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
          "No permanecer en posiciÃ³n de pie estÃ¡tica por mÃ¡s de 2 horas continuas sin descanso postural",
        normativa: "GTC-45 2012",
      },
      {
        id: "cl_03",
        texto:
          "No permanecer en posiciÃ³n sedente por mÃ¡s de 1 hora continua sin cambio postural",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cl_04",
        texto: "No realizar flexiÃ³n de tronco mayor a 45Â° con o sin carga",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cl_05",
        texto:
          "No realizar movimientos de torsiÃ³n de columna lumbar bajo carga",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cl_06",
        texto:
          "Uso obligatorio de cinturÃ³n lumbar en tareas de carga/descarga durante perÃ­odo de restricciÃ³n",
        normativa: "Res. 0312/2019",
      },
      {
        id: "cl_07",
        texto:
          "Adaptar puesto de trabajo con silla ergonÃ³mica con soporte lumbar y reposapiÃ©s si aplica",
        normativa: "Res. 2400/1979 Art. 381",
      },
    ],
  },
  columnaCervical: {
    label: "Columna Cervical",
    icon: "ðŸ”­",
    color: "purple",
    items: [
      {
        id: "cc_01",
        texto:
          "No mantener postura de flexiÃ³n cervical mayor a 20Â° por mÃ¡s de 2 horas continuas (uso de pantallas/microscopia)",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cc_02",
        texto:
          "No realizar tareas con el cuello en rotaciÃ³n mÃ¡xima sostenida por mÃ¡s de 30 minutos",
        normativa: "GTC-45 2012",
      },
      {
        id: "cc_03",
        texto:
          "Pantalla de computador a nivel de los ojos, distancia mÃ­nima 50 cm",
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
    icon: "ðŸ¥",
    color: "teal",
    items: [
      {
        id: "cd_01",
        texto:
          "No permanecer en sedestaciÃ³n prolongada sin soporte dorsal adecuado (>1 hora continua)",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "cd_02",
        texto:
          "No realizar actividades que impliquen elevaciÃ³n de brazos por encima de los hombros de forma repetitiva",
        normativa: "GTC-45 2012",
      },
      {
        id: "cd_03",
        texto:
          "Silla con respaldo que cubra toda la zona dorsal (vÃ©rtebras T1-T12)",
        normativa: "Res. 2400/1979",
      },
      {
        id: "cd_04",
        texto:
          "No exposiciÃ³n a vibraciÃ³n de cuerpo entero (manejo de vehÃ­culos pesados, maquinaria) sin estudio de impacto",
        normativa: "GTC-45 2012",
      },
    ],
  },
  miembroInferior: {
    label: "Miembro Inferior",
    icon: "ðŸ¦µ",
    color: "green",
    items: [
      {
        id: "mi_01",
        texto:
          "No permanecer en bipedestaciÃ³n estÃ¡tica por mÃ¡s de 2 horas continuas",
        normativa: "GTC-45 2012",
      },
      {
        id: "mi_02",
        texto:
          "No subir o bajar escaleras de forma repetitiva (>30 ascensos/dÃ­a) en perÃ­odo de restricciÃ³n",
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
          "Calzado ergonÃ³mico con soporte plantar y tacÃ³n mÃ¡ximo 3 cm durante jornada laboral",
        normativa: "GATISO-DME 2015",
      },
      {
        id: "mi_05",
        texto:
          "No conducciÃ³n de vehÃ­culos pesados o maquinaria durante perÃ­odo de restricciÃ³n",
        normativa: "Res. 4100/2004",
      },
    ],
  },
  cardiovascular: {
    label: "Cardiovascular / MetabÃ³lico",
    icon: "â¤ï¸",
    color: "red",
    items: [
      {
        id: "cv_01",
        texto:
          "No realizar actividades de alta demanda cardiovascular sin evaluaciÃ³n cardiolÃ³gica previa (FC >85% FCM)",
        normativa: "Res. 1843/2025",
      },
      {
        id: "cv_02",
        texto:
          "No trabajo en alturas hasta control y estabilizaciÃ³n de cifras tensionales (TA >140/90 mmHg)",
        normativa: "Res. 4272/2021",
      },
      {
        id: "cv_03",
        texto:
          "Control mÃ©dico periÃ³dico mensual de cifras tensionales mientras dure la restricciÃ³n",
        normativa: "Res. 1843/2025",
      },
      {
        id: "cv_04",
        texto:
          "No exposiciÃ³n a temperaturas extremas (calor >35Â°C / frÃ­o <10Â°C) sin protecciÃ³n individual adecuada",
        normativa: "GTC-45 2012",
      },
      {
        id: "cv_05",
        texto:
          "Plan de alimentaciÃ³n supervisado: restricciÃ³n de sodio, grasas saturadas y azÃºcares simples en jornada laboral",
        normativa: "Res. 1843/2025",
      },
      {
        id: "cv_06",
        texto:
          "No trabajos en jornadas nocturnas prolongadas (>8 h/noche) sin rotaciÃ³n semestral supervisada",
        normativa: "Dec. 1072/2015",
      },
    ],
  },
  respiratorio: {
    label: "Respiratorio / Pulmonar",
    icon: "ðŸ«",
    color: "sky",
    items: [
      {
        id: "re_01",
        texto:
          "No exposiciÃ³n a polvos orgÃ¡nicos/inorgÃ¡nicos sin uso de respirador N95 o superior certificado",
        normativa: "Res. 0773/2021",
      },
      {
        id: "re_02",
        texto:
          "No exposiciÃ³n a humos de soldadura, gases de escape o vapores quÃ­micos sin ventilaciÃ³n localizada extracciÃ³n",
        normativa: "GTC-45 2012",
      },
      {
        id: "re_03",
        texto:
          "EspirometrÃ­a de control semestral mientras persistan factores de riesgo respiratorio",
        normativa: "GATISO-ND 2012",
      },
      {
        id: "re_04",
        texto:
          "No trabajo en espacios confinados hasta nueva evaluaciÃ³n neumolÃ³gica con resultado apto",
        normativa: "Res. 0491/2020",
      },
      {
        id: "re_05",
        texto:
          "No exposiciÃ³n a agentes sensibilizantes respiratorios (lÃ¡tex, isocianatos, harinas) sin EPP certificado",
        normativa: "GTC-45 2012",
      },
    ],
  },
  neurologico: {
    label: "NeurolÃ³gico / PsiquiÃ¡trico",
    icon: "ðŸ§ ",
    color: "violet",
    items: [
      {
        id: "ne_01",
        texto:
          "No operaciÃ³n de maquinaria peligrosa, vehÃ­culos o equipos elÃ©ctricos de alta tensiÃ³n hasta concepto neurolÃ³gico",
        normativa: "Res. 1843/2025",
      },
      {
        id: "ne_02",
        texto:
          "No trabajo en alturas hasta nueva evaluaciÃ³n mÃ©dica con concepto apto (Res. 4272/2021)",
        normativa: "Res. 4272/2021",
      },
      {
        id: "ne_03",
        texto:
          "No exposiciÃ³n a solventes neurotÃ³xicos (benceno, tolueno, xileno) sin ventilaciÃ³n y EPP certificado",
        normativa: "GTC-45 2012",
      },
      {
        id: "ne_04",
        texto:
          "Jornada laboral mÃ¡xima de 8 horas/dÃ­a, sin horas extras durante perÃ­odo de tratamiento psiquiÃ¡trico activo",
        normativa: "Dec. 1072/2015",
      },
      {
        id: "ne_05",
        texto:
          "No trabajo en turno nocturno rotativo durante perÃ­odo de tratamiento de trastorno de sueÃ±o o ansiedad severa",
        normativa: "Res. 1843/2025",
      },
      {
        id: "ne_06",
        texto:
          "Seguimiento psicolÃ³gico laboral mensual y reporte a mÃ©dico SST de evoluciÃ³n clÃ­nica",
        normativa: "Res. 2404/2019",
      },
    ],
  },
  exposicionToxicos: {
    label: "ExposiciÃ³n a TÃ³xicos / QuÃ­micos",
    icon: "âš—ï¸",
    color: "yellow",
    items: [
      {
        id: "et_01",
        texto:
          "No manipulaciÃ³n directa de plaguicidas organofosforados sin equipo de protecciÃ³n personal completo (nivel C)",
        normativa: "Res. 0031/1995",
      },
      {
        id: "et_02",
        texto:
          "No exposiciÃ³n a metales pesados (plomo, mercurio, cadmio) sin niveles biolÃ³gicos de monitoreo vigentes",
        normativa: "GTC-45 2012",
      },
      {
        id: "et_03",
        texto:
          "Perfil toxicolÃ³gico (colinesterasa/metales) semestral obligatorio mientras persista exposiciÃ³n",
        normativa: "Res. 1843/2025",
      },
      {
        id: "et_04",
        texto:
          "No ingesta de alimentos ni bebidas en Ã¡reas de manejo de sustancias quÃ­micas",
        normativa: "Res. 2400/1979",
      },
      {
        id: "et_05",
        texto:
          "Ducha de emergencia y lavaojos funcionales en Ã¡rea de trabajo como requisito para laborar con quÃ­micos corrosivos",
        normativa: "Res. 2400/1979",
      },
    ],
  },
  visual: {
    label: "Visual / Auditivo",
    icon: "ðŸ‘ï¸",
    color: "indigo",
    items: [
      {
        id: "va_01",
        texto:
          "Uso obligatorio de correcciÃ³n Ã³ptica (gafas con prescripciÃ³n) durante jornada laboral en tareas de precisiÃ³n visual",
        normativa: "Res. 2400/1979",
      },
      {
        id: "va_02",
        texto:
          "No trabajo en conducciÃ³n nocturna de vehÃ­culos con agudeza visual corregida inferior a 20/40",
        normativa: "Res. 4100/2004",
      },
      {
        id: "va_03",
        texto:
          "No exposiciÃ³n a radiaciÃ³n UV/IR sin protecciÃ³n ocular certificada (ANSI Z87.1)",
        normativa: "GTC-45 2012",
      },
      {
        id: "va_04",
        texto:
          "No exposiciÃ³n a ruido >80 dB sin uso de protecciÃ³n auditiva de doble vÃ­a (tapÃ³n + orejera)",
        normativa: "Res. 1792/1990",
      },
      {
        id: "va_05",
        texto:
          "AudiometrÃ­a de control semestral con exposiciÃ³n a ruido ocupacional â‰¥85 dB",
        normativa: "Res. 8321/1983",
      },
    ],
  },
  alturas: {
    label: "Trabajo en Alturas",
    icon: "ðŸ—ï¸",
    color: "amber",
    items: [
      {
        id: "al_01",
        texto:
          "NO APTO para trabajo en alturas â‰¥1.5 metros hasta nueva evaluaciÃ³n mÃ©dica con concepto especÃ­fico",
        normativa: "Res. 4272/2021",
      },
      {
        id: "al_02",
        texto:
          "Requiere evaluaciÃ³n especializada (neurologÃ­a/otorrinolaringologÃ­a) antes de autorizar trabajo en alturas",
        normativa: "Res. 4272/2021 Art. 10",
      },
      {
        id: "al_03",
        texto:
          "No trabajo en alturas con medicaciÃ³n que produzca somnolencia, mareo o alteraciÃ³n del equilibrio",
        normativa: "Res. 4272/2021",
      },
      {
        id: "al_04",
        texto:
          "Uso obligatorio de arnÃ©s de cuerpo completo certificado y lÃ­nea de vida en toda tarea >1.5 m",
        normativa: "Res. 4272/2021",
      },
      {
        id: "al_05",
        texto:
          "AcompaÃ±amiento permanente de vigÃ­a certificado en trabajo en alturas durante perÃ­odo de restricciÃ³n parcial",
        normativa: "Res. 4272/2021 Art. 14",
      },
    ],
  },
  dermatologico: {
    label: "DermatolÃ³gico",
    icon: "ðŸ©º",
    color: "rose",
    items: [
      {
        id: "de_01",
        texto:
          "No contacto directo con agentes irritantes/sensibilizantes cutÃ¡neos sin guantes de nitrilo/neopreno certificados",
        normativa: "GTC-45 2012",
      },
      {
        id: "de_02",
        texto:
          "No exposiciÃ³n solar directa sin protector solar SPF 50+ durante jornadas extramurales",
        normativa: "Res. 1843/2025",
      },
      {
        id: "de_03",
        texto:
          "No manipulaciÃ³n de alimentos hasta resoluciÃ³n completa de lesiÃ³n cutÃ¡nea activa en manos",
        normativa: "Res. 2674/2013",
      },
      {
        id: "de_04",
        texto:
          "Control dermatolÃ³gico mensual mientras persistan lesiones laborales activas",
        normativa: "Res. 1843/2025",
      },
    ],
  },
};
