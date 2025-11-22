# 🎁 Sistema de Regalos Concretos y Milestones

**Fecha:** 22 de noviembre de 2025
**Versión:** 2.0
**Estado:** ✅ Completado

---

## 📋 Resumen

Sistema mejorado de **regalos concretos** (café gratis, muestra de perfume, etc.) y **milestones de referidos** (invita X amigos = regalo Y) para hacer el programa de fidelización mucho más atractivo y tangible.

---

## 🎯 Problema que Resuelve

### Antes (Sistema Solo de Puntos)
❌ **Poco atractivo:** "Gana 100 puntos" no es motivador
❌ **Abstracto:** Los usuarios no entienden el valor real
❌ **Baja conversión:** Pocos clientes invitan amigos

### Ahora (Regalos Concretos + Milestones)
✅ **Muy atractivo:** "Invita 6 amigos = café gratis" es claro
✅ **Tangible:** Los usuarios ven valor inmediato
✅ **Alta conversión:** Motivación real para referir

---

## 🏗️ Arquitectura del Sistema

### Nuevas Tablas en Base de Datos

#### 1. `regalos_catalogo`
Catálogo de regalos que las tiendas pueden ofrecer.

**Campos principales:**
- `nombre`: "Café Gratis", "Muestra de Perfume", etc.
- `tipo`: `producto`, `descuento`, `servicio`, `puntos`
- `detalles`: JSON con información específica
- `instrucciones_canje`: Cómo canjear el regalo
- `dias_validez`: Días que dura el cupón (opcional)
- `icono`: Nombre del icono de Lucide React

**Ejemplo:**
```sql
{
  "nombre": "Café Gratis",
  "tipo": "producto",
  "detalles": {
    "producto": "Café (cualquier tamaño)",
    "cantidad": 1,
    "valor_aprox": "2.50€"
  },
  "instrucciones_canje": "Presenta este cupón en caja",
  "dias_validez": 30,
  "icono": "coffee"
}
```

#### 2. `cupones_regalos`
Cupones otorgados a clientes con códigos únicos.

**Campos principales:**
- `codigo`: Código único (ej: `CUPON-A3F2B1C4`)
- `origen`: `bienvenida`, `referido`, `milestone`, `promocion`, `manual`
- `estado`: `disponible`, `usado`, `expirado`, `cancelado`
- `fecha_expiracion`: Cuándo expira
- `visto_por_cliente`: Si el cliente ya lo vio

#### 3. `milestones_referidos`
Objetivos del programa de referidos con recompensas.

**Campos principales:**
- `nombre`: "Invita 3 amigos"
- `cantidad_referidos`: 3, 6, 10, etc.
- `tipo_recompensa`: `regalo_concreto`, `puntos`, `ambos`
- `id_regalo`: Referencia al regalo del catálogo
- `puntos`: Puntos a otorgar (opcional)

**Ejemplo:**
```sql
{
  "nombre": "Invita 6 amigos",
  "descripcion": "Invita a 6 amigos y llévate un café gratis",
  "cantidad_referidos": 6,
  "tipo_recompensa": "regalo_concreto",
  "id_regalo": "uuid-del-cafe-gratis"
}
```

#### 4. `milestones_alcanzados`
Registro de milestones desbloqueados por clientes.

**Tracking completo:**
- Fecha de alcance
- Cupón generado
- Puntos otorgados
- Estado de entrega

---

## 🚀 Flujo Completo

### Flujo 1: Regalo de Bienvenida Concreto

```
1. Cliente se registra
2. Trigger automático verifica configuración
3. Si `regalo_bienvenida_tipo` = 'regalo_concreto':
   → Genera cupón con código único
   → Envía email con cupón
   → Cliente puede ver cupón en su perfil
4. Cliente presenta cupón en tienda
5. Staff marca cupón como usado
```

### Flujo 2: Milestones de Referidos

