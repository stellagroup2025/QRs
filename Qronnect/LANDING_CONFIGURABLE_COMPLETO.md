# Sistema de Landing Page Totalmente Configurable por Base de Datos

## ✅ Implementación Completa

El sistema está **100% implementado** y listo para usar. Toda la landing page ahora es configurable desde el panel de administración.

---

## 🎯 ¿Qué se puede personalizar?

### 1. **Hero Section** (6 campos)
- Título principal
- Título destacado (con color de marca)
- Subtítulo descriptivo
- Botón principal (CTA)
- Botón secundario
- Social proof (texto de confianza)

### 2. **Servicios/Soluciones** (18 campos)
- Título y subtítulo de la sección
- 6 servicios, cada uno con:
  - Icono seleccionable (Users, Gift, TrendingUp, QrCode, Shield, Zap, Store)
  - Título
  - Descripción

### 3. **Beneficios** (8 campos)
- Título y subtítulo de la sección
- 6 beneficios específicos

### 4. **Estadísticas** (6 campos)
- Estadística principal (número + texto)
- Estadística 1 (número + texto)
- Estadística 2 (número + texto)

### 5. **Testimonios** (13 campos)
- Título de la sección
- 3 testimonios, cada uno con:
  - Nombre del cliente
  - Cargo/empresa
  - Contenido del testimonio
  - Rating (1-5 estrellas)

### 6. **CTA Final** (5 campos)
- Título línea 1
- Título línea 2
- Subtítulo
- Botón principal
- Botón secundario

**Total: 56 campos configurables**

---

## 📁 Archivos Creados/Modificados

### Backend:
1. **`backend/src/config/branding.controller.ts`**
   - ✅ Añadido endpoint `PUT /api/config/landing`
   - Protegido con `AdminAuthGuard`
   - Permite actualizar cualquier campo de la configuración

### Frontend:
2. **`frontend/hooks/use-landing.ts`** (NUEVO)
   - Hook personalizado para cargar configuración desde BD
   - Incluye valores por defecto
   - Manejo de errores y loading states
   - Interface TypeScript completa con 56 campos

3. **`frontend/app/page.tsx`** (REESCRITO)
   - Usa `useLanding()` hook
   - Carga todos los textos desde BD
   - Fallback a valores por defecto
   - Totalmente dinámico

4. **`frontend/app/admin/configuracion/landing/page.tsx`** (NUEVO)
   - Panel completo de administración
   - 5 pestañas organizadas por sección
   - Formularios para editar todos los campos
   - Preview en tiempo real (botón Vista Previa)
   - Guardado mediante API

---

## 🚀 Cómo Usar

### Para Administradores:

1. **Acceder al panel de configuración**:
   ```
   https://tutienda.qronnect.es/admin/configuracion/landing
   ```

2. **Editar contenidos**:
   - Navega por las pestañas (Hero, Servicios, Beneficios, Testimonios, CTA)
   - Edita los campos que desees
   - Haz clic en "Guardar Cambios"

3. **Ver cambios**:
   - Haz clic en "Vista Previa" para ver la landing en una nueva pestaña
   - Los cambios son inmediatos

### Para Desarrolladores:

#### Añadir nuevo campo:

1. **Base de datos**: Ya existe la columna en `landing_config`

2. **Interface TypeScript** (`frontend/hooks/use-landing.ts`):
   ```typescript
   export interface LandingConfig {
     // ... campos existentes
     nuevo_campo: string
   }
   ```

3. **Valor por defecto** (mismo archivo):
   ```typescript
   const DEFAULT_LANDING: LandingConfig = {
     // ... valores existentes
     nuevo_campo: "Valor por defecto",
   }
   ```

4. **Usar en página** (`frontend/app/page.tsx`):
   ```typescript
   const { landing } = useLanding()

   <h1>{landing.nuevo_campo}</h1>
   ```

5. **Añadir al panel admin** (`frontend/app/admin/configuracion/landing/page.tsx`):
   ```tsx
   <div className="space-y-2">
     <Label htmlFor="nuevo_campo">Nuevo Campo</Label>
     <Input
       id="nuevo_campo"
       value={config.nuevo_campo || ""}
       onChange={(e) => updateField("nuevo_campo", e.target.value)}
     />
   </div>
   ```

---

## 🔌 Endpoints API

### GET `/api/config/landing`
**Público** - No requiere autenticación

Retorna la configuración completa de la landing page para la tienda actual.

**Headers requeridos**:
```
X-Tenant-Domain: nombretienda
```

**Respuesta**:
```json
{
  "hero_titulo_principal": "Impulsa tu negocio",
  "hero_titulo_destacado": "al siguiente nivel",
  "hero_subtitulo": "Sistema integral de fidelización...",
  ...
}
```

### PUT `/api/config/landing`
**Protegido** - Requiere autenticación de Admin

Actualiza uno o más campos de la configuración.

