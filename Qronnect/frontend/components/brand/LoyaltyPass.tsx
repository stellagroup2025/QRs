'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoyaltyPassProps {
  storeName: string
  logoUrl?: string | null
  memberName?: string
  points?: number
  stampsFilled?: number
  stampsTotal?: number
  qrValue: string
  /** Etiqueta pequeña bajo el QR (ej: código del cliente) */
  qrCaption?: string
  className?: string
}

/**
 * Tarjeta de fidelización en formato "pase" (estilo wallet) con los colores de la tienda.
 * Se usa como ilustración en la landing y como tarjeta real en la app del cliente.
 */
export function LoyaltyPass({
  storeName,
  logoUrl,
  memberName,
  points,
  stampsFilled = 0,
  stampsTotal = 0,
  qrValue,
  qrCaption,
  className,
}: LoyaltyPassProps) {
  const initial = storeName.trim().charAt(0).toUpperCase() || 'Q'

  return (
    <div
      className={cn(
        'relative w-full max-w-[340px] overflow-hidden rounded-[28px] bg-brand text-brand-on shadow-[0_30px_60px_-20px_rgb(var(--ink)/0.45)]',
        className,
      )}
    >
      {/* Textura sutil para que el color plano no se vea "vacío" */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 14px)',
        }}
      />

      <div className="relative p-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-full w-full object-contain p-1" />
            ) : (
              <span className="font-display text-lg font-bold text-ink">{initial}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold leading-tight">{storeName}</p>
            <p className="text-xs uppercase tracking-[0.16em] opacity-75">Club de clientes</p>
          </div>
        </div>

        {typeof points === 'number' && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.16em] opacity-75">Tus puntos</p>
            <p className="font-display text-5xl font-bold leading-none tracking-tight tabular-nums">
              {points.toLocaleString('es-ES')}
            </p>
          </div>
        )}

        {stampsTotal > 0 && (
          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between text-xs">
              <span className="uppercase tracking-[0.16em] opacity-75">Sellos</span>
              <span className="font-semibold tabular-nums">
                {Math.min(stampsFilled, stampsTotal)}/{stampsTotal}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: stampsTotal }).map((_, i) => {
                const filled = i < stampsFilled
                return (
                  <div
                    key={i}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-full border-2',
                      filled ? 'border-transparent bg-white text-ink' : 'border-current/40 border-dashed',
                    )}
                    style={filled ? undefined : { borderColor: 'rgb(var(--brand-primary-on) / 0.4)' }}
                  >
                    {filled && <Check className="h-4 w-4" strokeWidth={3} />}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Línea de corte con muescas laterales, como un ticket */}
      <div className="relative h-6" aria-hidden="true">
        <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-paper" />
        <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-paper" />
        <div
          className="absolute left-5 right-5 top-1/2 border-t-2 border-dashed"
          style={{ borderColor: 'rgb(var(--brand-primary-on) / 0.35)' }}
        />
      </div>

      <div className="relative flex items-center gap-4 p-6 pt-4">
        <div className="rounded-2xl bg-white p-2.5">
          <QRCodeSVG value={qrValue} size={88} level="M" fgColor="rgb(22,19,17)" bgColor="#ffffff" />
        </div>
        <div className="min-w-0">
          {memberName && (
            <>
              <p className="text-xs uppercase tracking-[0.16em] opacity-75">Socio</p>
              <p className="truncate font-display text-lg font-semibold leading-tight">{memberName}</p>
            </>
          )}
          <p className="mt-1 text-xs leading-snug opacity-80">
            {qrCaption ?? 'Enséñalo en caja para sumar'}
          </p>
        </div>
      </div>
    </div>
  )
}
