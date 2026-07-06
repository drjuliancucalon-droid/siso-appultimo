# Regla: Código SISO OcupaSalud Pro

## 📁 Estructura del Proyecto

```
src/
├── pages/           ← Páginas principales (ruteadas)
├── sections/        ← Secciones (componentes grandes)
├── modules/         ← Módulos por funcionalidad
│   ├── ai/          ← Inteligencia Artificial
│   ├── clinical/    ← Historia Clínica
│   ├── companies/   ← Empresas
│   └── reports/     ← Reportes y Estadísticas
├── components/      ← Componentes reutilizables
│   ├── forms/       ← Formularios
│   ├── panels/      ← Paneles (checklists, etc.)
│   └── modals/      ← Modales
├── hooks/           ← Custom hooks
├── lib/             ← Librerías internas
│   ├── d1Client.js  ← Cliente D1
│   ├── printService.js ← Servicio de impresión
│   └── apiClient.js ← Cliente API
├── shared/          ← Código compartido
│   ├── lib/         ← Utilidades (crypto, printUtils)
│   ├── data/        ← Datos (initialStates)
│   └── ui/          ← Componentes UI genéricos
├── stores/          ← Zustand stores
└── utils/           ← Utilidades
```

## 🎨 REGLAS DE ESTILO

### Imports
- Lucide icons: importar desde `lucide-react` SOLO los usados
- NO usar React.lazy() para tabs internos (imports estáticos)
- Agrupar imports: React → Stores → Hooks → Libs → Shared → Components → Icons

### JSX
- Usar template literals para HTML de impresión (NO JSX)
- Usar Tailwind para estilos de componentes
- Usar inline styles SOLO para impresión (printService.js)

### Funciones
- `useCallback` para handlers que se pasan como props
- `useMemo` para datos calculados costosos
- `_sanitize()` para TODOS los datos que van a HTML de impresión

## 🔒 SEGURIDAD

### Ley 527/1999 — Firmas digitales
- Toda HC cerrada debe tener `hashHC` (SHA-256)
- Toda HC cerrada debe tener `firmaDigital` con: hash, codigoQR, firmadoPor, fechaFirma
- `_firma` en portalData debe ser `activeSignature` (data URL base64)

### Confidencialidad (Res. 1843/2025 Art. 21)
- Restricciones: NO incluir diagnósticos en el texto
- Portal empresa: NO mostrar diagnósticos clínicos
- Impresión HC: NO incluir diagnósticos en el bloque de restricciones

### Protección de datos
- Contraseñas de portal: SHA-256 hash
- Códigos de verificación: generados con crypto random

## 📄 IMPRESIÓN

### Formato premium (monolito buildPrintHeader)
```html
<div style="display:flex; border-bottom:3px solid #059669; padding-bottom:10px;">
  <div style="width:32%;">  ← Médico (nombre, título, RM, ciudad)
  <div style="width:34%;">  ← Título central (HISTORIA CLÍNICA OCUPACIONAL)
  <div style="width:32%;">  ← Paciente (nombre, doc, empresa, cargo, edad)
</div>
```

### Secciones obligatorias en toda impresión HC
1. Header 3 columnas
2. Identificación
3. Información Laboral
4. Perfil del Cargo (Art. 29)
5. Factores de Riesgo
6. Antecedentes Ocupacionales
7. Antecedentes Personales
8. Estilos de Vida
9. Motivo de Consulta / Anamnesis
10. Signos Vitales y Antropometría
11. Examen Físico por Sistemas
12. Examen Físico Segmentario
13. Evaluación Osteomuscular
14. Revisión por Sistemas
15. Resultados Paraclínicos
16. Análisis Clínico
17. Diagnósticos (dxPrincipal, dxSecundario1, dxSecundario2)
18. Concepto de Aptitud
19. Restricciones Médico-Laborales
20. Recomendaciones
21. Programas SVE
22. Firmas (médico con imagen + paciente)