# MAPA VISUAL DEL MONOLITO — Réplica exacta en DESTINO
## Extraído del App.jsx original (56K líneas)

## 1. PALETA DE COLORES PRINCIPAL

| Color | Clase Tailwind | HEX (verificado en CSS print) | Uso |
|-------|---------------|-------------------------------|-----|
| Verde esmeralda oscuro | `emerald-700` | `#047857` | Gradientes, headers, botones principales |
| Verde esmeralda medio | `emerald-600` | `#059669` | Botones, fondos activos, badges |
| Verde esmeralda claro | `emerald-50` | `#ecfdf5` | Fondos de sección, cards informativos |
| Verde esmeralda borde | `emerald-100` | `#d1fae5` | Bordes de cards |
| Teal medio | `teal-500` | `#14b8a6` | Gradientes (segundo color) |
| Teal claro | `teal-50` | `#f0fdfa` | Fondos secundarios |
| Fondo página | `gray-50` | `#f9fafb` | Fondo de todas las páginas |
| Borde navbar | `gray-100` | `#f3f4f6` | Borde inferior del navbar |
| Texto gris | `gray-500/600` | `#6b7280` / `#4b5563` | Textos secundarios |
| Texto oscuro | `gray-800/900` | `#1f2937` / `#111827` | Títulos, nombres |
| Fondo hover | `hover:bg-gray-100` | — | Hover de botones inactivos |
| Blanco | `white` | `#ffffff` | Navbar, cards, modales |

### Gradientes exactos del MONOLITO:
```jsx
// Login background
"bg-gradient-to-br from-emerald-50 via-white to-teal-50"

// Logo icon
"bg-gradient-to-tr from-emerald-700 to-teal-500"

// Dashboard welcome banner
"bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500"

// Botón login
"bg-gradient-to-r from-emerald-600 to-teal-500"

// Cards de acción rápida
"from-emerald-600 to-teal-500"
"from-teal-600 to-teal-500"
"from-indigo-600 to-violet-500"
"from-emerald-700 to-emerald-500"
"from-teal-700 to-teal-500"
"from-emerald-800 to-emerald-600"

// Modales/informativos
"bg-gradient-to-r from-purple-600 to-indigo-600"  // Modal empresas
"bg-gradient-to-r from-red-600 to-orange-500"      // Alertas
"bg-gradient-to-r from-teal-600 to-cyan-600"       // Encuestas
```

## 2. NAVBAR (renderNavbar — línea ~23528 del App.jsx)

```
<nav className="bg-white border-b border-gray-100 px-4 py-2.5 shadow-sm no-print sticky top-0 z-50 flex justify-between items-center">
```

### Lado IZQUIERDO:
```
[Logo App] → al hacer clic: goTo("dashboard")
  Logo: <Stethoscope className="w-3.5 h-3.5" /> + "SISO" text + "OCUPASALUD" text
  Clase logo: "h-10 w-10 bg-gradient-to-tr from-emerald-700 to-teal-500 rounded-xl"
```

### Lado CENTRO (botones de navegación, cuando view === "dashboard"):
```
__cls activo: "px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow"
__cls inactivo: "px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100"

Botones en orden:
  1. "Pacientes"     → goTo("patients")     → icono Users
  2. "Agenda"        → goTo("agenda")        → icono Calendar
  3. "Empresas"      → goTo("companies")     → icono Building2
  4. "Facturación"   → goTo("bill")          → icono DollarSign
  5. "Reportes"      → goTo("reporte")       → icono FileText
```

### Lado DERECHO:
```
[PlanBadge] — muestra plan actual (ej: "🏢 Clínica")
[ConnectionBadge] — estado de conexión (ConnectionBadge del connectionStatus.jsx)
[UserMenu] — nombre del usuario + menú desplegable
  - "Dr. Nombre" → texto
  - Icono LogOut → goTo("login")
```

