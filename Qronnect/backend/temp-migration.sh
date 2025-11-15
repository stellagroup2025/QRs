#!/bin/bash

# Configuración
SUPABASE_URL="https://ajyiuhujexwrjmjfycxh.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeWl1aHVqZXh3cmptamZ5Y3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcxMDA3OCwiZXhwIjoyMDc4Mjg2MDc4fQ.vlxkhTIaz5UpbjSx1vN4P6yrbFs5Soi7_W4ovLne3zw"

echo "🔧 Aplicando migraciones directamente a Supabase Cloud..."
echo ""

# Array de archivos de migración
migrations=(
  "20251114000001_extend_campanas_sms.sql"
  "20251114000002_sistema_regalos_bienvenida.sql"
  "20251114000003_sistema_referidos.sql"
  "20251114000004_config_ia_extensa.sql"
  "20251114000005_limites_api_keys_ia.sql"
)

for migration in "${migrations[@]}"; do
  echo "📄 Aplicando: $migration"
  
  # Leer el contenido del archivo SQL
  SQL_CONTENT=$(cat "supabase/migrations/$migration")
  
  # Ejecutar usando la API REST de Supabase
  curl -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"sql_string\": $(jq -n --arg sql "$SQL_CONTENT" '$sql')}" \
    -s -o /dev/null -w "HTTP %{http_code}\n"
  
  echo "✅ Completado"
  echo ""
done

echo "🎉 Todas las migraciones enviadas!"
