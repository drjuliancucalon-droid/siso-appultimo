// Shared constants and helpers extracted from App.jsx
// These are module-level (not in AppInner) so they can be imported anywhere.

export const PLAN_CONFIG = {
  libre: {
    label: "🆓 Libre",
    price: 0,
    priceLabel: "Gratis",
    maxHC: 8,
    maxEmpresas: 5,
    maxPacientes: 50,
    maxMedicos: 1,
    maxSVEprogramas: 0,
    maxTeleSesiones: 0,
    storageMB: 0,
    trialDays: 0,
    color: "gray",
    features: [
      "hc_ocupacional","hc_general","firma_digital","cierre_hc","antecedentes_memoria",
      "concepto_aptitud","consentimiento","verificacion_externa","habeas_data",
      "portal_trabajador","backup_restore","offline","sync_supabase",
    ],
  },
  starter: {
    label: "🌱 Starter",
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
      "hc_ocupacional","hc_general","firma_digital","cierre_hc","antecedentes_memoria",
      "concepto_aptitud","consentimiento","verificacion_externa","habeas_data",
      "portal_trabajador","backup_restore","offline","sync_supabase","agenda",
      "propuestas","factura_basica","solicitud_examenes","incapacidad",
      "reportes_basicos","rips_validacion","sve_starter","telemedicina_starter",
    ],
  },
  pro: {
    label: "⭐ Pro",
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
      "hc_ocupacional","hc_general","firma_digital","cierre_hc","antecedentes_memoria",
      "concepto_aptitud","consentimiento","verificacion_externa","habeas_data",
      "portal_trabajador","backup_restore","offline","sync_supabase","agenda",
      "propuestas","factura_basica","solicitud_examenes","incapacidad",
      "reportes_basicos","rips_validacion","sve_starter","telemedicina_starter",
      "arl","ia_analisis","ia_resumen","ia_reporte","fhir_export","rips_export",
      "dian_xml","adjuntos","auditoria","2fa","multi_usuario",
      "telemedicina_ilimitada","sve_pro","reportes_ia","analytics_avanzado",
    ],
  },
  clinica: {
    label: "🏢 Clínica",
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

export const _isAdmin = (role) => role === "administrador" || role === "super_admin";
export const _isAdminEmpresa = (role) => role === "admin_empresa";
export const _isEmpresaUser = (user) => !!user?.empresaId;
export const _isAdminOrEmpresa = (role) => _isAdmin(role) || _isAdminEmpresa(role);

export const _canUse = (feature, user) => {
  const plan = user?.license || "libre";
  const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.libre;
  if (cfg.price > 0 && user?.licenseExpiry) {
    const exp = new Date(user.licenseExpiry);
    if (exp < new Date()) return false;
  }
  return cfg.features.includes("todo") || cfg.features.includes(feature);
};

export const _contarHC = (lista, userId) =>
  lista.filter((p) => p._medicoId === userId && p.fechaExamen && !p._archivado).length;

export const SECRETARIA_PERMISOS_DEFAULT = {
  agenda: false,
  bill: false,
  propuestas: false,
  telemedicina: false,
  empresas: false,
  pacientes_lista: false,
  reporte: false,
  sve: false,
  caja: false,
  adjuntos: false,
  cuentas_cobro: false,
  pacientes_crear: false,
};
