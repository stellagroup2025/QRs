# 🎛️ Configuración de Modo SMS - Implementación Completa

## 📋 Resumen

Se ha implementado la **configuración completa del modo SMS híbrido** para el panel de SuperAdmin, permitiendo elegir entre **Modo Global** (cuenta Qronnect) y **Modo Propio** (cuenta Twilio del tenant).

---

## 🎯 Componentes Implementados

### 1. **Formulario Completo de SMS**: `SMSConfigForm.tsx`

**Ubicación**: `QRs/components/superadmin/SMSConfigForm.tsx`

**Características**:
- ✅ Switch para activar/desactivar SMS
- ✅ Selector de modo (Global/Propio) con tabs
- ✅ Configuración específica por modo
- ✅ Botón de prueba de envío
- ✅ Validaciones completas
- ✅ Mensajes de éxito/error

---

## 🌍 Modo Global (Cuenta Qronnect)

### Configuración

```typescript
{
  activo: true,
  modo: 'global',
  creditos_disponibles: 1000,
  limites: {
    max_por_dia: 100,
    max_por_mes: 2000
  }
}
```

### Campos del Formulario

| Campo                  | Descripción                           | Ejemplo |
|------------------------|---------------------------------------|---------|
| Créditos Disponibles   | SMS que puede enviar la tienda        | 1000    |
| Límite Diario          | Máximo SMS por día                    | 100     |
| Límite Mensual         | Máximo SMS por mes                    | 2000    |

### Ventajas

- 🔹 **Sin configuración técnica**: No necesita credenciales de Twilio
- 🔹 **Control centralizado**: Qronnect gestiona el proveedor
- 🔹 **Créditos prepagados**: Sistema de prepago simple
- 🔹 **Límites de protección**: Evita gastos excesivos

### Ideal para:
- Pequeños negocios sin conocimientos técnicos
- Clientes del plan básico
- Pruebas y demos

---

## 🏢 Modo Propio (Cuenta Twilio del Tenant)

### Configuración

```typescript
{
  activo: true,
  modo: 'propio',
  credenciales: {
    account_sid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    auth_token: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    phone_number: '+34666123456',
    sender_id: 'GYMFITZONE' // Opcional
  }
}
```

### Campos del Formulario

| Campo           | Descripción                                 | Ejemplo                                  |
|-----------------|---------------------------------------------|------------------------------------------|
| Account SID     | Identificador de cuenta Twilio              | ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx       |
| Auth Token      | Token de autenticación (oculto)             | ••••••••••••••••                         |
| Phone Number    | Número de teléfono Twilio (formato E.164)   | +34666123456                             |

### Ventajas

- 🔹 **SMS ilimitados**: Sin límites de Qronnect
- 🔹 **Facturación directa**: Pagan a Twilio directamente
- 🔹 **Números propios**: Pueden usar sus números verificados
- 🔹 **Control total**: Acceso a dashboard de Twilio

### Ideal para:
- Empresas grandes con volumen alto
- Clientes del plan Enterprise
- Negocios con infraestructura técnica propia

---

## 🎨 Interfaz de Usuario

### Vista del Formulario

```
┌─────────────────────────────────────────────────────────┐
│ 📱 Configuración de SMS                                 │
│ Configura el modo de envío de SMS para Gym FitZone     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ SMS Activo                           [ON]       │   │
│ │ Habilitar o deshabilitar el envío de SMS        │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Modo de Operación                                       │
│ ┌────────────────────┬────────────────────┐            │
│ │  🌍 Modo Global    │  🏢 Modo Propio   │            │
│ └────────────────────┴────────────────────┘            │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🌍 Modo Global: La tienda usa la cuenta de     │   │
│ │    Twilio de Qronnect. Los SMS se descontarán  │   │
│ │    de los créditos prepagados.                 │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 💳 Créditos Disponibles    📅 Límite Diario            │
│ ┌──────────┐               ┌──────────┐               │
│ │ 1000     │               │ 100      │               │
│ └──────────┘               └──────────┘               │
│ SMS que puede enviar       SMS por día                 │
│                                                         │
│ 📆 Límite Mensual                                      │
│ ┌──────────┐                                           │
│ │ 2000     │                                           │
│ └──────────┘                                           │
│ SMS por mes                                            │
│                                                         │
│                           [ Guardar Configuración ]     │
└─────────────────────────────────────────────────────────┘
```

### Modo Propio

