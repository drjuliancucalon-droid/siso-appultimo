# Script: Validación Pre-Build SISO OcupaSalud Pro
# Verifica que no haya errores comunes antes del build

Write-Host "🔍 SISO Pre-Build Validation" -ForegroundColor Green

$errors = 0

# 1. Verificar encoding de archivos JSX críticos
Write-Host "📝 Verificando encoding UTF-8..." -ForegroundColor Cyan
$files = @(
    "src/pages/HistoriaPage.jsx",
    "src/pages/PortalEmpresaPage.jsx",
    "src/lib/printService.js",
    "src/lib/d1Client.js",
    "src/modules/ai/services/aiAnalysis.js"
)

foreach ($f in $files) {
    $content = Get-Content $f -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($content -match '\ufffd') {
        Write-Host "  ❌ $f tiene caracteres corruptos (U+FFFD)" -ForegroundColor Red
        $errors++
    } else {
        Write-Host "  ✅ $f" -ForegroundColor Green
    }
}

# 2. Verificar imports críticos
Write-Host "📦 Verificando imports..." -ForegroundColor Cyan
$checks = @(
    @{file="src/pages/HistoriaPage.jsx"; pattern="activeSignature"; label="activeSignature en HistoriaPage"},
    @{file="src/pages/HistoriaPage.jsx"; pattern="portalCompanyKey"; label="portalCompanyKey en handleCloseHC"},
    @{file="src/lib/printService.js"; pattern="generateHCPrintHTML"; label="generateHCPrintHTML exportado"},
    @{file="src/lib/d1Client.js"; pattern="d1WriteArrayMerge"; label="d1WriteArrayMerge exportado"}
)

foreach ($c in $checks) {
    $found = Select-String -Path $c.file -Pattern $c.pattern -Quiet
    if ($found) {
        Write-Host "  ✅ $($c.label)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($c.label) NO encontrado en $($c.file)" -ForegroundColor Red
        $errors++
    }
}

# 3. Verificar que siso-storage.md existe
Write-Host "📚 Verificando reglas Cline..." -ForegroundColor Cyan
if (Test-Path ".cline/rules/siso-storage.md") {
    Write-Host "  ✅ .cline/rules/siso-storage.md" -ForegroundColor Green
} else {
    Write-Host "  ❌ .cline/rules/siso-storage.md no encontrado" -ForegroundColor Red
    $errors++
}

Write-Host "`n📊 Resultado: $errors error(es) encontrado(s)" -ForegroundColor $(if ($errors -eq 0) { "Green" } else { "Red" })
exit $errors