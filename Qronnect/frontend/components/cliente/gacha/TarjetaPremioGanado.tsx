'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Calendar, CheckCircle2, XCircle, Clock, Info } from 'lucide-react';
import {
  PremioGanadoHistorial,
  EstadoPremioGacha,
  getRarezaColor,
  getRarezaLabel,
  formatearPremio,
  calcularDiasRestantes,
  estaExpirado,
} from '@/types/gacha';

interface TarjetaPremioGanadoProps {
  premio: PremioGanadoHistorial;
  onVerDetalle?: () => void;
}

export function TarjetaPremioGanado({ premio, onVerDetalle }: TarjetaPremioGanadoProps) {
  const diasRestantes = calcularDiasRestantes(premio.fecha_expiracion);
  const expirado = estaExpirado(premio.fecha_expiracion);

  const getEstadoBadge = () => {
    switch (premio.estado) {
      case EstadoPremioGacha.PENDIENTE:
        return (
          <Badge variant="default" className="bg-blue-500">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente
          </Badge>
        );
      case EstadoPremioGacha.CANJEADO:
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Canjeado
          </Badge>
        );
      case EstadoPremioGacha.EXPIRADO:
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Expirado
          </Badge>
        );
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-3xl border-ink/[0.07] p-5 shadow-none">
      {/* Barra de color superior según rareza */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: premio.gacha_premios.color_rareza }}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-4 mt-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              style={{
                backgroundColor: `${premio.gacha_premios.color_rareza}20`,
                color: premio.gacha_premios.color_rareza,
                borderColor: premio.gacha_premios.color_rareza,
              }}
              variant="outline"
            >
              {getRarezaLabel(premio.gacha_premios.rareza)}
            </Badge>
          </div>
          <h3 className="font-display text-lg font-bold">{premio.gacha_premios.nombre}</h3>
          {premio.gacha_premios.descripcion && (
            <p className="text-sm text-muted-foreground mt-1">
              {premio.gacha_premios.descripcion}
            </p>
          )}
        </div>
        {getEstadoBadge()}
      </div>

      {/* Premio */}
      <div
        className="mb-4 rounded-2xl border p-4"
        style={{
          backgroundColor: `${premio.gacha_premios.color_rareza}10`,
          borderColor: `${premio.gacha_premios.color_rareza}30`,
        }}
      >
        <div className="flex items-center gap-3">
          <Gift
            className="h-8 w-8 flex-shrink-0"
            style={{ color: premio.gacha_premios.color_rareza }}
          />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tu premio
            </p>
            <p className="text-xl font-bold" style={{ color: premio.gacha_premios.color_rareza }}>
              {formatearPremio(premio.gacha_premios.tipo, premio.gacha_premios.valor)}
            </p>
          </div>
        </div>
      </div>

      {/* Código de Canje */}
      {premio.estado === EstadoPremioGacha.PENDIENTE && (
        <div className="mb-4 rounded-2xl bg-ink/[0.04] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Tu código de canje:</span>
            {diasRestantes !== null && (
              <Badge variant={diasRestantes < 7 ? 'destructive' : 'secondary'} className="text-xs">
                <Calendar className="mr-1 h-3 w-3" />
                {diasRestantes === 0
                  ? 'Expira hoy'
                  : `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`}
              </Badge>
            )}
          </div>
          <div className="rounded-xl border-2 border-dashed border-ink/20 bg-white p-3">
            <code className="block text-center font-mono text-2xl font-bold tracking-[0.15em]">
              {premio.codigo_canje}
            </code>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Enséñalo en caja para recoger tu premio
          </p>
        </div>
      )}

      {/* Condiciones */}
      {premio.gacha_premios.condiciones && premio.estado === EstadoPremioGacha.PENDIENTE && (
        <div className="mb-4 rounded-2xl border border-ink/10 p-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink/50" />
            <div className="flex-1">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink/55">
                Condiciones
              </p>
              <p className="text-sm text-ink/75">
                {premio.gacha_premios.condiciones}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fecha de Ganado */}
      <p className="text-xs text-muted-foreground text-center mb-4">
        Ganado el {new Date(premio.fecha_tirada).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>

      {/* Mensaje según estado */}
      {premio.estado === EstadoPremioGacha.CANJEADO && premio.fecha_canjeado && (
        <div className="rounded-2xl bg-ink/[0.04] p-3">
          <p className="text-center text-sm text-ink/60">
            Canjeado el {new Date(premio.fecha_canjeado).toLocaleDateString('es-ES')}
          </p>
        </div>
      )}

      {expirado && premio.estado === EstadoPremioGacha.PENDIENTE && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-800 dark:text-red-200 text-center">
            Este premio ha expirado
          </p>
        </div>
      )}

    </Card>
  );
}
