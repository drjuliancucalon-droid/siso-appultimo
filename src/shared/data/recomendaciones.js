// src/shared/data/recomendaciones.js

export const RECOMENDACIONES_CATALOG = {
  generales: {
    label: "Recomendaciones Generales de Salud",
    icon: "ðŸ’Š",
    color: "emerald",
    items: [
      {
        id: "rg_01",
        texto:
          "Actividad fÃ­sica aerÃ³bica moderada mÃ­nimo 150 minutos/semana (caminar, nadar, ciclismo)",
      },
      {
        id: "rg_02",
        texto:
          "AlimentaciÃ³n balanceada: reducir ultraprocesados, azÃºcares y grasas saturadas. Aumentar frutas, verduras y proteÃ­na magra",
      },
      {
        id: "rg_03",
        texto:
          "Control mÃ©dico anual con laboratorios de seguimiento (glicemia, perfil lipÃ­dico, hemograma)",
      },
      {
        id: "rg_04",
        texto:
          "Mantener Ã­ndice de masa corporal entre 18.5 y 24.9 kg/mÂ² mediante dieta y ejercicio supervisado",
      },
      {
        id: "rg_05",
        texto:
          "HidrataciÃ³n adecuada: mÃ­nimo 2 litros de agua/dÃ­a, aumentar en jornadas con exposiciÃ³n a calor",
      },
      {
        id: "rg_06",
        texto:
          "Higiene del sueÃ±o: dormir entre 7-8 horas/noche en ambiente oscuro y silencioso",
      },
      {
        id: "rg_07",
        texto:
          "CesaciÃ³n tabÃ¡quica inmediata; se recomienda programa de apoyo psicolÃ³gico y/o farmacolÃ³gico",
      },
      {
        id: "rg_08",
        texto:
          "ModeraciÃ³n en consumo de alcohol: mÃ¡ximo 1 unidad/dÃ­a (mujeres) / 2 unidades/dÃ­a (hombres)",
      },
    ],
  },
  laborales: {
    label: "Recomendaciones Laborales / ErgonÃ³micas",
    icon: "ðŸ¢",
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
          "Ajustar altura de escritorio/banco de trabajo: codos a 90Â°, pantalla a nivel de los ojos",
      },
      {
        id: "rl_03",
        texto:
          "Uso de silla ergonÃ³mica con soporte lumbar ajustable, altura regulable y apoyabrazos",
      },
      {
        id: "rl_04",
        texto:
          "TÃ©cnica correcta de levantamiento de cargas: doblar rodillas, mantener espalda recta, carga pegada al cuerpo",
      },
      {
        id: "rl_05",
        texto:
          "RotaciÃ³n de actividades laborales para evitar exposiciÃ³n continua a un solo factor de riesgo ergonÃ³mico",
      },
      {
        id: "rl_06",
        texto:
          "Uso obligatorio de calzado de seguridad con soporte plantar en Ã¡reas de carga y descarga",
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
    label: "Seguimiento MÃ©dico y Control",
    icon: "ðŸ“‹",
    color: "purple",
    items: [
      {
        id: "rs_01",
        texto:
          "Control mÃ©dico ocupacional semestral durante los prÃ³ximos 2 aÃ±os",
      },
      {
        id: "rs_02",
        texto:
          "Consulta con mÃ©dico general/especialista en las prÃ³ximas 4 semanas para manejo de patologÃ­a diagnosticada",
      },
      {
        id: "rs_03",
        texto:
          "Continuar o iniciar tratamiento farmacolÃ³gico indicado por mÃ©dico tratante. Reportar medicaciÃ³n al mÃ©dico de empresa",
      },
      {
        id: "rs_04",
        texto:
          "Adherencia a programa de vigilancia epidemiolÃ³gica de la empresa segÃºn riesgo identificado",
      },
      {
        id: "rs_05",
        texto:
          "Informar de inmediato al mÃ©dico de empresa cualquier cambio en su condiciÃ³n de salud o apariciÃ³n de nuevos sÃ­ntomas",
      },
      {
        id: "rs_06",
        texto:
          "VacunaciÃ³n al dÃ­a: esquema de adultos segÃºn EPS + vacunas de riesgo ocupacional (hepatitis B, tÃ©tanos, influenza)",
      },
    ],
  },
  psicosocial: {
    label: "Salud Mental / Psicosocial",
    icon: "ðŸ§˜",
    color: "teal",
    items: [
      {
        id: "rp_01",
        texto:
          "Participar en programa de manejo del estrÃ©s laboral y tÃ©cnicas de mindfulness ofrecidas por la empresa o EPS",
      },
      {
        id: "rp_02",
        texto:
          "Solicitar apoyo psicolÃ³gico a travÃ©s de EPS en caso de sÃ­ntomas de ansiedad, depresiÃ³n o burnout",
      },
      {
        id: "rp_03",
        texto:
          "Establecer lÃ­mites claros entre vida laboral y personal: evitar trabajo fuera de horario habitual",
      },
      {
        id: "rp_04",
        texto:
          "Comunicar al jefe inmediato situaciones de acoso laboral, sobrecarga de trabajo o conflictos interpersonales",
      },
    ],
  },
};
export const DEFAULT_RECOMENDACIONES_SELECTED = {
  rg_01: true, // Actividad fÃ­sica aerÃ³bica
  rg_02: true, // AlimentaciÃ³n balanceada
  rg_03: true, // Control mÃ©dico anual
  rg_05: true, // HidrataciÃ³n
  rg_06: true, // Higiene del sueÃ±o
  rl_01: true, // Pausas activas
  rl_04: true, // TÃ©cnica levantamiento cargas
  rs_01: true, // Control mÃ©dico ocupacional semestral
  rs_05: true, // Informar cambios de salud
  rs_06: true, // VacunaciÃ³n al dÃ­a
};