```
1. Cliente invita amigos (comparte código de referido)
2. Amigo se registra con código
3. Contador `total_referidos` del cliente aumenta
4. Trigger verifica milestones alcanzados:
   → Si total_referidos >= 3: Otorga café gratis
   → Si total_referidos >= 6: Otorga pastry + 50 puntos
   → Si total_referidos >= 10: Otorga descuento 20%
5. Para cada milestone alcanzado:
   → Genera cupón automáticamente
   → Envía email de felicitación
   → Registra en tabla milestones_alcanzados
6. Cliente ve sus nuevos cupones en perfil
7. Cliente canjea cupón en tienda
```

---

## 📝 Configuración por Tipo de Negocio

### Cafetería ☕

**Catálogo de Regalos:**
1. Café Gratis (producto) - 30 días validez
2. Pastry Gratis (producto) - 30 días validez
3. Descuento 20% (descuento) - 60 días validez

**Milestones:**
- 3 amigos → Café gratis
- 6 amigos → Pastry gratis + 50 puntos
- 10 amigos → Descuento 20%

**Regalo de Bienvenida:**
- Café gratis (inmediato)

---

### Perfumería 💄

**Catálogo de Regalos:**
1. Muestra de Perfume (producto) - 90 días
2. Mini Facial 15min (servicio) - 60 días
3. Descuento 15% en Skincare (descuento) - 30 días

**Milestones:**
- 2 amigas → Muestra de perfume
- 5 amigas → Mini facial
- 10 amigas → Descuento 15% + 100 puntos

**Regalo de Bienvenida:**
- Muestra de perfume

---

### Restaurante 🍽️

**Catálogo de Regalos:**
1. Postre Gratis (producto) - 45 días
2. Bebida Gratis (producto) - 30 días
3. Descuento 10% (descuento) - 30 días

**Milestones:**
- 3 amigos → Bebida gratis
- 5 amigos → Postre gratis
- 10 amigos → Descuento 10%

**Regalo de Bienvenida:**
- Bebida gratis

---

### Gimnasio 💪

**Catálogo de Regalos:**
1. Smoothie Proteico (producto) - 30 días
2. Clase Gratis (servicio) - 60 días
3. Sesión con Entrenador 30min (servicio) - 90 días

**Milestones:**
- 2 amigos → Smoothie proteico
- 5 amigos → Clase gratis
- 10 amigos → Sesión con entrenador

**Regalo de Bienvenida:**
- Smoothie proteico

---

## 💻 Uso en Backend

### Crear Regalo en Catálogo

```typescript
import { RegalosService } from './referidos/regalos.service';

// Inyectar en controlador
constructor(private regalosService: RegalosService) {}

// Crear café gratis
await this.regalosService.crearRegalo(tiendaId, {
  nombre: 'Café Gratis',
  descripcion: 'Un café de cualquier tamaño, gratis',
  tipo: 'producto',
  detalles: {
    producto: 'Café (cualquier tamaño)',
    cantidad: 1,
    valor_aprox: '2.50€'
  },
  instrucciones_canje: 'Presenta este cupón en caja antes de ordenar',
  icono: 'coffee',
  dias_validez: 30,
  requiere_validacion_staff: true
});
```

### Crear Milestone de Referidos

```typescript
await this.regalosService.crearMilestone(tiendaId, {
  nombre: 'Invita 6 amigos',
  descripcion: 'Invita a 6 amigos y llévate un café gratis',
  cantidad_referidos: 6,
  tipo_recompensa: 'regalo_concreto',
  id_regalo: idCafeGratis,
  orden: 2
});
```

### Otorgar Regalo Manualmente

```typescript
const cupon = await this.regalosService.otorgarRegalo({
  clienteId: 'uuid-cliente',
  regaloId: 'uuid-regalo',
  origen: 'promocion',
  origenDetalles: { campaña: 'Black Friday 2025' }
});

// Enviar email con cupón
await this.regalosService.enviarEmailCupon(cupon.id);
```

### Ver Cupones de Cliente

```typescript
const cupones = await this.regalosService.getCuponesCliente(
  clienteId,
  true // solo disponibles
);

console.log(cupones);
// [
//   {
//     id: 'uuid',
//     codigo: 'CUPON-A3F2B1C4',
//     estado: 'disponible',
//     regalo_nombre: 'Café Gratis',
//     regalo_tipo: 'producto',
//     fecha_expiracion: '2025-12-22',
//     instrucciones_canje: 'Presenta en caja',
//     es_valido: true
//   }
// ]
```

