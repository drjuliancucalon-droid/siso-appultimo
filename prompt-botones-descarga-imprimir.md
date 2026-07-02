# 🖨️ PROMPT FORENSE: EXTRACCIÓN TOTAL DE BOTONES DESCARGAR E IMPRIMIR
## Monolito: `C:\Users\JQK3\Desktop\ocupasaludparadesplegar`
## Destino: `C:\Users\JQK3\Desktop\siso-appultimo`

---

## 🎯 MISIÓN

Eres un ingeniero de software forense con 15+ años de experiencia. Tu misión es **localizar, documentar y transplantar** ABSOLUTAMENTE TODOS los botones de descarga e impresión que existen en el monolito hacia el repositorio refactorizado, preservando cada detalle funcional, visual y de comportamiento.

**REGLA ABSOLUTA:** No inventas código. No asumes comportamiento. Lees el código del monolito línea por línea, lo documentas con precisión quirúrgica, y lo transplantes al refactorizado adaptando solo la sintaxis necesaria para que encaje en la arquitectura ya existente.

---

## 📡 FASE 1 — ESCANEO FORENSE DEL MONOLITO

### PASO 1.1 — Búsqueda exhaustiva multi-capa

Ejecuta los siguientes comandos en el directorio del monolito (`C:\Users\JQK3\Desktop\ocupasaludparadesplegar`). Usa PowerShell o terminal compatible:

```powershell
# ── BÚSQUEDA 1: por texto visible del botón ──
Select-String -Path ".\**\*.*" -Pattern "descargar|download|Descargar|Download|DESCARGAR|DOWNLOAD" -Recurse | Select-Object Filename, LineNumber, Line | Export-Csv ".\busqueda_download.csv" -NoTypeInformation

# ── BÚSQUEDA 2: por texto visible del botón de impresión ──
Select-String -Path ".\**\*.*" -Pattern "imprimir|print|Imprimir|Print|IMPRIMIR|PRINT|impresión|Impresión" -Recurse | Select-Object Filename, LineNumber, Line | Export-Csv ".\busqueda_print.csv" -NoTypeInformation

# ── BÚSQUEDA 3: por funciones JS/TS de descarga ──
Select-String -Path ".\**\*.{ts,tsx,js,jsx,vue,html}" -Pattern "window\.print|\.print\(\)|printDocument|handlePrint|onPrint|triggerPrint" -Recurse | Select-Object Filename, LineNumber, Line

# ── BÚSQUEDA 4: por funciones JS/TS de descarga de archivos ──
Select-String -Path ".\**\*.{ts,tsx,js,jsx,vue,html}" -Pattern "saveAs|FileSaver|blob|createObjectURL|download\s*=|downloadFile|handleDownload|exportPDF|exportExcel|exportCSV|xlsx|jsPDF|pdfMake|html2pdf|html2canvas" -Recurse | Select-Object Filename, LineNumber, Line

# ── BÚSQUEDA 5: por iconos de descarga/impresión ──
Select-String -Path ".\**\*.{ts,tsx,js,jsx,vue,html}" -Pattern "fa-download|fa-print|GetApp|Print|CloudDownload|PictureAsPdf|FileDownload|DownloadIcon|PrintIcon|download-icon|print-icon|mdi-download|mdi-printer" -Recurse | Select-Object Filename, LineNumber, Line

# ── BÚSQUEDA 6: por atributos HTML de descarga ──
Select-String -Path ".\**\*.{html,tsx,jsx,vue}" -Pattern 'href.*download|<a.*download|download=""' -Recurse | Select-Object Filename, LineNumber, Line

# ── BÚSQUEDA 7: por bibliotecas especializadas en el package.json ──
Select-String -Path ".\package.json" -Pattern "jspdf|xlsx|file-saver|html2pdf|html2canvas|pdfmake|exceljs|papaparse|jszip|print-js|react-to-print|vue3-print-nb|@vueuse/core" -Recurse | Select-Object Filename, LineNumber, Line

# ── BÚSQUEDA 8: por tipos MIME de exportación ──
Select-String -Path ".\**\*.{ts,tsx,js,jsx,vue}" -Pattern "application/pdf|application/vnd.openxmlformats|text/csv|application/octet-stream|application/zip" -Recurse | Select-Object Filename, LineNumber, Line
```

---

### PASO 1.2 — Para CADA resultado encontrado, genera esta ficha forense

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FICHA FORENSE #[N] — [TIPO: DESCARGA | IMPRESIÓN | AMBOS]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 ARCHIVO: [ruta completa desde la raíz del monolito]
📍 LÍNEA(S): [L_inicio - L_fin]
🖥️ VISTA/PANTALLA: [nombre de la vista donde aparece]
🔗 RUTA URL: [path de la ruta donde se renderiza, ej: /reportes/pacientes]