### Botones EXTRA visibles solo en vista específica (view === "dashboard"):
```
"Habeas Data"   → goTo("habeasdata")
"Custodia"      → goTo("custodia")
"Telemedicina"  → goTo("telemedicina")
"Planes"        → goTo("planes")
```

## 3. DASHBOARD (renderDashboard — línea ~24359)

```
<div className="min-h-screen bg-gray-50 font-sans">
  {renderNavbar()}
  <div className="max-w-6xl mx-auto p-8">
```

### Sección 1: Banner de bienvenida
```
<div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
  - Icono Stethoscope + "OcupaSalud Pro"
  - "Bienvenido, Dr. Nombre"
  - Fecha actual en español
  - RM: [licencia]
  - Plan: 🏢 Clínica · máx 9999 HC
```

### Sección 2: Acceso Rápido (GRID 3 columnas en desktop)
```
Botones con gradiente y sombra:
1. "Nuevo Paciente"     → goTo("patients")     → icono UserPlus     → gradiente emerald-600/teal-500
2. "Nueva HC"           → goTo("historia")      → icono FileText     → gradiente emerald-700/teal-500
3. "Agenda"             → goTo("agenda")        → icono Calendar     → gradiente indigo-600/violet-500
4. "Empresas"           → goTo("companies")     → icono Building2    → gradiente emerald-700/emerald-500
5. "Facturación"        → goTo("bill")          → icono DollarSign   → gradiente teal-700/teal-500
6. "Reportes"           → goTo("reporte")       → icono BarChart3    → gradiente emerald-800/emerald-600
```

### Sección 3: Módulos Especializados (GRID 4 columnas)
```
"Portal Trabajador" → icono User     → azul
"SVE"               → icono Activity → teal (con plan gate)
"Telemedicina"      → icono Video    → indigo (con plan gate)
"ARL"               → icono Shield   → red (con plan gate)
"Portal Empresa"    → icono Building2 → emerald
```

### Sección 4: Estadísticas (GRID 4 columnas)
```
4 tarjetas con:
- Icono en círculo con fondo de color
- Número grande (font-black text-2xl)
- Label debajo
- "TrendingUp" icon decorativo

Cards:
1. Patients (Users icon, emerald) — "Pacientes atendidos" — valor + "Este mes"
2. Companies (Building2 icon, teal) — "Empresas registradas" — valor
3. Appointments (Calendar icon, indigo) — "Citas hoy" — valor
4. HC (Activity icon, emerald) — "HC Generadas" — valor
```

### Sección 5: KPIs Adicionales (GRID 4 columnas)
```
1. HC Cerradas (FileCheck, green) 
2. HC Abiertas (FileText, amber)
3. Médicos activos (Stethoscope, blue)
4. Convenios por vencer (Shield, red si >0)
```

### Sección 6: Alertas del Sistema
```
<div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
  "📋 X historia(s) clínica(s) sin cerrar"
  Solo visible si hay HC abiertas
```

### Sección 7: Últimos Pacientes Atendidos (tabla)
```
Tabla con columnas: Paciente | Empresa | Tipo | Fecha | Concepto
Máximo 5 filas
"Ver todos" → goTo("patients")
```

### Sección 8: Citas de Hoy (lista)
```
Lista con hora, paciente, empresa
Máximo 5 items
```

### Sección 9: Productividad Médica (tabla)
```
Tabla: Médico | Atenciones | HC Cerradas | HC Abiertas | % Participación
1 fila por médico
```

## 4. LOGIN (pantalla completa — línea ~36249)

### Fondo
```
<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
```

### Card Login
```
<div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-md">

Elementos en orden:
1. Logo OcupaSalud (Stethoscope + "SISO" + "OCUPASALUD")
2. Línea decorativa: "h-0.5 w-12 bg-gradient-to-r from-emerald-500 to-teal-400 mx-auto my-2 rounded-full"
3. Subtítulo: "Sistema Integral de Salud Ocupacional"
4. "Iniciar Sesión" título
5. Input usuario
6. Input contraseña (con toggle show/hide)
7. Botón "Iniciar Sesión" — gradiente emerald-600 to teal-500
8. Badge intentos fallidos
9. Footer: "SISO OcupaSalud Pro v2.0 — Res. 1843/2025 · Decreto 1072/2015"
```

