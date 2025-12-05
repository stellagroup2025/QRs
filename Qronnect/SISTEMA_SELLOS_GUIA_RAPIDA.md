# 🎯 Sistema de Sellos - Guía Rápida de Implementación

## ✅ Estado del Proyecto

### Completado:

- ✅ **Base de datos**: Migración SQL completa con 3 tablas, funciones y vistas
- ✅ **Backend NestJS**: Servicio, controlador, DTOs e interfaces
- ✅ **Frontend TypeScript**: Tipos, interfaces y helpers
- ✅ **API Service**: Cliente HTTP completo para todas las operaciones
- ✅ **Componentes Admin**: Panel de programas, formulario, otorgar sellos, canjear cupones
- ✅ **Componentes Cliente**: Vista de tarjetas y visualización de progreso
- ✅ **Documentación**: README técnico completo

### Pendiente:

- ⏳ **Aplicar migración SQL** en Supabase (solo ejecutar el archivo)

---

## 🚀 Instalación en 3 Pasos

### 1. Aplicar la Migración SQL

Ejecuta el archivo de migración en Supabase SQL Editor:

```bash
backend/supabase/migrations/20251204000001_create_stamp_cards_system.sql
```

O copia y pega el contenido directamente en el SQL Editor de Supabase.

**Verificación:**
```sql
-- Verificar que las tablas se crearon
SELECT COUNT(*) FROM public.programas_sellos;
SELECT COUNT(*) FROM public.tarjetas_sellos_clientes;
SELECT COUNT(*) FROM public.sellos_otorgados;

-- Verificar las funciones
SELECT proname FROM pg_proc WHERE proname LIKE '%sello%';
-- Deberías ver: generar_codigo_cupon_sello, otorgar_sello, canjear_cupon_sello
```

### 2. Módulo ya registrado en NestJS ✓

El módulo `SellosModule` ya está importado en `app.module.ts`.

### 3. Componentes listos para usar ✓

Todos los componentes están creados y listos para integrar en tus páginas.

---

## 📁 Estructura de Archivos Creados

```
backend/
├── src/sellos/
│   ├── dto/
│   │   ├── create-programa-sellos.dto.ts
│   │   ├── update-programa-sellos.dto.ts
│   │   ├── otorgar-sello.dto.ts
│   │   └── canjear-cupon-sello.dto.ts
│   ├── interfaces/
│   │   └── programa-sellos.interface.ts
│   ├── sellos.controller.ts
│   ├── sellos.service.ts
│   └── sellos.module.ts
├── supabase/migrations/
│   └── 20251204000001_create_stamp_cards_system.sql
└── SISTEMA_SELLOS_README.md

frontend/
├── lib/api/
│   └── sellos.ts
├── types/
│   └── sellos.ts
└── components/
    ├── admin/sellos/
    │   ├── ProgramasSellosPanel.tsx
    │   ├── ProgramaSelloFormModal.tsx
    │   ├── OtorgarSelloModal.tsx
    │   └── CanjearCuponModal.tsx
    └── cliente/sellos/
        ├── MisTarjetasSellos.tsx
        └── TarjetaSelloCard.tsx
```

---

## 🎨 Integración en tus Páginas

### Panel de Admin - Gestión de Programas

```tsx
// app/admin/sellos/page.tsx
import { ProgramasSellosPanel } from '@/components/admin/sellos/ProgramasSellosPanel';

export default function SellosAdminPage() {
  const token = 'tu-token'; // Obtener del contexto de autenticación

  return (
    <div className="container mx-auto py-8">
      <ProgramasSellosPanel token={token} />
    </div>
  );
}
```

### Panel de Admin - Otorgar Sello a Cliente

```tsx
// En tu componente de detalle de cliente
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OtorgarSelloModal } from '@/components/admin/sellos/OtorgarSelloModal';

export function ClienteDetalle({ cliente, token }) {
  const [modalSelloAbierto, setModalSelloAbierto] = useState(false);

  return (
    <div>
      {/* ... resto del componente ... */}

      <Button onClick={() => setModalSelloAbierto(true)}>
        Otorgar Sello
      </Button>

      {modalSelloAbierto && (
        <OtorgarSelloModal
          idCliente={cliente.id}
          nombreCliente={cliente.nombre}
          token={token}
          onClose={(otorgado) => {
            setModalSelloAbierto(false);
            if (otorgado) {
              // Recargar datos del cliente si es necesario
            }
          }}
        />
      )}
    </div>
  );
}
```

### Panel de Admin - Canjear Cupón

