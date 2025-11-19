'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Brain, TrendingUp, Zap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface IAConfig {
  ia_modo: 'global' | 'propio';
  ia_limite_mensual?: number;
  ia_api_key_propia?: string;
  ia_api_key_configurada?: boolean;
  ia_api_key_preview?: string;
  ia_consumo_actual?: number;
}

interface IAStats {
  tienda: {
    id: string;
    nombre: string;
  };
  modo: 'global' | 'propio';
  limites?: {
    limite_mensual: number;
    consumo_actual: number;
    restantes: number;
    ultimo_reset: string;
  };
  estadisticas: {
    total_este_mes: number;
    total_historico: number;
    por_tipo: Record<string, number>;
    tokens_este_mes: number;
    costo_estimado_mes: number;
  };
}

interface Props {
  tiendaId: string;
}

export function IAConfigForm({ tiendaId }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<IAConfig>({
    ia_modo: 'global',
    ia_limite_mensual: 50,
  });
  const [stats, setStats] = useState<IAStats | null>(null);
  const [mostrarApiKey, setMostrarApiKey] = useState(false);
  const [nuevaApiKey, setNuevaApiKey] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [tiendaId]);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');

      // Cargar configuración
      const configRes = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}/ia`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data);
      }

      // Cargar estadísticas
      const statsRes = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}/ia/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error cargando datos IA:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarConfig = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('superadmin_token');

      const body: any = {
        ia_modo: config.ia_modo,
      };

      if (config.ia_modo === 'global') {
        body.ia_limite_mensual = config.ia_limite_mensual;
      } else if (nuevaApiKey) {
        body.ia_api_key_propia = nuevaApiKey;
      }

      const response = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}/ia`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({
          title: 'Configuración guardada',
          description: 'La configuración de IA se ha actualizado correctamente',
        });
        setNuevaApiKey('');
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

  const eliminarApiKey = async () => {
    if (!confirm('¿Estás seguro de eliminar la API key? La tienda volverá a modo global.')) {
      return;
    }

    try {
      const token = localStorage.getItem('superadmin_token');

      const response = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}/ia/api-key`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast({
          title: 'API Key eliminada',
          description: 'La tienda ahora usa el modo global',
        });
        cargarDatos();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la API key',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="animate-pulse">Cargando configuración de IA...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Configuración de IA
          </CardTitle>
          <CardDescription>Gestiona cómo esta tienda usa la IA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Modo de IA</Label>
            <Select
              value={config.ia_modo}
              onValueChange={(value: any) => setConfig({ ...config, ia_modo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global (Qronnect)</SelectItem>
                <SelectItem value="propio">Propio (API Key propia)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              {config.ia_modo === 'global'
                ? 'Usa la API key de Qronnect con límites mensuales'
                : 'Usa su propia API key de Gemini sin límites'}
            </p>
          </div>

          {config.ia_modo === 'global' && (
            <div className="space-y-2">
              <Label>Límite Mensual de Generaciones</Label>
              <Input
                type="number"
                min="0"
                value={config.ia_limite_mensual || 50}
                onChange={(e) =>
                  setConfig({ ...config, ia_limite_mensual: parseInt(e.target.value) })
                }
              />
              <p className="text-sm text-gray-500">
                Número máximo de generaciones de IA por mes
              </p>
            </div>
          )}

          {config.ia_modo === 'propio' && (
            <div className="space-y-4">
              {config.ia_api_key_configurada ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900">API Key configurada</p>
                      <p className="text-sm text-green-700 mt-1 font-mono">
                        {config.ia_api_key_preview}
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={eliminarApiKey}>
                      Eliminar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>API Key de Gemini</Label>
                  <Input
                    type={mostrarApiKey ? 'text' : 'password'}
                    value={nuevaApiKey}
                    onChange={(e) => setNuevaApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="mostrar-api"
                      checked={mostrarApiKey}
                      onChange={(e) => setMostrarApiKey(e.target.checked)}
                    />
                    <Label htmlFor="mostrar-api" className="text-sm cursor-pointer">
                      Mostrar API key
                    </Label>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={guardarConfig} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Uso de IA
            </CardTitle>
            <CardDescription>Estadísticas de consumo y métricas</CardDescription>
          </CardHeader>
          <CardContent>
            {config.ia_modo === 'global' && stats.limites ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">Consumo Actual</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.limites.consumo_actual}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">Límite Mensual</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.limites.limite_mensual}
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">Restantes</p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.limites.restantes}
                    </p>
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        Uso del mes
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {Math.round(
                          (stats.limites.consumo_actual / stats.limites.limite_mensual) * 100,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="flex h-2 mb-4 overflow-hidden rounded bg-blue-200">
                    <div
                      style={{
                        width: `${(stats.limites.consumo_actual / stats.limites.limite_mensual) * 100}%`,
                      }}
                      className="flex flex-col justify-center bg-blue-600 shadow-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <p className="font-medium text-purple-900">Modo Propio</p>
                </div>
                <p className="text-sm text-purple-700 mt-1">
                  Sin límites. La tienda paga directamente por el uso.
                </p>
              </div>
            )}

            {stats.estadisticas && (
              <div className="mt-6 space-y-4">
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Uso por Tipo</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.estadisticas.por_tipo || {}).map(([tipo, cantidad]) => (
                      <div key={tipo} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {tipo.replace('_', ' ')}
                        </span>
                        <span className="font-medium">{cantidad}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total este mes</p>
                      <p className="text-xl font-bold">{stats.estadisticas.total_este_mes}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total histórico</p>
                      <p className="text-xl font-bold">{stats.estadisticas.total_historico}</p>
                    </div>
                  </div>
                </div>

                {stats.estadisticas.tokens_este_mes > 0 && (
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tokens este mes</p>
                        <p className="text-lg font-bold">
                          {stats.estadisticas.tokens_este_mes.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Costo estimado</p>
                        <p className="text-lg font-bold">
                          ${stats.estadisticas.costo_estimado_mes.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
