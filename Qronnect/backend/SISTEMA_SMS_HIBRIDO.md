# 📱 Sistema SMS Híbrido - Qronnect

## Descripción

Sistema completo de campañas SMS con **arquitectura híbrida** que permite dos modos de operación:

### **Modo Global** 🌍
- Las tiendas usan tu cuenta de Twilio centralizada
- Tú gestionas los costes y facturas a las tiendas
- Setup instantáneo para nuevos clientes
- Ideal para tiendas pequeñas

### **Modo Propio** 🏢
- Cada tienda usa su propia cuenta de Twilio
- Control total de costes por tienda
- Escalabilidad infinita
- Ideal para tiendas medianas/grandes

---

## 🚀 Instalación

### 1. Aplicar Migración de Base de Datos

```bash
# Desde Supabase Dashboard → SQL Editor
# Ejecutar: backend/supabase/migrations/20251113000001_create_sms_system.sql
```

La migración crea:
- ✅ Tabla `campanas_sms` - Campañas SMS con segmentación
- ✅ Tabla `campanas_sms_destinatarios` - Destinatarios por campaña
- ✅ Tabla `envios_sms` - Historial global de SMS enviados
- ✅ Tabla `sms_enviados` - Tracking para límites y facturación
- ✅ Función `descontar_credito_sms()` - Para modo prepago
- ✅ Campo `telefono` en tabla `clientes` (si no existe)

### 2. Instalar Dependencia (Ya instalada)

```bash
npm install twilio
```

### 3. Configurar Variables de Entorno (OPCIONAL)

Si quieres ofrecer **modo global**, configura en `.env`:

```env
# Modo Global (Opcional)
SMS_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMS_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMS_FROM_NUMBER=+34666123456

# Límites globales (opcional)
SMS_DAILY_LIMIT=5000
SMS_MONTHLY_LIMIT=100000
```

**Si NO configuras estas variables:**
- Solo funcionará el modo "propio"
- Cada tienda debe tener su propia cuenta Twilio

---

## 📖 Uso

### Opción A: Modo Global (Cuenta Centralizada)

#### Paso 1: Configurar tu cuenta Twilio

1. Crear cuenta en https://www.twilio.com/try-twilio
2. Copiar `Account SID` y `Auth Token`
3. Comprar número español: +34 666 XXX XXX
4. Configurar en `.env` (ver arriba)

#### Paso 2: Activar SMS para una tienda

```bash
PUT /api/superadmin/tiendas/{tiendaId}/sms
Authorization: Bearer {superadmin_token}
Content-Type: application/json

{
  "activo": true,
  "modo": "global",
  "limites": {
    "max_por_dia": 100,
    "max_por_mes": 2000
  },
  "creditos_disponibles": 500
}
```

#### Paso 3: La tienda ya puede enviar SMS

```bash
POST /api/campanas-sms
Authorization: Bearer {admin_tienda_token}

{
  "nombre": "Oferta Black Friday",
  "mensaje": "Hola {{nombre}}! 50% descuento hoy. Código: BF50",
  "tipo": "promocional",
  "estado": "enviada"
}
```

---

### Opción B: Modo Propio (Cuenta del Tenant)

#### Paso 1: El cliente crea su cuenta Twilio

1. Crear cuenta en https://www.twilio.com/try-twilio
2. Comprar número de teléfono
3. Obtener credenciales

#### Paso 2: Configurar SMS para la tienda

```bash
PUT /api/superadmin/tiendas/{tiendaId}/sms
Authorization: Bearer {superadmin_token}

{
  "activo": true,
  "modo": "propio",
  "credenciales": {
    "account_sid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "auth_token": "tu_auth_token_aqui",
    "phone_number": "+34666123456"
  },
  "limites": {
    "max_por_dia": 500,
    "max_por_mes": 10000
  }
}
```

#### Paso 3: Probar configuración

```bash
POST /api/superadmin/tiendas/{tiendaId}/sms/test
Authorization: Bearer {superadmin_token}

{
  "telefono_test": "+34666789012"
}
```

---

## 🎯 Endpoints Disponibles

### Para Admin de Tienda

```bash
# Crear campaña SMS
POST /api/campanas-sms

# Listar campañas
GET /api/campanas-sms

# Ver una campaña
GET /api/campanas-sms/{id}

# Actualizar campaña
PATCH /api/campanas-sms/{id}

# Eliminar campaña
DELETE /api/campanas-sms/{id}

# Preview de destinatarios
POST /api/campanas-sms/preview-destinatarios

# Ver estadísticas de uso
GET /api/campanas-sms/estadisticas
```

