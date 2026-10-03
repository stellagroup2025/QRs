'use client';

import { Check, Gift, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  TarjetaSelloConProgreso,
  EstadoTarjetaSello,
  calcularDiasRestantes,
  estaExpirado,
  formatearPremio,
} from '@/types/sellos';
import { cn } from '@/lib/utils';

interface TarjetaSelloCardProps {
  tarjeta: TarjetaSelloConProgreso;
}

/** Color del programa si es un hexadecimal válido; si no, el de la tienda */
function colorPrograma(color?: string) {
  return color && /^#[0-9a-f]{6}$/i.test(color) ? color : 'rgb(var(--brand-primary))';
}

/**
 * Tarjeta de sellos del cliente: los huecos se van llenando con cada sello y,
 * al completarla, muestra el cupón para canjear el premio en caja.
 */
export function TarjetaSelloCard({ tarjeta }: TarjetaSelloCardProps) {
  const {
    programa_nombre,
    programa_descripcion,
    programa_color,
    sellos_actuales,
    sellos_objetivo,
    estado,
    codigo_cupon,
    fecha_completada,
    fecha_canjeada,
    fecha_expiracion,
    tipo_premio,
    premio_detalles,
    instrucciones_canje,
  } = tarjeta;

  const color = colorPrograma(programa_color);
  const completada = estado === EstadoTarjetaSello.COMPLETADA;
  const activa = estado === EstadoTarjetaSello.ACTIVA;
  const expirado = completada && estaExpirado(fecha_expiracion);
  const diasRestantes = calcularDiasRestantes(fecha_expiracion);
  const faltan = Math.max(0, sellos_objetivo - sellos_actuales);
  const premio = formatearPremio(tipo_premio, premio_detalles);

  return (
    <article
      className={cn(
        'overflow-hidden rounded-3xl border border-ink/[0.07] bg-white',
        !activa && !completada && 'opacity-70',
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold leading-snug">{programa_nombre}</h2>
            {programa_descripcion && <p className="mt-0.5 text-sm text-ink/60">{programa_descripcion}</p>}
          </div>
          <p className="shrink-0 font-display text-2xl font-bold tabular-nums">
            {Math.min(sellos_actuales, sellos_objetivo)}
            <span className="text-base font-medium text-ink/40">/{sellos_objetivo}</span>
          </p>
        </div>

        {/* Huecos de los sellos */}
        <ol
          className={cn('mt-5 grid gap-2.5', sellos_objetivo > 10 ? 'grid-cols-6' : 'grid-cols-5')}
          aria-label={`${sellos_actuales} de ${sellos_objetivo} sellos`}
        >
          {Array.from({ length: sellos_objetivo }).map((_, i) => {
            const lleno = i < sellos_actuales;
            const ultimo = i === sellos_objetivo - 1;
            return (
              <li
                key={i}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-full border-2 text-xs font-semibold',
                  lleno ? 'border-transparent text-white' : 'border-dashed border-ink/15 text-ink/30',
                )}
                style={lleno ? { backgroundColor: color } : undefined}
              >
                {lleno ? (
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                ) : ultimo ? (
                  <Gift className="h-4 w-4" aria-hidden="true" />
                ) : (
                  i + 1
                )}
              </li>
            );
          })}
        </ol>

        <p className="mt-4 flex items-center gap-2 text-sm">
          <Gift className="h-4 w-4 shrink-0" style={{ color }} aria-hidden="true" />
          <span>
            <span className="text-ink/55">Premio: </span>
            <span className="font-semibold">{premio}</span>
          </span>
        </p>
        {activa && (
          <p className="mt-1 text-sm text-ink/55">
            {faltan === 1 ? '¡Solo te falta 1 sello!' : `Te faltan ${faltan} sellos.`} Te lo ponen en caja al escanear tu QR.
          </p>
        )}
      </div>

      {/* Tarjeta completa: cupón para canjear */}
      {completada && codigo_cupon && !expirado && (
        <div className="border-t-2 border-dashed border-ink/10 bg-brand/[0.06] p-5">
          <p className="font-display text-lg font-bold">¡Tarjeta completa! Tu premio te espera</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="rounded-2xl border border-ink/10 bg-white p-2">
              <QRCodeSVG value={codigo_cupon} size={88} level="M" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink/55">Código del cupón</p>
              <p className="font-mono text-lg font-bold tracking-[0.15em]">{codigo_cupon}</p>
              {diasRestantes !== null && (
                <p className={cn('mt-1 text-xs', diasRestantes < 7 ? 'font-semibold text-red-600' : 'text-ink/55')}>
                  {diasRestantes === 0 ? 'Caduca hoy' : `Caduca en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>
          </div>
          {instrucciones_canje && (
            <p className="mt-4 flex gap-2 text-sm text-ink/70">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {instrucciones_canje}
            </p>
          )}
        </div>
      )}

      {(expirado || estado === EstadoTarjetaSello.EXPIRADA) && (
        <p className="border-t border-ink/[0.07] px-5 py-3 text-sm text-ink/55">Este premio ha caducado.</p>
      )}
      {estado === EstadoTarjetaSello.CANJEADA && (
        <p className="border-t border-ink/[0.07] px-5 py-3 text-sm text-ink/55">
          Premio canjeado{fecha_canjeada ? ` el ${new Date(fecha_canjeada).toLocaleDateString('es-ES')}` : ''}.
        </p>
      )}
      {completada && !codigo_cupon && fecha_completada && (
        <p className="border-t border-ink/[0.07] px-5 py-3 text-sm text-ink/55">
          Completada el {new Date(fecha_completada).toLocaleDateString('es-ES')}. Pide tu premio en caja.
        </p>
      )}
    </article>
  );
}
