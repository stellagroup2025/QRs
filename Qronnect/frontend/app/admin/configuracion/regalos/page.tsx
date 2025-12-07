'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Gift, TrendingUp, Users, Calendar } from 'lucide-react';


interface ConfiguracionRegalo {
  activo: boolean;
  tipo: 'puntos' | 'cupon' | 'promocion';
  valor: {
    puntos?: number;
    descuento_porcentaje?: number;
    promocion_id?: string;
    mensaje_personalizado?: string;
    enviar_email?: boolean;
    enviar_sms?: boolean;
  };
}

interface Estadisticas {
  total_otorgados: number;
  ultimos_30_dias: number;
  por_tipo?: {
    puntos?: number;
    cupon?: number;
    promocion?: number;
  };
}

interface Regalo {
  cliente_nombre: string;
  tipo_regalo: string;
  valor_regalo: any;
  creado_en: string;
}

export default function RegalosPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ConfiguracionRegalo>({
    activo: false,
    tipo: 'puntos',
    valor: {
      puntos: 100,
      mensaje_personalizado: '¡Bienvenido! Te regalamos puntos de bienvenida',
      enviar_email: true,
      enviar_sms: false,
    },
  });
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total_otorgados: 0,
    ultimos_30_dias: 0,
  });
  const [historial, setHistorial] = useState<Regalo[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      let tenant = localStorage.getItem('tenant_domain');

      // Fallback: Si no hay tenant en localStorage, extraerlo del dominio actual
      if (!tenant) {
        const host = window.location.host;
        const parts = host.split('.');

        // Si es subdominio.qronnect.es -> usar subdominio
        if (parts.length >= 2 && !host.startsWith('localhost')) {
          tenant = parts[0];
        }
        // Si es localhost -> usar default
        else {
          tenant = 'lokeyokiera'; // fallback para desarrollo
        }

        console.log('⚠️ tenant_domain no encontrado en localStorage, usando:', tenant);
        // Guardar para futuras peticiones
        localStorage.setItem('tenant_domain', tenant);
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Cargar configuración
      const configRes = await fetch(`${API_URL}/api/tiendas/config/regalo-bienvenida`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': tenant,
        },
      });

      if (configRes.ok) {
        const data = await configRes.json();
        if (data.tipo) {
          setConfig(data);
        }
      }

      // Cargar estadísticas
      const statsRes = await fetch(`${API_URL}/api/tiendas/regalos-bienvenida/estadisticas`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': tenant,
        },
      });

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setEstadisticas(stats);
      }

      // Cargar historial
      const historialRes = await fetch(`${API_URL}/api/tiendas/regalos-bienvenida/historial?limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': tenant,
        },
      });

      if (historialRes.ok) {
        const data = await historialRes.json();
        setHistorial(data.regalos || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarConfiguracion = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      let tenant = localStorage.getItem('tenant_domain');

      // Fallback: Si no hay tenant en localStorage, extraerlo del dominio actual
      if (!tenant) {
        const host = window.location.host;
        const parts = host.split('.');

        // Si es subdominio.qronnect.es -> usar subdominio
        if (parts.length >= 2 && !host.startsWith('localhost')) {
          tenant = parts[0];
        }
        // Si es localhost -> usar default
        else {
          tenant = 'lokeyokiera'; // fallback para desarrollo
        }

        console.log('⚠️ tenant_domain no encontrado en localStorage, usando:', tenant);
        // Guardar para futuras peticiones
        localStorage.setItem('tenant_domain', tenant);
      }

      console.log('🔧 [GUARDAR CONFIG REGALOS]', {
        tenant,
        hasToken: !!token,
        apiUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/tiendas/config/regalo-bienvenida`
      });

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${API_URL}/api/tiendas/config/regalo-bienvenida`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': tenant,
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast({
          title: 'Configuración guardada',
          description: 'El sistema de regalos se ha actualizado correctamente',
        });
        cargarDatos();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'No se pudo guardar la configuración',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ocurrió un error al guardar',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>

        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando configuración...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Regalos de Bienvenida</h1>
          <p className="text-gray-600 mt-2">
            Configura regalos automáticos para nuevos clientes al registrarse
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Otorgados</CardTitle>
              <Gift className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.total_otorgados}</div>
              <p className="text-xs text-gray-500 mt-1">Desde el inicio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Últimos 30 días</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadisticas.ultimos_30_dias}</div>
              <p className="text-xs text-gray-500 mt-1">Nuevos clientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{config.activo ? 'Activo' : 'Inactivo'}</div>
              <p className="text-xs text-gray-500 mt-1">Sistema de regalos</p>
            </CardContent>
          </Card>
        </div>

        {/* Configuración */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configuración de Regalos</CardTitle>
            <CardDescription>Define qué regalar a los nuevos clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Activar/Desactivar */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="activo" className="text-base font-medium">
                  Sistema Activo
                </Label>
                <p className="text-sm text-gray-500">
                  Activar o desactivar el sistema de regalos de bienvenida
                </p>
              </div>
              <Switch
                id="activo"
                checked={config.activo}
                onCheckedChange={(checked) => setConfig({ ...config, activo: checked })}
              />
            </div>

            {/* Tipo de regalo */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tipo de Regalo</Label>
              <RadioGroup
                value={config.tipo}
                onValueChange={(value: any) =>
                  setConfig({
                    ...config,
                    tipo: value,
                    valor: {
                      ...config.valor,
                      puntos: value === 'puntos' ? 100 : undefined,
                      descuento_porcentaje: value === 'cupon' ? 10 : undefined,
                      promocion_id: value === 'promocion' ? '' : undefined,
                    },
                  })
                }
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="puntos" id="puntos" />
                  <Label htmlFor="puntos" className="flex-1 cursor-pointer">
                    <div className="font-medium">Puntos</div>
                    <div className="text-sm text-gray-500">Otorgar puntos directamente</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="cupon" id="cupon" />
                  <Label htmlFor="cupon" className="flex-1 cursor-pointer">
                    <div className="font-medium">Cupón de Descuento</div>
                    <div className="text-sm text-gray-500">Crear cupón con porcentaje de descuento</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="promocion" id="promocion" />
                  <Label htmlFor="promocion" className="flex-1 cursor-pointer">
                    <div className="font-medium">Promoción Existente</div>
                    <div className="text-sm text-gray-500">Asociar a una promoción ya creada</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Valor según tipo */}
            {config.tipo === 'puntos' && (
              <div className="space-y-2">
                <Label htmlFor="puntos-valor">Cantidad de Puntos</Label>
                <Input
                  id="puntos-valor"
                  type="number"
                  min="1"
                  value={config.valor.puntos || 100}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      valor: { ...config.valor, puntos: parseInt(e.target.value) },
                    })
                  }
                  placeholder="100"
                />
              </div>
            )}

            {config.tipo === 'cupon' && (
              <div className="space-y-2">
                <Label htmlFor="descuento">Porcentaje de Descuento</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="descuento"
                    type="number"
                    min="1"
                    max="100"
                    value={config.valor.descuento_porcentaje || 10}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        valor: { ...config.valor, descuento_porcentaje: parseInt(e.target.value) },
                      })
                    }
                    placeholder="10"
                  />
                  <span className="text-gray-500">%</span>
                </div>
              </div>
            )}

            {config.tipo === 'promocion' && (
              <div className="space-y-2">
                <Label htmlFor="promocion-id">ID de la Promoción</Label>
                <Input
                  id="promocion-id"
                  value={config.valor.promocion_id || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      valor: { ...config.valor, promocion_id: e.target.value },
                    })
                  }
                  placeholder="ID de promoción existente"
                />
              </div>
            )}

            {/* Mensaje personalizado */}
            <div className="space-y-2">
              <Label htmlFor="mensaje">Mensaje Personalizado</Label>
              <Textarea
                id="mensaje"
                value={config.valor.mensaje_personalizado || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    valor: { ...config.valor, mensaje_personalizado: e.target.value },
                  })
                }
                placeholder="¡Bienvenido! Te regalamos puntos de bienvenida"
                rows={3}
              />
            </div>

            {/* Notificaciones */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Notificaciones</Label>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="email" className="font-medium">
                    Enviar Email
                  </Label>
                  <p className="text-sm text-gray-500">Notificar por correo electrónico</p>
                </div>
                <Switch
                  id="email"
                  checked={config.valor.enviar_email ?? true}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      valor: { ...config.valor, enviar_email: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="sms" className="font-medium">
                    Enviar SMS
                  </Label>
                  <p className="text-sm text-gray-500">Notificar por mensaje de texto</p>
                </div>
                <Switch
                  id="sms"
                  checked={config.valor.enviar_sms ?? false}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      valor: { ...config.valor, enviar_sms: checked },
                    })
                  }
                />
              </div>
            </div>

            {/* Botón guardar */}
            <div className="flex justify-end pt-4">
              <Button onClick={guardarConfiguracion} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Historial */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Regalos Otorgados</CardTitle>
            <CardDescription>Últimos 10 regalos entregados a clientes</CardDescription>
          </CardHeader>
          <CardContent>
            {historial.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Gift className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Aún no se han otorgado regalos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historial.map((regalo, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{regalo.cliente_nombre}</p>
                      <p className="text-sm text-gray-500">
                        Tipo: {regalo.tipo_regalo}
                        {regalo.tipo_regalo === 'puntos' && ` - ${regalo.valor_regalo?.puntos} puntos`}
                        {regalo.tipo_regalo === 'cupon' &&
                          ` - ${regalo.valor_regalo?.descuento_porcentaje}% descuento`}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(regalo.creado_en).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
