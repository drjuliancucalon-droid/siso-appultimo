import { describe, it, expect } from 'vitest';
import { numeroALetras, analyzeBP, analyzeHR, analyzeBMI, getSpanishDate } from '../utils/helpers.js';

describe('helpers — numeroALetras', () => {
  it('convierte 0 a CERO', () => expect(numeroALetras(0)).toBe('CERO'));
  it('convierte 1 a UN', () => expect(numeroALetras(1)).toMatch(/UN/));
  it('convierte 100 a CIEN', () => expect(numeroALetras(100)).toMatch(/CIEN/));
  it('convierte 1000 a MIL', () => expect(numeroALetras(1000)).toMatch(/MIL/));
  it('convierte 15 a QUINCE', () => expect(numeroALetras(15)).toBe('QUINCE'));
  it('devuelve string', () => expect(typeof numeroALetras(42)).toBe('string'));
  it('convierte 1000000', () => expect(numeroALetras(1000000)).toMatch(/MILLÓN/));
});

describe('helpers — analyzeBP', () => {
  // analyzeBP takes a string "sys/dia"
  it('presión normal', () => {
    const r = analyzeBP('110/70');
    expect(r).not.toBeNull();
    expect(r.text).toMatch(/Normotenso/i);
  });
  it('hipertensión grado 2', () => {
    const r = analyzeBP('145/95');
    expect(r).not.toBeNull();
    expect(r.text).toMatch(/HTA/i);
  });
  it('hipotensión', () => {
    const r = analyzeBP('85/55');
    expect(r).not.toBeNull();
    expect(r.text).toMatch(/Hipotensión/i);
  });
  it('devuelve null si formato inválido', () => {
    expect(analyzeBP('invalid')).toBeNull();
    expect(analyzeBP('')).toBeNull();
    expect(analyzeBP(null)).toBeNull();
  });
  it('devuelve objeto con text y color', () => {
    const r = analyzeBP('120/80');
    expect(r).toHaveProperty('text');
    expect(r).toHaveProperty('color');
  });
});

describe('helpers — analyzeHR', () => {
  // analyzeHR returns { text, color }
  it('FC normal', () => {
    const r = analyzeHR(70);
    expect(r).not.toBeNull();
    expect(r.text).toMatch(/Normal/i);
  });
  it('taquicardia', () => {
    const r = analyzeHR(110);
    expect(r).not.toBeNull();
    expect(r.text).toMatch(/Taquicardia/i);
  });
  it('bradicardia', () => {
    const r = analyzeHR(50);
    expect(r).not.toBeNull();
    expect(r.text).toMatch(/Bradicardia/i);
  });
  it('devuelve null para NaN', () => {
    expect(analyzeHR('abc')).toBeNull();
  });
});

describe('helpers — analyzeBMI', () => {
  // analyzeBMI returns { text, color }
  it('BMI normal', () => {
    const r = analyzeBMI(22);
    expect(r).not.toBeNull();
    expect(r.text).toMatch(/Normal/i);
  });
  it('sobrepeso', () => {
    const r = analyzeBMI(27);
    expect(r).not.toBeNull();
    expect(r.text).toMatch(/Sobrepeso/i);
  });
  it('obesidad', () => {
    const r = analyzeBMI(35);
    expect(r).not.toBeNull();
    expect(r.text).toMatch(/Obesidad/i);
  });
  it('bajo peso', () => {
    const r = analyzeBMI(16);
    expect(r).not.toBeNull();
    expect(r.text).toMatch(/Bajo Peso/i);
  });
});

describe('helpers — getSpanishDate', () => {
  it('devuelve string no vacío', () => expect(getSpanishDate(new Date())).toBeTruthy());
  it('contiene el año actual', () => expect(getSpanishDate(new Date())).toContain('2026'));
  it('formatea fecha ISO correctamente', () => {
    const result = getSpanishDate('2026-03-30');
    expect(result).toContain('Marzo');
    expect(result).toContain('2026');
  });
});
