'use client'

import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

const defaultState: ConfirmDialogState = {
  isOpen: false,
  title: '¿Estás seguro?',
  description: 'Esta acción no se puede deshacer.',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'default',
  onConfirm: () => {},
  onCancel: () => {},
}

interface ConfirmDialogContextValue {
  confirm: (options?: ConfirmDialogOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null)

/**
 * Provider para el diálogo de confirmación
 * Envuelve tu app o componente para usar el hook useConfirmDialog
 */
export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmDialogState>(defaultState)

  const confirm = useCallback((options?: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...defaultState,
        ...options,
        isOpen: true,
        onConfirm: () => {
          setState((prev) => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: () => {
          setState((prev) => ({ ...prev, isOpen: false }))
          resolve(false)
        },
      })
    })
  }, [])

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog open={state.isOpen} onOpenChange={(open) => !open && state.onCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state.title}</AlertDialogTitle>
            <AlertDialogDescription>{state.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={state.onCancel}>
              {state.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={state.onConfirm}
              className={state.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {state.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  )
}

/**
 * Hook para mostrar un diálogo de confirmación
 * Reemplaza el confirm() nativo con un diálogo más elegante
 *
 * @example
 * const { confirm } = useConfirmDialog()
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: '¿Eliminar elemento?',
 *     description: 'Esta acción no se puede deshacer.',
 *     variant: 'destructive',
 *   })
 *
 *   if (confirmed) {
 *     // Proceder con la eliminación
 *   }
 * }
 */
export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext)

  if (!context) {
    throw new Error('useConfirmDialog debe usarse dentro de ConfirmDialogProvider')
  }

  return context
}
