/**
 * 🎯 UTILIDADES DE ACCESIBILIDAD
 * Helpers para mejorar la accesibilidad de la aplicación
 */

/**
 * Genera un ID único para asociar labels con inputs
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Hook para manejar navegación por teclado en listas
 */
export function useKeyboardNavigation(itemCount: number, onSelect: (index: number) => void) {
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        onSelect(Math.min(currentIndex + 1, itemCount - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        onSelect(Math.max(currentIndex - 1, 0))
        break
      case 'Home':
        e.preventDefault()
        onSelect(0)
        break
      case 'End':
        e.preventDefault()
        onSelect(itemCount - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        onSelect(currentIndex)
        break
    }
  }

  return { handleKeyDown }
}

/**
 * Componente de Skip Link para navegación por teclado
 */
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
    >
      {children}
    </a>
  )
}

/**
 * Verifica si un color cumple con WCAG AA/AAA
 */
export function getContrastRatio(foreground: string, background: string): number {
  // Convertir hex a RGB
  const getRGB = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const fg = getRGB(foreground)
  const bg = getRGB(background)

  const l1 = getLuminance(fg)
  const l2 = getLuminance(bg)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Verifica cumplimiento WCAG
 */
export function checkWCAG(contrastRatio: number, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal') {
  const requirements = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 }
  }

  return contrastRatio >= requirements[level][size]
}

/**
 * Anuncia un mensaje a screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Hook para trap focus en modales
 */
export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive, containerRef])
}
