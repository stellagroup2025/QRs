'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Users, TrendingUp, Award, Plus, Trash2, Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminNav } from '@/components/AdminNav';

interface Recompensa {
  tipo: 'puntos' | 'cupon';
  valor: number;
}

interface Milestone {
  objetivo: number;
  tipo: 'puntos' | 'cupon';
  valor: number;
  descripcion: string;
}

interface ProgramaReferidos {
  id?: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  recompensas: {
    por_registro: {
      referidor: Recompensa;
      referido: Recompensa;
    };
    por_primera_compra?: {
      referidor: Recompensa;
      referido: Recompensa;
    };
  };
  milestones: Milestone[];
}

interface Estadisticas {
  total_referidos: number;
  este_mes: number;
  top_referidores: Array<{
    cliente: string;
    codigo: string;
    total_referidos: number;
    puntos_ganados: number;
  }>;
  conversion_rate: number;
  recompensas_otorgadas: number;
}

export default function ReferidosPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [programa, setPrograma] = useState<ProgramaReferidos>({
    nombre: 'Trae un amigo',
    descripcion: 'Invita a tus amigos y gana recompensas',
    activo: false,
    recompensas: {
      por_registro: {
        referidor: { tipo: 'puntos', valor: 50 },
        referido: { tipo: 'puntos', valor: 30 },
      },
      por_primera_compra: {
        referidor: { tipo: 'puntos', valor: 100 },
        referido: { tipo: 'cupon', valor: 10 },
      },
    },
    milestones: [],
  });
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total_referidos: 0,
    este_mes: 0,
    top_referidores: [],
    conversion_rate: 0,
    recompensas_otorgadas: 0,
  });
  const [referidos, setReferidos] = useState<any[]>([]);
  const [dialogMilestone, setDialogMilestone] = useState(false);
  const [nuevoMilestone, setNuevoMilestone] = useState<Milestone>({
    objetivo: 5,
    tipo: 'puntos',
    valor: 500,
    descripcion: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const tenant = localStorage.getItem('tenant_domain');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      // Cargar programa
      const programaRes = await fetch(`${API_URL}/api/referidos/programa`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': tenant || '',
        },
      });

      if (programaRes.ok) {
        const data = await programaRes.json();
        if (data.nombre) {
          setPrograma(data);
        }
      }

      // Cargar estadísticas
      const statsRes = await fetch(`${API_URL}/api/referidos/estadisticas`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': tenant || '',
        },
      });

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setEstadisticas(stats);
      }

      // Cargar lista de referidos
      const referidosRes = await fetch(`${API_URL}/api/referidos/lista?limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': tenant || '',
        },
      });

      if (referidosRes.ok) {
        const data = await referidosRes.json();
        setReferidos(data.referidos || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarPrograma = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const tenant = localStorage.getItem('tenant_domain');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const url = programa.id
        ? `${API_URL}/api/referidos/programa/${programa.id}`
        : `${API_URL}/api/referidos/programa`;

      const method = programa.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': tenant || '',
        },
        body: JSON.stringify(programa),
      });

      if (response.ok) {
        toast({
          title: 'Programa guardado',
          description: 'El programa de referidos se ha actualizado correctamente',
        });
        cargarDatos();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'No se pudo guardar el programa',
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

  const agregarMilestone = () => {
    if (!nuevoMilestone.descripcion) {
      toast({
        title: 'Error',
        description: 'La descripción es requerida',
        variant: 'destructive',
      });
      return;
    }

    setPrograma({
      ...programa,
      milestones: [...programa.milestones, nuevoMilestone],
    });

    setNuevoMilestone({
      objetivo: 5,
      tipo: 'puntos',
      valor: 500,
      descripcion: '',
    });

    setDialogMilestone(false);
  };

  const eliminarMilestone = (index: number) => {
    setPrograma({
      ...programa,
      milestones: programa.milestones.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Referidos</h1>
          <p className="text-gray-600 mt-2">Gestiona el programa de referidos de tu tienda</p>
        </div>

      <Tabs defaultValue="configuracion" className="space-y-6">
        <TabsList>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          <TabsTrigger value="referidos">Referidos</TabsTrigger>
        </TabsList>

        {/* TAB: Configuración */}
        <TabsContent value="configuracion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Programa</CardTitle>
              <CardDescription>Configura los detalles básicos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="activo" className="text-base font-medium">
                    Programa Activo
                  </Label>
                  <p className="text-sm text-gray-500">Habilitar sistema de referidos</p>
                </div>
                <Switch
                  id="activo"
                  checked={programa.activo}
                  onCheckedChange={(checked) => setPrograma({ ...programa, activo: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Programa</Label>
                <Input
                  id="nombre"
                  value={programa.nombre}
                  onChange={(e) => setPrograma({ ...programa, nombre: e.target.value })}
                  placeholder="Trae un amigo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={programa.descripcion}
                  onChange={(e) => setPrograma({ ...programa, descripcion: e.target.value })}
                  placeholder="Invita a tus amigos y gana recompensas"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recompensas por Registro</CardTitle>
              <CardDescription>Cuando un amigo se registra</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referidor */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Para quien refiere</h4>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={programa.recompensas.por_registro.referidor.tipo}
                      onValueChange={(value: any) =>
                        setPrograma({
                          ...programa,
                          recompensas: {
                            ...programa.recompensas,
                            por_registro: {
                              ...programa.recompensas.por_registro,
                              referidor: {
                                ...programa.recompensas.por_registro.referidor,
                                tipo: value,
                              },
                            },
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="puntos">Puntos</SelectItem>
                        <SelectItem value="cupon">Cupón (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      value={programa.recompensas.por_registro.referidor.valor}
                      onChange={(e) =>
                        setPrograma({
                          ...programa,
                          recompensas: {
                            ...programa.recompensas,
                            por_registro: {
                              ...programa.recompensas.por_registro,
                              referidor: {
                                ...programa.recompensas.por_registro.referidor,
                                valor: parseInt(e.target.value),
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>

                {/* Referido */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Para el nuevo cliente</h4>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={programa.recompensas.por_registro.referido.tipo}
                      onValueChange={(value: any) =>
                        setPrograma({
                          ...programa,
                          recompensas: {
                            ...programa.recompensas,
                            por_registro: {
                              ...programa.recompensas.por_registro,
                              referido: {
                                ...programa.recompensas.por_registro.referido,
                                tipo: value,
                              },
                            },
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="puntos">Puntos</SelectItem>
                        <SelectItem value="cupon">Cupón (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      value={programa.recompensas.por_registro.referido.valor}
                      onChange={(e) =>
                        setPrograma({
                          ...programa,
                          recompensas: {
                            ...programa.recompensas,
                            por_registro: {
                              ...programa.recompensas.por_registro,
                              referido: {
                                ...programa.recompensas.por_registro.referido,
                                valor: parseInt(e.target.value),
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Milestones (Objetivos)</CardTitle>
                <CardDescription>Recompensas especiales por alcanzar objetivos</CardDescription>
              </div>
              <Dialog open={dialogMilestone} onOpenChange={setDialogMilestone}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nuevo Milestone</DialogTitle>
                    <DialogDescription>Agregar objetivo de referidos</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Objetivo (cantidad de referidos)</Label>
                      <Input
                        type="number"
                        value={nuevoMilestone.objetivo}
                        onChange={(e) =>
                          setNuevoMilestone({
                            ...nuevoMilestone,
                            objetivo: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de recompensa</Label>
                      <Select
                        value={nuevoMilestone.tipo}
                        onValueChange={(value: any) =>
                          setNuevoMilestone({ ...nuevoMilestone, tipo: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="puntos">Puntos</SelectItem>
                          <SelectItem value="cupon">Cupón (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        value={nuevoMilestone.valor}
                        onChange={(e) =>
                          setNuevoMilestone({
                            ...nuevoMilestone,
                            valor: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Input
                        value={nuevoMilestone.descripcion}
                        onChange={(e) =>
                          setNuevoMilestone({ ...nuevoMilestone, descripcion: e.target.value })
                        }
                        placeholder="Ej: 500 puntos por 5 referidos"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setDialogMilestone(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={agregarMilestone}>Agregar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {programa.milestones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No hay milestones configurados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {programa.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{milestone.descripcion}</p>
                        <p className="text-sm text-gray-500">
                          {milestone.objetivo} referidos → {milestone.valor}{' '}
                          {milestone.tipo === 'puntos' ? 'puntos' : '% descuento'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarMilestone(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={guardarPrograma} disabled={saving} size="lg">
              {saving ? 'Guardando...' : 'Guardar Programa'}
            </Button>
          </div>
        </TabsContent>

        {/* TAB: Estadísticas */}
        <TabsContent value="estadisticas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Referidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.total_referidos}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.este_mes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(estadisticas.conversion_rate * 100).toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recompensas Otorgadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadisticas.recompensas_otorgadas}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Referidores</CardTitle>
              <CardDescription>Clientes con más referidos</CardDescription>
            </CardHeader>
            <CardContent>
              {estadisticas.top_referidores.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Aún no hay referidores</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {estadisticas.top_referidores.map((ref, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">{ref.cliente}</p>
                          <p className="text-sm text-gray-500">Código: {ref.codigo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{ref.total_referidos} referidos</p>
                        <p className="text-sm text-gray-500">{ref.puntos_ganados} puntos ganados</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Referidos */}
        <TabsContent value="referidos">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Referidos</CardTitle>
              <CardDescription>Todos los referidos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              {referidos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No hay referidos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referidos.map((ref, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{ref.referido_nombre}</p>
                        <p className="text-sm text-gray-500">
                          Referido por: {ref.referidor_nombre} ({ref.codigo_usado})
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{new Date(ref.fecha_registro).toLocaleDateString()}</p>
                        <p className="text-xs">
                          {ref.primera_compra ? '✓ Primera compra' : 'Sin compra'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}
