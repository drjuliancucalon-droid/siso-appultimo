import { openPrintWindow, PrintStyles, generateHCPrintHTML, printHC, printCertificateBatch, printDisability, printCarnet, printSection } from '../printService';

jest.mock('window', () => ({
  open: jest.fn(),
  alert: jest.fn(),
}));

jest.mock('document', () => ({
  write: jest.fn(),
  close: jest.fn(),
}));

describe('printService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens print window with correct HTML', () => {
    openPrintWindow('Test', '<div>Content</div>');
    expect(window.open).toHaveBeenCalledWith('', '_blank', 'width=800,height=900');
    const expectedHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Test</title>
  <style>${PrintStyles}</style>
</head>
<body>
  <div>Content</div>
  <div class="footer">
    SISO OcupaSalud Pro — Documento generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}
    <br>Res. 1843/2025 · Res. 1995/1999 · Ley 1581/2012
  </div>
</body>
</html>`;
    expect(document.write).toHaveBeenCalledWith(expectedHtml);
  });

  it('generates correct HC print HTML', () => {
    const data = {
      nombres: 'Test Paciente',
      docNumero: '123456',
      fechaExamen: '2026-05-05',
      conceptoAptitud: 'Apto',
    };
    const html = generateHCPrintHTML(data, { nombre: 'Dr. Test' });
    expect(html).toContain('HISTORIA CLÍNICA OCUPACIONAL');
    expect(html).toContain('Test Paciente');
    expect(html).toContain('Apto');
  });

  it('prints HC correctly', () => {
    const data = { nombres: 'Test' };
    printHC(data, { nombre: 'Dr. Test' });
    expect(openPrintWindow).toHaveBeenCalledWith(
      'HC Ocupacional — Test — 2026-05-05',
      expect.any(String)
    );
  });

  it('prints certificate batch correctly', () => {
    const patients = [{
      nombres: 'Paciente 1',
      conceptoAptitud: 'Apto',
      fechaExamen: '2026-05-05',
    }];
    printCertificateBatch(patients, { nombre: 'Dr. Test' });
    expect(openPrintWindow).toHaveBeenCalledWith(
      'Certificados Batch — 1 pacientes',
      expect.any(String)
    );
  });

  it('prints disability certificate correctly', () => {
    printDisability({ dias: 5 }, { nombres: 'Paciente' }, { nombre: 'Dr. Test' });
    expect(openPrintWindow).toHaveBeenCalledWith(
      'Incapacidad — Paciente — 5 días',
      expect.any(String)
    );
  });

  it('prints carnet correctly', () => {
    printCarnet({ nombres: 'Paciente' }, { nombre: 'Dr. Test' });
    expect(openPrintWindow).toHaveBeenCalledWith(
      'Carnet — Paciente',
      expect.any(String),
      { width: 500, height: 400 }
    );
  });

  it('prints section correctly', () => {
    printSection('gn-prescripcion', { formulaMedicamentos: [{ nombre: 'Paracetamol' }] }, { nombre: 'Dr. Test' });
    expect(openPrintWindow).toHaveBeenCalledWith(
      'gn-prescripcion — Paciente',
      expect.any(String)
    );
  });
});