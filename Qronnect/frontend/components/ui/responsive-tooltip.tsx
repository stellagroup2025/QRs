'use client'

import * as React from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useMediaQuery } from '@/hooks/use-media-query'

interface ResponsiveTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  /**
   * En mobile, mostrar el tooltip con tap (click) en vez de hover
   * Por defecto: true
   */
  tapOnMobile?: boolean
}

/**
 * Tooltip que se adapta a mobile y desktop:
 * - Desktop: Hover para mostrar tooltip
 * - Mobile: Tap (click) para mostrar tooltip, auto-cierra después de 3s
 *
 * Cumple con WCAG 2.1.1 (Teclado) y 2.5.7 (Dragging Movements)
 */
export function ResponsiveTooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  tapOnMobile = true,
}: ResponsiveTooltipProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [open, setOpen] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)

    // En mobile, auto-cerrar después de 3 segundos
    if (isMobile && tapOnMobile && newOpen) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setOpen(false)
      }, 3000)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isMobile && tapOnMobile) {
      e.preventDefault()
      e.stopPropagation()
      handleOpenChange(!open)
    }
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <Tooltip open={open} onOpenChange={handleOpenChange}>
      <TooltipTrigger
        asChild
        onClick={handleClick}
        // En mobile, usar aria-label directamente en el elemento
        aria-label={isMobile && typeof content === 'string' ? content : undefined}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        // En mobile, mayor sideOffset para no cubrir el dedo
        sideOffset={isMobile ? 8 : 4}
        className={isMobile ? 'text-sm px-4 py-2' : ''}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * IconButton con tooltip integrado, optimizado para mobile
 * Touch target mínimo de 44x44px (WCAG 2.5.5)
 */
interface IconButtonWithTooltipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  tooltip: string
  variant?: 'default' | 'ghost' | 'outline'
}

export function IconButtonWithTooltip({
  icon,
  tooltip,
  variant = 'ghost',
  className = '',
  ...props
}: IconButtonWithTooltipProps) {
  return (
    <ResponsiveTooltip content={tooltip}>
      <button
        type="button"
        className={`
          inline-flex items-center justify-center
          min-w-[44px] min-h-[44px]
          rounded-md
          transition-colors
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
          focus-visible:ring-offset-2
          disabled:pointer-events-none
          disabled:opacity-50
          ${variant === 'default' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
          ${variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' : ''}
          ${variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' : ''}
          ${className}
        `}
        aria-label={tooltip}
        {...props}
      >
        <span className="sr-only">{tooltip}</span>
        {icon}
      </button>
    </ResponsiveTooltip>
  )
}
