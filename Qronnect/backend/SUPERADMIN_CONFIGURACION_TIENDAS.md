# Configuración Completa de Tiendas - SuperAdmin

## 📋 Resumen

El panel de SuperAdmin ahora permite **editar completamente toda la información de una tienda**, incluyendo:

- ✅ Información básica (nombre, dominio, dirección, etc.)
- ✅ Branding (colores, logo, nombre comercial)
- ✅ Configuración de SMS (modo global/propio, credenciales Twilio, Sender ID)
- ✅ **NUEVO**: Configuración de IA (modo global/propio, API keys de Gemini, límites)
- ✅ Plan y estado activo

---

## 🆕 Nueva Funcionalidad: Configuración de IA

### Endpoints Disponibles

#### 1. **PUT /superadmin/tiendas/:id/ia** - Configurar IA para una tienda

Configura el modo de uso de IA y las API keys de Gemini.

**Headers:**
```bash
Authorization: Bearer {superadmin_token}
```

**Body (Modo Global):**
```json
{
  "ia_modo": "global",
  "ia_limite_mensual": 100
}
```

**Body (Modo Propio):**
```json
{
  "ia_modo": "propio",
  "ia_api_key_propia": "AIzaSy..."
}
```

**Respuesta:**
```json
{
  "message": "Configuración de IA actualizada correctamente",
  "configuracion": {
    "ia_modo": "propio",
    "ia_limite_mensual": null,
    "ia_api_key_configurada": true
  }
}
```

---

#### 2. **GET /superadmin/tiendas/:id/ia** - Obtener configuración de IA

Retorna la configuración actual de IA sin exponer las API keys completas.

**Respuesta:**
```json
{
  "ia_modo": "propio",
  "ia_limite_mensual": null,
  "ia_consumo_actual": 0,
  "ia_ultimo_reset": "2025-11-01",
  "ia_api_key_configurada": true,
  "ia_api_key_preview": "AIzaSy1234...xyz"
}
```

---

#### 3. **GET /superadmin/tiendas/:id/ia/estadisticas** - Estadísticas de uso de IA

Retorna el consumo mensual, límites y estadísticas detalladas.

**Respuesta:**
```json
{
  "tienda": {
    "id": "uuid",
    "nombre": "Cafetería Aroma"
  },
  "modo": "global",
  "limites": {
    "limite_mensual": 100,
    "consumo_actual": 25,
    "restantes": 75,
    "ultimo_reset": "2025-11-01"
  },
  "estadisticas": {
    "total_este_mes": 25,
    "total_historico": 150,
    "por_tipo": {
      "email_campana": 10,
      "sms_campana": 8,
      "promo": 5,
      "kpi_analisis": 2
    },
    "tokens_este_mes": 45000,
    "costo_estimado_mes": 0.0034
  }
}
```

---

#### 4. **DELETE /superadmin/tiendas/:id/ia/api-key** - Eliminar API key de IA

Elimina la API key configurada y vuelve la tienda a modo global.

**Respuesta:**
```json
{
  "message": "API key eliminada correctamente. La tienda usará modo global.",
  "tienda": {
    "id": "uuid",
    "nombre": "Cafetería Aroma",
    "ia_modo": "global"
  }
}
```

---

## 📊 Campos de Tienda Editables

### Información Básica
- `nombre`: Nombre de la tienda
- `dominio`: Dominio único (ej: `cafeteria-aroma`)
- `dominio_personalizado`: Dominio custom del cliente
- `direccion`: Dirección física
- `telefono`: Teléfono de contacto
- `email`: Email de contacto

### Branding
- `logo_url`: URL del logo
- `color_primario`: Color primario en hex (ej: `#FF5733`)
- `color_secundario`: Color secundario en hex
- `color_acento`: Color de acento en hex
- `nombre_comercial`: Nombre visible del negocio

