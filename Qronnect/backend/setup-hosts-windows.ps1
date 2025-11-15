# ===================================
# Script: Configurar Hosts para Tenants
# Ejecutar como Administrador
# ===================================

# Verificar permisos de administrador
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host ""
    Write-Host "ERROR: Este script debe ejecutarse como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Como ejecutar como Administrador:" -ForegroundColor Yellow
    Write-Host "  1. Abre PowerShell como Administrador (click derecho - Ejecutar como administrador)" -ForegroundColor Cyan
    Write-Host "  2. Navega a la carpeta del proyecto:" -ForegroundColor Cyan
    Write-Host "     cd C:\Users\Omar\Documents\Qrs\Qronnect\backend" -ForegroundColor White
    Write-Host "  3. Ejecuta nuevamente:" -ForegroundColor Cyan
    Write-Host "     .\setup-hosts-windows.ps1" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit
}

Write-Host ""
Write-Host "CONFIGURADOR DE TENANTS LOCALES - Qronnect" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"

# Lista de todos los tenants
$tenants = @(
    # Tienda existente
    "lokeyokiera",

    # Belleza y Bienestar
    "stylecut",
    "urbancut",
    "bellaskin",
    "perfectnails",
    "aquarelax",
    "visionplus",

    # Foodie y Restauracion
    "elrincon",
    "dolcefrio",
    "laparrilla",
    "donnapoli",
    "burgerco",

    # Mascotas
    "huellafeliz",
    "doggystyle",
    "vetcare",

    # Infantil y Familia
    "mundopeques",
    "cuentosmas",
    "pequelook",

    # Salud y Deporte
    "fitzone",
    "fisioplus",
    "nutrishop"
)

Write-Host "Tenants a configurar: $($tenants.Count)" -ForegroundColor Cyan
Write-Host ""

# Hacer backup del archivo hosts
$backupPath = "$hostsPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Creando backup en: $backupPath" -ForegroundColor Yellow

try {
    Copy-Item -Path $hostsPath -Destination $backupPath -Force
    Write-Host "   OK - Backup creado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "   ADVERTENCIA: No se pudo crear el backup" -ForegroundColor Yellow
}

Write-Host ""

# Leer contenido actual
$hostsContent = Get-Content $hostsPath -Raw

# Verificar si ya existe la seccion
if ($hostsContent -match "# Qronnect - Tenants Locales") {
    Write-Host "ADVERTENCIA: La configuracion de Qronnect ya existe en el archivo hosts" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Deseas reemplazarla? (S/N)"

    if ($response -ne "S" -and $response -ne "s") {
        Write-Host ""
        Write-Host "Operacion cancelada" -ForegroundColor Red
        Write-Host ""
        exit
    }

    # Eliminar seccion existente
    Write-Host ""
    Write-Host "Eliminando configuracion anterior..." -ForegroundColor Yellow
    $hostsContent = $hostsContent -replace "(?ms)# ===================================\s*\r?\n# Qronnect - Tenants Locales.*?(?=\r?\n\r?\n[^#]|\z)", ""
    Set-Content -Path $hostsPath -Value $hostsContent -NoNewline
}

# Construir nuevas entradas
Write-Host ""
Write-Host "Agregando tenants al archivo hosts..." -ForegroundColor Cyan

$newEntries = "`r`n`r`n"
$newEntries += "# ===================================`r`n"
$newEntries += "# Qronnect - Tenants Locales`r`n"
$newEntries += "# Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm')`r`n"
$newEntries += "# Total: $($tenants.Count) tenants`r`n"
$newEntries += "# ===================================`r`n"
$newEntries += "`r`n"

# Agrupar por secciones
$newEntries += "# Tienda existente`r`n"
$newEntries += "127.0.0.1    lokeyokiera.localhost`r`n"
$newEntries += "`r`n"

$newEntries += "# Sector: Belleza y Bienestar`r`n"
foreach ($tenant in @("stylecut", "urbancut", "bellaskin", "perfectnails", "aquarelax", "visionplus")) {
    $newEntries += "127.0.0.1    $tenant.localhost`r`n"
}
$newEntries += "`r`n"

$newEntries += "# Sector: Foodie y Restauracion`r`n"
foreach ($tenant in @("elrincon", "dolcefrio", "laparrilla", "donnapoli", "burgerco")) {
    $newEntries += "127.0.0.1    $tenant.localhost`r`n"
}
$newEntries += "`r`n"

$newEntries += "# Sector: Mascotas`r`n"
foreach ($tenant in @("huellafeliz", "doggystyle", "vetcare")) {
    $newEntries += "127.0.0.1    $tenant.localhost`r`n"
}
$newEntries += "`r`n"

$newEntries += "# Sector: Infantil y Familia`r`n"
foreach ($tenant in @("mundopeques", "cuentosmas", "pequelook")) {
    $newEntries += "127.0.0.1    $tenant.localhost`r`n"
}
$newEntries += "`r`n"

$newEntries += "# Sector: Salud y Deporte`r`n"
foreach ($tenant in @("fitzone", "fisioplus", "nutrishop")) {
    $newEntries += "127.0.0.1    $tenant.localhost`r`n"
}

# Agregar al archivo hosts
try {
    Add-Content -Path $hostsPath -Value $newEntries -NoNewline
    Write-Host "   OK - Tenants agregados exitosamente" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "ERROR al modificar el archivo hosts: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Limpiando cache DNS..." -ForegroundColor Cyan

try {
    ipconfig /flushdns | Out-Null
    Write-Host "   OK - Cache DNS limpiado" -ForegroundColor Green
} catch {
    Write-Host "   ADVERTENCIA: No se pudo limpiar el cache DNS" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "CONFIGURACION COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resumen:" -ForegroundColor Cyan
Write-Host "   - Tenants configurados: $($tenants.Count)" -ForegroundColor White
Write-Host "   - Backup guardado en: $backupPath" -ForegroundColor White
Write-Host ""
Write-Host "Prueba tu configuracion:" -ForegroundColor Cyan
Write-Host "   1. Asegurate de que el backend este corriendo:" -ForegroundColor White
Write-Host "      cd backend" -ForegroundColor Gray
Write-Host "      npm run start:dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Abre tu navegador y visita:" -ForegroundColor White
Write-Host "      http://lokeyokiera.localhost:3001/api/config/branding" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Prueba otra tienda:" -ForegroundColor White
Write-Host "      http://stylecut.localhost:3001/api/config/branding" -ForegroundColor Gray
Write-Host ""
Write-Host "Lista de tenants disponibles:" -ForegroundColor Cyan
Write-Host ""

$grouped = @{
    "Belleza y Bienestar" = @("stylecut", "urbancut", "bellaskin", "perfectnails", "aquarelax", "visionplus")
    "Foodie y Restauracion" = @("elrincon", "dolcefrio", "laparrilla", "donnapoli", "burgerco")
    "Mascotas" = @("huellafeliz", "doggystyle", "vetcare")
    "Infantil y Familia" = @("mundopeques", "cuentosmas", "pequelook")
    "Salud y Deporte" = @("fitzone", "fisioplus", "nutrishop")
}

foreach ($sector in $grouped.Keys) {
    Write-Host "   - $sector" -ForegroundColor Yellow
    foreach ($tenant in $grouped[$sector]) {
        Write-Host "      * http://$tenant.localhost:3001" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "TIP: Si los dominios no funcionan, reinicia tu navegador completamente" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para deshacer: restaura el backup desde:" -ForegroundColor Yellow
Write-Host "   $backupPath" -ForegroundColor Gray
Write-Host ""

Read-Host "Presiona Enter para salir"