──────────────────────────────────────────────────
A. CÓDIGO EXACTO DEL BOTÓN (copiar línea por línea)
──────────────────────────────────────────────────
[pegar el bloque JSX/HTML/Template exacto del botón, con sus líneas numeradas]

Ejemplo esperado:
  L.45: <button
  L.46:   className="btn-download"
  L.47:   onClick={handleDownload}
  L.48:   disabled={isLoading}
  L.49: >
  L.50:   <DownloadIcon size={18} />
  L.51:   Descargar PDF
  L.52: </button>

──────────────────────────────────────────────────
B. PROPIEDADES VISUALES DEL BOTÓN
──────────────────────────────────────────────────
Texto visible:       [texto exacto que ve el usuario]
Icono:               [nombre del icono, biblioteca, tamaño]
Color de fondo:      [hex o clase CSS]
Color de texto:      [hex o clase CSS]
Tamaño/padding:      [valores CSS o clases Tailwind/Bootstrap]
Estado disabled:     [¿existe? ¿cuándo se activa?]
Estado loading:      [¿existe? ¿qué muestra mientras descarga/imprime?]
Estado hover:        [¿existe? ¿qué cambia visualmente?]
Posición en pantalla: [arriba derecha / dentro de tabla / footer / barra de acciones]
Tooltip/title:       [¿tiene? ¿qué dice?]
Clases CSS aplicadas: [lista completa de clases]
Estilos inline:      [si los hay, copiarlos]

──────────────────────────────────────────────────
C. LÓGICA DE LA FUNCIÓN HANDLER (línea por línea)
──────────────────────────────────────────────────
Nombre de la función: [handleDownload / onPrint / exportarPDF / etc.]
Archivo donde vive:   [ruta del archivo donde está definida]
Línea de definición:  [L.XX]

[Copiar el cuerpo COMPLETO de la función handler, con líneas numeradas]

Ejemplo esperado:
  L.23: const handleDownloadPDF = async () => {
  L.24:   setIsLoading(true);
  L.25:   try {
  L.26:     const doc = new jsPDF();
  L.27:     doc.text(nombrePaciente, 10, 10);
  L.28:     doc.addTable(datosTabla);
  L.29:     doc.save(`reporte_${pacienteId}.pdf`);
  L.30:   } catch (error) {
  L.31:     console.error('Error al descargar:', error);
  L.32:     toast.error('No se pudo descargar el archivo');
  L.33:   } finally {
  L.34:     setIsLoading(false);
  L.35:   }
  L.36: };

──────────────────────────────────────────────────
D. DATOS QUE USA LA FUNCIÓN
──────────────────────────────────────────────────
¿De dónde vienen los datos que se descargan/imprimen?
  - Props recibidos:    [lista de props y sus tipos]
  - Estado local:       [variables de estado usadas]
  - Store/Context:      [si consume Redux/Zustand/Context, qué slice/selector]
  - API call:           [¿hace llamada a API? ¿cuál endpoint? ¿GET o POST?]
  - Datos hardcodeados: [si hay datos fijos en la función, cuáles]

──────────────────────────────────────────────────
E. BIBLIOTECAS Y DEPENDENCIAS UTILIZADAS
──────────────────────────────────────────────────
[Para CADA import que usa la función de descarga/impresión:]

  Import 1:
    Línea exacta:    [L.X: import { jsPDF } from 'jspdf']
    Biblioteca:      [jspdf]
    Versión en package.json: [^2.5.1]
    Para qué se usa: [generar PDF en el cliente]
    ¿Está instalada en el refactorizado?: [SÍ / NO / VERIFICAR]

  Import 2:
    Línea exacta:    [L.X: import * as XLSX from 'xlsx']
    Biblioteca:      [xlsx / SheetJS]
    Versión:         [^0.18.5]
    Para qué se usa: [exportar datos a Excel]
    ¿Está instalada en el refactorizado?: [SÍ / NO / VERIFICAR]

  [continuar para cada import]

