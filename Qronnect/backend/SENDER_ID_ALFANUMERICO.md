# 📱 Sender ID Alfanumérico - Guía Completa

## ¿Qué es el Sender ID Alfanumérico?

En lugar de que el SMS aparezca con un número de teléfono como remitente:
```
De: +34666123456
─────────────────
Gym FitZone: Hola María!
Tienes 50% descuento hoy.
```

Aparece con el **nombre de tu marca**:
```
De: GYMFITZONE
─────────────────
Hola María! Tienes
50% descuento hoy.
```

---

## ✅ Ventajas

| Ventaja | Descripción |
|---------|-------------|
| 🎯 **Reconocimiento Inmediato** | El cliente sabe quién envía el SMS |
| 💼 **Más Profesional** | Imagen de marca superior |
| 💰 **Ahorro de Caracteres** | No necesitas poner el nombre en el mensaje |
| 📊 **Mayor Tasa de Apertura** | Los clientes confían más en nombres conocidos |
| 🚫 **Menos Spam** | Menos probabilidad de ser marcado como spam |

---

## ❌ Desventajas

| Desventaja | Impacto |
|------------|---------|
| 📵 **No Permite Respuestas** | Es unidireccional (no puedes recibir SMS) |
| 🌍 **Limitado por País** | No funciona en USA, Canadá |
| 📝 **Máximo 11 Caracteres** | Nombre debe ser corto |
| ⚠️ **Sin Verificación Local** | Cualquiera puede usar cualquier nombre |

---

## 🌍 Disponibilidad por País

### ✅ Funciona Perfectamente (Sin Registro)

| País | Sender ID | Notas |
|------|-----------|-------|
| 🇪🇸 **España** | ✅ SÍ | Perfecto, sin registro |
| 🇬🇧 Reino Unido | ✅ Sí | Sin registro |
| 🇫🇷 Francia | ✅ Sí | Sin registro |
| 🇩🇪 Alemania | ✅ Sí | Sin registro |
| 🇮🇹 Italia | ✅ Sí | Sin registro |
| 🇵🇹 Portugal | ✅ Sí | Sin registro |
| 🇳🇱 Países Bajos | ✅ Sí | Sin registro |
| 🇧🇪 Bélgica | ✅ Sí | Sin registro |
| 🇦🇷 Argentina | ✅ Sí | Sin registro |
| 🇨🇴 Colombia | ✅ Sí | Sin registro |
| 🇨🇱 Chile | ✅ Sí | Sin registro |
| 🇵🇪 Perú | ✅ Sí | Sin registro |

### ⚠️ Requiere Registro Previo

| País | Sender ID | Proceso |
|------|-----------|---------|
| 🇮🇳 India | ⚠️ Con registro | Proceso de 1-2 semanas |
| 🇸🇦 Arabia Saudita | ⚠️ Con registro | Requiere aprobación gubernamental |
| 🇦🇪 Emiratos Árabes | ⚠️ Con registro | Proceso regulado |
| 🇲🇽 México | ⚠️ Con registro | Registro ante IFT |

### ❌ No Soportado

| País | Alternativa |
|------|-------------|
| 🇺🇸 **USA** | Debe usar número corto (Short Code) o Toll-Free |
| 🇨🇦 **Canadá** | Debe usar número corto (Short Code) |

---

## 🔧 Configuración

### Opción A: Modo Propio con Sender ID

```bash
PUT /api/superadmin/tiendas/{tiendaId}/sms
Content-Type: application/json

{
  "activo": true,
  "modo": "propio",
  "credenciales": {
    "account_sid": "AC1234567890abcdef...",
    "auth_token": "tu_auth_token_secreto",
    "sender_id": "GYMFITZONE"  // ⬅️ Usar Sender ID alfanumérico
  },
  "limites": {
    "max_por_dia": 500,
    "max_por_mes": 10000
  }
}
```

**Resultado del SMS:**
```
De: GYMFITZONE
─────────────────
Hola María! 50% descuento
hoy. Código: GYM50
```

### Opción B: Modo Propio con Número + Sender ID Opcional

```bash
PUT /api/superadmin/tiendas/{tiendaId}/sms

{
  "activo": true,
  "modo": "propio",
  "credenciales": {
    "account_sid": "AC1234567890abcdef...",
    "auth_token": "tu_auth_token_secreto",
    "phone_number": "+34666123456",  // Para países que NO soportan Sender ID
    "sender_id": "GYMFITZONE"        // Para países que SÍ soportan
  }
}
```

**El sistema usará automáticamente:**
- `sender_id` si está disponible (prioridad)
- `phone_number` como fallback

