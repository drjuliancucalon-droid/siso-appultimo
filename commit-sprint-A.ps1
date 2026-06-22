# commit-sprint-A.ps1
# Ejecutar desde: C:\Users\JQK3\Desktop\siso-appultimo
# PowerShell: cd "C:\Users\JQK3\Desktop\siso-appultimo"; .\commit-sprint-A.ps1

Set-Location "C:\Users\JQK3\Desktop\siso-appultimo"

git add `
  src/modules/clinical/hooks/useClinicalRecord.js `
  src/pages/CartaCustodiaPage.jsx `
  src/pages/HistoriaPage.jsx `
  src/shared/data/catalogs.js `
  src/shared/data/initialStates.js `
  src/shared/data/recomendaciones.js `
  src/shared/lib/printUtils.js `
  package.json `
  package-lock.json

$msg = @'
feat: Sprint A+C+D — paridad funcional completa

A1: useClinicalRecord.js — initNewRecord() spread completo 30+ campos paciente
A2: printUtils.js — QR real en certificado (qrcode@1.5.4, _generarQRDataUrl)
    HistoriaPage.jsx — handleEnviar async con QR + import MessageCircle
A3: initialStates.js — examenFisicoSistemas expandido a 29 sistemas (Res.1843/2025)
    catalogs.js — NORMAL_DESCRIPTIONS_SYSTEMS 29 entradas + retrocompatibilidad
A4: recomendaciones.js — 4 nuevas categorias: cardiovascular, respiratorio, visual, capacitacion
C4: CartaCustodiaPage.jsx — migrar handleSave() de Supabase a d1WriteArrayMerge (constraint #7)
D1: HistoriaPage.jsx — boton WhatsApp wa.me al paciente con codigo verificacion
D2: Auto-registro en caja al cerrar HC (ya implementado, verificado activo)

Build: 1817 modulos sin errores — npm run build OK
'@

git commit -m $msg

Write-Host ""
Write-Host "✅ Commit Sprint A+C+D aplicado." -ForegroundColor Green
Write-Host "Ejecuta: git push origin main" -ForegroundColor Cyan
