# 🖼️ FAVICON Y ASSETS DINÁMICOS POR TENANT

**Fecha**: 22 de noviembre de 2025
**Funcionalidad**: Favicon, logo y Open Graph image personalizados por tienda

---

## 📋 RESUMEN

Cada tienda (tenant) puede tener su propio **favicon**, **logo** y **Open Graph image** completamente personalizados. Esto permite que cada negocio tenga su identidad visual única en:

- ✅ **Favicon** - Icono que aparece en la pestaña del navegador
- ✅ **Logo** - Logo principal del negocio
- ✅ **Open Graph Image** - Imagen que aparece al compartir en redes sociales (WhatsApp, Facebook, Twitter, etc.)

---

## 🎯 CASOS DE USO

### Ejemplo 1: Cafetería "Aroma Premium"
```
Dominio: aromapremium.qronnect.es
favicon_url: /brand/aromapremium/favicon.ico
logo_url: /brand/aromapremium/logo.svg
og_image_url: /brand/aromapremium/og-coffee.jpg

Resultado:
- Favicon de taza de café en la pestaña
- Logo de la cafetería en la app
- Imagen atractiva de café al compartir en WhatsApp
```

### Ejemplo 2: Perfumería "Essence Boutique"
```
Dominio: essence.qronnect.es
favicon_url: /brand/essence/favicon.ico
logo_url: /brand/essence/logo.svg
og_image_url: /brand/essence/og-perfume.jpg

Resultado:
- Favicon de frasco de perfume en la pestaña
- Logo elegante de la perfumería
- Imagen de productos al compartir
```

---

## 🏗️ ARQUITECTURA IMPLEMENTADA

### 1. BASE DE DATOS

**Migración**: `20251122000005_add_favicon_logo_to_tiendas.sql`

```sql
ALTER TABLE tiendas
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS favicon_url TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT;
```

**Campos agregados**:

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `logo_url` | TEXT | URL del logo | `/brand/cafeteria/logo.svg` |
| `favicon_url` | TEXT | URL del favicon | `/brand/cafeteria/favicon.ico` |
| `og_image_url` | TEXT | URL imagen OG (1200x630px) | `/brand/cafeteria/og.jpg` |

**Valores por defecto**:
- `logo_url`: `/brand/base/logo.svg`
- `favicon_url`: `/brand/base/favicon.ico`
- `og_image_url`: `/brand/base/og.jpg`

---

### 2. BACKEND

#### `backend/src/config/branding.service.ts`

**Método actualizado**: `getBranding()`

```typescript
async getBranding(idTienda: string) {
  const { data: tienda } = await client
    .from('tiendas')
    .select('logo_url, favicon_url, og_image_url, color_primario, ...')
    .eq('id', idTienda)
    .single();

  return {
    logo_url: tienda.logo_url || null,
    favicon_url: tienda.favicon_url || '/brand/base/favicon.ico',
    og_image_url: tienda.og_image_url || '/brand/base/og.jpg',
    color_primario: tienda.color_primario || '#000000',
    // ...
  };
}
```

**Endpoint**: `GET /api/config/branding`

**Headers requeridos**:
```
X-Tenant-Domain: aromapremium
```

**Respuesta**:
```json
{
  "logo_url": "/brand/aromapremium/logo.svg",
  "favicon_url": "/brand/aromapremium/favicon.ico",
  "og_image_url": "/brand/aromapremium/og-coffee.jpg",
  "color_primario": "#8B4513",
  "color_secundario": "#D2691E",
  "color_acento": "#FFD700",
  "nombre_comercial": "Aroma Premium Café"
}
```

---

### 3. FRONTEND

#### `frontend/hooks/use-branding.ts`

**Interface actualizada**:

```typescript
export interface BrandingConfig {
  logo_url: string | null
  favicon_url: string | null      // ⬅️ NUEVO
  og_image_url: string | null     // ⬅️ NUEVO
  color_primario: string
  color_secundario: string
  color_acento: string
  nombre_comercial: string
}
```

