// src/data/planConfig.js - Configuraci�n de planes y permisos

const PLAN_CONFIG = {
  libre: {
    label: "?? Libre",
    price: 0,
    priceLabel: "Gratis",
    maxHC: 8, // total, no mensual
    maxEmpresas: 5,
    maxPacientes: 50,
    maxMedicos: 1,
    maxSVEprogramas: 0,
    maxTeleSesiones: 0,
    storageMB: 0,
    trialDays: 0,
    color: "gray",
    features: [
      "hc_ocupacional",
      "hc_general",
      "firma_digital",
      "cierre_hc",
      "antecedentes_memoria",
      "concepto_aptitud",
      "consentimiento",
      "verificacion_externa",
      "habeas_data",
      "portal_trabajador",
      "backup_restore",
      "offline",
      "sync_supabase",
    ],
  },
  starter: {
    label: "?? Starter",
    price: 45000,
    priceLabel: "$45.000/mes",
    maxHC: 200,
    maxEmpresas: 30,
    maxPacientes: 9999,
    maxMedicos: 1,
    maxSVEprogramas: 2,
    maxTeleSesiones: 10,
    storageMB: 512,
    trialDays: 15,
    color: "teal",
    features: [
      "hc_ocupacional",
      "hc_general",
      "firma_digital",
      "cierre_hc",
      "antecedentes_memoria",
      "concepto_aptitud",
      "consentimiento",
      "verificacion_externa",
      "habeas_data",
      "portal_trabajador",
      "backup_restore",
      "offline",
      "sync_supabase",
      "agenda",
      "propuestas",
      "factura_basica",
      "solicitud_examenes",
      "incapacidad",
      "reportes_basicos",
      "rips_validacion",
      "sve_starter",
      "telemedicina_starter",
    ],
  },
  pro: {
    label: "? Pro",
    price: 79000,
    priceLabel: "$79.000/mes",
    maxHC: 9999,
    maxEmpresas: 9999,
    maxPacientes: 9999,
    maxMedicos: 1,
    maxSVEprogramas: 7,
    maxTeleSesiones: 9999,
    storageMB: 3072,
    trialDays: 15,
    color: "blue",
    features: [
      "hc_ocupacional",
      "hc_general",
      "firma_digital",
      "cierre_hc",
      "antecedentes_memoria",
      "concepto_aptitud",
      "consentimiento",
      "verificacion_externa",
      "habeas_data",
      "portal_trabajador",
      "backup_restore",
      "offline",
      "sync_supabase",
      "agenda",
      "propuestas",
      "factura_basica",
      "solicitud_examenes",
      "incapacidad",
      "reportes_basicos",
      "rips_validacion",
      "sve_starter",
      "telemedicina_starter",
      "arl",
      "ia_analisis",
      "ia_resumen",
      "ia_reporte",
      "fhir_export",
      "rips_export",
      "dian_xml",
      "adjuntos",
      "auditoria",
      "2fa",
      "multi_usuario",
      "telemedicina_ilimitada",
      "sve_pro",
      "reportes_ia",
      "analytics_avanzado",
    ],
  },
  clinica: {
    label: "?? Cl�nica",
    price: 159000,
    priceLabel: "$159.000/mes",
    maxHC: 9999,
    maxEmpresas: 9999,
    maxPacientes: 9999,
    maxMedicos: 3,
    maxMedicosBase: 3,
    precioPorMedicoExtra: 45000,
    maxSVEprogramas: 7,
    maxTeleSesiones: 9999,
    storageMB: 10240,
    trialDays: 30,
    color: "purple",
    features: ["todo"],
  },
};

// ------------------------------------------------------------------------------
// FASE 2 � MULTI-TENANT / MULTI-ORG CONFIG
// Organizaci�n principal del super_admin. Todos los datos existentes pertenecen
// a esta org. Las nuevas orgs se crean desde el Panel Global del super_admin.
// ------------------------------------------------------------------------------
const ORG_DEFAULT_ID = "org_cucalon_2026";
const ORG_CONFIG_DEFAULT = {
  orgId: ORG_DEFAULT_ID,
  orgName: "OcupaSalud Popay�n",
  orgNit: "",
  plan: "clinica",
  createdAt: "2026-01-01",
  adminUser: "drcucalon",
};

// Helper: genera org_id �nico para nuevas organizaciones
const _genOrgId = (name) =>
  "org_" +
  name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20) +
  "_" +
  Date.now().toString(36);

// Helper: �el rol tiene privilegios de administrador?
const _isAdmin = (role) => role === "administrador" || role === "super_admin";

