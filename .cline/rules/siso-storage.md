# Regla: Almacenamiento D1 para SISO OcupaSalud Pro

## 🗄️ CLAVES ESTÁNDAR D1

| Clave | Tipo | Propósito | Lectura por |
|-------|------|-----------|------------|
| `siso_patients_{userId}` | array | HC del médico | HistoriaPage, DashboardPage |
| `siso_portal_doc_{cedula}` | objeto | Certificado individual | PortalEmpresaPage (búsqueda por cédula) |
| `siso_portal_{codigo}` | objeto | Certificado por código verificación | PortalEmpresaPage (búsqueda por código) |
| `siso_portal_empresa_atenciones_{nit}` | array | Atenciones por empresa | PortalEmpresaPage (búsqueda por NIT) |
| `siso_portal_empresa_{nit}` | array | Registro empresa | PortalEmpresaPage |
| `siso_portal_empresa_docs_{nit}` | array | Documentos por empresa | PortalEmpresaPage, CompaniesSection |
| `siso_companies_{userId}` | array | Empresas | CompaniesSection |
| `siso_propuestas_{userId}` | array | Propuestas económicas | PropuestaEconomicaModal |
| `siso_saved_bills_{userId}` | array | Cuentas de cobro | PortalEmpresaPage |
| `siso_cartas_custodia_{userId}` | array | Cartas custodia | PortalEmpresaPage, AnalisisDocsTab |

---

## 🔴 REGLA ABSOLUTA DE ESCRITURA

TODA escritura a D1 DEBE seguir este patrón:

```
1. d1WriteArrayMerge / d1Set → D1 Worker (fuente de verdad)
2. localStorage.setItem → caché local (respaldo temporal)
3. NUNCA escribir solo en localStorage sin escribir en D1
```

### Ejemplo correcto:
```js
await d1WriteArrayMerge(`siso_propuestas_${userId}`, [propuesta], 'numero');
localStorage.setItem(`siso_propuestas_${userId}`, JSON.stringify(updated));
```

### Ejemplo INCORRECTO:
```js
// ❌ NUNCA hacer esto
localStorage.setItem('siso_propuestas', JSON.stringify(data));
// sin escribir en D1
```

---

## 🔴 REGLA: Al cerrar HC (handleCloseHC)

Al ejecutar `handleCloseHC()`, se deben publicar estas 6 claves:

| # | Clave | Método | Obligatorio |
|---|-------|--------|-------------|
| 1 | `siso_hc_completa_{docNumero}` | `d1Set` | ✅ |
| 2 | `siso_portal_doc_{cedula}` | `d1Set` | ✅ |
| 3 | `siso_portal_{codigoVerificacion}` | `d1Set` | ✅ |
| 4 | `siso_portal_empresa_atenciones_{portalKey}` | `d1Set` | ✅ SIEMPRE |
| 5 | `siso_portal_empresa_{nit}` | `d1WriteArrayMerge` | ✅ |
| 6 | `siso_portal_empresa_docs_{nit}` | `d1WriteArrayMerge` | ✅ |

**CRÍTICO**: Las claves 4-6 deben publicarse SIEMPRE, incluso si la empresa NO tiene NIT largo. Usar `portalCompanyKey` como fallback:
```js
const portalCompanyKey = nitClean && nitClean.length >= 3 ? nitClean : (company?.id || data.empresaId || 'particular');
```

**CRÍTICO**: `_firma` en `portalData` debe ser `activeSignature` (data URL base64 de la firma del médico):
```js
_firma: activeSignature || null
```

**CRÍTICO**: `empresaNombre` en `portalData` debe usar fallback de la empresa real:
```js
empresaNombre: data.empresaNombre || company?.nombre || 'PARTICULAR'
```

---

## 🔴 REGLA: Al crear empresa (CompaniesSection)

```js
// Guardar en D1 Worker inmediatamente
await d1Set(`siso_companies_${currentUser.user}`, upd);
```

---

## 🔴 REGLA: Al guardar propuesta económica (PropuestaEconomicaModal)

```js
await d1WriteArrayMerge(`siso_propuestas_${userId}`, [propuesta], 'numero');
// También publicar por NIT para portal empresa
const nitClean = (company?.nit || '').replace(/[^0-9]/g, '');
if (nitClean && nitClean.length >= 3) {
  await d1WriteArrayMerge(`siso_propuestas_${nitClean}`, [propuesta], 'numero');
}
```

---

## 📡 API del Worker — Endpoints

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| GET | `/store/:key` | Leer valor por clave |
| POST | `/store` | Escribir {key, value} |
| DELETE | `/store/:key` | Eliminar clave |

**Worker URL**: `https://siso-api.dr-juliancucalon.workers.dev`  
**Auth**: Header `X-Siso-Token`