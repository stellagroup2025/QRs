'use client'

import { useCallback } from 'react'
import { track } from '@vercel/analytics'

/**
 * Categorías de eventos de analytics
 */
export type AnalyticsCategory =
  | 'Admin'
  | 'Ventas'
  | 'Puntos'
  | 'Promociones'
  | 'Campañas'
  | 'Cliente'
  | 'Navegación'
  | 'UI'
  | 'Error'
  | 'Performance'

/**
 * Evento de analytics con toda la metadata
 */
export interface AnalyticsEvent {
  /** Categoría del evento (Admin, Ventas, Cliente, etc.) */
  category: AnalyticsCategory

  /** Acción realizada (ej: "Venta Registrada", "Modal Abierto") */
  action: string

  /** Label opcional con contexto adicional */
  label?: string

  /** Valor numérico opcional (ej: importe de venta, puntos otorgados) */
  value?: number

  /** Metadata adicional como objeto */
  metadata?: Record<string, any>
}

/**
 * Hook para tracking de eventos de analytics
 *
 * Integrado con Vercel Analytics y console.log en desarrollo
 *
 * @example
 * ```tsx
 * const { trackEvent } = useAnalytics()
 *
 * // Trackear venta
 * trackEvent({
 *   category: 'Ventas',
 *   action: 'Venta Registrada',
 *   value: 25.50,
 *   metadata: { tienda_id: 123, puntos: 25 }
 * })
 * ```
 */
export function useAnalytics() {
  /**
   * Envía un evento de analytics
   */
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    // Preparar datos del evento
    const eventData = {
      category: event.category,
      label: event.label,
      value: event.value,
      ...event.metadata,
    }

    // Enviar a Vercel Analytics
    try {
      track(event.action, eventData)
    } catch (error) {
      console.error('[Analytics] Error tracking event:', error)
    }

    // Log en desarrollo para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] 📊', {
        action: event.action,
        ...eventData,
      })
    }
  }, [])

  /**
   * Trackear navegación entre páginas
   */
  const trackPageView = useCallback((pageName: string, metadata?: Record<string, any>) => {
    trackEvent({
      category: 'Navegación',
      action: 'Page View',
      label: pageName,
      metadata,
    })
  }, [trackEvent])

  /**
   * Trackear errores
   */
  const trackError = useCallback((error: Error | string, context?: Record<string, any>) => {
    const errorMessage = typeof error === 'string' ? error : error.message

    trackEvent({
      category: 'Error',
      action: 'Error Occurred',
      label: errorMessage,
      metadata: {
        ...context,
        stack: typeof error === 'object' ? error.stack : undefined,
      },
    })
  }, [trackEvent])

  /**
   * Trackear interacciones de UI (clicks, hovers, etc.)
   */
  const trackInteraction = useCallback((
    element: string,
    action: 'click' | 'hover' | 'focus' | 'scroll',
    metadata?: Record<string, any>
  ) => {
    trackEvent({
      category: 'UI',
      action: `${action} ${element}`,
      metadata,
    })
  }, [trackEvent])

  /**
   * Trackear eventos de ventas
   */
  const trackSale = useCallback((importe: number, metadata?: {
    tienda_id?: number
    cliente_id?: number
    puntos?: number
    promocion_id?: number
  }) => {
    trackEvent({
      category: 'Ventas',
      action: 'Venta Registrada',
      value: importe,
      metadata,
    })
  }, [trackEvent])

  /**
   * Trackear eventos de puntos
   */
  const trackPoints = useCallback((puntos: number, action: 'ganados' | 'canjeados', metadata?: Record<string, any>) => {
    trackEvent({
      category: 'Puntos',
      action: `Puntos ${action}`,
      value: puntos,
      metadata,
    })
  }, [trackEvent])

  /**
   * Trackear eventos de promociones
   */
  const trackPromotion = useCallback((
    action: 'creada' | 'activada' | 'canjeada' | 'eliminada',
    metadata?: Record<string, any>
  ) => {
    trackEvent({
      category: 'Promociones',
      action: `Promoción ${action}`,
      metadata,
    })
  }, [trackEvent])

  /**
   * Trackear eventos de campañas
   */
  const trackCampaign = useCallback((
    action: 'creada' | 'enviada' | 'programada',
    metadata?: Record<string, any>
  ) => {
    trackEvent({
      category: 'Campañas',
      action: `Campaña ${action}`,
      metadata,
    })
  }, [trackEvent])

  return {
    trackEvent,
    trackPageView,
    trackError,
    trackInteraction,
    trackSale,
    trackPoints,
    trackPromotion,
    trackCampaign,
  }
}

/**
 * Función standalone para trackear eventos sin hook
 * Útil en contextos donde no se pueden usar hooks (utils, middleware, etc.)
 */
export function trackAnalyticsEvent(event: AnalyticsEvent) {
  const eventData = {
    category: event.category,
    label: event.label,
    value: event.value,
    ...event.metadata,
  }

  try {
    track(event.action, eventData)
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error)
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] 📊', {
      action: event.action,
      ...eventData,
    })
  }
}
