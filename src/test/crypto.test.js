import { describe, it, expect } from 'vitest';
import { _sha256, _pbkdf2Hash, _verifyPassword, _sanitize, _H } from '../utils/crypto.js';

describe('crypto — _sha256', () => {
  it('genera hash de 64 caracteres hexadecimales', async () => {
    const h = await _sha256('test');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it('mismo input → mismo hash', async () => {
    const a = await _sha256('SISO');
    const b = await _sha256('SISO');
    expect(a).toBe(b);
  });

  it('distinto input → distinto hash', async () => {
    const a = await _sha256('aaa');
    const b = await _sha256('bbb');
    expect(a).not.toBe(b);
  });

  it('hash del string vacío tiene 64 chars', async () => {
    const h = await _sha256('');
    expect(h).toHaveLength(64);
  });
});

describe('crypto — _sanitize', () => {
  it('escapa caracteres HTML peligrosos', () => {
    expect(_sanitize('<script>alert(1)</script>')).not.toContain('<script>');
    expect(_sanitize('"hola"')).toContain('&quot;');
  });

  it('devuelve string vacío para input no-string', () => {
    expect(_sanitize(null)).toBe('');
    expect(_sanitize(undefined)).toBe('');
  });

  it('no modifica texto limpio', () => {
    expect(_sanitize('Hola mundo')).toBe('Hola mundo');
  });

  it('escapa &', () => {
    expect(_sanitize('a & b')).toContain('&amp;');
  });

  it('escapa comillas simples', () => {
    expect(_sanitize("it's")).toContain('&#x27;');
  });
});

describe('crypto — _pbkdf2Hash', () => {
  it('retorna objeto con propiedades hash y salt', async () => {
    // _pbkdf2Hash returns { hash, salt } — not a plain string
    const result = await _pbkdf2Hash('password123', '0123456789abcdef');
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('hash');
    expect(result).toHaveProperty('salt');
  });

  it('hash es string hexadecimal no vacío', async () => {
    const result = await _pbkdf2Hash('MiClave@2025', 'aabbccdd11223344');
    expect(typeof result.hash).toBe('string');
    expect(result.hash.length).toBeGreaterThan(20);
  });

  it('mismo password y salt → mismo hash', async () => {
    const r1 = await _pbkdf2Hash('TestPass!1', 'abcd1234');
    const r2 = await _pbkdf2Hash('TestPass!1', 'abcd1234');
    expect(r1.hash).toBe(r2.hash);
  });

  it('passwords distintos → hashes distintos', async () => {
    const r1 = await _pbkdf2Hash('Pass1!', 'abcd1234');
    const r2 = await _pbkdf2Hash('Pass2!', 'abcd1234');
    expect(r1.hash).not.toBe(r2.hash);
  });
});

describe('crypto — _verifyPassword', () => {
  it('verifica password correcta', async () => {
    const { hash, salt } = await _pbkdf2Hash('MiPass#2025', 'testSalt1234');
    const valid = await _verifyPassword('MiPass#2025', hash, salt);
    expect(valid).toBe(true);
  });

  it('rechaza password incorrecta', async () => {
    const { hash, salt } = await _pbkdf2Hash('MiPass#2025', 'testSalt1234');
    const valid = await _verifyPassword('OtroPass#2025', hash, salt);
    expect(valid).toBe(false);
  });
});

describe('crypto — _H', () => {
  it('_H es un objeto con adminCode hash', () => {
    expect(typeof _H).toBe('object');
    expect(_H).toHaveProperty('adminCode');
    expect(typeof _H.adminCode).toBe('string');
    expect(_H.adminCode.length).toBe(64); // SHA-256 hex
  });
});
