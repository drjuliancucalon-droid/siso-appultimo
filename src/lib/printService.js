// src/lib/printService.js — Print service for medical documents
// Opens a print window with formatted HTML content
// Matches the monolith's print system (window.open + document.write)
// Sprint 3: Complete print with all sections + batch + disability + carnet

import { _sanitize } from '../shared/lib/security';

// ── Helpers ──────────────────────────────────────────────────────
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
    .page-break { page-break-after: always; }
    .sys-normal { color: #059669; font-weight: 600; }
    .sys-anormal { color: #dc2626; font-weight: 700; }
    .carnet { width: 8.5cm; border: 2px solid #059669; border-radius: 12px; padding: 12px; display: inline-block; page-break-inside: avoid; }
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

  setTimeout(() => {
    w.focus();
    w.print();
  }, 500);
}

// ── Helper: Generate physical exam systems table ─────────────────
function generatePhysicalExamHTML(data) {
  const sistemas = data.examenFisicoSistemas || {};
  const entries = Object.entries(sistemas);
  if (entries.length === 0) return '';

  const SYSTEM_NAMES = {
    cabeza: 'Cabeza', ojos: 'Ojos', oidos: 'Oídos', nariz: 'Nariz',
    boca: 'Boca/Faringe', cuello: 'Cuello/Tiroides', torax: 'Tórax',
    corazon: 'Corazón', pulmones: 'Pulmones', abdomen: 'Abdomen',
    genitourinario: 'Genitourinario', columna: 'Columna', extremidades: 'Extremidades',
    piel: 'Piel/Faneras', neurologico: 'Neurológico',
  };

  return `
    <div class="section">
      <h2>🔍 Examen Físico por Sistemas</h2>
      <table>
        <thead>
          <tr><th>Sistema</th><th>Estado</th><th>Hallazgo</th></tr>
        </thead>
        <tbody>
          ${entries.map(([key, val]) => `
            <tr>
              <td class="label">${SYSTEM_NAMES[key] || key}</td>
              <td class="${val.estado === 'Normal' ? 'sys-normal' : 'sys-anormal'}">${s(val.estado)}</td>
              <td>${s(val.hallazgo)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── Helper: Generate maniobras osteomusculares table ─────────────
function generateManiobrasHTML(data) {
  const maniobras = data.maniobrasOsteomusculares || {};
  const entries = Object.entries(maniobras);
  if (entries.length === 0) return '';

  const MANIOBRA_NAMES = {
    phalen: 'Phalen (Túnel carpiano)', tinel: 'Tinel (Mediano)',
    finkelstein: 'Finkelstein (De Quervain)', jobe: 'Jobe (Supraespinoso)',
    lasegue: 'Lasègue (Ciática)', adams: 'Adams (Escoliosis)',
    wells: 'Wells (Manguito rotador)', schober: 'Schober (Flexión lumbar)',
    otra: 'Otra',
  };

  return `
    <div class="section">
      <h2>🦴 Maniobras Osteomusculares</h2>
      <table>
        <thead>
          <tr><th>Maniobra</th><th>Estado</th><th>Hallazgo</th></tr>
        </thead>
        <tbody>
          ${entries.map(([key, val]) => `
            <tr>
              <td class="label">${val.nombre || MANIOBRA_NAMES[key] || key}</td>
              <td class="${val.estado === 'Normal' ? 'sys-normal' : 'sys-anormal'}">${s(val.estado)}</td>
              <td>${s(val.hallazgo)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── Helper: Generate occupational history ────────────────────────
function generateOccupationalHistoryHTML(data) {
  const history = data.antecedentesOcupacionales || data.historialOcupacional || [];
  if (!Array.isArray(history) || history.length === 0) {
    // Check for inline occupational exposure fields
    const riesgos = data.riesgos || {};
    const hasRiesgos = Object.values(riesgos).some(Boolean);
    if (!hasRiesgos) return '';

    return `
      <div class="section">
        <h2>🏭 Factores de Riesgo Ocupacional</h2>
        <table>
          <tr>
            ${riesgos.fisicos ? '<td class="badge badge-yellow">Físicos</td>' : ''}
            ${riesgos.quimicos ? '<td class="badge badge-yellow">Químicos</td>' : ''}
            ${riesgos.biologicos ? '<td class="badge badge-yellow">Biológicos</td>' : ''}
            ${riesgos.mecanicos ? '<td class="badge badge-yellow">Mecánicos</td>' : ''}
            ${riesgos.biomecanicos ? '<td class="badge badge-yellow">Biomecánicos</td>' : ''}
            ${riesgos.psicosocial ? '<td class="badge badge-yellow">Psicosocial</td>' : ''}
            ${riesgos.seguridad ? '<td class="badge badge-yellow">Seguridad</td>' : ''}
            ${riesgos.locativos ? '<td class="badge badge-yellow">Locativos</td>' : ''}
          </tr>
        </table>
      </div>
    `;
  }

  return `
    <div class="section">
      <h2>🏭 Antecedentes Ocupacionales</h2>
      <table>
        <thead>
          <tr><th>Empresa</th><th>Cargo</th><th>Tiempo</th><th>Factores de Riesgo</th></tr>
        </thead>
        <tbody>
          ${history.map((h) => `
            <tr>
              <td>${s(h.empresa)}</td>
              <td>${s(h.cargo)}</td>
              <td>${s(h.tiempo || h.duracion)}</td>
              <td>${s(h.riesgos || h.factoresRiesgo)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── Helper: Generate review by systems ───────────────────────────
function generateRevisionSistemasHTML(data) {
  const revision = data.revisionSistemas || data.revisionPorSistemas;
  if (!revision) return '';

  // If it's a string
  if (typeof revision === 'string' && revision.trim()) {
    return `
      <div class="section">
        <h2>📋 Revisión por Sistemas</h2>
        <p>${s(revision)}</p>
      </div>
    `;
  }

  // If it's an object with system keys
  if (typeof revision === 'object') {
    const entries = Object.entries(revision).filter(([, v]) => v && v !== 'Sin alteraciones');
    if (entries.length === 0) return '';
    return `
      <div class="section">
        <h2>📋 Revisión por Sistemas</h2>
        <table>
          ${entries.map(([k, v]) => `<tr><td class="label" width="25%">${s(k)}</td><td>${s(typeof v === 'string' ? v : JSON.stringify(v))}</td></tr>`).join('')}
        </table>
      </div>
    `;
  }

  return '';
}

// ── Helper: Generate paraclinical results ────────────────────────
function generateParaclinicalHTML(data) {
  const checks = data.paraclinicosCheck || {};
  const activeParaclinics = Object.entries(checks).filter(([k, v]) => v && k !== 'otros');
  if (activeParaclinics.length === 0 && !checks.otros) return '';

  const PARA_NAMES = {
    optometria: 'Optometría/Visiometría', audiometria: 'Audiometría',
    espirometria: 'Espirometría', ecg: 'Electrocardiograma',
    glicemia: 'Glicemia', lipidico: 'Perfil Lipídico',
    frotisFaringeo: 'Frotis Faríngeo', coprologico: 'Coprológico',
    kohUnas: 'KOH Uñas', hematico: 'Cuadro Hemático',
    rx: 'Radiografía', emg: 'Electromiografía', psicologia: 'Psicología',
  };

  const visualAcuity = data.agudezaVisual || {};
  const hasVisual = visualAcuity.lejanaOD || visualAcuity.lejanaOI;

  return `
    <div class="section">
      <h2>🧪 Paraclínicos Realizados</h2>
      <table>
        <thead>
          <tr><th>Examen</th><th>Estado</th></tr>
        </thead>
        <tbody>
          ${activeParaclinics.map(([k]) => `
            <tr><td>${PARA_NAMES[k] || k}</td><td class="sys-normal">Realizado</td></tr>
          `).join('')}
          ${checks.otros ? `<tr><td>Otros</td><td>${s(checks.otros)}</td></tr>` : ''}
        </tbody>
      </table>
      ${hasVisual ? `
        <h3>Agudeza Visual</h3>
        <table>
          <tr><th></th><th>OD (Derecho)</th><th>OI (Izquierdo)</th></tr>
          <tr><td class="label">Lejana</td><td>${s(visualAcuity.lejanaOD)}</td><td>${s(visualAcuity.lejanaOI)}</td></tr>
          <tr><td class="label">Próxima</td><td>${s(visualAcuity.proximaOD)}</td><td>${s(visualAcuity.proximaOI)}</td></tr>
          <tr><td class="label">Corrección</td><td colspan="2">${visualAcuity.correccion ? 'Sí' : 'No'}</td></tr>
        </table>
      ` : ''}
    </div>
  `;
}

// ── Helper: Generate antecedentes grouped ────────────────────────
function generateAntecedentesGroupedHTML(data) {
  const ag = data.antecedentesAgrupados || {};
  const entries = Object.entries(ag).filter(([, v]) => v && (v.val || v.det));
  // Also check legacy flat fields
  const legacy = [];
  if (data.antPatologicos) legacy.push(['Patológicos', data.antPatologicos]);
  if (data.antQuirurgicos) legacy.push(['Quirúrgicos', data.antQuirurgicos]);
  if (data.antTraumaticos) legacy.push(['Traumáticos', data.antTraumaticos]);
  if (data.antToxicoAlergicos) legacy.push(['Tóxico-Alérgicos', data.antToxicoAlergicos]);
  if (data.antFarmacologicos) legacy.push(['Farmacológicos', data.antFarmacologicos]);
  if (data.antFamiliares) legacy.push(['Familiares', data.antFamiliares]);

  if (entries.length === 0 && legacy.length === 0) return '';

  const ANT_NAMES = {
    patologicos: 'Patológicos', quirurgicos: 'Quirúrgicos',
    traumaticos: 'Traumáticos', farmacologicos: 'Farmacológicos',
    alergicos: 'Alérgicos',
  };

  return `
    <div class="section">
      <h2>📜 Antecedentes Personales</h2>
      <table>
        ${entries.map(([k, v]) => `
          <tr>
            <td class="label" width="25%">${ANT_NAMES[k] || k}</td>
            <td>${v.val ? `<span class="badge badge-yellow">Positivo</span> ${s(v.det)}` : `<span class="badge badge-green">Negativo</span>`}</td>
          </tr>
        `).join('')}
        ${legacy.map(([k, v]) => `
          <tr><td class="label" width="25%">${k}</td><td>${s(v)}</td></tr>
        `).join('')}
      </table>
    </div>
  `;
}

// ── Helper: Habits ───────────────────────────────────────────────
function generateHabitsHTML(data) {
  const h = data.habitos || {};
  if (!h.fuma && !h.alcohol && !h.psicoactivas && !h.deporte) return '';

  return `
    <div class="section">
      <h2>🚬 Hábitos</h2>
      <table>
        <tr>
          <td class="label" width="20%">Tabaquismo</td><td>${s(h.fuma)}</td>
          <td class="label" width="20%">Alcohol</td><td>${s(h.alcohol)}</td>
        </tr>
        <tr>
          <td class="label">Psicoactivas</td><td>${s(h.psicoactivas)}</td>
          <td class="label">Deporte</td><td>${s(h.deporte)}</td>
        </tr>
        ${h.detalle ? `<tr><td class="label">Detalle</td><td colspan="3">${s(h.detalle)}</td></tr>` : ''}
      </table>
    </div>
  `;
}

/**
 * Generate COMPLETE HC print HTML from clinical data
 * Sprint 3.1: All sections matching monolith _printHCClean
 */
export function generateHCPrintHTML(data, doctorData, companyData) {
  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
      <div>
        <h1 style="margin:0;">HISTORIA CLÍNICA OCUPACIONAL</h1>
        <p style="font-size:8pt;color:#6b7280;margin:2px 0;">${s(data.tipoExamen || 'Examen Ocupacional')} — ${date(data.fechaExamen)}</p>
        <p style="font-size:7pt;color:#9ca3af;">Folio: ${s(data.folioHC || 'Auto')} · v${data.versionDocumento || 1}</p>
      </div>
      <div style="text-align:right;">
        ${doctorData?.nombre ? `<p style="font-size:9pt;font-weight:900;color:#059669;">${s(doctorData.nombre)}</p>` : ''}
        ${doctorData?.licencia ? `<p style="font-size:7.5pt;color:#6b7280;">RM: ${s(doctorData.licencia)}</p>` : ''}
        ${doctorData?.titulo ? `<p style="font-size:7pt;color:#9ca3af;">${s(doctorData.titulo)}</p>` : ''}
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
        <tr><td class="label">Grupo Sang.</td><td>${s(data.grupoSanguineo)}</td><td class="label">Lateralidad</td><td>${s(data.lateralidad)}</td></tr>
      </table>
    </div>

    <div class="section">
      <h2>🏢 Información Laboral</h2>
      <table>
        <tr><td class="label" width="25%">Empresa</td><td>${s(data.empresaNombre)}</td><td class="label" width="15%">NIT</td><td>${s(data.empresaNit)}</td></tr>
        <tr><td class="label">Cargo</td><td>${s(data.cargo)}</td><td class="label">Tipo Examen</td><td>${s(data.tipoExamen)}</td></tr>
        <tr><td class="label">Antigüedad</td><td>${s(data.antiguedadCargo || data.antiguedadEmpresa)}</td><td class="label">Contrato</td><td>${s(data.tipoContrato)}</td></tr>
        <tr><td class="label">Turno</td><td>${s(data.turno || data.turnoTrabajo)}</td><td class="label">Actividad Econ.</td><td>${s(data.actividadEconomica)}</td></tr>
      </table>
    </div>

    ${generateOccupationalHistoryHTML(data)}

    ${generateAntecedentesGroupedHTML(data)}

    ${generateHabitsHTML(data)}

    ${data.tensionArterial || data.frecuenciaCardiaca || data.peso || data.ta || data.fc ? `
    <div class="section">
      <h2>💓 Signos Vitales</h2>
      <table>
        <tr>
          <td class="label">TA</td><td>${s(data.tensionArterial || data.ta)}</td>
          <td class="label">FC</td><td>${s(data.frecuenciaCardiaca || data.fc)}</td>
          <td class="label">FR</td><td>${s(data.frecuenciaRespiratoria || data.fr)}</td>
        </tr>
        <tr>
          <td class="label">Peso</td><td>${s(data.peso)} kg</td>
          <td class="label">Talla</td><td>${s(data.talla)} cm</td>
          <td class="label">IMC</td><td>${s(data.imc)}</td>
        </tr>
        ${data.temp ? `<tr><td class="label">Temperatura</td><td>${s(data.temp)} °C</td><td colspan="4"></td></tr>` : ''}
      </table>
    </div>` : ''}

    ${generatePhysicalExamHTML(data)}

    ${generateManiobrasHTML(data)}

    ${generateRevisionSistemasHTML(data)}

    ${generateParaclinicalHTML(data)}

    ${data.analisis || data.analisisIA ? `
    <div class="section">
      <h2>🔬 Análisis</h2>
      <p>${s(data.analisis || data.analisisIA)}</p>
    </div>` : ''}

    ${data.diagnostico1 || data.diagnosticoPrincipal ? `
    <div class="section">
      <h2>🩺 Diagnósticos</h2>
      <table>
        <tr><td class="label" width="15%">Dx Principal</td><td>${s(data.diagnostico1 || data.diagnosticoPrincipal)}</td></tr>
        ${(data.diagnostico2 || data.diagnosticoSecundario1) ? `<tr><td class="label">Dx 2</td><td>${s(data.diagnostico2 || data.diagnosticoSecundario1)}</td></tr>` : ''}
        ${(data.diagnostico3 || data.diagnosticoSecundario2) ? `<tr><td class="label">Dx 3</td><td>${s(data.diagnostico3 || data.diagnosticoSecundario2)}</td></tr>` : ''}
      </table>
    </div>` : ''}

    <div class="section">
      <h2>✅ Concepto de Aptitud</h2>
      <p style="font-size:12pt;font-weight:900;">${conceptoBadge(data.conceptoAptitud)}</p>
      ${data.vigencia ? `<p style="font-size:8pt;color:#6b7280;">Vigencia: ${s(data.vigencia)}</p>` : ''}
    </div>

    ${data.restricciones || data.analisisRestricciones ? `
    <div class="section">
      <h2>⚠️ Restricciones</h2>
      <p>${s(data.restricciones || data.analisisRestricciones)}</p>
    </div>` : ''}

    ${data.recomendaciones ? `
    <div class="section">
      <h2>📝 Recomendaciones</h2>
      <p>${s(data.recomendaciones)}</p>
    </div>` : ''}

    ${data.formulaMedica ? `
    <div class="section">
      <h2>💊 Fórmula Médica</h2>
      <p>${s(data.formulaMedica)}</p>
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

/**
 * Sprint 3.2: Print certificates in batch — one per patient per page
 * @param {Array} patients - Array of patient objects with their certificate data
 * @param {object} doctorData - Doctor information
 * @param {string} certificateType - Type of certificate to generate
 */
export function printCertificateBatch(patients, doctorData, certificateType = 'aptitud') {
  if (!patients || patients.length === 0) {
    alert('Seleccione al menos un paciente para imprimir certificados.');
    return;
  }

  const certificatesHTML = patients.map((patient, index) => {
    const isLast = index === patients.length - 1;
    return `
      <div ${!isLast ? 'class="page-break"' : ''}>
        <div style="text-align:center;margin-bottom:15px;">
          <h1 style="margin:0;font-size:16pt;color:#059669;">CERTIFICADO MÉDICO OCUPACIONAL</h1>
          <p style="font-size:9pt;color:#6b7280;">Certificado de Aptitud Laboral — Res. 1843/2025</p>
          <hr style="border:none;border-top:2px solid #059669;margin:8px 0;" />
        </div>

        <p style="font-size:9pt;line-height:1.6;">
          El suscrito médico especialista en Seguridad y Salud en el Trabajo certifica que el(la) señor(a)
          <strong>${s(patient.nombres)}</strong>, identificado(a) con <strong>${s(patient.docTipo)} ${s(patient.docNumero)}</strong>,
          de <strong>${s(patient.edad)}</strong> años de edad, fue valorado(a) el día <strong>${date(patient.fechaExamen)}</strong>
          mediante examen médico ocupacional de tipo <strong>${s(patient.tipoExamen)}</strong>
          para el cargo de <strong>${s(patient.cargo)}</strong>
          en la empresa <strong>${s(patient.empresaNombre)}</strong>.
        </p>

        <div class="section" style="margin-top:15px;">
          <h2>Concepto de Aptitud</h2>
          <p style="font-size:14pt;font-weight:900;text-align:center;padding:10px;">${conceptoBadge(patient.conceptoAptitud)}</p>
        </div>

        ${patient.restricciones ? `
          <div class="section">
            <h2>Restricciones</h2>
            <p>${s(patient.restricciones)}</p>
          </div>
        ` : ''}

        ${patient.recomendaciones ? `
          <div class="section">
            <h2>Recomendaciones</h2>
            <p>${s(patient.recomendaciones)}</p>
          </div>
        ` : ''}

        <div class="signature-area">
          <div style="width:50%;">
            <div style="border-top:1px solid #333;margin-top:50px;padding-top:4px;">
              <p style="font-size:8pt;font-weight:700;">${s(doctorData?.nombre)}</p>
              <p style="font-size:7pt;color:#6b7280;">Médico Especialista en SST</p>
              <p style="font-size:7pt;color:#6b7280;">RM: ${s(doctorData?.licencia)}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  openPrintWindow(`Certificados Batch — ${patients.length} pacientes`, certificatesHTML);
}

/**
 * Sprint 3.3: Print disability certificate
 * @param {object} incapData - Disability data
 * @param {object} patientData - Patient data
 * @param {object} doctorData - Doctor data
 */
export function printDisability(incapData, patientData, doctorData) {
  const html = `
    <div style="text-align:center;margin-bottom:20px;">
      <h1 style="margin:0;font-size:16pt;color:#059669;">CERTIFICADO DE INCAPACIDAD</h1>
      <p style="font-size:9pt;color:#6b7280;margin:4px 0;">Ley 776/2002 · Decreto 1072/2015 · Res. 1843/2025</p>
      <hr style="border:none;border-top:2px solid #059669;margin:8px 0;" />
    </div>

    <div class="section">
      <h2>📋 Datos del Paciente</h2>
      <table>
        <tr><td class="label" width="25%">Nombre completo</td><td>${s(patientData.nombres)}</td></tr>
        <tr><td class="label">Documento</td><td>${s(patientData.docTipo)} ${s(patientData.docNumero)}</td></tr>
        <tr><td class="label">Edad</td><td>${s(patientData.edad)} años</td></tr>
        <tr><td class="label">Empresa</td><td>${s(patientData.empresaNombre)}</td></tr>
        <tr><td class="label">Cargo</td><td>${s(patientData.cargo)}</td></tr>
        <tr><td class="label">EPS</td><td>${s(patientData.eps)}</td></tr>
        <tr><td class="label">ARL</td><td>${s(patientData.arl)}</td></tr>
      </table>
    </div>

    <div class="section">
      <h2>📝 Datos de la Incapacidad</h2>
      <table>
        <tr>
          <td class="label" width="25%">Días de incapacidad</td>
          <td style="font-size:16pt;font-weight:900;color:#059669;">${s(incapData.dias)} DÍAS</td>
        </tr>
        <tr><td class="label">Tipo</td><td>${s(incapData.tipo)}</td></tr>
        <tr><td class="label">Origen</td><td>${s(incapData.origen)}</td></tr>
        <tr><td class="label">Fecha de inicio</td><td>${date(incapData.fechaInicio)}</td></tr>
        <tr><td class="label">Fecha de finalización</td><td>${date(incapData.fechaFin)}</td></tr>
        <tr><td class="label">Diagnóstico</td><td><strong>${s(incapData.diagnostico)}</strong></td></tr>
        <tr><td class="label">Código CIE-10</td><td>${s(incapData.codigoCIE10)}</td></tr>
        ${incapData.prorroga ? `<tr><td class="label">Prórroga Nro.</td><td>${s(incapData.prorrogaNumero || '1')}</td></tr>` : ''}
      </table>
    </div>

    ${incapData.observaciones ? `
      <div class="section">
        <h2>Observaciones</h2>
        <p>${s(incapData.observaciones)}</p>
      </div>
    ` : ''}

    <div style="margin-top:15px;padding:10px;background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;font-size:8pt;">
      <strong>NOTA LEGAL:</strong> Este certificado se expide para los fines pertinentes ante la EPS/ARL del trabajador.
      La incapacidad debe ser radicada dentro de los 3 días hábiles siguientes a su expedición (Art. 142, Decreto 019/2012).
    </div>

    <div class="signature-area">
      <div style="display:flex;justify-content:space-between;">
        <div style="width:45%;">
          <div style="border-top:1px solid #333;margin-top:50px;padding-top:4px;">
            <p style="font-size:8pt;font-weight:700;">${s(doctorData?.nombre)}</p>
            <p style="font-size:7pt;color:#6b7280;">Médico Especialista en SST</p>
            <p style="font-size:7pt;color:#6b7280;">RM: ${s(doctorData?.licencia)}</p>
          </div>
        </div>
        <div style="width:45%;">
          <div style="border-top:1px solid #333;margin-top:50px;padding-top:4px;">
            <p style="font-size:8pt;font-weight:700;">${s(patientData.nombres)}</p>
            <p style="font-size:7pt;color:#6b7280;">${s(patientData.docTipo)} ${s(patientData.docNumero)}</p>
            <p style="font-size:7pt;color:#6b7280;">Paciente</p>
          </div>
        </div>
      </div>
    </div>
  `;

  openPrintWindow(`Incapacidad — ${patientData.nombres || 'Paciente'} — ${incapData.dias} días`, html);
}

/**
 * Sprint 3.4: Print worker ID card (carnet)
 * Small card format with photo placeholder, name, doc, company, cargo, aptitude
 * @param {object} patientData - Patient data
 * @param {object} doctorData - Doctor data
 */
export function printCarnet(patientData, doctorData) {
  const html = `
    <div style="display:flex;flex-wrap:wrap;gap:20px;justify-content:center;padding:20px;">
      <div class="carnet">
        <div style="text-align:center;margin-bottom:10px;">
          <h2 style="font-size:10pt;margin:0;color:#059669;border:none;">CARNET DEL TRABAJADOR</h2>
          <p style="font-size:7pt;color:#6b7280;margin:2px 0;">Salud Ocupacional</p>
          <hr style="border:none;border-top:1.5px solid #059669;margin:6px 0;" />
        </div>

        <div style="display:flex;gap:10px;margin-bottom:10px;">
          <div style="width:2.5cm;height:3cm;border:1px solid #d1d5db;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#f9fafb;flex-shrink:0;">
            ${patientData.foto
              ? `<img src="${patientData.foto}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`
              : `<span style="font-size:7pt;color:#9ca3af;">FOTO</span>`
            }
          </div>
          <div style="flex:1;">
            <p style="font-size:9pt;font-weight:900;color:#1f2937;margin:0 0 2px;">${s(patientData.nombres)}</p>
            <p style="font-size:7.5pt;color:#6b7280;margin:0 0 2px;">${s(patientData.docTipo)} ${s(patientData.docNumero)}</p>
            <p style="font-size:7.5pt;color:#6b7280;margin:0 0 2px;">Cargo: ${s(patientData.cargo)}</p>
            <p style="font-size:7.5pt;color:#6b7280;margin:0;">Empresa: ${s(patientData.empresaNombre)}</p>
          </div>
        </div>

        <div style="text-align:center;padding:6px;background:#ecfdf5;border-radius:6px;margin-bottom:8px;">
          <p style="font-size:7pt;color:#065f46;font-weight:700;margin:0 0 2px;">CONCEPTO DE APTITUD</p>
          <p style="font-size:11pt;font-weight:900;margin:0;">${conceptoBadge(patientData.conceptoAptitud)}</p>
        </div>

        <div style="font-size:7pt;color:#6b7280;text-align:center;">
          <p style="margin:0;">Fecha: ${date(patientData.fechaExamen)}</p>
          <p style="margin:0;">Médico: ${s(doctorData?.nombre)}</p>
          <p style="margin:0;">RM: ${s(doctorData?.licencia)}</p>
        </div>
      </div>
    </div>
  `;

  openPrintWindow(`Carnet — ${patientData.nombres || 'Trabajador'}`, html, { width: 500, height: 500 });
}