## 5. DISPOSICIÓN GENERAL DE MÓDULOS (menú izquierdo)

El MONOLITO **NO tiene sidebar/menú lateral**. Todo se maneja con:
- **Navbar superior** con botones de navegación
- **Dashboard** como centro de comando con tarjetas de acceso rápido
- Cada vista se renderiza full-page (sin sidebar persistente)

## 6. DIFERENCIAS CON EL DESTINO (a corregir)

| Elemento | MONOLITO | DESTINO | Acción requerida |
|----------|----------|---------|-----------------|
| **Layout** | Sin sidebar, solo navbar superior | `Layout.jsx` tiene sidebar + header | ❌ Cambiar a navbar superior como MONOLITO |
| **Navbar** | Sticky top, bg-white, border-b gray-100 | Layout actual tiene sidebar | ❌ Recrear navbar exacto |
| **Dashboard banner** | 6 acciones rápidas + 4 especializadas | ✅ Similar pero verificar colores | 🟡 Ajustar colores |
| **Login** | Fondo emerald-50/white/teal-50 | ✅ Similar | ✅ Ya coincide |
| **Logo** | Stethoscope, emerald-700 to teal-500 | ✅ Idéntico | ✅ Coincide |
| **Colores** | emerald-600/700 primario, teal-500 secundario | ✅ Coincide | 🟡 Verificar consistencia |
| **Navbar botones** | 5 botones fijos + extras condicionales | Layout tiene sidebar en vez de navbar | ❌ Cambiar estructura |
| **Cards dashboard** | 4 stats + 4 KPIs separados | ✅ Tiene 4+4 | ✅ Coincide |
| **Acciones rápidas** | 6 botones en grid 3 columnas | ✅ 6 botones | ✅ Coincide |
| **Connection badge** | En navbar derecha | No integrado | ❌ Agregar |
| **Plan badge** | En navbar derecha | En banner dashboard | 🟡 Mover a navbar |

## 7. PLAN DE CAMBIOS (solo UI, NO lógica)

### Cambio 1: Layout.jsx → Convertir de sidebar a navbar superior
- Eliminar sidebar lateral
- Crear navbar horizontal sticky con logo izquierda, botones centro, usuario derecha
- El contenido principal ocupa 100% ancho

### Cambio 2: DashboardPage.jsx → Ajustar colores y disposición
- Verificar que los gradientes coincidan exactamente
- Ajustar grid columns si es necesario

### Cambio 3: Agregar ConnectionBadge en navbar
- Importar ConnectionBadge de shared/lib/connectionStatus.jsx
- Posición: lado derecho del navbar, junto al nombre de usuario

### Cambio 4: LoginPage.jsx
- Ya coincide casi exactamente con el MONOLITO (verificado en ANALISIS_MONOLITO.md)
- Cambios menores solo si hay diferencia de colores

## 8. CONCLUSIÓN DEL ANÁLISIS

El cambio MÁS IMPORTANTE es:
**Eliminar el Layout con sidebar y reemplazarlo por un navbar superior estilo MONOLITO.**

Esto afecta a `src/app/Layout.jsx`, que actualmente tiene una estructura sidebar+header. El MONOLITO no tiene sidebar — solo navbar sticky superior con botones de navegación.

Los cambios son exclusivamente de presentación (CSS y estructura HTML). NO se toca:
- Lógica de negocio en stores, hooks, services
- Rutas de React Router en App.jsx
- Componentes de módulos (Companies, Users, Historia, etc.)
- Funcionalidad de login, dashboard stats, etc.

¿Procedo con la implementación de estos cambios visuales?