**Headers requeridos**:
```
X-Tenant-Domain: nombretienda
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body** (actualización parcial permitida):
```json
{
  "hero_titulo_principal": "Nuevo título",
  "servicio_1_titulo": "Nuevo servicio"
}
```

**Respuesta**:
```json
{
  "id": "uuid",
  "id_tienda": "uuid",
  "hero_titulo_principal": "Nuevo título",
  ...
}
```

---

## 🎨 Integración con Branding

La landing page también usa el sistema de branding para:
- **Colores**: `branding.color_primario`, `color_secundario`, `color_acento`
- **Logo**: `branding.logo_url`
- **Nombre**: `branding.nombre_comercial`

Estos se configuran en:
```
/admin/configuracion/tienda
```

---

## 🗄️ Estructura de Base de Datos

### Tabla: `landing_config`

```sql
CREATE TABLE landing_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_tienda UUID REFERENCES tiendas(id) ON DELETE CASCADE,
  activo BOOLEAN DEFAULT true,

  -- Hero (6 campos)
  hero_titulo_principal TEXT,
  hero_titulo_destacado TEXT,
  hero_subtitulo TEXT,
  hero_cta_principal TEXT,
  hero_cta_secundario TEXT,
  hero_social_proof TEXT,

  -- Servicios (18 campos)
  servicios_titulo TEXT,
  servicios_subtitulo TEXT,
  servicio_1_titulo TEXT,
  servicio_1_descripcion TEXT,
  servicio_1_icono TEXT,
  ... (x6 servicios)

  -- Beneficios (8 campos)
  beneficios_titulo TEXT,
  beneficios_subtitulo TEXT,
  beneficio_1 TEXT,
  ... (x6 beneficios)

  -- Estadísticas (6 campos)
  estadistica_principal_numero TEXT,
  estadistica_principal_texto TEXT,
  estadistica_1_numero TEXT,
  estadistica_1_texto TEXT,
  estadistica_2_numero TEXT,
  estadistica_2_texto TEXT,

  -- Testimonios (13 campos)
  testimonios_titulo TEXT,
  testimonio_1_nombre TEXT,
  testimonio_1_cargo TEXT,
  testimonio_1_contenido TEXT,
  testimonio_1_rating INTEGER,
  ... (x3 testimonios)

  -- CTA Final (5 campos)
  cta_final_titulo_1 TEXT,
  cta_final_titulo_2 TEXT,
  cta_final_subtitulo TEXT,
  cta_final_boton_principal TEXT,
  cta_final_boton_secundario TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

---

## ✅ Checklist de Implementación

- [x] Endpoint GET `/api/config/landing` (ya existía)
- [x] Endpoint PUT `/api/config/landing` (añadido)
- [x] Hook `useLanding()` con interface completa
- [x] Migración de `page.tsx` a sistema dinámico
- [x] Panel admin con formularios organizados
- [x] Integración con sistema de branding
- [x] Valores por defecto para todos los campos
- [x] Manejo de errores y estados de carga
- [x] Documentación completa

---

## 🎓 Ejemplos de Uso

### Ejemplo 1: Cambiar título del Hero
1. Ir a `/admin/configuracion/landing`
2. Pestaña "Hero"
3. Editar "Título Principal": `"Revoluciona tu tienda"`
4. Editar "Título Destacado": `"con tecnología de punta"`
5. Guardar
6. Verificar en la home page

### Ejemplo 2: Personalizar servicios
1. Ir a `/admin/configuracion/landing`
2. Pestaña "Servicios"
3. Editar "Servicio 1":
   - Icono: `Store`
   - Título: `"Punto de Venta"`
   - Descripción: `"Sistema de caja rápido y eficiente"`
4. Guardar
5. Verificar en la home page

### Ejemplo 3: Actualizar testimonios
1. Ir a `/admin/configuracion/landing`
2. Pestaña "Testimonios"
3. Editar "Testimonio 1":
   - Nombre: `"Juan Pérez"`
   - Cargo: `"CEO, TechCorp"`
   - Contenido: `"Excelente servicio!"`
   - Rating: `5`
4. Guardar
5. Verificar en la home page

---

## 🐛 Troubleshooting

### Los cambios no se reflejan:
1. Verificar que se guardó correctamente (toast de éxito)
2. Refrescar la página de inicio (Ctrl+F5)
3. Verificar en DevTools > Network que se cargó el GET `/api/config/landing`

### Error al guardar:
1. Verificar que el token de admin es válido
2. Revisar logs del backend
3. Verificar que la tabla `landing_config` existe

### Campos vacíos:
- Si un campo no tiene valor en BD, se usa el valor por defecto de `DEFAULT_LANDING`

---

## 📊 Próximas Mejoras Posibles

- [ ] Vista previa en vivo (sin guardar)
- [ ] Historial de cambios (audit log)
- [ ] Plantillas predefinidas (templates)
- [ ] A/B testing de versiones
- [ ] Traducción multi-idioma
- [ ] Editor WYSIWYG
- [ ] Upload de imágenes para hero
- [ ] Más iconos disponibles

---

## 🎉 Conclusión

El sistema de landing configurable está **completamente funcional**. Los administradores pueden personalizar todos los textos de la landing page sin tocar código, directamente desde el panel de administración.

**Ruta del panel**: `/admin/configuracion/landing`

**¡Todo listo para usar!**
