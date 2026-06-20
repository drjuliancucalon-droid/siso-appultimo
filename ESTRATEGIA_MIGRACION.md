# ESTRATEGIA DE MIGRACIÓN: Strangler Fig Pattern
## De Monolito (48K líneas) a Aplicación Modular Escalable

**Fecha:** 13 Abril 2026  
**Problema:** Migración big-bang fracasó — los módulos no se conectan correctamente.  
**Solución:** Migración incremental con el monolito funcional como núcleo temporal.

---

## ¿Por qué falló el enfoque anterior?

1. El monolito tiene **120+ variables de estado** interconectadas en una sola función
2. Las páginas se referencian mutuamente (HC usa empresas, agenda usa pacientes, facturación usa HC)
3. Intentar extraer todo a la vez rompe las conexiones
4. Resultado: compila pero no funciona en runtime

## La Solución: Strangler Fig (Migración Incremental)

### Concepto
La higuera estranguladora crece alrededor de un árbol existente. No lo mata — lo reemplaza gradualmente mientras el árbol sigue vivo.

**Aplicado aquí:**
- El monolito App.jsx sigue funcionando como el "árbol"
- Cada módulo nuevo se construye POR FUERA y se conecta uno a la vez
- Cuando un módulo está probado y funcional, REEMPLAZA su sección del monolito
- Al final, el monolito desaparece naturalmente

### Arquitectura Propuesta

```
src/
├── App.jsx                    ← Monolito original (FUNCIONAL) 
│                                 Se va reduciendo gradualmente
├── modules/                   ← Módulos nuevos (se prueban independiente)
│   ├── sgsst/                 ← ✅ NUEVO (ya construido, 4857 líneas)
│   ├── shared/                ← ✅ Catálogos extraídos (ya existe)
│   └── [futuros módulos]      ← Se migran uno por uno
├── main.jsx                   ← Entry point
└── styles.css                 ← Estilos globales
```

### Fase 1: Base Funcional (INMEDIATA)
**Objetivo:** App que funcione EXACTAMENTE como el monolito + SG-SST nuevo
**Tiempo:** 1 sesión

1. Copiar App.jsx del monolito como base
2. Agregar lazy loading del módulo SG-SST
3. Agregar navegación al SG-SST desde el menú
4. Configurar code-splitting con React.lazy() para que SG-SST se cargue bajo demanda
5. Resultado: app funcional, rápida, con todo lo existente + SG-SST nuevo

```jsx
// Code splitting: SG-SST se carga SOLO cuando el usuario lo necesita
const SGSSTModule = React.lazy(() => import('./modules/sgsst/components/SSTDashboard'));

// En el renderCurrentView:
case "sgsst": return (
  <React.Suspense fallback={<div>Cargando SG-SST...</div>}>
    <SGSSTModule {...props} />
  </React.Suspense>
);
```

**Beneficio de performance:**
- El bundle principal tiene el monolito (lo que ya cargaba antes)
- SG-SST (~200KB) se carga SOLO cuando se necesita
- No afecta la carga inicial

### Fase 2: Code Splitting del Monolito (SEMANA 1-2)
**Objetivo:** Dividir el monolito en chunks que se cargan bajo demanda

Sin tocar la lógica, usar React.lazy() para las secciones grandes:

```jsx
// Cada sección pesada se carga bajo demanda
const Reporte = React.lazy(() => import('./sections/Reporte'));
const Users = React.lazy(() => import('./sections/Users'));
const Telemedicina = React.lazy(() => import('./sections/Telemedicina'));
```

Esto reduce el bundle inicial de 750KB a ~300KB.
Las secciones se cargan en 100-200ms cuando el usuario navega.

### Fase 3: Extraer Estado a Context (SEMANA 2-3)
**Objetivo:** Sacar los 120 useState del App.jsx a un Context Provider

```jsx
// AppContext.js — contiene TODO el estado
const AppContext = createContext();

export function AppProvider({ children }) {
  const [patientsList, setPatientsList] = useState([]);
  const [companies, setCompanies] = useState([]);
  // ... los 120 estados ...
  
  return (
    <AppContext.Provider value={{ patientsList, companies, ... }}>
      {children}
    </AppContext.Provider>
  );
}

// Cualquier componente accede al estado:
function MiComponente() {
  const { patientsList, companies } = useContext(AppContext);
}
```

**Beneficio:** Los componentes ya no necesitan recibir props del App.jsx.
Se pueden extraer a módulos independientes sin romper conexiones.

### Fase 4: Migrar Módulos uno por uno (SEMANA 3-8)
Con el Context en su lugar, migrar gradualmente:

1. **Semana 3:** Extraer módulo de Empresas (Companies)
2. **Semana 4:** Extraer módulo de Usuarios (Users)  
3. **Semana 5:** Extraer módulo de Facturación (Billing)
4. **Semana 6:** Extraer módulo de Reportes
5. **Semana 7:** Extraer módulo de Agenda + Telemedicina
6. **Semana 8:** Extraer módulo de HC (el más grande — al final)

Cada semana:
- Se extrae UN módulo
- Se prueba exhaustivamente
- Se despliega
- Si falla, se revierte al monolito (que sigue ahí)

### Fase 5: Eliminar el Monolito (SEMANA 8+)
Cuando todos los módulos están migrados y probados, el App.jsx original se borra.
Solo queda el AppProvider + módulos.

---

## Plan Inmediato (HOY)

**Lo que voy a hacer ahora:**

1. Tomar el App.jsx del monolito funcional
2. Agregarle React.lazy() para el módulo SG-SST
3. Agregar la navegación SG-SST al menú existente
4. Configurar code-splitting para performance
5. Build + test + push

**Resultado esperado:**
- ✅ Login premium (el del monolito)
- ✅ Dashboard funcional con datos reales
- ✅ HC Ocupacional y General completas
- ✅ Empresas, Usuarios, Facturación — todo funcional
- ✅ Supabase sync con tus datos existentes
- ✅ NUEVO: Módulo SG-SST accesible desde el menú
- ✅ Performance: SG-SST se carga bajo demanda

---

## Comparación de Estrategias

| Aspecto | Big Bang (falló) | Strangler Fig (propuesta) |
|---------|-----------------|--------------------------|
| Riesgo | 🔴 Alto — todo o nada | 🟢 Bajo — incremental |
| Funcionalidad | 🔴 Rota durante migración | 🟢 Siempre funcional |
| Tiempo total | 🟡 Más rápido en teoría | 🟢 Más seguro en práctica |
| Rollback | 🔴 Imposible | 🟢 Siempre posible |
| Datos existentes | 🔴 Pueden perderse | 🟢 Siempre accesibles |
| Performance | 🟡 Similar | 🟢 Mejor (code-splitting) |
| Escalabilidad | 🟢 Modular al final | 🟢 Modular al final |

El resultado final es el mismo: una app modular escalable.
La diferencia es que con Strangler Fig NUNCA tienes una app rota.
