# 🤖 PROMPT PARA SESIONES DE MIGRACIÓN
## Monolito (OcupaSalud) → Refactorizado (SISO App)

**Última actualización:** 30 de junio de 2026 — Sesión #1  
**Documento de tracking:** `PROTOCOLO-MIGRACION-FINAL.md`

---

## 📋 INSTRUCCIONES PARA CLINE — Copia y pega esto al inicio de cada sesión:

```
Estamos en el proceso de migración del monolito (OcupaSalud) al refactorizado (SISO App).
Contexto de la sesión anterior: [DESCRIBIR LO QUE SE HIZO Y QUÉ FALTÓ].

DATOS CLAVE:
- Monolito (producción actual): https://ocupasaludparadesplegar-f4q.pages.dev/
- Refactorizado (nuevo): https://0e14e2ed.siso-appultimo-arp.pages.dev/
- Repo refactorizado: drjuliancucalon-droid/siso-appultimo (branch: main)
- Repo monolito: drjuliancucalon-droid/ocupasaludparadesplegar (branch: main)
- Backend: Cloudflare Workers siso-api (compartido, no se modifica)
- Carpeta local refactorizado: C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\
- Carpeta local monolito: C:\Users\JQK3\Desktop\ocupasaludparadesplegar\
- Documento de tracking: PROTOCOLO-MIGRACION-FINAL.md
- Documento de auditoría UI: AUDITORIA-UI-BOTONES.md
- Documento de avance forense: AVANCE-FORENSE.md
- MCP BrowserTools instalado en cline_mcp_settings.json
- Para tomar screenshots: extension Chrome + servidor middleware deben estar corriendo

OBJETIVO DE ESTA SESIÓN: [DESCRIBIR]
```

---

## 🔁 FLUJO DE TRABAJO POR SESIÓN

### Paso 1 — Preparar el ambiente local

```bash
# Clonar el repo refactorizado (si no existe la carpeta)
gh repo clone drjuliancucalon-droid/siso-appultimo "C:\Users\JQK3\Desktop\Refactorizacion 30 de junio"

# O si ya existe, sincronizar:
cd "C:\Users\JQK3\Desktop\Refactorizacion 30 de junio"
git fetch origin main
git reset --hard origin/main

# Instalar dependencias (si se necesita dev local)
npm install
npm run dev
```

### Paso 2 — Iniciar BrowserTools MCP (para screenshots)

```bash
# Terminal 1 — Servidor middleware (SIEMPRE debe estar corriendo)
npx @agentdeskai/browser-tools-server@latest

# El MCP server se configura automáticamente en cline_mcp_settings.json
# Si falla: Recargar ventana VS Code con Ctrl+Shift+P → "Developer: Reload Window"
```

**Para usar los screenshots:**
1. Abrir Chrome → ir a la página (monolito o refactorizado)
2. Presionar F12 → pestaña "BrowserToolsMCP" → debe estar VERDE
3. Pedir a Cline: "toma un screenshot de esta página"
4. Los screenshots se guardan en: `C:\Users\JQK3\Downloads\mcp-screenshots\`

### Paso 3 — Comparar monolito vs refactorizado

Para CADA vista/página que se quiera migrar:

1. **Abrir ambas versiones en Chrome:**
   - Pestaña 1: Monolito (`ocupasaludparadesplegar-f4q.pages.dev`)
   - Pestaña 2: Refactorizado (`0e14e2ed.siso-appultimo-arp.pages.dev`)

2. **Tomar screenshot de ambas** usando BrowserTools MCP

3. **Leer el código fuente del monolito:**
   - El monolito es un solo archivo: `App.jsx` (~59K líneas)
   - Buscar la función con: `Select-String -Path App.jsx -Pattern "renderX|case \"vista\""`

4. **Leer el código equivalente del refactorizado:**
   - Cada vista es un archivo separado en `src/pages/`
   - Ej: `DashboardPage.jsx`, `HistoriaPage.jsx`, `AgendaPage.jsx`

5. **Documentar diferencias en `PROTOCOLO-MIGRACION-FINAL.md`**

### Paso 4 — Hacer cambios

```bash
cd "C:\Users\JQK3\Desktop\Refactorizacion 30 de junio"

# Editar los archivos necesarios (Cline lo hace por ti)

# Verificar cambios
git diff --stat
git status

