'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dices, Gift, Trophy } from 'lucide-react';
import { ClientNav } from '@/components/ClientNav';
import { MaquinaGacha } from '@/components/cliente/gacha/MaquinaGacha';
import { TarjetaPremioGanado } from '@/components/cliente/gacha/TarjetaPremioGanado';
import { obtenerInfoGacha, obtenerMisPremiosGacha, verificarPuntosGacha } from '@/lib/api/gacha';
import { GachaConfig, PremioGanadoHistorial } from '@/types/gacha';

export default function GachaPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<GachaConfig | null>(null);
  const [premios, setPremios] = useState<PremioGanadoHistorial[]>([]);
  const [puntosActuales, setPuntosActuales] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem('client_token');
      const tenant = slug;

      if (!token) {
        window.location.href = `/recuperar`;
        return;
      }

      const [configData, premiosData, puntosData] = await Promise.all([
        obtenerInfoGacha(token, tenant),
        obtenerMisPremiosGacha(token, tenant),
        verificarPuntosGacha(token, tenant),
      ]);

      setConfig(configData);
      setPremios(premiosData);
      setPuntosActuales(puntosData.puntos_actuales);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <ClientNav />
        <div className="flex items-center justify-center h-screen">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!config || !config.activo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <ClientNav />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Dices className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Sistema de Premios No Disponible</h2>
                <p className="text-muted-foreground">
                  El sistema de premios aleatorios no está activo en este momento.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const premiosPendientes = premios.filter((p) => p.estado === 'pendiente');
  const premiosCanjeados = premios.filter((p) => p.estado === 'canjeado');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <ClientNav />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Dices className="h-8 w-8" />
            {config.nombre}
          </h1>
          <p className="text-gray-600 mt-2">{config.descripcion}</p>
        </div>

        <Tabs defaultValue="jugar" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jugar">
              <Dices className="h-4 w-4 mr-2" />
              Jugar
            </TabsTrigger>
            <TabsTrigger value="mis-premios">
              <Gift className="h-4 w-4 mr-2" />
              Mis Premios ({premiosPendientes.length})
            </TabsTrigger>
            <TabsTrigger value="historial">
              <Trophy className="h-4 w-4 mr-2" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jugar" className="mt-6">
            <MaquinaGacha
              config={config}
              puntosActuales={puntosActuales}
              onTiradaRealizada={cargarDatos}
            />

            {/* Información adicional */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>1. Gasta {config.costo_puntos} puntos por cada tirada</p>
                <p>2. Obtén un premio aleatorio según su rareza</p>
                <p>3. Recibe un código único para canjear tu premio</p>
                <p>4. Muestra el código al personal del establecimiento</p>
                <p className="text-xs pt-2">
                  💡 Los premios legendarios son los más raros y valiosos
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mis-premios" className="mt-6">
            {premiosPendientes.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No tienes premios pendientes</h3>
                    <p className="text-muted-foreground">
                      Juega al gacha para ganar premios increíbles
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {premiosPendientes.map((premio) => (
                  <TarjetaPremioGanado key={premio.id} premio={premio} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="historial" className="mt-6">
            {premios.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Sin historial</h3>
                    <p className="text-muted-foreground">
                      Aún no has jugado al gacha
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Tiradas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{premios.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {premiosPendientes.length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Canjeados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {premiosCanjeados.length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {premios.map((premio) => (
                    <TarjetaPremioGanado key={premio.id} premio={premio} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
