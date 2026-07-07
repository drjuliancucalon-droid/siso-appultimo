                        : "Médicos activos",
                      value: currentUser?.empresaId
                        ? usersList.filter(
                            (u) =>
                              u.empresaId === currentUser.empresaId &&
                              u.role === "medico" &&
                              u.activo !== false
                          ).length
                        : usersList.filter(
                            (u) => u.role === "medico" && u.activo !== false
                          ).length,
                      color: "indigo",
                      icon: Users,
                    },
                    {
                      label: "Cuentas pendientes",
                      value: savedBillsList.filter((b) => !b.pagada).length,
                      color: "orange",
                      icon: Receipt,
                    },
                    ...(!currentUser?.empresaId
                      ? [
                          {
                            label: "Convenios por vencer",
                            value: companies.filter((c) => {
                              if (!c.convenioVencimiento) return false;
                              const d = new Date(c.convenioVencimiento);
                              const h = new Date();
                              const en30 = new Date(h);
                              en30.setDate(en30.getDate() + 30);
                              return d >= h && d <= en30;
                            }).length,
                            color: "amber",
                            icon: Building2,
                          },
                        ]
                      : []),
                  ]
                : []),
            ];
          })().map((card) => (
            <div
              key={card.label}
              className={`bg-white rounded-xl p-4 shadow-sm border border-${card.color}-100`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">
                    {card.label}
                  </p>
                  <p
                    className={`text-3xl font-black text-${card.color}-600 mt-1`}
                  >
                    {card.value}
                  </p>
                </div>
                <div className={`bg-${card.color}-50 p-2 rounded-lg`}>
                  <card.icon className={`w-5 h-5 text-${card.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* ── ACCIONES PRINCIPALES ── */}
        {["medico", "administrador", "secretaria", "admin_empresa", "super_admin"].includes(
          currentUser?.role
        ) && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={handleNewOccupHistory}
              className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all text-left"
            >
              <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-white/5 rounded-full" />
              <div className="relative">
                <div className="bg-white/20 w-9 h-9 rounded-xl flex items-center justify-center mb-3">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-black text-white text-sm leading-tight">
                  Nueva HC Ocupacional
                </h3>
                <p className="text-emerald-100 text-[11px] mt-0.5">
                  Evaluación médica del trabajo
                </p>
              </div>
            </button>
            <button
              onClick={handleNewGeneralHistory}
              className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all text-left"
            >
              <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-white/5 rounded-full" />
              <div className="relative">
                <div className="bg-white/20 w-9 h-9 rounded-xl flex items-center justify-center mb-3">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-black text-white text-sm leading-tight">
                  Nueva HC General
                </h3>
                <p className="text-blue-100 text-[11px] mt-0.5">
                  Consulta medicina general
                </p>
              </div>
            </button>
          </div>
        )}

        {/* ── MÓDULOS AGRUPADOS ── */}
        <div className="space-y-4 mb-6">
          {/* Gestión Clínica */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              🩺 Gestión Clínica
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => goTo("patients")}
                className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-teal-200 hover:bg-teal-50/40 transition group shadow-sm"
              >
                <div className="bg-teal-50 p-2 rounded-lg group-hover:bg-teal-100 transition flex-shrink-0">
                  <Users className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-black text-gray-800 text-xs leading-tight">
                    Pacientes
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    Expedientes
                  </p>
                </div>
              </button>
              <button
                onClick={() => goTo("agenda")}
                className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-blue-200 hover:bg-blue-50/40 transition group shadow-sm"
              >
                <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition flex-shrink-0 text-base leading-none flex items-center justify-center w-8 h-8">
                  🗓️
                </div>
                <div className="text-left min-w-0">
                  <p className="font-black text-gray-800 text-xs leading-tight">
                    Agenda
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    Sala de espera
                  </p>
                </div>
              </button>
              <button
                onClick={() => goTo("verification")}
                className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-cyan-200 hover:bg-cyan-50/40 transition group shadow-sm"
              >
                <div className="bg-cyan-50 p-2 rounded-lg group-hover:bg-cyan-100 transition flex-shrink-0">
                  <FileSearch className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-black text-gray-800 text-xs leading-tight">
                    Verificar
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    Certificados
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Administración */}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              💼 Administración
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => goTo("companies")}
                className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:border-purple-200 hover:bg-purple-50/40 transition group shadow-sm"
              >
                <div className="bg-purple-50 p-2 rounded-lg group-hover:bg-purple-100 transition flex-shrink-0">
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-black text-gray-800 text-xs leading-tight">
                    Empresas
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">Clientes</p>
                </div>
              </button>
              <button
                onClick={() => {
                  goTo("users");
                  if (
                    !_isAdmin(currentUser?.role) &&
                    !_isAdminEmpresa(currentUser?.role)
                  ) {
                    const me = usersList.find(
                      (u) => u.user === currentUser?.user
                    );
                    if (me) {
                      setTimeout(() => {
                        setUserEditId(me.id || me.user);
                        setEditForm({
