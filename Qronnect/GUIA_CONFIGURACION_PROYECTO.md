0# 🚀 Guía de Configuración del Proyecto Qronnect

Esta guía te ayudará a configurar, compilar y ejecutar el proyecto Qronnect desde cero.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación Inicial](#instalación-inicial)
3. [Configuración de Base de Datos (Supabase)](#configuración-de-base-de-datos-supabase)
4. [Configuración de Tenants (Tiendas)](#configuración-de-tenants-tiendas)
5. [Variables de Entorno](#variables-de-entorno)
6. [Compilación y Ejecución](#compilación-y-ejecución)
7. [Verificación del Sistema](#verificación-del-sistema)
8. [Solución de Problemas](#solución-de-problemas)

---

## 📦 Requisitos Previos

Asegúrate de tener instalado:

- **Node.js**: versión 18.x o superior (recomendado: 20.x)
- **npm**: versión 9.x o superior
- **Git**: para clonar el repositorio
- **PostgreSQL**: 14+ (o cuenta de Supabase)

Para verificar las versiones:

```bash
node --version    # Debe ser v18.x o superior
npm --version     # Debe ser v9.x o superior
git --version
```

---

## 🔧 Instalación Inicial

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Qronnect
```

### 2. Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar Dependencias del Frontend

```bash
cd ../QRs
npm install --legacy-peer-deps
```

> **Nota**: Usamos `--legacy-peer-deps` porque algunas dependencias tienen conflictos de versiones que son seguros ignorar.

---

## 🗄️ Configuración de Base de Datos (Supabase)

### Opción A: Usar Supabase Cloud (Recomendado)

1. **Crear cuenta en Supabase**
   - Ve a [https://supabase.com](https://supabase.com)
   - Crea una cuenta gratuita
   - Crea un nuevo proyecto

2. **Obtener credenciales**
   - En tu proyecto, ve a **Settings → Database**
   - Anota estos valores:
     - **Host**: `db.xxxxx.supabase.co`
     - **Database**: `postgres`
     - **Port**: `5432`
     - **User**: `postgres`
     - **Password**: (la que configuraste)
   - Ve a **Settings → API**
   - Anota:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon/public key**: (clave pública)
     - **service_role key**: (clave privada - ¡no compartir!)

### Opción B: Usar Supabase Local

```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar Supabase local
cd backend
supabase start
```

Anota las credenciales que aparecen en la terminal.

### 3. Aplicar Migraciones de Base de Datos

Hay **varias migraciones** que deben aplicarse en orden. Ve a Supabase SQL Editor y ejecuta estos archivos en orden:

```bash
backend/supabase/migrations/
├── 00000_create_exec_function.sql          # ← 1. Primero
├── 20251112201419_add_genero_to_clientes.sql
├── 20251113000001_create_sms_system.sql
├── 20251114000001_extend_campanas_sms.sql
├── 20251114000002_sistema_regalos_bienvenida.sql
├── 20251114000003_sistema_referidos.sql
├── 20251114000004_config_ia_extensa.sql
├── 20251114000005_limites_api_keys_ia.sql
├── 20251115000001_create_landing_config.sql
├── 20251115000002_create_usuarios_tienda.sql
└── 20251115000003_fix_usuarios_tienda_rls.sql  # ← Último
```

**Cómo aplicar las migraciones:**

1. Ve a tu proyecto Supabase → **SQL Editor**
2. Copia el contenido de cada archivo `.sql` en orden
3. Pégalo en el editor
4. Haz clic en **RUN** para ejecutar
5. Verifica que no haya errores
6. Repite con el siguiente archivo

**O ejecuta todo con un script:**

```bash
cd backend
npx ts-node apply-all-roadmap-migrations.ts
```

---

## 🏪 Configuración de Tenants (Tiendas)

El sistema es **multi-tenant**, lo que significa que cada tienda es independiente.

### ¿Qué es un Tenant?

Un **tenant** es una tienda con su propia base de datos lógica, configuración, clientes y datos. Todas las tiendas comparten la misma base de datos física, pero los datos están aislados por `id_tienda`.

### Crear tu Primera Tienda

#### Opción 1: Desde Supabase SQL Editor (Manual)

```sql
-- 1. Insertar la tienda en la tabla 'tiendas'
INSERT INTO tiendas (
  nombre,
  slug,
  dominio,
  color_primario,
  color_secundario,
  activo
) VALUES (
  'Mi Tienda',              -- Nombre de la tienda
  'mitienda',               -- Slug (usado en URLs)
  'mitienda',               -- Dominio (para identificar tenant)
  '#FF6B6B',                -- Color primario (hexadecimal)
  '#4ECDC4',                -- Color secundario
  true                       -- Activo
) RETURNING id;

-- Anota el ID que se devuelve, lo necesitarás
```

#### Opción 2: Desde el Panel de Superadmin (Recomendado)

1. Primero crea un superadmin (ver siguiente sección)
2. Ve a `http://localhost:3000/superadmin/tiendas`
3. Haz clic en **"+ Nueva Tienda"**
4. Completa el formulario
5. La tienda se creará automáticamente

### Crear Usuario Superadmin

El superadmin tiene acceso a **todas las tiendas** del sistema.

**Ejecuta en Supabase SQL Editor:**

```sql
-- Crear la tabla de superadmins si no existe
CREATE TABLE IF NOT EXISTS superadmin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desactivar RLS para que el superadmin tenga acceso completo
ALTER TABLE superadmin_users DISABLE ROW LEVEL SECURITY;

-- Insertar tu email de superadmin
INSERT INTO superadmin_users (email)
VALUES ('tumail@ejemplo.com')
ON CONFLICT (email) DO NOTHING;
```

### Entender el Sistema de Dominios

El sistema identifica qué tienda usar mediante:

1. **Header `X-Tenant-Domain`**: El backend lee este header
2. **Dominio en la URL**: Para producción

**Ejemplo de cómo funciona:**

```bash
# El frontend envía esto:
curl http://localhost:3001/api/clientes \
  -H "X-Tenant-Domain: mitienda"

# El backend automáticamente:
# 1. Lee el header X-Tenant-Domain
# 2. Busca la tienda con dominio='mitienda'
# 3. Filtra todos los datos por id_tienda de esa tienda
```

**En el frontend (`QRs/`)**:

El frontend lee la URL y envía el tenant apropiado:

```
http://localhost:3000/mitienda → X-Tenant-Domain: mitienda
http://localhost:3000/stylecut → X-Tenant-Domain: stylecut
```

### Verificar que tu Tenant Funciona

```bash
# 1. Login como superadmin (obtener token)
curl -X POST http://localhost:3001/api/superadmin/auth/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"tumail@ejemplo.com"}'

# Revisa tu email, copia el código

curl -X POST http://localhost:3001/api/superadmin/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"tumail@ejemplo.com","codigo":"123456"}'

# Copia el access_token de la respuesta

# 2. Listar tiendas
curl http://localhost:3001/api/superadmin/tiendas \
  -H "Authorization: Bearer TU_TOKEN"

# Deberías ver tu tienda en la lista
```

---

## 🔐 Variables de Entorno

### Backend (`backend/.env`)

Crea un archivo `.env` en la carpeta `backend/`:

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Base de datos (para migraciones)
SUPABASE_DB_PASSWORD=tu_password_postgres
SUPABASE_HOST=db.xxxxx.supabase.co
SUPABASE_PORT=5432

# JWT Secret
JWT_SECRET=cambia_esto_por_algo_super_secreto_y_aleatorio

# Email (Resend - opcional)
RESEND_API_KEY=re_xxxxxxxxx

# Google Gemini IA (opcional)
GEMINI_API_KEY=tu_api_key_de_google

# Twilio SMS (opcional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_token
TWILIO_PHONE_NUMBER=+1234567890

# Puerto
PORT=3001
```

### Frontend (`QRs/.env.local`)

Crea un archivo `.env.local` en la carpeta `QRs/`:

```bash
# URL del backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase (para autenticación del cliente)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

---

## ▶️ Compilación y Ejecución

### Desarrollo (Recomendado para empezar)

**Terminal 1 - Backend:**

```bash
cd backend
npm run start:dev
```

Espera a ver:
```
🚀 Qronnect Backend is running!
📝 API: http://localhost:3001/api
```

**Terminal 2 - Frontend:**

```bash
cd QRs
npm run dev
```

Espera a ver:
```
▲ Next.js 15.x
- Local:        http://localhost:3000
```

### Producción

**Backend:**

```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**

```bash
cd QRs
npm run build
npm start
```

---

## ✅ Verificación del Sistema

### 1. Verificar Backend

```bash
# Debe devolver: {"message":"Qronnect API is running"}
curl http://localhost:3001/api
```

### 2. Verificar Tenant

```bash
# Reemplaza 'mitienda' con tu dominio de tienda
curl http://localhost:3001/api/config/branding \
  -H "X-Tenant-Domain: mitienda"

# Debe devolver la configuración de tu tienda
```

### 3. Verificar Frontend

1. Ve a `http://localhost:3000`
2. Deberías ver la página de inicio
3. Ve a `http://localhost:3000/superadmin/login`
4. Deberías ver el login de superadmin

### 4. Verificar Superadmin

1. Ve a `http://localhost:3000/superadmin/login`
2. Ingresa tu email de superadmin
3. Verifica el código en tu email
4. Deberías ver el dashboard con tu tienda

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

**Solución:**
- Verifica que las credenciales en `.env` sean correctas
- Verifica que Supabase esté activo
- Si usas Supabase local: `supabase start`

### Error: "Tenant not found"

**Solución:**
- Verifica que la tienda existe: `SELECT * FROM tiendas;`
- Verifica que el campo `dominio` coincide con el header `X-Tenant-Domain`
- Verifica que `activo = true`

### Error: "Port 3001 is already in use"

**Solución:**
```bash
# En Linux/Mac:
lsof -ti:3001 | xargs kill -9

# En Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Error: "Module not found"

**Solución:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd QRs
rm -rf node_modules package-lock.json .next
npm install --legacy-peer-deps
```

### Error: "RLS policy violation"

**Solución:**
```sql
-- Desactivar RLS en todas las tablas del sistema
ALTER TABLE tiendas DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE compras DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_tienda DISABLE ROW LEVEL SECURITY;
-- etc.
```

### Backend no recompila cambios

**Solución:**
```bash
cd backend
rm -rf dist
npm run start:dev
```

### Frontend muestra error 500

**Solución:**
- Verifica que el backend esté corriendo
- Verifica la URL en `NEXT_PUBLIC_API_URL`
- Revisa los logs del backend para ver el error exacto

---

## 📚 Recursos Adicionales

- **Documentación de APIs**: Ver `backend/API_REFERENCE.md`
- **Sistema Multi-tenant**: Ver `backend/MULTITENANCY.md`
- **Sistema de Usuarios**: Ver `backend/USUARIOS_TIENDA.md`
- **Superadmin**: Ver `backend/SUPERADMIN.md`
- **SMS Sistema**: Ver `backend/SISTEMA_SMS_HIBRIDO.md`

---

## 🎯 Checklist de Configuración Completa

Usa esta lista para verificar que todo está configurado:

- [ ] Node.js 18+ instalado
- [ ] Repositorio clonado
- [ ] Dependencias backend instaladas (`npm install`)
- [ ] Dependencias frontend instaladas (`npm install --legacy-peer-deps`)
- [ ] Cuenta/proyecto Supabase creado
- [ ] Todas las migraciones SQL aplicadas
- [ ] Archivo `backend/.env` creado con credenciales
- [ ] Archivo `QRs/.env.local` creado
- [ ] Superadmin creado en la base de datos
- [ ] Al menos una tienda creada
- [ ] Backend corriendo y respondiendo en `http://localhost:3001/api`
- [ ] Frontend corriendo en `http://localhost:3000`
- [ ] Login de superadmin funciona
- [ ] Panel de superadmin muestra las tiendas

---

## 🤝 Contacto y Soporte

Si tienes problemas:

1. Revisa esta guía completa
2. Revisa los logs del backend para errores específicos
3. Verifica las variables de entorno
4. Consulta con el equipo de desarrollo

---

**¡Listo!** 🎉

Ahora tienes todo configurado y funcionando. Puedes empezar a:
- Crear más tiendas desde el panel de superadmin
- Configurar usuarios para cada tienda
- Personalizar branding
- Agregar clientes y promociones

