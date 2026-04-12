import { describe, it, expect } from 'vitest';
import { PLAN_CONFIG, _isAdmin, _canUse } from '../shared/data/planConfig.js';
import { CIE10_OCUPACIONAL, _buscarCIE10 } from '../shared/data/cie10.js';
import { CIE11_EQUIVALENCIAS, _equivalenciaCIE11 } from '../shared/data/cie11.js';
import { CUPS_OCUPACIONAL, _buscarCUPS } from '../shared/data/cups.js';
import { DERIVACIONES_CATALOG } from '../shared/data/derivaciones.js';
import { RESTRICCIONES_CATALOG } from '../shared/data/restricciones.js';
import { RECOMENDACIONES_CATALOG, DEFAULT_RECOMENDACIONES_SELECTED } from '../shared/data/recomendaciones.js';
import { initialOccupPatientState, initialGeneralPatientState, initialUsers, initialCompanyState } from '../shared/data/initialStates.js';
import { AI_CONFIG_VERSION, parseAIJSON } from '../shared/lib/aiProviders.js';
import { numeroALetras, analyzeBP, analyzeHR, analyzeBMI, getSpanishDate, NORMAL_DESCRIPTIONS_SYSTEMS } from '../shared/lib/formatters.js';

describe('PlanConfig', () => {
  it('PLAN_CONFIG should have 4 plans', () => {
    expect(Object.keys(PLAN_CONFIG)).toHaveLength(4);
  });
  it('_isAdmin should identify admin role', () => {
    expect(_isAdmin('administrador')).toBe(true);
    expect(_isAdmin('medico')).toBe(false);
  });
  it('_canUse should check feature availability', () => {
    expect(_canUse('hc_ocupacional', { license: 'libre' })).toBe(true);
  });
});

describe('CIE10', () => {
  it('should have entries', () => {
    expect(CIE10_OCUPACIONAL.length).toBeGreaterThan(50);
  });
  it('_buscarCIE10 should find by code', () => {
    const results = _buscarCIE10('Z10');
    expect(results.length).toBeGreaterThan(0);
  });
  it('_buscarCIE10 should return empty for nonsense', () => {
    const results = _buscarCIE10('XYZXYZ999');
    expect(results.length).toBe(0);
  });
});

describe('CIE11', () => {
  it('should have equivalence entries', () => {
    expect(CIE11_EQUIVALENCIAS.length).toBeGreaterThan(10);
  });
  it('_equivalenciaCIE11 should find equivalence for known CIE-10 code', () => {
    const result = _equivalenciaCIE11('Z10.0');
    expect(result).toBeDefined();
  });
});

describe('CUPS', () => {
  it('should have entries', () => {
    expect(CUPS_OCUPACIONAL.length).toBeGreaterThan(20);
  });
  it('_buscarCUPS should find by code', () => {
    const results = _buscarCUPS('890');
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('Derivaciones', () => {
  it('should have entries', () => {
    expect(DERIVACIONES_CATALOG.length).toBeGreaterThan(10);
  });
  it('each entry should have id, esp, motivo, tipo', () => {
    DERIVACIONES_CATALOG.forEach(d => {
      expect(d).toHaveProperty('id');
      expect(d).toHaveProperty('esp');
      expect(d).toHaveProperty('motivo');
      expect(d).toHaveProperty('tipo');
    });
  });
});

describe('Restricciones', () => {
  it('should have body region categories', () => {
    expect(RESTRICCIONES_CATALOG).toHaveProperty('miembroSuperior');
  });
  it('each category should have label and items', () => {
    Object.values(RESTRICCIONES_CATALOG).forEach(cat => {
      expect(cat).toHaveProperty('label');
      expect(cat).toHaveProperty('items');
      expect(cat.items.length).toBeGreaterThan(0);
    });
  });
});

describe('Recomendaciones', () => {
  it('should have generales category', () => {
    expect(RECOMENDACIONES_CATALOG).toHaveProperty('generales');
  });
  it('DEFAULT_RECOMENDACIONES_SELECTED should have pre-selected items', () => {
    expect(Object.keys(DEFAULT_RECOMENDACIONES_SELECTED).length).toBeGreaterThan(5);
    expect(DEFAULT_RECOMENDACIONES_SELECTED.rg_01).toBe(true);
  });
});

describe('InitialStates', () => {
  it('initialOccupPatientState should have required fields', () => {
    expect(initialOccupPatientState).toHaveProperty('nombres');
    expect(initialOccupPatientState).toHaveProperty('docNumero');
  });
  it('initialGeneralPatientState should be an object', () => {
    expect(typeof initialGeneralPatientState).toBe('object');
  });
  it('initialUsers should be an array', () => {
    expect(Array.isArray(initialUsers)).toBe(true);
    expect(initialUsers.length).toBeGreaterThan(0);
  });
  it('initialCompanyState should have required fields', () => {
    expect(initialCompanyState).toHaveProperty('nombre');
  });
});

describe('AI Providers', () => {
  it('AI_CONFIG_VERSION should be a non-empty string', () => {
    expect(typeof AI_CONFIG_VERSION).toBe('string');
    expect(AI_CONFIG_VERSION.length).toBeGreaterThan(0);
  });
  it('parseAIJSON should parse valid JSON', () => {
    const result = parseAIJSON('{"key": "value"}');
    expect(result).toEqual({ key: 'value' });
  });
  it('parseAIJSON should handle markdown-wrapped JSON', () => {
    const result = parseAIJSON('```json\n{"key": "value"}\n```');
    expect(result).toEqual({ key: 'value' });
  });
  it('parseAIJSON should throw for empty input', () => {
    expect(() => parseAIJSON('')).toThrow();
  });
});

describe('Formatters', () => {
  it('analyzeBP should analyze blood pressure', () => {
    const result = analyzeBP('120/80');
    expect(result).toBeDefined();
  });
  it('analyzeHR should analyze heart rate', () => {
    const result = analyzeHR('72');
    expect(result).toBeDefined();
  });
  it('analyzeBMI should analyze BMI', () => {
    const result = analyzeBMI('25');
    expect(result).toBeDefined();
  });
  it('getSpanishDate should return formatted date', () => {
    const result = getSpanishDate(new Date('2026-01-15'));
    expect(result).toContain('Enero');
    expect(result).toContain('2026');
  });
  it('NORMAL_DESCRIPTIONS_SYSTEMS should have body systems', () => {
    expect(NORMAL_DESCRIPTIONS_SYSTEMS).toHaveProperty('cabeza');
  });
  it('numeroALetras should convert numbers', () => {
    const result = numeroALetras(100);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
