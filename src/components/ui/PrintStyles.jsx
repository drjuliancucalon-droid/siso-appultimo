import React from 'react';

export const PrintStyles = () => (
  <style>{`
    /* ═══════════════════════════════════════════════════════
       OCUPASALUD v3 - PRINT STYLES PREMIUM
       Continuidad total · Sin cortes · Colores exactos
    ═══════════════════════════════════════════════════════ */
    @media print {
      @page { size: letter portrait; margin: 1.1cm 1.3cm 1.3cm 1.3cm; }
      /* Colores exactos */
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
      /* Ocultar UI */
      .no-print, nav, button:not(.print-show), input[type="file"], [data-no-print] { display: none !important; }
      /* Ocultar overlays del entorno de desarrollo (CodeSandbox, React DevTools, error overlay) */
      #webpack-dev-server-client-overlay, #webpack-dev-server-client-overlay-div,
      [id*="sandbox"], [class*="sandbox"], [id*="codesandbox"],
      iframe[src*="sandbox"], iframe[src*="csb.app"],
      div[style*="z-index: 2147483647"], div[style*="z-index:2147483647"],
      #__vconsole, .ReactQueryDevtools, #react-query-devtools-btn { display: none !important; }
      /* Body */
      body { background: white !important; margin: 0 !important; padding: 0 !important; font-family: Arial, Helvetica, sans-serif !important; font-size: 8.5pt !important; line-height: 1.4 !important; color: #111 !important; }
      /* Eliminar fondo gris del wrapper que causa aspecto nublado */
      .min-h-screen, .bg-gray-100, main { background: white !important; }
      /* Eliminar sombras y bordes redondeados en impresión */
      .shadow-2xl, .shadow-xl, .shadow-lg, .shadow-md, .shadow-sm, .shadow { box-shadow: none !important; }
      .rounded-2xl, .rounded-xl, .rounded-lg, .rounded-md, .rounded { border-radius: 0 !important; }
      /* Carta: flujo continuo, sin sombra, sin borde */
      .carta-visual { width: 100% !important; max-width: 100% !important; min-height: unset !important; height: auto !important; padding: 0 !important; margin: 0 auto !important; box-shadow: none !important; border-radius: 0 !important; page-break-inside: auto !important; break-inside: auto !important; background: white !important; }
      /* Secciones con fondo: flujo continuo, permitir cortes naturales */
      .bg-emerald-50, .bg-blue-50, .bg-orange-50, .bg-red-50, .bg-teal-50, .bg-yellow-50, .bg-purple-50, .bg-gray-50, .bg-gray-100 { page-break-inside: auto !important; break-inside: auto !important; }
      /* Bloques individuales: no cortar */
      .print-break-avoid, .signature-block, table { page-break-inside: avoid !important; break-inside: avoid !important; }
      tr { page-break-inside: avoid !important; break-inside: avoid !important; }
      /* Títulos no solos al final */
      h1, h2, h3, h4 { page-break-after: avoid !important; break-after: avoid !important; orphans: 3 !important; widows: 3 !important; }
      p { orphans: 3 !important; widows: 3 !important; }
      /* Saltos: solo page-break tiene salto real; section-break fluye continuo */
      .print-page-break { page-break-before: always !important; break-before: page !important; margin-top: 0 !important; padding-top: 0 !important; }
      .print-section-break, .report-section-break { page-break-before: auto !important; break-before: auto !important; margin-top: 4mm !important; padding-top: 0 !important; }
      /* Espaciados compactos */
      .mb-6{margin-bottom:3.5mm!important} .mb-5{margin-bottom:3mm!important} .mb-4{margin-bottom:2.5mm!important} .mb-3{margin-bottom:2mm!important} .mb-2{margin-bottom:1.5mm!important} .mb-1{margin-bottom:1mm!important}
      .mt-10{margin-top:4mm!important} .mt-8{margin-top:3.5mm!important} .mt-6{margin-top:3mm!important} .mt-4{margin-top:2mm!important}
      .gap-6{gap:3.5mm!important} .gap-4{gap:2.5mm!important} .gap-3{gap:2mm!important} .gap-2{gap:1.5mm!important}
      .space-y-4>*+*{margin-top:2.5mm!important} .space-y-3>*+*{margin-top:2mm!important} .space-y-2>*+*{margin-top:1.5mm!important} .space-y-1>*+*{margin-top:1mm!important}
      /* Padding compacto */
      .p-6{padding:3.5mm!important} .p-5{padding:3mm!important} .p-4{padding:2.5mm!important} .p-3{padding:2mm!important} .p-2{padding:1.5mm!important} .p-1{padding:1mm!important}
      .py-4{padding-top:2mm!important;padding-bottom:2mm!important} .py-3{padding-top:1.5mm!important;padding-bottom:1.5mm!important} .py-2{padding-top:1mm!important;padding-bottom:1mm!important}
      .px-4{padding-left:2.5mm!important;padding-right:2.5mm!important} .px-3{padding-left:2mm!important;padding-right:2mm!important} .px-2{padding-left:1.5mm!important;padding-right:1.5mm!important}
      /* Colores de fondo exactos */
      .bg-emerald-50{background-color:#ecfdf5!important} .bg-emerald-100{background-color:#d1fae5!important}
      .bg-emerald-600{background-color:#059669!important;color:white!important} .bg-emerald-700{background-color:#047857!important;color:white!important}
      .bg-blue-50{background-color:#eff6ff!important} .bg-blue-100{background-color:#dbeafe!important}
      .bg-blue-600{background-color:#2563eb!important;color:white!important}
      .bg-gray-50{background-color:#f9fafb!important} .bg-gray-100{background-color:#f3f4f6!important}
      .bg-gray-800{background-color:#1f2937!important;color:white!important}
      .bg-orange-50{background-color:#fff7ed!important} .bg-red-50{background-color:#fef2f2!important}
      .bg-red-100{background-color:#fee2e2!important} .bg-red-600{background-color:#dc2626!important;color:white!important}
      .bg-teal-50{background-color:#f0fdfa!important} .bg-yellow-50{background-color:#fefce8!important}
      .bg-purple-50{background-color:#faf5ff!important} .bg-slate-800{background-color:#1e293b!important;color:white!important}
      .bg-indigo-600{background-color:#4f46e5!important;color:white!important}
      .bg-amber-100{background-color:#fef3c7!important} .bg-green-100{background-color:#dcfce7!important}
      /* Tipografía */
      p, span, td, th, li { font-size: 8.5pt !important; }
      .text-xs{font-size:7pt!important} .text-sm{font-size:8pt!important} .text-base{font-size:9pt!important}
      .text-lg{font-size:10.5pt!important} .text-xl{font-size:12pt!important} .text-2xl{font-size:14pt!important}
      h1{font-size:14pt!important} h2{font-size:11pt!important} h3{font-size:9.5pt!important} h4{font-size:9pt!important}
      /* Firma siempre visible */
      .signature-block { display: flex !important; visibility: visible !important; }
      .hidden { display: none !important; }
      .print\:flex { display: flex !important; }
      .print\:block { display: block !important; }
      .print\:inline { display: inline !important; }
      .print\:inline-block { display: inline-block !important; }
      .print\:hidden { display: none !important; }
      .print\:shadow-none { box-shadow: none !important; }
      .print\:border-black { border-color: #000 !important; }
      .print\:bg-transparent { background-color: transparent !important; }
      .print\:border-gray-300 { border-color: #d1d5db !important; }
      /* Tablas */
      table { width: 100% !important; border-collapse: collapse !important; }
      th, td { padding: 1.5mm 2mm !important; font-size: 8pt !important; }
      /* Inputs transparentes */
      input, select, textarea { border: none !important; border-bottom: 0.5pt solid #888 !important; background: transparent !important; padding: 0 !important; font-size: 8pt !important; font-weight: 600 !important; -webkit-appearance: none !important; box-shadow: none !important; outline: none !important; }
      /* Textarea: mostrar todo el texto sin recortar */
      textarea { height: auto !important; max-height: none !important; overflow: visible !important; resize: none !important; white-space: pre-wrap !important; }
      ::placeholder { color: transparent !important; }
      /* Grid y flex */
      .grid { display: grid !important; }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
      .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
      .flex { display: flex !important; }
      .flex-col { flex-direction: column !important; }
      /* Bordes y sombras */
      .rounded-xl, .rounded-2xl, .rounded-lg { border-radius: 3px !important; }
      .rounded-full { border-radius: 50% !important; }
      .shadow, .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl { box-shadow: none !important; }
    }
    /* Animaciones pantalla */
    @keyframes fade-in { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
    .animate-fade-in { animation: fade-in 0.25s ease-out both; }
    .checklist-item { transition: background 0.1s; }
  `}</style>
);
// DoctorSignature: muestra imagen de firma + datos completos del profesional debajo
