'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { canjearCuponSello, verificarCuponSello } from '@/lib/api/sellos';
import { TarjetaSelloConProgreso, formatearPremio } from '@/types/sellos';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Gift, Search, Loader2 } from 'lucide-react';

interface CanjearCuponModalProps {
  token: string;
  onClose: (canjeado: boolean) => void;
}

export function CanjearCuponModal({ token, onClose }: CanjearCuponModalProps) {
  const [codigo, setCodigo] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [canjeando, setCanjeando] = useState(false);
  const [tarjetaVerificada, setTarjetaVerificada] = useState<TarjetaSelloConProgreso | null>(
    null
  );
  const [resultado, setResultado] = useState<any>(null);

  const handleVerificar = async () => {
    if (!codigo.trim()) {
      toast.error('Ingresa un código de cupón');
      return;
    }

    setVerificando(true);
    setTarjetaVerificada(null);
    setResultado(null);

    try {
      const tarjeta = await verificarCuponSello(codigo.trim().toUpperCase(), token);
      setTarjetaVerificada(tarjeta);

      if (!tarjeta.puede_canjear) {
        let mensaje = 'Este cupón no puede ser canjeado';

        if (tarjeta.cupon_canjeado) {
          mensaje = 'Este cupón ya fue canjeado anteriormente';
        } else if (tarjeta.estado === 'expirada') {
          mensaje = 'Este cupón ha expirado';
        } else if (tarjeta.estado === 'activa') {
          mensaje = 'Esta tarjeta aún no ha sido completada';
        }

        toast.error(mensaje);
      } else {
        toast.success('Cupón válido y disponible para canjear');
      }
    } catch (error: any) {
      console.error('Error al verificar cupón:', error);
      toast.error(error.message || 'Cupón no encontrado');
      setTarjetaVerificada(null);
    } finally {
      setVerificando(false);
    }
  };

  const handleCanjear = async () => {
    if (!codigo.trim()) {
      toast.error('Ingresa un código de cupón');
      return;
    }

    setCanjeando(true);

    try {
      const respuesta = await canjearCuponSello(
        { codigo_cupon: codigo.trim().toUpperCase() },
        token
      );

      if (respuesta.success) {
        setResultado(respuesta);
        toast.success('Cupón canjeado exitosamente');
      } else {
        toast.error(respuesta.error || 'Error al canjear cupón');
      }
    } catch (error: any) {
      console.error('Error al canjear cupón:', error);
      toast.error(error.message || 'Error al canjear cupón');
    } finally {
      setCanjeando(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose(!!resultado)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Canjear Cupón de Sello</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input de código */}
          <div className="space-y-2">
            <Label htmlFor="codigo">Código del cupón</Label>
            <div className="flex gap-2">
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="SELLO-XXXXXXXX"
                className="font-mono uppercase"
                disabled={!!resultado}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !resultado) {
                    handleVerificar();
                  }
                }}
              />
              {!resultado && (
                <Button
                  variant="outline"
                  onClick={handleVerificar}
                  disabled={verificando || !codigo.trim()}
                >
                  {verificando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Información de tarjeta verificada */}
          {tarjetaVerificada && !resultado && (
            <div className="space-y-4">
              <Alert
                className={
                  tarjetaVerificada.puede_canjear
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                }
              >
                {tarjetaVerificada.puede_canjear ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <AlertDescription>
                  {tarjetaVerificada.puede_canjear ? (
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      ✓ Cupón válido
                    </p>
                  ) : (
                    <p className="font-semibold text-red-800 dark:text-red-200">
                      ✗ Cupón no disponible
                    </p>
                  )}
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{tarjetaVerificada.cliente_nombre}</p>
                  {tarjetaVerificada.cliente_email && (
                    <p className="text-sm text-muted-foreground">
                      {tarjetaVerificada.cliente_email}
                    </p>
                  )}
                </div>

                <div className="h-px bg-border" />

                <div>
                  <p className="text-sm text-muted-foreground">Programa</p>
                  <p className="font-semibold">{tarjetaVerificada.programa_nombre}</p>
                </div>

                <div className="h-px bg-border" />

                <div>
                  <p className="text-sm text-muted-foreground">Premio</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    {formatearPremio(
                      tarjetaVerificada.tipo_premio,
                      tarjetaVerificada.premio_detalles
                    )}
                  </p>
                </div>

                {tarjetaVerificada.instrucciones_canje && (
                  <>
                    <div className="h-px bg-border" />
                    <div>
                      <p className="text-sm text-muted-foreground">Instrucciones</p>
                      <p className="text-sm">{tarjetaVerificada.instrucciones_canje}</p>
                    </div>
                  </>
                )}

                {tarjetaVerificada.fecha_expiracion && (
                  <>
                    <div className="h-px bg-border" />
                    <div>
                      <p className="text-sm text-muted-foreground">Válido hasta</p>
                      <p className="text-sm font-medium">
                        {new Date(tarjetaVerificada.fecha_expiracion).toLocaleDateString(
                          'es-ES',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Resultado del canje */}
          {resultado && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    ✓ Cupón canjeado exitosamente
                  </p>
                  <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <p>
                      <span className="font-medium">Cliente:</span>{' '}
                      {resultado.programa_nombre}
                    </p>
                    <p>
                      <span className="font-medium">Premio:</span>{' '}
                      {formatearPremio(resultado.tipo_premio, resultado.premio_detalles)}
                    </p>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    El cupón ha sido marcado como usado y no puede volver a canjearse
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onClose(!!resultado)}>
              {resultado ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!resultado && (
              <Button
                onClick={handleCanjear}
                disabled={canjeando || !tarjetaVerificada?.puede_canjear}
              >
                {canjeando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Canjeando...
                  </>
                ) : (
                  <>
                    <Gift className="mr-2 h-4 w-4" />
                    Canjear Cupón
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
