'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles, Coins, Gift, Trophy } from 'lucide-react';
import { realizarTiradaGacha } from '@/lib/api/gacha';
import {
  ResultadoTirada,
  getRarezaColor,
  getRarezaLabel,
  formatearPremio,
  GachaConfig,
} from '@/types/gacha';
import confetti from 'canvas-confetti';

interface MaquinaGachaProps {
  config: GachaConfig;
  puntosActuales: number;
  onTiradaRealizada: () => void;
}

export function MaquinaGacha({ config, puntosActuales, onTiradaRealizada }: MaquinaGachaProps) {
  const [tirando, setTirando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoTirada | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const puedeJugar = puntosActuales >= config.costo_puntos;

  const lanzarConfetti = (rareza: string) => {
    const colors = {
      legendario: ['#F39C12', '#F1C40F', '#FFA500'],
      epico: ['#9B59B6', '#8E44AD', '#C39BD3'],
      raro: ['#3498DB', '#2980B9', '#85C1E2'],
      comun: ['#95A5A6', '#7F8C8D', '#BDC3C7'],
    };

    const count = rareza === 'legendario' ? 200 : rareza === 'epico' ? 150 : 100;

    confetti({
      particleCount: count,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors[rareza as keyof typeof colors] || colors.comun,
    });
  };

  const handleTirar = async () => {
    if (!puedeJugar || tirando) return;

    setTirando(true);

    try {
      const token = localStorage.getItem('client_token');
      const tenant = localStorage.getItem('tenant_domain');

      if (!token || !tenant) {
        throw new Error('No autenticado');
      }

      // Simular animación de giro (2 segundos)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await realizarTiradaGacha(token, tenant);
      setResultado(result);
      setModalOpen(true);

      // Lanzar confetti según rareza
      lanzarConfetti(result.premio_rareza);

      // Callback para actualizar puntos y premios
      onTiradaRealizada();
    } catch (error: any) {
      alert(error.message || 'Error al realizar tirada');
    } finally {
      setTirando(false);
    }
  };

  return (
    <>
      <Card className="p-8 text-center relative overflow-hidden">
        {/* Background decorativo */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, ${config.color_primario} 0%, transparent 50%),
                             radial-gradient(circle at 80% 50%, ${config.color_primario} 0%, transparent 50%)`,
          }}
        />

        <div className="relative z-10">
          {/* Icono */}
          <div className="mb-6">
            <div
              className="text-8xl animate-bounce inline-block"
              style={{
                filter: tirando ? 'blur(4px)' : 'none',
                transform: tirando ? 'scale(1.2) rotate(360deg)' : 'scale(1)',
                transition: 'all 2s ease-in-out',
              }}
            >
              {config.icono}
            </div>
          </div>

          {/* Nombre */}
          <h2 className="text-3xl font-bold mb-2">{config.nombre}</h2>
          <p className="text-muted-foreground mb-6">{config.descripcion}</p>

          {/* Costo */}
          <div className="inline-flex items-center gap-2 bg-muted px-6 py-3 rounded-full mb-6">
            <Coins className="h-5 w-5" style={{ color: config.color_primario }} />
            <span className="font-bold text-lg">{config.costo_puntos} puntos</span>
            <span className="text-muted-foreground">por tirada</span>
          </div>

          {/* Puntos actuales */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">Tus puntos actuales</p>
            <p className="text-2xl font-bold">{puntosActuales}</p>
          </div>

          {/* Botón */}
          <Button
            size="lg"
            className="text-lg px-8 py-6"
            style={{ backgroundColor: config.color_primario }}
            onClick={handleTirar}
            disabled={!puedeJugar || tirando}
          >
            {tirando ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                Girando...
              </>
            ) : !puedeJugar ? (
              <>
                <Coins className="mr-2 h-5 w-5" />
                Puntos insuficientes
              </>
            ) : (
              <>
                <Gift className="mr-2 h-5 w-5" />
                ¡Tirar Ahora!
              </>
            )}
          </Button>

          {!puedeJugar && (
            <p className="text-sm text-muted-foreground mt-4">
              Necesitas {config.costo_puntos - puntosActuales} puntos más para jugar
            </p>
          )}

          {/* Info de límites */}
          {(config.max_tiradas_por_dia || config.cooldown_minutos) && (
            <div className="mt-6 text-xs text-muted-foreground space-y-1">
              {config.max_tiradas_por_dia && (
                <p>• Máximo {config.max_tiradas_por_dia} tiradas por día</p>
              )}
              {config.cooldown_minutos && (
                <p>• Espera {config.cooldown_minutos} minutos entre tiradas</p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Resultado */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {resultado?.premio_rareza === 'legendario' && '🏆 ¡LEGENDARIO!'}
              {resultado?.premio_rareza === 'epico' && '💜 ¡ÉPICO!'}
              {resultado?.premio_rareza === 'raro' && '💙 ¡RARO!'}
              {resultado?.premio_rareza === 'comun' && '✨ ¡Premio!'}
            </DialogTitle>
          </DialogHeader>

          {resultado && (
            <div className="space-y-4">
              {/* Badge de Rareza */}
              <div className="flex justify-center">
                <Badge
                  className="text-lg px-4 py-2"
                  style={{
                    backgroundColor: `${getRarezaColor(resultado.premio_rareza)}20`,
                    color: getRarezaColor(resultado.premio_rareza),
                    borderColor: getRarezaColor(resultado.premio_rareza),
                  }}
                  variant="outline"
                >
                  {getRarezaLabel(resultado.premio_rareza)}
                </Badge>
              </div>

              {/* Premio */}
              <Card
                className="p-6 border-2"
                style={{
                  backgroundColor: `${getRarezaColor(resultado.premio_rareza)}10`,
                  borderColor: `${getRarezaColor(resultado.premio_rareza)}30`,
                }}
              >
                <div className="text-center">
                  <Trophy
                    className="h-16 w-16 mx-auto mb-4"
                    style={{ color: getRarezaColor(resultado.premio_rareza) }}
                  />
                  <h3 className="text-2xl font-bold mb-2">{resultado.premio_nombre}</h3>
                  {resultado.premio_descripcion && (
                    <p className="text-muted-foreground mb-4">{resultado.premio_descripcion}</p>
                  )}
                  <p
                    className="text-3xl font-bold"
                    style={{ color: getRarezaColor(resultado.premio_rareza) }}
                  >
                    {formatearPremio(resultado.premio_tipo, resultado.premio_valor)}
                  </p>
                </div>
              </Card>

              {/* Código de Canje */}
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm font-semibold text-center mb-2">Tu código de canje:</p>
                <div className="bg-background p-3 rounded border-2 border-dashed border-primary">
                  <code className="text-2xl font-bold tracking-wider block text-center">
                    {resultado.codigo_canje}
                  </code>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Válido hasta el{' '}
                  {new Date(resultado.fecha_expiracion).toLocaleDateString('es-ES')}
                </p>
              </div>

              {/* Puntos restantes */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Te quedan <span className="font-bold">{resultado.puntos_restantes}</span> puntos
                </p>
              </div>

              {/* Botón */}
              <Button className="w-full" onClick={() => setModalOpen(false)}>
                ¡Genial! Ver mis premios
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
