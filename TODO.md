# TODO.md - Portal de Certificados y Empresas
Estado: **FASES 1-3 COMPLETADAS** | Tests: **164/164 ✓**

## **FASE 4: TESTING MANUAL (EN PROCESO)** ⏳

### ✅ Tests Automatizados (npm test)
```
13/13 archivos ✓
164/164 tests ✓  
0 errores ✓
```
```
npm test → 100% VERDE ✓
```

### ⏳ F4.1 Backend Manual
```
curl http://localhost:3001/api/data/reports/by-nit/[NIT]
curl http://localhost:3001/api/data/bills/by-nit/[NIT]
curl http://localhost:3001/api/data/custodia/by-nit/[NIT]
```
```
[ ] Probar 8 nuevas rutas con datos reales
```

### ⏳ F4.2 Frontend + Integración
```
[ ] 1. Generar HC → Cerrar → Ver en portal
[ ] 2. Generar Informe IA → Guardar auto → Ver en portal
[ ] 3. Generar cuenta cobro → Ver en portal
[ ] 4. Generar carta custodia → Ver en portal
[ ] 5. NIT empresa → 4 tabs + descarga ZIP
```

## **FASE 5: DOCUMENTACIÓN + ENTREGA** ⏳

```
[ ] MANUAL_USO_PORTAL_EMPRESA.md → Guía usuario
[ ] Documentar nuevas APIs backend
[ ] git push → Sincronizar GitHub
[ ] Verificación final repositorios
[ ] attempt_completion final
```

## **VERIFICACIÓN MANUAL (Ejecutar ahora)**

```
cd siso-appultimo
npm run dev
→ localhost:5173/verificacion
→ NIT real → Portal Certificados
→ 4 tabs + descarga ✓
```

**Próximo paso automático: npm run dev + test manual**
