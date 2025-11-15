# Instrucciones de Configuración

## 1. Ejecutar migración de tabla email_otps

La tabla `email_otps` es necesaria para el sistema de autenticación con códigos OTP.

### Opción A: Desde Supabase Dashboard
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a "SQL Editor"
4. Copia y pega el contenido de `create-email-otps.sql`
5. Ejecuta la query

### Opción B: Desde psql (si tienes acceso directo)
```bash
psql -h your-supabase-host -U postgres -d postgres -f database/create-email-otps.sql
```

## 2. Configurar subdominios en localhost (OPCIONAL pero recomendado)

Para usar subdominios como `lokeyokiera.localhost:3000` en lugar de solo `localhost:3000`:

### En Windows (WSL)
Edita el archivo hosts de Windows (NO el de WSL):
```bash
# Desde WSL, edita el archivo hosts de Windows
sudo nano /mnt/c/Windows/System32/drivers/etc/hosts
```

Agrega estas líneas al final:
```
127.0.0.1 lokeyokiera.localhost
127.0.0.1 otratienda.localhost
```

Guarda con `Ctrl+O`, Enter, `Ctrl+X`

### En Linux/Mac
```bash
sudo nano /etc/hosts
```

Agrega:
```
127.0.0.1 lokeyokiera.localhost
127.0.0.1 otratienda.localhost
```

### Verificar
Después de guardar, verifica que funciona:
```bash
ping lokeyokiera.localhost
```

Deberías ver respuestas de `127.0.0.1`

## 3. Acceder a la aplicación

### Con subdominios (recomendado):
- Frontend de Lokeyokiera: http://lokeyokiera.localhost:3000
- Frontend de otra tienda: http://otratienda.localhost:3000
- Backend: http://localhost:3001

### Sin subdominios (fallback):
El sistema detecta automáticamente `localhost` y usa `lokeyokiera` como tenant por defecto:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 4. Flujo de registro y login de clientes

1. **Registro**:
   - Ve a `http://lokeyokiera.localhost:3000` (o `localhost:3000`)
   - Completa el formulario de registro
   - Serás redirigido a `/login`

2. **Login**:
   - Ingresa tu email
   - Recibirás un código de 6 dígitos (en desarrollo se muestra en un toast)
   - Ingresa el código
   - Serás redirigido a `/mi-perfil`

3. **Ver perfil**:
   - En `/mi-perfil` verás tu QR personal, puntos y compras

## 5. Probar multitenancy

Para probar que cada tienda tiene sus propios clientes:

1. Crea otra tienda desde el SuperAdmin panel
2. Agrega el dominio al archivo hosts (ej: `otratienda.localhost`)
3. Accede a `http://otratienda.localhost:3000`
4. Registra un cliente nuevo
5. Verifica que los clientes son independientes entre tiendas

## Notas importantes

- Los códigos OTP expiran en 10 minutos
- Los tokens de sesión duran 30 días
- En producción, los subdominios funcionan automáticamente sin editar hosts
- El sistema de subdominios es OPCIONAL para desarrollo, funciona sin ellos