# Commit y push (Cloudflare despliega automáticamente)
git add [archivos modificados]
git commit -m "feat: descripcion del cambio"
git push origin main
```

### Paso 5 — Verificar

1. Esperar ~2-3 minutos a que Cloudflare Pages despliegue
2. Recargar `https://0e14e2ed.siso-appultimo-arp.pages.dev/`
3. Tomar screenshot post-cambios
4. Comparar con el screenshot del monolito
5. Actualizar `PROTOCOLO-MIGRACION-FINAL.md` con resultados

---

## 📄 PLANTILLA PARA REPORTAR AVANCES

Al final de cada sesión, Cline debe actualizar `PROTOCOLO-MIGRACION-FINAL.md` con:

```markdown
## Sesión #[N] — [FECHA]

### Cambios realizados
| # | Archivo | Cambio | Líneas |
|---|---------|--------|--------|
| 1 | ... | ... | ... |

### Screenshots
| Vista | Monolito | Refactorizado ANTES | Refactorizado DESPUÉS |
|-------|----------|---------------------|----------------------|
| ... | ... | ... | ... |

### Checklist
- [ ] Cambios compilan sin errores
- [ ] Screenshot comparativo guardado
- [ ] Commit realizado y pusheado
- [ ] Verificado en producción

### Pendientes para próxima sesión
- ...
```

---

## 🗺️ MAPA DE VISTAS (Monolito → Refactorizado)

| Vista | Monolito (App.jsx) | Refactorizado | Estado migración |
|-------|-------------------|---------------|-----------------|
| **Dashboard** | `renderDashboard()` L25676 | `DashboardPage.jsx` | 🔄 En progreso (Sesión #1) |
| **Login** | `renderLogin()` | `LoginPage.jsx` | ⬜ Pendiente |
| **Agenda** | `renderAgenda()` L46424 | `AgendaPage.jsx` | ✅ 90% migrado |
| **HC Ocupacional** | `renderHistoriaOcupacional()` | `HistoriaPage.jsx` | ⬜ Pendiente revisar |
| **Pacientes** | `renderPatients()` | `PatientsPage.jsx` | ⬜ Pendiente |
| **Empresas** | `renderCompanies()` | `CompaniesPage.jsx` | ⬜ Pendiente |
| **Reportes** | `renderReportes()` | `ReportsPage.jsx` | ⬜ Pendiente |
| **Facturación** | `renderFacturacion()` | `BillingPage.jsx` | ⬜ Pendiente |
| **Usuarios** | `renderUsers()` | `UsersPage.jsx` | ⬜ Pendiente |
| **Configuración** | `renderSettings()` | `SettingsPage.jsx` | ⬜ Pendiente |

---

## ⚡ COMANDOS RÁPIDOS

```bash
# Clonar repositorio
gh repo clone drjuliancucalon-droid/siso-appultimo "C:\Users\JQK3\Desktop\Refactorizacion 30 de junio"

# Sincronizar con GitHub
cd "C:\Users\JQK3\Desktop\Refactorizacion 30 de junio" && git fetch origin main && git reset --hard origin/main

# Commit y push
cd "C:\Users\JQK3\Desktop\Refactorizacion 30 de junio" && git add -A && git commit -m "feat: [descripcion]" && git push origin main

# Iniciar servidor middleware (siempre necesario para screenshots)
npx @agentdeskai/browser-tools-server@latest

# Buscar función en el monolito
powershell -Command "Select-String -Path 'C:\Users\JQK3\Desktop\ocupasaludparadesplegar\src\App.jsx' -Pattern 'renderDashboard|renderAgenda|renderHistoria'"
```

---

## 🔗 LINKS IMPORTANTES

| Recurso | URL |
|---------|-----|
| **Monolito (producción)** | https://ocupasaludparadesplegar-f4q.pages.dev/ |
| **Refactorizado (producción)** | https://0e14e2ed.siso-appultimo-arp.pages.dev/ |
| **Repo refactorizado** | https://github.com/drjuliancucalon-droid/siso-appultimo |
| **Repo monolito** | https://github.com/drjuliancucalon-droid/ocupasaludparadesplegar |
| **Backend Cloudflare** | https://dash.cloudflare.com/0b9efca009317f8624843e4fa61d17ed/workers/services/view/siso-api/production |
| **Panel BrowserToolsMCP** | Chrome DevTools → pestaña BrowserToolsMCP |
| **Screenshots** | `C:\Users\JQK3\Downloads\mcp-screenshots\` |

---

*Usa este prompt al inicio de cada sesión con Cline para darle todo el contexto necesario.*