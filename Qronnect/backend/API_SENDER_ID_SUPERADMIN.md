# 📱 API Sender ID - Panel SuperAdmin

## Guía para Implementación en el Frontend

Esta guía te muestra cómo integrar la configuración de Sender ID en tu panel de SuperAdmin.

---

## 🎯 Endpoints Disponibles

### 1. Ver Configuración SMS de una Tienda

```http
GET /api/superadmin/tiendas/{tiendaId}/sms
Authorization: Bearer {superadmin_token}
```

**Response:**
```json
{
  "activo": true,
  "modo": "global",
  "configurado": true,
  "sender_id": "GYMFITZONE",  // ⬅️ Sender ID actual
  "limites": {
    "max_por_dia": 100,
    "max_por_mes": 2000
  },
  "creditos_disponibles": 450
}
```

---

### 2. Actualizar Sender ID de una Tienda

```http
PATCH /api/superadmin/tiendas/{tiendaId}/sms/sender-id
Authorization: Bearer {superadmin_token}
Content-Type: application/json

{
  "sender_id": "GYMFITZONE"
}
```

**Validaciones automáticas:**
- ✅ Convierte automáticamente a MAYÚSCULAS
- ✅ Máximo 11 caracteres
- ✅ Solo A-Z y 0-9
- ✅ Debe tener al menos 1 letra

**Response:**
```json
{
  "message": "Sender ID actualizado correctamente",
  "tienda": {
    "id": "uuid-tienda",
    "nombre": "Gym FitZone",
    "sender_id": "GYMFITZONE"
  }
}
```

**Errores posibles:**
```json
{
  "statusCode": 400,
  "message": "El Sender ID no puede tener más de 11 caracteres"
}
```

---

### 3. Eliminar Sender ID de una Tienda

```http
DELETE /api/superadmin/tiendas/{tiendaId}/sms/sender-id
Authorization: Bearer {superadmin_token}
```

**Response:**
```json
{
  "message": "Sender ID eliminado correctamente. La tienda usará número de teléfono.",
  "tienda": {
    "id": "uuid-tienda",
    "nombre": "Gym FitZone"
  }
}
```

---

## 💻 Ejemplos de Código Frontend

### React/Next.js

```typescript
// hooks/useSenderID.ts
import { useState } from 'react';

export function useSenderID(tiendaId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actualizarSenderID = async (senderId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/superadmin/tiendas/${tiendaId}/sms/sender-id`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ sender_id: senderId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      const data = await res.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarSenderID = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/superadmin/tiendas/${tiendaId}/sms/sender-id`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      return await res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { actualizarSenderID, eliminarSenderID, loading, error };
}
```

---

### Componente de Formulario

