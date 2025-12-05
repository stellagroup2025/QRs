'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProgramaSellos, OtorgarSelloRequest } from '@/types/sellos';
import { obtenerProgramasSellos, otorgarSello } from '@/lib/api/sellos';
import { toast } from 'sonner';
import { Stamp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OtorgarSelloModalProps {
  idCliente: string;
  nombreCliente: string;
  token: string;
  onClose: (otorgado: boolean) => void;
}

export function OtorgarSelloModal({
  idCliente,
  nombreCliente,
  token,
  onClose,
}: OtorgarSelloModalProps) {
  const [programas, setProgramas] = useState<ProgramaSellos[]>([]);
  const [loadingProgramas, setLoadingProgramas] = useState(true);
  const [loadingOtorgar, setLoadingOtorgar] = useState(false);
  const [programaSeleccionado, setProgramaSeleccionado] = useState<string>('');
  const [notas, setNotas] = useState('');
  const [resultado, setResultado] = useState<any>(null);

  useEffect(() => {
    cargarProgramas();
  }, []);

  const cargarProgramas = async () => {
    try {
      const data = await obtenerProgramasSellos(token, true); // Solo activos
      setProgramas(data);
      if (data.length > 0) {
        setProgramaSeleccionado(data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar programas:', error);
      toast.error('Error al cargar programas de sellos');
    } finally {
      setLoadingProgramas(false);
    }
  };

  const handleOtorgar = async () => {
    if (!programaSeleccionado) {
      toast.error('Selecciona un programa de sellos');
      return;
    }

    setLoadingOtorgar(true);
    setResultado(null);

    try {
      const request: OtorgarSelloRequest = {
        id_cliente: idCliente,
        id_programa: programaSeleccionado,
        notas: notas.trim() || undefined,
      };

      const respuesta = await otorgarSello(request, token);

      if (respuesta.success) {
        setResultado(respuesta);

        if (respuesta.completada) {
          toast.success('¡Tarjeta completada! Se generó un cupón', {
            duration: 5000,
          });
        } else {
          toast.success(
            `Sello otorgado (${respuesta.sellos_actuales}/${respuesta.sellos_objetivo})`
          );
        }
      } else {
        toast.error(respuesta.error || 'Error al otorgar sello');
      }
    } catch (error: any) {
      console.error('Error al otorgar sello:', error);
      toast.error(error.message || 'Error al otorgar sello');
    } finally {
      setLoadingOtorgar(false);
    }
  };

  const programaActual = programas.find((p) => p.id === programaSeleccionado);

  if (loadingProgramas) {
    return (
      <Dialog open onOpenChange={() => onClose(false)}>
        <DialogContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (programas.length === 0) {
    return (
      <Dialog open onOpenChange={() => onClose(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Otorgar Sello</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No hay programas de sellos activos. Crea uno primero para poder otorgar sellos.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button onClick={() => onClose(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={() => onClose(!!resultado)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Otorgar Sello</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cliente */}
          <div>
            <Label>Cliente</Label>
            <div className="mt-2 p-3 bg-muted rounded-lg">
              <p className="font-semibold">{nombreCliente}</p>
            </div>
          </div>

          {/* Programa */}
          <div className="space-y-2">
            <Label htmlFor="programa">Programa de sellos</Label>
            <Select
              value={programaSeleccionado}
              onValueChange={setProgramaSeleccionado}
              disabled={!!resultado}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {programas.map((programa) => (
                  <SelectItem key={programa.id} value={programa.id}>
                    <div className="flex items-center gap-2">
                      <span>{programa.nombre}</span>
                      <span className="text-xs text-muted-foreground">
                        ({programa.sellos_requeridos} sellos)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {programaActual && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Sellos necesarios:</span>{' '}
                  <span className="font-semibold">{programaActual.sellos_requeridos}</span>
                </p>
                {programaActual.sellos_por_dia_max && (
                  <p>
                    <span className="text-muted-foreground">Límite diario:</span>{' '}
                    <span className="font-semibold">
                      {programaActual.sellos_por_dia_max} sello(s)
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Compra de café americano"
              rows={2}
              disabled={!!resultado}
            />
          </div>

          {/* Resultado */}
          {resultado && (
            <Alert
              className={
                resultado.completada
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
              }
            >
              {resultado.completada ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Stamp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
              <AlertDescription>
                {resultado.completada ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      🎉 ¡Tarjeta completada!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Se generó el cupón:{' '}
                      <code className="font-bold">{resultado.codigo_cupon}</code>
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      El cliente puede canjearlo ahora
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-semibold text-blue-800 dark:text-blue-200">
                      Sello otorgado exitosamente
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Progreso: {resultado.sellos_actuales} / {resultado.sellos_objetivo}{' '}
                      sellos
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Faltan {resultado.sellos_objetivo - resultado.sellos_actuales} sello(s)
                      para completar
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onClose(!!resultado)}>
              {resultado ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!resultado && (
              <Button onClick={handleOtorgar} disabled={loadingOtorgar}>
                {loadingOtorgar ? 'Otorgando...' : 'Otorgar Sello'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
