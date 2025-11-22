# 🔧 Problema: Cambios en Landing Config No Se Aplican

**Reportado**: 22 Nov 2025
**URL afectada**: https://perfectnails.qronnect.es/

---

## 🔍 Problema Identificado

Los cambios que haces en `/admin/configuracion/landing` se guardan correctamente en la base de datos, **pero la landing page pública NO los muestra**.

### Causa Raíz:

La landing page pública (`app/page.tsx`) tiene **todos los textos hardcodeados** en el componente React. No está consumiendo el endpoint `/api/config/landing`.

```typescript
// ❌ PROBLEMA: Textos hardcodeados (líneas 112-182)
const services = [
  {
    icon: Users,
    title: 'Gestión de Clientes',  // ← Hardcodeado
    description: 'Sistema completo...'  // ← Hardcodeado
  },
  // ... más servicios hardcodeados
]

const benefits = [
  'Aumenta la retención de clientes hasta un 40%',  // ← Hardcodeado
  'Reduce costos operativos eliminando tarjetas físicas',  // ← Hardcodeado
  // ... más beneficios hardcodeados
]
```

---

## ✅ Solución Implementada

### 1. Hook Personalizado (`hooks/use-landing-config.ts`)

He creado un hook React que:
- ✅ Detecta el dominio del tenant (perfectnails, dolcefrio, etc.)
- ✅ Llama a `/api/config/landing` con el header `X-Tenant-Domain`
- ✅ Retorna la configuración específica de esa tienda
- ✅ Tiene fallback a valores por defecto si falla

**Uso**:
```typescript
import { useLandingConfig } from '@/hooks/use-landing-config'

export default function HomePage() {
  const { config, loading } = useLandingConfig()

  // Ahora puedes usar config.hero_titulo_principal, etc.
}
```

### 2. Modificar `app/page.tsx` (PENDIENTE)

Necesitas reemplazar los valores hardcodeados con los del hook.

**Cambios necesarios**:

#### A. Importar el hook (línea ~6):
```typescript
import { useLandingConfig } from '@/hooks/use-landing-config'
```

#### B. Usar el hook (línea ~37):
```typescript
export default function HomePage() {
  const { branding, loading: brandingLoading } = useBrandingContext()
  const { config, loading: configLoading } = useLandingConfig()  // ← AGREGAR

  const loading = brandingLoading || configLoading  // ← MODIFICAR
```

#### C. Reemplazar services array (líneas 112-149):
```typescript
// ANTES:
const services = [
  {
    icon: Users,
    title: 'Gestión de Clientes',
    description: 'Sistema completo...'
  },
  // ...
]

// DESPUÉS:
const iconMap: Record<string, any> = {
  Users,
  Gift,
  TrendingUp,
  QrCode,
  Shield,
  Zap,
}

const services = [
  {
    icon: iconMap[config.servicio_1_icono] || Users,
    title: config.servicio_1_titulo,
    description: config.servicio_1_descripcion,
  },
  {
    icon: iconMap[config.servicio_2_icono] || Gift,
    title: config.servicio_2_titulo,
    description: config.servicio_2_descripcion,
  },
  {
    icon: iconMap[config.servicio_3_icono] || TrendingUp,
    title: config.servicio_3_titulo,
    description: config.servicio_3_descripcion,
  },
  {
    icon: iconMap[config.servicio_4_icono] || QrCode,
    title: config.servicio_4_titulo,
    description: config.servicio_4_descripcion,
  },
  {
    icon: iconMap[config.servicio_5_icono] || Shield,
    title: config.servicio_5_titulo,
    description: config.servicio_5_descripcion,
  },
  {
    icon: iconMap[config.servicio_6_icono] || Zap,
    title: config.servicio_6_titulo,
    description: config.servicio_6_descripcion,
  },
]
```

#### D. Reemplazar benefits array (líneas 151-158):
```typescript
// ANTES:
const benefits = [
  'Aumenta la retención de clientes hasta un 40%',
  'Reduce costos operativos eliminando tarjetas físicas',
  // ...
]

// DESPUÉS:
const benefits = [
  config.beneficio_1,
  config.beneficio_2,
  config.beneficio_3,
  config.beneficio_4,
  config.beneficio_5,
  config.beneficio_6,
]
```

#### E. Reemplazar testimonials array (líneas 160-182):
```typescript
// ANTES:
const testimonials = [
  {
    name: 'María García',
    role: 'Gerente, Boutique Fashion',
    content: 'Desde que implementamos...',
    rating: 5
  },
  // ...
]

// DESPUÉS:
const testimonials = [
  {
    name: config.testimonio_1_nombre,
    role: config.testimonio_1_cargo,
    content: config.testimonio_1_contenido,
    rating: config.testimonio_1_rating,
  },
  {
    name: config.testimonio_2_nombre,
    role: config.testimonio_2_cargo,
    content: config.testimonio_2_contenido,
    rating: config.testimonio_2_rating,
  },
  {
    name: config.testimonio_3_nombre,
    role: config.testimonio_3_cargo,
    content: config.testimonio_3_contenido,
    rating: config.testimonio_3_rating,
  },
]
```

