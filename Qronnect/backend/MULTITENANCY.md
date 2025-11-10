# 🏢 Arquitectura Multitenancy - Qronnect

## 📋 Índice

1. [Visión General](#visión-general)
2. [Cómo Funciona](#cómo-funciona)
3. [Fases de Implementación](#fases-de-implementación)
4. [Identificación por Dominio](#identificación-por-dominio)
5. [Configuración de Tenants](#configuración-de-tenants)
6. [Aislamiento de Datos](#aislamiento-de-datos)
7. [Ejemplos de Uso](#ejemplos-de-uso)
8. [Migración a BD Dedicadas](#migración-a-bd-dedicadas)
9. [FAQ](#faq)

---

## 🎯 Visión General

Qronnect implementa una arquitectura **multitenancy completa** donde múltiples tiendas (tenants) pueden usar el sistema de forma aislada. Cada tienda tiene:

- ✅ Su propio **dominio único** (ej: `cafeteria-aroma.qronnect.com` o `www.micafeteria.com`)
- ✅ Sus propios **clientes y datos**
- ✅ Su **configuración personalizada** (puntos por euro, planes, etc.)
- ✅ **Aislamiento total** de datos de otras tiendas

**Ventajas:**
- 📊 **Escalabilidad**: Añadir nuevas tiendas sin tocar código
- 🔐 **Seguridad**: Los datos de cada tienda están totalmente aislados
- ⚙️ **Personalización**: Cada tienda puede tener su propia configuración
- 🚀 **Migración futura**: Preparado para migrar a BD dedicadas (Fase 2)

---

## 🔄 Cómo Funciona

### Flujo de Request

```
1. Request llega al backend
   Host: cafeteria-aroma.qronnect.com

2. TenantResolverMiddleware intercepta
   - Extrae el dominio: "cafeteria-aroma"
   - Busca la tienda en BD por dominio
   - Inyecta tenant en request.tenant

3. Guards validan permisos
   - SupabaseAuthGuard: Verifica JWT
   - AdminGuard: Verifica rol en LA TIENDA ACTUAL

4. Controller recibe request
   - @Tenant() inyecta el contexto del tenant
   - @CurrentUser() inyecta el usuario autenticado

5. Service ejecuta lógica
   - Usa tenant.id para filtrar queries
   - Usa tenant.configuracion para lógica de negocio
```

### Ejemplo de Request

```http
GET https://cafeteria-aroma.qronnect.com/api/clientes/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# El middleware detecta:
# - Dominio: "cafeteria-aroma"
# - Busca tienda con dominio = "cafeteria-aroma"
# - Inyecta tenant en request

# El controller recibe:
# - user: { id: "uuid-del-usuario", email: "juan@ejemplo.com" }
# - tenant: { id: "uuid-cafeteria", nombre: "Cafetería El Aroma", configuracion: {...} }
```

---

## 🚦 Fases de Implementación

### **Fase 1: Base de Datos Compartida** ✅ (Actual)

**Arquitectura:**
```
┌─────────────────────────────────────────────┐
│           Supabase (BD Compartida)          │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Tienda 1 │  │ Tienda 2 │  │ Tienda 3 │  │
│  │ Clientes │  │ Clientes │  │ Clientes │  │
│  │ Compras  │  │ Compras  │  │ Compras  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
           Todas en la misma BD
```

**Características:**
- ✅ Una sola BD de Supabase
- ✅ Todas las tiendas comparten la misma instancia
- ✅ Aislamiento lógico por `id_tienda` en queries
- ✅ Más económico y simple de gestionar
- ⚠️ Límite de escalabilidad a largo plazo

**Cuándo usar:**
- Hasta ~100 tiendas
- Volumen moderado de transacciones
- Presupuesto limitado

---

### **Fase 2: Bases de Datos Dedicadas** 🔜 (Futuro)

**Arquitectura:**
```
┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│ Supabase Tienda 1 │  │ Supabase Tienda 2 │  │ Supabase Tienda 3 │
│                   │  │                   │  │                   │
│   ┌──────────┐    │  │   ┌──────────┐    │  │   ┌──────────┐    │
│   │ Clientes │    │  │   │ Clientes │    │  │   │ Clientes │    │
│   │ Compras  │    │  │   │ Compras  │    │  │   │ Compras  │    │
│   └──────────┘    │  │   └──────────┘    │  │   └──────────┘    │
└───────────────────┘  └───────────────────┘  └───────────────────┘
   BD independiente     BD independiente     BD independiente
```

**Características:**
- ✅ Cada tienda tiene su propia BD de Supabase
- ✅ Aislamiento físico completo
- ✅ Mejor rendimiento para clientes grandes
- ✅ Cumplimiento de regulaciones (GDPR, etc.)
- ⚠️ Mayor complejidad operativa
- ⚠️ Mayor costo (una BD por tienda)

**Cuándo usar:**
- Clientes enterprise (>1000 compras/día)
- Requisitos regulatorios estrictos
- Clientes que pagan plan premium

**Migración:**
El código ya está preparado para esta fase:
```typescript
// En tiendas.database_name se guarda el nombre de la BD dedicada
// Si es NULL, usa la BD compartida
// Si tiene valor, usa la BD dedicada

const client = tenantService.getSupabaseClientForTenant(tenant);
// Devuelve el cliente correcto según tenant.databaseName
```

---

## 🌐 Identificación por Dominio

### Tipos de Dominios Soportados

#### 1. **Subdominio de Qronnect** (Recomendado)

```
Formato: {nombre-tienda}.qronnect.com

Ejemplos:
- cafeteria-aroma.qronnect.com
- fitzone.qronnect.com
- libreria-letras.qronnect.com
```

**En la BD:**
```sql
INSERT INTO tiendas (nombre, dominio)
VALUES ('Cafetería El Aroma', 'cafeteria-aroma');
```

**Ventajas:**
- ✅ Gratis (incluido en Qronnect)
- ✅ SSL automático
- ✅ No requiere configuración DNS
- ✅ Fácil de recordar

---

#### 2. **Dominio Personalizado** (Plan Premium)

```
Formato: www.{nombre-tienda}.com

Ejemplos:
- www.fitzonegym.com
- www.cafeteria-aroma.es
- micafeteria.com
```

**En la BD:**
```sql
INSERT INTO tiendas (nombre, dominio, dominio_personalizado)
VALUES (
  'FitZone Gym',
  'fitzone',  -- Subdominio de respaldo
  'www.fitzonegym.com'  -- Dominio personalizado
);
```

**Configuración DNS (cliente):**
```
Tipo: CNAME
Host: www
Valor: qronnect.com
TTL: 3600
```

**Ventajas:**
- ✅ Branding propio
- ✅ Mayor profesionalidad
- ✅ SEO mejorado

---

#### 3. **Localhost** (Solo Desarrollo)

```
http://localhost:3000
```

**Comportamiento:**
- En desarrollo, usa la **primera tienda activa** de la BD
- En producción, devuelve error 404

---

### Resolución de Dominio

El `TenantResolverMiddleware` resuelve el tenant en este orden:

1. **Busca por `dominio_personalizado`** (si existe)
   ```sql
   SELECT * FROM tiendas WHERE dominio_personalizado = 'www.fitzonegym.com';
   ```

2. **Busca por `dominio`** (subdominio de qronnect)
   ```sql
   SELECT * FROM tiendas WHERE dominio = 'cafeteria-aroma';
   ```

3. **Si es localhost, usa la primera tienda activa**
   ```sql
   SELECT * FROM tiendas WHERE activo = true LIMIT 1;
   ```

4. **Si no encuentra nada, devuelve 404**

---

## ⚙️ Configuración de Tenants

### Estructura de Configuración

Cada tienda tiene un campo JSONB `configuracion` que permite personalizar su comportamiento:

```typescript
interface TenantConfig {
  puntos_por_euro?: number;      // Factor de conversión (ej: 1, 10, 0.5)
  factor_descuento?: number;      // Descuento por defecto (ej: 0.05 = 5%)
  bonificacion_mensual?: number;  // Puntos gratis al mes
  [key: string]: any;             // Configuraciones personalizadas
}
```

### Ejemplos de Configuración

#### Cafetería (Plan Profesional)
```json
{
  "puntos_por_euro": 1,
  "factor_descuento": 0.05,
  "minimo_canje": 50
}
```
- 1 euro = 1 punto
- 5% de descuento por defecto
- Mínimo 50 puntos para canjear

---

#### Gimnasio (Plan Enterprise)
```json
{
  "puntos_por_euro": 2,
  "bonificacion_mensual": 50,
  "descuento_anual": 0.15
}
```
- 1 euro = 2 puntos
- 50 puntos gratis cada mes
- 15% descuento en plan anual

---

#### Librería (Plan Básico)
```json
{
  "puntos_por_euro": 0.5,
  "minimo_compra": 10
}
```
- 2 euros = 1 punto
- Compra mínima de 10€ para acumular puntos

---

### Usar Configuración en Código

```typescript
@Post('admin/compras/registrar')
async registrarCompra(
  @Tenant() tenant: TenantContext,
  @Body() dto: RegistrarCompraDto,
) {
  // Obtener configuración del tenant
  const puntosPorEuro = tenant.configuracion.puntos_por_euro || 1;
  const descuento = tenant.configuracion.factor_descuento || 0;

  // Calcular puntos
  const puntos = Math.floor(dto.importe * puntosPorEuro);

  // Aplicar descuento si corresponde
  const descuentoAplicado = dto.importe * descuento;

  // ...
}
```

---

## 🔒 Aislamiento de Datos

### Reglas de Aislamiento

1. **Un cliente puede pertenecer a múltiples tiendas**
   ```sql
   -- CONSTRAINT unique_cliente_por_tienda UNIQUE(supabase_user_id, id_tienda)
   ```

2. **Cada query DEBE filtrar por `id_tienda`**
   ```typescript
   // ❌ MAL - No filtra por tienda
   const clientes = await supabase
     .from('clientes')
     .select('*');

   // ✅ BIEN - Filtra por tenant
   const clientes = await supabase
     .from('clientes')
     .select('*')
     .eq('id_tienda', tenant.id);
   ```

3. **Los QR codes son únicos por cliente**
   ```typescript
   // Un usuario puede tener múltiples QRs (uno por tienda)
   // Ejemplo:
   // - QR "ABC123" en Cafetería El Aroma
   // - QR "XYZ789" en FitZone Gym
   // Mismo usuario, diferentes tiendas
   ```

4. **Row Level Security (RLS) protege datos de clientes**
   ```sql
   CREATE POLICY "Los clientes pueden ver sus propios datos"
     ON clientes
     FOR SELECT
     USING (supabase_user_id = auth.uid());
   ```

---

## 💻 Ejemplos de Uso

### Crear una Nueva Tienda

```sql
INSERT INTO tiendas (nombre, dominio, direccion, telefono, email, plan, configuracion)
VALUES (
  'Mi Nueva Tienda',
  'mi-tienda',  -- Acceso: mi-tienda.qronnect.com
  'Calle Principal 123, Madrid',
  '+34 600 000 000',
  'contacto@mitienda.com',
  'profesional',
  '{"puntos_por_euro": 1.5, "descuento_bienvenida": 10}'::jsonb
);
```

---

### Asignar Rol de Admin a un Usuario

```sql
-- 1. El usuario debe hacer login primero con Supabase Auth
-- 2. Copiar su UUID de Supabase (se encuentra en auth.users.id)

INSERT INTO roles_tienda (supabase_user_id, id_tienda, rol, activo)
VALUES (
  'uuid-del-usuario-de-supabase',
  (SELECT id FROM tiendas WHERE dominio = 'mi-tienda'),
  'admin',
  true
);
```

---

### Consultar Clientes de una Tienda

```typescript
// En el controller
@Get('admin/clientes')
async getClientes(@Tenant() tenant: TenantContext) {
  const supabase = this.supabaseService.getAdminClient();

  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .eq('id_tienda', tenant.id)  // ← Filtrar por tenant
    .eq('activo', true)
    .order('fecha_registro', { ascending: false });

  return clientes;
}
```

---

### Registrar Compra con Configuración del Tenant

```typescript
@Post('admin/compras/registrar')
async registrarCompra(
  @Tenant() tenant: TenantContext,
  @Body() dto: RegistrarCompraDto,
) {
  // Obtener factor de puntos del tenant
  const puntosPorEuro = tenant.configuracion.puntos_por_euro || 1;

  // Calcular puntos
  const puntos = Math.floor(dto.importe * puntosPorEuro);

  // Buscar cliente por QR (solo de esta tienda)
  const { data: qr } = await supabase
    .from('qr_clientes')
    .select('*, clientes!inner(*)')
    .eq('codigo', dto.codigoQr)
    .eq('clientes.id_tienda', tenant.id)  // ← Importante
    .single();

  // Registrar compra...
}
```

---

## 🔄 Migración a BD Dedicadas

### Cuándo Migrar

Considera migrar una tienda a BD dedicada cuando:

- ✅ Tiene >1000 compras/día
- ✅ Requiere cumplimiento regulatorio estricto
- ✅ Paga plan Enterprise
- ✅ Necesita reportes personalizados complejos

### Proceso de Migración

#### 1. Crear BD de Supabase para el Tenant

```bash
# En Supabase Dashboard
1. Crear nuevo proyecto: "qronnect-cafeteria-aroma"
2. Ejecutar schema.sql
3. Copiar credenciales
```

#### 2. Actualizar Registro de Tenant

```sql
UPDATE tiendas
SET database_name = 'cafeteria-aroma-db'
WHERE dominio = 'cafeteria-aroma';
```

#### 3. Migrar Datos

```bash
# Exportar datos de la tienda
pg_dump --data-only \
  --table=clientes \
  --table=compras \
  --table=qr_clientes \
  --where="id_tienda='uuid-de-cafeteria'" \
  > cafeteria_data.sql

# Importar a la nueva BD
psql -h nueva-bd-supabase.com -U postgres < cafeteria_data.sql
```

#### 4. Implementar getSupabaseClientForTenant

```typescript
// En tenant.service.ts
getSupabaseClientForTenant(tenant: TenantContext) {
  if (!tenant.databaseName) {
    // Fase 1: BD compartida
    return this.supabaseService.getAdminClient();
  }

  // Fase 2: BD dedicada
  const credentials = this.getDatabaseCredentials(tenant.databaseName);
  return createClient(credentials.url, credentials.key);
}
```

#### 5. Probar y Desplegar

```bash
# Probar que la tienda funciona con su BD dedicada
curl https://cafeteria-aroma.qronnect.com/api/admin/dashboard/resumen

# Si todo funciona, ya está migrada
```

---

## ❓ FAQ

### ¿Un usuario puede ser cliente de múltiples tiendas?

**Sí.** Un usuario con el mismo email puede registrarse en varias tiendas. Cada tienda lo verá como un cliente diferente con sus propios puntos, QR, y compras.

Ejemplo:
```
Juan Pérez (juan@email.com)
├─ Cliente de Cafetería El Aroma (150 puntos, QR: ABC123)
├─ Cliente de FitZone Gym (80 puntos, QR: XYZ789)
└─ Cliente de Librería Letras (25 puntos, QR: DEF456)
```

---

### ¿Cómo pruebo multitenancy en localhost?

**Opción 1: Editar /etc/hosts**

```bash
# En /etc/hosts (macOS/Linux) o C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1  cafeteria-aroma.localhost
127.0.0.1  fitzone.localhost
```

Luego accede a:
- `http://cafeteria-aroma.localhost:3000`
- `http://fitzone.localhost:3000`

**Opción 2: Usar encabezado Host**

```bash
curl http://localhost:3000/api/clientes/me \
  -H "Host: cafeteria-aroma.qronnect.com" \
  -H "Authorization: Bearer ..."
```

---

### ¿Puedo cambiar el dominio de una tienda?

**Sí**, pero con cuidado:

```sql
UPDATE tiendas
SET dominio = 'nuevo-nombre'
WHERE id = 'uuid-de-la-tienda';
```

**⚠️ Importante:**
- Los clientes deberán usar el nuevo dominio
- Configura redirects en el servidor web
- Notifica a los usuarios del cambio

---

### ¿Qué pasa si dos tiendas tienen el mismo dominio?

**No puede pasar.** El campo `dominio` tiene constraint `UNIQUE`:

```sql
CREATE TABLE tiendas (
  dominio TEXT UNIQUE NOT NULL,
  dominio_personalizado TEXT UNIQUE,
  ...
);
```

Si intentas crear una tienda con dominio duplicado, Supabase devolverá error.

---

### ¿Cómo desactivo una tienda?

```sql
UPDATE tiendas
SET activo = false
WHERE id = 'uuid-de-la-tienda';
```

**Efecto:**
- La tienda ya no será accesible
- Los requests a su dominio devolverán 404
- Los datos permanecen en la BD (no se eliminan)

---

### ¿Cuántas tiendas soporta la arquitectura?

**Fase 1 (BD compartida):**
- Hasta ~100-200 tiendas
- Depende del volumen de transacciones

**Fase 2 (BDs dedicadas):**
- Ilimitado (cada tienda tiene su propia BD)

---

## 📚 Recursos Adicionales

- [README.md](README.md) - Documentación general
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Guía de instalación
- [API_REFERENCE.md](API_REFERENCE.md) - Referencia de endpoints
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Estructura del código

---

## 🎉 Conclusión

La arquitectura multitenancy de Qronnect está diseñada para:

1. ✅ **Ser simple**: Un dominio = una tienda
2. ✅ **Escalar fácilmente**: De 1 a N tiendas sin cambiar código
3. ✅ **Ser segura**: Aislamiento total de datos
4. ✅ **Migrar gradualmente**: De BD compartida a dedicadas según necesidad

**¡Listo para crecer!** 🚀