### Opción C: Modo Global con Sender ID por Tienda

```bash
PUT /api/superadmin/tiendas/{tiendaId}/sms

{
  "activo": true,
  "modo": "global",  // Usa tu cuenta Twilio central
  "sender_id": "GYMFITZONE",  // Sender ID específico de esta tienda
  "creditos_disponibles": 500
}
```

---

## 📏 Reglas del Sender ID

### ✅ Permitido

| Regla | Ejemplo | Válido |
|-------|---------|--------|
| Máximo 11 caracteres | `GYMFITZONE` | ✅ (11 chars) |
| Solo letras A-Z | `CAFEAROMA` | ✅ |
| Números permitidos | `GYM24H` | ✅ |
| Sin espacios | `GYMFIT` | ✅ |

### ❌ No Permitido

| Regla | Ejemplo | Error |
|-------|---------|-------|
| Más de 11 caracteres | `GYMFITNESSZONE` | ❌ (15 chars) |
| Espacios | `GYM FITNESS` | ❌ |
| Caracteres especiales | `GYM@FIT` | ❌ |
| Solo números | `123456` | ❌ |
| Minúsculas (se convierten) | `gymfit` → `GYMFIT` | ⚠️ |

---

## 🎨 Mejores Prácticas

### ✅ Hacer

```
✅ GYMFITZONE    # Claro, identifica la marca
✅ CAFEAROMA     # Nombre del negocio
✅ BELLASALON    # Reconocible
✅ SUPERMKT      # Abreviatura clara
✅ INFO2025      # Con número si es necesario
```

### ❌ Evitar

```
❌ INFO          # Demasiado genérico
❌ SMS           # No identifica tu marca
❌ PROMO         # Parece spam
❌ OFERTAS       # No personal
❌ 12345         # Solo números
```

---

## 💡 Ejemplos Reales

### Ejemplo 1: Gimnasio

**Sin Sender ID:**
```
De: +34666123456
─────────────────
Gym FitZone: Hola María!
Recuerda tu clase de yoga
mañana a las 10:00.
```
**Caracteres usados:** 72

**Con Sender ID:**
```
De: GYMFITZONE
─────────────────
Hola María! Recuerda tu
clase de yoga mañana a
las 10:00.
```
**Caracteres usados:** 58
**Ahorro:** 14 caracteres ≈ 9%

---

### Ejemplo 2: Café

**Sin Sender ID:**
```
De: +34666777888
─────────────────
Café Aroma: Tu café favorito
te espera. 2x1 en cappuccinos
hasta las 12h.
```
**Caracteres:** 82

**Con Sender ID:**
```
De: CAFEAROMA
─────────────────
Tu café favorito te espera.
2x1 en cappuccinos hasta
las 12h.
```
**Caracteres:** 70
**Ahorro:** 12 caracteres ≈ 15%

---

### Ejemplo 3: Salón de Belleza

**Sin Sender ID:**
```
De: +34611222333
─────────────────
Salón Bella: Ana, recordatorio
de cita mañana 15:00h.
Confirma respondiendo SÍ.
```
**Caracteres:** 79
⚠️ Cliente NO puede responder desde número estándar

**Con Sender ID:**
```
De: BELLASALON
─────────────────
Ana, recordatorio de cita
mañana 15:00h. Para confirmar
llama al 666123456.
```
**Caracteres:** 80
✅ Instrucción clara de cómo confirmar

---

## 🔄 Comparación: Número vs Sender ID

| Aspecto | Número (+34666...) | Sender ID (MARCA) |
|---------|-------------------|-------------------|
| **Reconocimiento** | ⚠️ Bajo | ✅ Alto |
| **Respuestas** | ✅ Sí | ❌ No |
| **Coste** | 💰 1€/mes + SMS | 💰 Solo SMS |
| **Caracteres** | ⚠️ Usa espacio | ✅ Ahorra espacio |
| **Profesionalismo** | ⚠️ Medio | ✅ Alto |
| **Disponibilidad** | 🌍 Global | 🌍 Excepto USA/Canadá |
| **Setup** | ⏱️ Comprar número | ⏱️ Instant |
| **Spam Score** | ⚠️ Medio | ✅ Bajo |

---

## 🧪 Cómo Probar

### 1. Configurar Sender ID

```bash
PUT /api/superadmin/tiendas/{tiendaId}/sms
{
  "activo": true,
  "modo": "propio",
  "credenciales": {
    "account_sid": "AC...",
    "auth_token": "xxx",
    "sender_id": "GYMFITZONE"
  }
}
```

