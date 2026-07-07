  const renderHistoriaOcupacional = () => (
    <div
      className="bg-white mx-auto shadow-2xl print:shadow-none carta-visual"
      style={{
        width: "21.59cm",
        minHeight: "auto",
        padding: "1.2cm",
        boxSizing: "border-box",
      }}
    >
      {/* Header: BrandLogo visible solo en impresión (en pantalla ya aparece en la nav) */}
      <div className="flex justify-between items-center border-b-2 border-emerald-500 pb-3 mb-3 print:border-black">
        <div className="w-1/3 hidden print:block">
          <BrandLogo data={activeDoctorData} />
        </div>
        <div className="w-1/3 text-center">
          <h1 className="text-sm font-black text-gray-800 uppercase">
            Historia Clínica Ocupacional
          </h1>
          <p className="text-[9px] text-gray-500 font-medium">
            SEGURIDAD Y SALUD EN EL TRABAJO
          </p>
        </div>
        <div className="w-1/3 text-right text-[9px] font-bold text-gray-400">
          <p>FOR-SST-001 v4.0</p>
          <p>Res. 1843/2025</p>
          <p className="text-[8px] text-gray-500">
            Folio: {data.folioHC || "Auto"} · v{data.versionDocumento || 1}
          </p>
        </div>
      </div>
      {historyNotification && (
        <div className="mb-3 bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-xl flex justify-between items-center no-print">
          <div>
            <p className="text-xs font-black text-emerald-800">
              📚 Antecedentes cargados automáticamente desde HC anterior
            </p>
            <p className="text-[10px] text-emerald-600 mt-0.5">
              {historyNotification} atención(es) previa(s) · Antecedentes,
              hábitos y riesgos prellenos · Puede editarlos libremente
            </p>
          </div>
          <button
            onClick={() => handleOpenHistoryModal(data.docNumero)}
            className="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"
          >
            <History className="w-3 h-3" /> Ver historial
          </button>
        </div>
      )}
      {/* ── B-19: Consentimiento Informado Digital - Ley 23/1981 · Res.8430/1993 · Ley 1581/2012 · Res.1843/2025 Art.12 ── */}
      {showConsentModal && (
        <ConsentimientoModal
          data={data}
          estadoCerrada={data.estadoHistoria === "Cerrada"}
          onCerrar={() => setShowConsentModal(false)}
          onConfirmar={(campos) => {
            setData((prev) => ({ ...prev, ...campos }));
            setShowConsentModal(false);
          }}
        />
      )}
      <div
        className={`mb-3 p-3 rounded-xl border-2 no-print:border ${
          data.consentimientoInformado
            ? "bg-emerald-50 border-emerald-400"
            : "bg-amber-50 border-amber-400"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-black uppercase tracking-wide ${
                data.consentimientoInformado
                  ? "text-emerald-800"
                  : "text-amber-800"
              }`}
            >
              {data.consentimientoInformado
                ? "✅ Consentimiento Informado Registrado"
                : "⚠️ Consentimiento Informado Pendiente"}
            </span>
            <span className="text-[9px] text-gray-400 font-bold">
              Res. 1843/2025 Art.12 · Ley 1581/2012
            </span>
          </div>
          {!data.consentimientoInformado &&
            data.estadoHistoria !== "Cerrada" && (
              <button
                type="button"
                onClick={() => setShowConsentModal(true)}
                className="px-3 py-1 text-[11px] font-black text-white bg-amber-600 hover:bg-amber-700 rounded-lg no-print"
              >
                📋 Registrar consentimiento
              </button>
            )}
          {data.consentimientoInformado &&
            data.estadoHistoria !== "Cerrada" && (
              <button
                type="button"
                onClick={() => setShowConsentModal(true)}
                className="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg no-print"
              >
                👁 Ver / Editar
              </button>
            )}
        </div>
        {data.consentimientoInformado && (
          <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-emerald-700">
            <span>
              👤{" "}
              <strong>
                {data.consentimientoNombrePaciente ||
                  data.nombres ||
                  "Paciente"}
              </strong>
            </span>
            <span>📅 {data.fechaConsentimiento}</span>
            {data.consentimientoTimestamp && (
              <span>
                🕐{" "}
                {new Date(data.consentimientoTimestamp).toLocaleTimeString(
                  "es-CO",
                  { hour: "2-digit", minute: "2-digit" }
                )}
              </span>
            )}
            <span className="text-[9px] text-gray-400">
              🔖 {data.consentimientoVersion}
            </span>
          </div>
        )}
      </div>
      <fieldset
        disabled={data.estadoHistoria === "Cerrada"}
        className="disabled:opacity-75"
      >
        {/* Empresa y tipo */}
        <div className="grid grid-cols-2 gap-3 mb-2 bg-emerald-50 p-2 rounded-lg border border-emerald-100 print:bg-transparent print:border-gray-300">
          <div>
            <label className="block text-[10px] font-black text-emerald-800 mb-1">
              EMPRESA
            </label>
            <select
              className="w-full p-1.5 border border-emerald-300 rounded text-xs font-bold bg-white print:border-none"
              value={data.empresaId}
              onChange={handleCompanySelect}
            >
              <option value="particular">PARTICULAR / INDEPENDIENTE</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-emerald-800 mb-1">
              ÉNFASIS
            </label>
            <select
              name="enfasisExamen"
              value={data.enfasisExamen}
              onChange={handleChange}
              className="w-full p-1.5 border border-emerald-300 rounded text-xs font-bold bg-white print:border-none"
            >
              <option value="GENERAL">General</option>
              <option value="OSTEOMUSCULAR">Osteomuscular</option>
              <option value="CORAZON">Cardiovascular / Corazón</option>
              <option value="ALTURAS">Trabajo en Alturas</option>
              <option value="ALIMENTOS">Manipulación de Alimentos</option>
              <option value="CONFINADOS">Espacios Confinados</option>
            </select>
          </div>
        </div>
        {/* Tipo de examen */}
        <div className="bg-gray-50 p-2 rounded-lg mb-2 border border-gray-200 print:bg-transparent print:border-gray-300">
          <label className="block text-[10px] font-black text-gray-700 mb-1 uppercase">
            Tipo de Evaluación
          </label>
          <div className="flex flex-wrap gap-3">
            {/* NORMATIVO: Res. 1843/2025 - Tipos de evaluación actualizados */}
            {[
              "INGRESO",
              "PERIODICO",
              "RETIRO",
              "POST-INCAPACIDAD",
              "RETORNO-LABORAL",
              "SEGUIMIENTO",
            ].map((opt) => (
              <label
                key={opt}
                className="flex items-center text-[10px] font-bold cursor-pointer text-gray-700 hover:text-emerald-600"
              >
                <input
                  type="radio"
                  name="tipoExamen"
                  value={opt}
                  checked={data.tipoExamen === opt}
                  onChange={handleChange}
                  className="mr-1 w-3 h-3 text-emerald-600"
                />
                {opt === "RETORNO-LABORAL" ? (
                  <span className="text-purple-700">
                    RETORNO LABORAL{" "}
                    <span className="text-[8px] font-normal text-purple-500">
                      (Res.1843/2025 Art.13 - Ausencia &gt;90 días)
                    </span>
                  </span>
                ) : (
                  opt
                )}
              </label>
            ))}
            {data.tipoExamen === "SEGUIMIENTO" && (
              <select
                name="frecuenciaSeguimiento"
                value={data.frecuenciaSeguimiento}
                onChange={handleChange}
                className="p-0.5 text-[10px] border rounded border-emerald-300 bg-white ml-2"
              >
                <option value="">Frecuencia...</option>
                {["Bimestral", "Trimestral", "Semestral", "Anual"].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <SectionTitle title="Datos Sociodemográficos y Laborales" icon={User} />
        <div className="relative">
          {patientSuggestions.length > 0 && (
            <div className="absolute z-50 top-16 left-0 w-full bg-white border border-emerald-200 shadow-xl rounded-lg max-h-52 overflow-y-auto no-print">
              {patientSuggestions.map((p) => (
                <div
                  key={p.id}
                  onClick={() => selectPatientSuggestion(p)}
                  className="p-2 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-xs text-gray-800">
                      {p.nombres}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      CC: {p.docNumero} -- {p.cargo}
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