```tsx
// components/SenderIDForm.tsx
import { useState, useEffect } from 'react';
import { useSenderID } from '@/hooks/useSenderID';

interface SenderIDFormProps {
  tiendaId: string;
  tiendaNombre: string;
  currentSenderId?: string;
  onUpdate?: () => void;
}

export function SenderIDForm({
  tiendaId,
  tiendaNombre,
  currentSenderId,
  onUpdate
}: SenderIDFormProps) {
  const [senderId, setSenderId] = useState(currentSenderId || '');
  const { actualizarSenderID, eliminarSenderID, loading, error } = useSenderID(tiendaId);

  // Validación en tiempo real
  const validateSenderID = (value: string) => {
    if (value.length > 11) return 'Máximo 11 caracteres';
    if (value && !/^[A-Z0-9]+$/.test(value.toUpperCase())) {
      return 'Solo letras A-Z y números 0-9';
    }
    if (value && !/[A-Z]/i.test(value)) {
      return 'Debe contener al menos una letra';
    }
    return null;
  };

  const validationError = validateSenderID(senderId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validationError) return;

    try {
      await actualizarSenderID(senderId);
      alert('Sender ID actualizado correctamente');
      onUpdate?.();
    } catch (err) {
      // Error ya está en el estado
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar Sender ID? La tienda usará número de teléfono.')) {
      return;
    }

    try {
      await eliminarSenderID();
      setSenderId('');
      alert('Sender ID eliminado');
      onUpdate?.();
    } catch (err) {
      // Error ya está en el estado
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Sender ID - {tiendaNombre}</h3>
        <p className="text-sm text-gray-600">
          El nombre que aparecerá como remitente en los SMS (máx 11 caracteres)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Sender ID
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value.toUpperCase())}
              placeholder="GYMFITZONE"
              maxLength={11}
              className={`
                flex-1 px-4 py-2 border rounded-lg font-mono
                ${validationError ? 'border-red-500' : 'border-gray-300'}
              `}
            />

            <button
              type="submit"
              disabled={loading || !!validationError || !senderId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>

            {currentSenderId && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                Eliminar
              </button>
            )}
          </div>

          {/* Indicador de caracteres */}
          <div className="mt-1 text-sm text-gray-500">
            {senderId.length}/11 caracteres
          </div>

          {/* Errores de validación */}
          {validationError && (
            <p className="mt-2 text-sm text-red-600">
              {validationError}
            </p>
          )}

          {/* Error del servidor */}
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Preview */}
        {senderId && !validationError && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Vista previa del SMS:</p>
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="text-xs text-gray-500 mb-1">
                De: <span className="font-bold text-blue-600">{senderId}</span>
              </div>
              <div className="text-sm">
                Hola María! 50% descuento hoy. Código: PROMO50
              </div>
            </div>
          </div>
        )}

        {/* Información útil */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> El Sender ID solo funciona en España y Europa.
            No permite respuestas (unidireccional).
          </p>
        </div>
      </form>
    </div>
  );
}
```

---

### Vista en Tabla de Tiendas

```tsx
// components/TiendasTable.tsx
interface Tienda {
  id: string;
  nombre: string;
  sms_config?: {
    activo: boolean;
    sender_id?: string;
    modo: 'global' | 'propio';
  };
}

export function TiendasTable({ tiendas }: { tiendas: Tienda[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Tienda</th>
          <th>SMS</th>
          <th>Sender ID</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {tiendas.map((tienda) => (
          <tr key={tienda.id}>
            <td>{tienda.nombre}</td>

            <td>
              {tienda.sms_config?.activo ? (
                <span className="text-green-600">✓ Activo</span>
              ) : (
                <span className="text-gray-400">✗ Inactivo</span>
              )}
            </td>

            <td>
              {tienda.sms_config?.sender_id ? (
                <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm">
                  {tienda.sms_config.sender_id}
                </code>
              ) : (
                <span className="text-gray-400">
                  {tienda.sms_config?.modo === 'global' ? 'Número global' : 'Sin configurar'}
                </span>
              )}
            </td>

            <td>
              <button
                onClick={() => openSenderIDModal(tienda)}
                className="text-blue-600 hover:underline"
              >
                Editar Sender ID
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

### Modal de Edición Rápida

```tsx
// components/SenderIDModal.tsx
import { Dialog } from '@headlessui/react';
import { SenderIDForm } from './SenderIDForm';

interface SenderIDModalProps {
  isOpen: boolean;
  onClose: () => void;
  tienda: {
    id: string;
    nombre: string;
    sender_id?: string;
  };
}