### Configuración
- `plan`: Plan contratado (`basico` | `profesional` | `enterprise`)
- `activo`: Estado activo/inactivo
- `configuracion`: Objeto JSON con configuración personalizada

### Configuración SMS
Ver documento `SENDER_ID_ALFANUMERICO.md` para detalles completos.

- `configuracion.sms.activo`: SMS habilitado
- `configuracion.sms.modo`: `global` o `propio`
- `configuracion.sms.credenciales`: Credenciales Twilio (si modo propio)
- `configuracion.sms.sender_id`: Sender ID alfanumérico

### Configuración IA (NUEVO)
- `ia_modo`: `global` (usa API key de Qronnect) o `propio` (usa API key propia)
- `ia_api_key_propia`: API key de Gemini (solo modo propio)
- `ia_limite_mensual`: Límite de generaciones mensuales (solo modo global)
- `ia_consumo_actual`: Consumo del mes actual
- `ia_ultimo_reset`: Fecha del último reset

---

## 🔧 Uso desde el Frontend

### Ejemplo: Configurar IA en modo global

```typescript
const configurarIA = async (tiendaId: string) => {
  const response = await fetch(`/api/superadmin/tiendas/${tiendaId}/ia`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ia_modo: 'global',
      ia_limite_mensual: 100
    })
  });

  const data = await response.json();
  console.log(data.message);
};
```

### Ejemplo: Configurar IA en modo propio

```typescript
const configurarIAPropia = async (tiendaId: string, apiKey: string) => {
  const response = await fetch(`/api/superadmin/tiendas/${tiendaId}/ia`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ia_modo: 'propio',
      ia_api_key_propia: apiKey
    })
  });

  const data = await response.json();
  console.log(data.message);
};
```

### Ejemplo: Obtener estadísticas de uso

```typescript
const obtenerEstadisticasIA = async (tiendaId: string) => {
  const response = await fetch(`/api/superadmin/tiendas/${tiendaId}/ia/estadisticas`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  console.log(`Consumo: ${data.limites.consumo_actual}/${data.limites.limite_mensual}`);
  console.log(`Restantes: ${data.limites.restantes}`);
};
```

---

## 🛡️ Validaciones

### Configuración de IA

1. **Modo propio requiere API key:**
   - Si `ia_modo = "propio"`, debe enviarse `ia_api_key_propia`
   - Error 400 si falta la API key

2. **Formato de API key de Gemini:**
   - Debe comenzar con `AIzaSy`
   - Error 400 si el formato es inválido

3. **Límites en modo global:**
   - Solo se puede configurar `ia_limite_mensual` en modo global
   - En modo propio no hay límites (usa API key propia)

4. **Seguridad:**
   - Las API keys nunca se exponen completas en los GET
   - Se muestra preview ofuscado: `AIzaSy1234...xyz`

---

## 📝 Notas Importantes

1. **Auditoría:**
   - Todas las acciones de configuración se registran en `audit_log_superadmin`
   - Incluye: superadmin_id, acción, timestamp, detalles

2. **Reset Automático:**
   - El consumo de IA se resetea automáticamente el 1º de cada mes
   - Se verifica en cada llamada a la función `verificar_limite_ia()`

3. **Modo Propio vs Global:**
   - **Global**: Usa la API key de Qronnect, tiene límites mensuales
   - **Propio**: Usa la API key de la tienda, sin límites (paga directamente)

4. **Campos Requeridos:**
   - Para crear tienda: `nombre`, `dominio`, `plan`
   - Para actualizar: todos opcionales

---

## 🔗 Endpoints Relacionados

### Tiendas
- `GET /superadmin/tiendas` - Listar todas las tiendas
- `GET /superadmin/tiendas/:id` - Obtener detalles completos de una tienda
- `POST /superadmin/tiendas` - Crear nueva tienda
- `PUT /superadmin/tiendas/:id` - Actualizar tienda
- `DELETE /superadmin/tiendas/:id` - Desactivar tienda