// -- IPS: helpers para admin de empresa (acceso desde login principal) --
const _isAdminEmpresa = (role) => role === "admin_empresa";
const _isEmpresaUser = (user) => !!user?.empresaId;
const _isAdminOrEmpresa = (role) => _isAdmin(role) || _isAdminEmpresa(role);

// Helper: �el usuario actual tiene esta feature?
// Uso: _canUse('ia_analisis', currentUser) ? true/false
const _canUse = (feature, user) => {
  const plan = user?.license || "libre";
  const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.libre;
  // Verificar expiraci�n
  if (cfg.price > 0 && user?.licenseExpiry) {
    const exp = new Date(user.licenseExpiry);
    if (exp < new Date()) return false; // plan vencido
  }
  return cfg.features.includes("todo") || cfg.features.includes(feature);
};

// Helper: �cu�ntas HC totales tiene el usuario?
const _contarHC = (lista, userId) =>
  lista.filter((p) => p._medicoId === userId && p.fechaExamen && !p._archivado)
    .length;

// ------------------------------------------------------------------------------
// PERMISOS DE SECRETARIA - Solo el administrador puede activar m�dulos
// por usuario. Por defecto TODO est� en false (denegado).
// ------------------------------------------------------------------------------
const SECRETARIA_PERMISOS_DEFAULT = {
  agenda: false, // Ver y gestionar agenda de citas
  bill: false, // Generar cuentas de cobro
  propuestas: false, // Generar propuestas econ�micas
  telemedicina: false, // Acceder al m�dulo de telemedicina
  empresas: false, // Ver y editar empresas clientes
  pacientes_lista: false, // Ver listado de pacientes (solo lectura)
  reporte: false, // Ver reportes epidemiol�gicos
  sve: false, // Ver SVE
  caja: false, // Acceder al m�dulo financiero/caja
  adjuntos: false, // Subir adjuntos a HC
  cuentas_cobro: false, // Ver estado de cuentas por cobrar
  pacientes_crear: false, // Crear nuevos pacientes (solo datos demogr�ficos)
};

// -- Permisos que SIEMPRE tienen los m�dicos (no necesitan check) --------------
const MEDICO_SIEMPRE_PUEDE = new Set([
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

// Helper principal: �puede la secretaria hacer X?
// - Admin siempre puede todo
// - M�dico sigue sus propias reglas (sin cambio)
// - Secretaria: SOLO si admin habilit� expl�citamente ESA feature
// FUENTE DE VERDAD (en orden de prioridad):
//   1. usersList (siempre la m�s actualizada desde Supabase)
//   2. currentUser.secretariaPermisos (cacheado en sesi�n actual)
//   3. SECRETARIA_PERMISOS_DEFAULT (todo denegado)
const _secretariaPuede = (feature, currentUser, usersList) => {
  if (!currentUser) return false;
  if (_isAdmin(currentUser.role)) return true;
  if (_isAdminEmpresa(currentUser.role)) return true;
  if (currentUser.role === "medico")
    return MEDICO_SIEMPRE_PUEDE.has(feature) || true;
  if (currentUser.role === "secretaria") {
    // Buscar siempre en usersList primero (tiene los datos m�s frescos de Supabase)
    const userObj = usersList?.find((u) => u.user === currentUser.user);
    // Fallback a currentUser si usersList no tiene el objeto a�n
    const permisos = userObj?.secretariaPermisos
      || currentUser?.secretariaPermisos
      || SECRETARIA_PERMISOS_DEFAULT;
    return permisos[feature] === true;
  }
  return false;
};

// -- Secretaria: �puede ver a este m�dico? (por medicosAsignados) ---------------
const _secretariaMedicoAsignado = (currentUser, medicoId, usersList) => {
  if (!currentUser) return false;
  if (currentUser.role !== "secretaria") return true; // admin/medico ven todo
  const userObj = usersList?.find((u) => u.user === currentUser.user);
  const asignados = userObj?.medicosAsignados || [];
  if (asignados.length === 0) return true; // secretaria general: ve a todos
  return asignados.includes(medicoId);
};

export { PLAN_CONFIG, ORG_DEFAULT_ID, ORG_CONFIG_DEFAULT, _genOrgId, _isAdmin, _isAdminEmpresa, _isEmpresaUser, _isAdminOrEmpresa, _canUse, _contarHC, SECRETARIA_PERMISOS_DEFAULT, MEDICO_SIEMPRE_PUEDE, _secretariaPuede, _secretariaMedicoAsignado };
