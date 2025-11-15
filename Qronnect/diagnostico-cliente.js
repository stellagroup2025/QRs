/**
 * Script de diagnóstico para verificar clientes en la base de datos
 *
 * Uso:
 * 1. Abre la consola del navegador en http://localhost:3000/lokeyokiera/mis-referidos
 * 2. Copia y pega este código
 * 3. El script te mostrará qué cliente ID está en tu token y si existe en la BD
 */

// Obtener el token del localStorage
const slug = 'lokeyokiera';
const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem('client_token');

if (!token) {
  console.error('❌ NO HAY TOKEN EN LOCALSTORAGE');
  console.log('Debes iniciar sesión primero en /login');
} else {
  console.log('✅ Token encontrado:', token.substring(0, 30) + '...');

  try {
    // Decodificar el token (es base64)
    const decoded = JSON.parse(atob(token));
    console.log('📋 Datos del token:', decoded);
    console.log('');
    console.log('🆔 Cliente ID:', decoded.sub);
    console.log('🏪 Tienda ID:', decoded.tienda_id);
    console.log('👤 Rol:', decoded.role);
    console.log('📧 Email:', decoded.email);
    console.log('');

    // Ahora vamos a verificar si este cliente existe en la BD
    console.log('🔍 Verificando si el cliente existe en la base de datos...');

    fetch('http://localhost:3001/api/referidos/mi-codigo', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Domain': slug,
      }
    })
    .then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        console.log('✅ CLIENTE ENCONTRADO EN LA BD:', data);
      } else {
        const error = await res.text();
        console.error('❌ CLIENTE NO ENCONTRADO:', error);
        console.log('');
        console.log('💡 SOLUCIÓN:');
        console.log('1. Limpia localStorage ejecutando: localStorage.clear()');
        console.log('2. Ve a http://localhost:3000/lokeyokiera/registro');
        console.log('3. Regístrate con un nuevo email');
        console.log('4. Vuelve a mis-referidos');
      }
    })
    .catch(err => {
      console.error('❌ Error de conexión:', err);
      console.log('Asegúrate de que el backend esté corriendo en http://localhost:3001');
    });

  } catch (error) {
    console.error('❌ Error al decodificar el token:', error);
    console.log('El token parece estar corrupto. Ejecuta: localStorage.clear()');
  }
}

console.log('');
console.log('========================================');
console.log('Esperando respuesta del servidor...');
console.log('========================================');
