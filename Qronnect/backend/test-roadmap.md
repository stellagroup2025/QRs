# 🧪 GUÍA DE PRUEBAS - ROADMAP 14 NOVIEMBRE

## ✅ Checklist de Verificación Post-Migración

### 1. 📱 Campañas SMS Mejoradas

#### Backend:
- [ ] Verificar que la tabla `campanas_sms` tiene los nuevos campos:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'campanas_sms'
AND column_name IN ('asunto', 'remitente_nombre', 'hora_programada', 'zona_horaria', 'costo_estimado', 'costo_real', 'estadisticas');
```

- [ ] Probar endpoint de generación con IA:
```bash
curl -X POST http://localhost:3001/api/campanas-sms/generar-con-ia \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -H "Content-Type: application/json" \
  -d '{
    "contextoNegocio": "Gimnasio CrossFit en Madrid",
    "objetivo": "promocion",
    "mensajeClave": "50% descuento en matrícula",
    "tono": "amigable",
    "urgencia": "alta"
  }'
```

- [ ] Crear campaña SMS con nuevos campos:
```bash
curl -X POST http://localhost:3001/api/campanas-sms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Campaña Test",
    "mensaje": "Hola {{nombre}}! Oferta especial",
    "asunto": "Test campaña",
    "remitente_nombre": "GymFit",
    "tipo": "promocional"
  }'
```

- [ ] Verificar estadísticas detalladas:
```bash
curl http://localhost:3001/api/campanas-sms/CAMPANA_ID/estadisticas-detalladas \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: lokeyokiera"
```

---

### 2. 🎁 Sistema de Regalos de Bienvenida

#### Backend:
- [ ] Verificar tabla y funciones:
```sql
-- Verificar tabla
SELECT * FROM regalos_bienvenida_otorgados LIMIT 5;

-- Verificar función
SELECT public.otorgar_regalo_bienvenida(
  'CLIENTE_ID'::uuid,
  'TIENDA_ID'::uuid
);
```

- [ ] Configurar regalo de bienvenida:
```bash
curl -X PUT http://localhost:3001/api/tiendas/config/regalo-bienvenida \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -H "Content-Type: application/json" \
  -d '{
    "activo": true,
    "tipo": "puntos",
    "valor": {
      "puntos": 100,
      "mensaje_personalizado": "¡Bienvenido! Aquí tienes 100 puntos de regalo",
      "enviar_email": true,
      "enviar_sms": false
    }
  }'
```

- [ ] Obtener configuración:
```bash
curl http://localhost:3001/api/tiendas/config/regalo-bienvenida \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: lokeyokiera"
```

- [ ] Ver estadísticas:
```bash
curl http://localhost:3001/api/tiendas/regalos-bienvenida/estadisticas \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: lokeyokiera"
```

- [ ] Probar que al crear un nuevo cliente recibe el regalo automáticamente:
```sql
-- El trigger debe ejecutarse automáticamente al insertar un nuevo cliente
INSERT INTO clientes (nombre, email, telefono, id_tienda)
VALUES ('Test User', 'test@example.com', '600123456', 'TIENDA_ID');

-- Verificar que se otorgó el regalo
SELECT * FROM regalos_bienvenida_otorgados
WHERE id_cliente = (SELECT id FROM clientes WHERE email = 'test@example.com');
```

---

### 3. 🤝 Sistema de Referidos

#### Backend:
- [ ] Verificar tablas:
```sql
SELECT * FROM programas_referidos;
SELECT * FROM referidos LIMIT 5;
SELECT codigo_referido_personal, total_referidos FROM clientes WHERE codigo_referido_personal IS NOT NULL LIMIT 5;
```

- [ ] Crear programa de referidos:
```bash
curl -X POST http://localhost:3001/api/referidos/programa \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Trae un amigo",
    "descripcion": "Invita a tus amigos y gana puntos",
    "activo": true,
    "puntos_por_referido": 100,
    "recompensas": [
      {
        "objetivo": 5,
        "tipo": "puntos",
        "valor": 500,
        "descripcion": "500 puntos bonus al llegar a 5 referidos"
      },
      {
        "objetivo": 10,
        "tipo": "puntos",
        "valor": 1000,
        "descripcion": "1000 puntos bonus al llegar a 10 referidos"
      }
    ]
  }'
```

- [ ] Obtener programa activo:
```bash
curl http://localhost:3001/api/referidos/programa \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: lokeyokiera"
```

- [ ] Verificar que los clientes tienen código de referido:
```bash
curl http://localhost:3001/api/referidos/mi-codigo \
  -H "Authorization: Bearer CLIENTE_TOKEN" \
  -H "X-Tenant-Domain: lokeyokiera"