### Para SuperAdmin

```bash
# Configurar SMS de una tienda
PUT /api/superadmin/tiendas/{id}/sms

# Ver configuración SMS
GET /api/superadmin/tiendas/{id}/sms

# Probar SMS
POST /api/superadmin/tiendas/{id}/sms/test

# Estadísticas globales (solo modo global)
GET /api/superadmin/sms/estadisticas-globales
```

---

## 📊 Ejemplo de Campaña SMS

```json
{
  "nombre": "Cumpleaños Noviembre",
  "mensaje": "Feliz cumpleaños {{nombre}}! 🎂 Te regalamos 20% descuento hoy. Código: CUMPLE20",
  "tipo": "cumpleanos",
  "estado": "programada",
  "fecha_programada": "2025-11-15T10:00:00Z",
  "filtros_segmentacion": {
    "puntos_min": 50,
    "genero": "femenino"
  },
  "envio_unico": true
}
```

### Variables disponibles en el mensaje:
- `{{nombre}}` - Nombre del cliente

### Validaciones:
- ✅ Máximo 1600 caracteres (10 SMS concatenados)
- ✅ Solo clientes con teléfono
- ✅ Respeta límites diarios/mensuales
- ✅ Verifica créditos prepagados (modo global)

---

## 💰 Gestión de Costes

### Modo Global: Facturación con Markup

```javascript
// Tu coste (Twilio): 0.075€/SMS
// Cobras al cliente: 0.10€/SMS
// Margen: 0.025€/SMS (33%)

// Consultar uso de una tienda
GET /api/campanas-sms/estadisticas

// Response:
{
  "modo": "global",
  "mes_actual": {
    "sms_enviados": 450,
    "coste_total": "33.75€",  // Tu coste Twilio
    "coste_promedio": "0.075€"
  },
  "creditos_disponibles": 50  // Si usa prepago
}
```

### Modo Propio: Sin gestión de costes

```javascript
// La tienda paga directamente a Twilio
// Tú no gestionas ningún coste

GET /api/campanas-sms/estadisticas

// Response:
{
  "modo": "propio",
  "mes_actual": {
    "sms_enviados": 1200,
    "coste_total": "90.00€",  // Estimado
    "coste_promedio": "0.075€"
  }
}
```

---

## 🔒 Seguridad

### Credenciales Encriptadas

Las credenciales de Twilio se guardan en `tiendas.configuracion.sms` (JSONB).

**Recomendación:**
```typescript
// Antes de guardar
import { encrypt } from './crypto.service';

configuracion.sms.credenciales.auth_token = encrypt(auth_token);

// Al leer
const authToken = decrypt(tienda.configuracion.sms.credenciales.auth_token);
```

### Ofuscación en API

```javascript
GET /api/superadmin/tiendas/{id}/sms

// Response:
{
  "modo": "propio",
  "credenciales_configuradas": {
    "account_sid": "AC1234567890abcdef...",
    "auth_token": "***7890",  // Solo últimos 4 chars
    "phone_number": "+34666123456"
  }
}
```

---

## 📈 Monitoreo y Límites

### Límites por Tienda

```json
{
  "limites": {
    "max_por_dia": 100,
    "max_por_mes": 2000
  }
}
```

Si se alcanza el límite:
```json
{
  "statusCode": 400,
  "message": "Límite diario alcanzado (100 SMS)"
}
```

### Créditos Prepagados (Modo Global)

```bash
# Configurar 500 créditos
PUT /api/superadmin/tiendas/{id}/sms
{
  "creditos_disponibles": 500
}

# Al enviar SMS, se descuentan automáticamente
# Cuando llega a 0, los envíos fallan

# Recargar créditos
PUT /api/superadmin/tiendas/{id}/sms
{
  "creditos_disponibles": 1000
}
```

---

## 🔍 Estadísticas

### Por Tienda (Admin)

```bash
GET /api/campanas-sms/estadisticas
```

```json
{
  "modo": "global",
  "hoy": {
    "sms_enviados": 15,
    "coste_total": "1.13€",
    "restante": 85
  },
  "mes_actual": {
    "sms_enviados": 245,
    "coste_total": "18.38€",
    "coste_promedio": "0.075€",
    "restante": 1755
  },
  "creditos_disponibles": 450,
  "limites": {
    "max_por_dia": 100,
    "max_por_mes": 2000
  }
}
```

