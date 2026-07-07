  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50 font-sans">
      {renderNavbar()}
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          {/* ── IPS: Banner de empresa cuando el usuario tiene empresaId ── */}
          {currentUser?.empresaId &&
            (() => {
              const _miEmpBanner = companies.find(
                (c) => c.id === currentUser.empresaId
              );
              return (
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-4 mb-4 text-white shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-xl">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-lg tracking-tight">
                        {_miEmpBanner?.nombre || "IPS"}
                      </p>
                      <p className="text-teal-100 text-xs">
                        NIT: {_miEmpBanner?.nit || "—"} ·{" "}
                        {_miEmpBanner?.ciudad || ""} ·{" "}
                        {currentUser.role === "admin_empresa"
                          ? "Admin IPS"
                          : currentUser.role === "medico"
                          ? "Médico IPS"
                          : "Secretaria IPS"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
            <h2 className="text-2xl font-black text-gray-800">
              {currentUser?.empresaId ? "Panel IPS" : "Panel Principal"}
            </h2>
            {/* FASE 2: Indicador médico de turno */}
            {_isAdmin(currentUser?.role) && (
              <div className="flex items-center gap-2">
                {medicoTurnoActivo ? (
                  <div
                    onClick={() =>
                      goTo("users") ||
                      setTimeout(() => setActiveUserMgmtTab("reasignacion"), 50)
                    }
                    className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-green-100 transition"
                    title="Click para cambiar médico de turno"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-black text-green-700">
                      🩺 Turno:{" "}
                      {usersList.find((u) => u.user === medicoTurnoActivo)
                        ?.name || medicoTurnoActivo}
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={() =>
                      goTo("users") ||
                      setTimeout(() => setActiveUserMgmtTab("reasignacion"), 50)
                    }
                    className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-amber-100 transition"
                  >
                    <span className="text-xs text-amber-600 font-bold">
                      ⚠️ Sin médico de turno
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            {getSpanishDate(null)} -- {currentUser?.name}
            {currentUser?.role === "super_admin" && (
              <span className="ml-2 text-purple-600 font-bold">
                ⭐ Super Admin · {orgsList.length} orgs
              </span>
            )}
          </p>
          {/* ── PLAN STATUS BANNER ── */}
          {(() => {
            const plan = PLAN_CONFIG[currentUser?.license || "libre"];
            const hcUsadas = _contarHC(patientsList, currentUser?.user);
            const pct =
              plan.maxHC < 9999
                ? Math.round((hcUsadas / plan.maxHC) * 100)
                : -1;
            const _expDays = currentUser?.licenseExpiry
              ? Math.ceil(
                  (new Date(currentUser.licenseExpiry) - new Date()) / 86400000
                )
              : 99;
            const isExpiring =
              plan.price > 0 && _expDays >= 0 && _expDays <= 7
                ? _expDays
                : false;
            const colorMap = {
              libre: "gray",
              starter: "teal",
              pro: "blue",
              clinica: "purple",
            };
            const col = colorMap[currentUser?.license || "libre"];
            return (
              <div
                className={`mt-3 flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl bg-${col}-50 border border-${col}-200`}
              >
                <span className={`font-black text-${col}-700 text-sm`}>
                  {plan.label}
                </span>
                <span className="text-gray-400 text-xs">·</span>
                {plan.maxHC < 9999 ? (
                  <span
                    className={`text-xs font-bold ${
                      pct >= 100
                        ? "text-red-600"
                        : pct >= 80
                        ? "text-amber-600"
                        : "text-gray-600"
                    }`}
                  >
                    📋 {hcUsadas}/{plan.maxHC} HC {pct >= 80 && "⚠️"}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">
                    📋 HC ilimitadas
                  </span>
                )}
                {isExpiring !== false && isExpiring >= 0 && (
                  <span className="text-xs font-bold text-amber-600">
                    ⏰ Vence en {isExpiring}d
                  </span>
                )}
                {plan.price === 0 && (
                  <button
                    onClick={() => goTo("planes")}
                    className={`ml-auto text-xs font-black bg-${col}-600 text-white px-3 py-1 rounded-lg hover:opacity-90 transition`}
                  >
                    ⬆️ Ver planes
                  </button>
                )}
              </div>
            );
          })()}
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(() => {
            // ── IPS: scope stats to empresa patients ──
            const _scopedPats = currentUser?.empresaId
              ? patientsList.filter((p) => {
                  const _scEmp = companies.find(
                    (c) => c.id === currentUser.empresaId
                  );
                  return (
                    p.empresaId === currentUser.empresaId ||
                    (_scEmp && p.empresaNit === _scEmp.nit)
                  );
                })
              : patientsList;
            const _scopedComps = currentUser?.empresaId
              ? companies.filter((c) => c.id === currentUser.empresaId)
              : companies;
            return [
              {
                label: "Historias Registradas",
                value: _scopedPats.filter((p) => p.fechaExamen).length,
                color: "emerald",
                icon: FileText,
              },
              {
                label: "Empresas",
                value: _scopedComps.length,
                color: "purple",
                icon: Building2,
              },
              {
                label: "HC Cerradas",
                value: _scopedPats.filter((p) => p.estadoHistoria === "Cerrada")
                  .length,
                color: "red",
                icon: Lock,
              },
              {
                label: "HC Abiertas",
                value: _scopedPats.filter(
                  (p) => p.estadoHistoria !== "Cerrada" && p.fechaExamen
                ).length,
                color: "blue",
                icon: Unlock,
              },
              ...(_isAdminOrEmpresa(currentUser?.role)
                ? [
                    {
                      label: currentUser?.empresaId
                        ? "Médicos IPS"
                        : "Médicos activos",
