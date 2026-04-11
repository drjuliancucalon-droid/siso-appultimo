import { describe, it, expect } from 'vitest';
import { validarRIPSPaciente, validarRIPSLote, _generarRIPSJson, _generarFHIRPatient } from '../utils/rips.js';

// validarRIPSPaciente(p) → returns array of error strings (empty = valid)
// validarRIPSLote(pacientes) → returns array of error strings
// _generarRIPSJson(pacientes, doctorData, periodo) → returns RIPS object with AF, AT, AC, etc.
// _generarFHIRPatient(p) → returns FHIR Patient resource object

const pacienteCompleto = {
  id: 'p001',
  docNumero: '12345678',
  docTipo: 'CC',
  nombres: 'Juan Pérez',
  fechaNacimiento: '1990-05-15',
  genero: 'Masculino',
  fechaExamen: '2025-01-10',
  tipoExamen: 'INGRESO',
  conceptoAptitud: 'APTO',
  eps: 'NUEVA EPS',
  diagnosticoPrincipal: 'Z10.0',
};

describe('rips — validarRIPSPaciente', () => {
  it('valida paciente completo sin errores — devuelve array vacío', () => {
    const errors = validarRIPSPaciente(pacienteCompleto);
    expect(Array.isArray(errors)).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('detecta campos faltantes — devuelve array con errores', () => {
    const errors = validarRIPSPaciente({ id: 'p002', nombres: 'Ana' });
    expect(Array.isArray(errors)).toBe(true);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('detecta docNumero corto', () => {
    const errors = validarRIPSPaciente({ ...pacienteCompleto, docNumero: '12' });
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('rips — validarRIPSLote', () => {
  it('lote sin errores — devuelve array vacío', () => {
    const errors = validarRIPSLote([pacienteCompleto]);
    expect(Array.isArray(errors)).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('lote con paciente inválido — devuelve errores', () => {
    const errors = validarRIPSLote([{ id: 'x', nombres: 'Sin datos' }]);
    expect(Array.isArray(errors)).toBe(true);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('lote mixto — solo reporta pacientes con errores', () => {
    const errors = validarRIPSLote([
      pacienteCompleto,
      { id: 'x', nombres: 'Incompleto' },
    ]);
    expect(errors.length).toBe(1);
  });
});

describe('rips — _generarRIPSJson', () => {
  const doctor = {
    nombre: 'Dr. Cucalon',
    cedula: '987654321',
    licencia: 'RM123456',
    rut: '12345678-9',
  };

  it('genera estructura RIPS con campos requeridos', () => {
    const rips = _generarRIPSJson([pacienteCompleto], doctor, { inicio: '2025-01-01', fin: '2025-01-31' });
    expect(rips).toBeDefined();
    expect(rips).toHaveProperty('AF');
    expect(rips).toHaveProperty('AT');
    expect(rips).toHaveProperty('AC');
  });

  it('AF contiene datos del paciente', () => {
    const rips = _generarRIPSJson([pacienteCompleto], doctor);
    expect(Array.isArray(rips.AF)).toBe(true);
    expect(rips.AF).toHaveLength(1);
    expect(rips.AF[0]).toHaveProperty('numDocumentoIdentificacion');
  });

  it('incluye totalRegistros', () => {
    const rips = _generarRIPSJson([pacienteCompleto], doctor);
    expect(rips).toHaveProperty('totalRegistros');
    expect(rips.totalRegistros.AF).toBe(1);
  });

  it('incluye datos del prestador', () => {
    const rips = _generarRIPSJson([pacienteCompleto], doctor);
    expect(rips).toHaveProperty('prestador');
    expect(rips.prestador).toHaveProperty('nombre');
  });
});

describe('rips — _generarFHIRPatient', () => {
  it('genera recurso FHIR Patient', () => {
    const fhir = _generarFHIRPatient(pacienteCompleto);
    expect(fhir.resourceType).toBe('Patient');
    expect(fhir).toHaveProperty('identifier');
    expect(fhir).toHaveProperty('name');
  });

  it('identifier contiene docNumero', () => {
    const fhir = _generarFHIRPatient(pacienteCompleto);
    expect(fhir.identifier[0].value).toBe('12345678');
  });

  it('gender mapeado correctamente', () => {
    const fhir = _generarFHIRPatient({ ...pacienteCompleto, genero: 'Masculino' });
    expect(fhir.gender).toBe('male');
    const fhirF = _generarFHIRPatient({ ...pacienteCompleto, genero: 'Femenino' });
    expect(fhirF.gender).toBe('female');
  });
});
