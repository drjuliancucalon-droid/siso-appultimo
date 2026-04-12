// src/shared/data/initialStates.js

import { ORG_DEFAULT_ID, SECRETARIA_PERMISOS_DEFAULT } from './planConfig.js';
import { DEFAULT_DOCTOR_DATA } from './catalogs.js';

export const initialOccupPatientState = {
  id: null,
  type: "ocupacional",
  fechaRegistro: new Date().toISOString(),
  estadoHistoria: "Abierta",
  codigoVerificacion: "",
  conteoEdiciones: 0,
  motivoEdicion: "",
  // FoliaciÃ³n HC - Res. 1995/1999 Art. 3
  folioHC: "",
  // NÃºmero consecutivo de versiÃ³n del documento
  versionDocumento: 1,
  fechaExamen: new Date().toISOString().split("T")[0],
  ciudad: "PopayÃ¡n",
  tipoExamen: "INGRESO",
  frecuenciaSeguimiento: "",
  enfasisExamen: "GENERAL",
  // Perfil de Cargo (Res. 1843/2025 Art. 29)
  perfilCargo_funciones: "",
  perfilCargo_demandasFisicas: "",
  perfilCargo_demandasMentales: "",
  perfilCargo_factoresRiesgo: "",
  perfilCargo_nivelExposicion: "",
  perfilCargo_medidasControl: "",
  perfilCargo_tiempoAcumulado: "",
  // Campos de incapacidad y ausencia (Res. 1843/2025 Art. 9 y 13)
  diasIncapacidad: "",
  diasAusenciaNoMedica: "",
  // â•â• B-10: Nuevos campos Res. 1843/2025 â•â•
  plazoImplementacionRecomendaciones: "20", // Art. 25 - plazo en dÃ­as calendario
  periodicidadUltimaEval: "", // Para alerta de evaluaciÃ³n vencida (max 3 aÃ±os)
  pausasActivasPrograma: false, // Art. 26 - empresa tiene programa de pausas activas
  pausasActivasParticipa: false, // Trabajador participa en pausas activas
  justificacionPruebaEspecial: "", // JustificaciÃ³n clÃ­nica si se ordena prueba sensible
  nombres: "",
  docNumero: "",
  docTipo: "CC",
  fechaNacimiento: "",
  edad: "",
  genero: "",
  estadoCivil: "",
  escolaridad: "",
  dependencia: "",
  cargo: "",
  eps: "",
  afp: "",
  telefono: "",
  celular: "",
  email: "",
  arl: "",
  nivelRiesgoARL: "",
  turnoTrabajo: "",
  estrato: "",
  tipoVivienda: "",
  residencia: "",
  antiguedadEmpresa: "",
  tipoContrato: "",
  grupoEtnico: "",
  identidadGenero: "",
  zonaResidencia: "",
  grupoSanguineo: "",
  foto: "",
  lateralidad: "",
  numPersonasCargo: "",
  ingresosMensuales: "",
  actividadEconomicaTrabajador: "",
  empresaId: "particular",
  empresaNombre: "PARTICULAR / INDEPENDIENTE",
  empresaNit: "",
  actividadEconomica: "",
  motivoConsulta: "",
  // Consentimiento con evidencia probatoria (Ley 1581/2012 + Res. 1843/2025 Art. 12)
  consentimientoVersion: "v2025-1843",
  consentimientoTimestamp: "",
  consentimientoIp: "sesiÃ³n-web",
  riesgos: {
    fisicos: false,
    quimicos: false,
    biologicos: false,
    mecanicos: false,
    biomecanicos: false,
    psicosocial: false,
    seguridad: false,
    locativos: false,
  },
  antecedentesAgrupados: {
    patologicos: { val: false, det: "" },
    quirurgicos: { val: false, det: "" },
    traumaticos: { val: false, det: "" },
    farmacologicos: { val: false, det: "" },
    alergicos: { val: false, det: "" },
  },
  vacunacionCompleta: false,
  habitos: {
    fuma: "No",
    alcohol: "No",
    psicoactivas: "No",
    deporte: "No",
    detalle: "",
  },
  examenFisicoSistemas: {
    cabeza: { estado: "Normal", hallazgo: "" },
    ojos: { estado: "Normal", hallazgo: "" },
    oidos: { estado: "Normal", hallazgo: "" },
    nariz: { estado: "Normal", hallazgo: "" },
    boca: { estado: "Normal", hallazgo: "" },
    cuello: { estado: "Normal", hallazgo: "" },
    torax: { estado: "Normal", hallazgo: "" },
    corazon: { estado: "Normal", hallazgo: "" },
    pulmones: { estado: "Normal", hallazgo: "" },
    abdomen: { estado: "Normal", hallazgo: "" },
    genitourinario: { estado: "Normal", hallazgo: "" },
    columna: { estado: "Normal", hallazgo: "" },
    extremidades: { estado: "Normal", hallazgo: "" },
    piel: { estado: "Normal", hallazgo: "" },
    neurologico: { estado: "Normal", hallazgo: "" },
  },
  maniobrasOsteomusculares: {
    phalen: { estado: "Normal", hallazgo: "" },
    tinel: { estado: "Normal", hallazgo: "" },
    finkelstein: { estado: "Normal", hallazgo: "" },
    jobe: { estado: "Normal", hallazgo: "" },
    lasegue: { estado: "Normal", hallazgo: "" },
    adams: { estado: "Normal", hallazgo: "" },
    wells: { estado: "Normal", hallazgo: "" },
    schober: { estado: "Normal", hallazgo: "" },
    otra: { estado: "Normal", hallazgo: "", nombre: "" },
  },
  examenAlturas: {
    romberg: "Normal",
    marcha: "Normal",
    vertigo: "Negativo",
    coordinacion: "Normal",
    nistagmus: "Ausente",
    testMiedo: "Negativo",
    observaciones: "",
  },
  examenAlimentos: {
    pielFaneras: "Normal",
    orl: "Normal",
    gastrointestinal: "Normal",
    observaciones: "",
  },
  examenConfinados: {
    cardiovascular: "Normal",
    respiratorio: "Normal",
    neurologico: "Normal",
    psicologico: "Apto",
    otorrino: "Normal",
    usoEpp: "Apto",
    hallazgosCardio: "",
    observaciones: "",
  },
  examenOsteomuscular: {
    columna: "Normal",
    miembrosSup: "Normal",
    miembrosInf: "Normal",
    muscular: "Normal",
    articular: "Normal",
    postural: "Normal",
    hallazgos: "",
    diagnosticoFuncional: "",
  },
  examenCorazon: {
    frecuenciaCardiaca: "Normal",
    presionArterial: "Normal",
    ritmoyTonos: "Normal",
    pulsos: "Normal",
    edemas: "Ausente",
    perfusionPeriferica: "Normal",
    signosVitales: "",
    imc: "",
    riesgoCV: "",
    hallazgos: "",
    restricciones: "",
  },
  paraclinicosCheck: {
    optometria: false,
    audiometria: false,
    espirometria: false,
    ecg: false,
    glicemia: false,
    lipidico: false,
    frotisFaringeo: false,
    coprologico: false,
    kohUnas: false,
    hematico: false,
    rx: false,
    emg: false,
    psicologia: false,
    otros: "",
  },
  agudezaVisual: {
    lejanaOD: "",
    lejanaOI: "",
    proximaOD: "",
    proximaOI: "",
    correccion: false,
  },
  ta: "",
  fc: "",
  fr: "",
  temp: "",
  peso: "",
  talla: "",
  imc: "",
  diagnosticoPrincipal: "Z10.0 - EXAMEN MÃ‰DICO OCUPACIONAL",
  diagnosticoSecundario1: "",
  diagnosticoSecundario2: "",
  conceptoAptitud: "",
  recomendaciones: "",
  vigencia: "",
  analisisRestricciones: "",
  analisisIA: "",
  sveRecomendado: [],
  restriccionesChecklist: {},
  recomendacionesChecklist: {},
  formulaMedica: "",
  formulaMedicamentos: [],
  derivaciones: [],
  esConvenio: false,
  valorAtencion: "",
  incapacidad: {
    fechaInicio: "",
    fechaFin: "",
    dias: 0,
    origen: "Enfermedad General",
    tipo: "Ambulatoria",
    prorroga: "No",
    diagnostico: "",
    descripcion: "",
  },
  // NORMATIVO: Res. 1843/2025 Art. 12 - Consentimiento informado
  consentimientoInformado: false,
  fechaConsentimiento: "",
  tipoConsentimiento: "Digital",
  consentimientoNombrePaciente: "", // B-19: nombre escrito por el paciente
  // NORMATIVO: Res. 1843/2025 Art. 25 - Entrega del certificado al trabajador
  certificadoEntregado: false,
  fechaEntregaCertificado: "",
  metodoEntregaCertificado: "FÃ­sica",
  // B-16: Adjuntos de paraclÃ­nicos (espirometrÃ­a, audiometrÃ­a, RX, laboratorios)
  // Estructura: [{id, nombre, tipo, mimeType, tamano, fecha, subidoPor, path, url}]
  adjuntos: [],
};
export const initialGeneralPatientState = {
  id: null,
  type: "general",
  fechaRegistro: new Date().toISOString(),
  estadoHistoria: "Abierta",
  codigoVerificacion: "",
  fechaConsulta: new Date().toISOString().split("T")[0],
  nombres: "",
  docNumero: "",
  edad: "",
  fechaNacimiento: "",
  genero: "",
  estadoCivil: "",
  escolaridad: "",
  telefono: "",
  email: "",
  residencia: "",
  eps: "",
  grupoSanguineo: "",
  alergias: "",
  motivoConsulta: "",
  enfermedadActual: "",
  antecedentes: {
    personales: "",
    familiares: "",
    quirurgicos: "",
    traumaticos: "",
    farmacologicos: "",
    alergicos: "",
    ginecologicos: "",
  },
  revisionSistemas: {
    general: "",
    cardiovascular: "",
    respiratorio: "",
    digestivo: "",
    genitourinario: "",
    musculoesqueletico: "",
    neurologico: "",
    dermatologico: "",
    endocrinologico: "",
  },
  examenFisico: {
    estadoGeneral: "",
    ta: "",
    fc: "",
    fr: "",
    temp: "",
    peso: "",
    talla: "",
    imc: "",
    saturacion: "",
    hallazgos: "",
  },
  sistemasPorExamen: {
    cabeza: { estado: "Normal", hallazgo: "" },
    cuello: { estado: "Normal", hallazgo: "" },
    torax: { estado: "Normal", hallazgo: "" },
    abdomen: { estado: "Normal", hallazgo: "" },
    extremidades: { estado: "Normal", hallazgo: "" },
    neurologico: { estado: "Normal", hallazgo: "" },
    piel: { estado: "Normal", hallazgo: "" },
  },
  diagnosticos: [{ cie10: "", descripcion: "", tipo: "Principal" }],
  plan: {
    conducta: "",
    medicamentos: "",
    paraclinicosSolicitados: "",
    remisiones: "",
    recomendaciones: "",
    controlEn: "",
  },
  incapacidad: {
    aplica: false,
    dias: "",
    desde: "",
    hasta: "",
    origen: "Enfermedad General",
  },
};
export const initialUsers = [
  {
    id: 1,
    user: "drcucalon",
    passHash:
      "49679f37304820e18bae7ed12292e42a7722a7d1a55f12e41b1abca5cc5162fd",
    mustChangePassword: false, // FIX: no forzar cambio â€” Supabase tiene la contraseÃ±a real
    name: "Dr. Julian Cucalon",
    role: "super_admin", // FASE 2: promovido a super_admin (puede crear orgs + HC)
    orgId: ORG_DEFAULT_ID, // FASE 2: organizaciÃ³n principal
    license: "clinica",
    licenseExpiry: "2099-12-31",
    licenseStarted: "2026-01-01",
    porcentajeHonorarios: 100, // FASE 2: hook distribuciÃ³n futura (Componente 10)
    secretariaPermisos: { ...SECRETARIA_PERMISOS_DEFAULT },
    // Perfil del super_admin - aparece en navbar, certificados y firmas
    doctorData: {
      ...DEFAULT_DOCTOR_DATA,
      nombre: "Dr. Julian Cucalon",
      titulo: "MÃ©dico Especialista en Salud Ocupacional",
      ciudad: "PopayÃ¡n",
      // licencia, cedula, celular, email: se configuran en Ajustes â†’ Firma
    },
  },
];
export const initialCompanyState = {
  nombre: "",
  nit: "",
  dv: "",
  orgId: ORG_DEFAULT_ID, // FASE 2: aislamiento multi-tenant
  codActividad: "",
  actividad: "",
  direccion: "",
  ciudad: "",
  telefono: "",
  correo: "",
  arl: "",
  gerente: "",
  // â”€â”€ Convenio â”€â”€
  medicoResponsableId: "", // mÃ©dico principal para esta empresa
  tarifaIngreso: "", // tarifa examen de ingreso COP
  tarifaPeriodico: "", // tarifa examen periÃ³dico
  tarifaEgreso: "", // tarifa examen de egreso
  tarifaConsulta: "", // tarifa consulta general
  condicionesPago: "contado", // contado / 30dias / 60dias
  convenioFecha: "", // inicio del convenio
  convenioVencimiento: "", // vencimiento (alerta 30 dÃ­as antes)
  descuento: "", // % descuento sobre tarifa
  portalActivo: false, // portal cliente habilitado
  facturacionAgrupada: false, // agrupar varios exÃ¡menes en una factura
  planExamenes: [], // exÃ¡menes incluidos en el convenio
  notasConvenio: "", // notas adicionales del convenio
  // â”€â”€ Multi-mÃ©dico / Multi-sede (FASE 2) â”€â”€
  medicoIds: [], // array de usernames de mÃ©dicos asignados a esta empresa
  sedes: [], // array de sedes [{nombre, ciudad, direccion}]
  // â”€â”€ Admin del Portal Empresa (FASE 2) â”€â”€
  portalAdminUser: "", // username del admin del portal empresa
  portalAdminPassHash: "", // SHA-256 de la contraseÃ±a admin del portal
  // â”€â”€ IPS: Admin de empresa con acceso al login principal â”€â”€
  adminEmpresaUser: "", // username del admin_empresa (login principal)
  // â”€â”€ PASO 1: Perfil IPS â”€â”€
  logo: "", // base64 del logo de la empresa
  lema: "", // slogan/lema de la IPS
};
