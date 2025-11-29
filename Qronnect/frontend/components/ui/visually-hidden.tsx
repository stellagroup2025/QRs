import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Componente para ocultar contenido visualmente pero mantenerlo accesible para screen readers
 * Útil para labels, descripciones e instrucciones adicionales
 */
export const VisuallyHidden = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        'clip-[rect(0,0,0,0)]', // clip-path alternativo
        className
      )}
      {...props}
    />
  )
})

VisuallyHidden.displayName = 'VisuallyHidden'

/**
 * Hook para generar IDs únicos accesibles
 */
export function useAccessibleId(prefix: string = 'accessible'): string {
  const [id] = React.useState(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`)
  return id
}
