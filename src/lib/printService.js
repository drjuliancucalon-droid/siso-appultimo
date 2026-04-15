// src/lib/printService.js — Print service for medical documents
// Opens a print window with formatted HTML content
// Matches the monolith's print system (window.open + document.write)

import { _sanitize } from '../shared/lib/security';

/**
 * Open a print window with formatted content
 * @param {string} title - Document title
 * @param {string} htmlContent - HTML body content
 * @param {object} options - { width, height, landscape }
 */
export function openPrintWindow(title, htmlContent, options = {}) {
  const { width = 800, height = 900, landscape = false } = options;

  const printStyles = `
    @page {
      size: ${landscape ? 'landscape' : 'portrait'};
      margin: 15mm 12mm;
    }
    body {
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 9.5pt;
      line-height: 1.4;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
    }
    h1 { font-size: 14pt; margin: 8px 0; color: #059669; }
    h2 { font-size: 11pt; margin: 6px 0; color: #047857; border-bottom: 1px solid #d1fae5; padding-bottom: 3px; }
    h3 { font-size: 10pt; margin: 4px 0; color: #065f46; }
    table { width: 100%; border-collapse: collapse; margin: 6px 0; }
    th { background: #ecfdf5; color: #065f46; font-weight: 700; text-align: left; padding: 4px 6px; font-size: 8pt; border: 1px solid #a7f3d0; }
    td { padding: 3px 6px; font-size: 8.5pt; border: 1px solid #e5e7eb; }
    .section { margin: 10px 0; page-break-inside: avoid; }
    .label { font-weight: 700; color: #374151; font-size: 8pt; }
    .value { color: #1f2937; }
    .badge { display: inline-block; padding: 1px 6px; border-radius: 8px; font-size: 7.5pt; font-weight: 700; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-yellow { background: #fef3c7; color: #92400e; }
    .signature-area { border-top: 2px solid #059669; margin-top: 20px; padding-top: 10px; }
    .qr-area { text-align: center; margin-top: 8px; }
    .footer { font-size: 7pt; color: #9ca3af; text-align: center; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 6px; }
    .no-print { display: none !important; }
    @media print {
      .no-print { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;

  const w = window.open('', '_blank', `width=${width},height=${height}`);
  if (!w) {
    alert('No se pudo abrir la ventana de impresión. Verifica que el navegador no bloquea popups.');
    return;
  }

  w.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${_sanitize(title)}</title>
  <style>${printStyles}</style>
</head>
<body>
  ${htmlContent}
  <div class="footer">
    SISO OcupaSalud Pro — Documento generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}
    <br>Res. 1843/2025 · Res. 1995/1999 · Ley 1581/2012
  </div>
</body>
</html>`);
  w.document.close();

  // Auto-print after a small delay
  setTimeout(() => {
    w.focus();
    w.print();
  }, 500);
}

/**
 * Generate HC print HTML from clinical data
 */