#### `frontend/components/BrandingProvider.tsx`

**Actualización dinámica del favicon** (líneas 68-82):

```typescript
// Actualizar favicon dinámicamente
if (branding.favicon_url) {
  const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement
  if (faviconLink) {
    faviconLink.href = branding.favicon_url
    console.log('🖼️ [BRANDING] Favicon actualizado:', branding.favicon_url)
  } else {
    // Crear el link si no existe
    const newFavicon = document.createElement('link')
    newFavicon.rel = 'icon'
    newFavicon.href = branding.favicon_url
    document.head.appendChild(newFavicon)
    console.log('🖼️ [BRANDING] Favicon creado:', branding.favicon_url)
  }
}
```

**Funcionamiento**:
1. El `BrandingProvider` obtiene la config del tenant
2. Cuando carga el branding, actualiza el `<link rel="icon">` dinámicamente
3. El cambio es instantáneo (sin reload de página)

#### `frontend/app/layout.tsx`

**Metadata dinámica del tenant** (líneas 33-89):

```typescript
// Función helper para obtener branding del tenant (si existe)
async function getTenantBranding(tenantDomain?: string) {
  if (!tenantDomain) return null

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const response = await fetch(`${API_URL}/api/config/branding`, {
    headers: { 'X-Tenant-Domain': tenantDomain },
    cache: 'no-store',
  })

  if (!response.ok) return null
  return await response.json()
}

export async function generateMetadata(): Promise<Metadata> {
  const tenantBranding = await getTenantBranding(tenantDomain)

  const favicon = tenantBranding?.favicon_url || BRAND.assets.favicon
  const ogImage = tenantBranding?.og_image_url || BRAND.assets.ogImage

  return {
    icons: favicon || undefined,
    openGraph: {
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      images: ogImage ? [ogImage] : undefined,
    },
  }
}
```

**Funcionamiento**:
1. Next.js genera metadata en el servidor (SSR)
2. Detecta el subdomain del request (ej: `aromapremium.qronnect.es`)
3. Hace fetch al backend para obtener branding del tenant
4. Usa favicon y OG image personalizados en los meta tags
5. Fallback a assets base si no hay tenant o error

---

## 📂 ESTRUCTURA DE ARCHIVOS

### Opción 1: Assets en `/public/brand/`

```
frontend/
└── public/
    └── brand/
        ├── base/                           # Assets por defecto
        │   ├── logo.svg
        │   ├── favicon.ico
        │   └── og.jpg
        ├── aromapremium/                   # Cafetería
        │   ├── logo.svg
        │   ├── favicon.ico
        │   └── og-coffee.jpg
        ├── essence/                        # Perfumería
        │   ├── logo.svg
        │   ├── favicon.ico
        │   └── og-perfume.jpg
        └── burgerco/                       # Hamburguesería
            ├── logo.svg
            ├── favicon.ico
            └── og-burger.jpg
```

**Ventajas**:
- ✅ Fácil de gestionar en desarrollo
- ✅ Versionado con Git
- ✅ Deploy junto con el código

**Desventajas**:
- ❌ Requiere redeploy para cambiar assets
- ❌ Todos los assets se descargan en cada deploy

### Opción 2: Assets en CDN/Storage externo

```sql
UPDATE tiendas
SET
  logo_url = 'https://cdn.qronnect.es/tiendas/aromapremium/logo.svg',
  favicon_url = 'https://cdn.qronnect.es/tiendas/aromapremium/favicon.ico',
  og_image_url = 'https://cdn.qronnect.es/tiendas/aromapremium/og.jpg'
WHERE dominio = 'aromapremium';
```

**Ventajas**:
- ✅ No requiere redeploy para cambiar assets
- ✅ Mejor performance (CDN distribuido)
- ✅ Gestión independiente del código
- ✅ Posibilidad de panel admin para subir assets

