# 👥 Sistema de Usuarios de Tienda

## 📋 Descripción

Sistema completo para gestionar usuarios que tienen acceso al panel de administración de cada tienda. Incluye:

- **Dos roles**: `owner` (admin completo) y `comercial` (trabajador)
- **Autenticación por PIN** de 4-6 dígitos
- **2FA opcional por SMS** para mayor seguridad
- **Gestión completa desde el panel de superadmin**

---

## 🗄️ Estructura de Base de Datos

### Tabla: `usuarios_tienda`

```sql
CREATE TABLE usuarios_tienda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,

  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,

  pin_hash TEXT NOT NULL,  -- Hash bcrypt del PIN

  rol TEXT NOT NULL CHECK (rol IN ('owner', 'comercial')),

  sms_2fa_activo BOOLEAN DEFAULT FALSE,
  sms_2fa_telefono TEXT,

  activo BOOLEAN DEFAULT TRUE,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,

  metadata JSONB DEFAULT '{}'::jsonb,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (id_tienda, email)
);
```

### Tabla: `usuarios_tienda_2fa_codes`

```sql
CREATE TABLE usuarios_tienda_2fa_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID NOT NULL REFERENCES usuarios_tienda(id) ON DELETE CASCADE,

  codigo TEXT NOT NULL CHECK (LENGTH(codigo) = 6),
  telefono TEXT NOT NULL,

  usado BOOLEAN DEFAULT FALSE,
  expira_en TIMESTAMP WITH TIME ZONE NOT NULL,

  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 Instalación

### 1. Aplicar Migración SQL

**Opción A: Manualmente en Supabase SQL Editor**

1. Abre Supabase SQL Editor
2. Copia el contenido de `supabase/migrations/20251115000002_create_usuarios_tienda.sql`
3. Pega y ejecuta

**Opción B: Con el script TypeScript**

```bash
cd backend
npx ts-node apply-usuarios-tienda-migration.ts
```

### 2. Verificar Creación

```sql
-- Verificar tablas
SELECT tablename FROM pg_tables WHERE tablename LIKE 'usuarios_tienda%';

-- Resultado esperado:
-- usuarios_tienda
-- usuarios_tienda_2fa_codes
```

---

## 🎯 Roles y Permisos

### `owner` (Administrador)

- ✅ Acceso completo a todas las funciones
- ✅ Gestionar usuarios
- ✅ Configurar tienda
- ✅ Ver estadísticas completas
- ✅ Gestionar campañas SMS
- ✅ Configurar IA
- ✅ Todas las funciones futuras

### `comercial` (Trabajador)

- ✅ Registrar compras
- ✅ Ver clientes
- ✅ Escanear QR de clientes
- ❌ No puede gestionar usuarios
- ❌ No puede cambiar configuración de tienda
- ❌ Acceso limitado a estadísticas (solo las del día)

> **Nota**: Los permisos específicos se ajustarán en futuras implementaciones mediante guards y decoradores en el backend.

---

## 📡 API Endpoints

### Base URL
```
/api/superadmin/tiendas/:tiendaId/usuarios
```

### 1. Listar Usuarios

```http
GET /api/superadmin/tiendas/:tiendaId/usuarios
Authorization: Bearer {superadmin_token}
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "id_tienda": "uuid",
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "telefono": "+34612345678",
    "rol": "owner",
    "sms_2fa_activo": true,
    "sms_2fa_telefono": "+34612345678",
    "activo": true,
    "creado_en": "2025-01-15T10:00:00Z",
    "actualizado_en": "2025-01-15T10:00:00Z"
  }
]
```

> **Nota**: El campo `pin_hash` nunca se devuelve en la API.

### 2. Obtener Usuario

```http
GET /api/superadmin/tiendas/:tiendaId/usuarios/:id
Authorization: Bearer {superadmin_token}
```

### 3. Crear Usuario

```http
POST /api/superadmin/tiendas/:tiendaId/usuarios
Authorization: Bearer {superadmin_token}
Content-Type: application/json

