import { describe, it, expect } from 'vitest';

describe('Shared UI components', () => {
  it('SecurityHeaders should be importable', async () => {
    const mod = await import('../shared/ui/SecurityHeaders.jsx');
    expect(mod.default).toBeDefined();
  });
  it('PrintStyles should be importable', async () => {
    const mod = await import('../shared/ui/PrintStyles.jsx');
    expect(mod.default).toBeDefined();
  });
  it('MedicamentoAutocomplete should be importable', async () => {
    const mod = await import('../shared/ui/MedicamentoAutocomplete.jsx');
    expect(mod.default).toBeDefined();
  });
  it('AgendaFieldF should be importable', async () => {
    const mod = await import('../shared/ui/AgendaFieldF.jsx');
    expect(mod.default).toBeDefined();
  });
  it('CIE10Input should be importable', async () => {
    const mod = await import('../shared/ui/CIE10Input.jsx');
    expect(mod.default).toBeDefined();
  });
  it('CIE11Badge should be importable', async () => {
    const mod = await import('../shared/ui/CIE11Badge.jsx');
    expect(mod.default).toBeDefined();
  });
});

describe('Auth module', () => {
  it('LoginForm should be importable', async () => {
    const mod = await import('../modules/auth/ui/LoginForm.jsx');
    expect(mod.default).toBeDefined();
  });
  it('PrivacyModal should be importable', async () => {
    const mod = await import('../modules/auth/ui/PrivacyModal.jsx');
    expect(mod.default).toBeDefined();
  });
  it('ChangePasswordForm should be importable', async () => {
    const mod = await import('../modules/auth/ui/ChangePasswordForm.jsx');
    expect(mod.default).toBeDefined();
  });
});

describe('Clinical module', () => {
  it('AIConfigPanel should be importable', async () => {
    const mod = await import('../modules/clinical/ui/AIConfigPanel.jsx');
    expect(mod.default).toBeDefined();
  });
  it('LicenciasTab should be importable', async () => {
    const mod = await import('../modules/clinical/ui/LicenciasTab.jsx');
    expect(mod.default).toBeDefined();
  });
  it('RestriccionesChecklistPanel should be importable', async () => {
    const mod = await import('../modules/clinical/ui/RestriccionesChecklistPanel.jsx');
    expect(mod.default).toBeDefined();
  });
  it('RecomendacionesChecklistPanel should be importable', async () => {
    const mod = await import('../modules/clinical/ui/RecomendacionesChecklistPanel.jsx');
    expect(mod.default).toBeDefined();
  });
  it('ConsentimientoModal should be importable', async () => {
    const mod = await import('../modules/clinical/ui/ConsentimientoModal.jsx');
    expect(mod.default).toBeDefined();
  });
  it('NotificacionModal should be importable', async () => {
    const mod = await import('../modules/clinical/ui/NotificacionModal.jsx');
    expect(mod.default).toBeDefined();
  });
});

describe('Patients module', () => {
  it('PortalPublicoTrabajador should be importable', async () => {
    const mod = await import('../modules/patients/ui/PortalPublicoTrabajador.jsx');
    expect(mod.default).toBeDefined();
  });
});