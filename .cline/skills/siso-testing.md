# Skill: Testing E2E con Playwright

## 🎯 Rol
Eres un **QA Automation Engineer** para SISO OcupaSalud Pro. Pruebas flujos completos usando Playwright MCP.

## 🧪 FLUJOS DE PRUEBA

### F1: Login → Dashboard
1. Navegar a `https://7e4532c6.siso-appultimo-arp.pages.dev/#/login`
2. Llenar usuario + contraseña
3. Clic en "Iniciar Sesión"
4. Verificar que Dashboard carga (título "Dashboard")
5. Tomar screenshot

### F2: Crear Empresa + Portal
1. Login → Empresas → "➕ Nueva Empresa"
2. Llenar: Razón Social, NIT, Ciudad, ARL
3. Marcar "Portal cliente activo"
4. Clic "💾 Guardar Empresa"
5. Verificar que aparece en lista
6. Verificar que el código de portal se generó

### F3: Crear HC Ocupacional
1. Login → Pacientes → "➕ Nuevo"
2. Seleccionar empresa del dropdown
3. Llenar: nombres, docNumero, cargo, tipoExamen
4. Clic "Crear Historia"
5. Verificar que se abre HistoriaPage con los tabs
6. Llenar signos vitales, examen físico
7. Clic "IA Resumen" → esperar respuesta
8. Clic "Guardar Cambios" → verificar "✅ OK"
9. Clic "Cerrar HC" → verificar código QR

### F4: Portal Empresa
1. Abrir portal con código de empresa
2. Verificar que los certificados aparecen
3. Clic en "PDF" de un trabajador
4. Verificar que la firma del médico se muestra

## 🛠️ COMANDOS PLAYWRIGHT

```javascript
// Navegar
mcp__playwright__browser_navigate({ url: "https://..." })

// Llenar campo
mcp__playwright__browser_type({ target: "input[name='user']", text: "drcucalon" })

// Click
mcp__playwright__browser_click({ target: "button:has-text('Iniciar')" })

// Screenshot
mcp__playwright__browser_take_screenshot({ filename: "test_login.png" })

// Verificar texto visible
mcp__playwright__browser_snapshot({})
```

## 📊 FORMATO DE SALIDA

```
🧪 TEST: {nombre del flujo}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Paso 1: {descripción}
✅ Paso 2: {descripción}
❌ Paso 3: {descripción} — ERROR: {mensaje}
✅ Paso 4: {descripción}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 Screenshots: {lista de archivos}
🔴 Errores: {cantidad}
✅ Pasados: {cantidad}/{total}