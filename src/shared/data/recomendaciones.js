// CATÁLOGO DE RECOMENDACIONES
export const RECOMENDACIONES_CATALOG = {
  generales: {
    label: "Recomendaciones Generales de Salud",
    icon: "💊",
    color: "emerald",
    items: [
      {
        id: "rg_01",
        texto:
          "Actividad física aeróbica moderada mínimo 150 minutos/semana (caminar, nadar, ciclismo)",
      },
      {
        id: "rg_02",
        texto:
          "Alimentación balanceada: reducir ultraprocesados, azúcares y grasas saturadas. Aumentar frutas, verduras y proteína magra",
      },
      {
        id: "rg_03",
        texto:
          "Control médico anual con laboratorios de seguimiento (glicemia, perfil lipídico, hemograma)",
      },
      {
        id: "rg_04",
        texto:
          "Mantener índice de masa corporal entre 18.5 y 24.9 kg/m² mediante dieta y ejercicio supervisado",
      },
      {
        id: "rg_05",
        texto:
          "Hidratación adecuada: mínimo 2 litros de agua/día, aumentar en jornadas con exposición a calor",
      },
      {
        id: "rg_06",
        texto:
          "Higiene del sueño: dormir entre 7-8 horas/noche en ambiente oscuro y silencioso",
      },
      {
        id: "rg_07",
        texto:
          "Cesación tabáquica inmediata; se recomienda programa de apoyo psicológico y/o farmacológico",
      },
      {
        id: "rg_08",
        texto:
          "Moderación en consumo de alcohol: máximo 1 unidad/día (mujeres) / 2 unidades/día (hombres)",
      },
    ],
  },
  laborales: {
    label: "Recomendaciones Laborales / Ergonómicas",
    icon: "🏢",
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
          "Ajustar altura de escritorio/banco de trabajo: codos a 90°, pantalla a nivel de los ojos",
      },
      {
        id: "rl_03",
        texto:
          "Uso de silla ergonómica con soporte lumbar ajustable, altura regulable y apoyabrazos",
      },
      {
        id: "rl_04",
        texto:
          "Técnica correcta de levantamiento de cargas: doblar rodillas, mantener espalda recta, carga pegada al cuerpo",
      },
      {
        id: "rl_05",
        texto:
          "Rotación de actividades laborales para evitar exposición continua a un solo factor de riesgo ergonómico",
      },
      {
        id: "rl_06",
        texto:
          "Uso obligatorio de calzado de seguridad con soporte plantar en áreas de carga y descarga",
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
    label: "Seguimiento Médico y Control",
    icon: "📋",
    color: "purple",
    items: [
      {
        id: "rs_01",
        texto:
          "Control médico ocupacional semestral durante los próximos 2 años",
      },
      {
        id: "rs_02",
        texto:
          "Consulta con médico general/especialista en las próximas 4 semanas para manejo de patología diagnosticada",
      },
      {
        id: "rs_03",
        texto:
          "Continuar o iniciar tratamiento farmacológico indicado por médico tratante. Reportar medicación al médico de empresa",
      },
      {
        id: "rs_04",
        texto:
          "Adherencia a programa de vigilancia epidemiológica de la empresa según riesgo identificado",
      },
      {
        id: "rs_05",
        texto:
          "Informar de inmediato al médico de empresa cualquier cambio en su condición de salud o aparición de nuevos síntomas",
      },
      {
        id: "rs_06",
        texto:
          "Vacunación al día: esquema de adultos según EPS + vacunas de riesgo ocupacional (hepatitis B, tétanos, influenza)",
      },
    ],
  },
  psicosocial: {
    label: "Salud Mental / Psicosocial",
    icon: "🧘",
    color: "teal",
    items: [
      {
        id: "rp_01",
        texto:
          "Participar en programa de manejo del estrés laboral y técnicas de mindfulness ofrecidas por la empresa o EPS",
      },
      {
        id: "rp_02",
        texto:
          "Solicitar apoyo psicológico a través de EPS en caso de síntomas de ansiedad, depresión o burnout",
      },
      {
        id: "rp_03",
        texto:
          "Establecer límites claros entre vida laboral y personal: evitar trabajo fuera de horario habitual",
      },
      {
        id: "rp_04",
        texto:
          "Comunicar al jefe inmediato situaciones de acoso laboral, sobrecarga de trabajo o conflictos interpersonales",
      },
    ],
  },
  cardiovascular: {
    label: "Cardiovascular / Metab\u00f3lico",
    icon: "\u2764\ufe0f",
    color: "red",
    items: [
      { id: "rc_01", texto: "Control peri\u00f3dico de presi\u00f3n arterial: m\u00ednimo cada 3 meses si tiene hipertensi\u00f3n conocida; anual si es normotenso." },
      { id: "rc_02", texto: "Restricci\u00f3n de sodio en dieta: <2 g/d\u00eda (equivalente a <5 g de sal/d\u00eda) seg\u00fan gu\u00edas colombianas de HTA." },
      { id: "rc_03", texto: "Monitoreo de glicemia en ayunas semestral si tiene factores de riesgo para diabetes mellitus tipo 2." },
      { id: "rc_04", texto: "Perfil lip\u00eddico anual; reducir consumo de grasas saturadas y trans. Meta LDL <100 mg/dL en paciente de riesgo." },
      { id: "rc_05", texto: "Adherencia estricta a tratamiento antihipertensivo, antidiab\u00e9tico o hipolipemiante indicado. No suspender sin orden m\u00e9dica." },
      { id: "rc_06", texto: "Evitar consumo de bebidas energizantes, cafe\u00edna en exceso (>3 tazas/d\u00eda) y alcohol durante tratamiento cardiovascular activo." },
    ],
  },
  respiratorio: {
    label: "Respiratorio / Pulmonar",
    icon: "🫑",
    color: "blue",
    items: [
      { id: "rr_01", texto: "Uso correcto de inhaladores: inspiraci\u00f3n lenta y profunda, apnea 10 seg, exhalaci\u00f3n lenta (t\u00e9cnica supervisada)." },
      { id: "rr_02", texto: "Evitar exposici\u00f3n a humo de tabaco, incienso, le\u00f1a y contaminantes del aire en domicilio y transporte." },
      { id: "rr_03", texto: "Vacunaci\u00f3n antiinfluenza anual y antineumoc\u00f3cica seg\u00fan esquema EPS en pacientes con patolog\u00eda respiratoria cr\u00f3nica." },
      { id: "rr_04", texto: "Control espironom\u00e9trico semestral para seguimiento de funci\u00f3n pulmonar mientras persista exposici\u00f3n a riesgo respiratorio." },
      { id: "rr_05", texto: "Lavado nasal con soluci\u00f3n salina isot\u00f3nica dos veces al d\u00eda en ambientes con polvo u otros irritantes respiratorios." },
    ],
  },
  visual: {
    label: "Visual / Auditivo",
    icon: "\ud83d\udc41\ufe0f",
    color: "purple",
    items: [
      { id: "rv_01", texto: "Control optonom\u00e9trico anual con refracci\u00f3n; correcci\u00f3n actualizada obligatoria para tareas visuales de precisi\u00f3n." },
      { id: "rv_02", texto: "Regla 20-20-20 en trabajo con pantallas: cada 20 minutos, mirar a 6 metros durante 20 segundos." },
      { id: "rv_03", texto: "Audiometr\u00eda de control anual en trabajadores con exposici\u00f3n a ruido \u226580 dB. Uso de protecci\u00f3n auditiva certificada." },
      { id: "rv_04", texto: "Uso obligatorio de gafas de seguridad certificadas (ANSI Z87.1 / EN 166) en \u00e1reas con proyecci\u00f3n de part\u00edculas o radiaci\u00f3n." },
      { id: "rv_05", texto: "Iluminaci\u00f3n adecuada en puesto de trabajo: m\u00ednimo 500 lux para oficina, 1000 lux para trabajo de precisi\u00f3n (Res. 2400/1979)." },
    ],
  },
  capacitacion: {
    label: "Capacitaci\u00f3n y Prevenci\u00f3n",
    icon: "\ud83d\udcda",
    color: "emerald",
    items: [
      { id: "rk_01", texto: "Participar en la capacitaci\u00f3n anual de SG-SST de la empresa (art. 11 Decreto 1072/2015)." },
      { id: "rk_02", texto: "Reportar todo accidente de trabajo e incidente dentro de las primeras 24 horas al \u00e1rea de SST y ARL." },
      { id: "rk_03", texto: "Conocer el plan de emergencias de la empresa: puntos de encuentro, rutas de evacuaci\u00f3n y primeros auxilios b\u00e1sicos." },
      { id: "rk_04", texto: "Uso correcto y obligatorio de todos los elementos de protecci\u00f3n personal (EPP) asignados seg\u00fan matriz de peligros del cargo." },
      { id: "rk_05", texto: "Notificar al m\u00e9dico laboral y al \u00e1rea SST cualquier cambio en diagn\u00f3stico m\u00e9dico o inicio de nuevo tratamiento farmacol\u00f3gico." },
    ],
  }
};

export const DEFAULT_RECOMENDACIONES_SELECTED = {
  rg_01: true, // Actividad física aeróbica
  rg_02: true, // Alimentación balanceada
  rg_03: true, // Control médico anual
  rg_05: true, // Hidratación
  rg_06: true, // Higiene del sueño
  rl_01: true, // Pausas activas
  rl_04: true, // Técnica levantamiento cargas
  rs_01: true, // Control médico ocupacional semestral
  rs_05: true, // Informar cambios de salud
  rs_06: true, // Vacunación al día
};
