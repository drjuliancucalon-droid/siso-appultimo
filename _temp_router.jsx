                    setTwoFAStep(null);
                    setTwoFAToken("");
                    setTwoFAError("");
                  }}
                  className="w-full py-2 text-gray-500 text-xs hover:text-gray-700"
                >
                  ← Volver al inicio de sesión
                </button>
              </div>
            </div>
          </div>
        );
      return renderLogin();
    }
    if (view === "dashboard") return renderDashboard();
    if (view === "superadmin") return renderSuperAdmin();
    if (view === "planes") return renderPlanes();
    if (view === "portaltrabajador") return renderPortalTrabajador();
    if (view === "portalempresa") return renderPortalEmpresa();
    if (view === "habeasdata") return renderHabeasData();
    if (view === "arl") return renderARL();
    if (view === "sve") return renderSVE();
    if (view === "telemedicina") return renderTelemedicina();
    if (view === "agenda") return renderAgenda();
    if (view === "asistencia") return renderAsistenciaAgenda();
    if (view === "patients") return renderPatients();
    // ══ B-07: Pantalla cambio de contraseña obligatorio (primer login o forzado) ══
    if (view === "changePassword")
      return (
        <ChangePasswordForm
          currentUser={currentUser}
          usersList={usersList}
          setUsersList={setUsersList}
          setCurrentUser={setCurrentUser}
          _sync={_sync}
          _patKey={_patKey}
          goTo={goTo}
          showAlert={showAlert}
        />
      );
    if (view === "companies") return renderCompanies();
    if (view === "reporte") return renderReporte();
    if (view === "bill") return renderBill();
    if (view === "verification") return renderVerification();
    if (view === "users") return renderUsers();
    if (view === "portafolio") return renderPortafolio();
    if (view === "caja") return renderCaja();
    if (view === "perfilips") return renderPerfilIPS();
    if (view === "contabilidad") return renderContabilidad();
    if (view === "cotizaciones") {
