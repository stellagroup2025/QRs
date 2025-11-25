# Migración: Sistema de Informes Mensuales con IA

## Descripción

Esta migración añade el sistema completo de informes mensuales con IA a Qronnect, incluyendo:

- ✅ Tablas para almacenar informes generados
- ✅ Configuración de envío automático por tienda
- ✅ Historial de envíos de informes
- ✅ Vistas para consultas eficientes
- ✅ Función auxiliar para obtener tiendas con envío programado

## Instrucciones para Ejecutar la Migración

### Opción 1: Desde el Dashboard de Supabase (Recomendado)

1. **Acceder al SQL Editor**
   - Ve a tu proyecto en [app.supabase.com](https://app.supabase.com)
   - Click en "SQL Editor" en el menú lateral

2. **Ejecutar la migración**
   - Copia todo el contenido del archivo: `backend/database/migrations/add_informes_mensuales.sql`
   - Pega en el editor SQL
   - Click en "Run" o presiona `Ctrl+Enter`

3. **Verificar ejecución**
   - Ve a "Table Editor"
   - Deberías ver las nuevas tablas:
     - `informes_mensuales`
     - `configuracion_informes`
     - `historial_envios_informes`

### Opción 2: Desde psql (Avanzado)

```bash
# Conectarse a la base de datos
psql postgresql://postgres:[TU-PASSWORD]@[TU-URL].supabase.co:5432/postgres

# Ejecutar la migración
\i backend/database/migrations/add_informes_mensuales.sql

# Salir
\q
```

## Verificación Post-Migración

Ejecuta estas queries para verificar que todo se creó correctamente:

```sql
-- 1. Verificar que las tablas existen
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('informes_mensuales', 'configuracion_informes', 'historial_envios_informes');

-- 2. Verificar índices
SELECT tablename, indexname
FROM pg_indexes
WHERE tablename LIKE '%informe%';

-- 3. Verificar que la vista existe
SELECT * FROM vista_informes_tienda LIMIT 5;

-- 4. Verificar función auxiliar
SELECT obtener_tiendas_para_envio_hoy();

-- 5. Verificar datos de ejemplo insertados
SELECT * FROM configuracion_informes;
```

## Estructura de las Tablas

### informes_mensuales

Almacena los informes generados:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único del informe |
| id_tienda | UUID | Referencia a la tienda |
| periodo_mes | INTEGER | Mes del informe (1-12) |
| periodo_anio | INTEGER | Año del informe |
| datos_kpis | JSONB | KPIs calculados |
| analisis_ia | JSONB | Análisis generado por IA |
| comparativa_anterior | JSONB | Comparativa con meses previos |
| promociones_usadas | JSONB | Promociones del período |
| campanas_usadas | JSONB | Campañas del período |
| plan_siguiente_mes | JSONB | Plan de acción recomendado |
| estado | TEXT | 'generado', 'enviado', 'error' |
| pdf_url | TEXT | URL del PDF (opcional) |
| enviado_a | TEXT | Email destino |

**Constraint único:** Un informe por mes por tienda

### configuracion_informes

Configuración de envío automático:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| id_tienda | UUID | Referencia a la tienda (UNIQUE) |
| automatico | BOOLEAN | Si está activo el envío automático |
| email_destino | TEXT | Email principal |
| emails_cc | TEXT[] | Emails en copia |
| dia_envio | INTEGER | Día del mes (1-28) |
| hora_envio | INTEGER | Hora del día (0-23) |
| timezone | TEXT | Zona horaria (default: Europe/Madrid) |
| incluir_pdf | BOOLEAN | Incluir PDF adjunto |
| incluir_analisis_ia | BOOLEAN | Incluir análisis con IA |
| incluir_comparativa | BOOLEAN | Incluir comparativa |
| incluir_plan_accion | BOOLEAN | Incluir plan de acción |

### historial_envios_informes

Registro de todos los envíos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único del registro |
| id_informe | UUID | Referencia al informe |
| id_tienda | UUID | Referencia a la tienda |
| tipo_envio | TEXT | 'manual' o 'automatico' |
| enviado_por | UUID | ID del usuario (si fue manual) |
| email_destino | TEXT | Email principal |
| emails_cc | TEXT[] | Emails en copia |
| estado | TEXT | 'enviado', 'error', 'rebotado' |
| mensaje_id | TEXT | ID del mensaje de Resend |
| fecha_envio | TIMESTAMP | Fecha de envío |

## Testing del Sistema

### 1. Crear configuración de prueba

```sql
INSERT INTO configuracion_informes (
  id_tienda,
  automatico,
  email_destino,
  dia_envio,
  hora_envio
) VALUES (
  '[ID_DE_TU_TIENDA]',
  TRUE,
  'tu@email.com',
  1,
  9
);
```

### 2. Generar informe manual (desde backend)

```bash
# Usando curl
curl -X POST http://localhost:3001/api/admin/informes/generar \
  -H "Authorization: Bearer [TU_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "periodo_mes": 11,
    "periodo_anio": 2025
  }'
```

### 3. Enviar informe manual (desde Superadmin)

```bash
curl -X POST http://localhost:3001/superadmin/tiendas/[ID_TIENDA]/informes/enviar \
  -H "Authorization: Bearer [SUPERADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "email_destino": "admin@tienda.com",
    "periodo_mes": 11,
    "periodo_anio": 2025
  }'
```

## Programación del Scheduler

El sistema incluye 2 tareas programadas (cron):

### 1. Verificar envíos automáticos
- **Frecuencia:** Cada hora (a los 5 minutos de cada hora)
- **Función:** Verificar si hay tiendas que necesitan recibir informe hoy
- **Cron:** `5 * * * *`
- **Timezone:** Europe/Madrid

### 2. Generar informes del mes anterior
- **Frecuencia:** El día 1 de cada mes a las 2:00 AM
- **Función:** Generar informes del mes anterior para todas las tiendas
- **Cron:** `0 2 1 * *`
- **Timezone:** Europe/Madrid

## Rollback (si es necesario)

Si necesitas revertir la migración:

```sql
-- ADVERTENCIA: Esto eliminará todas las tablas y datos de informes

DROP TABLE IF EXISTS historial_envios_informes CASCADE;
DROP TABLE IF EXISTS informes_mensuales CASCADE;
DROP TABLE IF EXISTS configuracion_informes CASCADE;
DROP VIEW IF EXISTS vista_informes_tienda CASCADE;
DROP FUNCTION IF EXISTS obtener_tiendas_para_envio_hoy();
```

## Próximos Pasos

Después de ejecutar la migración:

1. ✅ Reiniciar el backend de NestJS para que cargue el módulo de Informes
2. ✅ Acceder al panel de Superadmin → Informes
3. ✅ Configurar envío automático para tus tiendas de prueba
4. ✅ Probar generación manual de un informe
5. ✅ Verificar que lleguen los emails correctamente

## Soporte

Si encuentras algún problema:

1. Revisa los logs del backend: `npm run start:dev`
2. Revisa los logs de Supabase en el dashboard
3. Verifica que las variables de entorno estén configuradas:
   - `GEMINI_API_KEY` (para análisis con IA)
   - `RESEND_API_KEY` (para envío de emails)
   - `RESEND_FROM_EMAIL` (email remitente)

## Changelog

- **2025-11-25:** Creación inicial del sistema de informes mensuales con IA
  - Tablas: informes_mensuales, configuracion_informes, historial_envios_informes
  - Scheduler automático con @nestjs/schedule
  - Integración con Gemini AI para análisis
  - Envío de emails con Resend
  - Panel de Superadmin para gestión
