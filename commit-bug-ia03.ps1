# commit-bug-ia03.ps1 — Commit BUG-IA-03 fixes (Config IA global) + build
# Run from PowerShell in the siso-appultimo directory

$repo = "C:\Users\JQK3\Desktop\siso-appultimo"
Set-Location $repo

# Remove stale git lock if present
$lock = "$repo\.git\index.lock"
if (Test-Path $lock) {
    Remove-Item $lock -Force
    Write-Host "Removed index.lock" -ForegroundColor Yellow
}

# Stage all changed files
git add src/stores/aiStore.js
git add src/stores/authStore.js
git add src/app/Layout.jsx
git add src/pages/HistoriaPage.jsx
git add src/pages/HistoriaGeneralPage.jsx
git add src/pages/DashboardPage.jsx
git add src/modules/ai/components/AIConfigPanel.jsx
git add src/modules/telemedicine/components/ProfesiogramaAI.jsx
git add AUDITORIA_IA_COMPLETA.md

# Commit using here-string to avoid PowerShell parsing issues with '-' in message
$msg = @"
fix(BUG-IA-03): Config IA global — dashboard card, header btn, single overlay, aiStore D1 sync

AIConfigPanel: pure content component (removed own fixed overlay)
Layout: global Config IA button in header accessible from all pages
DashboardPage: Config IA status card (proveedor activo + boton configurar)
HistoriaPage + HistoriaGeneralPage: single overlay fix (no double wrapper)
ProfesiogramaAI: migrado a useAIStore + callAIWithFailover (todos los proveedores)
authStore: removed dynamic import conflict (static import + try/catch)
aiStore: loadFromD1 / saveToD1 implementados
"@

git commit -m $msg

# Push
git push

Write-Host "`nDone. Check Cloudflare Pages for deploy." -ForegroundColor Green