```tsx
// app/admin/sellos/canjear/page.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CanjearCuponModal } from '@/components/admin/sellos/CanjearCuponModal';

export default function CanjearCuponPage() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const token = 'tu-token';

  return (
    <div className="container mx-auto py-8">
      <Button onClick={() => setModalAbierto(true)}>
        Canjear Cupón
      </Button>

      {modalAbierto && (
        <CanjearCuponModal
          token={token}
          onClose={(canjeado) => {
            setModalAbierto(false);
          }}
        />
      )}
    </div>
  );
}
```

### Vista de Cliente - Mis Tarjetas

```tsx
// app/[slug]/sellos/page.tsx
import { MisTarjetasSellos } from '@/components/cliente/sellos/MisTarjetasSellos';

export default function MisSellosPage() {
  const idCliente = 'id-del-cliente'; // Obtener del contexto
  const token = 'token-del-cliente';

  return (
    <div className="container mx-auto py-8">
      <MisTarjetasSellos idCliente={idCliente} token={token} />
    </div>
  );
}
```

---

## 🔄 Flujo de Uso Típico

### 1️⃣ Admin crea un programa

```tsx
// El admin accede a /admin/sellos
// Clic en "Nuevo Programa"
// Completa el formulario:
{
  nombre: "Cafetería - 10 cafés",
  descripcion: "Compra 10 cafés y llévate el 11º gratis",
  sellos_requeridos: 10,
  tipo_premio: "producto",
  premio_detalles: {
    nombre: "Café gratis",
    descripcion: "Un café de cualquier tamaño"
  },
  color: "#8B4513",
  dias_validez_cupon: 30,
  sellos_por_dia_max: 1
}
```

### 2️⃣ Cliente realiza compra → Staff otorga sello

```tsx
// Staff busca al cliente en el sistema
// Clic en "Otorgar Sello"
// Selecciona el programa "Cafetería - 10 cafés"
// Opcional: Añade nota "Café americano grande"
// Clic en "Otorgar Sello"

// Sistema responde:
// - Si es sello 1-9: "Sello otorgado (5/10)"
// - Si es sello 10: "¡Completada! Cupón: SELLO-ABC12345"
```

### 3️⃣ Cliente ve su progreso

```tsx
// Cliente accede a /sellos
// Ve sus tarjetas activas:
//
// ┌─────────────────────────────┐
// │ Cafetería - 10 cafés        │
// │ 5 de 10 sellos              │
// │ ━━━━━━━━━━━━━━━━━ 50%       │
// │ ●●●●●○○○○○                   │
// └─────────────────────────────┘
```

### 4️⃣ Cliente completa tarjeta y recibe cupón

```tsx
// Al completar la tarjeta:
//
// ┌─────────────────────────────┐
// │ Cafetería - 10 cafés        │
// │ ✓ COMPLETADA                │
// │                             │
// │ Tu código de cupón:         │
// │ ┌─────────────────────┐     │
// │ │  SELLO-ABC12345     │     │
// │ └─────────────────────┘     │
// │                             │
// │ Válido por 30 días          │
// └─────────────────────────────┘
```

### 5️⃣ Cliente canjea el cupón

```tsx
// Cliente presenta el código en el establecimiento
// Staff accede a /admin/sellos/canjear
// Ingresa código: SELLO-ABC12345
// Clic en "Verificar"
// Sistema muestra:
//   ✓ Cupón válido
//   Cliente: Juan Pérez
//   Premio: Café gratis
// Staff clic en "Canjear Cupón"
// Sistema: "✓ Cupón canjeado exitosamente"
```

---

## 🎯 Endpoints API Disponibles

### Programas (Admin)
```
POST   /sellos/programas              # Crear programa
GET    /sellos/programas              # Listar programas
GET    /sellos/programas/:id          # Obtener programa
PUT    /sellos/programas/:id          # Actualizar programa
DELETE /sellos/programas/:id          # Desactivar programa
GET    /sellos/programas/:id/estadisticas  # Estadísticas
```

### Otorgar y Canjear (Staff)
```
POST   /sellos/otorgar                # Otorgar sello
POST   /sellos/canjear                # Canjear cupón
GET    /sellos/verificar-cupon/:codigo  # Verificar cupón
```

### Tarjetas
```
GET    /sellos/clientes/:id/tarjetas  # Tarjetas de cliente
GET    /sellos/tarjetas               # Todas las tarjetas (admin)
GET    /sellos/tarjetas/:id           # Detalle de tarjeta
GET    /sellos/tarjetas/:id/sellos    # Sellos de tarjeta
DELETE /sellos/tarjetas/:id           # Cancelar tarjeta
```

