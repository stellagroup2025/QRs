'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dices, Save, Sparkles, Clock, Settings, TrendingUp } from 'lucide-react';

import { obtenerConfigGacha, configurarGacha, obtenerEstadisticasGacha } from '@/lib/api/gacha';
import { GachaConfig, EstadisticasGacha } from '@/types/gacha';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

export default function ConfiguracionGachaPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<Partial<GachaConfig>>({
    activo: false,
    costo_puntos: 50,
    nombre: 'Máquina de Premios',
    descripcion: 'Gasta puntos y gana premios increíbles al azar',
    max_tiradas_por_dia: null,
    cooldown_minutos: null,
    color_primario: '#FF6B9D',
    icono: '🎰',
  });
  const [estadisticas, setEstadisticas] = useState<EstadisticasGacha | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const domain = window.location.hostname.split('.')[0];
      const tenant = domain === 'localhost' ? 'demo-omar-77' : domain;

      if (!token) return;

      const [configData, stats] = await Promise.all([
        obtenerConfigGacha(token, tenant),
        obtenerEstadisticasGacha(token, tenant).catch(() => null),
      ]);

      if (configData) {
        setConfig(configData);
      }

      if (stats) {
        setEstadisticas(stats);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const domain = window.location.hostname.split('.')[0];
      const tenant = domain === 'localhost' ? 'demo-omar-77' : domain;

      if (!token) {
        throw new Error('No autenticado');
      }

      await configurarGacha(token, tenant, config);

      toast({
        title: 'Guardado',
        description: 'La configuración del gacha se ha actualizado correctamente',
      });

      await cargarDatos();
    } catch (error: any) {
      console.error('Error guardando:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la configuración',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">

        <div className="flex items-center justify-center h-screen">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Dices className="h-8 w-8" />
              Gacha - Máquina de Premios
            </h1>
            <p className="text-muted-foreground mt-1">
              Sistema de premios aleatorios para gamificar tu programa de fidelización
            </p>
          </div>
          <Button onClick={handleGuardar} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>

        <Tabs defaultValue="configuracion" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configuracion">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </TabsTrigger>
            <TabsTrigger value="premios">
              <Sparkles className="h-4 w-4 mr-2" />
              Premios
            </TabsTrigger>
            <TabsTrigger value="estadisticas">
              <TrendingUp className="h-4 w-4 mr-2" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configuracion" className="space-y-6">
            {/* Estado */}
            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
                <CardDescription>
                  Activa o desactiva el sistema gacha para tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="activo" className="text-base">
                      Sistema Gacha Activo
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Los clientes podrán gastar puntos para obtener premios
                    </p>
                  </div>
                  <Switch
                    id="activo"
                    checked={config.activo}
                    onCheckedChange={(checked) => setConfig({ ...config, activo: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configuración Básica */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración Básica</CardTitle>
                <CardDescription>
                  Personaliza el nombre, descripción y costo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre del Gacha</Label>
                    <Input
                      id="nombre"
                      value={config.nombre}
                      onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
                      placeholder="Máquina de Premios"
                    />
                  </div>
                  <div>
                    <Label htmlFor="icono">Icono (Emoji)</Label>
                    <Input
                      id="icono"
                      value={config.icono}
                      onChange={(e) => setConfig({ ...config, icono: e.target.value })}
                      placeholder="🎰"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={config.descripcion}
                    onChange={(e) => setConfig({ ...config, descripcion: e.target.value })}
                    placeholder="Gasta puntos y gana premios increíbles al azar"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costo_puntos">Costo por Tirada (puntos)</Label>
                    <Input
                      id="costo_puntos"
                      type="number"
                      min="1"
                      value={config.costo_puntos}
                      onChange={(e) =>
                        setConfig({ ...config, costo_puntos: parseInt(e.target.value) || 1 })
                      }
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Puntos que se descontarán por cada tirada
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="color_primario">Color Primario</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color_primario"
                        type="color"
                        value={config.color_primario}
                        onChange={(e) => setConfig({ ...config, color_primario: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={config.color_primario}
                        onChange={(e) => setConfig({ ...config, color_primario: e.target.value })}
                        placeholder="#FF6B9D"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Límites y Restricciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Límites y Restricciones
                </CardTitle>
                <CardDescription>
                  Configura límites para controlar el uso del gacha
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="max_tiradas">Máximo de Tiradas por Día (opcional)</Label>
                  <Input
                    id="max_tiradas"
                    type="number"
                    min="0"
                    value={config.max_tiradas_por_dia || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        max_tiradas_por_dia: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="Sin límite"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Deja vacío para tiradas ilimitadas por día
                  </p>
                </div>

                <div>
                  <Label htmlFor="cooldown">Tiempo de Espera entre Tiradas (minutos)</Label>
                  <Input
                    id="cooldown"
                    type="number"
                    min="0"
                    value={config.cooldown_minutos || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        cooldown_minutos: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="Sin cooldown"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Tiempo que debe esperar el cliente entre tiradas
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="premios">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Premios</CardTitle>
                <CardDescription>
                  Configura los premios disponibles y sus probabilidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  La gestión de premios se ha movido a una sección dedicada para mayor control.
                </p>
                <Link href="/admin/gacha/premios">
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Ir a Gestión de Premios
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estadisticas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tiradas Totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{estadisticas?.total_tiradas || 0}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {estadisticas?.total_puntos_gastados || 0} puntos gastados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tasa de Canje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {estadisticas?.tasa_canje.toFixed(1) || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {estadisticas?.premios_canjeados || 0} de {estadisticas?.total_tiradas || 0}{' '}
                    premios canjeados
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Premios por Rareza</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gray-100">
                      <div className="text-2xl font-bold">{estadisticas?.por_rareza.comun || 0}</div>
                      <p className="text-sm text-gray-600">Comunes</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-100">
                      <div className="text-2xl font-bold text-blue-700">
                        {estadisticas?.por_rareza.raro || 0}
                      </div>
                      <p className="text-sm text-blue-600">Raros</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-100">
                      <div className="text-2xl font-bold text-purple-700">
                        {estadisticas?.por_rareza.epico || 0}
                      </div>
                      <p className="text-sm text-purple-600">Épicos</p>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-100">
                      <div className="text-2xl font-bold text-amber-700">
                        {estadisticas?.por_rareza.legendario || 0}
                      </div>
                      <p className="text-sm text-amber-600">Legendarios</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Botón de guardar inferior */}
        <div className="flex justify-end">
          <Button onClick={handleGuardar} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}
