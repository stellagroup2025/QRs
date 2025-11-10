# Qronnect Backend - NestJS + Supabase

Backend del sistema de fidelización Qronnect con códigos QR, construido con NestJS y Supabase.

## 🚀 Características

- **Autenticación**: Verificación de JWT de Supabase Auth
- **Sistema de puntos**: Acumulación automática de puntos por compras
- **Códigos QR únicos**: Generación y gestión de QR para clientes
- **Panel de administración**: Endpoints protegidos para gestión de tienda
- **API REST completa**: Documentada con Swagger
- **Type-safe**: TypeScript en todo el proyecto
- **Validación**: DTOs con class-validator
- **Seguridad**: Row Level Security (RLS) en Supabase

## 📋 Requisitos

- **Node.js** v18+
- **npm** o **pnpm**
- **Cuenta de Supabase** (gratuita en https://supabase.com)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
cd backend
npm install
```

### 2. Configurar Supabase

#### 2.1. Crear proyecto en Supabase

1. Ve a https://supabase.com
2. Crea un nuevo proyecto
3. Anota las credenciales (URL, anon key, service role key)

#### 2.2. Ejecutar el schema SQL

1. Ve al **SQL Editor** en Supabase
2. Copia el contenido de `database/schema.sql`
3. Ejecuta el script completo
4. Verifica que las tablas se crearon en **Table Editor**

### 3. Configurar variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Edita `.env` y configura:

```env
# Obtén estos valores desde tu proyecto de Supabase > Settings > API
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aquí
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aquí

# Configuración local
PORT=3000
FRONTEND_URL=http://localhost:5173

# ID de la tienda (ejecuta: SELECT id FROM tiendas LIMIT 1;)
DEFAULT_TIENDA_ID=00000000-0000-0000-0000-000000000001

# Factor de puntos (1 euro = 1 punto por defecto)
PUNTOS_POR_EURO=1
```

### 4. Iniciar el servidor

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

El servidor estará disponible en:
- **API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs

## 📚 Documentación de la API

Una vez iniciado el servidor, accede a la documentación interactiva en:

```
http://localhost:3000/api/docs
```

### Endpoints principales

#### **Clientes** (requiere autenticación)

- `GET /api/clientes/me` - Obtener datos del cliente actual
- `PUT /api/clientes/me` - Actualizar datos del cliente
- `GET /api/clientes/me/puntos` - Ver puntos y compras
- `GET /api/clientes/me/qr` - Obtener código QR

#### **Admin** (requiere autenticación + rol admin)

- `POST /api/admin/compras/registrar` - Registrar compra con QR
- `GET /api/admin/clientes` - Listar clientes de la tienda
- `GET /api/admin/compras` - Historial de compras
- `GET /api/admin/dashboard/resumen` - Métricas del dashboard

## 🔐 Autenticación

### Para clientes finales

1. El frontend hace login con Supabase Auth (Google/email)
2. Supabase devuelve un JWT
3. El frontend incluye el JWT en cada request:

```http
Authorization: Bearer <jwt_token>
```

### Para administradores

1. Mismo flujo de autenticación con Supabase Auth
2. El usuario debe tener un registro en la tabla `roles_tienda`
3. El backend verifica el rol automáticamente con `AdminGuard`

#### Crear un usuario admin

```sql
-- 1. El usuario debe hacer login primero con Supabase Auth
-- 2. Obtener su UUID de Supabase (auth.users.id)
-- 3. Insertar el rol:

INSERT INTO roles_tienda (supabase_user_id, id_tienda, rol, activo)
VALUES (
  'uuid-del-usuario-de-supabase',
  '00000000-0000-0000-0000-000000000001',
  'admin',
  true
);
```

## 🏗️ Arquitectura

```
src/
├── auth/                    # Módulo de autenticación
│   ├── guards/             # SupabaseAuthGuard, AdminGuard
│   └── decorators/         # @CurrentUser, @CurrentTienda
├── supabase/               # Integración con Supabase
│   └── supabase.service.ts # Cliente admin y anon
├── clientes/               # Gestión de clientes
├── qr/                     # Gestión de códigos QR
├── compras/                # Registro de compras
├── admin/                  # Panel de administración
└── tiendas/                # Gestión de tiendas
```

### Flujo de autenticación

```
1. Frontend → Supabase Auth (login)
2. Supabase → JWT token
3. Frontend → Backend (request con JWT en header)
4. Backend → SupabaseAuthGuard verifica JWT
5. Backend → @CurrentUser inyecta datos del usuario
6. Backend → Procesa request y devuelve respuesta
```

### Flujo de registro de compra

```
1. Staff escanea QR del cliente desde panel
2. POST /api/admin/compras/registrar { codigoQr, importe }
3. Backend busca cliente por código QR
4. Backend calcula puntos (importe × factor)
5. Backend registra compra en BD
6. Backend actualiza puntos_totales del cliente
7. Backend devuelve respuesta con nueva info
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Estructura de datos

### Cliente
```typescript
{
  id: string;
  supabase_user_id: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  puntos_totales: number;
  fecha_registro: string;
  ultima_visita?: string;
}
```

### Compra
```typescript
{
  id: string;
  id_cliente: string;
  id_tienda: string;
  fecha: string;
  importe: number;
  puntos_otorgados: number;
  notas?: string;
}
```

### QR Cliente
```typescript
{
  id: string;
  id_cliente: string;
  codigo: string; // 16 caracteres alfanuméricos
  activo: boolean;
  creado_en: string;
}
```

## 🔧 Configuración avanzada

### Modificar el factor de puntos

En `.env`:
```env
PUNTOS_POR_EURO=10  # 1 euro = 10 puntos
```

### Multi-tienda

Para soportar múltiples tiendas:

1. Crea más tiendas en la tabla `tiendas`
2. Asigna roles a usuarios para cada tienda en `roles_tienda`
3. El backend detectará automáticamente la tienda del admin en cada request

### Políticas RLS personalizadas

El schema SQL incluye políticas RLS básicas. Para personalizarlas:

```sql
-- Ejemplo: Permitir a clientes ver solo sus datos
CREATE POLICY "custom_policy_name"
  ON clientes
  FOR SELECT
  USING (supabase_user_id = auth.uid());
```

## 🚨 Solución de problemas

### Error: "Missing Supabase environment variables"

Verifica que `.env` esté configurado correctamente con las claves de Supabase.

### Error: "No tienes permisos de administrador"

El usuario necesita un registro en `roles_tienda`:

```sql
SELECT * FROM roles_tienda WHERE supabase_user_id = 'tu-uuid';
```

### Error: "Cliente no encontrado"

El usuario debe acceder primero a `GET /api/clientes/me` para crear su perfil.

### La vista `vista_dashboard_tienda` no funciona

Verifica que el SQL se ejecutó correctamente:

```sql
SELECT * FROM vista_dashboard_tienda;
```

## 📝 Licencia

MIT

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📞 Soporte

Para reportar bugs o solicitar features, abre un issue en el repositorio.
