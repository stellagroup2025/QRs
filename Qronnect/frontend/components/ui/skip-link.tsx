'use client'

import { cn } from '@/lib/utils'

interface SkipLinkProps {
  href?: string
  children?: React.ReactNode
  className?: string
}

/**
 * Skip Link para accesibilidad
 * Permite a usuarios de teclado saltar directamente al contenido principal
 * Solo visible cuando recibe foco (Tab)
 */
export function SkipLink({
  href = '#main-content',
  children = 'Ir al contenido principal',
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]',
        'focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground',
        'focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring',
        'transition-all',
        className
      )}
    >
      {children}
    </a>
  )
}
