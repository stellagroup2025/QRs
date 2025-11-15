# ========================================
# Script de Inicio Rápido - Qronnect
# ========================================
#
# Inicia automáticamente el Backend y Frontend
# en terminales separadas
#
# Uso: .\start.ps1
# ========================================

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   🚀 Iniciando Qronnect System" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
$currentPath = Get-Location
if ($currentPath.Path -notlike "*Qronnect") {
    Write-Host "⚠️  Por favor, ejecuta este script desde:" -ForegroundColor Yellow
    Write-Host "   C:\Users\Omar\Documents\Qronnect\" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Presiona cualquier tecla para salir..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Verificar que Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js NO está instalado" -ForegroundColor Red
    Write-Host "   Descarga desde: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Presiona cualquier tecla para salir..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Verificar que las dependencias del backend están instaladas
Write-Host ""
Write-Host "📦 Verificando Backend..." -ForegroundColor Cyan
if (!(Test-Path "backend\node_modules")) {
    Write-Host "⚠️  Backend: node_modules no encontrado" -ForegroundColor Yellow
    Write-Host "   Instalando dependencias..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Verificar que las dependencias del frontend están instaladas
Write-Host ""
Write-Host "📦 Verificando Frontend..." -ForegroundColor Cyan
if (!(Test-Path "QRs\node_modules")) {
    Write-Host "⚠️  Frontend: node_modules no encontrado" -ForegroundColor Yellow
    Write-Host "   Instalando dependencias..." -ForegroundColor Yellow
    Set-Location QRs
    npm install --legacy-peer-deps
    Set-Location ..
}

# Verificar que el .env existe en el backend
Write-Host ""
Write-Host "🔐 Verificando configuración..." -ForegroundColor Cyan
if (!(Test-Path "backend\.env")) {
    Write-Host "⚠️  Backend: .env no encontrado" -ForegroundColor Yellow
    Write-Host "   Copiando .env.example..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Debes configurar .env con tus credenciales de Supabase" -ForegroundColor Red
    Write-Host "   1. Abre: backend\.env" -ForegroundColor Yellow
    Write-Host "   2. Completa: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "¿Quieres abrir .env ahora? (S/N)" -ForegroundColor Cyan
    $response = Read-Host
    if ($response -eq "S" -or $response -eq "s") {
        notepad "backend\.env"
        Write-Host ""
        Write-Host "⏸️  Configura .env y presiona cualquier tecla para continuar..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   🎯 Iniciando Servicios" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar Backend en una nueva ventana de PowerShell
Write-Host "🔧 Iniciando Backend (NestJS)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList `
    "-NoExit", `
    "-Command", `
    "cd '$($currentPath.Path)\backend'; Write-Host '🔧 BACKEND - Qronnect API' -ForegroundColor Green; Write-Host ''; npm run start:dev"

# Esperar unos segundos para que el backend arranque
Write-Host "   Esperando a que el backend arranque..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Iniciar Frontend en otra ventana de PowerShell
Write-Host "🎨 Iniciando Frontend (Next.js)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList `
    "-NoExit", `
    "-Command", `
    "cd '$($currentPath.Path)\QRs'; Write-Host '🎨 FRONTEND - Qronnect App' -ForegroundColor Green; Write-Host ''; npm run dev"

# Mostrar información
Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "   ✅ Servicios Iniciados" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs Importantes:" -ForegroundColor Cyan
Write-Host "   Backend API:    " -NoNewline; Write-Host "http://localhost:3001/api" -ForegroundColor Yellow
Write-Host "   Swagger Docs:   " -NoNewline; Write-Host "http://localhost:3001/api/docs" -ForegroundColor Yellow
Write-Host "   Frontend App:   " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Notas:" -ForegroundColor Cyan
Write-Host "   • Dos ventanas de PowerShell se abrieron" -ForegroundColor Gray
Write-Host "   • Backend: Terminal con título 'BACKEND'" -ForegroundColor Gray
Write-Host "   • Frontend: Terminal con título 'FRONTEND'" -ForegroundColor Gray
Write-Host "   • Espera ~30 segundos a que arranquen" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Para detener:" -ForegroundColor Cyan
Write-Host "   • Presiona Ctrl+C en cada terminal" -ForegroundColor Gray
Write-Host "   • O cierra las ventanas" -ForegroundColor Gray
Write-Host ""

# Esperar un poco más y abrir el navegador
Write-Host "🌐 Abriendo navegador en 5 segundos..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Abrir URLs importantes en el navegador
Start-Process "http://localhost:3001/api"
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✅ ¡Todo listo! Revisa las ventanas abiertas." -ForegroundColor Green
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar esta ventana..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
