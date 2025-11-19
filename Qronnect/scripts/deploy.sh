#!/bin/bash

# Script de deployment automatizado para Qronnect
# Fecha: 19 de Noviembre de 2025

set -e  # Exit on error

echo "🚀 Iniciando deployment de Qronnect..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funciones de utilidad
error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "ℹ️  $1"
}

# Verificar que estamos en el root del proyecto
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    error "Debes ejecutar este script desde la raíz del proyecto"
fi

# Menú principal
echo "Selecciona qué quieres deployar:"
echo "1) Backend (Railway)"
echo "2) Frontend (Vercel)"
echo "3) Ambos"
echo "4) Solo build local (test)"
read -p "Opción (1-4): " OPTION

case $OPTION in
    1)
        DEPLOY_BACKEND=true
        DEPLOY_FRONTEND=false
        ;;
    2)
        DEPLOY_BACKEND=false
        DEPLOY_FRONTEND=true
        ;;
    3)
        DEPLOY_BACKEND=true
        DEPLOY_FRONTEND=true
        ;;
    4)
        DEPLOY_BACKEND=false
        DEPLOY_FRONTEND=false
        BUILD_ONLY=true
        ;;
    *)
        error "Opción inválida"
        ;;
esac

# ========================================
# Backend Deployment
# ========================================
if [ "$DEPLOY_BACKEND" = true ]; then
    echo ""
    info "Preparando backend..."

    cd backend

    # Verificar que node_modules existe
    if [ ! -d "node_modules" ]; then
        info "Instalando dependencias del backend..."
        npm install || error "Falló la instalación de dependencias"
    fi

    # Build
    info "Compilando backend..."
    npm run build || error "Falló la compilación del backend"
    success "Backend compilado correctamente"

    # Verificar que Railway CLI está instalado
    if ! command -v railway &> /dev/null; then
        warning "Railway CLI no está instalado"
        info "Instalar con: npm install -g @railway/cli"
        read -p "¿Continuar sin deploy? (y/n): " CONTINUE
        if [ "$CONTINUE" != "y" ]; then
            exit 0
        fi
    else
        # Deploy a Railway
        info "Deploying a Railway..."
        railway up || error "Falló el deployment a Railway"
        success "Backend deployd a Railway"

        # Mostrar URL
        info "Obteniendo URL del backend..."
        railway status
    fi

    cd ..
fi

# ========================================
# Frontend Deployment
# ========================================
if [ "$DEPLOY_FRONTEND" = true ]; then
    echo ""
    info "Preparando frontend..."

    cd frontend

    # Verificar que node_modules existe
    if [ ! -d "node_modules" ]; then
        info "Instalando dependencias del frontend..."
        npm install || error "Falló la instalación de dependencias"
    fi

    # Build
    info "Compilando frontend..."
    npm run build || error "Falló la compilación del frontend"
    success "Frontend compilado correctamente"

    # Verificar que Vercel CLI está instalado
    if ! command -v vercel &> /dev/null; then
        warning "Vercel CLI no está instalado"
        info "Instalar con: npm install -g vercel"
        read -p "¿Continuar sin deploy? (y/n): " CONTINUE
        if [ "$CONTINUE" != "y" ]; then
            exit 0
        fi
    else
        # Deploy a Vercel
        read -p "¿Deploy a producción? (y/n, default: preview): " PROD_DEPLOY

        if [ "$PROD_DEPLOY" = "y" ]; then
            info "Deploying a Vercel (PRODUCCIÓN)..."
            vercel --prod || error "Falló el deployment a Vercel"
            success "Frontend deployd a Vercel (PRODUCCIÓN)"
        else
            info "Deploying a Vercel (PREVIEW)..."
            vercel || error "Falló el deployment a Vercel"
            success "Frontend deployd a Vercel (PREVIEW)"
        fi
    fi

    cd ..
fi

# ========================================
# Build Only (Testing)
# ========================================
if [ "$BUILD_ONLY" = true ]; then
    echo ""
    info "Modo test: solo build local"

    # Backend
    info "Testing backend build..."
    cd backend
    npm install || error "Falló instalación backend"
    npm run build || error "Falló build backend"
    success "Backend build OK"
    cd ..

    # Frontend
    info "Testing frontend build..."
    cd frontend
    npm install || error "Falló instalación frontend"
    npm run build || error "Falló build frontend"
    success "Frontend build OK"
    cd ..
fi

# ========================================
# Resumen
# ========================================
echo ""
echo "=========================================="
echo "🎉 Deployment completado!"
echo "=========================================="
echo ""

if [ "$DEPLOY_BACKEND" = true ]; then
    info "Backend deployd. Verifica en Railway Dashboard"
    info "Health check: curl https://[tu-app].up.railway.app/health"
fi

if [ "$DEPLOY_FRONTEND" = true ]; then
    info "Frontend deployd. Verifica en Vercel Dashboard"
fi

echo ""
warning "No olvides:"
echo "  1. Verificar variables de entorno"
echo "  2. Test de funcionalidad completa"
echo "  3. Verificar logs de ambos servicios"
echo "  4. Configurar dominios personalizados"
echo ""

success "¡Todo listo! 🚀"