```
┌─────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🏢 Modo Propio: La tienda usa su propia        │   │
│ │    cuenta de Twilio. Necesitas configurar      │   │
│ │    las credenciales.                           │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 🔑 Account SID                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx              │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ 🔑 Auth Token                                          │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ••••••••••••••••                                │   │
│ └─────────────────────────────────────────────────┘   │
│ Se almacena de forma segura. Ingresa solo si           │
│ quieres cambiarlo.                                     │
│                                                         │
│ 📞 Número de Teléfono Twilio                           │
│ ┌─────────────────────────────────────────────────┐   │
│ │ +34666123456                                    │   │
│ └─────────────────────────────────────────────────┘   │
│ Formato E.164 (+34666123456)                           │
│                                                         │
│                           [ Guardar Configuración ]     │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Tabla de Tiendas - Nueva Columna

### Vista Actualizada

```
┌──────────────┬─────────────┬──────────┬─────────────┬─────────────────┐
│ Tienda       │ Dominio     │ Plan     │ Modo SMS    │ Sender ID       │
├──────────────┼─────────────┼──────────┼─────────────┼─────────────────┤
│ Gym FitZone  │ gymfitzone  │ Pro      │ 🌍 Global   │ 📱 GYMFITZONE   │
│ Mi Tienda    │ mitienda    │ Basic    │ 🏢 Propio   │ 📱 MITIENDA     │
│ Café Central │ cafecenter  │ Free     │ ❌ Inactivo │ Sin configurar  │
└──────────────┴─────────────┴──────────┴─────────────┴─────────────────┘
```

**Badges de Modo**:
- 🌍 **Global** - Badge azul con icono Globe2
- 🏢 **Propio** - Badge morado con icono Building2
- ❌ **Inactivo** - Texto gris tenue

---

## 🔄 Flujo de Configuración

### Escenario 1: Cliente Nuevo (Plan Básico)

1. SuperAdmin va a `/superadmin/tiendas/[id]`
2. Tab "Configuración"
3. Configuración de SMS:
   - Activar SMS: **ON**
   - Modo: **Global** (por defecto)
   - Créditos: **500**
   - Límite diario: **50**
   - Límite mensual: **1000**
4. Guardar
5. Configurar Sender ID: **GYMFIT**
6. ✅ Listo para enviar SMS

### Escenario 2: Cliente Enterprise (Modo Propio)

1. SuperAdmin va a `/superadmin/tiendas/[id]`
2. Tab "Configuración"
3. Configuración de SMS:
   - Activar SMS: **ON**
   - Modo: **Propio**
   - Account SID: `AC123...`
   - Auth Token: `abcd123...`
   - Phone Number: `+34666123456`
4. Guardar
5. **Test de envío** (opcional)
6. Configurar Sender ID: **EMPRESA**
7. ✅ Listo para enviar SMS ilimitados

---

## 🧪 Prueba de Envío SMS

### Función de Test Integrada

Cuando la configuración está guardada, aparece:

```
┌─────────────────────────────────────────────────┐
│ 📤 Probar Envío de SMS                          │
│                                                 │
│ ┌─────────────────────────────┬─────────────┐  │
│ │ +34666123456                │ Enviar Test │  │
│ └─────────────────────────────┴─────────────┘  │
└─────────────────────────────────────────────────┘
```

**Endpoint usado**:
```
POST /api/superadmin/tiendas/:id/sms/test
{
  "telefono_test": "+34666123456"
}
```

---

## 🔐 Validaciones Implementadas

### Frontend

```typescript
// Modo Propio
if (modo === 'propio') {
  if (!accountSid || !phoneNumber) {
    throw new Error('Debes completar Account SID y Número de teléfono')
  }
  if (authToken === '*'.repeat(20)) {
    throw new Error('Debes ingresar el Auth Token de Twilio')
  }
}
```

### Backend

```typescript
// ConfigureSmsDto validations
@IsEnum(['global', 'propio'])
modo: 'global' | 'propio'

@ValidateNested()
@IsOptional()
credenciales?: TwilioCredencialesDto

@IsNumber()
@Min(0)
@IsOptional()
creditos_disponibles?: number
```

---

## 📡 Endpoints Utilizados

### GET - Obtener configuración SMS actual

```bash
GET /api/superadmin/tiendas/:id/sms
Authorization: Bearer {token}

# Respuesta
{
  "activo": true,
  "modo": "global",
  "configurado": true,
  "sender_id": "GYMFITZONE",
  "limites": {
    "max_por_dia": 100,
    "max_por_mes": 2000
  },
  "creditos_disponibles": 500
}
```

### PUT - Guardar configuración (Modo Global)

```bash
PUT /api/superadmin/tiendas/:id/sms
Authorization: Bearer {token}
Content-Type: application/json

{
  "activo": true,
  "modo": "global",
  "creditos_disponibles": 1000,
  "limites": {
    "max_por_dia": 100,
    "max_por_mes": 2000
  }
}
```

### PUT - Guardar configuración (Modo Propio)

```bash
PUT /api/superadmin/tiendas/:id/sms
Authorization: Bearer {token}
Content-Type: application/json

{
  "activo": true,
  "modo": "propio",
  "credenciales": {
    "account_sid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "auth_token": "your_auth_token",
    "phone_number": "+34666123456"
  }
}
```

### POST - Test de envío

```bash
POST /api/superadmin/tiendas/:id/sms/test
Authorization: Bearer {token}
Content-Type: application/json

