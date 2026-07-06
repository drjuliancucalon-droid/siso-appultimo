// siso-db-mcp — Servidor MCP para acceso directo a D1
// Proporciona herramientas para leer/escribir en el Worker D1 sin curl
// Uso: node siso-db-mcp/index.js

const WORKER_URL = process.env.SISO_WORKER_URL || 'https://siso-api.dr-juliancucalon.workers.dev';
const WORKER_TOKEN = process.env.SISO_TOKEN || '';

async function readD1(key) {
  const res = await fetch(`${WORKER_URL}/store/${encodeURIComponent(key)}`, {
    headers: { 'X-Siso-Token': WORKER_TOKEN }
  });
  if (!res.ok) throw new Error(`D1 GET ${key}: ${res.status}`);
  return res.json();
}

// MCP Server definition
const server = {
  name: 'siso-db',
  version: '1.0.0',
  tools: {
    getPatient: {
      description: 'Obtiene todos los datos de un paciente por cédula',
      parameters: { docNumero: { type: 'string', required: true } },
      handler: async ({ docNumero }) => {
        const data = await readD1(`siso_portal_doc_${docNumero.replace(/\s/g, '')}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }
    },
    getCertByCode: {
      description: 'Obtiene un certificado por código de verificación',
      parameters: { code: { type: 'string', required: true } },
      handler: async ({ code }) => {
        const data = await readD1(`siso_portal_${code}`);
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }
    },
    getEmpresaAtenciones: {
      description: 'Obtiene las atenciones de una empresa por NIT',
      parameters: { nit: { type: 'string', required: true } },
      handler: async ({ nit }) => {
        const data = await readD1(`siso_portal_empresa_atenciones_${nit.replace(/[^0-9]/g, '')}`);
        const count = Array.isArray(data?.[0]?.value?.atenciones) ? data[0].value.atenciones.length : 0;
        return { content: [{ type: 'text', text: `${count} atenciones encontradas\n${JSON.stringify(data, null, 2).substring(0, 2000)}` }] };
      }
    },
    listHCByMedico: {
      description: 'Lista pacientes de un médico',
      parameters: { userId: { type: 'string', required: true } },
      handler: async ({ userId }) => {
        const data = await readD1(`siso_patients_${userId}`);
        const count = Array.isArray(data?.[0]?.value) ? data[0].value.length : 0;
        const names = Array.isArray(data?.[0]?.value) ? data[0].value.map(p => `${p.nombres || '—'} (${p.docNumero || '—'})`).join('\n') : '';
        return { content: [{ type: 'text', text: `${count} pacientes\n${names}` }] };
      }
    },
    auditHC: {
      description: 'Audita una HC: verifica D1, portal, impresión',
      parameters: { docNumero: { type: 'string', required: true } },
      handler: async ({ docNumero }) => {
        const dc = docNumero.replace(/\s/g, '');
        let result = `AUDITORÍA HC: ${dc}\n${'═'.repeat(50)}\n`;
        
        // Verificar claves D1
        try { await readD1(`siso_portal_doc_${dc}`); result += '✅ portal_doc\n'; } catch { result += '❌ portal_doc NO ENCONTRADO\n'; }
        try { await readD1(`siso_hc_completa_${dc}`); result += '✅ hc_completa\n'; } catch { result += '❌ hc_completa NO ENCONTRADO\n'; }
        
        return { content: [{ type: 'text', text: result }] };
      }
    }
  }
};

// Si se ejecuta directamente, iniciar en modo test
if (require.main === module) {
  console.log(`🔧 siso-db-mcp v${server.version}`);
  console.log('Herramientas disponibles:', Object.keys(server.tools).join(', '));
  readD1('siso_companies_drcucalon')
    .then(d => console.log('✅ D1 Worker conectado'))
    .catch(e => console.log('⚠️ D1 Worker no disponible:', e.message));
}

module.exports = server;