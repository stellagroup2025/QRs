'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast, Toaster } from 'sonner';
import { FileText, Send, Settings, Calendar, Mail, Download, RefreshCw } from 'lucide-react';

interface Tienda {
  id: string;
  nombre: string;
  email: string;
  plan: string;
}

interface Informe {
  id: string;
  periodo_mes: number;
  periodo_anio: number;
  estado: string;
  fecha_generacion: string;
  fecha_envio?: string;
  enviado_a?: string;
}

interface ConfiguracionInforme {
  automatico: boolean;
  email_destino: string;
  dia_envio: number;
  hora_envio: number;
  incluir_pdf: boolean;
  incluir_analisis_ia: boolean;
  incluir_comparativa: boolean;
  incluir_plan_accion: boolean;
}

export default function InformesPage() {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<string>('');
  const [informes, setInformes] = useState<Informe[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionInforme | null>(null);
  const [loading, setLoading] = useState(false);

  // Estado para envío manual
  const [emailDestino, setEmailDestino] = useState('');
  const [mesSeleccionado, setMesSeleccionado] = useState<number>(new Date().getMonth() || 12);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    cargarTiendas();
  }, []);

  useEffect(() => {
    if (tiendaSeleccionada) {
      cargarInformes();
      cargarConfiguracion();
    }
  }, [tiendaSeleccionada]);

  const cargarTiendas = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      console.log('[Informes] Cargando tiendas desde:', `${apiUrl}/superadmin/tiendas`);
      console.log('[Informes] Token presente:', !!token);

      const response = await fetch(`${apiUrl}/superadmin/tiendas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('[Informes] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[Informes] Tiendas cargadas:', data.length);
        setTiendas(data);
      } else {
        const errorText = await response.text();
        console.error('[Informes] Error response:', errorText);
        toast.error(`Error al cargar tiendas: ${response.status}`);
      }
    } catch (error) {
      console.error('[Informes] Error cargando tiendas:', error);
      toast.error('Error al cargar tiendas');
    }
  };

  const cargarInformes = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/tiendas/${tiendaSeleccionada}/informes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInformes(data);
      }
    } catch (error) {
      console.error('Error cargando informes:', error);
    }
  };

  const cargarConfiguracion = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/tiendas/${tiendaSeleccionada}/informes/configuracion`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConfiguracion(data);
        if (data?.email_destino) {
          setEmailDestino(data.email_destino);
        }
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const generarInforme = async () => {
    if (!tiendaSeleccionada) {
      toast.error('Selecciona una tienda');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/tiendas/${tiendaSeleccionada}/informes/generar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            periodo_mes: mesSeleccionado,
            periodo_anio: anioSeleccionado,
          }),
        }
      );

      if (response.ok) {
        toast.success('Informe generado correctamente');
        cargarInformes();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al generar informe');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar informe');
    } finally {
      setLoading(false);
    }
  };

  const enviarInforme = async () => {
    if (!tiendaSeleccionada || !emailDestino) {
      toast.error('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/tiendas/${tiendaSeleccionada}/informes/enviar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email_destino: emailDestino,
            periodo_mes: mesSeleccionado,
            periodo_anio: anioSeleccionado,
          }),
        }
      );

      if (response.ok) {
        toast.success(`Informe enviado a ${emailDestino}`);
        cargarInformes();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al enviar informe');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar informe');
    } finally {
      setLoading(false);
    }
  };

  const guardarConfiguracion = async () => {
    if (!tiendaSeleccionada || !configuracion) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/tiendas/${tiendaSeleccionada}/informes/configuracion`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(configuracion),
        }
      );

      if (response.ok) {
        toast.success('Configuración guardada correctamente');
        cargarConfiguracion();
      } else {
        toast.error('Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  const getNombreMes = (mes: number) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1];
  };

  const getEstadoBadge = (estado: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      generado: 'secondary',
      enviado: 'default',
      error: 'destructive',
    };
    return <Badge variant={variants[estado] || 'outline'}>{estado.toUpperCase()}</Badge>;
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Informes Mensuales</h1>
          <p className="text-muted-foreground">
            Genera y envía informes mensuales con análisis de IA a tus tiendas
          </p>
        </div>

      {/* Selector de Tienda */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seleccionar Tienda</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={tiendaSeleccionada} onValueChange={setTiendaSeleccionada}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una tienda..." />
            </SelectTrigger>
            <SelectContent>
              {tiendas.map((tienda) => (
                <SelectItem key={tienda.id} value={tienda.id}>
                  {tienda.nombre} ({tienda.plan})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {tiendaSeleccionada && (
        <Tabs defaultValue="manual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">
              <Send className="h-4 w-4 mr-2" />
              Envío Manual
            </TabsTrigger>
            <TabsTrigger value="historial">
              <FileText className="h-4 w-4 mr-2" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="configuracion">
              <Settings className="h-4 w-4 mr-2" />
              Configuración Automática
            </TabsTrigger>
          </TabsList>

          {/* TAB: Envío Manual */}
          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Informe Manual</CardTitle>
                <CardDescription>
                  Genera y envía un informe del mes seleccionado por email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mes</Label>
                    <Select
                      value={mesSeleccionado.toString()}
                      onValueChange={(v) => setMesSeleccionado(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                          <SelectItem key={mes} value={mes.toString()}>
                            {getNombreMes(mes)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Año</Label>
                    <Select
                      value={anioSeleccionado.toString()}
                      onValueChange={(v) => setAnioSeleccionado(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i).map((anio) => (
                          <SelectItem key={anio} value={anio.toString()}>
                            {anio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Destino</Label>
                  <Input
                    type="email"
                    placeholder="admin@tienda.com"
                    value={emailDestino}
                    onChange={(e) => setEmailDestino(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={generarInforme} disabled={loading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Generar Informe
                  </Button>

                  <Button onClick={enviarInforme} disabled={loading || !emailDestino}>
                    <Send className="h-4 w-4 mr-2" />
                    Generar y Enviar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Historial */}
          <TabsContent value="historial">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Informes</CardTitle>
                <CardDescription>Últimos 12 informes generados</CardDescription>
              </CardHeader>
              <CardContent>
                {informes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay informes generados para esta tienda
                  </p>
                ) : (
                  <div className="space-y-2">
                    {informes.map((informe) => (
                      <div
                        key={informe.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                      >
                        <div className="flex items-center gap-4">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {getNombreMes(informe.periodo_mes)} {informe.periodo_anio}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Generado: {new Date(informe.fecha_generacion).toLocaleDateString('es-ES')}
                            </p>
                            {informe.enviado_a && (
                              <p className="text-sm text-muted-foreground">
                                Enviado a: {informe.enviado_a}
                              </p>
                            )}
                          </div>
                        </div>
                        {getEstadoBadge(informe.estado)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Configuración Automática */}
          <TabsContent value="configuracion">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Envío Automático</CardTitle>
                <CardDescription>
                  Programa el envío automático de informes mensuales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {configuracion && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Envío Automático</Label>
                        <p className="text-sm text-muted-foreground">
                          Activar envío automático mensual
                        </p>
                      </div>
                      <Switch
                        checked={configuracion.automatico}
                        onCheckedChange={(checked) =>
                          setConfiguracion({ ...configuracion, automatico: checked })
                        }
                      />
                    </div>

                    {configuracion.automatico && (
                      <>
                        <div className="space-y-2">
                          <Label>Email Destino</Label>
                          <Input
                            type="email"
                            value={configuracion.email_destino || ''}
                            onChange={(e) =>
                              setConfiguracion({ ...configuracion, email_destino: e.target.value })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Día del Mes (1-28)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="28"
                              value={configuracion.dia_envio}
                              onChange={(e) =>
                                setConfiguracion({
                                  ...configuracion,
                                  dia_envio: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Hora del Día (0-23)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="23"
                              value={configuracion.hora_envio}
                              onChange={(e) =>
                                setConfiguracion({
                                  ...configuracion,
                                  hora_envio: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-4 border-t pt-4">
                          <Label>Contenido del Informe</Label>

                          <div className="flex items-center justify-between">
                            <Label className="font-normal">Incluir análisis con IA</Label>
                            <Switch
                              checked={configuracion.incluir_analisis_ia}
                              onCheckedChange={(checked) =>
                                setConfiguracion({ ...configuracion, incluir_analisis_ia: checked })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label className="font-normal">Incluir comparativa con meses anteriores</Label>
                            <Switch
                              checked={configuracion.incluir_comparativa}
                              onCheckedChange={(checked) =>
                                setConfiguracion({ ...configuracion, incluir_comparativa: checked })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label className="font-normal">Incluir plan de acción</Label>
                            <Switch
                              checked={configuracion.incluir_plan_accion}
                              onCheckedChange={(checked) =>
                                setConfiguracion({ ...configuracion, incluir_plan_accion: checked })
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <Button onClick={guardarConfiguracion} disabled={loading}>
                      Guardar Configuración
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      </div>
    </>
  );
}
