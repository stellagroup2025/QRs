'use client';

import { TarjetaSelloConProgreso, EstadoTarjetaSello, calcularDiasRestantes, estaExpirado } from '@/types/sellos';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Gift, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TarjetaSelloCardProps {
  tarjeta: TarjetaSelloConProgreso;
  onVerDetalle?: () => void;
}

export function TarjetaSelloCard({ tarjeta, onVerDetalle }: TarjetaSelloCardProps) {
  const {
    programa_nombre,
    programa_color,
    programa_icono,
    sellos_actuales,
    sellos_objetivo,
    porcentaje_completado,
    estado,
    codigo_cupon,
    puede_canjear,
    fecha_completada,
    fecha_expiracion,
  } = tarjeta;

  const diasRestantes = calcularDiasRestantes(fecha_expiracion);
  const expirado = estaExpirado(fecha_expiracion);

  const renderSellos = () => {
    const sellos = [];
    for (let i = 1; i <= sellos_objetivo; i++) {
      const completado = i <= sellos_actuales;
      sellos.push(
        <div
          key={i}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
            completado
              ? 'bg-primary border-primary text-primary-foreground scale-110'
              : 'border-muted-foreground/30 text-muted-foreground'
          )}
          style={
            completado
              ? { backgroundColor: programa_color, borderColor: programa_color }
              : {}
          }
        >
          {completado ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <span className="text-xs font-semibold">{i}</span>
          )}
        </div>
      );
    }
    return sellos;
  };

  const getEstadoBadge = () => {
    switch (estado) {
      case EstadoTarjetaSello.ACTIVA:
        return (
          <Badge variant="default" className="bg-blue-500">
            <Clock className="mr-1 h-3 w-3" />
            Activa
          </Badge>
        );
      case EstadoTarjetaSello.COMPLETADA:
        return (
          <Badge variant="default" className="bg-green-500">
            <Gift className="mr-1 h-3 w-3" />
            ¡Completada!
          </Badge>
        );
      case EstadoTarjetaSello.CANJEADA:
        return (
          <Badge variant="secondary">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Canjeada
          </Badge>
        );
      case EstadoTarjetaSello.EXPIRADA:
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Expirada
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Barra de color superior */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: programa_color || '#3B82F6' }}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-4 mt-2">
        <div>
          <h3 className="text-lg font-bold">{programa_nombre}</h3>
          <p className="text-sm text-muted-foreground">
            {sellos_actuales} de {sellos_objetivo} sellos
          </p>
        </div>
        {getEstadoBadge()}
      </div>

      {/* Barra de progreso */}
      <div className="mb-6">
        <Progress
          value={porcentaje_completado}
          className="h-2"
          style={
            {
              '--progress-background': programa_color || '#3B82F6',
            } as React.CSSProperties
          }
        />
        <p className="text-xs text-muted-foreground text-center mt-1">
          {porcentaje_completado.toFixed(0)}% completado
        </p>
      </div>

      {/* Visualización de sellos */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {renderSellos()}
      </div>

      {/* Cupón si está completada */}
      {estado === EstadoTarjetaSello.COMPLETADA && codigo_cupon && (
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Tu código de cupón:</span>
            {diasRestantes !== null && (
              <Badge variant={diasRestantes < 7 ? 'destructive' : 'secondary'} className="text-xs">
                <Calendar className="mr-1 h-3 w-3" />
                {diasRestantes === 0
                  ? 'Expira hoy'
                  : `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`}
              </Badge>
            )}
          </div>
          <div className="bg-background p-3 rounded border-2 border-dashed border-primary/50">
            <code className="text-lg font-bold tracking-wider block text-center">
              {codigo_cupon}
            </code>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Presenta este código en el establecimiento para canjear tu premio
          </p>
        </div>
      )}

      {/* Fechas importantes */}
      {fecha_completada && estado === EstadoTarjetaSello.COMPLETADA && (
        <p className="text-xs text-muted-foreground text-center mb-4">
          Completada el {new Date(fecha_completada).toLocaleDateString('es-ES')}
        </p>
      )}

      {/* Botón de acción */}
      {onVerDetalle && (
        <Button variant="outline" className="w-full" onClick={onVerDetalle}>
          Ver Detalles
        </Button>
      )}

      {/* Mensaje de felicitación */}
      {puede_canjear && (
        <div className="mt-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-sm text-green-800 dark:text-green-200 text-center font-medium">
            🎉 ¡Felicidades! Ya puedes canjear tu premio
          </p>
        </div>
      )}

      {/* Mensaje de expiración */}
      {expirado && estado === EstadoTarjetaSello.COMPLETADA && (
        <div className="mt-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-800 dark:text-red-200 text-center">
            Este cupón ha expirado
          </p>
        </div>
      )}
    </Card>
  );
}
