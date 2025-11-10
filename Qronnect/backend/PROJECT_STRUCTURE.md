# 📁 Estructura del Proyecto - Qronnect Backend

```
backend/
│
├── 📁 database/                      # Scripts SQL
│   └── schema.sql                   # Schema completo de Supabase
│
├── 📁 src/                          # Código fuente
│   │
│   ├── 📁 auth/                     # Módulo de autenticación
│   │   ├── auth.module.ts
│   │   ├── 📁 guards/               # Guards de protección
│   │   │   ├── supabase-auth.guard.ts  # Verifica JWT
│   │   │   └── admin.guard.ts          # Verifica rol admin
│   │   ├── 📁 decorators/           # Decoradores personalizados
│   │   │   ├── current-user.decorator.ts    # @CurrentUser()
│   │   │   └── current-tienda.decorator.ts  # @CurrentTienda()
│   │   └── 📁 entities/
│   │       └── auth-user.entity.ts  # Interfaz de usuario autenticado
│   │
│   ├── 📁 supabase/                 # Integración con Supabase
│   │   ├── supabase.module.ts
│   │   └── supabase.service.ts      # Cliente admin y anon
│   │
│   ├── 📁 clientes/                 # Módulo de clientes
│   │   ├── clientes.module.ts
│   │   ├── clientes.controller.ts   # GET/PUT /clientes/me
│   │   ├── clientes.service.ts
│   │   ├── 📁 dto/
│   │   │   ├── update-cliente.dto.ts
│   │   │   ├── cliente-response.dto.ts
│   │   │   └── puntos-response.dto.ts
│   │   └── 📁 entities/
│   │       └── cliente.entity.ts
│   │
│   ├── 📁 qr/                       # Módulo de códigos QR
│   │   ├── qr.module.ts
│   │   ├── qr.controller.ts         # GET /clientes/me/qr
│   │   ├── qr.service.ts            # Generación de códigos únicos
│   │   ├── 📁 dto/
│   │   │   └── qr-response.dto.ts
│   │   └── 📁 entities/
│   │       └── qr-cliente.entity.ts
│   │
│   ├── 📁 compras/                  # Módulo de compras
│   │   ├── compras.module.ts
│   │   ├── compras.service.ts       # Lógica de registro de compras
│   │   ├── 📁 dto/
│   │   │   ├── registrar-compra.dto.ts
│   │   │   └── compra-response.dto.ts
│   │   └── 📁 entities/
│   │       └── compra.entity.ts
│   │
│   ├── 📁 admin/                    # Módulo de administración
│   │   ├── admin.module.ts
│   │   ├── admin.controller.ts      # POST /admin/compras/registrar
│   │   │                            # GET /admin/clientes
│   │   │                            # GET /admin/compras
│   │   │                            # GET /admin/dashboard/resumen
│   │   ├── admin.service.ts
│   │   └── 📁 dto/
│   │       └── dashboard-resumen.dto.ts
│   │
│   ├── 📁 tiendas/                  # Módulo de tiendas
│   │   ├── tiendas.module.ts
│   │   ├── tiendas.service.ts
│   │   └── 📁 entities/
│   │       └── tienda.entity.ts
│   │
│   ├── app.module.ts                # Módulo raíz
│   ├── app.controller.ts            # Health check
│   ├── app.service.ts
│   └── main.ts                      # Entry point
│
├── 📁 test/                         # Tests E2E
│
├── 📁 .vscode/                      # Configuración de VS Code
│   ├── settings.json
│   └── launch.json
│
├── 📄 package.json                  # Dependencias
├── 📄 tsconfig.json                 # Configuración TypeScript
├── 📄 nest-cli.json                 # Configuración NestJS
│
├── 📄 .env.example                  # Plantilla de variables
├── 📄 .gitignore
│
├── 📄 README.md                     # Documentación principal
├── 📄 SETUP_GUIDE.md               # Guía de instalación paso a paso
├── 📄 API_REFERENCE.md             # Referencia de endpoints
└── 📄 PROJECT_STRUCTURE.md         # Este archivo
```

