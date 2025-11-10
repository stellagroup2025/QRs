# 🚀 Guía de Setup Rápido - Qronnect Backend

Esta guía te llevará paso a paso desde cero hasta tener el backend funcionando.

## ✅ Checklist de Setup

- [ ] Node.js v18+ instalado
- [ ] Cuenta de Supabase creada
- [ ] Proyecto de Supabase creado
- [ ] Base de datos configurada
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Servidor ejecutándose

---

## 📝 Paso 1: Instalar dependencias

```bash
cd backend
npm install
```

---

## 🗄️ Paso 2: Configurar Supabase

### 2.1. Crear proyecto

1. Ve a https://supabase.com
2. Click en "New Project"
3. Elige un nombre (ej: "qronnect-dev")
4. Elige una región cercana
5. Crea una contraseña para la base de datos (guárdala)
6. Click en "Create new project"
7. Espera 2-3 minutos a que se cree

### 2.2. Obtener credenciales

1. En tu proyecto, ve a **Settings** (⚙️) → **API**
2. Copia estos valores:
   - **URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ⚠️ (secreta)

### 2.3. Crear las tablas

1. En Supabase, ve a **SQL Editor**
2. Abre el archivo `backend/database/schema.sql`
3. Copia **todo** el contenido
4. Pégalo en el SQL Editor
5. Click en "Run" (▶️)
6. Verifica que no haya errores (debe aparecer "Success")

### 2.4. Verificar las tablas

1. Ve a **Table Editor**
2. Deberías ver las siguientes tablas:
   - `tiendas`
   - `clientes`
   - `qr_clientes`
   - `compras`
   - `promociones`
   - `canjes`
   - `roles_tienda`

---

## 🔐 Paso 3: Configurar variables de entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` con tus credenciales:
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=tu_anon_key_aquí
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aquí

   PORT=3000
   FRONTEND_URL=http://localhost:5173
   DEFAULT_TIENDA_ID=00000000-0000-0000-0000-000000000001
   PUNTOS_POR_EURO=1
   ```

3. Guarda el archivo

---

## 🎯 Paso 4: Ejecutar el servidor

```bash
npm run start:dev
```

Deberías ver:
```
🚀 Qronnect Backend is running!
📝 API: http://localhost:3000/api
📚 Swagger Docs: http://localhost:3000/api/docs
```

---

## 🧪 Paso 5: Probar la API

### Opción 1: Swagger UI (recomendado)

1. Abre http://localhost:3000/api/docs
2. Explora los endpoints
3. Click en "Try it out" para probar

### Opción 2: cURL

```bash
# Health check
curl http://localhost:3000/api

# Debería devolver:
# {"status":"ok","message":"Qronnect API is running",...}
```

---

## 👤 Paso 6: Crear un usuario de prueba

### 6.1. Crear usuario en Supabase Auth

Opción A: **Desde la UI de Supabase**

1. Ve a **Authentication** → **Users**
2. Click en "Add user"
3. Email: `test@ejemplo.com`
4. Password: `Test123456!`
5. Click "Create user"
6. Copia el **UUID** del usuario

Opción B: **Desde tu frontend**

Si ya tienes el frontend de React, simplemente regístrate desde ahí.

### 6.2. Crear rol de admin (OPCIONAL - solo para panel)

Si quieres acceder al panel de admin:

1. Ve a **SQL Editor** en Supabase
2. Ejecuta:
   ```sql
   INSERT INTO roles_tienda (supabase_user_id, id_tienda, rol, activo)
   VALUES (
     'uuid-del-usuario',  -- Reemplaza con el UUID copiado
     '00000000-0000-0000-0000-000000000001',
     'admin',
     true
   );
   ```

---

## 🔑 Paso 7: Obtener un JWT para probar

### Método 1: Desde el frontend

1. Haz login desde tu app de React
2. Supabase te devolverá un JWT
3. Úsalo en los headers de tus requests

### Método 2: Manualmente con cURL

```bash
# Login
curl -X POST 'https://xxxxx.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "Test123456!"
  }'

# Copia el "access_token" de la respuesta
```

---

## 🎉 Paso 8: Probar los endpoints

### Endpoint público (sin auth)

```bash
curl http://localhost:3000/api
```

### Endpoint de cliente (requiere auth)

```bash
# Reemplaza <JWT> con tu access_token
curl http://localhost:3000/api/clientes/me \
  -H "Authorization: Bearer <JWT>"
```

Si todo funciona, deberías recibir los datos del cliente (o se creará automáticamente).

---

## ✅ Verificación final

Si completaste todos los pasos, deberías poder:

- ✅ Ver el Swagger en http://localhost:3000/api/docs
- ✅ Hacer login y obtener un JWT
- ✅ Acceder a `GET /api/clientes/me`
- ✅ Obtener un QR en `GET /api/clientes/me/qr`
- ✅ (Si creaste rol admin) Acceder a `GET /api/admin/dashboard/resumen`

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

- Verifica que `.env` existe y está en la carpeta `backend/`
- Verifica que las variables están correctamente escritas (sin espacios)

### Error: "ECONNREFUSED localhost:3000"

- El servidor no está corriendo
- Ejecuta `npm run start:dev`

### Error: "relation 'clientes' does not exist"

- Las tablas no se crearon
- Ve al Paso 2.3 y ejecuta el SQL nuevamente

### Error 401: "No se proporcionó token de autenticación"

- Estás intentando acceder a un endpoint protegido sin JWT
- Haz login y obtén un access_token

### Error 403: "No tienes permisos de administrador"

- Tu usuario no tiene un rol en `roles_tienda`
- Ejecuta el SQL del Paso 6.2

---

## 📚 Próximos pasos

1. Integra el frontend de React
2. Personaliza el factor de puntos en `.env`
3. Crea más tiendas si necesitas multi-tenant
4. Implementa promociones personalizadas
5. Despliega a producción (Railway, Render, Fly.io)

---

## 🆘 ¿Necesitas ayuda?

- Revisa la [documentación completa](README.md)
- Revisa los logs de NestJS en la consola
- Revisa los logs de Supabase en el dashboard
- Abre un issue en el repositorio
