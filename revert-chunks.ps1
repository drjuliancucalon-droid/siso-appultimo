# revert-chunks.ps1 — Elimina el ultimo commit de d1Client chunks
Set-Location "C:\Users\JQK3\Desktop\siso-appultimo"

$lockFile = ".\.git\index.lock"
if (Test-Path $lockFile) { Remove-Item $lockFile -Force }

# Quitar el ultimo commit localmente (deja el archivo como estaba)
git reset --hard HEAD~1

# Forzar push para borrarlo del remoto tambien
git push --force origin main

Write-Host ""
Write-Host "OK — commit de chunks retirado." -ForegroundColor Green
git log --oneline -3