---

## 🎯 Módulos Principales

### 1. **Auth Module** (`src/auth/`)

**Responsabilidad**: Autenticación y autorización

**Componentes**:
- `SupabaseAuthGuard`: Verifica JWT de Supabase en requests
- `AdminGuard`: Verifica que el usuario tenga rol de admin
- `@CurrentUser()`: Decorador para inyectar usuario autenticado
- `@CurrentTienda()`: Decorador para inyectar ID de tienda

**Uso**:
```typescript
@UseGuards(SupabaseAuthGuard)
@Get('me')
async getMe(@CurrentUser() user: AuthUser) { }

@UseGuards(SupabaseAuthGuard, AdminGuard)
@Get('admin/clientes')
async getClientes(@CurrentTienda() tiendaId: string) { }
```

---

### 2. **Supabase Module** (`src/supabase/`)

**Responsabilidad**: Integración con Supabase

**Componentes**:
- `SupabaseService`: Proporciona clientes de Supabase
  - `getAdminClient()`: Bypasea RLS (para admin)
  - `getClient()`: Respeta RLS (para usuarios)
  - `verifyToken()`: Verifica JWT

**Marcado como `@Global()`** para estar disponible en toda la app.

---

### 3. **Clientes Module** (`src/clientes/`)

**Responsabilidad**: Gestión de clientes finales

**Endpoints**:
- `GET /api/clientes/me` - Obtener datos del cliente
- `PUT /api/clientes/me` - Actualizar datos
- `GET /api/clientes/me/puntos` - Ver puntos y compras

**Lógica**:
- Auto-creación de cliente si no existe
- Asociación a tienda por defecto (`DEFAULT_TIENDA_ID`)
- Validación con DTOs

---

### 4. **QR Module** (`src/qr/`)

**Responsabilidad**: Generación y gestión de códigos QR

**Endpoints**:
- `GET /api/clientes/me/qr` - Obtener código QR único

**Lógica**:
- Generación de código alfanumérico de 16 caracteres
- Verificación de unicidad
- Auto-creación si no existe

---

### 5. **Compras Module** (`src/compras/`)

**Responsabilidad**: Registro y gestión de compras

**Funciones**:
- `registrarCompra()`: Registra compra y actualiza puntos
- `getComprasByTienda()`: Lista compras de una tienda

**Flujo de registro**:
1. Buscar cliente por código QR
2. Calcular puntos (importe × factor)
3. Insertar compra
4. Actualizar puntos_totales del cliente
5. Actualizar ultima_visita

---

### 6. **Admin Module** (`src/admin/`)

**Responsabilidad**: Panel de administración

**Endpoints**:
- `POST /api/admin/compras/registrar` - Registrar compra
- `GET /api/admin/clientes` - Lista de clientes
- `GET /api/admin/compras` - Historial de compras
- `GET /api/admin/dashboard/resumen` - Métricas

**Protección**: Requiere `SupabaseAuthGuard` + `AdminGuard`

---

### 7. **Tiendas Module** (`src/tiendas/`)

**Responsabilidad**: Gestión de tiendas

**Funciones**:
- `getTiendaById()`: Obtener datos de una tienda

**Nota**: En el MVP, se usa una sola tienda por defecto.

---

## 🔄 Flujo de Request

```
1. Request HTTP
   ↓
2. NestJS Middleware
   ↓
3. Guards (SupabaseAuthGuard → AdminGuard)
   ↓
4. Controller (recibe request, decoradores inyectan datos)
   ↓
5. Service (lógica de negocio)
   ↓
6. SupabaseService (queries a la BD)
   ↓
7. Response HTTP
```

---

## 📊 Diagrama de Dependencias

```
AppModule
├── ConfigModule (global)
├── SupabaseModule (global)
├── AuthModule
│   └── usa: SupabaseService
├── ClientesModule
│   └── usa: SupabaseService, ConfigService
├── QrModule
│   └── usa: SupabaseService
├── ComprasModule
│   └── usa: SupabaseService, ConfigService
├── AdminModule
│   └── usa: SupabaseService, ComprasService
└── TiendasModule
    └── usa: SupabaseService
```