──────────────────────────────────────────────────
F. FORMATO Y CONTENIDO DEL ARCHIVO GENERADO
──────────────────────────────────────────────────
Tipo de archivo generado: [PDF / Excel / CSV / ZIP / Imagen / Documento Word / Otro]
Nombre del archivo:       [fijo o dinámico — ej: reporte_${pacienteId}_${fecha}.pdf]
Contenido del archivo:
  - Encabezado/logo:     [¿incluye logo de la empresa? ¿cómo se añade?]
  - Título del documento:[texto exacto]
  - Campos incluidos:    [lista exacta de campos que van en el archivo]
  - Orden de campos:     [el orden en que aparecen]
  - Formato de fechas:   [DD/MM/YYYY o MM/DD/YYYY u otro]
  - Totales/subtotales:  [¿hay cálculos en el archivo descargado?]
  - Pie de página:       [¿existe? ¿qué dice?]
  - Orientación:         [vertical/horizontal — para PDF]
  - Tamaño de página:    [A4/Letter/Legal — para PDF]
  - Número de hojas:     [para Excel, ¿cuántas hojas y con qué nombre?]

──────────────────────────────────────────────────
G. COMPORTAMIENTO DE IMPRESIÓN (si es botón de imprimir)
──────────────────────────────────────────────────
Método de impresión usado:
  [ ] window.print() nativo
  [ ] react-to-print / vue-print
  [ ] Librería específica: [nombre]
  [ ] Abre nueva ventana con contenido formateado
  [ ] Genera PDF primero, luego imprime

¿Tiene hoja de estilos de impresión (@media print)?
  Archivo CSS de impresión: [ruta]
  Elementos ocultos en impresión: [lista]
  Elementos visibles solo en impresión: [lista]

