// ============================================================
// 🔧 CONFIGURACIÓN DEL COMERCIO - PLANTILLA BASE
// ============================================================
// Este es el ÚNICO archivo que debes modificar para personalizar
// el sistema de fidelización para cada comercio diferente.
//
// INSTRUCCIONES:
// 1. Cambia todos los valores a continuación según el comercio
// 2. Sube el logo del comercio a /public/logo.jpg (o cambia la ruta)
// 3. Opcionalmente, personaliza los colores en app/globals.css
// 4. ¡Listo! El resto del sistema se adapta automáticamente
// ============================================================

export const COMERCIO = {
  // ========== INFORMACIÓN BÁSICA ==========
  // Nombre del comercio que aparecerá en toda la aplicación
  nombre: "Mi Comercio",

  // Identificador único del comercio (sin espacios, minúsculas, sin acentos)
  // Se usa en URLs: ejemplo.com/mi-comercio/c?cid=...
  slug: "mi-comercio",

  // Ubicación del comercio (ciudad, barrio, etc.)
  ciudad: "Madrid",

  // Logo del comercio - coloca la imagen en /public/
  // Recomendado: 200x200px, formato JPG o PNG
  logoUrl: "/logo.jpg",

  // ========== PERSONALIZACIÓN VISUAL ==========
  // Colores principales del comercio
  // Estos se pueden ajustar también en app/globals.css para mayor control
  colores: {
    primario: "#0ea5e9", // Color principal (botones, enlaces, etc.)
    secundario: "#0b5ed7", // Color secundario (acentos)
  },

  // ========== SEGURIDAD ==========
  // PIN para acceder al dashboard de staff (4 dígitos recomendado)
  // ⚠️ IMPORTANTE: Cambia este PIN para cada comercio
  pins: {
    admin: "1234", // PIN para administrador (acceso completo)
    comercial: "5678", // PIN para comercial (solo operaciones con clientes)
  },

  // ========== PROGRAMAS DE FIDELIZACIÓN ==========
  programas: {
    // Programa de Sellos
    sellos: {
      activo: true, // true = mostrar, false = ocultar
      requisito: 10, // Número de sellos necesarios para recompensa
      titulo: "Compra 10 y llévate 1 gratis", // Descripción de la recompensa
      descripcion: "Por cada compra acumulas un sello. Al completar todos los sellos, obtienes una recompensa.", // Descripción extendida
    },

    // Programa de Descuento
    descuento: {
      activo: true, // true = mostrar, false = ocultar
      porcentaje: 5, // Porcentaje de descuento (sin símbolo %)
      titulo: "5% de descuento para miembros", // Descripción del descuento
      descripcion: "Como miembro del programa, disfruta de un descuento exclusivo en todas tus compras.", // Descripción extendida
    },
  },

  // ========== INFORMACIÓN DE CONTACTO (OPCIONAL) ==========
  contacto: {
    telefono: "+34 900 123 456",
    email: "info@micomercio.com",
    direccion: "Calle Principal, 123",
    horario: "L-V: 10:00-20:00, S: 10:00-14:00",
  },

  // ========== REDES SOCIALES (OPCIONAL) ==========
  redes: {
    instagram: "https://instagram.com/micomercio",
    facebook: "https://facebook.com/micomercio",
    twitter: "https://twitter.com/micomercio",
  },

  // ========== PERSONALIZACIÓN DE TEXTOS ==========
  textos: {
    bienvenida: "Únete a nuestro programa de fidelización",
    descripcionHero: "Acumula sellos en cada compra y disfruta de descuentos exclusivos como miembro",
    llamadaAccion: "Únete y consigue tu QR",
  },
}

// ============================================================
// 💡 NOTAS ADICIONALES
// ============================================================
// - Para cambiar los colores del tema completo, edita app/globals.css
// - El logo debe estar en formato cuadrado para mejor visualización
// - El slug debe ser único y sin caracteres especiales
// - Los datos se guardan en LocalStorage del navegador
// - Para producción, considera implementar un backend real
// ============================================================