export function generateHCPrintHTML(data, doctorData, companyData) {
  const s = (v) => _sanitize(v || '—');
  const date = (v) => v ? new Date(v).toLocaleDateString('es-CO') : '—';

  const conceptoBadge = (concepto) => {
    if (!concepto) return '';
    const map = {
      'Apto': 'badge-green',
      'Apto con restricciones': 'badge-yellow',
      'Apto con recomendaciones': 'badge-yellow',
      'No apto': 'badge-red',
      'Aplazado': 'badge-red',
    };
    const cls = map[concepto] || 'badge-green';
    return `<span class="badge ${cls}">${s(concepto)}</span>`;
  };

  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
      <div>
        <h1 style="margin:0;">HISTORIA CLÍNICA OCUPACIONAL</h1>
        <p style="font-size:8pt;color:#6b7280;margin:2px 0;">${s(data.tipoExamen || 'Examen Ocupacional')} — ${date(data.fechaExamen)}</p>
      </div>
      <div style="text-align:right;">
        ${doctorData?.nombre ? `<p style="font-size:9pt;font-weight:900;color:#059669;">${s(doctorData.nombre)}</p>` : ''}
        ${doctorData?.licencia ? `<p style="font-size:7.5pt;color:#6b7280;">RM: ${s(doctorData.licencia)}</p>` : ''}
      </div>
    </div>

    <div class="section">
      <h2>📋 Identificación del Paciente</h2>
      <table>
        <tr><td class="label" width="25%">Nombre</td><td>${s(data.nombres)}</td><td class="label" width="15%">Documento</td><td>${s(data.docTipo)} ${s(data.docNumero)}</td></tr>
        <tr><td class="label">Fecha Nac.</td><td>${date(data.fechaNacimiento)}</td><td class="label">Edad</td><td>${s(data.edad)} años</td></tr>
        <tr><td class="label">Género</td><td>${s(data.genero)}</td><td class="label">Estado Civil</td><td>${s(data.estadoCivil)}</td></tr>
        <tr><td class="label">Celular</td><td>${s(data.celular)}</td><td class="label">Email</td><td>${s(data.email)}</td></tr>
        <tr><td class="label">EPS</td><td>${s(data.eps)}</td><td class="label">ARL</td><td>${s(data.arl)}</td></tr>
        <tr><td class="label">AFP</td><td>${s(data.afp)}</td><td class="label">Escolaridad</td><td>${s(data.escolaridad)}</td></tr>
      </table>
    </div>

    <div class="section">
      <h2>🏢 Información Laboral</h2>
      <table>
        <tr><td class="label" width="25%">Empresa</td><td>${s(data.empresaNombre)}</td><td class="label" width="15%">Cargo</td><td>${s(data.cargo)}</td></tr>
        <tr><td class="label">Tipo Examen</td><td>${s(data.tipoExamen)}</td><td class="label">Antigüedad</td><td>${s(data.antiguedadCargo)}</td></tr>
        <tr><td class="label">Contrato</td><td>${s(data.tipoContrato)}</td><td class="label">Turno</td><td>${s(data.turno)}</td></tr>
      </table>
    </div>

    ${data.antPatologicos || data.antQuirurgicos || data.antFamiliares ? `
    <div class="section">
      <h2>📜 Antecedentes</h2>
      <table>
        ${data.antPatologicos ? `<tr><td class="label" width="25%">Patológicos</td><td>${s(data.antPatologicos)}</td></tr>` : ''}
        ${data.antQuirurgicos ? `<tr><td class="label">Quirúrgicos</td><td>${s(data.antQuirurgicos)}</td></tr>` : ''}
        ${data.antTraumaticos ? `<tr><td class="label">Traumáticos</td><td>${s(data.antTraumaticos)}</td></tr>` : ''}
        ${data.antToxicoAlergicos ? `<tr><td class="label">Tóxico-Alérgicos</td><td>${s(data.antToxicoAlergicos)}</td></tr>` : ''}
        ${data.antFarmacologicos ? `<tr><td class="label">Farmacológicos</td><td>${s(data.antFarmacologicos)}</td></tr>` : ''}
        ${data.antFamiliares ? `<tr><td class="label">Familiares</td><td>${s(data.antFamiliares)}</td></tr>` : ''}
      </table>
    </div>` : ''}

    ${data.tensionArterial || data.frecuenciaCardiaca || data.peso ? `
    <div class="section">
      <h2>💓 Signos Vitales</h2>
      <table>
        <tr>
          <td class="label">TA</td><td>${s(data.tensionArterial)}</td>
          <td class="label">FC</td><td>${s(data.frecuenciaCardiaca)}</td>
          <td class="label">FR</td><td>${s(data.frecuenciaRespiratoria)}</td>
        </tr>
        <tr>
          <td class="label">Peso</td><td>${s(data.peso)} kg</td>
          <td class="label">Talla</td><td>${s(data.talla)} cm</td>
          <td class="label">IMC</td><td>${s(data.imc)}</td>
        </tr>
      </table>
    </div>` : ''}

    ${data.analisis ? `
    <div class="section">
      <h2>🔬 Análisis</h2>
      <p>${s(data.analisis)}</p>
    </div>` : ''}

    ${data.diagnostico1 ? `
    <div class="section">
      <h2>🩺 Diagnósticos</h2>
      <table>
        <tr><td class="label" width="15%">Dx 1</td><td>${s(data.diagnostico1)}</td></tr>
        ${data.diagnostico2 ? `<tr><td class="label">Dx 2</td><td>${s(data.diagnostico2)}</td></tr>` : ''}
        ${data.diagnostico3 ? `<tr><td class="label">Dx 3</td><td>${s(data.diagnostico3)}</td></tr>` : ''}
      </table>
    </div>` : ''}

    <div class="section">
      <h2>✅ Concepto de Aptitud</h2>
      <p style="font-size:12pt;font-weight:900;">${conceptoBadge(data.conceptoAptitud)}</p>
    </div>

    ${data.restricciones ? `
    <div class="section">
      <h2>⚠️ Restricciones</h2>
      <p>${s(data.restricciones)}</p>
    </div>` : ''}

    ${data.recomendaciones ? `
    <div class="section">
      <h2>📝 Recomendaciones</h2>
      <p>${s(data.recomendaciones)}</p>
    </div>` : ''}

    <div class="signature-area">
      <div style="display:flex;justify-content:space-between;">
        <div style="width:45%;">
          <div style="border-top:1px solid #333;margin-top:40px;padding-top:4px;">
            <p style="font-size:8pt;font-weight:700;">${s(doctorData?.nombre)}</p>
            <p style="font-size:7pt;color:#6b7280;">Médico Especialista en SST</p>
            <p style="font-size:7pt;color:#6b7280;">RM: ${s(doctorData?.licencia)}</p>
          </div>
        </div>
        <div style="width:45%;">
          <div style="border-top:1px solid #333;margin-top:40px;padding-top:4px;">
            <p style="font-size:8pt;font-weight:700;">${s(data.nombres)}</p>
            <p style="font-size:7pt;color:#6b7280;">${s(data.docTipo)} ${s(data.docNumero)}</p>
            <p style="font-size:7pt;color:#6b7280;">Paciente</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Print HC document
 */
export function printHC(data, doctorData, companyData) {
  const html = generateHCPrintHTML(data, doctorData, companyData);
  openPrintWindow(
    `HC Ocupacional — ${data.nombres || 'Paciente'} — ${data.fechaExamen || new Date().toISOString().split('T')[0]}`,
    html
  );
}
