# commit-chunks.ps1
Set-Location "C:\Users\JQK3\Desktop\siso-appultimo"

$lockFile = ".\.git\index.lock"
if (Test-Path $lockFile) { Remove-Item $lockFile -Force; Write-Host "Lock limpiado." }

git add src/lib/d1Client.js

$msg = @'
fix: d1Get soporta formato chunked del monolito (key__meta + key__cN)

El monolito guarda arrays >500KB en D1 usando:
  - key__meta  -> {chunked: true, count: N}
  - key__c0..key__cN -> fragmentos JSON string

d1Client.js solo conocia el formato Platform A (key_chunk_N_of_TOTAL).
Resultado: siso_patients_drcucalon leia null, ignoraba los 9 chunks -> 0 pacientes.

Fix: _chunkGet() intenta primero formato Platform A; si la clave
principal esta vacia, busca key__meta y reconstruye desde key__c0..cN.
Compatible con ambos formatos. Sin escritura a D1.
'@

git commit -m $msg
git push origin main

Write-Host ""
Write-Host "OK — push completado." -ForegroundColor Green
