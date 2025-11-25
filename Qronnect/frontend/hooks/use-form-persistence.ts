'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseFormPersistenceOptions<T> {
  /** Clave única para almacenar en localStorage */
  key: string
  /** Valores iniciales del formulario */
  initialValues: T
  /** Tiempo en ms antes de guardar (debounce) */
  debounceMs?: number
  /** Si está habilitado el guardado */
  enabled?: boolean
}

/**
 * Hook para persistir el progreso de formularios en localStorage
 * Útil para formularios multi-paso donde el usuario puede perder progreso
 */
export function useFormPersistence<T extends Record<string, any>>({
  key,
  initialValues,
  debounceMs = 500,
  enabled = true,
}: UseFormPersistenceOptions<T>) {
  const storageKey = `form_progress_${key}`

  // Estado con valores iniciales o restaurados
  const [values, setValues] = useState<T>(() => {
    if (!enabled || typeof window === 'undefined') {
      return initialValues
    }

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Verificar que tiene la misma estructura
        if (typeof parsed === 'object' && parsed !== null) {
          return { ...initialValues, ...parsed }
        }
      }
    } catch (error) {
      console.error('Error restoring form progress:', error)
    }

    return initialValues
  })

  // Guardar en localStorage con debounce
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const timer = setTimeout(() => {
      try {
        // No guardar si son los valores iniciales
        const hasChanges = JSON.stringify(values) !== JSON.stringify(initialValues)
        if (hasChanges) {
          localStorage.setItem(storageKey, JSON.stringify(values))
        }
      } catch (error) {
        console.error('Error saving form progress:', error)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [values, storageKey, debounceMs, enabled, initialValues])

  // Función para actualizar un campo
  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Función para actualizar múltiples campos
  const updateFields = useCallback((updates: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...updates }))
  }, [])

  // Función para limpiar el progreso guardado
  const clearProgress = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(storageKey)
      setValues(initialValues)
    } catch (error) {
      console.error('Error clearing form progress:', error)
    }
  }, [storageKey, initialValues])

  // Función para resetear a valores iniciales sin borrar storage
  const reset = useCallback(() => {
    setValues(initialValues)
  }, [initialValues])

  // Verificar si hay progreso guardado
  const hasStoredProgress = useCallback(() => {
    if (typeof window === 'undefined') return false

    try {
      const stored = localStorage.getItem(storageKey)
      return stored !== null
    } catch {
      return false
    }
  }, [storageKey])

  return {
    values,
    setValues,
    updateField,
    updateFields,
    clearProgress,
    reset,
    hasStoredProgress,
  }
}
