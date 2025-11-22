# 🧪 GUÍA DE TESTING - SISTEMA DE REGALOS CONCRETOS

## Estado de Compilación

✅ **Backend compila correctamente** (commit dcd4862)
- Todos los errores de TypeScript resueltos
- Servicios de regalos integrados
- Listo para deployment

---

## 📋 CHECKLIST PREVIO AL TESTING

Antes de comenzar las pruebas, asegúrate de:

### 1. Base de Datos

```bash
# Aplicar migración del sistema de regalos
cd backend
npx supabase db push
```

**Verificar que se crearon las tablas:**
- [ ] `regalos_catalogo`
- [ ] `cupones_regalos`
- [ ] `milestones_referidos`
- [ ] `milestones_alcanzados`

**Verificar funciones PostgreSQL:**
- [ ] `generar_codigo_cupon()`
- [ ] `otorgar_regalo_concreto()`
- [ ] `verificar_milestones_referidos()`
- [ ] `marcar_cupon_usado()`

**Verificar trigger:**
- [ ] `trigger_verificar_milestones` en tabla `clientes`

**Verificar vista:**
- [ ] `vista_cupones_cliente`

### 2. Datos de Ejemplo (Opcional)

```bash
# Cargar seed de regalos de ejemplo
# IMPORTANTE: Editar primero el archivo y reemplazar {ID_TIENDA} con UUID real
nano supabase/seed_regalos_ejemplo.sql
npx supabase db execute < supabase/seed_regalos_ejemplo.sql
```

### 3. Backend en Ejecución

```bash
cd backend
npm run start:dev
```

**Verificar que el servidor arranca:**
- [ ] Escucha en puerto 3001
- [ ] No hay errores de compilación
- [ ] Conecta a Supabase correctamente

### 4. Frontend en Ejecución

```bash
cd frontend
npm run dev
```

**Verificar que el frontend arranca:**
- [ ] Escucha en puerto 3000
- [ ] No hay errores de compilación
- [ ] Conecta al backend correctamente

---

## 🧪 PRUEBAS FUNCIONALES

### FASE 1: Verificación de Base de Datos

#### Test 1.1: Verificar Tablas Creadas

```sql
-- Ejecutar en Supabase Dashboard o psql
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'regalos_catalogo',
    'cupones_regalos',
    'milestones_referidos',
    'milestones_alcanzados'
  )
ORDER BY table_name;
```

**Resultado esperado:** 4 filas

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 1.2: Verificar Funciones PostgreSQL

```sql
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'generar_codigo_cupon',
    'otorgar_regalo_concreto',
    'verificar_milestones_referidos',
    'marcar_cupon_usado'
  )
ORDER BY routine_name;
```

**Resultado esperado:** 4 filas

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 1.3: Verificar Trigger

```sql
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_verificar_milestones';
```

**Resultado esperado:** 1 fila con `event_object_table = 'clientes'`

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 1.4: Verificar Vista

```sql
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'vista_cupones_cliente';
```

**Resultado esperado:** 1 fila con `table_type = 'VIEW'`

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

### FASE 2: API Backend - Endpoints de Regalos

#### Test 2.1: GET /api/regalos/catalogo/:tiendaId (Público)

```bash
# Reemplazar {TIENDA_ID} con UUID de una tienda
curl -X GET "http://localhost:3001/api/regalos/catalogo/{TIENDA_ID}" \
  -H "X-Tenant-Domain: {dominio-tienda}"
```

**Resultado esperado:**
- Status: 200 OK
- JSON array con regalos (puede estar vacío si no hay seed)

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

**Notas:**
_______________________________________________

---

#### Test 2.2: GET /api/regalos/milestones/:tiendaId (Público)

```bash
# Reemplazar {TIENDA_ID} con UUID de una tienda
curl -X GET "http://localhost:3001/api/regalos/milestones/{TIENDA_ID}" \
  -H "X-Tenant-Domain: {dominio-tienda}"
```

