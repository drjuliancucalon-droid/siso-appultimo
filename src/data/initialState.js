// Constantes organizacionales y estados iniciales

export const DEFAULT_DOCTOR_DATA = {
  nombre: "",
  cedula: "",
  titulo: "",
  licencia: "",
  ciudad: "",
  celular: "",
  email: "",
  direccion: "",
  // Datos financieros
  banco: "",
  tipoCuenta: "Ahorros",
  numeroCuenta: "",
  rut: "",
  regimen: "",
  tarifaHora: "0",
  tarifaExamenOcup: "0",
  tarifaInforme: "0",
  tarifaDiaPVE: "0",
};

export const ORG_DEFAULT_ID = "org_cucalon_2026";
export const ORG_CONFIG_DEFAULT = {
  orgId: ORG_DEFAULT_ID,
  orgName: "OcupaSalud Popayán",
  orgNit: "",
  plan: "clinica",
  createdAt: "2026-01-01",
  adminUser: "drcucalon",
};

// Helper: genera org_id único para nuevas organizaciones
export const _genOrgId = (name) =>
  "org_" +
  name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20) +
  "_" +
  Date.now().toString(36);

// Helper: ¿el rol tiene privilegios de administrador?
export const _isAdmin = (role) => role === "administrador" || role === "super_admin";

// ── IPS: helpers para admin de empresa (acceso desde login principal) ──
export const _isAdminEmpresa = (role) => role === "admin_empresa";
export const _isEmpresaUser = (user) => !!user?.empresaId;
export const _isAdminOrEmpresa = (role) => _isAdmin(role) || _isAdminEmpresa(role);

// Helper: ¿el usuario actual tiene esta feature?
// Uso: _canUse('ia_analisis', currentUser) → true/false
export const _canUse = (feature, user) => {
  const plan = user?.license || "libre";
  const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.libre;
  // Verificar expiración
  if (cfg.price > 0 && user?.licenseExpiry) {
    const exp = new Date(user.licenseExpiry);
    if (exp < new Date()) return false; // plan vencido
  }
  return cfg.features.includes("todo") || cfg.features.includes(feature);
};

// Helper: ¿cuántas HC totales tiene el usuario?
export const _contarHC = (lista, userId) =>
  lista.filter((p) => p._medicoId === userId && p.fechaExamen && !p._archivado)
    .length;

// ══════════════════════════════════════════════════════════════════════════════
// PERMISOS DE SECRETARIA - Solo el administrador puede activar módulos
// por usuario. Por defecto TODO está en false (denegado).
// ══════════════════════════════════════════════════════════════════════════════
export const SECRETARIA_PERMISOS_DEFAULT = {
  agenda: false, // Ver y gestionar agenda de citas
  bill: false, // Generar cuentas de cobro
  propuestas: false, // Generar propuestas económicas
  telemedicina: false, // Acceder al módulo de telemedicina
  empresas: false, // Ver y editar empresas clientes
  pacientes_lista: false, // Ver listado de pacientes (solo lectura)
  reporte: false, // Ver reportes epidemiológicos
  sve: false, // Ver SVE
  caja: false, // Acceder al módulo financiero/caja
  adjuntos: false, // Subir adjuntos a HC
  cuentas_cobro: false, // Ver estado de cuentas por cobrar
  pacientes_crear: false, // Crear nuevos pacientes (solo datos demográficos)
};

// ── Permisos que SIEMPRE tienen los médicos (no necesitan check) ──────────────
export const MEDICO_SIEMPRE_PUEDE = new Set([
  "agenda",
  "bill",
  "propuestas",
  "empresas",
  "pacientes_lista",
  "reporte",
  "sve",
  "caja",
  "adjuntos",
  "cuentas_cobro",
  "pacientes_crear",
  "telemedicina",
]);

// Helper principal: ¿puede la secretaria hacer X?
// - Admin siempre puede todo
// - Médico sigue sus propias reglas (sin cambio)
// - Secretaria: SOLO si admin habilitó explícitamente ESA feature
export const _secretariaPuede = (feature, currentUser, usersList) => {
  if (!currentUser) return false;
  if (_isAdmin(currentUser.role)) return true;
  if (_isAdminEmpresa(currentUser.role)) return true; // admin_empresa tiene acceso completo dentro de su empresa
  if (currentUser.role === "medico")
    return MEDICO_SIEMPRE_PUEDE.has(feature) || true;
  if (currentUser.role === "secretaria") {
    const userObj = usersList?.find((u) => u.user === currentUser.user);
    const permisos = userObj?.secretariaPermisos || SECRETARIA_PERMISOS_DEFAULT;
    return permisos[feature] === true;
  }
  return false;
};

