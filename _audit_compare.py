#!/usr/bin/env python
"""Auditoria forense: Compara archivos entre MONOLITO y DESTINO"""
import os
from pathlib import Path

MONOLITO = Path(r"C:\Users\JQK3\ocupasaludparadesplegar\src")
DESTINO = Path(r"C:\Users\JQK3\siso-appultimo\src")

def collect_files(base):
    result = {}
    for f in base.rglob("*"):
        if f.is_file() and f.suffix in ('.js', '.jsx', '.css'):
            # Store all paths for this filename
            try:
                rel = f.relative_to(base)
            except:
                continue
            result[f.name] = result.get(f.name, []) + [str(rel)]
    return result

print("=" * 70)
print("AUDITORIA FORENSE: MONOLITO vs DESTINO")
print("=" * 70)

mono = collect_files(MONOLITO)
dest = collect_files(DESTINO)

# Files in MONOLITO not found in DESTINO
missing = {}
for name, paths in sorted(mono.items()):
    if name not in dest:
        missing[name] = paths

print("\n--- ARCHIVOS DEL MONOLITO FALTANTES EN DESTINO: %d ---" % len(missing))
for name, paths in sorted(missing.items()):
    print("  [FALTA] %s" % name)
    for p in paths[:1]:
        print("          src/%s" % p)

# New files in DESTINO not in MONOLITO
new_files = {}
for name, paths in sorted(dest.items()):
    if name not in mono:
        new_files[name] = paths

print("\n--- ARCHIVOS NUEVOS EN DESTINO (no en MONOLITO): %d ---" % len(new_files))
for name, paths in sorted(new_files.items()):
    print("  [NUEVO] %s -> %s" % (name, paths[0]))

# Critical functions audit
print("\n--- AUDITORIA DE FUNCIONES CRITICAS ---")

checks = [
    ("App.jsx", "App principal"),
    ("Companies.jsx", "Gestion de empresas"),
    ("Users.jsx", "Gestion de usuarios"),
    ("Agenda.jsx", "Agenda de citas"),
    ("Bill.jsx", "Facturacion"),
    ("Historia.jsx", "Historia clinica"),
    ("Dashboard.jsx", "Dashboard"),
    ("Reporte.jsx", "Reportes"),
    ("Planes.jsx", "Planes/licencias"),
    ("Caja.jsx", "Modulo de caja"),
    ("PortalCertificadosEmpresa.jsx", "Portal certificados"),
    ("CartaCustodia.jsx", "Carta custodia (componente)"),
    ("CartaCustodia.jsx", "Carta custodia (page)"),
    ("ContabilidadV2.jsx", "Contabilidad"),
    ("AnalisisDocsEmpresas.jsx", "Analisis docs empresas"),
    ("useAppState.js", "Hook estado global (120+ useState)"),
    ("useCompanyDocuments.js", "Hook documentos empresa"),
    ("connectionStatus.jsx", "Estado de conexion"),
    ("offlineDB.js", "Base de datos offline"),
    ("syncManager.js", "Gestor de sincronizacion"),
    ("normativa.js", "Normativa legal"),
    ("catalogos.js", "Catalogos de datos"),
    ("cie10.jsx", "CIE-10"),
    ("cie11.js", "CIE-11"),
    ("medicamentos.js", "Medicamentos"),
    ("planConfig.js", "Configuracion de planes"),
    ("aiProviders.js", "Proveedores IA"),
    ("bulkDownload.js", "Descarga masiva"),
    ("doctorHelpers.js", "Helpers de medicos"),
    ("formatters.js", "Formateadores"),
    ("hashHelpers.js", "Helpers de hash"),
    ("security.js", "Seguridad"),
    ("storage.js", "Almacenamiento"),
    ("supabase.js", "Supabase client"),
    ("totp.js", "TOTP 2FA"),
]

for fname, desc in checks:
    in_m = fname in mono
    in_d = fname in dest
    if in_m and in_d:
        status = "OK"
    elif in_m and not in_d:
        status = "FALTA"
    elif not in_m and in_d:
        status = "NUEVO"
    else:
        status = "N/A"
    print("  [%s] %s - %s" % (status.ljust(5), desc, fname))
    if in_d:
        print("         -> %s" % "; ".join(dest[fname][:2]))
    elif in_m:
        print("         <- src/%s" % mono[fname][0])

print("\n" + "=" * 70)
print("RESUMEN FINAL")
print("=" * 70)
print("  Archivos en MONOLITO:  %d" % len(mono))
print("  Archivos en DESTINO:   %d" % len(dest))
print("  Faltantes en DESTINO:  %d" % len(missing))
print("  Nuevos en DESTINO:     %d" % len(new_files))