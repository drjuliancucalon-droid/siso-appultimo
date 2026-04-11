import { describe, it, expect, beforeEach } from 'vitest';
import { _rl, _rlCheck, _SESSION_TIMEOUT_MS, _validarContrasena } from '../utils/security.jsx';

// _validarContrasena returns { valida: bool, errores: [], fortaleza: 0-5 }
// _rlCheck: returns true if under limit, false if over 120

describe('security — rate limiter', () => {
  beforeEach(() => {
    _rl.count = 0;
    _rl.reset = Date.now() + 60000;
  });

  it('_rlCheck devuelve true con pocos intentos', () => {
    _rl.count = 5;
    expect(_rlCheck()).toBe(true);
  });

  it('_rlCheck devuelve false cuando supera 120 intentos', () => {
    _rl.count = 120;
    // next call increments to 121 -> false
    expect(_rlCheck()).toBe(false);
  });

  it('_SESSION_TIMEOUT_MS es 30 minutos en ms', () => {
    expect(_SESSION_TIMEOUT_MS).toBe(30 * 60 * 1000);
  });

  it('rate limiter se reinicia cuando el tiempo expiró', () => {
    _rl.count = 150;
    _rl.reset = Date.now() - 1000; // ya expiró
    const result = _rlCheck();
    expect(result).toBe(true); // reinició
    expect(_rl.count).toBe(1);
  });
});

describe('security — _validarContrasena', () => {
  it('contraseña fuerte pasa todos los criterios', () => {
    const r = _validarContrasena('MiClave#2025');
    expect(r.valida).toBe(true);
    expect(r.errores).toHaveLength(0);
    expect(r.fortaleza).toBe(5);
  });

  it('contraseña corta falla por longitud', () => {
    const r = _validarContrasena('abc');
    expect(r.valida).toBe(false);
    expect(r.errores.length).toBeGreaterThan(0);
  });

  it('contraseña sin mayúscula falla', () => {
    const r = _validarContrasena('miclave#2025');
    expect(r.valida).toBe(false);
    expect(r.errores.some(e => e.includes('mayúscula'))).toBe(true);
  });

  it('contraseña sin minúscula falla', () => {
    const r = _validarContrasena('MICLAVE#2025');
    expect(r.valida).toBe(false);
  });

  it('contraseña sin número falla', () => {
    const r = _validarContrasena('MiClaveSegura!');
    expect(r.valida).toBe(false);
  });

  it('contraseña sin carácter especial falla', () => {
    const r = _validarContrasena('MiClave12345');
    expect(r.valida).toBe(false);
  });

  it('contraseña vacía falla todo', () => {
    const r = _validarContrasena('');
    expect(r.valida).toBe(false);
    expect(r.errores.length).toBeGreaterThan(0);
  });

  it('fortaleza tiene rango 0-5', () => {
    const r = _validarContrasena('MiClave#2025');
    expect(r.fortaleza).toBeGreaterThanOrEqual(0);
    expect(r.fortaleza).toBeLessThanOrEqual(5);
  });
});
