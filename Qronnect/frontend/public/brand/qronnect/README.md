# 🎨 Assets de Branding de Qronnect

Este directorio contiene los assets por defecto que se usan cuando una tienda no tiene configurado su propio branding.

## 📁 Archivos Actuales

### logo.svg
✅ **Estado**: Creado y optimizado
- **Descripción**: Logo de Qronnect con QR estilizado
- **Tamaño**: 200x200px (escalable)
- **Colores**: Gradiente azul (#0ea5e9) a índigo (#6366f1)
- **Uso**: Se muestra en toda la aplicación cuando no hay logo personalizado

### favicon.ico
⚠️ **Estado**: Temporal (copiado de /base/)
- **Descripción**: Favicon básico temporal
- **Tamaño**: 16x16, 32x32, 48x48 (multi-resolución)
- **Recomendación**: REEMPLAZAR con favicon profesional

### og-qronnect.jpg
⚠️ **Estado**: Temporal (copiado de /base/)
- **Descripción**: Imagen Open Graph temporal
- **Tamaño**: 1200x630px
- **Recomendación**: REEMPLAZAR con imagen de marca Qronnect

---

## 🔧 Cómo Mejorar los Assets

### Opción 1: Usar Herramientas Online (Más Fácil)

#### Crear Favicon Profesional

1. **Ir a**: https://realfavicongenerator.net/

2. **Subir**: El archivo `logo.svg` de este directorio

3. **Configurar**:
   - iOS Icon: ✅
   - Android Chrome: ✅
   - Windows Metro: ✅
   - macOS Safari: ✅

4. **Generar y Descargar**:
   - Descargar el paquete ZIP
   - Extraer `favicon.ico`
   - Reemplazar el archivo aquí

#### Crear Open Graph Image

1. **Ir a**: https://www.canva.com/ o https://www.figma.com/

2. **Crear diseño**:
   - Dimensiones: 1200x630px
   - Usar colores de Qronnect: #0ea5e9, #6366f1
   - Incluir:
     * Logo de Qronnect (grande)
     * Texto: "Qronnect - Fidelización con QR"
     * Tagline: "Sistema de fidelización para negocios"
     * Fondo atractivo con gradiente

3. **Exportar**:
   - Formato: JPG
   - Calidad: Alta (pero <300KB)
   - Guardar como: `og-qronnect.jpg`

### Opción 2: Usar Código (Para Desarrolladores)

#### Convertir logo.svg a favicon.ico con ImageMagick

```bash
# Instalar ImageMagick
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Convertir SVG a PNG en múltiples tamaños
convert logo.svg -resize 16x16 favicon-16.png
convert logo.svg -resize 32x32 favicon-32.png
convert logo.svg -resize 48x48 favicon-48.png

# Combinar en un solo .ico
convert favicon-16.png favicon-32.png favicon-48.png favicon.ico

# Limpiar archivos temporales
rm favicon-*.png
```

#### Crear OG Image con Node.js (usando canvas)

```bash
npm install canvas

# Crear script create-og-image.js
node create-og-image.js
```

```javascript
// create-og-image.js
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const width = 1200;
const height = 630;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Fondo con gradiente
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#0ea5e9');
gradient.addColorStop(1, '#6366f1');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Texto principal
ctx.fillStyle = 'white';
ctx.font = 'bold 80px Arial';
ctx.textAlign = 'center';
ctx.fillText('Qronnect', width / 2, 250);

// Subtítulo
ctx.font = '40px Arial';
ctx.fillText('Fidelización con QR', width / 2, 320);

// Tagline
ctx.font = '30px Arial';
ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
ctx.fillText('Sistema de fidelización para negocios', width / 2, 400);

// Guardar
const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
fs.writeFileSync('og-qronnect.jpg', buffer);
console.log('✅ OG image creada: og-qronnect.jpg');
```

---

## 📐 Especificaciones Técnicas

### Logo (logo.svg)
- ✅ Formato: SVG (vectorial, escalable)
- ✅ Dimensiones: 200x200px viewBox
- ✅ Colores: #0ea5e9 (azul), #6366f1 (índigo), white
- ✅ Elementos: QR estilizado con esquinas características
- ✅ Peso: ~2KB

### Favicon (favicon.ico)
- ⚠️ Formato: ICO multi-resolución
- ⚠️ Tamaños incluidos: 16x16, 32x32, 48x48
- ⚠️ Colores: Simplificados (paleta de 256 colores)
- ⚠️ Peso objetivo: <100KB
- **PENDIENTE**: Crear versión profesional

### Open Graph Image (og-qronnect.jpg)
- ⚠️ Formato: JPG
- ⚠️ Dimensiones: 1200x630px (ratio 1.91:1)
- ⚠️ Colores: #0ea5e9, #6366f1, white
- ⚠️ Contenido sugerido:
  * Logo de Qronnect (grande y centrado)
  * Texto "Qronnect"
  * Tagline "Fidelización con QR"
  * Fondo con gradiente
- ⚠️ Peso objetivo: <300KB
- **PENDIENTE**: Crear imagen profesional de marca

---

## 🎯 Cómo se Usan Estos Assets

### Cuando una tienda NO tiene favicon configurado:

```sql
-- En la tabla tiendas
SELECT favicon_url FROM tiendas WHERE dominio = 'nuevatienda';
-- Resultado: NULL

-- El sistema automáticamente usa:
-- /brand/qronnect/favicon.ico
```

### Cuando una tienda SÍ tiene favicon configurado:

```sql
-- En la tabla tiendas
SELECT favicon_url FROM tiendas WHERE dominio = 'cafeteria';
-- Resultado: '/brand/cafeteria/favicon.ico'

-- El sistema usa el favicon personalizado
```

### Flujo completo:

1. Frontend detecta tenant: `cafeteria.qronnect.es`
2. Llama al backend: `GET /api/config/branding`
3. Backend consulta BD:
   ```sql
   SELECT favicon_url FROM tiendas WHERE dominio = 'cafeteria';
   ```
4. Si `favicon_url IS NULL` → devuelve `/brand/qronnect/favicon.ico`
5. Si `favicon_url IS NOT NULL` → devuelve el valor de la BD

---

## ✅ Checklist de Mejoras Pendientes

- [x] Logo de Qronnect (logo.svg) - ✅ Creado
- [ ] Favicon profesional (favicon.ico) - ⚠️ Temporal
- [ ] Open Graph image de marca (og-qronnect.jpg) - ⚠️ Temporal

### Para completar al 100%:

1. **Crear favicon.ico profesional**:
   - Usar logo.svg como base
   - Generar con https://realfavicongenerator.net/
   - Reemplazar archivo actual
   - Peso < 100KB

2. **Crear og-qronnect.jpg profesional**:
   - Diseñar en Canva/Figma/Photoshop
   - Dimensiones: 1200x630px
   - Incluir logo, texto y gradiente
   - Exportar como JPG de alta calidad
   - Peso < 300KB

3. **Opcional - Variantes adicionales**:
   - apple-touch-icon.png (180x180px)
   - favicon-16x16.png
   - favicon-32x32.png
   - safari-pinned-tab.svg

---

## 🔗 Referencias y Herramientas

### Generadores de Favicon
- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **Favicon.io**: https://favicon.io/
- **Favicon Generator**: https://www.favicon-generator.org/

### Diseño de OG Images
- **Canva**: https://www.canva.com/ (templates de OG images)
- **Figma**: https://www.figma.com/
- **Photopea**: https://www.photopea.com/ (Photoshop online gratis)

### Optimización de Imágenes
- **TinyPNG**: https://tinypng.com/ (compresión JPG/PNG)
- **Squoosh**: https://squoosh.app/ (optimización avanzada)

### Testing
- **Favicon Checker**: https://www.favicon-checker.com/
- **OG Preview**: https://www.opengraph.xyz/
- **Meta Tags**: https://metatags.io/

---

## 📞 Soporte

Si necesitas ayuda para crear estos assets:

1. **Opción fácil**: Usar herramientas online (links arriba)
2. **Opción profesional**: Contratar diseñador en Fiverr/Upwork
3. **Opción DIY**: Seguir instrucciones de este README

**Tiempo estimado**: 30-60 minutos para crear todos los assets profesionales

---

**Última actualización**: 22 de noviembre de 2025
**Autor**: Claude Code
**Estado**: Logo ✅ | Favicon ⚠️ | OG Image ⚠️