---

## 🗄️ Modelo de Datos

### Tabla: `tiendas`
```sql
id              UUID PRIMARY KEY
nombre          TEXT
direccion       TEXT
telefono        TEXT
email           TEXT
configuracion   JSONB
creado_en       TIMESTAMP
actualizado_en  TIMESTAMP
```

### Tabla: `clientes`
```sql
id                  UUID PRIMARY KEY
supabase_user_id    UUID UNIQUE
id_tienda           UUID → tiendas(id)
nombre              TEXT
email               TEXT
telefono            TEXT
puntos_totales      INTEGER
fecha_registro      TIMESTAMP
ultima_visita       TIMESTAMP
activo              BOOLEAN
```

### Tabla: `qr_clientes`
```sql
id          UUID PRIMARY KEY
id_cliente  UUID → clientes(id)
codigo      TEXT UNIQUE (16 chars)
activo      BOOLEAN
creado_en   TIMESTAMP
```

### Tabla: `compras`
```sql
id                 UUID PRIMARY KEY
id_cliente         UUID → clientes(id)
id_tienda          UUID → tiendas(id)
fecha              TIMESTAMP
importe            NUMERIC(10,2)
puntos_otorgados   INTEGER
notas              TEXT
```

### Tabla: `roles_tienda`
```sql
id                  UUID PRIMARY KEY
supabase_user_id    UUID
id_tienda           UUID → tiendas(id)
rol                 TEXT (admin, staff, comercial)
activo              BOOLEAN
```

---

## 🔐 Seguridad

### Row Level Security (RLS)

**Habilitado en**:
- `clientes`
- `compras`
- `qr_clientes`
- `canjes`

**Políticas**:
- Los clientes solo ven sus propios datos
- El backend bypasea RLS usando `SERVICE_ROLE_KEY`

### Autenticación

**Flujo**:
1. Frontend → Supabase Auth (login)
2. Supabase → JWT token
3. Frontend → Backend (header: `Authorization: Bearer <jwt>`)
4. Backend → `SupabaseAuthGuard` verifica JWT
5. Backend → Request autorizado

---

## 📝 Convenciones de Código

### Naming

- **Módulos**: `clientes.module.ts`
- **Controladores**: `clientes.controller.ts`
- **Servicios**: `clientes.service.ts`
- **DTOs**: `kebab-case.dto.ts`
- **Entities**: `kebab-case.entity.ts`
- **Guards**: `kebab-case.guard.ts`
- **Decorators**: `kebab-case.decorator.ts`

### Estructura de Controlador

```typescript
@ApiTags('NombreModulo')
@ApiBearerAuth('JWT')
@UseGuards(SupabaseAuthGuard)
@Controller('ruta')
export class MiController {
  constructor(private readonly miService: MiService) {}

  @Get()
  @ApiOperation({ summary: 'Descripción' })
  @ApiResponse({ status: 200, type: ResponseDto })
  async metodo(@CurrentUser() user: AuthUser) { }
}
```

### Estructura de Servicio

```typescript
@Injectable()
export class MiService {
  constructor(private supabaseService: SupabaseService) {}

  async metodo() {
    const supabase = this.supabaseService.getAdminClient();
    // Lógica...
  }
}
```

---

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage
```bash
npm run test:cov
```

---

## 🚀 Deployment

### Variables de entorno requeridas

```env
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DEFAULT_TIENDA_ID
PUNTOS_POR_EURO
PORT (opcional, default: 3000)
FRONTEND_URL (para CORS)
```

### Build

```bash
npm run build
```

Genera: `dist/` con código compilado

### Start (producción)

```bash
npm run start:prod
```

---

## 📚 Recursos

- **Swagger UI**: `/api/docs`
- **NestJS Docs**: https://docs.nestjs.com
- **Supabase Docs**: https://supabase.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
