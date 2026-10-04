'use client'

import { useEffect } from 'react'

/** Separa "+40%*" en prefijo, número y sufijo para poder animar el número */
function partes(texto: string) {
  const m = texto.match(/^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/)
  if (!m) return null
  return { pre: m[1], num: parseFloat(m[2].replace(',', '.')), decimales: m[2].includes(',') || m[2].includes('.') ? 1 : 0, post: m[3] }
}

function contar(el: HTMLElement) {
  const p = partes(el.dataset.count ?? el.textContent ?? '')
  if (!p) return
  const dur = 1400
  const t0 = performance.now()
  const paso = (t: number) => {
    const k = Math.min(1, (t - t0) / dur)
    const v = p.num * (1 - Math.pow(1 - k, 3))
    el.textContent = `${p.pre}${v.toFixed(p.decimales).replace('.', ',')}${p.post}`
    if (k < 1) requestAnimationFrame(paso)
  }
  requestAnimationFrame(paso)
}

/**
 * Efectos de scroll de las landings, en un solo componente:
 * - los elementos con data-reveal aparecen al entrar en pantalla, escalonados;
 * - los que tienen data-count cuentan desde 0 hasta su valor;
 * - la barra #scroll-progress muestra cuánto se ha leído.
 * Sin JavaScript o con movimiento reducido, todo se ve desde el principio.
 */
export function ScrollFx() {
  useEffect(() => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const bar = document.getElementById('scroll-progress')

    let ticking = false
    const progreso = () => {
      ticking = false
      const h = root.scrollHeight - window.innerHeight
      if (bar) bar.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(progreso)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    progreso()

    if (reduced || !('IntersectionObserver' in window)) {
      return () => window.removeEventListener('scroll', onScroll)
    }

    root.classList.add('js-anim')
    const io = new IntersectionObserver(
      (entries) => {
        let k = 0
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target as HTMLElement
          el.style.transitionDelay = `${Math.min(k++ * 90, 450)}ms`
          el.classList.add('in')
          el.querySelectorAll<HTMLElement>('[data-count]').forEach(contar)
          if (el.hasAttribute('data-count')) contar(el)
          io.unobserve(el)
          window.setTimeout(() => (el.style.transitionDelay = ''), 1500)
        })
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))

    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
      root.classList.remove('js-anim')
    }
  }, [])

  return null
}
