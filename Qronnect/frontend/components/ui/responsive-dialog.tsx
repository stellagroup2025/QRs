'use client'

import * as React from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from './sheet'

interface ResponsiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

/**
 * Componente que muestra Dialog en desktop y Sheet (slide-up) en móvil
 * Mejora la experiencia en dispositivos táctiles
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
}: ResponsiveDialogProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className={`max-h-[90vh] overflow-y-auto ${className || ''}`}>
          {(title || description) && (
            <SheetHeader>
              {title && <SheetTitle>{title}</SheetTitle>}
              {description && <SheetDescription>{description}</SheetDescription>}
            </SheetHeader>
          )}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}

// Re-export footer components for convenience
export { DialogFooter as ResponsiveDialogFooter, SheetFooter }
