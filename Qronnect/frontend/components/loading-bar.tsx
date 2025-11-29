'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Loading bar para transiciones de página
 * Usa NProgress (similar a YouTube/GitHub)
 *
 * IMPORTANTE: Requiere instalar nprogress:
 * npm install nprogress @types/nprogress
 */

let NProgress: any = null

// Cargar NProgress solo en el cliente
if (typeof window !== 'undefined') {
  import('nprogress').then((module) => {
    NProgress = module.default
    NProgress.configure({
      showSpinner: false,
      trickleSpeed: 100,
      minimum: 0.1,
      easing: 'ease',
      speed: 300,
    })
  })
}

export function LoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Finalizar la barra cuando cambia la ruta
    if (NProgress) {
      NProgress.done()
    }
  }, [pathname, searchParams])

  useEffect(() => {
    // Interceptar clics en links para mostrar la barra
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (anchor && anchor.href && !anchor.target && NProgress) {
        const url = new URL(anchor.href)
        const currentUrl = new URL(window.location.href)

        // Solo mostrar si es navegación interna diferente
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          NProgress.start()
        }
      }
    }

    // Interceptar navegación programática
    const handleRouteChangeStart = () => {
      if (NProgress) NProgress.start()
    }

    const handleRouteChangeComplete = () => {
      if (NProgress) NProgress.done()
    }

    document.addEventListener('click', handleAnchorClick)
    window.addEventListener('popstate', handleRouteChangeComplete)

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      window.removeEventListener('popstate', handleRouteChangeComplete)
    }
  }, [])

  return null
}

/**
 * Estilos CSS para NProgress
 * Agregar a tu globals.css o crear un archivo nprogress.css
 */
export const nprogressStyles = `
/* Loading Bar (NProgress) */
#nprogress {
  pointer-events: none;
}

#nprogress .bar {
  background: oklch(0.646 0.222 41.116); /* color-primary */
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
}

#nprogress .peg {
  display: block;
  position: absolute;
  right: 0px;
  width: 100px;
  height: 100%;
  box-shadow: 0 0 10px oklch(0.646 0.222 41.116), 0 0 5px oklch(0.646 0.222 41.116);
  opacity: 1;
  transform: rotate(3deg) translate(0px, -4px);
}

/* Spinner (deshabilitado por defecto) */
#nprogress .spinner {
  display: block;
  position: fixed;
  z-index: 9999;
  top: 15px;
  right: 15px;
}

#nprogress .spinner-icon {
  width: 18px;
  height: 18px;
  box-sizing: border-box;
  border: solid 2px transparent;
  border-top-color: oklch(0.646 0.222 41.116);
  border-left-color: oklch(0.646 0.222 41.116);
  border-radius: 50%;
  animation: nprogress-spinner 400ms linear infinite;
}

@keyframes nprogress-spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
`

/**
 * Alternativa ligera sin dependencias externas
 * Implementación simple de loading bar
 */
export function SimpleLoadingBar() {
  const pathname = usePathname()
  const [progress, setProgress] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)

  useEffect(() => {
    setProgress(100)
    setIsLoading(false)
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (anchor && anchor.href && !anchor.target) {
        const url = new URL(anchor.href)
        const currentUrl = new URL(window.location.href)

        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          setIsLoading(true)
          setProgress(30)

          const timer = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 90) {
                clearInterval(timer)
                return 90
              }
              return prev + Math.random() * 10
            })
          }, 300)
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  if (!isLoading && progress === 100) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 transition-all duration-300 ease-out"
      style={{
        width: `${progress}%`,
        opacity: isLoading ? 1 : 0,
      }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Cargando página"
    />
  )
}

// Agregar import de React para SimpleLoadingBar
import React from 'react'