{
  "nombre": "María González",
  "email": "maria@ejemplo.com",
  "telefono": "+34655667788",
  "pin": "123456",
  "rol": "comercial",
  "sms_2fa_activo": false,
  "activo": true
}
```

**Validaciones:**
- `nombre`: mínimo 2 caracteres
- `email`: formato válido de email
- `telefono`: opcional, formato internacional
- `pin`: **4-6 dígitos numéricos** (obligatorio)
- `rol`: `owner` o `comercial`
- `sms_2fa_activo`: si es `true`, `sms_2fa_telefono` es obligatorio

### 4. Actualizar Usuario

```http
PUT /api/superadmin/tiendas/:tiendaId/usuarios/:id
Authorization: Bearer {superadmin_token}
Content-Type: application/json

{
  "nombre": "María González López",
  "pin": "654321",
  "sms_2fa_activo": true,
  "sms_2fa_telefono": "+34655667788"
}
```

> **Nota**: Solo envía los campos que quieres actualizar. Si no envías `pin`, el actual no se modifica.

### 5. Eliminar Usuario

```http
DELETE /api/superadmin/tiendas/:tiendaId/usuarios/:id
Authorization: Bearer {superadmin_token}
```

---

## 🔐 Autenticación y Seguridad

### Hash de PIN

El PIN se hashea con **bcrypt** (10 rounds) antes de guardarse:

```typescript
import * as bcrypt from 'bcrypt';

// Al crear/actualizar
const pin_hash = await bcrypt.hash(pin, 10);

// Al verificar (en login)
const isValid = await bcrypt.compare(pinIngresado, pin_hash);
```

### 2FA (Autenticación en Dos Pasos)

Cuando `sms_2fa_activo = true`:

1. Usuario ingresa email y PIN
2. Si el PIN es correcto, se genera código de 6 dígitos
3. Se envía por SMS a `sms_2fa_telefono`
4. Usuario ingresa el código
5. Si el código es válido y no ha expirado (5 min), se otorga acceso

**Flujo de implementación futura:**

```typescript
// 1. Generar código
const codigo = Math.floor(100000 + Math.random() * 900000).toString();

// 2. Guardar en BD
await supabase.from('usuarios_tienda_2fa_codes').insert({
  id_usuario: usuario.id,
  codigo: codigo,
  telefono: usuario.sms_2fa_telefono,
  expira_en: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
});

// 3. Enviar SMS
await smsService.send(usuario.sms_2fa_telefono, `Tu código es: ${codigo}`);

// 4. Verificar código
const { data } = await supabase
  .from('usuarios_tienda_2fa_codes')
  .select('*')
  .eq('id_usuario', usuario.id)
  .eq('codigo', codigoIngresado)
  .eq('usado', false)
  .gt('expira_en', new Date())
  .single();

if (data) {
  // Marcar como usado
  await supabase
    .from('usuarios_tienda_2fa_codes')
    .update({ usado: true })
    .eq('id', data.id);

  // Conceder acceso
}
```

---

## 🎨 Panel de Superadmin

### Acceso

1. Abre el panel de superadmin
2. Ve a **Tiendas**
3. Selecciona una tienda
4. Ve al tab **"Usuarios"**

### Funciones Disponibles

✅ **Ver lista de usuarios** con rol, 2FA, y estado
✅ **Crear nuevo usuario** con formulario completo
✅ **Editar usuario** existente
✅ **Eliminar usuario** (con confirmación)
✅ **Activar/desactivar usuario** sin eliminarlo
✅ **Configurar 2FA** por usuario
✅ **Cambiar PIN** de cualquier usuario
✅ **Cambiar rol** (owner ↔ comercial)

### Vista Previa

```
┌─────────────────────────────────────────────────────┐
│ 👥 Usuarios de la Tienda        [+ Nuevo Usuario]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Usuario          Contacto        Rol       2FA     │
│ ────────────────────────────────────────────────── │
│ Juan Pérez       +34612345678    Owner     Activo  │
│ juan@ejemplo.com                  🛡️       ☎️      │
│                                                     │
│ María González   +34655667788    Comercial  -      │
│ maria@ejemplo.com                 🔰              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### Datos de Ejemplo

Si aplicaste la migración, se creó un usuario de ejemplo:

- **Tienda**: `lokeyokiera`
- **Email**: `admin@lokeyokiera.com`
- **PIN**: `1234`
- **Rol**: `owner`
- **2FA**: Desactivado