{
  "telefono_test": "+34666123456"
}
```

---

## 🎯 Integración Completa

### Archivos Modificados/Creados

**Nuevos**:
- `QRs/components/superadmin/SMSConfigForm.tsx`

**Modificados**:
- `QRs/app/superadmin/tiendas/[id]/page.tsx` - Añadido componente
- `QRs/app/superadmin/tiendas/page.tsx` - Columna "Modo SMS"

### Orden de Componentes en Tab Configuración

1. **Configuración del Programa** (Puntos/Moneda)
2. **📱 Configuración de SMS** ← NUEVO (Modo + Credenciales)
3. **📱 Sender ID Alfanumérico** (Nombre para SMS)

---

## 🚀 Cómo Probar

### 1. Iniciar Frontend

```bash
cd QRs
npm run dev
```

### 2. Login como SuperAdmin

```
http://localhost:3000/superadmin/login
```

### 3. Configurar Modo Global

```bash
# Ir a detalle de tienda
http://localhost:3000/superadmin/tiendas/[ID]

# Tab "Configuración"
# Scroll hasta "Configuración de SMS"
# Activar SMS: ON
# Seleccionar: "Modo Global"
# Créditos: 1000
# Límite diario: 100
# Límite mensual: 2000
# Guardar

# ✅ Verificar en tabla que aparece badge "🌍 Global"
```

### 4. Configurar Modo Propio

```bash
# Tab "Configuración"
# Activar SMS: ON
# Seleccionar: "Modo Propio"
# Account SID: ACxxxxxx...
# Auth Token: tu_token
# Phone Number: +34666123456
# Guardar

# Test de envío (opcional):
# Ingresar número: +34666123456
# Click "Enviar Test"
# ✅ Verificar SMS recibido

# ✅ Verificar en tabla que aparece badge "🏢 Propio"
```

---

## 💡 Casos de Uso Reales

### Caso 1: Gym FitZone (Plan Professional)

**Configuración**:
- Modo: **Global**
- Créditos: **500 SMS/mes**
- Límite diario: **50**
- Sender ID: **GYMFITZONE**

**Uso**:
- Envía 30 SMS/día en promedio
- Campañas semanales de promociones
- No necesita gestionar Twilio

**Costo para Qronnect**: ~€25/mes (0.05€/SMS)

---

### Caso 2: Cadena de Perfumerías (Enterprise)

**Configuración**:
- Modo: **Propio**
- Credenciales: Propias de Twilio
- Sender ID: **PERFUMERIA**

**Uso**:
- Envía 10,000 SMS/mes
- Múltiples campañas diarias
- Necesita facturación directa

**Costo**: Lo pagan directamente a Twilio

---

## 🐛 Troubleshooting

### Error: "Debes completar Account SID y Número"

**Causa**: Modo propio sin credenciales
**Solución**: Rellenar todos los campos del modo propio

### Error: "Credenciales inválidas"

**Causa**: Account SID o Auth Token incorrectos
**Solución**: Verificar en dashboard de Twilio

### No aparece botón de Test

**Causa**: Configuración no guardada
**Solución**: Guardar primero la configuración

### Badge "Inactivo" en tabla

**Causa**: SMS desactivado
**Solución**: Activar switch "SMS Activo" en config

---

## 📊 Resumen de Estados

| Estado         | Modo SMS    | Sender ID | Badge en Tabla |
|----------------|-------------|-----------|----------------|
| Sin configurar | -           | -         | ❌ Inactivo    |
| Global activo  | Global      | Opcional  | 🌍 Global      |
| Propio activo  | Propio      | Opcional  | 🏢 Propio      |
| Desactivado    | Global/Prop | -         | ❌ Inactivo    |

---

## ✅ Checklist de Implementación

- [x] Componente `SMSConfigForm` completo
- [x] Switch activar/desactivar
- [x] Tabs Modo Global / Modo Propio
- [x] Configuración Modo Global (créditos + límites)
- [x] Configuración Modo Propio (credenciales Twilio)
- [x] Test de envío integrado
- [x] Validaciones frontend
- [x] Integración en página de detalle
- [x] Columna "Modo SMS" en tabla de tiendas
- [x] Badges visuales (Global/Propio/Inactivo)
- [x] Mensajes de éxito/error
- [x] Documentación completa

---

## 🎉 Resultado Final

El SuperAdmin ahora tiene **control total** sobre la configuración SMS de cada tenant:

1. ✅ Puede activar/desactivar SMS por tienda
2. ✅ Puede elegir entre Modo Global y Modo Propio
3. ✅ Puede configurar créditos y límites (Global)
4. ✅ Puede configurar credenciales Twilio (Propio)
5. ✅ Puede probar el envío de SMS
6. ✅ Ve el modo activo en la tabla de tiendas

**¡Sistema híbrido 100% funcional! 🚀**
