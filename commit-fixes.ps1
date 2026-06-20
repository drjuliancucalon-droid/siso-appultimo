Set-Location "C:\Users\JQK3\Desktop\siso-appultimo"

if (Test-Path ".git\index.lock") {
    Remove-Item ".git\index.lock" -Force
    Write-Host "Lock eliminado." -ForegroundColor Yellow
}

git add -A

$msg = @'
fix: paridad funcional Platform A vs B BUG-A-01 a BUG-A-08

BUG-A-01 HC Ocupacional: handleChange y handleNameChange conectados al store Zustand.
Campos de Historia Clinica ahora aceptan texto correctamente.

BUG-A-02 Pacientes: fallback a siso_db_patients cuando D1/Supabase devuelven 0 items.
373 pacientes legacy ya visibles en el modulo.

BUG-A-03 Empresas: fallback a siso_companies_drcucalon y siso_companies.
35 empresas visibles en el modulo.

BUG-A-04 AgendaPage: prop appointments pasada a AgendaView y QueueManager.
CalendarioDeCitas muestra citas correctamente.

BUG-A-05 HistoriaPage: useParams implementado, HC precarga datos del paciente
por docNumero e id desde la ruta /hc/:id.

BUG-A-06 AI Config: aiStore Zustand persist activo, AIConfigPanel guarda y lee
keys de proveedor. Botones IA Gemini Groq Together AI OpenRouter operativos.

BUG-A-07 Dashboard: usa useBackendData misma fuente que modulos.
Contadores de pacientes y empresas ahora consistentes.

BUG-A-08 CORS Worker: isAllowedOrigin ahora acepta subdominios preview
siso-appultimo-arp.pages.dev. Login funciona en URLs de preview.

Ademas: refactor modular completo, modulos Propuestas Portafolio Portal Empresa,
SVE con programas DME PREC RESP DER PSICO RUI QUIM, reportes con analisis IA,
HC General, ARL, telemedicina, encuestas, SGSST, contabilidad V2,
Portal Certificados via D1, notificaciones EmailJS, firma digital medico,
sistema de planes, RIPS y FHIR.
'@

git commit -m $msg

git push origin main

Write-Host ""
Write-Host "LISTO. Cloudflare Pages redesplegara automaticamente." -ForegroundColor Green
Write-Host "URL produccion: https://siso-appultimo-arp.pages.dev" -ForegroundColor Cyan
