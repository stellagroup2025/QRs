#!/bin/bash

# Pre-deployment Check Script
# Verifica que todo esté listo antes de deployar

set -e

echo "╔═══════════════════════════════════════════════╗"
echo "║  PRE-DEPLOYMENT CHECK - Qronnect              ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

OK="${GREEN}✓${NC}"
FAIL="${RED}✗${NC}"
WARN="${YELLOW}⚠${NC}"

ERRORS=0
WARNINGS=0

# Función para verificar comando
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "$OK $2"
        return 0
    else
        echo -e "$FAIL $2 - NO INSTALADO"
        ERRORS=$((ERRORS + 1))
        if [ ! -z "$3" ]; then
            echo "   Instalar con: $3"
        fi
        return 1
    fi
}

echo "1️⃣ VERIFICANDO HERRAMIENTAS..."
echo "──────────────────────────────"
check_command "node" "Node.js instalado" "https://nodejs.org"
check_command "npm" "npm instalado" "viene con Node.js"
check_command "git" "Git instalado" "https://git-scm.com"
check_command "curl" "curl instalado" "apt install curl / brew install curl"

echo ""
echo "   CLIs opcionales (para deployment via terminal):"
check_command "vercel" "Vercel CLI" "npm install -g vercel" || echo -e "   ${WARN} Opcional - puedes usar Vercel Dashboard"
check_command "railway" "Railway CLI" "npm install -g @railway/cli" || echo -e "   ${WARN} Opcional - puedes usar Railway Dashboard"

echo ""
echo "2️⃣ VERIFICANDO PROYECTO..."
echo "──────────────────────────────"

# Verificar directorio actual
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    echo -e "$FAIL Debes ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Backend
echo "Backend:"
if [ -f "backend/package.json" ]; then
    echo -e "$OK package.json existe"
else
    echo -e "$FAIL package.json NO existe"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "backend/node_modules" ]; then
    echo -e "$OK node_modules instalado"
else
    echo -e "$WARN node_modules NO instalado"
    echo "   Ejecutar: cd backend && npm install"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "backend/.env" ]; then
    echo -e "$OK .env existe"
else
    echo -e "$FAIL .env NO existe"
    ERRORS=$((ERRORS + 1))
fi

# Frontend
echo ""
echo "Frontend:"
if [ -f "frontend/package.json" ]; then
    echo -e "$OK package.json existe"
else
    echo -e "$FAIL package.json NO existe"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "$OK node_modules instalado"
else
    echo -e "$WARN node_modules NO instalado"
    echo "   Ejecutar: cd frontend && npm install"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "frontend/.env.local" ]; then
    echo -e "$OK .env.local existe"
else
    echo -e "$WARN .env.local NO existe (OK si usas solo vars públicas)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "3️⃣ VERIFICANDO ARCHIVOS DE CONFIGURACIÓN..."
echo "──────────────────────────────"

if [ -f "backend/Procfile" ]; then
    echo -e "$OK backend/Procfile"
else
    echo -e "$FAIL backend/Procfile NO existe"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "backend/railway.json" ]; then
    echo -e "$OK backend/railway.json"
else
    echo -e "$FAIL backend/railway.json NO existe"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "frontend/vercel.json" ]; then
    echo -e "$OK frontend/vercel.json"
else
    echo -e "$FAIL frontend/vercel.json NO existe"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "4️⃣ VERIFICANDO BUILDS..."
echo "──────────────────────────────"

echo "Backend build test..."
cd backend
if npm run build &> /dev/null; then
    echo -e "$OK Backend compila correctamente"
else
    echo -e "$FAIL Backend tiene errores de compilación"
    echo "   Ejecutar: cd backend && npm run build"
    ERRORS=$((ERRORS + 1))
fi
cd ..

echo ""
echo "Frontend build test..."
cd frontend
if npm run build &> /dev/null; then
    echo -e "$OK Frontend compila correctamente"
else
    echo -e "$WARN Frontend tiene errores (puede estar OK si ignoreBuildErrors=true)"
    echo "   Ejecutar: cd frontend && npm run build"
    WARNINGS=$((WARNINGS + 1))
fi
cd ..

echo ""
echo "5️⃣ VERIFICANDO GIT..."
echo "──────────────────────────────"

if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "$OK Git repository inicializado"

    # Verificar remote
    if git remote -v | grep -q origin; then
        echo -e "$OK Git remote configurado"
        git remote -v | head -2
    else
        echo -e "$WARN Git remote NO configurado"
        echo "   Para deployment via Railway/Vercel, necesitas subir a GitHub"
        echo "   Crear repo en GitHub y ejecutar:"
        echo "   git remote add origin https://github.com/TU_USUARIO/qronnect.git"
        echo "   git push -u origin main"
        WARNINGS=$((WARNINGS + 1))
    fi

    # Verificar cambios sin commitear
    if git diff-index --quiet HEAD --; then
        echo -e "$OK No hay cambios sin commitear"
    else
        echo -e "$WARN Hay cambios sin commitear"
        echo "   Ejecutar: git add . && git commit -m 'Preparar para deployment'"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "$WARN Git NO inicializado"
    echo "   Ejecutar: git init"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "6️⃣ CHECKLIST DE CREDENCIALES..."
echo "──────────────────────────────"

echo "Necesitarás tener listas estas credenciales:"
echo ""
echo "□ Supabase:"
echo "  - URL del proyecto"
echo "  - anon key"
echo "  - service_role key"
echo ""
echo "□ Twilio (cuenta VERIFICADA, no trial):"
echo "  - Account SID"
echo "  - Auth Token"
echo "  - Número de teléfono o Sender ID"
echo ""
echo "□ Resend:"
echo "  - API Key"
echo "  - Dominio verificado"
echo ""
echo "□ Google Gemini:"
echo "  - API Key"
echo ""

echo ""
echo "═══════════════════════════════════════════════"
echo " RESUMEN"
echo "═══════════════════════════════════════════════"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ TODO LISTO PARA DEPLOYMENT${NC}"
    echo ""
    echo "Siguiente paso:"
    echo "  1. Lee MI_DEPLOYMENT.md"
    echo "  2. Prepara tus credenciales"
    echo "  3. Ejecuta el deployment"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ CASI LISTO - ${WARNINGS} warnings${NC}"
    echo ""
    echo "Puedes continuar con deployment pero revisa los warnings arriba"
else
    echo -e "${RED}✗ NO LISTO - ${ERRORS} errores, ${WARNINGS} warnings${NC}"
    echo ""
    echo "Debes corregir los errores antes de deployar"
    exit 1
fi

echo ""
echo "Para deployar ahora:"
echo "  $ cat MI_DEPLOYMENT.md"
echo ""