### Pruebas con curl

```bash
# 1. Login como superadmin (obtener token)
curl -X POST http://localhost:3001/api/superadmin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@qronnect.com","password":"admin123"}'

# Copiar el access_token de la respuesta

# 2. Listar usuarios de la tienda
curl http://localhost:3001/api/superadmin/tiendas/{TIENDA_ID}/usuarios \
  -H "Authorization: Bearer {TOKEN}"

# 3. Crear usuario
curl -X POST http://localhost:3001/api/superadmin/tiendas/{TIENDA_ID}/usuarios \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "email": "test@test.com",
    "pin": "1234",
    "rol": "comercial"
  }'
```

---

## 📚 Archivos del Sistema

### Backend

```
backend/
├── src/
│   └── usuarios-tienda/
│       ├── dto/
│       │   ├── create-usuario-tienda.dto.ts
│       │   └── update-usuario-tienda.dto.ts
│       ├── usuarios-tienda.controller.ts
│       ├── usuarios-tienda.service.ts
│       └── usuarios-tienda.module.ts
├── supabase/
│   └── migrations/
│       └── 20251115000002_create_usuarios_tienda.sql
└── apply-usuarios-tienda-migration.ts
```

### Frontend

```
QRs/
└── components/
    └── superadmin/
        └── UsuariosTiendaManager.tsx
```

---

## 🔮 Próximos Pasos

### Pendiente de Implementación

1. **Sistema de Login para Usuarios de Tienda**
   - Endpoint `/api/admin/auth/login`
   - Verificación de PIN
   - Generación de JWT específico para usuarios de tienda
   - Flujo 2FA completo

2. **Guards y Permisos**
   - `@Roles('owner')` decorator
   - `@Roles('owner', 'comercial')` decorator
   - Guard para verificar rol en cada endpoint

3. **Auditoría**
   - Registro de accesos
   - Log de cambios en usuarios
   - Alertas de intentos fallidos

4. **Panel de Admin (para usuarios owner/comercial)**
   - Dashboard diferente al de superadmin
   - Vistas limitadas según rol
   - Funciones específicas de cada tienda

---

## ❓ FAQ

### ¿Cuál es la diferencia entre superadmin y owner?

- **Superadmin**: Tiene acceso a TODAS las tiendas del sistema. Gestiona la plataforma completa.
- **Owner**: Admin de UNA tienda específica. Solo ve/gestiona su propia tienda.

### ¿Puedo tener múltiples owners en una tienda?

Sí, puedes crear tantos usuarios con rol `owner` como necesites.

### ¿Qué pasa si olvido mi PIN?

El superadmin puede resetear el PIN de cualquier usuario desde el panel de administración.

### ¿Es obligatorio activar 2FA?

No, el 2FA es opcional y se configura por usuario.

### ¿Los usuarios ven el panel de superadmin?

No. Los usuarios de tienda (owner/comercial) accederán a un panel diferente (pendiente de implementar) en `/admin/*`.

---

## ✅ Checklist de Implementación

- [x] Migración SQL creada
- [ ] **Migración aplicada en Supabase** (PENDIENTE - hazlo manualmente)
- [x] DTOs del backend
- [x] Servicio del backend
- [x] Controlador del backend
- [x] Módulo registrado en app.module.ts
- [x] Componente React de gestión
- [x] Integración en panel de superadmin
- [ ] Sistema de login para usuarios de tienda (próximo)
- [ ] Guards de autorización por rol (próximo)
- [ ] Panel de admin para owner/comercial (próximo)

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que la migración SQL se aplicó correctamente
2. Revisa los logs del backend (`npm run start:dev`)
3. Verifica que el módulo esté registrado en `app.module.ts`
4. Asegúrate de estar usando el token de superadmin correcto

---

¡El sistema de usuarios de tienda está listo! 🎉

Solo falta:
1. **Aplicar la migración SQL en Supabase**
2. **Implementar el sistema de login** para que los usuarios puedan acceder

Continúa con la documentación de **LOGIN_USUARIOS_TIENDA.md** (próximo archivo) para implementar el sistema de autenticación.
