  const renderPortalEmpresa = () => {
    const codigoEmpresa = portalEmpresaCodigo;
    const setCodigoEmpresa = setPortalEmpresaCodigo;
    const empresaEncontrada = portalEmpresaEncontrada;
    const setEmpresaEncontrada = setPortalEmpresaEncontrada;
    const pacientesEmpresa = portalEmpresaPacientes;
    const setPacientesEmpresa = setPortalEmpresaPacientes;
    const portalTab = portalEmpresaTab;
    const setPortalTab = setPortalEmpresaTab;
    const buscando = portalEmpresaBuscando;
    const setBuscando = setPortalEmpresaBuscando;

    const buscarEmpresa = () => {
      if (!codigoEmpresa.trim()) {
        showAlert("Ingrese el NIT o código de acceso de su empresa.");
        return;
      }
      setBuscando(true);
      const q = codigoEmpresa.trim().toLowerCase();
      const emp = companies.find(
        (c) =>
          c.nit === q ||
          c.nit === codigoEmpresa.trim() ||
          (c.id && c.id === q) ||
          (c.portalCode && c.portalCode.toLowerCase() === q) ||
          c.nombre?.toLowerCase().includes(q)
      );
      if (!emp) {
        showAlert(
          "No se encontró empresa con ese código. Contacte al médico para obtener el código de acceso."
        );
        setBuscando(false);
        return;
      }
      if (!emp.portalActivo) {
        showAlert(
          "El portal cliente no está habilitado para esta empresa. Contacte al médico para activarlo."
        );
        setBuscando(false);
        return;
      }
      // Obtener pacientes de esta empresa (solo HCs cerradas)
      const pacs = patientsList.filter(
        (p) =>
          (p.empresaId === emp.id || p.empresaNit === emp.nit) &&
          p.estadoHistoria === "Cerrada" &&
          !p._archivado
      );
      setEmpresaEncontrada(emp);
      setPacientesEmpresa(pacs);
      setBuscando(false);
    };

    const hoy = new Date().toISOString().split("T")[0];
    const cuentasEmpresa = savedBillsList.filter(
      (b) =>
        b.companyId === empresaEncontrada?.id ||
        b.clientNit === empresaEncontrada?.nit
    );
    const pendientesEmpresa = cuentasEmpresa.filter((b) => !b.pagada);
    const pagadasEmpresa = cuentasEmpresa.filter((b) => b.pagada);

    // ── Descargas: datos calculados fuera del JSX para evitar IIFE con async ──
    const _descTodosLosCerrados = patientsList.filter(p => p.estadoHistoria === "Cerrada" && !p._archivado);
    const _descEmpresasUnicas = (() => {
      const map = {};
      _descTodosLosCerrados.forEach(p => {
        const id = p.empresaId || p.empresaNit || "";
        if (id && !map[id]) map[id] = p.empresaNombre || p.empresaRazon || id;
      });
      return Object.entries(map).sort((a,b) => a[1].localeCompare(b[1]));
    })();
    let _descListaFiltrada = _descTodosLosCerrados;
    if (portalDescargaEmpresa) _descListaFiltrada = _descListaFiltrada.filter(p => (p.empresaId||p.empresaNit||"") === portalDescargaEmpresa);
    if (portalDescargaFechaDesde) _descListaFiltrada = _descListaFiltrada.filter(p => (p.fechaExamen||"") >= portalDescargaFechaDesde);
    if (portalDescargaFechaHasta) _descListaFiltrada = _descListaFiltrada.filter(p => (p.fechaExamen||"") <= portalDescargaFechaHasta);
    const _descFTxt = portalDescargaFiltro.trim().toLowerCase();
    if (_descFTxt) _descListaFiltrada = _descListaFiltrada.filter(p => (p.nombres||"").toLowerCase().includes(_descFTxt)||(p.docNumero||"").includes(_descFTxt));

    // Helper HTML→PDF blob
    const _descHtmlToPdfBlob = (htmlContent) => new Promise((resolve, reject) => {
      const ifr = document.createElement('iframe');
      ifr.style.cssText = 'position:fixed;left:-9999px;top:0;width:816px;height:1px;border:0;visibility:hidden;';
      document.body.appendChild(ifr);
      const cleanup = () => { setTimeout(()=>{ if(document.body.contains(ifr)) document.body.removeChild(ifr); },300); };
      const _to = setTimeout(()=>{ cleanup(); reject(new Error('timeout')); }, 25000);
      ifr.onload = async () => {
        try {
          const iDoc = ifr.contentDocument;
          const nb = iDoc.querySelector('.np-dl,.np-bar'); if(nb) nb.style.display='none';
          const sh = iDoc.documentElement.scrollHeight;
          ifr.style.height = sh+'px';
          await new Promise(r=>setTimeout(r,300));
          const canvas = await html2canvas(iDoc.body,{ scale:2, useCORS:true, allowTaint:true, backgroundColor:'#ffffff', width:816, windowWidth:816, scrollX:0, scrollY:0, height:sh, windowHeight:sh });
          const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'letter' });
          const pW=pdf.internal.pageSize.getWidth(), pH=pdf.internal.pageSize.getHeight();
          const mg=15, cW=pW-mg*2, pcH=pH-mg*2;
          const pxPerMm=canvas.width/cW, pcHpx=Math.round(pcH*pxPerMm);
          const totalPages=Math.ceil(canvas.height/pcHpx);
          for(let pg=0;pg<totalPages;pg++){
            if(pg>0) pdf.addPage();
            const y0=pg*pcHpx, y1=Math.min(y0+pcHpx,canvas.height), slicePx=y1-y0;
            const tmp=document.createElement('canvas'); tmp.width=canvas.width; tmp.height=slicePx;
            const ctx=tmp.getContext('2d');
            ctx.fillStyle='#fff'; ctx.fillRect(0,0,tmp.width,tmp.height);
            ctx.drawImage(canvas,0,y0,canvas.width,slicePx,0,0,canvas.width,slicePx);
            pdf.addImage(tmp.toDataURL('image/jpeg',0.92),'JPEG',mg,mg,cW,slicePx/pxPerMm);
          }
          clearTimeout(_to); cleanup(); resolve(pdf.output('blob'));
        } catch(e){ clearTimeout(_to); cleanup(); reject(e); }
      };
      ifr.srcdoc = htmlContent;
    });

    // Generador HTML por tipo
    const _descGenHtml = (p, tipo) => {
      const docD = activeDoctorData || {};
      const sig  = activeSignature || "";
      const comp = companies.find(c => c.id === p.empresaId || c.nit === p.empresaNit) || null;
      if (tipo === "cert") return _generarCertificadoHTMLNormalizado(p, docD, sig, comp);
      const nombre = p.nombres||"Paciente", cc = p.docNumero||"", fecha = p.fechaExamen||"", empresa = p.empresaNombre||"";
      const estilos = "<style>body{font-family:Arial,sans-serif;padding:20mm;font-size:11pt;color:#111;}h2{color:#065f46;border-bottom:2px solid #065f46;padding-bottom:6px;}table{width:100%;border-collapse:collapse;margin-top:12px;}td,th{border:1px solid #ccc;padding:6px 10px;font-size:10pt;}th{background:#f0fdf4;font-weight:bold;}</style>";
      if (tipo === "deriv") {
        const items = (p.derivaciones||[]); if(!items.length) return null;
        const filas = items.map(d=>"<tr><td>"+(d.especialidad||d.tipo||"--")+"</td><td>"+(d.motivo||d.descripcion||"--")+"</td><td>"+(d.urgencia||"--")+"</td></tr>").join("");
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">"+estilos+"</head><body><h2>Derivaciones / Remisiones</h2><p><b>Paciente:</b> "+nombre+" | <b>CC:</b> "+cc+" | <b>Empresa:</b> "+empresa+" | <b>Fecha:</b> "+fecha+"</p><table><thead><tr><th>Especialidad</th><th>Motivo</th><th>Urgencia</th></tr></thead><tbody>"+filas+"</tbody></table></body></html>";
      }
      if (tipo === "formula") {
        const items = (p.formulaMedicamentos||p.formula||[]); if(!items.length) return null;
        const filas = items.map(m=>"<tr><td>"+(m.nombre||m.medicamento||"--")+"</td><td>"+(m.dosis||"--")+"</td><td>"+(m.via||"--")+"</td><td>"+(m.duracion||"--")+"</td><td>"+(m.cantidad||"--")+"</td></tr>").join("");
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">"+estilos+"</head><body><h2>Fórmula Médica / Medicamentos</h2><p><b>Paciente:</b> "+nombre+" | <b>CC:</b> "+cc+" | <b>Empresa:</b> "+empresa+" | <b>Fecha:</b> "+fecha+"</p><table><thead><tr><th>Medicamento</th><th>Dosis</th><th>Vía</th><th>Duración</th><th>Cantidad</th></tr></thead><tbody>"+filas+"</tbody></table></body></html>";
      }
      if (tipo === "examen") {
        const items = (p.examenesParaclinicos||p.examenes||p.paraclinicosSolicitados||[]); if(!items.length) return null;
        const filas = items.map(e=>"<tr><td>"+(e.nombre||e.examen||"--")+"</td><td>"+(e.resultado||e.observacion||"--")+"</td><td>"+(e.fecha||fecha)+"</td></tr>").join("");
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">"+estilos+"</head><body><h2>Exámenes Paraclínicos</h2><p><b>Paciente:</b> "+nombre+" | <b>CC:</b> "+cc+" | <b>Empresa:</b> "+empresa+" | <b>Fecha:</b> "+fecha+"</p><table><thead><tr><th>Examen</th><th>Resultado</th><th>Fecha</th></tr></thead><tbody>"+filas+"</tbody></table></body></html>";
      }
      if (tipo === "interconsulta") {
        const items = (p.interconsultas||p.derivaciones||[]).filter(d=>d.tipo==="interconsulta"||d.especialidad); if(!items.length) return null;
        const filas = items.map(i=>"<tr><td>"+(i.especialidad||"--")+"</td><td>"+(i.motivo||i.descripcion||"--")+"</td><td>"+(i.prioridad||i.urgencia||"--")+"</td></tr>").join("");
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">"+estilos+"</head><body><h2>Interconsultas a Especialistas</h2><p><b>Paciente:</b> "+nombre+" | <b>CC:</b> "+cc+" | <b>Empresa:</b> "+empresa+" | <b>Fecha:</b> "+fecha+"</p><table><thead><tr><th>Especialidad</th><th>Motivo</th><th>Prioridad</th></tr></thead><tbody>"+filas+"</tbody></table></body></html>";
      }
      return null;
    };

    // Descarga ZIP
    const _descHandleZip = async () => {
      const selList = _descListaFiltrada.filter(p => portalDescargaSeleccion.has(p.id));
      if (!selList.length) { showAlert("Selecciona al menos un trabajador."); return; }
      const tiposActivos = Object.entries(portalDescargaTipos).filter(([,v])=>v).map(([k])=>k);
      if (!tiposActivos.length) { showAlert("Selecciona al menos un tipo de documento."); return; }
      showAlert("📦 Generando ZIP...\n\nEsto puede tardar unos segundos. El archivo se descargará automáticamente.");
      const zip = new JSZip(); let totalDocs = 0;
      for (let i = 0; i < selList.length; i++) {
        const p = selList[i];
        const carpeta = String(i+1).padStart(2,'0')+"_"+(p.nombres||'Pac').replace(/[^a-zA-Z0-9 ]/g,'_').substring(0,30)+"_"+(p.docNumero||'').replace(/\D/g,'');
        for (const tipo of tiposActivos) {
          try {
            const html = _descGenHtml(p, tipo); if(!html) continue;
            const blob = await _descHtmlToPdfBlob(html);
            const lbl = {cert:"Certificado",deriv:"Derivaciones",formula:"Formula",examen:"Examenes",interconsulta:"Interconsultas"}[tipo]||tipo;
            zip.file(carpeta+"/"+lbl+".pdf", blob); totalDocs++;
          } catch(e){ console.error('[ZIP]',p.nombres,tipo,e); }
        }
      }
      if (!totalDocs) { showAlert("⚠️ No se encontraron documentos para los tipos seleccionados."); return; }
      try {
        const zipBlob = await zip.generateAsync({ type:'blob', compression:'DEFLATE', compressionOptions:{ level:6 } });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        const empLabel = portalDescargaEmpresa ? (_descEmpresasUnicas.find(([id])=>id===portalDescargaEmpresa)?.[1]||"empresa") : "Todas_Empresas";
        a.href = url; a.download = "Documentos_"+empLabel.replace(/[^a-zA-Z0-9]/g,'_').substring(0,25)+"_"+new Date().toISOString().slice(0,10)+".zip";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(url),3000);
        showAlert("✅ ZIP descargado\n\n• "+selList.length+" trabajador(es)\n• "+totalDocs+" documento(s) generado(s)");
      } catch(e){ console.error('[ZIP]',e); showAlert('❌ Error al generar el ZIP. Intenta de nuevo.'); }
    };

    // Descarga PDF combinado
    const _descHandlePdfCombinado = () => {
      const selList = _descListaFiltrada.filter(p => portalDescargaSeleccion.has(p.id));
      if (!selList.length) { showAlert("Selecciona al menos un trabajador."); return; }
      const docD = activeDoctorData||{}, sig = activeSignature||"";
      const w = window.open("","_blank","width=900,height=700");
      if (!w) { showAlert("El navegador bloqueó la ventana emergente. Permite los popups para descargar."); return; }
      const certs = selList.map((p,i)=>{
        const comp = companies.find(c=>c.id===p.empresaId||c.nit===p.empresaNit)||null;
        const html = _generarCertificadoHTMLNormalizado(p, docD, sig, comp);
        const bm = html.match(new RegExp("<body[^>]*>([\\s\\S]*)<\\/body>"));
        const body = bm ? bm[1] : html;
        return "<div style=\""+(i>0?"page-break-before:always;padding-top:10mm;":"")+"\">"+ body +"</div>";
      }).join("");
      const comp0 = companies.find(c=>c.id===selList[0].empresaId||c.nit===selList[0].empresaNit)||null;
      const fh = _generarCertificadoHTMLNormalizado(selList[0], docD, sig, comp0);
      const sm = fh.match(new RegExp("<style>([\\s\\S]*?)<\\/style>"));
      const styles = sm ? sm[1] : "";
      const empLabel = portalDescargaEmpresa ? (_descEmpresasUnicas.find(([id])=>id===portalDescargaEmpresa)?.[1]||"Empresa") : "Todas las Empresas";
      w.document.write("<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"UTF-8\"><title>Certificados — "+empLabel+"</title><style>@page{size:letter portrait;margin:12mm 14mm 14mm 14mm;}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}table{border-collapse:collapse;page-break-inside:auto;}tr{page-break-inside:avoid;}td,th{page-break-inside:avoid;}"+styles+".np-dl{position:fixed;top:10px;right:10px;z-index:9999;}@media print{.np-dl{display:none!important;}body{padding:0!important;}}</style></head><body><div class=\"np-dl\"><button onclick=\"window.print()\" style=\"background:#065f46;color:#fff;border:none;padding:10px 24px;border-radius:10px;font-weight:900;cursor:pointer;font-size:12px;\">&#128229; Guardar PDF ("+selList.length+" certificados)</button></div>"+certs+"</body></html>");
      w.document.close();
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 font-sans flex flex-col">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏢</span>
            <div>
              <p className="text-white font-black text-sm">Portal Empresa</p>
              <p className="text-blue-200 text-[10px]">
                SISO OcupaSalud - Acceso confidencial
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {empresaEncontrada && (
              <button
                onClick={() => {
                  setEmpresaEncontrada(null);
                  setPacientesEmpresa([]);
                  setCodigoEmpresa("");
                  setPortalEmpresaFiltroDoc("");
                }}
                className="px-3 py-1.5 bg-white/20 text-white text-xs font-black rounded-lg hover:bg-white/30"
              >
                🔄 Otra empresa
              </button>
            )}
            <button
              onClick={() => goBack()}
              className="px-3 py-1.5 bg-white/20 text-white text-xs font-black rounded-lg hover:bg-white/30"
            >
              ← Salir
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
          {!empresaEncontrada ? (
            /* LOGIN */
            <div className="bg-white rounded-2xl shadow-2xl p-8 mt-8 max-w-md mx-auto text-center">
              <p className="text-4xl mb-3">🔐</p>
              <h2 className="font-black text-gray-800 text-xl mb-1">
                Acceso Portal Empresa
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Ingrese el NIT de su empresa o el código de acceso proporcionado
                por su médico ocupacional.
              </p>
              <input
                value={codigoEmpresa}
                onChange={(e) => setCodigoEmpresa(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarEmpresa()}
                placeholder="NIT o código de acceso..."
                className="w-full p-3 border-2 border-blue-200 rounded-xl text-sm mb-4 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={buscarEmpresa}
                disabled={buscando}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-black rounded-xl text-sm disabled:opacity-60"
              >
                {buscando ? "⏳ Buscando..." : "🔍 Acceder al portal"}
              </button>
              <p className="text-[10px] text-gray-400 mt-4">
                ⚠️ Los diagnósticos clínicos son confidenciales y NO están
                disponibles en este portal (Art. 16 Res. 1843/2025)
              </p>
              {/* FASE 2: Login Admin de Empresa */}
              <div className="mt-6 pt-5 border-t border-gray-200">
                <p className="text-xs text-gray-400 mb-3 font-bold">
                  ━━ O ingresar como administrador de empresa ━━
                </p>
                <input
                  value={portalAdminLoginUser}
                  onChange={(e) => setPortalAdminLoginUser(e.target.value)}
                  placeholder="Usuario admin"
                  className="w-full p-2.5 border border-purple-200 rounded-xl text-sm mb-2 focus:border-purple-500 focus:outline-none"
                />
                <input
                  type="password"
                  value={portalAdminLoginPass}
                  onChange={(e) => setPortalAdminLoginPass(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // Buscar empresa por usuario admin
                      const empAdmin = companies.find(
                        (c) =>
                          c.portalAdminUser === portalAdminLoginUser.trim() &&
                          c.portalActivo
                      );
                      if (!empAdmin) {
                        showAlert("Administrador no encontrado.");
                        return;
                      }
                      _sha256(portalAdminLoginPass).then((hash) => {
                        if (hash === empAdmin.portalAdminPassHash) {
                          const pacs = patientsList.filter(
                            (p) =>
                              (p.empresaId === empAdmin.id ||
                                p.empresaNit === empAdmin.nit) &&
