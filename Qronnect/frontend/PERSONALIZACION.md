# Guía de Personalización Paso a Paso

Esta guía te ayudará a personalizar el sistema para tu comercio específico.

## 🎯 Checklist de Personalización

### ✅ Obligatorio

- [ ] **Nombre del comercio** en `config/commerce.ts` → `nombre`
- [ ] **Slug único** en `config/commerce.ts` → `slug`
- [ ] **PIN de staff** en `config/commerce.ts` → `pinStaff` (⚠️ por seguridad)
- [ ] **Logo** subir archivo a `/public/logo.jpg`

### 🎨 Recomendado

- [ ] **Ciudad/ubicación** en `config/commerce.ts` → `ciudad`
- [ ] **Configuración de sellos** → `programas.sellos.requisito` y `titulo`
- [ ] **Configuración de descuento** → `programas.descuento.porcentaje` y `titulo`
- [ ] **Textos personalizados** → `textos.bienvenida`, `descripcionHero`, etc.

### 🌈 Opcional

- [ ] **Colores del tema** en `app/globals.css`
- [ ] **Información de contacto** → `contacto.*`
- [ ] **Redes sociales** → `redes.*`

---

## 📋 Ejemplos por Tipo de Negocio

### Cafetería

\`\`\`typescript
{
  nombre: "Café Aroma",
  slug: "cafe-aroma",
  ciudad: "Barcelona",
  programas: {
    sellos: {
      requisito: 8,
      titulo: "8 cafés = 1 gratis"
    },
    descuento: {
      porcentaje: 10,
      titulo: "10% en repostería"
    }
  }
}
\`\`\`

### Peluquería

\`\`\`typescript
{
  nombre: "Salón Estilo",
  slug: "salon-estilo",
  ciudad: "Valencia",
  programas: {
    sellos: {
      requisito: 5,
      titulo: "5 cortes = tratamiento gratis"
    },
    descuento: {
      porcentaje: 15,
      titulo: "15% en productos"
    }
  }
}
\`\`\`

### Librería

\`\`\`typescript
{
  nombre: "Librería Letras",
  slug: "libreria-letras",
  ciudad: "Sevilla",
  programas: {
    sellos: {
      requisito: 12,
      titulo: "12 compras = libro gratis"
    },
    descuento: {
      porcentaje: 5,
      titulo: "5% en toda la tienda"
    }
  }
}
\`\`\`

### Gimnasio

\`\`\`typescript
{
  nombre: "Fit Center",
  slug: "fit-center",
  ciudad: "Bilbao",
  programas: {
    sellos: {
      requisito: 20,
      titulo: "20 clases = 2 sesiones gratis"
    },
    descuento: {
      porcentaje: 20,
      titulo: "20% en suplementos"
    }
  }
}
\`\`\`

---

## 🎨 Personalización de Colores

### Opción 1: Colores Simples (en `config/commerce.ts`)

\`\`\`typescript
colores: {
  primario: "#f59e0b", // Naranja
  secundario: "#ea580c", // Naranja oscuro
}
\`\`\`

### Opción 2: Tema Completo (en `app/globals.css`)

Para control total del tema, edita las variables CSS:

\`\`\`css
@theme inline {
  /* Colores principales */
  --color-primary: 30 80% 55%;
  --color-secondary: 25 85% 50%;
  
  /* Fondos */
  --color-background: 0 0% 100%;
  --color-card: 0 0% 98%;
  
  /* Textos */
  --color-foreground: 0 0% 10%;
  --color-muted-foreground: 0 0% 45%;
  
  /* Bordes */
  --color-border: 0 0% 90%;
  
  /* Estados */
  --color-destructive: 0 84% 60%;
  
  /* Redondeo */
  --radius: 0.5rem;
}
\`\`\`

---

## 🖼️ Personalización del Logo

### Requisitos del Logo

- **Formato**: JPG, PNG, SVG
- **Tamaño recomendado**: 200x200px (cuadrado)
- **Peso máximo**: 100KB
- **Ubicación**: `/public/logo.jpg`

### Si tu logo no es cuadrado

Tienes dos opciones:

1. **Editar con transparencia**: Usa un editor para agregar espacio transparente
2. **Cambiar en el código**: Edita `components/app-shell.tsx`:

\`\`\`tsx
<Image
  src={COMERCIO.logoUrl || "/placeholder.svg"}
  alt={COMERCIO.nombre}
  width={80}  // Ajusta según tu logo
  height={40} // Ajusta según tu logo
  className="object-contain" // Cambia a 'contain'
/>
\`\`\`

---

## 🔢 Personalización del PIN

### ⚠️ Importante

El PIN por defecto es `1234`. **Debes cambiarlo** antes de usar en producción.

\`\`\`typescript
pinStaff: "tu_pin_aqui" // Usa 4-6 dígitos
\`\`\`

### Recomendaciones

- Usa al menos 4 dígitos
- No uses secuencias obvias (1234, 0000, etc.)
- Cambia el PIN periódicamente
- No compartas el PIN por canales inseguros

---

## 📱 URLs Personalizadas

Una vez configurado, tus URLs serán:

- **Home**: `tudominio.com/`
- **Registro**: `tudominio.com/registro`
- **QR del cliente**: `tudominio.com/mi-qr?cid=xxx&t=yyy`
- **Staff**: `tudominio.com/staff`
- **Validación**: `tudominio.com/[slug]/c?cid=xxx&t=yyy`

El `[slug]` se reemplaza automáticamente con tu configuración.

---

## 🚀 Después de Personalizar

1. Guarda todos los cambios
2. Prueba el registro de un cliente
3. Prueba el acceso al staff con tu nuevo PIN
4. Verifica que el logo se vea bien
5. Escanea un QR de prueba
6. ¡Despliega en Vercel!

---

¿Necesitas ayuda? Revisa `README.md` o contacta con soporte técnico.
