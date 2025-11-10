# 📋 Instrucciones para Ejecutar la Migración de Campañas

La migración del sistema de campañas necesita ejecutarse manualmente en el Dashboard de Supabase porque estamos usando Supabase Cloud y el API REST necesita que las tablas se creen directamente en PostgreSQL.

## 🚀 Pasos para Ejecutar la Migración

### 1. Abrir el SQL Editor de Supabase

Ve a tu Dashboard de Supabase:
```
https://supabase.com/dashboard/project/ajyiuhujexwrjmjfycxh/sql/new
```

O navega manualmente:
1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto: `ajyiuhujexwrjmjfycxh`
3. En el menú lateral, haz clic en **SQL Editor**
4. Haz clic en **New query**

### 2. Copiar el SQL de la Migración

Abre el archivo:
```
backend/supabase/migrations/20250110000005_create_campaigns_system.sql
```

Copia **TODO** el contenido del archivo.

### 3. Pegar y Ejecutar

1. Pega el SQL en el editor de Supabase
2. Haz clic en el botón **Run** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
3. Espera a que se complete la ejecución (puede tardar 5-10 segundos)

### 4. Verificar que las Tablas se Crearon

Ejecuta esta query para verificar:

```sql
-- Verificar tablas
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('campanas_email', 'campanas_destinatarios', 'email_templates')
ORDER BY table_name;

-- Ver templates predefinidos
SELECT nombre, categoria, es_sistema
FROM email_templates
WHERE es_sistema = true;
```

Deberías ver:
- ✅ 3 tablas creadas: `campanas_email`, `campanas_destinatarios`, `email_templates`
- ✅ 3 templates predefinidos: Bienvenida Simple, Promoción Especial, Recordatorio de Puntos

### 5. Refrescar el Caché de la API (Opcional)

Supabase actualiza automáticamente su caché de esquema cada pocos minutos. Si quieres forzar la actualización:

1. Ve a **Settings** → **API**
2. Haz clic en **Restart server** (si está disponible)

O simplemente espera 1-2 minutos.

### 6. Probar los Endpoints

Una vez completado, prueba que los endpoints funcionan:

```bash
# Autenticarse como admin
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -d '{"email":"admin@lokeyokiera.com","pin":"1234"}'

# Listar templates (reemplaza TOKEN con el access_token del paso anterior)
curl -s "http://localhost:3001/api/admin/campanas/templates/list" \
  -H "Authorization: Bearer TOKEN" \
  -H "X-Tenant-Domain: lokeyokiera"
```

## ✅ Tablas Creadas

La migración crea las siguientes tablas:

### `campanas_email`
Almacena las campañas de email con:
- Información básica (nombre, asunto, contenido HTML/texto)
- **Filtros de segmentación** (JSONB): ticket_medio, num_visitas, edad, ultima_visita, etc.
- Estado del workflow: borrador, programada, enviando, enviada, cancelada
- Estadísticas: total_destinatarios, enviados, abiertos, clicks

### `campanas_destinatarios`
Registro de envíos individuales:
- Relación campaña-cliente
- Estado del envío: pendiente, enviado, fallido, rebotado
- Tracking de interacciones: fecha_abierto, fecha_click
- Gestión de errores

### `email_templates`
Templates reutilizables:
- Templates del sistema (3 predefinidos)
- Templates personalizados por tienda
- Variables dinámicas disponibles
- Categorización (bienvenida, promocion, recordatorio, etc.)

## 🎯 Templates Predefinidos

### 1. Bienvenida Simple
- **Categoría**: bienvenida
- **Uso**: Nuevos clientes registrados
- **Variables**: nombre, tienda_nombre, puntos, colores de marca

### 2. Promoción Especial
- **Categoría**: promocion
- **Uso**: Ofertas y descuentos
- **Variables**: nombre, descuento, titulo_promocion, fecha_fin

### 3. Recordatorio de Puntos
- **Categoría**: recordatorio
- **Uso**: Recordar a clientes con puntos acumulados
- **Variables**: nombre, puntos, lista_promociones

## ❓ Troubleshooting

### Error: "Could not find the table"
- **Causa**: El caché de Supabase aún no se actualizó
- **Solución**: Espera 2-3 minutos o reinicia el servidor de la API

### Error: "relation already exists"
- **Causa**: Ya ejecutaste la migración antes
- **Solución**: Las tablas ya existen, no es necesario hacer nada

### Error de permisos
- **Causa**: No tienes permisos de administrador en Supabase
- **Solución**: Asegúrate de usar la cuenta correcta en el Dashboard

## 📚 Más Información

- Documentación de migraciones: `backend/supabase/migrations/README.md`
- API de campañas: `backend/src/campanas/`
- Swagger docs: http://localhost:3001/api/docs
