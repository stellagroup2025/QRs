# 🧪 Cómo Probar el Sistema de Referidos

## ⚠️ Problema Actual

Estás viendo el error: **"Cliente no encontrado (404)"**

Esto significa que:
- No has iniciado sesión como cliente, O
- El cliente del token no existe en la base de datos

## ✅ Solución: Pasos para Probar

### Opción 1: Registrarse como Nuevo Cliente

1. **Ve al registro**:
   ```
   http://localhost:3000/lokeyokiera/registro
   ```

2. **Completa el formulario**:
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Teléfono: 612345678
   - Fecha de nacimiento: (opcional)

3. **Recibirás**:
   - OTP por consola del backend (o SMS si está configurado)
   - Ingresa el código OTP
   - Serás redirigido al perfil

4. **Ahora ve a mis-referidos**:
   ```
   http://localhost:3000/lokeyokiera/mis-referidos
   ```

   ✅ Deberías ver tu QR code con un código como: `JUAN-A3F2`

---

### Opción 2: Usar Cliente de Demostración

Si ya ejecutaste el script `insert-clientes-demo.sql`, hay 20 clientes creados.

**Problema**: No tienen contraseña/OTP configurado para hacer login.

**Solución**: Crea un cliente nuevo con el flujo de registro normal (Opción 1).

---

### Opción 3: Login Manual (Para Testing)

Si tienes un cliente existente y quieres evitar el flujo de OTP:

1. **Obtén el ID de un cliente** (desde la base de datos)

2. **Crea un token manualmente**:
   ```javascript
   // En la consola del navegador
   const clienteId = 'UUID-DEL-CLIENTE'; // Reemplaza con el ID real
   const tiendaId = '11bf2433-4232-4c58-a446-a805e1b78f9b'; // ID de lokeyokiera

   const token = {
     sub: clienteId,
     tienda_id: tiendaId,
     role: 'cliente',
     email: 'cliente@email.com'
   };

   const tokenBase64 = btoa(JSON.stringify(token));
   localStorage.setItem('client_token', tokenBase64);
   localStorage.setItem('client_token_lokeyokiera', tokenBase64);

   // Recarga la página
   location.reload();
   ```

---

## 🔍 Verificar que Funcionó

Después de iniciar sesión, abre la consola del navegador y verifica:

```javascript
console.log('Token:', localStorage.getItem('client_token'));
console.log('Token lokeyokiera:', localStorage.getItem('client_token_lokeyokiera'));
```

Deberías ver dos tokens base64.

Luego ve a:
```
http://localhost:3000/lokeyokiera/mis-referidos
```

### ✅ Resultado Esperado:

En la consola del navegador verás:
```
🔍 Cargando código de referido... {token: "...", slug: "lokeyokiera"}
📡 Respuesta del servidor: 200
✅ Datos recibidos: {
  codigo: "JUAN-A3F2",
  url: "http://localhost:3000/lokeyokiera/registro?ref=JUAN-A3F2",
  nombre: "Juan Pérez",
  nombre_tienda: "LokeYoKiera",
  total_referidos: 0
}
```

Y en la página verás:
- ✅ Tu código personal (ej: JUAN-A3F2)
- ✅ QR code escaneable
- ✅ Botones para compartir en WhatsApp, Facebook, etc.
- ✅ Botón para descargar QR como imagen

---

## 🐛 Si Sigue Sin Funcionar

Revisa la consola del backend (`npm run start:dev`) y comparte estos logs:

```
🔐 Verificando cliente: {...}
📊 Resultado búsqueda cliente: {...}
🎯 Controller mi-codigo: {...}
🔍 getCodigoPersonal llamado con: {...}
```

---

## 📝 Flujo Completo de Referidos (Una Vez Funcionando)

1. **Cliente A** ve su código: `JUAN-A3F2`
2. **Cliente A** descarga el QR y lo comparte en Instagram
3. **Cliente B** escanea el QR
4. **Cliente B** va a: `localhost:3000/lokeyokiera/registro?ref=JUAN-A3F2`
5. **Cliente B** se registra
6. **Sistema** detecta el ref code y:
   - Asigna puntos a Cliente A (por referir)
   - Asigna puntos a Cliente B (bienvenida + referido)
7. **Ambos** ven sus puntos actualizados
