# Configuración de Puertos - Qronnect

## Estado Actual

✅ **Backend**: Corriendo en puerto **3001**
- API: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs

⏸️ **Frontend**: Debe correr en puerto **3000**
- App: http://localhost:3000

## Archivos Actualizados

### 1. Backend (.env)
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend (.env.local) - CREADO
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Script de inicio (start.ps1) - ACTUALIZADO
- Ahora apunta a los puertos correctos

## ⚠️ IMPORTANTE: Configurar Supabase

El backend está corriendo pero necesita que crees una tienda con dominio "localhost" en Supabase.

### Paso 1: Abrir SQL Editor en Supabase
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto: **ajyiuhujexwrjmjfycxh**
3. Ir a **SQL Editor**

### Paso 2: Ejecutar este SQL

```sql
-- Crear tienda para desarrollo local
INSERT INTO tiendas (nombre, dominio, plan, configuracion, activo)
VALUES (
  'Tienda Local - Desarrollo',
  'localhost',
  'profesional',
  '{"puntos_por_euro": 1, "moneda": "EUR"}'::jsonb,
  TRUE
)
ON CONFLICT (dominio) DO UPDATE SET
  activo = TRUE,
  actualizado_en = NOW();
```

### Paso 3: Verificar que funciona

Después de ejecutar el SQL, prueba:

```bash
curl http://localhost:3001/api
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "message": "Qronnect API is running",
  "timestamp": "2025-11-09T..."
}
```

## Iniciar el Frontend

Una vez que el backend responda correctamente:

```powershell
cd C:\Users\Omar\Documents\Qronnect\QRs
npm run dev
```

El frontend arrancará en http://localhost:3000

## Verificación Completa

- [ ] Backend responde en http://localhost:3001/api
- [ ] Swagger visible en http://localhost:3001/api/docs
- [ ] Frontend corre en http://localhost:3000
- [ ] Frontend puede llamar al backend (verificar en consola del navegador)

## Nota sobre el Frontend

**IMPORTANTE**: El frontend actual usa **localStorage** (datos locales) y NO está conectado al backend todavía.

Para conectarlo al backend necesitarás:
1. Actualizar los componentes para hacer llamadas HTTP al backend
2. Usar la variable `NEXT_PUBLIC_API_URL` que ya configuramos
3. Implementar autenticación con Supabase Auth en el frontend

Por ahora, ambos proyectos corren independientemente:
- Backend: Listo con Supabase
- Frontend: Usa localStorage (standalone)

## URLs de Referencia

| Servicio | URL | Estado |
|----------|-----|--------|
| Backend API | http://localhost:3001/api | ✅ Corriendo |
| Swagger Docs | http://localhost:3001/api/docs | ✅ Corriendo |
| Frontend | http://localhost:3000 | ⏸️ Listo para iniciar |
| Supabase Dashboard | https://supabase.com/dashboard | ⚙️ Configurar |

---

**Siguiente paso**: Ejecutar el SQL en Supabase y luego iniciar el frontend.