### SMS
- `PUT /superadmin/tiendas/:id/sms` - Configurar SMS
- `GET /superadmin/tiendas/:id/sms` - Obtener configuración SMS
- `POST /superadmin/tiendas/:id/sms/test` - Probar SMS
- `PATCH /superadmin/tiendas/:id/sms/sender-id` - Actualizar Sender ID
- `DELETE /superadmin/tiendas/:id/sms/sender-id` - Eliminar Sender ID

### IA (NUEVO)
- `PUT /superadmin/tiendas/:id/ia` - Configurar IA
- `GET /superadmin/tiendas/:id/ia` - Obtener configuración IA
- `GET /superadmin/tiendas/:id/ia/estadisticas` - Estadísticas de uso
- `DELETE /superadmin/tiendas/:id/ia/api-key` - Eliminar API key

---

## 🎯 Próximos Pasos para el Frontend

Para completar la funcionalidad en el panel de superadmin, necesitas:

1. **Agregar sección de configuración de IA:**
   ```tsx
   // En /superadmin/tiendas/[id]/page.tsx

   <section className="bg-white rounded-lg shadow p-6">
     <h2 className="text-xl font-bold mb-4">Configuración de IA</h2>

     <div className="space-y-4">
       <div>
         <label>Modo de IA</label>
         <select value={iaModo} onChange={(e) => setIaModo(e.target.value)}>
           <option value="global">Global (Qronnect)</option>
           <option value="propio">Propio (API Key propia)</option>
         </select>
       </div>

       {iaModo === 'propio' && (
         <div>
           <label>API Key de Gemini</label>
           <input
             type="password"
             value={iaApiKey}
             onChange={(e) => setIaApiKey(e.target.value)}
             placeholder="AIzaSy..."
           />
         </div>
       )}

       {iaModo === 'global' && (
         <div>
           <label>Límite Mensual</label>
           <input
             type="number"
             value={iaLimite}
             onChange={(e) => setIaLimite(Number(e.target.value))}
             min={0}
           />
         </div>
       )}

       <button onClick={guardarConfigIA}>Guardar Configuración</button>
     </div>
   </section>
   ```

2. **Mostrar estadísticas de uso:**
   ```tsx
   <section className="bg-white rounded-lg shadow p-6">
     <h2 className="text-xl font-bold mb-4">Uso de IA</h2>

     <div className="grid grid-cols-3 gap-4">
       <div>
         <p className="text-gray-600">Este mes</p>
         <p className="text-2xl font-bold">{stats.consumo_actual}</p>
       </div>
       <div>
         <p className="text-gray-600">Límite</p>
         <p className="text-2xl font-bold">{stats.limite_mensual}</p>
       </div>
       <div>
         <p className="text-gray-600">Restantes</p>
         <p className="text-2xl font-bold">{stats.restantes}</p>
       </div>
     </div>
   </section>
   ```

3. **Agregar validación y feedback:**
   - Validar formato de API key antes de enviar
   - Mostrar errores claros
   - Confirmación antes de eliminar API key
   - Toast notifications para éxito/error

---

## ✅ Checklist de Implementación

- [x] DTOs creados (`ConfigureIaDto`)
- [x] Endpoints en controller
- [x] Métodos en service
- [x] Validaciones implementadas
- [x] Auditoría configurada
- [x] Compilación exitosa
- [ ] Frontend actualizado
- [ ] Tests E2E
- [ ] Documentación de usuario

---

## 📚 Referencias

- `backend/src/superadmin/superadmin.controller.ts:307-363` - Endpoints de IA
- `backend/src/superadmin/superadmin.service.ts:795-1008` - Lógica de negocio
- `backend/src/superadmin/dto/configure-ia.dto.ts` - DTO de configuración
- `backend/supabase/migrations/20251114000005_limites_api_keys_ia.sql` - Schema de BD

---

**Última actualización**: 2025-11-15