### 2. Enviar SMS de Prueba

```bash
POST /api/superadmin/tiendas/{tiendaId}/sms/test
{
  "telefono_test": "+34666123456"
}
```

### 3. Crear Campaña Real

```bash
POST /api/campanas-sms
{
  "nombre": "Test Sender ID",
  "mensaje": "Hola {{nombre}}! Este es un test de Sender ID.",
  "estado": "enviada",
  "destinatarios_ids": ["uuid-cliente-test"]
}
```

---

## 🚨 Troubleshooting

### Problema: El SMS llega con número en lugar de Sender ID

**Posibles causas:**

1. **País no soporta Sender ID**
   ```
   Solución: Verificar tabla de países arriba
   ```

2. **Sender ID mal configurado**
   ```bash
   # Verificar configuración
   GET /api/superadmin/tiendas/{id}/sms

   # Debe mostrar:
   {
     "credenciales_configuradas": {
       "sender_id": "GYMFITZONE"  // ✅ Correcto
     }
   }
   ```

3. **Operadora del destinatario bloquea Sender ID**
   ```
   Algunos operadores móviles filtran Sender IDs
   Poco común en España, más en otros países
   ```

---

### Problema: Error "Invalid sender ID"

**Solución:**
```bash
# Verificar reglas:
✅ Máximo 11 caracteres
✅ Solo A-Z y 0-9
✅ Al menos 1 letra
✅ Sin espacios ni caracteres especiales

# Ejemplos correctos:
GYMFIT      ✅
GYM24H      ✅
CAFEAROMA   ✅

# Ejemplos incorrectos:
GYM FITNESS  ❌ (tiene espacio)
123456       ❌ (solo números)
GYMFITCENTER ❌ (12 caracteres)
```

---

### Problema: Cliente reporta que no puede responder

**Explicación:**
```
Esto es NORMAL con Sender ID alfanumérico.

Los Sender IDs son UNIDIRECCIONALES:
- Puedes ENVIAR SMS
- Cliente NO puede RESPONDER

Si necesitas respuestas:
- Usa número de teléfono tradicional
- O incluye en el mensaje: "Responde al 666-123-456"
```

---

## 📊 Cuándo Usar Cada Opción

### Usa **Sender ID Alfanumérico** si:

- ✅ Tus clientes están en España/Europa
- ✅ Quieres máximo branding
- ✅ No necesitas respuestas SMS
- ✅ Envías promociones unidireccionales
- ✅ Quieres ahorrar caracteres

**Casos de uso ideales:**
- Promociones y ofertas
- Recordatorios de citas
- Notificaciones informativas
- Felicitaciones de cumpleaños
- Programas de fidelización

---

### Usa **Número de Teléfono** si:

- ✅ Necesitas recibir respuestas
- ✅ Tus clientes están en USA/Canadá
- ✅ Quieres comunicación bidireccional
- ✅ Servicio de atención al cliente por SMS

**Casos de uso ideales:**
- Confirmación de citas (responder SÍ/NO)
- Soporte al cliente
- Encuestas por SMS
- Verificación de códigos OTP

---

## 💰 Coste

| Aspecto | Número | Sender ID |
|---------|--------|-----------|
| **Setup** | 1€/mes | GRATIS |
| **SMS España** | 0.075€ | 0.075€ |
| **Registro** | NO | NO |
| **Mantenimiento** | 1€/mes | GRATIS |

**💡 Ahorro:** Con Sender ID ahorras **1€/mes** por tienda (el número de teléfono)

---

## 🎯 Recomendación Final

Para Qronnect en España, **recomiendo usar Sender ID alfanumérico** porque:

1. ✅ España lo soporta perfectamente
2. ✅ Mayor profesionalismo
3. ✅ Ahorro de 1€/mes por tienda
4. ✅ Mejor reconocimiento de marca
5. ✅ Menos caracteres = más contenido

**Configuración recomendada:**
```json
{
  "modo": "propio",
  "credenciales": {
    "account_sid": "AC...",
    "auth_token": "xxx",
    "sender_id": "QRONNECT"  // o nombre de cada tienda
  }
}
```

---

## 📚 Recursos Adicionales

- **Twilio Docs:** https://www.twilio.com/docs/sms/send-messages#use-an-alphanumeric-sender-id
- **Países soportados:** https://support.twilio.com/hc/en-us/articles/223133767-International-support-for-Alphanumeric-Sender-ID
- **Mejores prácticas:** https://www.twilio.com/docs/sms/tutorials/how-to-send-sms-messages

---

**¡Sender ID Alfanumérico ahora soportado en Qronnect! 🎉**
