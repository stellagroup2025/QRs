# ⚡ SuperAdmin - Inicio Rápido

## ✅ Lo que se ha creado

1. ✅ **Base de datos completa** (`backend/database/superadmin-schema.sql`)
   - Tabla `superadmin_users`
   - Tabla `audit_log_superadmin`
   - Vistas y funciones SQL
   - Políticas RLS

2. ✅ **Backend NestJS completo** (`backend/src/superadmin/`)
   - Módulo SuperAdmin
   - Autenticación con SMS (doble factor)
   - Guard que bypasea multitenancy
   - 10 endpoints para gestión completa

3. ✅ **Endpoints disponibles**:
   - `POST /api/superadmin/auth/send-sms` - Enviar código
   - `POST /api/superadmin/auth/verify-sms` - Verificar código
   - `GET /api/superadmin/dashboard` - Métricas globales
   - `GET /api/superadmin/tiendas` - Listar tiendas
   - `POST /api/superadmin/tiendas` - Crear tienda
   - `GET /api/superadmin/tiendas/:id` - Ver tienda completa
   - `PUT /api/superadmin/tiendas/:id` - Editar tienda
   - `DELETE /api/superadmin/tiendas/:id` - Eliminar tienda
   - `GET /api/superadmin/tiendas/:tiendaId/clientes/:clienteId/qr` - Obtener QR
   - `GET /api/superadmin/audit-logs` - Logs de auditoría

4. ✅ **Backend corriendo** en http://localhost:3001

---

## 🚀 Pasos para Activarlo

### Paso 1: Ejecutar Schema SQL en Supabase

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: **ajyiuhujexwrjmjfycxh**
3. Ve a **SQL Editor**
4. Copia y pega todo el contenido de:
   ```
   backend/database/superadmin-schema.sql
   ```
5. Ejecuta (Run)

### Paso 2: Configurar Phone Auth (SMS) en Supabase

**Necesitas un proveedor de SMS. Recomendado: Twilio**

1. **Crear cuenta en Twilio**:
   - Ve a: https://www.twilio.com/try-twilio
   - Regístrate (es gratis para pruebas)
   - Obtén tu número de teléfono de prueba

2. **Obtener credenciales de Twilio**:
   - Account SID
   - Auth Token
   - Phone Number

3. **Configurar en Supabase**:
   - Dashboard → **Authentication** → **Providers**
   - Habilita **Phone**
   - Selecciona "Twilio" como proveedor
   - Pega tus credenciales:
     - Twilio Account SID
     - Twilio Auth Token
     - Twilio Message Service SID (opcional)
   - Guarda

### Paso 3: Crear tu Usuario SuperAdmin

**Desde el Dashboard de Supabase**:

1. Ve a **Authentication** → **Users**
2. Clic en **"Add user"**
3. Selecciona **"Phone"**
4. Ingresa: `+34630000356`
5. Supabase enviará un código SMS a tu teléfono
6. Verifica el código
7. **Copia el UUID del usuario** que aparece en la tabla

**Insertar en tabla superadmin_users**:

Ejecuta este SQL en Supabase SQL Editor (reemplaza `TU-UUID`):

```sql
INSERT INTO superadmin_users (supabase_user_id, nombre, telefono, activo)
VALUES (
  'TU-UUID-AQUI',  -- REEMPLAZAR con el UUID que copiaste
  'Omar',
  '+34630000356',
  TRUE
);
```

**Verificar**:
```sql
SELECT * FROM superadmin_users;
```

Deberías ver tu usuario.

---

## 🧪 Probar el Sistema

### 1. Usar Swagger (Más Fácil)

1. Abre: http://localhost:3001/api/docs
2. Busca la sección **"SuperAdmin"**
3. Prueba el endpoint **POST /api/superadmin/auth/send-sms**:
   ```json
   {
     "telefono": "+34630000356"
   }
   ```
4. Recibirás un SMS con el código
5. Prueba **POST /api/superadmin/auth/verify-sms**:
   ```json
   {
     "telefono": "+34630000356",
     "codigo": "123456"
   }
   ```
6. Copia el `access_token` de la respuesta
7. Haz clic en **"Authorize"** (arriba a la derecha en Swagger)
8. Pega el token
9. Ahora puedes probar todos los endpoints protegidos

### 2. Usar curl

```bash
# 1. Solicitar código SMS
curl -X POST http://localhost:3001/api/superadmin/auth/send-sms \
  -H "Content-Type: application/json" \
  -d '{"telefono": "+34630000356"}'

# Recibirás SMS con código

# 2. Verificar código
curl -X POST http://localhost:3001/api/superadmin/auth/verify-sms \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "+34630000356",
    "codigo": "CODIGO-DEL-SMS"
  }'

# Copia el access_token de la respuesta

# 3. Ver dashboard
curl -X GET http://localhost:3001/api/superadmin/dashboard \
  -H "Authorization: Bearer TU-ACCESS-TOKEN"

# 4. Listar tiendas
curl -X GET http://localhost:3001/api/superadmin/tiendas \
  -H "Authorization: Bearer TU-ACCESS-TOKEN"

# 5. Crear una nueva tienda
curl -X POST http://localhost:3001/api/superadmin/tiendas \
  -H "Authorization: Bearer TU-ACCESS-TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mi Nueva Tienda",
    "dominio": "mi-nueva-tienda",
    "plan": "profesional"
  }'
```

---

## 📋 Checklist de Configuración

- [ ] Schema SQL ejecutado en Supabase
- [ ] Twilio configurado en Supabase Phone Auth
- [ ] Usuario creado en Supabase Auth con tu teléfono
- [ ] Usuario insertado en tabla `superadmin_users`
- [ ] Código SMS recibido correctamente
- [ ] Token obtenido al verificar código
- [ ] Dashboard accesible con el token
- [ ] Tiendas listadas correctamente

---

## 🎯 Crear tu Primera Tienda desde SuperAdmin

Una vez que tengas el token:

```bash
curl -X POST http://localhost:3001/api/superadmin/tiendas \
  -H "Authorization: Bearer TU-TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Cafetería Demo",
    "dominio": "cafeteria-demo",
    "direccion": "Calle Ejemplo 123, Madrid",
    "telefono": "+34912000000",
    "email": "info@cafeteriademo.com",
    "plan": "profesional",
    "configuracion": {
      "puntos_por_euro": 1,
      "moneda": "EUR"
    }
  }'
```

Ahora puedes acceder a esa tienda desde:
- **API**: http://localhost:3001/api (con header `Host: cafeteria-demo.qronnect.com`)
- **Frontend**: http://localhost:3000 (cuando lo inicies)

---

## 📚 Documentación Completa

Ver: `backend/SUPERADMIN.md`

---

## 🆘 Problemas Comunes

### "No recibo el SMS"
- Verifica que Twilio está configurado
- Verifica que el número está en formato internacional (`+34...`)
- En modo de prueba de Twilio, solo puedes enviar SMS a números verificados

### "Número no autorizado"
- Asegúrate de que el número está en `superadmin_users`
- Verifica que `activo = TRUE`

### "Token inválido"
- Los tokens JWT tienen expiración
- Solicita un nuevo código y vuelve a autenticarte

---

¡Listo! Ahora tienes control total sobre todas las tiendas del sistema. 🎉