**Resultado esperado:**
- Status: 200 OK
- JSON array con milestones (puede estar vacío si no hay seed)

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

**Notas:**
_______________________________________________

---

#### Test 2.3: GET /api/regalos/mis-cupones (Cliente Autenticado)

```bash
# Reemplazar {TOKEN} con JWT de un cliente
curl -X GET "http://localhost:3001/api/regalos/mis-cupones" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "X-Tenant-Domain: {dominio-tienda}"
```

**Resultado esperado:**
- Status: 200 OK
- JSON array con cupones del cliente (puede estar vacío)

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

**Notas:**
_______________________________________________

---

#### Test 2.4: GET /api/regalos/mis-milestones (Cliente Autenticado)

```bash
# Reemplazar {TOKEN} con JWT de un cliente
curl -X GET "http://localhost:3001/api/regalos/mis-milestones" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "X-Tenant-Domain: {dominio-tienda}"
```

**Resultado esperado:**
- Status: 200 OK
- JSON array con milestones alcanzados (puede estar vacío)

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

**Notas:**
_______________________________________________

---

#### Test 2.5: POST /api/regalos/catalogo (Admin)

```bash
# Reemplazar {ADMIN_TOKEN} con JWT de admin
curl -X POST "http://localhost:3001/api/regalos/catalogo" \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "X-Tenant-Domain: {dominio-tienda}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Café Gratis",
    "descripcion": "Un café de prueba gratis",
    "tipo": "producto",
    "detalles": {"producto": "Café", "cantidad": 1},
    "instrucciones_canje": "Presentar en caja",
    "icono": "coffee",
    "dias_validez": 30,
    "requiere_validacion_staff": true
  }'
```

**Resultado esperado:**
- Status: 201 Created
- JSON con el regalo creado (incluye `id`)

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

**Notas:**
_______________________________________________

---

### FASE 3: Flujo Completo de Regalo de Bienvenida

#### Test 3.1: Configurar Regalo de Bienvenida

```sql
-- Obtener un regalo del catálogo
SELECT id, nombre FROM regalos_catalogo WHERE activo = true LIMIT 1;

-- Configurar regalo de bienvenida (reemplazar UUID)
UPDATE tiendas
SET
  regalo_bienvenida_activo = true,
  regalo_bienvenida_tipo = 'regalo_concreto',
  regalo_bienvenida_id_regalo = '{UUID_REGALO}'
WHERE id = '{UUID_TIENDA}';
```

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 3.2: Registrar Nuevo Cliente

**Frontend:**
1. Abrir `http://{dominio}.localhost:3000/registro`
2. Rellenar formulario
3. Click en "Registrarse"
4. Verificar mensaje: "Revisa tu email"

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 3.3: Verificar Email de Validación

1. Abrir bandeja de entrada
2. Buscar email "Confirma tu email"
3. Verificar que llega en < 2 minutos

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 3.4: Validar Email y Recibir Regalo

1. Click en botón "Confirmar mi email"
2. Verificar redirección a perfil
3. Verificar auto-login (sin pedir OTP)
4. Buscar segundo email "¡Tienes un regalo!"
5. Verificar que contiene:
   - Nombre del regalo
   - Código del cupón (8 caracteres)
   - Fecha de expiración
   - Instrucciones de canje

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 3.5: Ver Cupón en /mis-cupones

1. Estando logueado, ir a `/mis-cupones`
2. Verificar que aparece el cupón de bienvenida
3. Verificar:
   - Badge "¡Nuevo!" visible
   - Estado "Disponible"
   - Origen "Regalo de bienvenida"
   - Código grande y legible
   - Botón "Ver QR" funciona
   - QR se genera correctamente

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

**Screenshot:** (opcional)

---

### FASE 4: Flujo Completo de Milestones

#### Test 4.1: Configurar Milestones