export function SenderIDModal({ isOpen, onClose, tienda }: SenderIDModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
          <Dialog.Title className="text-xl font-bold mb-4">
            Configurar Sender ID
          </Dialog.Title>

          <SenderIDForm
            tiendaId={tienda.id}
            tiendaNombre={tienda.nombre}
            currentSenderId={tienda.sender_id}
            onUpdate={onClose}
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
```

---

## 🎨 Sugerencias de UX

### 1. Generador Automático

```tsx
function generarSenderID(nombreTienda: string): string {
  return nombreTienda
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Solo letras y números
    .substring(0, 11); // Máximo 11 chars
}

// Ejemplo de uso
const sugerencia = generarSenderID("Gym FitZone Pro");
// Output: "GYMFITZONE" (sin "PRO" porque excedería 11 chars)
```

### 2. Validación Visual en Tiempo Real

```tsx
<div className="relative">
  <input {...props} maxLength={11} />

  {/* Indicador de validez */}
  <div className="absolute right-3 top-1/2 -translate-y-1/2">
    {senderId && !validationError ? (
      <span className="text-green-500">✓</span>
    ) : senderId ? (
      <span className="text-red-500">✗</span>
    ) : null}
  </div>
</div>
```

### 3. Ejemplos Sugeridos

```tsx
const ejemplosPorTipo = {
  gimnasio: ['GYMFIT', 'FITZONE', 'WELLNESS'],
  cafe: ['CAFEAROMA', 'COFFEESHOP', 'BARISTA'],
  salon: ['BELLASALON', 'HAIRSPA', 'STYLIST'],
  tienda: ['MODASHOP', 'BOUTIQUE', 'FASHION'],
};

<div className="mt-2">
  <p className="text-xs text-gray-500 mb-1">Ejemplos:</p>
  <div className="flex gap-2">
    {ejemplos.map((ej) => (
      <button
        key={ej}
        onClick={() => setSenderId(ej)}
        className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
      >
        {ej}
      </button>
    ))}
  </div>
</div>
```

---

## 📊 Dashboard - Vista Completa

```tsx
// pages/superadmin/tiendas/[id]/sms.tsx
export default function TiendaSMSPage({ tienda }: { tienda: Tienda }) {
  const [config, setConfig] = useState<SMSConfig | null>(null);

  useEffect(() => {
    fetch(`/api/superadmin/tiendas/${tienda.id}/sms`)
      .then(res => res.json())
      .then(setConfig);
  }, [tienda.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{tienda.nombre}</h1>
        <p className="text-gray-600">Configuración de SMS</p>
      </div>

      {/* Estado General */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">Estado</div>
          <div className="text-xl font-bold">
            {config?.activo ? '✓ Activo' : '✗ Inactivo'}
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">Modo</div>
          <div className="text-xl font-bold capitalize">
            {config?.modo || 'No configurado'}
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-sm text-gray-500">Remitente</div>
          <div className="text-xl font-bold font-mono">
            {config?.sender_id || (
              <span className="text-gray-400 text-sm font-normal">
                Número de teléfono
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Configuración Sender ID */}
      <div className="bg-white rounded-lg shadow p-6">
        <SenderIDForm
          tiendaId={tienda.id}
          tiendaNombre={tienda.nombre}
          currentSenderId={config?.sender_id}
          onUpdate={() => {
            // Recargar config
          }}
        />
      </div>

      {/* Estadísticas */}
      {config?.activo && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Uso de SMS</h3>
          <EstadisticasSMS tiendaId={tienda.id} />
        </div>
      )}
    </div>
  );
}
```

---

## ✅ Checklist de Implementación

Para el frontend, asegúrate de:

- [ ] Mostrar Sender ID actual en tabla de tiendas
- [ ] Formulario para editar Sender ID con validación
- [ ] Validación en tiempo real (11 chars, A-Z0-9)
- [ ] Convertir automáticamente a MAYÚSCULAS
- [ ] Botón para eliminar Sender ID
- [ ] Vista previa del SMS con el Sender ID
- [ ] Indicador visual de caracteres usados (X/11)
- [ ] Mensajes de error claros
- [ ] Sugerencias automáticas basadas en nombre de tienda
- [ ] Documentación/tooltip explicando qué es Sender ID

---

## 🚀 Próximos Pasos

1. ✅ Backend implementado
2. ⏳ Implementar frontend con estos endpoints
3. ⏳ Añadir tests de la funcionalidad
4. ⏳ Desplegar y probar con Twilio real

---

**¡API lista para ser consumida por el frontend! 🎉**
