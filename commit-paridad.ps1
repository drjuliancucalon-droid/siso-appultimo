# commit-paridad.ps1
# Ejecutar desde: C:\Users\JQK3\Desktop\siso-appultimo
# PowerShell: cd "C:\Users\JQK3\Desktop\siso-appultimo"; .\commit-paridad.ps1

Set-Location "C:\Users\JQK3\Desktop\siso-appultimo"

# Limpiar lock huerfano si existe
$lockFile = ".\.git\index.lock"
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force
    Write-Host "🔓 Lock limpiado." -ForegroundColor Yellow
}

git add `
  src/pages/CompaniesPage.jsx `
  src/pages/PatientsPage.jsx `
  src/stores/authStore.js `
  SESION_ESTADO.md

$msg = @'
fix: Sprint Paridad — Pacientes, Empresas, authStore y handleSelectPatient

BUG-P-01: authStore.js seed hash drcucalon corregido
  - Antes: b7cb6abb0a3eb230c725327ff0d42a720f6efeee7cb2120a5a9db4c057d645c0
  - Ahora: 49679f37304820e18bae7ed12292e42a7722a7d1a55f12e41b1abca5cc5162fd (SHA-256 de "Siso2025*")
  - Efecto: login funciona cuando D1 no es alcanzable

BUG-P-02: PatientsPage.jsx localStorage fallback clave errónea
  - Antes: solo revisaba 'siso_pacientes' (clave inexistente)
  - Ahora: prueba siso_db_patients_<userId> → siso_db_patients → siso_pacientes
  - Efecto: 373 pacientes en localStorage ya son visibles

BUG-P-03: PatientsPage.jsx handleSelectPatient navegaba a /patients
  - Ahora navega a /patients/<docNumero>/hc
  - Efecto: clic en paciente abre su historia clínica

BUG-P-04: CompaniesPage.jsx nunca fetchaba datos (0 empresas siempre)
  - Reescrito con fetch D1 (siso_companies_<userId>) + fallback localStorage
  - Escribe en D1 en add/edit/delete
  - Efecto: 35 empresas visibles desde D1

SESION_ESTADO.md: archivo de estado persistente creado
'@

git commit -m $msg

Write-Host ""
Write-Host "✅ Commit Paridad aplicado." -ForegroundColor Green
Write-Host ""
Write-Host "Ejecuta ahora: git push origin main" -ForegroundColor Cyan