```sql
-- Crear milestone de 3 referidos
INSERT INTO milestones_referidos (
  id_tienda,
  nombre,
  descripcion,
  cantidad_referidos,
  tipo_recompensa,
  id_regalo,
  puntos,
  orden,
  activo
) VALUES (
  '{UUID_TIENDA}',
  'Invita 3 amigos',
  'Invita a 3 amigos y llévate un café gratis',
  3,
  'regalo_concreto',
  '{UUID_REGALO_CAFE}', -- ID del café gratis
  NULL,
  1,
  true
);
```

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 4.2: Ver Milestone en /mis-referidos

**Cliente A:**
1. Login como cliente
2. Ir a `/mis-referidos`
3. Scroll a sección "Objetivos de Referidos"
4. Verificar que aparece milestone "Invita 3 amigos"
5. Verificar:
   - Progress bar en 0% (0/3 amigos)
   - "Faltan 3 amigos"
   - Icono del regalo (café)
   - Nombre del regalo debajo

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 4.3: Invitar Amigos

**Cliente A:**
1. En `/mis-referidos`, copiar código personal
2. Compartir código con 3 amigos (puedes usar 3 emails diferentes)

**Clientes B, C, D:**
1. Registrarse con código de A
2. Validar email cada uno

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 4.4: Verificar Milestone Alcanzado

**Cliente A:**
1. Refrescar `/mis-referidos`
2. Verificar que milestone cambió a:
   - Fondo verde
   - Badge "¡Completado!"
   - Progress bar al 100% (3/3 amigos)
3. Buscar email "¡Has desbloqueado nuevas recompensas!"
4. Verificar contenido del email

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 4.5: Ver Cupón del Milestone

**Cliente A:**
1. Ir a `/mis-cupones`
2. Verificar nuevo cupón:
   - Origen "Objetivo alcanzado"
   - Badge "¡Nuevo!"
   - Código diferente al de bienvenida
   - QR funciona

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

### FASE 5: Validación de Cupón por Staff

#### Test 5.1: Escanear/Ingresar Código

**Staff (Admin):**
1. Login como admin
2. Ir a `/admin/validar-cupon`
3. **Opción A:** Escanear QR del cliente
4. **Opción B:** Ingresar código manualmente
5. Verificar que muestra:
   - Nombre del cliente
   - Nombre del regalo
   - Estado "disponible"
   - Fecha de expiración

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 5.2: Marcar como Usado

**Staff (Admin):**
1. Click en "Marcar como Usado"
2. Confirmar acción
3. Verificar mensaje de éxito

**Backend (verificar en BD):**
```sql
SELECT
  id,
  codigo,
  estado,
  fecha_usado,
  usuario_staff_valido
FROM cupones_regalos
WHERE codigo = '{CODIGO}';
```

**Resultado esperado:**
- `estado = 'usado'`
- `fecha_usado` con timestamp
- `usuario_staff_valido` con ID del admin

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 5.3: Cliente Ve Cupón como Usado

**Cliente:**
1. Ir a `/mis-cupones`
2. Cambiar filtro a "Todos"
3. Verificar que cupón aparece con:
   - Badge "Usado"
   - Fondo gris
   - Fecha de uso visible
   - No se puede ver QR

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

### FASE 6: Validaciones de Seguridad

#### Test 6.1: No Permitir Usar Cupón Expirado

1. Crear cupón con fecha de expiración pasada
2. Intentar marcar como usado
3. Verificar que rechaza con error

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 6.2: No Permitir Usar Cupón Ya Usado

1. Intentar marcar como usado un cupón con `estado = 'usado'`
2. Verificar que rechaza con error

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

#### Test 6.3: Trigger Automático de Milestones

```sql
-- Simular incremento de referidos sin usar la API
UPDATE clientes
SET total_referidos = total_referidos + 1
WHERE id = '{UUID_CLIENTE}';

-- Esperar 1 segundo

-- Verificar que trigger se disparó
SELECT * FROM milestones_alcanzados
WHERE id_cliente = '{UUID_CLIENTE}'
ORDER BY fecha_alcanzado DESC
LIMIT 1;
```

