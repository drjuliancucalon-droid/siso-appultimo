// RDA - Resumen Digital de Atención - Res. 1888/2025

export const _generarRDA = (paciente, doctorData, sesionId) => {
  if (!paciente || !paciente.fechaExamen) return null;
  const now = new Date().toISOString();
  return {
    version: "1.0",
    norma: "Resolución 1888/2025 MinSalud",
    fechaGeneracion: now,
    entidadGeneradora: {
      tipoDocumento: "CC",
      numDocumento: (doctorData?.cedula || "").replace(/[^0-9]/g, ""),
      nombreEntidad: doctorData?.nombre || "",
      municipio: doctorData?.ciudad || "Popayán",
    },
    paciente: {
      tipoDocumento: paciente.docTipo || "CC",
      numDocumento: paciente.docNumero || "",
      primerNombre: (paciente.nombres || "").split(" ")[0],
      primerApellido: (paciente.nombres || "").split(" ").slice(-1)[0],
      fechaNacimiento: paciente.fechaNacimiento || "",
      genero:
        paciente.genero === "Masculino"
          ? "M"
          : paciente.genero === "Femenino"
          ? "F"
          : "I",
    },
    atencion: {
      fechaAtencion: paciente.fechaExamen || now.split("T")[0],
      tipoAtencion: "01", // 01 = Consulta externa
      modalidad: "01", // 01 = Presencial
      tipoServicio:
        paciente.type === "ocupacional"
          ? "SALUD_OCUPACIONAL"
          : "MEDICINA_GENERAL",
      tipoExamen: paciente.tipoExamen || "INGRESO",
      codigoVerificacion:
        paciente.codigoVerificacion || paciente.firmaDigital?.codigoQR || "",
      sesionId: sesionId || "",
    },
    diagnosticos: (paciente.diagnosticos || []).slice(0, 4).map((d) => ({
      codigo: d.codigo || d,
      tipo: d.tipo || "IMPRESION_DIAGNOSTICA",
      descripcion: d.descripcion || d,
    })),
    conceptoAptitud: paciente.conceptoAptitud || "",
    restricciones: (paciente.restricciones || []).length,
    rdaGeneradoEn: now,
    _nota:
      "RDA generado por SISO. Para transmisión oficial al IHCE se requiere firma electrónica certificada.",
  };
};
export const _descargarRDA = (paciente, doctorData, sesionId) => {
  try {
    const rda = _generarRDA(paciente, doctorData, sesionId);
    if (!rda) return false;
    const jsonStr = JSON.stringify(rda, null, 2);
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
    const a = document.createElement("a");
    a.href = "data:application/json;base64," + b64;
    a.download = `RDA_${paciente.docNumero}_${paciente.fechaExamen}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (e) {
    console.error("RDA error:", e);
    return false;
  }
};
