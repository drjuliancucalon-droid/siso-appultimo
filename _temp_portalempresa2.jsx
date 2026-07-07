                              !p._archivado
                          );
                          setEmpresaEncontrada(empAdmin);
                          setPacientesEmpresa(pacs);
                          setPortalEmpresaAdmin(empAdmin);
                          setPortalAdminTab("medicos");
                        } else {
                          showAlert("Contraseña incorrecta.");
                        }
                      });
                    }
                  }}
                  placeholder="Contraseña"
                  className="w-full p-2.5 border border-purple-200 rounded-xl text-sm mb-3 focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const empAdmin = companies.find(
                      (c) =>
                        c.portalAdminUser === portalAdminLoginUser.trim() &&
                        c.portalActivo
                    );
                    if (!empAdmin) {
                      showAlert(
                        "Administrador no encontrado. Verifique el usuario."
                      );
                      return;
                    }
                    _sha256(portalAdminLoginPass).then((hash) => {
                      if (hash === empAdmin.portalAdminPassHash) {
                        const pacs = patientsList.filter(
                          (p) =>
                            (p.empresaId === empAdmin.id ||
                              p.empresaNit === empAdmin.nit) &&
                            !p._archivado
                        );
                        setEmpresaEncontrada(empAdmin);
                        setPacientesEmpresa(pacs);
                        setPortalEmpresaAdmin(empAdmin);
                        setPortalAdminTab("medicos");
                      } else {
                        showAlert("Contraseña incorrecta.");
                      }
                    });
                  }}
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl text-sm"
                >
                  🔐 Entrar como Administrador
                </button>
              </div>
            </div>
          ) : portalEmpresaAdmin ? (
            /* DASHBOARD ADMIN */
            <div className="space-y-4">
              {/* Header admin */}
              <div className="bg-purple-900 text-white rounded-2xl p-4 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-black text-lg">
                    {empresaEncontrada.nombre}
                  </p>
                  <p className="text-purple-200 text-xs">
                    🔐 Panel de Administración · NIT: {empresaEncontrada.nit}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPortalEmpresaAdmin(null);
                    setEmpresaEncontrada(null);
                    setPacientesEmpresa([]);
                    setPortalAdminLoginUser("");
                    setPortalAdminLoginPass("");
                  }}
                  className="px-3 py-1.5 bg-white/20 text-white text-xs font-black rounded-lg hover:bg-white/30"
                >
                  🚪 Cerrar sesión
                </button>
              </div>
              {/* Tabs admin */}
              <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-purple-100 overflow-x-auto">
                {[
                  { k: "medicos", l: "👨‍⚕️ Mis Médicos" },
                  { k: "secretarias", l: "🗂️ Secretarias" },
                  { k: "trabajadores", l: "📋 Trabajadores" },
                  { k: "cuentas", l: "📄 Cuentas" },
                  { k: "sedes", l: "🏢 Sedes" },
                ].map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setPortalAdminTab(t.k)}
                    className={"flex-shrink-0 px-4 py-2 text-xs font-black rounded-lg transition " + (portalAdminTab === t.k ? "bg-purple-700 text-white" : "text-gray-600 hover:bg-gray-100")}
                  >
                    {t.l}
                  </button>
                ))}
              </div>
              {/* Tab: Médicos */}
              {portalAdminTab === "medicos" && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-black text-gray-800">
                      👨‍⚕️ Médicos de {empresaEncontrada.nombre}
                    </p>
                  </div>
                  {/* Lista médicos existentes */}
                  <div className="space-y-2 mb-4">
                    {usersList
                      .filter(
                        (u) =>
                          u.role === "medico" &&
                          (u.empresaId === empresaEncontrada.id ||
                            (empresaEncontrada.medicoIds || []).includes(
                              u.user
                            ))
                      )
                      .map((m) => (
                        <div
                          key={m.user}
                          className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-3"
                        >
                          <div>
                            <p className="font-black text-sm text-gray-800">
                              {m.name || m.user}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              @{m.user} ·{" "}
                              {m.empresaId === empresaEncontrada.id
                                ? "Médico exclusivo"
                                : "Médico asignado"}
                            </p>
                          </div>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                            Médico
                          </span>
                        </div>
                      ))}
                    {usersList.filter(
                      (u) =>
                        u.role === "medico" &&
                        (u.empresaId === empresaEncontrada.id ||
                          (empresaEncontrada.medicoIds || []).includes(u.user))
                    ).length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">
                        Sin médicos asignados aún.
                      </p>
                    )}
                  </div>
                  {/* Formulario nuevo médico */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-black text-purple-700 mb-2">
                      ➕ Crear nuevo médico para esta empresa
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        value={nuevoMedicoEmpForm.nombre}
                        onChange={(e) =>
                          setNuevoMedicoEmpForm((p) => ({
                            ...p,
                            nombre: e.target.value,
                          }))
                        }
                        placeholder="Nombre completo"
                        className="border rounded-lg p-2 text-xs"
                      />
                      <input
                        value={nuevoMedicoEmpForm.user}
                        onChange={(e) =>
                          setNuevoMedicoEmpForm((p) => ({
                            ...p,
                            user: e.target.value,
                          }))
                        }
                        placeholder="Usuario (ej: dr_garcia)"
                        className="border rounded-lg p-2 text-xs"
                      />
                      <input
                        type="password"
                        value={nuevoMedicoEmpForm.pass}
                        onChange={(e) =>
                          setNuevoMedicoEmpForm((p) => ({
                            ...p,
                            pass: e.target.value,
                          }))
                        }
                        placeholder="Contraseña temporal"
                        className="border rounded-lg p-2 text-xs"
                      />
                      <select
                        value={nuevoMedicoEmpForm.rol}
                        onChange={(e) =>
                          setNuevoMedicoEmpForm((p) => ({
                            ...p,
                            rol: e.target.value,
                          }))
                        }
                        className="border rounded-lg p-2 text-xs"
                      >
                        <option value="medico">Médico</option>
                        <option value="secretaria">Secretaria</option>
                      </select>
                    </div>
                    <button
                      onClick={async () => {
                        if (
                          !nuevoMedicoEmpForm.nombre ||
                          !nuevoMedicoEmpForm.user ||
                          !nuevoMedicoEmpForm.pass
                        ) {
                          showAlert("Complete nombre, usuario y contraseña.");
                          return;
                        }
                        if (
                          usersList.find(
                            (u) => u.user === nuevoMedicoEmpForm.user
                          )
                        ) {
                          showAlert("Ese nombre de usuario ya existe.");
                          return;
                        }
                        const hash = await _sha256(nuevoMedicoEmpForm.pass);
                        const nuevoUser = {
                          id: Date.now(),
                          user: nuevoMedicoEmpForm.user,
                          passHash: hash,
                          mustChangePassword: true,
                          name: nuevoMedicoEmpForm.nombre,
                          role: nuevoMedicoEmpForm.rol,
                          orgId: empresaEncontrada.orgId || ORG_DEFAULT_ID,
                          empresaId: empresaEncontrada.id,
                          license: "libre",
                          licenseExpiry: "2099-12-31",
                          licenseStarted: new Date()
                            .toISOString()
                            .split("T")[0],
                          porcentajeHonorarios: 0,
                          secretariaPermisos: {
                            ...SECRETARIA_PERMISOS_DEFAULT,
                          },
                          doctorData: { ...DEFAULT_DOCTOR_DATA },
                        };
                        // Agregar usuario al sistema
                        const updUsers = [...usersList, nuevoUser];
                        setUsersList(updUsers);
                        _sync("siso_users", JSON.stringify(updUsers));
                        // Actualizar medicoIds en la empresa
                        const updComp = companies.map((c) =>
                          c.id === empresaEncontrada.id
                            ? {
                                ...c,
                                medicoIds: [
                                  ...(c.medicoIds || []),
                                  nuevoMedicoEmpForm.user,
                                ],
                              }
                            : c
                        );
                        setCompanies(updComp);
                        _syncCompanies(updComp);
                        setNuevoMedicoEmpForm({
                          nombre: "",
                          user: "",
                          pass: "",
                          rol: "medico",
                        });
                        showAlert(
                          "✅ " + (nuevoMedicoEmpForm.rol === "medico" ? "Médico" : "Secretaria") + " \"" + nuevoMedicoEmpForm.nombre + "\" creado. Debe cambiar contraseña en primer acceso."
                        );
                      }}
                      className="w-full bg-purple-700 text-white py-2 rounded-xl text-xs font-black hover:bg-purple-800"
                    >
                      ✅ Crear perfil
                    </button>
                  </div>
                </div>
              )}
              {/* Tab: Secretarias — misma lógica que médicos pero filtro por rol */}
              {portalAdminTab === "secretarias" && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <p className="font-black text-gray-800 mb-3">
                    🗂️ Secretarias de {empresaEncontrada.nombre}
                  </p>
                  <div className="space-y-2 mb-4">
                    {usersList
                      .filter(
                        (u) =>
                          u.role === "secretaria" &&
                          u.empresaId === empresaEncontrada.id
                      )
                      .map((s) => (
                        <div
                          key={s.user}
                          className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3"
                        >
                          <div>
                            <p className="font-black text-sm">
                              {s.name || s.user}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              @{s.user}
                            </p>
                          </div>
