'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean
  message?: string
}

/**
 * Hook para advertir al usuario antes de abandonar una página con cambios sin guardar.
 *
 * Uso:
 * ```tsx
 * const { setHasChanges } = useUnsavedChanges({
 *   hasUnsavedChanges: isDirty,
 *   message: '¿Seguro que quieres salir? Los cambios no guardados se perderán.'
 * })
 * ```
 */
export function useUnsavedChanges({
  hasUnsavedChanges,
  message = '¿Seguro que quieres salir? Los cambios no guardados se perderán.',
}: UseUnsavedChangesOptions) {
  // Manejar el evento beforeunload (cerrar pestaña, recargar)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        // La mayoría de navegadores modernos ignoran el mensaje personalizado
        // pero aún muestran un diálogo de confirmación genérico
        e.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, message])

  // Función para confirmar navegación programática
  const confirmNavigation = useCallback(
    (callback: () => void) => {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(message)
        if (confirmed) {
          callback()
        }
        return confirmed
      }
      callback()
      return true
    },
    [hasUnsavedChanges, message]
  )

  return { confirmNavigation }
}
