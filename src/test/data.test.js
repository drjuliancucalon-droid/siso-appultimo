import { describe, it, expect } from 'vitest';
import { MEDICAMENTOS_CO_BASE } from '../data/medicamentos.js';
import { DERIVACIONES_CATALOG } from '../data/derivaciones.js';
import { RESTRICCIONES_CATALOG } from '../data/restricciones.js';
import { CIE10_OCUPACIONAL } from '../data/cie10.js';
import { CUPS_OCUPACIONAL } from '../data/cups.js';
import { CIE11_EQUIVALENCIAS } from '../data/cie11.js';
import { RECOMENDACIONES_CATALOG } from '../data/recomendaciones.js';
import { PLAN_CONFIG } from '../data/planConfig.js';
import { ARL_LIST, AFP_LIST, EPS_LIST } from '../data/dropdowns.js';

describe('data — MEDICAMENTOS_CO_BASE', () => {
  it('es un array no vacío', () => {
    expect(Array.isArray(MEDICAMENTOS_CO_BASE)).toBe(true);
    expect(MEDICAMENTOS_CO_BASE.length).toBeGreaterThan(100);
  });
  it('cada medicamento tiene propiedad g (nombre genérico)', () => {
    const sample = MEDICAMENTOS_CO_BASE.slice(0, 20);
    sample.forEach(m => {
      expect(m).toHaveProperty('g');
      expect(typeof m.g).toBe('string');
    });
  });
  it('cada medicamento tiene propiedad p (productos comerciales)', () => {
    const sample = MEDICAMENTOS_CO_BASE.slice(0, 20);
    sample.forEach(m => {
      expect(m).toHaveProperty('p');
      expect(Array.isArray(m.p)).toBe(true);
    });
  });
});

describe('data — DERIVACIONES_CATALOG', () => {
  it('es un array no vacío', () => {
    expect(Array.isArray(DERIVACIONES_CATALOG)).toBe(true);
    expect(DERIVACIONES_CATALOG.length).toBeGreaterThan(5);
  });
  it('cada derivación tiene esp (especialidad) y motivo', () => {
    DERIVACIONES_CATALOG.slice(0, 10).forEach(d => {
      expect(d).toHaveProperty('esp');
      expect(d).toHaveProperty('motivo');
    });
  });
});

describe('data — RESTRICCIONES_CATALOG', () => {
  it('es un objeto no vacío', () => {
    expect(typeof RESTRICCIONES_CATALOG).toBe('object');
    expect(Object.keys(RESTRICCIONES_CATALOG).length).toBeGreaterThan(0);
  });
});

describe('data — CIE10_OCUPACIONAL', () => {
  it('es un array con códigos CIE-10 válidos', () => {
    expect(Array.isArray(CIE10_OCUPACIONAL)).toBe(true);
    expect(CIE10_OCUPACIONAL.length).toBeGreaterThan(50);
    const sample = CIE10_OCUPACIONAL.slice(0, 30);
    const pattern = /^[A-Z][0-9]{2}(\.[0-9X]{1,3})?$/;
    sample.forEach(item => {
      expect(item.code).toMatch(pattern);
    });
  });
});

describe('data — CUPS_OCUPACIONAL', () => {
  it('es un array con códigos CUPS válidos', () => {
    expect(Array.isArray(CUPS_OCUPACIONAL)).toBe(true);
    expect(CUPS_OCUPACIONAL.length).toBeGreaterThan(20);
  });
});

describe('data — CIE11_EQUIVALENCIAS', () => {
  it('cada equivalencia tiene cie10 y cie11', () => {
    expect(Array.isArray(CIE11_EQUIVALENCIAS)).toBe(true);
    CIE11_EQUIVALENCIAS.slice(0, 10).forEach(eq => {
      expect(eq).toHaveProperty('cie10');
      expect(eq).toHaveProperty('cie11');
    });
  });
});

describe('data — PLAN_CONFIG', () => {
  it('tiene los 4 planes', () => {
    expect(PLAN_CONFIG).toHaveProperty('libre');
    expect(PLAN_CONFIG).toHaveProperty('starter');
    expect(PLAN_CONFIG).toHaveProperty('pro');
    expect(PLAN_CONFIG).toHaveProperty('clinica');
  });
  it('plan libre es gratis', () => {
    expect(PLAN_CONFIG.libre.price).toBe(0);
  });
});

describe('data — dropdowns', () => {
  it('ARL_LIST no está vacío', () => expect(ARL_LIST.length).toBeGreaterThan(0));
  it('AFP_LIST no está vacío', () => expect(AFP_LIST.length).toBeGreaterThan(0));
  it('EPS_LIST no está vacío', () => expect(EPS_LIST.length).toBeGreaterThan(0));
});

describe('data — RECOMENDACIONES', () => {
  it('RECOMENDACIONES_CATALOG es objeto no vacío', () => {
    expect(typeof RECOMENDACIONES_CATALOG).toBe('object');
    expect(Object.keys(RECOMENDACIONES_CATALOG).length).toBeGreaterThan(0);
  });
  it('cada categoría tiene label e items', () => {
    const firstCat = Object.values(RECOMENDACIONES_CATALOG)[0];
    expect(firstCat).toHaveProperty('label');
    expect(firstCat).toHaveProperty('items');
    expect(Array.isArray(firstCat.items)).toBe(true);
  });
});
