'use client';

import { useState, useEffect } from 'react';
import { TarjetaSelloConProgreso, EstadoTarjetaSello } from '@/types/sellos';
import { obtenerTarjetasCliente } from '@/lib/api/sellos';
import { TarjetaSelloCard } from './TarjetaSelloCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Loader2, Stamp } from 'lucide-react';
import { toast } from 'sonner';

interface MisTarjetasSellosProps {
  idCliente: string;
  token: string;
  slug: string;
}

export function MisTarjetasSellos({ idCliente, token, slug }: MisTarjetasSellosProps) {
  const [tarjetas, setTarjetas] = useState<TarjetaSelloConProgreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabActiva, setTabActiva] = useState<'activas' | 'completadas' | 'todas'>('activas');

  useEffect(() => {
    cargarTarjetas();
  }, []);

  const cargarTarjetas = async () => {
    try {
      setLoading(true);
      const data = await obtenerTarjetasCliente(idCliente, token, slug, false);
      setTarjetas(data);
    } catch (error) {
      console.error('Error al cargar tarjetas:', error);
      toast.error('Error al cargar tus tarjetas de sellos');
    } finally {
      setLoading(false);
    }
  };

  const tarjetasActivas = tarjetas.filter(
    (t) => t.estado === EstadoTarjetaSello.ACTIVA
  );

  const tarjetasCompletadas = tarjetas.filter(
    (t) =>
      t.estado === EstadoTarjetaSello.COMPLETADA ||
      t.estado === EstadoTarjetaSello.CANJEADA
  );

  const renderTarjetas = (listaTarjetas: TarjetaSelloConProgreso[]) => {
    if (listaTarjetas.length === 0) {
      return (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-6">
              <Stamp className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No hay tarjetas aquí</h3>
              <p className="text-muted-foreground mt-1">
                {tabActiva === 'activas'
                  ? 'Realiza tu primera compra para empezar a coleccionar sellos'
                  : 'Aún no has completado ninguna tarjeta de sellos'}
              </p>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listaTarjetas.map((tarjeta) => (
          <TarjetaSelloCard key={tarjeta.id} tarjeta={tarjeta} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Mis Tarjetas de Sellos</h2>
        <p className="text-muted-foreground mt-1">
          Acumula sellos y obtén premios exclusivos
        </p>
      </div>

      {/* Estadísticas rápidas */}
      {tarjetas.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tarjetas activas</p>
                <p className="text-2xl font-bold">{tarjetasActivas.length}</p>
              </div>
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                <Stamp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold">
                  {
                    tarjetas.filter((t) => t.estado === EstadoTarjetaSello.COMPLETADA)
                      .length
                  }
                </p>
              </div>
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                <Stamp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Premios canjeados</p>
                <p className="text-2xl font-bold">
                  {
                    tarjetas.filter((t) => t.estado === EstadoTarjetaSello.CANJEADA)
                      .length
                  }
                </p>
              </div>
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-3">
                <Stamp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs de filtrado */}
      <Tabs value={tabActiva} onValueChange={(v) => setTabActiva(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activas">
            Activas ({tarjetasActivas.length})
          </TabsTrigger>
          <TabsTrigger value="completadas">
            Completadas ({tarjetasCompletadas.length})
          </TabsTrigger>
          <TabsTrigger value="todas">Todas ({tarjetas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="activas" className="mt-6">
          {renderTarjetas(tarjetasActivas)}
        </TabsContent>

        <TabsContent value="completadas" className="mt-6">
          {renderTarjetas(tarjetasCompletadas)}
        </TabsContent>

        <TabsContent value="todas" className="mt-6">
          {renderTarjetas(tarjetas)}
        </TabsContent>
      </Tabs>

      {/* Mensaje si no hay tarjetas */}
      {tarjetas.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-8">
              <Stamp className="h-16 w-16 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">¡Comienza a coleccionar!</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Realiza compras en el establecimiento y empieza a acumular sellos para
                obtener premios exclusivos
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
