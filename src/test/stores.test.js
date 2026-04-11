import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { usePatientsStore } from '../stores/patientsStore.js';
import { useCompaniesStore } from '../stores/companiesStore.js';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: null, loginAttempts: 0, loginBlockedUntil: null, privacidadAceptada: false });
  });

  it('setCurrentUser actualiza el usuario', () => {
    useAuthStore.getState().setCurrentUser({ user: 'dr_test', role: 'medico' });
    expect(useAuthStore.getState().currentUser?.user).toBe('dr_test');
  });

  it('recordFailedAttempt incrementa intentos', () => {
    useAuthStore.getState().recordFailedAttempt();
    expect(useAuthStore.getState().loginAttempts).toBe(1);
  });

  it('5 intentos fallidos activan bloqueo', () => {
    for (let i = 0; i < 5; i++) useAuthStore.getState().recordFailedAttempt();
    expect(useAuthStore.getState().loginBlockedUntil).not.toBeNull();
    expect(useAuthStore.getState().loginBlockedUntil).toBeGreaterThan(Date.now());
  });

  it('resetLoginBlock limpia bloqueo', () => {
    useAuthStore.getState().recordFailedAttempt();
    useAuthStore.getState().resetLoginBlock();
    expect(useAuthStore.getState().loginAttempts).toBe(0);
    expect(useAuthStore.getState().loginBlockedUntil).toBeNull();
  });

  it('logout limpia usuario', () => {
    useAuthStore.setState({ currentUser: { user: 'test' } });
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().currentUser).toBeNull();
  });
});

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({ view: 'login', navStack: [], alertMsg: '', activeTab: 'form' });
  });

  it('setView cambia la vista', () => {
    useUIStore.getState().setView('dashboard');
    expect(useUIStore.getState().view).toBe('dashboard');
  });

  it('navigate agrega a navStack', () => {
    useUIStore.setState({ view: 'dashboard', navStack: [] });
    useUIStore.getState().navigate('historia');
    expect(useUIStore.getState().view).toBe('historia');
    expect(useUIStore.getState().navStack).toContain('dashboard');
  });

  it('goBack regresa a la vista anterior', () => {
    useUIStore.setState({ view: 'historia', navStack: ['dashboard'] });
    useUIStore.getState().goBack();
    expect(useUIStore.getState().view).toBe('dashboard');
  });

  it('setAlertMsg guarda mensaje', () => {
    useUIStore.getState().setAlertMsg('Error de prueba');
    expect(useUIStore.getState().alertMsg).toBe('Error de prueba');
  });

  it('clearAlert limpia mensaje', () => {
    useUIStore.setState({ alertMsg: 'msg' });
    useUIStore.getState().clearAlert();
    expect(useUIStore.getState().alertMsg).toBe('');
  });
});

describe('patientsStore', () => {
  beforeEach(() => {
    usePatientsStore.setState({ patientsList: [], patientSearchTerm: '' });
  });

  it('setPatientsList actualiza lista', () => {
    const lista = [{ id: '1', nombre: 'Juan' }];
    usePatientsStore.getState().setPatientsList(lista);
    expect(usePatientsStore.getState().patientsList).toHaveLength(1);
  });

  it('upsertPatient agrega nuevo paciente', () => {
    usePatientsStore.getState().upsertPatient({ id: 'p1', nombre: 'Ana' });
    expect(usePatientsStore.getState().patientsList).toHaveLength(1);
  });

  it('upsertPatient actualiza existente', () => {
    usePatientsStore.setState({ patientsList: [{ id: 'p1', nombre: 'Ana' }] });
    usePatientsStore.getState().upsertPatient({ id: 'p1', nombre: 'Ana M.' });
    expect(usePatientsStore.getState().patientsList).toHaveLength(1);
    expect(usePatientsStore.getState().patientsList[0].nombre).toBe('Ana M.');
  });

  it('deletePatient elimina por id', () => {
    usePatientsStore.setState({ patientsList: [{ id: 'p1' }, { id: 'p2' }] });
    usePatientsStore.getState().deletePatient('p1');
    expect(usePatientsStore.getState().patientsList).toHaveLength(1);
  });
});

describe('companiesStore', () => {
  beforeEach(() => {
    useCompaniesStore.setState({ companies: [], usersList: [] });
  });

  it('setCompaniesList actualiza empresas', () => {
    useCompaniesStore.getState().setCompaniesList([{ id: 'e1', nombre: 'Empresa Test' }]);
    expect(useCompaniesStore.getState().companies).toHaveLength(1);
  });

  it('upsertCompany agrega nueva empresa', () => {
    useCompaniesStore.getState().upsertCompany({ id: 'e1', nombre: 'Empresa A' });
    expect(useCompaniesStore.getState().companies).toHaveLength(1);
  });

  it('deleteCompany elimina por id', () => {
    useCompaniesStore.setState({ companies: [{ id: 'e1' }, { id: 'e2' }] });
    useCompaniesStore.getState().deleteCompany('e1');
    expect(useCompaniesStore.getState().companies).toHaveLength(1);
  });
});
