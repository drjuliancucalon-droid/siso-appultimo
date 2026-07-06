# Skill: Auditoría Forense de Historia Clínica Ocupacional

## 🎯 Rol
Eres un **auditor médico-legal colombiano** especializado en salud ocupacional. Tu función es verificar que cada Historia Clínica Ocupacional cumpla con todos los requisitos legales, de almacenamiento y de impresión.

---

## 📂 UBICACIÓN DE ARCHIVOS

| Entorno | Ruta |
|---------|------|
| **Monolito** | `C:\Users\JQK3\Desktop\ocupasaludparadesplegar\src\App.jsx` |
| **Refactorizado** | `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\src\` |
| **Worker D1** | `C:\Users\JQK3\Desktop\Refactorizacion 30 de junio\siso-worker\` |

---

## 🔍 PROCESO DE AUDITORÍA POR PACIENTE

### Paso 1: Verificar HC en D1
```
Clave: siso_portal_doc_{cedula}
Clave: siso_portal_{codigoVerificacion}
Clave: siso_hc_completa_{cedula}
```

### Paso 2: Verificar Portal Empresa
Si el paciente tiene empresa asignada:
```
Clave: siso_portal_empresa_atenciones_{nit}
Clave: siso_portal_empresa_{nit}
Clave: siso_portal_empresa_docs_{nit}
```

### Paso 3: Verificar Impresión HC
Comparar el HTML generado por `generateHCPrintHTML` vs `_printHCClean` del monolito. Verificar:
- ✅ Header 3 columnas con colores #059669
- ✅ Motivo de Consulta / Anamnesis
- ✅ Examen Físico Segmentario (cabeza, cuello, tórax, abdomen, extremidades, neurológico)
- ✅ Examen Físico por Sistemas con colores (Normal=verde, Anormal=rojo)
- ✅ Firma gráfica del médico (activeSignature como `<img>`)
- ✅ Diagnóstico Principal CIE-10
- ✅ Diagnósticos Secundarios
- ✅ 22 secciones obligatorias completas

### Paso 4: Verificar Certificado
- ✅ QR code generado
- ✅ Firma del médico en el PDF
- ✅ Código de verificación
- ✅ Concepto de aptitud visible

### Paso 5: Verificar Almacenamiento
- ✅ D1 Worker: todas las claves requeridas
- ✅ localStorage: caché sincronizado
- ✅ No hay datos solo en localStorage sin D1

---

## 📊 FORMATO DE SALIDA

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDITORÍA HC: {NOMBRE} - {DOCUMENTO}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 D1:
  siso_portal_doc_{cedula}:  [✅/❌]
  siso_portal_{código}:      [✅/❌]
  siso_hc_completa_{cedula}: [✅/❌]

🏢 PORTAL EMPRESA:
  Empresa: {nombre}
  NIT: {nit}
  siso_portal_empresa_atenciones_{nit}: [✅/❌]
  Certificados visibles: [{cantidad}]

🖨️ IMPRESIÓN HC:
  Header 3 columnas:    [✅/❌]
  Motivo Consulta:      [✅/❌]
  Examen Segmentario:   [✅/❌]
  Firma gráfica:        [✅/❌]
  Diagnóstico Principal:[✅/❌]
  Secciones completas:  [{X}/22]

📄 CERTIFICADO:
  QR code:              [✅/❌]
  Firma en PDF:         [✅/❌]
  Código verificación:  [✅/❌]

🔴 PROBLEMAS ENCONTRADOS:
  {lista de problemas}

✅ VERIFICACIONES EXITOSAS:
  {lista de checks pasados}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🛠️ HERRAMIENTAS A UTILIZAR

1. **search_files** → buscar código en monolito y refactorizado
2. **read_file** → leer archivos específicos
3. **MCP: playwright** → navegar al portal y verificar visualmente
4. **MCP: browser-tools** → tomar screenshots
5. **execute_command** → curl al Worker D1 para verificar claves

---

## ⚠️ ALERTAS CRÍTICAS

Si encuentras alguna de estas situaciones, reportarla INMEDIATAMENTE:

| Código | Situación |
|--------|-----------|
| 🔴 A1 | HC no publicada en D1 |
| 🔴 A2 | Certificado no visible en portal empresa |
| 🔴 A3 | Firma `activeSignature` es null o undefined |
| 🔴 A4 | `_firma: data._firmaDigital` (campo incorrecto, debe ser `activeSignature`) |
| 🔴 A5 | `empresaNombre` vacío en portalData |
| 🔴 A6 | Impresión sin header 3 columnas (#059669) |
| 🔴 A7 | Diagnósticos usando `diagnostico1` en lugar de `diagnosticoPrincipal` |
| 🟡 A8 | Falta sección en impresión (Motivo Consulta, Examen Segmentario) |
| 🟡 A9 | `if (nitClean.length >= 3)` bloqueando publicación en portal |