¿Qué área del DOM se imprime?
  ID/clase del contenedor: [#print-area / .printable-section / etc.]
  ¿Se crea un componente separado para impresión?: [SÍ/NO — si sí, ruta]

──────────────────────────────────────────────────
H. CONDICIONES DE VISIBILIDAD/HABILITACIÓN DEL BOTÓN
──────────────────────────────────────────────────
¿El botón siempre es visible?:    [SÍ / NO]
¿Depende de un rol de usuario?:   [SÍ — roles: admin/médico/enfermera / NO]
¿Depende de un estado de datos?:  [SÍ — ej: solo visible si hay resultados / NO]
¿Depende de permisos/permisos?:   [condición exacta en el código]
Código exacto de la condición:    [ej: {userData.role === 'admin' && <button...>}]

──────────────────────────────────────────────────
I. ERRORES Y MANEJO DE EXCEPCIONES
──────────────────────────────────────────────────
¿Tiene try/catch?:              [SÍ/NO]
¿Qué muestra cuando falla?:     [toast/alert/modal/console.error/nada]
¿Timeout configurado?:          [SÍ — X ms / NO]
¿Retry logic?:                  [SÍ/NO]
Mensajes de error exactos:      [copiar los strings de error literalmente]

──────────────────────────────────────────────────
J. CONTEXTO EN LA PANTALLA
──────────────────────────────────────────────────
¿Está dentro de una tabla?:     [SÍ — columna de acciones / NO]
¿Está en una barra de acciones?: [SÍ/NO]
¿Está en un modal/dialog?:      [SÍ/NO]
¿Hay más botones junto a este?: [SÍ — cuáles: Editar, Eliminar, Ver / NO]
¿El botón es por fila o global?: [por fila (exporta un registro) / global (exporta toda la lista)]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 FASE 2 — TABLA MAESTRA DE INVENTARIO

Después de completar todas las fichas, genera esta tabla resumen:

| # | Vista/Pantalla | Ruta URL | Tipo | Archivo | Línea | Formato Salida | Biblioteca | Estado en Refactorizado |
|---|---------------|----------|------|---------|-------|----------------|------------|------------------------|
| 1 | Lista Pacientes | /pacientes | Descarga | components/Pacientes/ListaPacientes.tsx | L.234 | Excel | xlsx | ❌ Faltante |
| 2 | Historia Clínica | /paciente/:id/historia | Descarga + Impresión | components/Historia/HistoriaClinica.tsx | L.89 | PDF | jsPDF | ⚠️ Parcial |
| 3 | Informe Mensual | /reportes/mensual | Descarga | pages/Reportes.tsx | L.156 | PDF+Excel | jsPDF+xlsx | ❌ Faltante |

---

## 🔬 FASE 3 — ANÁLISIS DE DEPENDENCIAS (package.json)

### PASO 3.1 — Extrae del monolito

```bash
# En el monolito:
cat package.json | grep -E "jspdf|xlsx|file-saver|html2pdf|html2canvas|pdfmake|exceljs|papaparse|jszip|print-js|react-to-print|vue3-print|@vueuse"
```

### PASO 3.2 — Verifica en el refactorizado

```bash
# En el refactorizado:
cat package.json | grep -E "jspdf|xlsx|file-saver|html2pdf|html2canvas|pdfmake|exceljs|papaparse|jszip|print-js|react-to-print|vue3-print|@vueuse"
```

### PASO 3.3 — Tabla de dependencias críticas

| Biblioteca | Versión Monolito | Versión Refactorizado | ¿Instalada? | Acción |
|-----------|-----------------|----------------------|-------------|--------|
| jspdf | ^2.5.1 | — | ❌ | `npm install jspdf@^2.5.1` |
| xlsx | ^0.18.5 | ^0.18.5 | ✅ | Nada |
| file-saver | ^2.0.5 | — | ❌ | `npm install file-saver` |

---

## 🔧 FASE 4 — PLAN DE TRANSPLANTE (por cada ficha)

Para cada botón documentado en la Fase 1, genera un plan de transplante:

```
TRANSPLANTE #[N]: [nombre descriptivo]
═══════════════════════════════════════════════════

ORIGEN (monolito):
  Archivo: [ruta]
  Líneas: [L.XX - L.YY]
  Función handler: [nombre]

DESTINO (refactorizado):
  Archivo componente: [ruta donde va el botón JSX/template]
  Archivo de lógica: [ruta donde va el handler — hook/service/composable]
  Archivo de tipos: [ruta donde van los tipos si son nuevos]
  Archivo de estilos: [ruta si hay CSS/SCSS específico]

CHECKLIST DE TRANSPLANTE:
  [ ] 1. Instalar dependencias faltantes (ver Fase 3)
  [ ] 2. Copiar el handler completo al archivo de lógica del refactorizado
  [ ] 3. Adaptar imports según las rutas del refactorizado
  [ ] 4. Copiar el JSX/template del botón al componente destino
  [ ] 5. Conectar el handler al botón (onClick/v-on:click)
  [ ] 6. Verificar que los datos necesarios están disponibles en el componente
  [ ] 7. Copiar estilos si son específicos del botón
  [ ] 8. Copiar condiciones de visibilidad
  [ ] 9. Copiar manejo de errores/toasts

ADAPTACIONES NECESARIAS (diferencias de arquitectura):
  [Lista específica de qué cambiar — ej: "cambiar useState por ref() de Vue",
   "cambiar import de '@/store' a '@/stores/useReportesStore'",
   "cambiar className por class (React→Vue)"]

VERIFICACIÓN POST-TRANSPLANTE:
  [ ] El botón se renderiza visualmente igual que en el monolito
  [ ] Al hacer click, la función se ejecuta sin errores en consola
  [ ] El archivo generado tiene el contenido correcto
  [ ] El nombre del archivo es correcto
  [ ] El estado loading funciona (si lo había)
  [ ] El estado error funciona (si lo había)
  [ ] La condición de visibilidad funciona (si la había)
  [ ] No se rompió nada que funcionaba antes
═══════════════════════════════════════════════════
```

---

## 🎨 FASE 5 — AUDITORÍA VISUAL ESPECÍFICA

Para cada botón encontrado, captura esta información visual con precisión:

### 5.1 Ficha Visual del Botón

```
FICHA VISUAL #[N]
─────────────────────────────────────────────
APARIENCIA EN EL MONOLITO:
┌─────────────────────────────────────┐
│  [Dibuja la apariencia del botón]   │
│  Ejemplo:  [↓] Descargar PDF        │
│  Color: #1976D2 (azul Material UI)  │
│  Icono: DownloadIcon 18px left      │
│  Padding: 8px 16px                  │
│  Border-radius: 4px                 │
│  Font: 14px medium                  │
└─────────────────────────────────────┘

CLASES/ESTILOS EXACTOS DEL MONOLITO:
  Clase principal:   [btn / MuiButton-root / v-btn / etc.]
  Variant:           [contained / outlined / text / flat]
  Color:             [primary / secondary / hex]
  Size:              [small / medium / large]
  Estilos adicionales: [copiar cualquier sx={} o style="" extra]

EQUIVALENTE EN EL REFACTORIZADO:
  ¿Qué componente de botón usa el refactorizado?: [Button de shadcn/PrimeVue/Vuetify/custom]
  ¿Cómo se mapea la variante del monolito?:
    monolito: variant="contained" color="primary"
    refactorizado: variant="default" className="bg-blue-600"
  
  Código del botón adaptado a la sintaxis del refactorizado:
  [escribir el JSX/template exacto como debe quedar en el refactorizado]
─────────────────────────────────────────────
```

---

## 🧪 FASE 6 — PROTOCOLO DE VERIFICACIÓN FINAL

Una vez transplantados TODOS los botones, ejecuta este protocolo:

### 6.1 Test funcional por cada botón transplantado

```
TEST FUNCIONAL: [nombre del botón]
════════════════════════════════════

ESCENARIO 1 — Caso feliz:
  Acción: [Navegar a /ruta, hacer click en el botón con datos cargados]
  Esperado: [Se descarga archivo_nombre.pdf de Xkb con campos A, B, C]
  Obtenido: [completar]
  ¿Pasa?: [✅ / ❌]

ESCENARIO 2 — Sin datos:
  Acción: [Hacer click cuando no hay datos cargados / lista vacía]
  Esperado: [Botón deshabilitado O mensaje de error "No hay datos para exportar"]
  Obtenido: [completar]
  ¿Pasa?: [✅ / ❌]

ESCENARIO 3 — Error de red (para botones que llaman API):
  Acción: [Desconectar red o mockear error 500, hacer click]
  Esperado: [Mensaje de error visible al usuario, loading se detiene]
  Obtenido: [completar]
  ¿Pasa?: [✅ / ❌]

ESCENARIO 4 — Permisos (si aplica):
  Acción: [Iniciar sesión con rol sin permisos, verificar que el botón no aparece]
  Esperado: [Botón invisible o deshabilitado]
  Obtenido: [completar]
  ¿Pasa?: [✅ / ❌]
════════════════════════════════════
```

### 6.2 Checklist maestro de cierre

```
CIERRE DE MIGRACIÓN — BOTONES DESCARGA/IMPRESIÓN
═════════════════════════════════════════════════

COBERTURA:
  [ ] Todos los botones del monolito están documentados (Fichas Fase 1)
  [ ] Todos los botones están en la Tabla Maestra (Fase 2)
  [ ] Todas las dependencias están instaladas en el refactorizado (Fase 3)
  [ ] Todos los transplantes están completados (Fase 4)
  [ ] Todos los estilos están adaptados (Fase 5)
  [ ] Todos los tests funcionales pasan (Fase 6.1)

CALIDAD:
  [ ] Cero errores en consola al usar cualquier botón
  [ ] Los archivos generados son idénticos en contenido al monolito
  [ ] Los nombres de archivo son idénticos al monolito
  [ ] Los estados visuales (loading/error) funcionan igual
  [ ] Las condiciones de visibilidad funcionan igual
  [ ] La funcionalidad de impresión produce el mismo resultado visual

INTEGRACIÓN:
  [ ] No se rompió ninguna funcionalidad previamente migrada
  [ ] Los botones aparecen en las vistas correctas
  [ ] La navegación hacia/desde esas vistas funciona
  [ ] El store/context que alimenta los datos funciona correctamente
═════════════════════════════════════════════════
```

---

## 🚨 ALERTAS ROJAS — Situaciones a reportar inmediatamente

Si durante el análisis encuentras alguna de estas situaciones, detenerte y reportarla antes de continuar:

1. **🔴 ALERTA SEGURIDAD:** Si algún botón descarga datos sensibles de pacientes sin verificar autenticación
2. **🔴 ALERTA DATOS:** Si la función de descarga llama a un endpoint que devuelve datos no paginados (podría descargar miles de registros sin límite)
3. **🔴 ALERTA RENDIMIENTO:** Si la función genera el PDF/Excel en el cliente con un dataset grande (>500 filas) sin worker/background processing
4. **🔴 ALERTA COMPATIBILIDAD:** Si las versiones de las bibliotecas del monolito son incompatibles con las dependencias del refactorizado
5. **🔴 ALERTA DUPLICACIÓN:** Si la misma funcionalidad de descarga aparece duplicada en múltiples componentes del monolito (debe centralizarse en el refactorizado)

---

## 💬 INSTRUCCIÓN FINAL PARA EL LLM

Cuando hayas completado las Fases 1 a 6:

1. Entrega el inventario completo de fichas (Fase 1)
2. Entrega la tabla maestra (Fase 2)
3. Entrega la lista de dependencias a instalar con los comandos exactos (Fase 3)
4. Para cada botón, entrega el código exacto **listo para copiar** al refactorizado, con todos los imports necesarios ya incluidos y adaptados a la arquitectura del refactorizado
5. Al final, declara el porcentaje de cobertura de esta funcionalidad: `[X de Y botones migrados = ZZ%]`

**NO entregues archivos incompletos. NO dejes placeholders como `// TODO` o `// aquí va el código`. Cada fragmento de código entregado debe estar 100% listo para pegar y funcionar.**

---

*Prompt generado para: Proyecto Ocupa Salud / SISO App*
*Funcionalidad: Botones Descargar e Imprimir*
*Tipo: Extracción forense y transplante quirúrgico*
*Versión: 1.0 — Julio 2026*
