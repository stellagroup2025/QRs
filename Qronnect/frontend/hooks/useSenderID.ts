import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface SMSConfig {
  activo: boolean
  modo: 'global' | 'propio'
  configurado: boolean
  sender_id?: string
  limites?: {
    max_por_dia?: number
    max_por_mes?: number
  }
  creditos_disponibles?: number
  credenciales_configuradas?: {
    account_sid?: string
    auth_token?: string
    phone_number?: string
  }
}

export function useSenderID(tiendaId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Obtiene la configuración SMS actual de la tienda
   */
  const getConfiguracion = async (): Promise<SMSConfig | null> => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('superadmin_token')
      if (!token) throw new Error('No autenticado')

      const res = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}/sms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error al obtener configuración')
      }

      const data = await res.json()
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Actualiza el Sender ID de la tienda
   */
  const actualizarSenderID = async (senderId: string) => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('superadmin_token')
      if (!token) throw new Error('No autenticado')

      const res = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}/sms/sender-id`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sender_id: senderId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error al actualizar Sender ID')
      }

      const data = await res.json()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Elimina el Sender ID de la tienda
   */
  const eliminarSenderID = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('superadmin_token')
      if (!token) throw new Error('No autenticado')

      const res = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}/sms/sender-id`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error al eliminar Sender ID')
      }

      const data = await res.json()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    getConfiguracion,
    actualizarSenderID,
    eliminarSenderID,
    loading,
    error,
  }
}

/**
 * Valida un Sender ID en tiempo real
 */
export function validateSenderID(value: string): string | null {
  if (!value) return null

  if (value.length > 11) {
    return 'Máximo 11 caracteres'
  }

  if (!/^[A-Z0-9]+$/i.test(value)) {
    return 'Solo letras A-Z y números 0-9 (sin espacios ni caracteres especiales)'
  }

  if (!/[A-Z]/i.test(value)) {
    return 'Debe contener al menos una letra'
  }

  return null
}

/**
 * Genera un Sender ID automático basado en el nombre de la tienda
 */
export function generarSenderID(nombreTienda: string): string {
  return nombreTienda
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Solo letras y números
    .substring(0, 11) // Máximo 11 chars
}
