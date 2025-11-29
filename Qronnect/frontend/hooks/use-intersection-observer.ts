import { useEffect, useState, useRef, RefObject } from 'react'

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /**
   * Si es true, el observer se desconecta después de la primera intersección
   */
  once?: boolean
}

interface UseIntersectionObserverReturn {
  /** Ref para adjuntar al elemento que queremos observar */
  targetRef: RefObject<HTMLDivElement>
  /** Si el elemento está actualmente visible en el viewport */
  isIntersecting: boolean
  /** Si el elemento ha sido visible al menos una vez */
  hasIntersected: boolean
}

/**
 * Hook para detectar cuando un elemento es visible en el viewport
 * Útil para lazy loading y animaciones on-scroll
 *
 * @example
 * ```tsx
 * const { targetRef, hasIntersected } = useIntersectionObserver({ threshold: 0.5 })
 *
 * return (
 *   <div ref={targetRef}>
 *     {hasIntersected && <ExpensiveComponent />}
 *   </div>
 * )
 * ```
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '50px',
    once = false,
  } = options

  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    // Si ya se intersectó y es 'once', no hacer nada
    if (once && hasIntersected) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting

        setIsIntersecting(isCurrentlyIntersecting)

        if (isCurrentlyIntersecting && !hasIntersected) {
          setHasIntersected(true)

          // Si es 'once', desconectar después de la primera intersección
          if (once) {
            observer.disconnect()
          }
        }
      },
      {
        threshold,
        root,
        rootMargin,
      }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [hasIntersected, once, threshold, root, rootMargin])

  return { targetRef, isIntersecting, hasIntersected }
}

/**
 * Hook simplificado para lazy loading de componentes
 * Se desconecta automáticamente después de la primera aparición
 *
 * @example
 * ```tsx
 * const { ref, isVisible } = useLazyLoad()
 *
 * return (
 *   <div ref={ref}>
 *     {isVisible ? <HeavyComponent /> : <Placeholder />}
 *   </div>
 * )
 * ```
 */
export function useLazyLoad(options: IntersectionObserverInit = {}) {
  const { targetRef, hasIntersected } = useIntersectionObserver({
    ...options,
    once: true,
  })

  return {
    ref: targetRef,
    isVisible: hasIntersected,
  }
}

/**
 * Hook para detectar si el usuario ha scrolleado cerca del final de la página
 * Útil para infinite scroll
 *
 * @example
 * ```tsx
 * const { ref, isNearEnd } = useScrollEnd({ threshold: 0.8 })
 *
 * useEffect(() => {
 *   if (isNearEnd) {
 *     loadMoreItems()
 *   }
 * }, [isNearEnd])
 * ```
 */
export function useScrollEnd(options: { threshold?: number } = {}) {
  const { threshold = 0.9 } = options
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin: '100px',
  })

  return {
    ref: targetRef,
    isNearEnd: isIntersecting,
  }
}