```

- [ ] Obtener estadísticas de referidos:
```bash
curl http://localhost:3001/api/referidos/estadisticas \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: lokeyokiera"
```

---

### 4. ⚙️ Configuración IA

#### Backend:
- [ ] Configurar contexto de IA:
```bash
curl -X PUT http://localhost:3001/api/tiendas/config/ia \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_negocio": "gimnasio",
    "publico_objetivo": {
      "edad_min": 18,
      "edad_max": 45,
      "generos": ["masculino", "femenino"],
      "intereses": ["fitness", "crossfit", "salud"]
    },
    "valores_marca": ["motivacion", "comunidad", "resultados"],
    "tono_comunicacion": "motivador",
    "productos_principales": [
      "Clases de CrossFit",
      "Entrenamiento personal"
    ],
    "rango_precios": "medio",
    "ubicacion": {
      "ciudad": "Madrid",
      "barrio": "Salamanca"
    },
    "slogan": "Tu mejor versión comienza aquí"
  }'
```

- [ ] Obtener configuración:
```bash
curl http://localhost:3001/api/tiendas/config/ia \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: lokeyokiera"
```

---

### 5. 🤖 Límites de API Keys IA

#### Backend:
- [ ] Verificar tablas y funciones:
```sql
-- Ver configuración de límites
SELECT
  id,
  nombre,
  ia_modo,
  ia_limite_mensual,
  ia_consumo_actual,
  ia_ultimo_reset
FROM tiendas;

-- Ver uso de IA
SELECT * FROM ia_uso ORDER BY fecha DESC LIMIT 10;

-- Probar función de verificar límite
SELECT public.verificar_limite_ia('TIENDA_ID'::uuid);
```

- [ ] Probar generación con límites:
```bash
# Generar varias veces SMS para verificar que incrementa el contador
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/campanas-sms/generar-con-ia \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "X-Tenant-Domain: lokeyokiera" \
    -H "Content-Type: application/json" \
    -d '{
      "contextoNegocio": "Gimnasio CrossFit",
      "objetivo": "promocion",
      "mensajeClave": "Oferta especial",
      "tono": "amigable"
    }'
  echo "\n--- Generación $i completada ---\n"
done
```

- [ ] Verificar que se incrementó el consumo:
```sql
SELECT ia_consumo_actual FROM tiendas WHERE id = 'TIENDA_ID';
SELECT COUNT(*) FROM ia_uso WHERE id_tienda = 'TIENDA_ID' AND fecha >= DATE_TRUNC('month', NOW());
```

---

## 🎯 Pruebas Funcionales Completas

### Test 1: Flujo completo de campaña SMS con IA
1. Configurar contexto de IA de la tienda
2. Generar mensaje SMS con IA
3. Crear campaña SMS con el mensaje generado
4. Ver estadísticas detalladas
5. Verificar consumo de IA

### Test 2: Flujo de registro con regalo
1. Configurar regalo de bienvenida (100 puntos)
2. Registrar nuevo cliente
3. Verificar que recibió 100 puntos automáticamente
4. Ver historial de regalos otorgados

### Test 3: Flujo de referidos
1. Crear programa de referidos
2. Cliente A obtiene su código de referido
3. Cliente B se registra usando el código de A
4. Verificar que A recibió puntos
5. A refiere a 5 clientes y recibe recompensa de objetivo

---

## 📊 Queries Útiles de Verificación

```sql
-- Ver todas las campañas SMS con estadísticas
SELECT * FROM vista_campanas_sms_dashboard ORDER BY creado_en DESC LIMIT 5;

-- Ver regalos otorgados
SELECT * FROM vista_regalos_bienvenida ORDER BY creado_en DESC LIMIT 10;

-- Ver referidos activos
SELECT * FROM vista_referidos_dashboard ORDER BY creado_en DESC LIMIT 10;

-- Ver uso de IA por tienda
SELECT * FROM vista_ia_uso_dashboard ORDER BY creado_en DESC LIMIT 20;

-- Estadísticas generales
SELECT
  (SELECT COUNT(*) FROM campanas_sms) as total_campanas_sms,
  (SELECT COUNT(*) FROM regalos_bienvenida_otorgados) as total_regalos,
  (SELECT COUNT(*) FROM referidos) as total_referidos,
  (SELECT COUNT(*) FROM ia_uso) as total_usos_ia;
```

---

## ✅ Checklist Final

- [ ] Todas las migraciones aplicadas correctamente
- [ ] Servidor backend arranca sin errores
- [ ] Todos los endpoints responden
- [ ] Las funciones SQL funcionan correctamente
- [ ] Los triggers se ejecutan automáticamente
- [ ] El sistema de límites de IA funciona
- [ ] Frontend puede crear campañas SMS con IA
- [ ] Los regalos se otorgan automáticamente
- [ ] Los códigos de referido se generan correctamente

---

## 🚨 Solución de Problemas

### Error: "función no encontrada"
```sql
-- Verificar que las funciones existen
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%referido%';
```

### Error: "columna no existe"
```sql
-- Verificar columnas de una tabla
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'NOMBRE_TABLA';
```

### Error 500 en endpoints
1. Revisar logs del backend: `npm run start:dev`
2. Verificar que el token JWT es válido
3. Verificar que X-Tenant-Domain es correcto
4. Verificar que GEMINI_API_KEY está configurado en .env

---

¡Listo para probar! 🚀