**Desventajas**:
- ❌ Requiere configurar CDN/Storage
- ❌ Costos adicionales de almacenamiento

---

## 🚀 CÓMO CONFIGURAR FAVICON PARA UNA TIENDA

### Opción A: Usando archivos locales en `/public`

#### Paso 1: Crear directorio de la tienda

```bash
cd frontend/public/brand
mkdir aromapremium
```

#### Paso 2: Añadir los assets

```bash
cp ~/Downloads/aromapremium-logo.svg aromapremium/logo.svg
cp ~/Downloads/aromapremium-favicon.ico aromapremium/favicon.ico
cp ~/Downloads/aromapremium-og.jpg aromapremium/og.jpg
```

**Especificaciones recomendadas**:
- **Logo**: SVG (escalable) o PNG transparente (512x512px mínimo)
- **Favicon**: ICO multi-resolución (16x16, 32x32, 48x48)
- **OG Image**: JPG/PNG 1200x630px (ratio 1.91:1)

#### Paso 3: Actualizar la base de datos

```sql
UPDATE tiendas
SET
  logo_url = '/brand/aromapremium/logo.svg',
  favicon_url = '/brand/aromapremium/favicon.ico',
  og_image_url = '/brand/aromapremium/og.jpg'
WHERE dominio = 'aromapremium';
```

#### Paso 4: Verificar

```bash
# Abrir navegador
open https://aromapremium.qronnect.es

# Verificar en DevTools > Network que carga:
# - /brand/aromapremium/favicon.ico
# - Metadata con og_image_url correcto
```

---

### Opción B: Usando CDN externo (Supabase Storage)

#### Paso 1: Subir archivos a Supabase Storage

```bash
# Usando CLI de Supabase
supabase storage upload tiendas/aromapremium/logo.svg ~/Downloads/logo.svg
supabase storage upload tiendas/aromapremium/favicon.ico ~/Downloads/favicon.ico
supabase storage upload tiendas/aromapremium/og.jpg ~/Downloads/og.jpg
```

O usando el panel de Supabase: **Storage > tiendas > Upload**

#### Paso 2: Obtener URLs públicas

```sql
-- Hacer público el bucket
UPDATE storage.buckets
SET public = true
WHERE name = 'tiendas';
```

URLs generadas (ejemplo):
```
https://{project-id}.supabase.co/storage/v1/object/public/tiendas/aromapremium/logo.svg
https://{project-id}.supabase.co/storage/v1/object/public/tiendas/aromapremium/favicon.ico
https://{project-id}.supabase.co/storage/v1/object/public/tiendas/aromapremium/og.jpg
```

#### Paso 3: Actualizar la base de datos

```sql
UPDATE tiendas
SET
  logo_url = 'https://xxxxx.supabase.co/storage/v1/object/public/tiendas/aromapremium/logo.svg',
  favicon_url = 'https://xxxxx.supabase.co/storage/v1/object/public/tiendas/aromapremium/favicon.ico',
  og_image_url = 'https://xxxxx.supabase.co/storage/v1/object/public/tiendas/aromapremium/og.jpg'
WHERE dominio = 'aromapremium';
```

---

## 🎨 PANEL DE ADMIN PARA SUBIR ASSETS (FUTURO)

### Diseño propuesto

**Ruta**: `/admin/branding`

**Funcionalidades**:
1. ✅ Preview del logo actual
2. ✅ Preview del favicon actual (16x16, 32x32, 48x48)
3. ✅ Preview del OG image actual
4. ✅ Botón "Cambiar Logo" → Upload
5. ✅ Botón "Cambiar Favicon" → Upload
6. ✅ Botón "Cambiar OG Image" → Upload
7. ✅ Validaciones:
   - Logo: SVG o PNG, max 2MB
   - Favicon: ICO, max 100KB
   - OG Image: JPG/PNG 1200x630px, max 5MB

