// RIPS JSON - Resolución 2275/2023 + FHIR R4


// ══════════════════════════════════════════════════════════════════════════
// B-28: HL7 FHIR R4 - Res. 1888/2025 RDA - Generador de recursos FHIR
// Recursos: Patient, Practitioner, Observation, DiagnosticReport
// Deadline de interoperabilidad: 15 de abril de 2026
// ══════════════════════════════════════════════════════════════════════════
export const _generarFHIRPatient = (p) => ({
  resourceType: "Patient",
  id:
    "pat-" + (p.docNumero || p.id || Date.now()).toString().replace(/\s/g, ""),
  meta: {
    profile: ["http://hl7.org/fhir/StructureDefinition/Patient"],
    lastUpdated: new Date().toISOString(),
  },
  identifier: [
    {
      system: "https://www.registraduria.gov.co",
      type: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0203",
            code: p.docTipo || "NI",
          },
        ],
      },
      value: p.docNumero || "",
    },
  ],
  name: [
    {
      use: "official",
      text: p.nombres || "",
      family: (p.nombres || "").split(" ").slice(-1)[0],
      given: [(p.nombres || "").split(" ")[0]],
    },
  ],
  gender:
    p.genero === "Masculino"
      ? "male"
      : p.genero === "Femenino"
      ? "female"
      : "unknown",
  birthDate: p.fechaNacimiento || undefined,
  address: p.ciudadResidencia
    ? [{ text: p.ciudadResidencia, country: "CO" }]
    : undefined,
});
export const _generarFHIRPractitioner = (d) => ({
  resourceType: "Practitioner",
  id: "prac-" + (d?.cedula || "doc").replace(/\s/g, ""),
  meta: { profile: ["http://hl7.org/fhir/StructureDefinition/Practitioner"] },
  identifier: [
    {
      system: "https://www.colmedicos.com",
      type: { coding: [{ code: "MD" }] },
      value: d?.licencia || d?.cedula || "",
    },
  ],
  name: [
    {
      use: "official",
      text: d?.nombre || "",
      family: (d?.nombre || "").split(" ").slice(-1)[0],
      given: [(d?.nombre || "").split(" ")[0]],
    },
  ],
  qualification: [
    {
      code: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0360",
            code: "MD",
            display: "Doctor of Medicine",
          },
        ],
      },
      issuer: { display: "Ministerio de Salud de Colombia" },
      identifier: [{ value: d?.licencia || "" }],
    },
  ],
});
export const _generarFHIRObservation = (p, tipo) => ({
  resourceType: "Observation",
  id: "obs-" + tipo + "-" + (p.id || Date.now()),
  meta: { profile: ["http://hl7.org/fhir/StructureDefinition/Observation"] },
  status: "final",
  category: [
    {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/observation-category",
          code: "exam",
          display: "Exam",
        },
      ],
    },
  ],
  code: {
    coding: [
      {
        system: "http://loinc.org",
        code: "34108-1",
        display: "Outpatient Note",
      },
    ],
    text: tipo,
  },
  subject: {
    reference:
      "Patient/pat-" +
      (p.docNumero || p.id || "").toString().replace(/\s/g, ""),
  },
  effectiveDateTime: p.fechaExamen || new Date().toISOString().split("T")[0],
  valueString: p.conceptoAptitud || "",
  note: p.restricciones ? [{ text: p.restricciones }] : undefined,
});
export const _generarFHIRBundle = (paciente, doctor) => {
  const bundle = {
    resourceType: "Bundle",
    id: "bundle-" + Date.now(),
    type: "document",
    meta: {
      lastUpdated: new Date().toISOString(),
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"],
    },
    identifier: {
      system: "https://siso.ocupasalud.co/fhir",
      value: "SISO-" + (paciente.codigoVerificacion || Date.now()),
    },
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: "urn:uuid:patient-1",
        resource: _generarFHIRPatient(paciente),
      },
      {
        fullUrl: "urn:uuid:practitioner-1",
        resource: _generarFHIRPractitioner(doctor),
      },
      {
        fullUrl: "urn:uuid:observation-1",
        resource: _generarFHIRObservation(paciente, "Aptitud Laboral"),
      },
    ],
  };
  return bundle;
};

