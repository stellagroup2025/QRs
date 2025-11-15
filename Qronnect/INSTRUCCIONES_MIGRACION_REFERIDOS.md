# 🚀 Instrucciones para Aplicar la Migración de Referidos

## ❌ Problema Actual

El error que estás viendo:
```
column clientes.codigo_referido_personal does not exist
```

Significa que la migración del sistema de referidos NO se ha aplicado a la base de datos.

## ✅ Solución: Aplicar Migración Manualmente

### Opción 1: Usar Supabase Studio (RECOMENDADO)

1. **Abre Supabase Studio**:
   ```
   http://127.0.0.1:54323
   ```

2. **Ve al SQL Editor** (ícono de </> en el menú lateral)

3. **Copia y pega el contenido del archivo**:
   ```
   backend/supabase/migrations/20251114000003_sistema_referidos.sql
   ```

4. **Click en "Run"** o presiona `Ctrl + Enter`

5. **Verifica que diga "Success"** en la parte inferior

6. **Recarga la página** de `http://localhost:3000/lokeyokiera/mis-referidos`

---

### Opción 2: Usar el Comando de Terminal (Si tienes PostgreSQL instalado)

```bash
cd backend

PGPASSWORD="postgres" psql \
  -h 127.0.0.1 \
  -p 54322 \
  -U postgres \
  -d postgres \
  -f supabase/migrations/20251114000003_sistema_referidos.sql
```

---

## 📋 ¿Qué hace esta migración?

1. **Agrega columnas a la tabla `clientes`**:
   - `codigo_referido_personal` VARCHAR(20) - Código único para cada cliente (ej: "JUAN-A3F2")
   - `total_referidos` INTEGER - Contador de cuántos amigos ha referido
   - `referido_por` UUID - Referencia al cliente que te refirió

2. **Crea tabla `programas_referidos`**:
   - Configuración del programa de referidos por tienda
   - Puntos por referido
   - Recompensas por objetivos

3. **Crea tabla `historial_referidos`**:
   - Registro de todos los referidos
   - Estado (pendiente/completado/rechazado)
   - Puntos otorgados

4. **Crea vista `vista_referidos_dashboard`**:
   - Vista optimizada para mostrar el dashboard de referidos

5. **Crea funciones**:
   - `registrar_referido()` - Procesa un nuevo referido
   - `progreso_referidos_cliente()` - Obtiene progreso de un cliente
   - `estadisticas_referidos()` - Estadísticas para admin

---

## 🔍 Verificar que Funcionó

Después de aplicar la migración, ejecuta esto en el SQL Editor:

```sql
-- Verificar que las columnas existen
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name IN ('codigo_referido_personal', 'total_referidos', 'referido_por');

-- Deberías ver 3 filas
```

Si ves 3 filas, ¡la migración fue exitosa!

---

## 🎯 Siguiente Paso

Una vez aplicada la migración:

1. Recarga la página `http://localhost:3000/lokeyokiera/mis-referidos`
2. Deberías ver tu código QR generado automáticamente
3. El código tendrá el formato: `TUSNOMBR-A3F2` (primeras letras del nombre + código aleatorio)

---

## ⚠️ Si Sigues Teniendo Problemas

Comparte el error exacto que aparece en:
- La consola del navegador (F12)
- Los logs del backend (donde está corriendo `npm run start:dev`)
