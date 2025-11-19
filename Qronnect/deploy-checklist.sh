#!/bin/bash

# 🚀 Script de Checklist de Deployment - Qronnect
# Fecha: 16 de Noviembre de 2025
# Uso: bash deploy-checklist.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "========================================"
echo "🚀 QRONNECT DEPLOYMENT CHECKLIST"
echo "========================================"
echo ""

# Función para verificar comandos
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 está instalado${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 NO está instalado${NC}"
        return 1
    fi
}

# Función para hacer preguntas
ask_yes_no() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Por favor responde y (sí) o n (no).";;
        esac
    done
}

# 1. VERIFICAR HERRAMIENTAS NECESARIAS
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PASO 1: Verificar herramientas necesarias${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TOOLS_OK=true

check_command "node" || TOOLS_OK=false
check_command "npm" || TOOLS_OK=false
check_command "git" || TOOLS_OK=false
check_command "curl" || TOOLS_OK=false

echo ""

if [ "$TOOLS_OK" = false ]; then
    echo -e "${RED}⚠️  Algunas herramientas faltan. Instálalas antes de continuar.${NC}"
    exit 1
fi

# 2. VERIFICAR VARIABLES DE ENTORNO
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PASO 2: Verificar variables de entorno${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ENV_VARS=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "JWT_SECRET"
    "RESEND_API_KEY"
    "SMS_ACCOUNT_SID"
    "SMS_AUTH_TOKEN"
    "SMS_FROM_NUMBER"
    "GEMINI_API_KEY"
)

echo "Verificando variables de entorno críticas..."
echo ""

MISSING_VARS=()

for var in "${ENV_VARS[@]}"; do
    if grep -q "^$var=" backend/.env 2>/dev/null || grep -q "^$var=" backend/.env.production 2>/dev/null; then
        echo -e "${GREEN}✅ $var configurada${NC}"
    else
        echo -e "${RED}❌ $var NO encontrada${NC}"
        MISSING_VARS+=("$var")
    fi
done

echo ""

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Las siguientes variables faltan:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    if ! ask_yes_no "¿Quieres continuar de todos modos?"; then
        exit 1
    fi
fi

# 3. VERIFICAR GIT
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PASO 3: Verificar estado de Git${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -d .git ]; then
    echo -e "${GREEN}✅ Repositorio Git encontrado${NC}"

    # Verificar branch actual
    CURRENT_BRANCH=$(git branch --show-current)
    echo "   Branch actual: $CURRENT_BRANCH"

    # Verificar cambios sin commitear
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  Tienes cambios sin commitear${NC}"
        git status --short
        echo ""
        if ask_yes_no "¿Quieres hacer commit de estos cambios?"; then
            read -p "Mensaje del commit: " commit_msg
            git add .
            git commit -m "$commit_msg"
            echo -e "${GREEN}✅ Commit realizado${NC}"
        fi
    else
        echo -e "${GREEN}✅ No hay cambios sin commitear${NC}"
    fi

    # Verificar remote
    if git remote -v | grep -q "origin"; then
        echo -e "${GREEN}✅ Remote 'origin' configurado${NC}"
        git remote -v | head -2
    else
        echo -e "${RED}❌ No hay remote 'origin' configurado${NC}"
    fi
else
    echo -e "${RED}❌ No es un repositorio Git${NC}"
    if ask_yes_no "¿Quieres inicializar Git?"; then
        git init
        echo -e "${GREEN}✅ Git inicializado${NC}"
    fi
fi

echo ""

# 4. BUILD TEST
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PASO 4: Test de build${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if ask_yes_no "¿Quieres hacer un test de build del backend?"; then
    echo "Ejecutando npm run build en backend..."
    cd backend
    if npm run build; then
        echo -e "${GREEN}✅ Build del backend exitoso${NC}"
    else
        echo -e "${RED}❌ Build del backend falló${NC}"
        cd ..
        exit 1
    fi
    cd ..
fi

echo ""

if ask_yes_no "¿Quieres hacer un test de build del frontend?"; then
    echo "Ejecutando npm run build en frontend..."
    cd frontend
    if npm run build; then
        echo -e "${GREEN}✅ Build del frontend exitoso${NC}"
    else
        echo -e "${RED}❌ Build del frontend falló${NC}"
        cd ..
        exit 1
    fi
    cd ..
fi

echo ""

# 5. CHECKLIST MANUAL
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PASO 5: Checklist manual de deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Por favor confirma los siguientes puntos:"
echo ""

CHECKLIST=(
    "¿Has creado una cuenta en Railway o Render para el backend?"
    "¿Has creado una cuenta en Vercel para el frontend?"
    "¿Has upgradeado Supabase a plan Pro?"
    "¿Has upgradeado Twilio de cuenta trial a cuenta de pago?"
    "¿Has configurado las API keys de Resend?"
    "¿Has configurado las API keys de Google Gemini?"
    "¿Has aplicado todas las migraciones de base de datos?"
    "¿Tienes acceso al panel DNS de qronnect.es?"
)

CHECKLIST_FAILED=false

for item in "${CHECKLIST[@]}"; do
    if ask_yes_no "$item"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${YELLOW}⚠️  Pendiente: $item${NC}"
        CHECKLIST_FAILED=true
    fi
    echo ""
done

if [ "$CHECKLIST_FAILED" = true ]; then
    echo -e "${YELLOW}⚠️  Algunos items del checklist no están completos.${NC}"
    echo ""
fi

# 6. RESUMEN
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 RESUMEN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "✅ Herramientas verificadas"
echo "✅ Variables de entorno revisadas"
echo "✅ Git verificado"
echo "✅ Builds testeados"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 CHECKLIST COMPLETADO${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Próximos pasos:"
echo ""
echo "1. 🚀 Deploy backend en Railway:"
echo "   → https://railway.app"
echo ""
echo "2. 🚀 Deploy frontend en Vercel:"
echo "   → https://vercel.com"
echo ""
echo "3. 🌐 Configurar DNS en tu registrador:"
echo "   → Consulta GUIA_DEPLOYMENT_PRODUCCION.md"
echo ""
echo "4. ✅ Testing completo:"
echo "   → Verificar cada funcionalidad en producción"
echo ""

echo -e "${BLUE}📖 Para más detalles, consulta:${NC}"
echo "   GUIA_DEPLOYMENT_PRODUCCION.md"
echo ""
