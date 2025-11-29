'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { trackAnalyticsEvent } from '@/hooks/use-analytics'

/**
 * Componente para reportar Web Vitals a analytics
 *
 * Métricas monitoreadas:
 * - CLS: Cumulative Layout Shift (estabilidad visual)
 * - FCP: First Contentful Paint (primera pintura)
 * - FID: First Input Delay (primera interacción)
 * - LCP: Largest Contentful Paint (contenido principal)
 * - TTFB: Time to First Byte (tiempo de servidor)
 * - INP: Interaction to Next Paint (Next.js 13+)
 *
 * @see https://web.dev/vitals/
 * @see https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log en desarrollo para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals] 📊', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
      })
    }

    // Enviar a analytics en producción
    if (process.env.NODE_ENV === 'production') {
      trackAnalyticsEvent({
        category: 'Performance',
        action: 'Web Vital',
        label: metric.name,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metadata: {
          id: metric.id,
          rating: metric.rating,
          navigationType: metric.navigationType,
        },
      })

      // También enviar a endpoint custom si lo necesitas
      // sendToAnalyticsEndpoint(metric)
    }
  })

  return null
}

/**
 * Función opcional para enviar vitals a tu propio endpoint
 * Útil si quieres almacenarlos en tu base de datos
 */
async function sendToAnalyticsEndpoint(metric: any) {
  const body = JSON.stringify(metric)
  const url = '/api/vitals'

  // Usar sendBeacon si está disponible (más confiable)
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body)
  } else {
    // Fallback a fetch
    fetch(url, {
      body,
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((error) => {
      console.error('[Web Vitals] Error sending to endpoint:', error)
    })
  }
}

/**
 * Thresholds de Web Vitals para referencia
 *
 * Good (Verde):
 * - LCP: <= 2.5s
 * - FID: <= 100ms
 * - CLS: <= 0.1
 * - FCP: <= 1.8s
 * - TTFB: <= 600ms
 * - INP: <= 200ms
 *
 * Needs Improvement (Amarillo):
 * - LCP: 2.5s - 4s
 * - FID: 100ms - 300ms
 * - CLS: 0.1 - 0.25
 * - FCP: 1.8s - 3s
 * - TTFB: 600ms - 1400ms
 * - INP: 200ms - 500ms
 *
 * Poor (Rojo):
 * - LCP: > 4s
 * - FID: > 300ms
 * - CLS: > 0.25
 * - FCP: > 3s
 * - TTFB: > 1400ms
 * - INP: > 500ms
 */
