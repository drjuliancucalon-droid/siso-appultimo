import { describe, it, expect } from 'vitest';
import { _memStore, _ls, sp, sps } from '../shared/lib/storage.js';
import { _sanitize, _safeLogoUrl, sanitizeInput, validatePasswordStrength } from '../shared/lib/crypto.js';
import { _SB_URL, _SB_KEY, _SB_HEADERS, _patKey, _compKey } from '../shared/lib/supabase.js';
import { PLAN_CONFIG, _isAdmin, _canUse, SECRETARIA_PERMISOS_DEFAULT } from '../shared/data/planConfig.js';
import { ARL_LIST, EPS_LIST, DEFAULT_DOCTOR_DATA } from '../shared/data/catalogs.js';

describe('Storage', () => {
  it('sp should return fallback for missing key', () => {
    expect(sp('nonexistent_key_test_xyz', 'fallback')).toBe('fallback');
  });
  it('_ls should get/set items', () => {
    _ls.setItem('test_key_unit', 'test_value');
    expect(_ls.getItem('test_key_unit')).toBe('test_value');
    _ls.removeItem('test_key_unit');
    expect(_ls.getItem('test_key_unit')).toBeNull();
  });
  it('sps should return fallback for missing session key', () => {
    expect(sps('nonexistent_session_key', 'default')).toBe('default');
  });
});

describe('Crypto', () => {
  it('_sanitize should escape HTML', () => {
    const result = _sanitize('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });
  it('_safeLogoUrl should reject javascript: URLs', () => {
    expect(_safeLogoUrl('javascript:alert(1)')).toBe('');
  });
  it('_safeLogoUrl should allow https URLs', () => {
    expect(_safeLogoUrl('https://example.com/logo.png')).toBe('https://example.com/logo.png');
  });
  it('sanitizeInput should escape and trim', () => {
    expect(sanitizeInput('  <b>bold</b>  ')).not.toContain('<b>');
  });
  it('validatePasswordStrength should reject weak passwords', () => {
    expect(validatePasswordStrength('123').valid).toBe(false);
  });
  it('validatePasswordStrength should accept strong passwords', () => {
    expect(validatePasswordStrength('Str0ngPass!').valid).toBe(true);
  });
});

describe('Supabase config', () => {
  it('_SB_URL should be a valid Supabase URL', () => {
    expect(_SB_URL).toMatch(/^https:\/\//);
  });
  it('_SB_HEADERS should have apikey', () => {
    expect(_SB_HEADERS.apikey).toBeDefined();
  });
  it('_patKey should generate user-specific key', () => {
    expect(_patKey('user123')).toBe('siso_db_patients_user123');
  });
  it('_compKey should generate user-specific key', () => {
    expect(_compKey('user123')).toBe('siso_companies_user123');
  });
});

describe('Plan Config', () => {
  it('should have 4 plans', () => {
    expect(Object.keys(PLAN_CONFIG)).toHaveLength(4);
  });
  it('libre plan should be free', () => {
    expect(PLAN_CONFIG.libre.price).toBe(0);
  });
  it('_isAdmin should recognize administrador', () => {
    expect(_isAdmin('administrador')).toBe(true);
    expect(_isAdmin('medico')).toBe(false);
  });
  it('_canUse should work for libre plan', () => {
    const user = { license: 'libre' };
    expect(_canUse('hc_ocupacional', user)).toBe(true);
    expect(_canUse('ia_analisis', user)).toBe(false);
  });
  it('clinica plan should have "todo" feature', () => {
    expect(PLAN_CONFIG.clinica.features).toContain('todo');
  });
  it('SECRETARIA_PERMISOS_DEFAULT should deny all', () => {
    expect(Object.values(SECRETARIA_PERMISOS_DEFAULT).every(v => v === false)).toBe(true);
  });
});

describe('Catalogs', () => {
  it('ARL_LIST should have entries', () => {
    expect(ARL_LIST.length).toBeGreaterThan(0);
  });
  it('EPS_LIST should be sorted', () => {
    const sorted = [...EPS_LIST].sort();
    expect(EPS_LIST).toEqual(sorted);
  });
  it('DEFAULT_DOCTOR_DATA should have required fields', () => {
    expect(DEFAULT_DOCTOR_DATA).toHaveProperty('nombre');
    expect(DEFAULT_DOCTOR_DATA).toHaveProperty('cedula');
    expect(DEFAULT_DOCTOR_DATA).toHaveProperty('licencia');
  });
});