### Marcar Cupón como Usado (Staff)

```typescript
await this.regalosService.marcarCuponUsado(
  cuponId,
  usuarioStaffId
);
// ✅ Cupón marcado como usado
```

### Verificar Milestones

```typescript
// Se ejecuta automáticamente al aumentar total_referidos
// También se puede llamar manualmente:
const result = await this.regalosService.verificarMilestonesCliente(clienteId);

console.log(result);
// {
//   milestones_alcanzados: [
//     {
//       milestone_id: 'uuid',
//       nombre: 'Invita 6 amigos',
//       cupon_id: 'uuid-del-cupon-generado',
//       puntos: 50
//     }
//   ],
//   total: 1
// }
```

---

## 🎨 Frontend - Componentes a Crear

### 1. Vista de Cupones del Cliente

**Ubicación:** `/[slug]/mis-cupones`

**Características:**
- 🎁 Lista de cupones disponibles
- ⏰ Fecha de expiración visible
- 📱 Código QR del cupón (para escanear en tienda)
- ✅ Estado (disponible, usado, expirado)
- 📋 Instrucciones de canje
- 🖼️ Icono o imagen del regalo

**Ejemplo de card:**
```tsx
<Card>
  <div className="flex items-center gap-4">
    <Coffee className="h-12 w-12 text-primary" />
    <div>
      <h3 className="font-bold">Café Gratis</h3>
      <p className="text-sm text-gray-500">
        Válido hasta: 22/12/2025
      </p>
    </div>
  </div>
  <div className="mt-4 bg-gray-100 p-4 rounded">
    <p className="text-xs text-gray-500">Tu código:</p>
    <p className="text-2xl font-bold tracking-wider">
      CUPON-A3F2B1C4
    </p>
  </div>
  <Button onClick={() => mostrarQR(cupon.codigo)}>
    Ver QR
  </Button>
</Card>
```

### 2. Progreso de Milestones

**Ubicación:** `/[slug]/mis-referidos` (actualizar página existente)

**Características:**
- 📊 Barra de progreso visual
- 🎯 Milestones desbloqueados vs pendientes
- 🎁 Recompensas de cada milestone
- ✨ Animación al desbloquear

**Ejemplo:**
```tsx
<div className="space-y-4">
  {milestones.map((milestone) => (
    <Card key={milestone.id}>
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold">{milestone.nombre}</h4>
          <p className="text-sm text-gray-500">{milestone.descripcion}</p>
        </div>
        {milestone.alcanzado ? (
          <Badge variant="success">✅ Desbloqueado</Badge>
        ) : (
          <Badge variant="outline">
            {totalReferidos}/{milestone.cantidad_referidos}
          </Badge>
        )}
      </div>
      <Progress
        value={(totalReferidos / milestone.cantidad_referidos) * 100}
        max={100}
      />
    </Card>
  ))}
</div>
```

### 3. Modal de Milestone Desbloqueado

**Trigger:** Cuando verificarMilestones devuelve nuevos milestones

**Características:**
- 🎉 Animación de confetti
- 🎁 Mostrar regalo obtenido
- 📲 Botón "Ver mi cupón"

**Ejemplo:**
```tsx
<Dialog open={nuevoMilestone}>
  <DialogContent>
    <Confetti />
    <h2 className="text-2xl font-bold text-center">
      🎉 ¡Milestone Desbloqueado!
    </h2>
    <div className="text-center">
      <Coffee className="h-24 w-24 mx-auto text-primary" />
      <p className="text-xl font-semibold mt-4">
        ¡Has ganado un Café Gratis!
      </p>
      <p className="text-gray-500">
        Invitaste a {totalReferidos} amigos
      </p>
    </div>
    <Button onClick={() => router.push('/mis-cupones')}>
      Ver mi cupón
    </Button>
  </DialogContent>
</Dialog>
```

### 4. Panel Admin - Gestión de Regalos

**Ubicación:** `/admin/regalos`

**Características:**
- ➕ Crear nuevo regalo
- 📝 Editar regalos existentes
- 🎯 Configurar milestones
- 📊 Ver estadísticas de canjes

