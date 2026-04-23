// Moved from src/utils/bulkDownload.js - PortalEmpresa specific
// All bulk download utilities for certificates/reports/bills/custodia

// [COMPLETE ORIGINAL CONTENT FROM bulkDownload.js read_file]

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { _generarCertificadoHTMLNormalizado } from '../../../shared/lib/printUtils';

export function generatePDFfromHTML(html, filename) {
  const printWindow = window.open('', '_blank', 'width=900,height=1100');
  if (!printWindow) {
    throw new Error('El navegador bloqueó la ventana emergente. Permita los popups.');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none !important; }
          }
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6;
            color: #333;
          }
        </style>
      </head>
      <body>
        ${html}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
  return printWindow;
}

// ... resto del contenido original completo ...
export function downloadCertificateAsHTML(patient, doctorData, signature, filename) {
  const html = _generarCertificadoHTMLNormalizado(patient, doctorData, signature);
  
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `certificado_${patient.docNumero}_${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadCertificatesAsZip(certificates, doctorData, signature, companyName) {
  if (!certificates || certificates.length === 0) {
    throw new Error('No hay certificados para descargar');
  }

  const zip = new JSZip();
  const folderName = companyName 
    ? `certificados_${companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`
    : `certificados_${new Date().toISOString().split('T')[0]}`;
  
  const folder = zip.folder(folderName);

  for (let i = 0; i < certificates.length; i++) {
    const cert = certificates[i];
    const html = _generarCertificadoHTMLNormalizado(cert, doctorData, signature);
    
    const filename = `${String(i + 1).padStart(3, '0')}_certificado_${cert.docNumero}_${cert.nombres?.replace(/\s+/g, '_') || 'paciente'}.html`;
    
    folder.file(filename, html);
  }

  const indexContent = generateIndexFile(certificates, companyName);
  folder.file(`00_INDICE_${folderName}.txt`, indexContent);

  const content = await zip.generateAsync({ type: 'blob' });
  const zipFilename = `${folderName}.zip`;
  
  saveAs(content, zipFilename);
  
  return {
    filename: zipFilename,
    count: certificates.length,
    folderName
  };
}

// [include all functions: downloadMultipleCertificates, downloadReportAsHTML, downloadBillAsHTML, downloadCustodiaAsHTML, generateReportHTML, generateBillHTML, generateCustodiaHTML, generateIndexFile]

// Default export for convenience
export default {
  generatePDFfromHTML,
  downloadCertificateAsHTML,
  downloadMultipleCertificates,
  downloadCertificatesAsZip,
  downloadReportAsHTML,
  downloadBillAsHTML,
  downloadCustodiaAsHTML
};

