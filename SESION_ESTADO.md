# SESION_ESTADO.md — Estado Persistente del Proyecto SISO

> Última actualización: 2026-06-20
> Plataforma A: `siso-appultimo-arp.pages.dev` | Repo: `C:\Users\JQK3\Desktop\siso-appultimo`
> Plataforma B (referencia): monolito `ocupasaludparadesplegar`

---

## 🔐 SEGURIDAD — REGLAS PERMANENTES

- ❌ No exponer VITE_WORKER_TOKEN en ningún log, informe ni output
- ❌ No cambiar CF_API_TOKEN ni otros secrets salvo estricta necesidad
- ❌ No cambiar claves D1 ni nombres de rutas
- ❌ No mezclar cambios de dominio/infra con otros sprints funcionales
- ⚠️ Si VITE_WORKER_TOKEN no existe en env, detener y pedir al usuario

---

## 🏗️ ARQUITECTURA

| Concepto | Valor |
|---|---|
| Worker URL | `https://siso-api.dr-juliancucalon.workers.dev` |
| Auth header | `X-Siso-Token: <VITE_WORKER_TOKEN>` |
| D1 client | `src/lib/d1Client.js` — `d1Get`, `d1Set`, `d1WriteArrayMerge` |
| Chunk threshold | 500KB |
| Zustand persist key | `siso-auth` |
| SHA-256("Siso2025*") | `49679f37304820e18bae7ed12292e42a7722a7d1a55f12e41b1abca5cc5162fd` |

### Convención de claves D1
- Pacientes: `siso_db_patients_<userId>` (ej. `siso_db_patients_drcucalon`)
- Empresas: `siso_companies_<userId>`
- Usuarios: `siso_users`
- Atenciones: `siso_atenciones_cerradas_<userId>`
- Facturas: `siso_saved_bills_<userId>`

---

## 🐛 BUGS ENCONTRADOS Y ESTADO

### ✅ RESUELTOS

| Bug | Archivo | Fix |
|---|---|---|
| Login seed hash incorrecto | `authStore.js` L36 | Hash cambiado a `49679f37...` |
| PatientsPage localStorage fallback clave errónea (`siso_pacientes`) | `PatientsPage.jsx` L36 | Cadena fallback multi-clave: `siso_db_patients_${userId}` → `siso_db_patients` → `siso_pacientes` |
| PatientsPage `handleSelectPatient` navega a `/patients` en vez del HC | `PatientsPage.jsx` L67 | Ruta corregida a `/patients/${docNumero}/hc` |
| CompaniesPage no fetcha datos (0 empresas siempre) | `CompaniesPage.jsx` | Reescrito con hook D1 + localStorage fallback |
| D1 hash drcucalon incorrecto en `siso_users` | D1 remoto | Actualizado vía POST directo al worker en sesión anterior |

### 🔴 PENDIENTES

| Bug | Síntoma | Causa | Archivo |
|---|---|---|---|
| Caja muestra $0 | `siso_atenciones_cerradas` vacío | Auto-registro al cerrar HC puede no estar disparando `d1WriteArrayMerge` | `HistoriaPage.jsx` |
| Reportes sin datos | 0 gráficas | Downstream de bug Pacientes (ya resuelto) — verificar tras deploy |
| D1 `siso_db_patients_drcucalon` vacío | 373 pacientes en localStorage sin migrar | Migración chunked pendiente | — |

---

## 📦 ESTADO DE DATOS D1

| Clave D1 | Entradas | Observación |
|---|---|---|
| `siso_users` | 1+ | Hash drcucalon correcto tras fix sesión anterior |
| `siso_db_patients_drcucalon` | 0 | 373 pacientes en `localStorage.siso_db_patients` sin migrar |
| `siso_companies_drcucalon` | 35 | Disponible — CompaniesPage ahora lo lee |
| `siso_companies` (legacy) | 34 | localStorage fallback |
| `siso_atenciones_cerradas` | 0 | Pendiente investigar |
| `siso_saved_bills_drcucalon` | ? | Facturas existen pero Caja usa otra fuente |

---

## 🚀 SPRINTS

### Sprint A+C+D — ✅ COMPROMETIDO (pendiente push)
- A1: `useClinicalRecord.js` — initNewRecord() con 30+ campos
- A2: `printUtils.js` — QR real en certificado
- A3: `initialStates.js` — 29 sistemas (Res.1843/2025)
- A3: `catalogs.js` — NORMAL_DESCRIPTIONS_SYSTEMS 29 entradas
- A4: `recomendaciones.js` — 4 nuevas categorías
- C4: `CartaCustodiaPage.jsx` — migrado a d1WriteArrayMerge
- D1: `HistoriaPage.jsx` — botón WhatsApp

### Sprint de Paridad (esta sesión) — fixes críticos
- Fix CompaniesPage.jsx — D1 fetch + localStorage fallback
- Fix authStore.js seed hash
- Fix PatientsPage localStorage fallback clave
- Fix PatientsPage handleSelectPatient ruta HC

### Sprint B (#37) — 🔴 PENDIENTE
- Encuestas — expansión

---

## 📋 TAREAS PENDIENTES PRIORITARIAS

1. **git push origin main** — disparar deploy Cloudflare (Sprint A+C+D + fixes de paridad)
2. **Migrar 373 pacientes a D1** — `localStorage.siso_db_patients` (4MB) → `siso_db_patients_drcucalon` (chunked)
3. **Verificar Caja** — investigar por qué `siso_atenciones_cerradas` está vacío
4. **Verificar Reportes** tras deploy (downstream de fix Pacientes)
5. **Sprint B** — Encuestas (#37)

---

## 🔑 CREDENCIALES DE PRUEBA

- Usuario: `drcucalon`
- Contraseña: `Siso2025*`
- URL Plataforma A: `https://siso-appultimo-arp.pages.dev`

---

## 📁 ARCHIVOS CRÍTICOS

```
src/stores/authStore.js          — auth, seed users, D1 sync
src/lib/d1Client.js              — d1Get, d1Set, d1WriteArrayMerge
src/pages/PatientsPage.jsx       — lista pacientes + D1 fetch
src/pages/CompaniesPage.jsx      — lista empresas + D1 fetch ← reescrito
src/modules/clinical/hooks/useClinicalRecord.js
src/pages/HistoriaPage.jsx       — HC completo + QR + WhatsApp
src/pages/CartaCustodiaPage.jsx  — carta custodia → D1
src/shared/data/catalogs.js      — sistemas físico, descriptores normales
src/shared/data/initialStates.js — estados iniciales HC
src/shared/data/recomendaciones.js — catálogo recomendaciones
src/shared/lib/crypto.js         — _sha256
src/shared/lib/printUtils.js     — QR, impresión
```