### Globales (SuperAdmin)

```bash
GET /api/superadmin/sms/estadisticas-globales
```

```json
{
  "global": {
    "hoy": {
      "sms_enviados": 89,
      "coste_total": "6.68€"
    },
    "mes_actual": {
      "sms_enviados": 1250,
      "coste_total": "93.75€",
      "coste_promedio": "0.075€"
    }
  },
  "por_tienda": [
    {
      "tienda_id": "...",
      "tienda_nombre": "Gym FitZone",
      "sms_enviados": 450,
      "coste": "33.75€"
    },
    {
      "tienda_id": "...",
      "tienda_nombre": "Café Aroma",
      "sms_enviados": 300,
      "coste": "22.50€"
    }
  ]
}
```

---

## 🎨 Tipos de Campañas SMS

```typescript
tipo:
  | 'promocional'      // Ofertas, descuentos
  | 'bienvenida'       // Nuevo cliente
  | 'cumpleanos'       // Felicitación
  | 'reactivacion'     // Cliente inactivo
  | 'abandono'         // Carrito abandonado
  | 'fidelizacion'     // Programa de puntos
  | 'informativa'      // Avisos generales
  | 'transaccional'    // Confirmaciones, tickets
```

---

## 🧪 Testing

### Probar configuración SMS

```bash
POST /api/superadmin/tiendas/{id}/sms/test
{
  "telefono_test": "+34666789012"
}
```

### Enviar SMS de prueba manualmente

```typescript
// Desde el código
await smsService.sendSms({
  tiendaId: 'uuid-tienda',
  to: '+34666789012',
  message: 'Mensaje de prueba',
  tiendaNombre: 'Mi Tienda'
});
```

---

## 🚨 Troubleshooting

### Error: "SMS no está configurado para esta tienda"

**Solución:**
```bash
PUT /api/superadmin/tiendas/{id}/sms
{
  "activo": true,
  "modo": "global"  # o "propio"
}
```

### Error: "Credenciales inválidas"

**Solución (Modo Propio):**
1. Verificar Account SID y Auth Token en Twilio Dashboard
2. Verificar que el número de teléfono pertenece a esa cuenta
3. Probar con endpoint de test

### Error: "Cuenta global de SMS no configurada"

**Solución (Modo Global):**
1. Configurar variables en `.env`:
   - `SMS_ACCOUNT_SID`
   - `SMS_AUTH_TOKEN`
   - `SMS_FROM_NUMBER`
2. Reiniciar servidor

### Error: "Cliente sin teléfono"

**Solución:**
- Los clientes necesitan tener el campo `telefono` rellenado
- Actualizar cliente con teléfono válido (formato E.164)

---

## 📚 Documentación Twilio

- Registro: https://www.twilio.com/try-twilio
- Consola: https://console.twilio.com/
- Precios SMS: https://www.twilio.com/sms/pricing
- Documentación API: https://www.twilio.com/docs/sms

---

## 🎯 Roadmap Futuro

- [ ] Webhook para respuestas SMS
- [ ] Plantillas de SMS predefinidas
- [ ] Envío programado con cron jobs
- [ ] Dashboard de analíticas SMS
- [ ] A/B testing de mensajes
- [ ] Detección de opt-out automático
- [ ] Integración con WhatsApp Business API

---

## 💡 Tips y Mejores Prácticas

### ✅ Hacer

- Mantener mensajes bajo 160 caracteres cuando sea posible (1 SMS)
- Usar variables para personalización ({{nombre}})
- Enviar SMS en horario laboral (10:00 - 21:00)
- Incluir código de opt-out (ej: "Responde STOP para cancelar")
- Usar `envio_unico: true` para campañas importantes

### ❌ Evitar

- No enviar más de 1 SMS por día al mismo cliente
- No usar MAYÚSCULAS TODO EL TIEMPO (parece spam)
- No enviar URLs muy largas (usa shorteners)
- No omitir el nombre de la tienda en el mensaje
- No exceder límites diarios configurados

---

## 📞 Soporte

Para dudas o problemas:
- Documentación interna: Este archivo
- Issues: GitHub del proyecto
- Email: soporte@qronnect.com

---

**¡Sistema SMS Híbrido implementado correctamente! 🎉**