// ══════════════════════════════════════════════════════════════════════════
// B-25: VALIDACIÓN RIPS - Res. 2275/2023 Schema v2
// ══════════════════════════════════════════════════════════════════════════
export const validarRIPSPaciente = (p) => {
  const errs = [];
  if (!p.docNumero || p.docNumero.length < 4) errs.push("docNumero inválido");
  if (!p.fechaExamen) errs.push("fechaExamen requerida");
  if (!p.tipoExamen) errs.push("tipoExamen requerido");
  if (!p.conceptoAptitud) errs.push("conceptoAptitud requerido para RIPS");
  if (!p.eps) errs.push("EPS requerida para RIPS");
  return errs;
};
export const validarRIPSLote = (pacientes) => {
  const errores = [];
  pacientes.forEach((p, idx) => {
    const e = validarRIPSPaciente(p);
    if (e.length)
      errores.push(
        `Paciente ${idx + 1} (${p.nombres || "sin nombre"}): ${e.join(", ")}`
      );
  });
  return errores;
};
export const _generarRIPSJson = (pacientes, doctorData, periodo) => {
  const now = new Date().toISOString();
  const numFactura = "SISO-" + Date.now();
  // Archivo AF: Datos de afiliación de cada paciente atendido
  const AF = pacientes.map((p) => ({
    tipoDocumentoIdentificacion: p.docTipo || "CC",
    numDocumentoIdentificacion: p.docNumero || "",
    tipoUsuario: "1", // Contributivo
    fechaNacimiento: p.fechaNacimiento || "",
    codSexo:
      p.genero === "Femenino" ? "F" : p.genero === "Masculino" ? "M" : "N",
    codPaisResidencia: "CO",
    codMunicipioResidencia: "19001", // Default Popayán - personalizable
    codZonaTerritorialResidencia: p.zonaResidencia === "Rural" ? "2" : "1",
    incapacidad: p.diasIncapacidad ? "S" : "N",
    codPaisOrigen: "CO",
  }));
  // Archivo AT: Resumen de atención
  const AT = [
    {
      codPrestador: doctorData?.licencia?.substring(0, 12) || "SISO001",
      fechaInicioAtencion: pacientes[0]?.fechaExamen || now.split("T")[0],
      numAutorizacion: "",
      numDocumentoIdentificacion: pacientes[0]?.docNumero || "",
      tipoDocumentoIdentificacion: pacientes[0]?.docTipo || "CC",
      viaIngresoServicioSalud: "1", // Consulta externa
      modalidadGrupoServicioTecSal: "01",
      grupoServicios: "01",
      codServicio: "890201", // Medicina del trabajo
      finalidadTecnologiaSalud: "27", // Medicina laboral
      causaMotivoAtencion: "26", // Evaluación ocupacional
      codDiagnosticoPrincipal:
        pacientes[0]?.diagnosticoPrincipal?.substring(0, 4) || "Z00",
      codDiagnosticoPrincipalE: "",
      condicionSalidaPaciente: "1",
      codComplicacion: "",
      numFEVPagadora: "",
      consecutivo: "1",
    },
  ];
  // Archivo AC: Detalle de consultas
  const AC = pacientes.map((p, i) => ({
    codPrestador: doctorData?.licencia?.substring(0, 12) || "SISO001",
    viaIngresoServicioSalud: "1",
    fechaInicioAtencion: p.fechaExamen || now.split("T")[0],
    horaInicioAtencion: "08:00",
    fechaFinAtencion: p.fechaExamen || now.split("T")[0],
    horaFinAtencion: "08:30",
    tipoDocumentoIdentificacion: p.docTipo || "CC",
    numDocumentoIdentificacion: p.docNumero || "",
    tipoUsuario: "1",
    codConsulta: "890201",
    modalidadGrupoServicioTecSal: "01",
    grupoServicios: "01",
    codServicio: "890201",
    finalidadTecnologiaSalud: "27",
    causaMotivoAtencion: "26",
    codDiagnosticoPrincipal: p.diagnosticoPrincipal?.substring(0, 4) || "Z00",
    tipoDocumentoDX: "D",
    codDiagnosticoRelacionado1: p.diagnosticoSecundario1?.substring(0, 4) || "",
    tipoDX1: p.diagnosticoSecundario1 ? "D" : "",
    vrServicio: 90000,
    numFEVPagadora: "",
    consecutivo: String(i + 1),
  }));
  return {
    version: "1.0",
    generadoEn: now,
    periodo: periodo || now.substring(0, 7),
    norma: "Resolución 2275/2023",
    prestador: {
      nombre: doctorData?.nombre || "",
      nit: doctorData?.rut?.replace("-", "") || "",
      codigoPrestador: doctorData?.licencia?.substring(0, 12) || "SISO001",
    },
    numDocumentoIdObligado: doctorData?.cedula?.replace(/[^0-9]/g, "") || "",
    AF,
    AT,
    AC,
    totalRegistros: { AF: AF.length, AT: AT.length, AC: AC.length },
    advertencia:
      "RIPS generado por SISO v4.0. Para radicación formal ante MinSalud se requiere firma electrónica DIAN certificada y validación en ADRES.",
  };
};
// Descarga RIPS JSON sin createObjectURL (compatible con sandbox/CSP)
export const _descargarRIPSJson = (pacientes, doctorData, periodo) => {
  try {
    const rips = _generarRIPSJson(pacientes, doctorData, periodo);
    const jsonStr = JSON.stringify(rips, null, 2);
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
    const a = document.createElement("a");
    a.href = "data:application/json;base64," + b64;
    a.download = `RIPS_SISO_${
      periodo || new Date().toISOString().substring(0, 7)
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (e) {
    console.error("RIPS download error:", e);
    return false;
  }
};
// ==========================================