**Backend endpoint**:
```typescript
@Post('branding/upload')
@UseGuards(AdminAuthGuard)
@UseInterceptors(FileInterceptor('file'))
async uploadAsset(
  @Tenant('id') idTienda: string,
  @Body('tipo') tipo: 'logo' | 'favicon' | 'og_image',
  @UploadedFile() file: Express.Multer.File
) {
  // 1. Validar tamaño y tipo
  // 2. Subir a Supabase Storage
  // 3. Obtener URL pública
  // 4. Actualizar tienda.{tipo}_url
  // 5. Retornar nueva URL
}
```

---

## 🧪 TESTING

### Test 1: Verificar que favicon se carga dinámicamente

```bash
# 1. Abrir https://aromapremium.qronnect.es
# 2. Abrir DevTools > Network
# 3. Filtrar por "favicon"
# 4. Verificar request a /brand/aromapremium/favicon.ico
# 5. Verificar que aparece en la pestaña del navegador
```

### Test 2: Verificar metadata de Open Graph

```bash
# 1. Abrir https://aromapremium.qronnect.es
# 2. View Page Source
# 3. Buscar <meta property="og:image"
# 4. Verificar que apunta a /brand/aromapremium/og.jpg
```

### Test 3: Verificar compartir en WhatsApp

```bash
# 1. Copiar URL: https://aromapremium.qronnect.es/registro
# 2. Pegar en chat de WhatsApp
# 3. Verificar que aparece preview con:
#    - Título: "Aroma Premium Café - Programa de Fidelización"
#    - Imagen: og.jpg de la cafetería
```

### Test 4: Verificar fallback a defaults

```bash
# 1. Crear tienda nueva sin assets configurados
# 2. Abrir https://nuevatienda.qronnect.es
# 3. Verificar que carga /brand/base/favicon.ico
# 4. Verificar que no hay errores 404
```

---

## 📊 MÉTRICAS Y ANALYTICS

### Tracking de impacto

**¿Cómo medir si el favicon personalizado mejora la experiencia?**

1. **Brand Recognition**:
   - Usuarios que vuelven directamente (tipo entrada: Direct)
   - Tiempo en página (mayor engagement)

2. **Social Sharing**:
   - Clicks en links compartidos (tracking con UTMs)
   - CTR de previews de WhatsApp/Facebook

3. **Conversión**:
   - % de usuarios que completan registro
   - % de usuarios que escanean QR

**Google Analytics 4**:
```javascript
// Trackear cuando se carga favicon personalizado
gtag('event', 'favicon_loaded', {
  tenant: 'aromapremium',
  favicon_url: '/brand/aromapremium/favicon.ico'
});
```

---

## 🔒 SEGURIDAD

### Consideraciones importantes

1. **Validación de URLs**:
   ```typescript
   // Backend debe validar que las URLs sean seguras
   if (!url.startsWith('/brand/') && !url.startsWith('https://cdn.qronnect.es')) {
     throw new Error('URL no permitida');
   }
   ```

2. **Content Security Policy (CSP)**:
   ```typescript
   // Next.js config
   headers: [
     {
       key: 'Content-Security-Policy',
       value: "img-src 'self' https://cdn.qronnect.es *.supabase.co"
     }
   ]
   ```

3. **Rate limiting en uploads**:
   ```typescript
   // Limitar uploads a 10 por día por tienda
   @Throttle(10, 86400)
   async uploadAsset() { ... }
   ```

---

## 🐛 TROUBLESHOOTING

### Problema 1: Favicon no se actualiza

**Síntoma**: Sigue mostrando el favicon antiguo

**Causas**:
1. Cache del navegador
2. Cache del CDN
3. Cambio en BD no reflejado