### Estadísticas
```
GET    /sellos/estadisticas           # Estadísticas generales
```

---

## 📊 Ejemplos de Datos

### Crear Programa - Ejemplo Real

```json
{
  "nombre": "Peluquería - 6 Visitas",
  "descripcion": "Corta tu pelo 6 veces y la 7ª es gratis",
  "icono": "scissors",
  "color": "#EC4899",
  "sellos_requeridos": 6,
  "tipo_premio": "producto",
  "premio_detalles": {
    "nombre": "Corte de pelo gratis",
    "descripcion": "Corte clásico de caballero o señora"
  },
  "instrucciones_canje": "Presentar cupón antes del servicio",
  "dias_validez_cupon": 60,
  "sellos_por_dia_max": 1,
  "activo": true,
  "visible_cliente": true
}
```

### Otorgar Sello - Ejemplo

```json
{
  "id_cliente": "uuid-cliente",
  "id_programa": "uuid-programa",
  "notas": "Corte de pelo clásico"
}
```

### Respuesta al Completar Tarjeta

```json
{
  "success": true,
  "tarjeta_id": "uuid-tarjeta",
  "sello_id": "uuid-sello",
  "sellos_actuales": 6,
  "sellos_objetivo": 6,
  "completada": true,
  "codigo_cupon": "SELLO-A3F2B1C9",
  "premio": {
    "nombre": "Corte de pelo gratis",
    "descripcion": "Corte clásico de caballero o señora"
  }
}
```

---

## 🎨 Personalización Visual

Los componentes usan **Tailwind CSS** y **shadcn/ui**. Puedes personalizar:

### Colores de programa
```tsx
// Cada programa puede tener su color
color: "#8B4513"  // Marrón para cafetería
color: "#EC4899"  // Rosa para peluquería
color: "#10B981"  // Verde para tienda ecológica
```

### Iconos (Lucide React)
```tsx
// Iconos disponibles:
icono: "coffee"    // ☕ Cafetería
icono: "scissors"  // ✂️ Peluquería
icono: "utensils"  // 🍽️ Restaurante
icono: "dumbbell"  // 🏋️ Gimnasio
icono: "book"      // 📚 Librería
```

---

## 🔒 Seguridad Implementada

✅ **Row Level Security (RLS)** activado en todas las tablas
✅ **Validaciones** de cupones (expiración, uso único)
✅ **Límite de sellos por día** configurable
✅ **Códigos únicos** generados automáticamente
✅ **Registro de auditoría** (quién otorgó, quién canjeó)

---

## 🐛 Troubleshooting

### Error: "Module not found: sellos"
```bash
# Verifica que el módulo esté registrado en app.module.ts
# El import ya está añadido en línea 26
```

### Error: "Función otorgar_sello no existe"
```bash
# Aplica la migración SQL primero:
backend/supabase/migrations/20251204000001_create_stamp_cards_system.sql
```

### Error: "Cannot read property 'nombre'"
```bash
# Verifica que premio_detalles tenga la estructura correcta según el tipo
tipo_premio: "producto" → { nombre: "...", descripcion: "..." }
tipo_premio: "puntos" → { puntos: 100 }
```

---

## 📈 Próximas Mejoras Sugeridas

- [ ] Notificaciones push al completar tarjeta
- [ ] Escaneo de QR para auto-otorgar sellos
- [ ] Tarjetas compartidas (familia/amigos)
- [ ] Días especiales con sellos dobles
- [ ] Exportar cupón como imagen/PDF
- [ ] Dashboard analytics avanzado
- [ ] Integración con sistema de email/SMS

---

## 📞 Soporte

**Documentación completa:**
`backend/SISTEMA_SELLOS_README.md`

**Archivos clave:**
- SQL: `backend/supabase/migrations/20251204000001_create_stamp_cards_system.sql`
- Backend: `backend/src/sellos/`
- Frontend: `frontend/components/admin/sellos/` y `frontend/components/cliente/sellos/`
- Tipos: `frontend/types/sellos.ts`
- API: `frontend/lib/api/sellos.ts`

---

## ✨ ¡Todo Listo!

Solo falta **aplicar la migración SQL** y el sistema está 100% funcional.

```bash
# 1. Aplica la migración en Supabase
# 2. Integra los componentes en tus páginas
# 3. ¡Empieza a usar el sistema de sellos!
```

🎉 **¡Disfruta del nuevo sistema de fidelización por sellos!**