**Form de creación:**
```tsx
<Form>
  <Input name="nombre" label="Nombre del regalo" />
  <Select name="tipo" label="Tipo">
    <option value="producto">Producto</option>
    <option value="descuento">Descuento</option>
    <option value="servicio">Servicio</option>
  </Select>
  <Input name="dias_validez" label="Días de validez" type="number" />
  <Textarea name="instrucciones_canje" label="Instrucciones" />
  <Button type="submit">Crear Regalo</Button>
</Form>
```

### 5. Panel Admin - Validar Cupones

**Ubicación:** `/admin/validar-cupon`

**Características:**
- 📷 Escanear QR del cupón
- 🔍 Buscar por código
- ✅ Marcar como usado
- 📊 Ver detalles del cliente

**Flujo:**
```tsx
1. Staff escanea QR o ingresa código
2. Sistema muestra:
   - Nombre del cliente
   - Regalo a canjear
   - Fecha de expiración
   - Estado actual
3. Staff confirma canje
4. Sistema marca cupón como usado
5. ✅ Confirmación visual
```

---

## 📊 Estadísticas y Reportes

### Para Tiendas

**Métricas importantes:**
- Total de cupones otorgados
- Tasa de canje (cupones usados / otorgados)
- Milestones más populares
- ROI del programa de referidos

**Query de ejemplo:**
```sql
SELECT
  r.nombre as regalo,
  COUNT(*) as total_otorgados,
  COUNT(CASE WHEN c.estado = 'usado' THEN 1 END) as total_canjeados,
  ROUND(COUNT(CASE WHEN c.estado = 'usado' THEN 1 END) * 100.0 / COUNT(*), 2) as tasa_canje
FROM cupones_regalos c
JOIN regalos_catalogo r ON c.id_regalo = r.id
WHERE c.id_tienda = '{tienda_id}'
GROUP BY r.nombre
ORDER BY total_otorgados DESC;
```

---

## 🎯 Ventajas del Sistema

### Para Clientes
✅ **Motivación clara:** Saben exactamente qué ganarán
✅ **Recompensas tangibles:** Café gratis vs "100 puntos"
✅ **Gamificación:** Milestones crean adicción
✅ **Exclusividad:** Cupones únicos con código

### Para Tiendas
✅ **Mayor engagement:** Clientes invitan más amigos
✅ **Flexible:** Configuran sus propios regalos
✅ **Control total:** Deciden qué, cuándo y cómo otorgar
✅ **Tracking completo:** Saben qué funciona mejor

### Para la Plataforma
✅ **Diferenciación:** Feature único en el mercado
✅ **Viral:** Sistema de referidos más efectivo
✅ **Escalable:** Funciona para cualquier tipo de negocio
✅ **Datos:** Insights sobre qué recompensas funcionan

---

## 🚀 Próximos Pasos

1. **Aplicar Migración:**
   ```bash
   supabase db push
   # O ejecutar manualmente: 20251122000004_regalos_concretos_y_milestones.sql
   ```

2. **Crear Datos de Ejemplo:**
   ```bash
   # Editar seed_regalos_ejemplo.sql con tu ID de tienda
   # Ejecutar en Supabase Dashboard
   ```

3. **Frontend - Componentes:**
   - [ ] Página `/mis-cupones`
   - [ ] Actualizar `/mis-referidos` con milestones
   - [ ] Modal de milestone desbloqueado
   - [ ] Panel admin `/admin/regalos`
   - [ ] Panel admin `/admin/validar-cupon`

4. **Testing:**
   - [ ] Crear regalo en catálogo
   - [ ] Configurar milestone
   - [ ] Registrar cliente
   - [ ] Invitar amigos
   - [ ] Verificar cupón generado
   - [ ] Canjear cupón

---

## 📖 Documentación Adicional

- **Migración SQL:** `backend/supabase/migrations/20251122000004_regalos_concretos_y_milestones.sql`
- **Seed de ejemplo:** `backend/supabase/seed_regalos_ejemplo.sql`
- **Servicio backend:** `backend/src/referidos/regalos.service.ts`

---

**¡El sistema está listo para usar!** 🎉
Configura tus regalos y milestones para empezar a ver engagement increíble. 🚀