// ── Secretaria: ¿puede ver a este médico? (por medicosAsignados) ───────────────
export const _secretariaMedicoAsignado = (currentUser, medicoId, usersList) => {
  if (!currentUser) return false;
  if (currentUser.role !== "secretaria") return true; // admin/medico ven todo
  const userObj = usersList?.find((u) => u.user === currentUser.user);
  const asignados = userObj?.medicosAsignados || [];
  if (asignados.length === 0) return true; // secretaria general: ve a todos
  return asignados.includes(medicoId);
};


export const initialOccupPatientState = {
  id: null,
  type: "ocupacional",
  fechaRegistro: new Date().toISOString(),
  estadoHistoria: "Abierta",
  codigoVerificacion: "",
  conteoEdiciones: 0,
  motivoEdicion: "",
  // Foliación HC - Res. 1995/1999 Art. 3
  folioHC: "",
  // Número consecutivo de versión del documento
  versionDocumento: 1,
  fechaExamen: new Date().toISOString().split("T")[0],
  ciudad: "Popayán",
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
  // ══ B-10: Nuevos campos Res. 1843/2025 ══
  plazoImplementacionRecomendaciones: "20", // Art. 25 - plazo en días calendario
  periodicidadUltimaEval: "", // Para alerta de evaluación vencida (max 3 años)
  pausasActivasPrograma: false, // Art. 26 - empresa tiene programa de pausas activas
  pausasActivasParticipa: false, // Trabajador participa en pausas activas
  justificacionPruebaEspecial: "", // Justificación clínica si se ordena prueba sensible
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
  consentimientoIp: "sesión-web",
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
  diagnosticoPrincipal: "Z10.0 - EXAMEN MÉDICO OCUPACIONAL",
  diagnosticoSecundario1: "",
  diagnosticoSecundario2: "",
  conceptoAptitud: "",
  recomendaciones: "",
  vigencia: "",
  analisisRestricciones: "",
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
  metodoEntregaCertificado: "Física",
  // B-16: Adjuntos de paraclínicos (espirometría, audiometría, RX, laboratorios)
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
    mustChangePassword: false,
    name: "Dr. Julian Cucalon",
    role: "super_admin", // FASE 2: promovido a super_admin (puede crear orgs + HC)
    orgId: ORG_DEFAULT_ID, // FASE 2: organización principal
    license: "clinica",
    licenseExpiry: "2099-12-31",
    licenseStarted: "2026-01-01",
    porcentajeHonorarios: 100, // FASE 2: hook distribución futura (Componente 10)
    secretariaPermisos: { ...SECRETARIA_PERMISOS_DEFAULT },
    doctorData: { ...DEFAULT_DOCTOR_DATA },
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
  // ── Convenio ──
  medicoResponsableId: "", // médico principal para esta empresa
  tarifaIngreso: "", // tarifa examen de ingreso COP
  tarifaPeriodico: "", // tarifa examen periódico
  tarifaEgreso: "", // tarifa examen de egreso
  tarifaConsulta: "", // tarifa consulta general
  condicionesPago: "contado", // contado / 30dias / 60dias
  convenioFecha: "", // inicio del convenio
  convenioVencimiento: "", // vencimiento (alerta 30 días antes)
  descuento: "", // % descuento sobre tarifa
  portalActivo: false, // portal cliente habilitado
  facturacionAgrupada: false, // agrupar varios exámenes en una factura
  planExamenes: [], // exámenes incluidos en el convenio
  notasConvenio: "", // notas adicionales del convenio
  // ── Multi-médico / Multi-sede (FASE 2) ──
  medicoIds: [], // array de usernames de médicos asignados a esta empresa
  sedes: [], // array de sedes [{nombre, ciudad, direccion}]
  // ── Admin del Portal Empresa (FASE 2) ──
  portalAdminUser: "", // username del admin del portal empresa
  portalAdminPassHash: "", // SHA-256 de la contraseña admin del portal
  // ── IPS: Admin de empresa con acceso al login principal ──
  adminEmpresaUser: "", // username del admin_empresa (login principal)
  // ── PASO 1: Perfil IPS ──
  logo: "", // base64 del logo de la empresa
  lema: "", // slogan/lema de la IPS
};