**Solución**:
```bash
# 1. Limpiar cache del navegador
Ctrl+Shift+R (Chrome/Firefox)

# 2. Verificar BD
SELECT favicon_url FROM tiendas WHERE dominio = 'aromapremium';

# 3. Verificar que el archivo existe
curl https://aromapremium.qronnect.es/brand/aromapremium/favicon.ico

# 4. Agregar cache-busting
favicon_url = '/brand/aromapremium/favicon.ico?v=2'
```

### Problema 2: Favicon da 404

**Síntoma**: Error 404 al cargar favicon

**Causas**:
1. Archivo no existe en `/public/brand/`
2. URL incorrecta en BD
3. Permisos incorrectos

**Solución**:
```bash
# 1. Verificar que el archivo existe
ls -la frontend/public/brand/aromapremium/

# 2. Verificar URL en BD
SELECT favicon_url FROM tiendas WHERE dominio = 'aromapremium';

# 3. Verificar permisos (si es storage externo)
# En Supabase: Storage > tiendas > Make public
```

### Problema 3: OG Image no aparece en WhatsApp

**Síntoma**: Al compartir, WhatsApp no muestra preview

**Causas**:
1. Meta tags incorrectos
2. Imagen demasiado pesada (>5MB)
3. Dimensiones incorrectas
4. Cache de WhatsApp

**Solución**:
```bash
# 1. Verificar meta tags
curl -s https://aromapremium.qronnect.es | grep "og:image"

# 2. Optimizar imagen
# - Tamaño: 1200x630px
# - Peso: <300KB
# - Formato: JPG (mejor compresión)

# 3. Limpiar cache de WhatsApp
# WhatsApp cachea previews por 7 días
# Cambiar URL: og.jpg → og-v2.jpg
```

---

## 📚 REFERENCIAS

### Especificaciones técnicas

- **Favicon**: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/icon
- **Open Graph**: https://ogp.me/
- **Twitter Cards**: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards
- **Next.js Metadata**: https://nextjs.org/docs/app/api-reference/functions/generate-metadata

### Herramientas útiles

- **Favicon Generator**: https://realfavicongenerator.net/
- **OG Image Preview**: https://www.opengraph.xyz/
- **Image Optimizer**: https://tinypng.com/
- **Favicon Checker**: https://www.favicon-checker.com/

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Para cada nueva tienda:

- [ ] Crear directorio en `/public/brand/{dominio}/` o subir a Storage
- [ ] Añadir logo (SVG o PNG, 512x512px mínimo)
- [ ] Añadir favicon (ICO multi-resolución)
- [ ] Añadir OG image (JPG/PNG 1200x630px)
- [ ] Actualizar BD con las 3 URLs
- [ ] Verificar en navegador que el favicon se muestra
- [ ] Verificar meta tags con View Source
- [ ] Probar compartir en WhatsApp y verificar preview
- [ ] Probar en móvil y desktop
- [ ] Documentar assets en README de la tienda

---

## 🎉 BENEFICIOS ALCANZADOS

1. **Branding Completo**:
   - ✅ Cada tienda tiene su identidad visual única
   - ✅ Favicon personalizado en pestaña del navegador
   - ✅ Logo propio en la aplicación
   - ✅ Imagen atractiva al compartir en redes

2. **Experiencia de Usuario**:
   - ✅ Profesionalidad y confianza
   - ✅ Fácil identificación de la tienda
   - ✅ Mejor engagement en redes sociales

3. **SEO y Social Sharing**:
   - ✅ Previews atractivos en WhatsApp/Facebook/Twitter
   - ✅ Mayor CTR en links compartidos
   - ✅ Mejor posicionamiento de marca

4. **Flexibilidad**:
   - ✅ Soporta rutas locales (`/brand/...`)
   - ✅ Soporta URLs externas (CDN, Storage)
   - ✅ Fallback automático a assets por defecto
   - ✅ Actualización dinámica sin reload

---

**Última actualización**: 22 de noviembre de 2025
**Autor**: Claude Code
**Estado**: ✅ Implementado y documentado completamente
