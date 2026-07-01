# 📦 ALMACENAMIENTO D1 — SISO OcupaSalud

## 🔗 Backend
- **Worker URL**: https://siso-api.dr-juliancucalon.workers.dev
- **Auth**: Header `X-Siso-Token`
- **DB**: Cloudflare D1 (SQLite)
- **Tabla**: `siso_store` (key-value)

---

## 📊 DIAGRAMA DE FLUJO DE DATOS

```
                           ┌─────────────────────────────┐
                           │     CLOUDFLARE WORKER D1     │
                           │  siso-api.workers.dev        │
                           │  Tabla: siso_store (KV)      │
                           └──────────────┬──────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
        ▼                                 ▼                                 ▼
┌───────────────┐              ┌────────────────────┐            ┌────────────────────┐
│   AGENDAR     │              │   CERRAR HC        │            │   OTROS MÓDULOS    │
│   PACIENTE    │              │ (HistoriaPage.jsx)  │            │                    │
│               │              │ handleCloseHC()     │            │                    │
└───────┬───────┘              └────────┬───────────┘            └────────┬───────────┘
        │                               │                                 │
        ▼                               ▼                                 ▼
siso_agendados              ┌───────────┼───────────┐           siso_cartas_custodia_
(agenda médica)             │           │           │           {userId}
                            ▼           ▼           ▼           siso_caja_movs_
                    ┌──────────┐ ┌──────────┐ ┌──────────────┐  {userId}
                    │PORTAL_DOC│ │PORTAL_   │ │PORTAL_EMP.   │  siso_saved_bills_
                    │_{cedula} │ │{codigo}  │ │ATENCIONES_{nit}  {userId}
                    └──────────┘ └──────────┘ └──────┬───────┘
                                                    │
                              ┌─────────────────────┤
                              ▼                     ▼
                    ┌──────────────────┐  ┌──────────────────────┐
                    │PORTAL_EMPRESA_   │  │PORTAL_EMPRESA_DOCS_  │
                    │{nit}             │  │{nit}                 │
                    │[documentos]      │  │[periodoDoc,          │
                    └──────────────────┘  │ codigoAcceso]        │
                                          └──────────────────────┘
```

---

## 🔑 CLAVES D1 — DETALLE COMPLETO

### Clave 1: `siso_hc_completa_{docNumero}`
| Campo | Descripción |
|-------|-------------|
| **Quién escribe** | `handleCloseHC()` en HistoriaPage.jsx |
| **Formato** | Objeto con 30+ campos (nombres, empresa, diagnósticos, _doctorData, _firma) |
| **Quién lee** | Portal empresa (búsqueda individual por código/cc) |
| **Propósito** | Vista detallada del certificado individual |

### Clave 2: `siso_portal_doc_{docNumero}`
| Campo | Descripción |
|-------|-------------|
| **Quién escribe** | `handleCloseHC()` |
| **Formato** | Objeto `portalData` (~25 campos: nombres, empresa, cargo, concepto, código, _doctorData) |
| **Quién lee** | Portal empresa (búsqueda por cédula) |
| **Propósito** | Certificado individual accesible por número de documento |

### Clave 3: `siso_portal_{codigoVerificacion}`
| Campo | Descripción |
|-------|-------------|
| **Quién escribe** | `handleCloseHC()` |
| **Formato** | Objeto `portalData` |
| **Quién lee** | Portal empresa (búsqueda por código de verificación) |
| **Propósito** | Certificado individual accesible por código CV-XXX o SISO-XXX |

### Clave 4: `siso_portal_empresa_atenciones_{nit}` ⭐ PRINCIPAL
| Campo | Descripción |
|-------|-------------|
| **Quién escribe** | `handleCloseHC()` — merge incremental por docNumero |
| **Formato** | Objeto: `{ atenciones: [...], _firma: "...", _doctorData: {...}, nombre: "...", nit: "..." }` |
| **Quién lee** | Portal empresa (tab certificados post-login) |
| **Propósito** | **Fuente principal** de datos para el portal empresa. Lista todos los trabajadores evaluados de esa empresa con su información de certificado. |

### Clave 5: `siso_portal_empresa_{nit}`
| Campo | Descripción |
|-------|-------------|
| **Quién escribe** | `handleCloseHC()` |
| **Formato** | Array de `[{id, docNumero, nombres, codigoVerificacion, ...}]` |
| **Quién lee** | Portal empresa (índice de documentos) |
| **Propósito** | Índice rápido de trabajadores por NIT |

### Clave 6: `siso_portal_empresa_docs_{nit}`
| Campo | Descripción |
|-------|-------------|
| **Quién escribe** | `handleCloseHC()` |
| **Formato** | Array de `[{periodo, docNumero, nombres, codigoVerificacion, tipoExamen, ...}]` |
| **Quién lee** | Portal empresa (validación de código de acceso + tab documentos) |
| **Propósito** | Documentos consolidados por período + código de acceso (`codigoAcceso`) |

---

## 🔐 CLAVES ADICIONALES (documentos del portal)

### `siso_saved_bills_{userId}`
| Campo | Descripción |
|-------|-------------|
| **Quién escribe** | Módulo de facturación |
| **Formato** | Array de cuentas de cobro |
| **Quién lee** | Portal empresa (tab DOCUMENTOS → Cuentas de cobro) |

### `siso_cartas_custodia_{userId}`
| Campo | Descripción |
|-------|-------------|
| **Quién escribe** | `CartaCustodiaPage.jsx` |
| **Formato** | Array de cartas emitidas |
| **Quién lee** | Portal empresa (tab DOCUMENTOS → Cartas de custodia) |

### `siso_caja_movs_{userId}`
| Campo | Descripción |
|-------|-------------|
| **Quién escribe** | `handleCloseHC()` — auto-billing |
| **Formato** | Array de movimientos de caja |
| **Quién lee** | Portal empresa (tab DOCUMENTOS → Cuentas, como complemento) |

---

## 🔄 FLUJO COMPLETO: Desde agendar hasta portal

### Fase 1: Creación del paciente
1. **Vía Agenda** → `handleSave` guarda en `siso_agendados`
2. **Vía HC directa** → `handleSave` en HistoriaPage guarda en `siso_patients_{userId}`
3. Ambos casos comparten el mismo estado `data` en `useClinicalStore`

### Fase 2: Cierre de HC
1. Médico llena la HC → click en "Cerrar HC"
2. `handleCloseHC()` ejecuta:
   - Valida concepto de aptitud
   - Genera código de verificación + hash SHA-256
   - Publica **6 claves D1** en paralelo
   - Auto-billing en `siso_caja_movs`
   - Sincroniza agenda

### Fase 3: Portal empresa
1. Empresa ingresa NIT + contraseña en `/portal-empresa`
2. `buscarEmpresa()`:
   - Valida código contra `siso_portal_empresa_docs_{nit}`
   - Carga atenciones desde `siso_portal_empresa_atenciones_{nit}`
   - Carga documentos desde `siso_saved_bills`, `siso_cartas_custodia`, `siso_portal_empresa_docs`

---

## ⚠️ NOTAS DE SEGURIDAD
- El Worker D1 requiere header `X-Siso-Token` para escrituras (no accesible desde el frontend público)
- Las claves `siso_portal_*` se leen desde el portal sin autenticación (solo código de acceso)
- El portal NUNCA expone diagnósticos confidenciales (Art. 16 Res. 1843/2025)
- Los códigos de acceso (`codigoAcceso`) se generan con formato `EMP-XXXX-XXXX`

---

*Última actualización: 1 de julio de 2026*