**Resultado esperado:** Nuevo milestone alcanzado (si aplica)

**Estado:** [ ] ✅ PASS | [ ] ❌ FAIL

---

## 📊 RESUMEN DE TESTING

### Estadísticas

```
Total de pruebas: ___
Pasadas (✅): ___
Fallidas (❌): ___
Porcentaje de éxito: ____%
```

### Bugs Encontrados

1. **Descripción:**
   _______________________________________________
   **Severidad:** [ ] Alta | [ ] Media | [ ] Baja
   **Archivo/Línea:** _______________________________________________
   **Solución propuesta:** _______________________________________________

2. **Descripción:**
   _______________________________________________
   **Severidad:** [ ] Alta | [ ] Media | [ ] Baja
   **Archivo/Línea:** _______________________________________________
   **Solución propuesta:** _______________________________________________

### Mejoras Sugeridas

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Notas Adicionales

_______________________________________________
_______________________________________________
_______________________________________________

---

## ✅ CHECKLIST FINAL DE DEPLOYMENT

Antes de hacer deploy a producción, verificar:

### Base de Datos
- [ ] Migración aplicada en Supabase producción
- [ ] Seed de regalos cargado (si aplica)
- [ ] Backup de BD antes de migración

### Backend
- [ ] Build sin errores: `npm run build`
- [ ] Tests unitarios pasan (si los hay)
- [ ] Variables de entorno configuradas en Render
- [ ] Push a `main` para trigger deploy automático

### Frontend
- [ ] Build sin errores: `npm run build`
- [ ] Variables de entorno configuradas en Vercel
- [ ] Push a `main` para trigger deploy automático

### Configuración
- [ ] Al menos una tienda tiene regalos en catálogo
- [ ] Al menos una tienda tiene milestones configurados
- [ ] Regalo de bienvenida configurado (si se desea)

### Comunicación
- [ ] Staff capacitado en validación de cupones
- [ ] Clientes informados del nuevo sistema de regalos
- [ ] Documentación accesible para consulta

---

## 📞 SOPORTE

Si encuentras bugs o tienes dudas:

1. **Revisar documentación:**
   - `SISTEMA_REGALOS_CONCRETOS.md` - Arquitectura técnica
   - `RESUMEN_SISTEMA_REGALOS.md` - Resumen ejecutivo
   - `CASOS_DE_USO_COMPLETOS.md` - Casos de uso por tipo de usuario

2. **Verificar logs:**
   - Backend: Render dashboard → Logs
   - Frontend: Vercel dashboard → Logs
   - Base de datos: Supabase dashboard → Database → Logs

3. **Queries útiles de debugging:**

```sql
-- Ver todos los cupones de un cliente
SELECT * FROM vista_cupones_cliente
WHERE id_cliente = '{UUID}';

-- Ver milestones alcanzados
SELECT
  ma.*,
  m.nombre as milestone_nombre,
  m.cantidad_referidos
FROM milestones_alcanzados ma
JOIN milestones_referidos m ON ma.id_milestone = m.id
WHERE ma.id_cliente = '{UUID}';

-- Ver stats de cupones por tienda
SELECT
  r.nombre as regalo,
  COUNT(*) as cupones_generados,
  SUM(CASE WHEN c.estado = 'disponible' THEN 1 ELSE 0 END) as disponibles,
  SUM(CASE WHEN c.estado = 'usado' THEN 1 ELSE 0 END) as usados
FROM cupones_regalos c
JOIN regalos_catalogo r ON c.id_regalo = r.id
WHERE r.id_tienda = '{UUID_TIENDA}'
GROUP BY r.nombre;
```

---

🤖 *Generado con Claude Code - 22 de noviembre de 2025*

**Fecha de testing:** ___/___/_____
**Testeado por:** _______________
**Versión del sistema:** Commit dcd4862