#### F. Reemplazar metrics array (líneas 50-66):
```typescript
// ANTES:
const metrics = [
  {
    id: 'retention',
    value: '40%',
    label: 'Incremento promedio en retención'
  },
  // ...
]

// DESPUÉS:
const metrics = [
  {
    id: 'retention',
    value: config.estadistica_principal_numero,
    label: config.estadistica_principal_texto,
  },
  {
    id: 'businesses',
    value: config.estadistica_1_numero,
    label: config.estadistica_1_texto,
  },
  {
    id: 'users',
    value: config.estadistica_2_numero,
    label: config.estadistica_2_texto,
  },
]
```

#### G. Reemplazar títulos del Hero (líneas ~217-221):
```typescript
// ANTES:
<h1 className='...'>
  <span className='...'>Impulsa tu negocio</span>
  <br />
  <span className='...' style={{...}}>
    al siguiente nivel
  </span>
</h1>

// DESPUÉS:
<h1 className='...'>
  <span className='...'>{config.hero_titulo_principal}</span>
  <br />
  <span className='...' style={{...}}>
    {config.hero_titulo_destacado}
  </span>
</h1>
```

#### H. Reemplazar subtítulo y CTAs del Hero:
Buscar en las líneas ~224-240 y reemplazar:
- `Sistema integral de fidelización...` → `{config.hero_subtitulo}`
- `+10,000 negocios confían en nosotros` → `{config.hero_social_proof}`
- `Solicitar Información` → `{config.hero_cta_principal}`
- `Acceder` → `{config.hero_cta_secundario}`

#### I. Reemplazar títulos de secciones:
- Sección Servicios: `Soluciones completas` → `{config.servicios_titulo}`
- Sección Servicios subtítulo → `{config.servicios_subtitulo}`
- Sección Beneficios: `¿Por qué elegirnos?` → `{config.beneficios_titulo}`
- Sección Beneficios subtítulo → `{config.beneficios_subtitulo}`
- Sección Testimonios: `Lo que dicen nuestros clientes` → `{config.testimonios_titulo}`

#### J. Reemplazar CTA Final (al final del archivo):
- `¿Listo para transformar` → `{config.cta_final_titulo_1}`
- `tu negocio?` → `{config.cta_final_titulo_2}`
- `Únete a miles de negocios...` → `{config.cta_final_subtitulo}`
- `Comenzar ahora` → `{config.cta_final_boton_principal}`
- `Ya tengo cuenta` → `{config.cta_final_boton_secundario}`

---

## 🧪 Testing

Después de hacer los cambios:

1. **Verificar configuración en backend**:
```bash
curl "https://qronnect-backend.onrender.com/api/config/landing" \
  -H "X-Tenant-Domain: perfectnails"
```

Debe retornar:
```json
{
  "hero_titulo_principal": "Las mejores uñas del mercado",
  ...
}
```

2. **Editar en admin**:
- Ir a https://perfectnails.qronnect.es/admin/configuracion/landing
- Cambiar "Hero → Título Principal" a "Bienvenida a Perfect Nails"
- Guardar

3. **Verificar en landing pública**:
- Ir a https://perfectnails.qronnect.es/
- Debe mostrar "Bienvenida a Perfect Nails"

---

## 📊 Impacto

**Antes**:
- ❌ Todos los tenants muestran los mismos textos
- ❌ Cambios en `/admin/configuracion/landing` no tienen efecto
- ❌ Necesitas editar código para cambiar textos

**Después**:
- ✅ Cada tenant muestra sus propios textos
- ✅ Cambios en admin se reflejan inmediatamente
- ✅ Sin necesidad de tocar código

---

## 🚀 Próximos Pasos

1. ✅ Hook creado (`hooks/use-landing-config.ts`)
2. ⏳ Modificar `app/page.tsx` con los cambios de arriba
3. ⏳ Commit y push a producción
4. ⏳ Testing en https://perfectnails.qronnect.es/

---

## 💡 Alternativa Rápida (Si No Quieres Modificar page.tsx Ahora)

Si prefieres no modificar `app/page.tsx` ahora porque es un archivo grande y complejo, puedes:

1. **Crear una nueva landing configurable** en `/[slug]/page.tsx` (por tenant)
2. **Dejar la landing principal** (`/page.tsx`) como está para Qronnect
3. **Redirigir automáticamente** de `/` a `/[tenant]` cuando detectes un subdominio

Esto sería más seguro pero requiere reestructurar la navegación.

---

**Estado**: Hook creado ✅ | Modificaciones de page.tsx pendientes ⏳
