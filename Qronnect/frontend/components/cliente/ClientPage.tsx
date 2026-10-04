'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ClientNav } from '@/components/ClientNav'

/**
 * Esqueleto común de las pantallas de la app del cliente: menú, fondo y ancho de lectura.
 * `title` y `subtitle` pintan la cabecera de la pantalla; `actions` va a su derecha.
 */
export function ClientPage({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <>
      <ClientNav />
      <div className="min-h-screen bg-paper pb-32 text-ink md:pb-16">
        <div className={cn('mx-auto max-w-2xl px-4 pt-6 sm:px-6 md:pt-10', className)}>
          {(title || actions) && (
            <header className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                {title && <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight sm:text-3xl">{title}</h1>}
                {subtitle && <p className="mt-1 text-[15px] text-ink/60">{subtitle}</p>}
              </div>
              {actions && <div className="shrink-0">{actions}</div>}
            </header>
          )}
          {children}
        </div>
      </div>
    </>
  )
}

/** Tarjeta blanca básica de la app del cliente */
export function ClientCard({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn('rounded-3xl border border-ink/[0.07] bg-white p-5 shadow-[0_1px_2px_rgb(var(--ink)/0.04)]', className)}>{children}</section>
}

/** Título pequeño de sección dentro de una pantalla */
export function ClientSectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex items-center justify-between gap-3">
      <h2 className="font-display text-lg font-bold tracking-tight">{children}</h2>
      {action}
    </div>
  )
}

/** Estado vacío: icono, título, texto y una acción opcional */
export function ClientEmpty({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode
  title: string
  text?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-ink/15 bg-white/60 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">{icon}</span>
      <p className="mt-4 font-display text-lg font-bold">{title}</p>
      {text && <p className="mt-1 max-w-xs text-sm text-ink/60">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Esqueleto de carga genérico */
export function ClientSkeleton({ blocks = 3 }: { blocks?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-ink/[0.06]" />
      {Array.from({ length: blocks }).map((_, i) => (
        <div key={i} className={cn('animate-pulse rounded-3xl bg-ink/[0.06]', i === 0 ? 'h-48' : 'h-24')} />
      ))}
    </div>
  )
}
