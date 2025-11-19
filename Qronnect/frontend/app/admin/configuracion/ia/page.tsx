'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Brain, Sparkles, Target, MapPin, Tag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AdminNav } from '@/components/AdminNav';

interface ConfigIA {
  tipo_negocio: string;
  publico_objetivo?: {
    edad_min?: number;
    edad_max?: number;
    generos?: string[];
    intereses?: string[];
  };
  valores_marca?: string[];
  tono_comunicacion?: 'formal' | 'casual' | 'juvenil' | 'motivador' | 'elegante';
  productos_principales?: string[];
  rango_precios?: 'economico' | 'medio' | 'premium' | 'lujo';
  ubicacion?: {
    barrio?: string;
    ciudad?: string;
    referencias_locales?: boolean;
  };
  promociones_recurrentes?: string[];
  slogan?: string;
  hashtags?: string[];
}

export default function ConfiguracionIAPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ConfigIA>({
    tipo_negocio: '',
    publico_objetivo: {
      generos: [],
      intereses: [],
    },
    valores_marca: [],
    productos_principales: [],
    promociones_recurrentes: [],
    hashtags: [],
    ubicacion: {},
  });

  const [nuevoInteres, setNuevoInteres] = useState('');
  const [nuevoValor, setNuevoValor] = useState('');
  const [nuevoProducto, setNuevoProducto] = useState('');
  const [nuevaPromocion, setNuevaPromocion] = useState('');
  const [nuevoHashtag, setNuevoHashtag] = useState('');

  useEffect(() => {
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const tenant = localStorage.getItem('tenant_domain');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${API_URL}/api/tiendas/config/ia`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': tenant || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setConfig(data);
        }
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarConfig = async () => {
    if (!config.tipo_negocio) {
      toast({
        title: 'Error',
        description: 'El tipo de negocio es requerido',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const tenant = localStorage.getItem('tenant_domain');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const response = await fetch(`${API_URL}/api/tiendas/config/ia`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': tenant || '',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast({
          title: 'Configuración guardada',
          description: 'La configuración de IA se ha actualizado correctamente',
        });
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

  const agregarItem = (
    campo: keyof ConfigIA,
    valor: string,
    setter: (v: string) => void,
    subcampo?: string,
  ) => {
    if (!valor.trim()) return;

    if (subcampo && typeof config[campo] === 'object') {
      setConfig({
        ...config,
        [campo]: {
          ...config[campo],
          [subcampo]: [...((config[campo] as any)?.[subcampo] || []), valor.trim()],
        },
      });
    } else if (Array.isArray(config[campo])) {
      setConfig({
        ...config,
        [campo]: [...(config[campo] as string[]), valor.trim()],
      });
    }

    setter('');
  };

  const eliminarItem = (campo: keyof ConfigIA, index: number, subcampo?: string) => {
    if (subcampo && typeof config[campo] === 'object') {
      const array = (config[campo] as any)?.[subcampo] || [];
      setConfig({
        ...config,
        [campo]: {
          ...config[campo],
          [subcampo]: array.filter((_: any, i: number) => i !== index),
        },
      });
    } else if (Array.isArray(config[campo])) {
      setConfig({
        ...config,
        [campo]: (config[campo] as string[]).filter((_, i) => i !== index),
      });
    }
  };

  if (loading) {
    return (
      <>
        <AdminNav />
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
      <AdminNav />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Configuración de IA
          </h1>
          <p className="text-gray-600 mt-2">
            Configura el contexto de tu negocio para que la IA genere contenido personalizado
          </p>
        </div>

      <div className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Información Básica
            </CardTitle>
            <CardDescription>Datos fundamentales de tu negocio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Negocio *</Label>
                <Input
                  id="tipo"
                  value={config.tipo_negocio}
                  onChange={(e) => setConfig({ ...config, tipo_negocio: e.target.value })}
                  placeholder="Ej: gimnasio, restaurante, salón de belleza"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tono">Tono de Comunicación</Label>
                <Select
                  value={config.tono_comunicacion}
                  onValueChange={(value: any) =>
                    setConfig({ ...config, tono_comunicacion: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tono" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="juvenil">Juvenil</SelectItem>
                    <SelectItem value="motivador">Motivador</SelectItem>
                    <SelectItem value="elegante">Elegante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slogan">Slogan</Label>
              <Input
                id="slogan"
                value={config.slogan}
                onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                placeholder="Tu mejor versión comienza aquí"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rango">Rango de Precios</Label>
              <Select
                value={config.rango_precios}
                onValueChange={(value: any) => setConfig({ ...config, rango_precios: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rango" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economico">Económico</SelectItem>
                  <SelectItem value="medio">Medio</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="lujo">Lujo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Público Objetivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Público Objetivo
            </CardTitle>
            <CardDescription>Define a quién te diriges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Edad Mínima</Label>
                <Input
                  type="number"
                  value={config.publico_objetivo?.edad_min || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      publico_objetivo: {
                        ...config.publico_objetivo,
                        edad_min: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  placeholder="25"
                />
              </div>

              <div className="space-y-2">
                <Label>Edad Máxima</Label>
                <Input
                  type="number"
                  value={config.publico_objetivo?.edad_max || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      publico_objetivo: {
                        ...config.publico_objetivo,
                        edad_max: parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                  placeholder="45"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Intereses</Label>
              <div className="flex gap-2">
                <Input
                  value={nuevoInteres}
                  onChange={(e) => setNuevoInteres(e.target.value)}
                  placeholder="Ej: fitness, salud, bienestar"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      agregarItem('publico_objetivo', nuevoInteres, setNuevoInteres, 'intereses');
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() =>
                    agregarItem('publico_objetivo', nuevoInteres, setNuevoInteres, 'intereses')
                  }
                >
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {config.publico_objetivo?.intereses?.map((interes, idx) => (
                  <Badge key={idx} variant="secondary">
                    {interes}
                    <button
                      onClick={() => eliminarItem('publico_objetivo', idx, 'intereses')}
                      className="ml-2 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marca */}
        <Card>
          <CardHeader>
            <CardTitle>Valores de Marca</CardTitle>
            <CardDescription>Qué representa tu negocio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={nuevoValor}
                  onChange={(e) => setNuevoValor(e.target.value)}
                  placeholder="Ej: motivación, comunidad, resultados"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      agregarItem('valores_marca', nuevoValor, setNuevoValor);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => agregarItem('valores_marca', nuevoValor, setNuevoValor)}
                >
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {config.valores_marca?.map((valor, idx) => (
                  <Badge key={idx} variant="default">
                    {valor}
                    <button
                      onClick={() => eliminarItem('valores_marca', idx)}
                      className="ml-2 hover:text-red-200"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productos/Servicios */}
        <Card>
          <CardHeader>
            <CardTitle>Productos/Servicios Principales</CardTitle>
            <CardDescription>Qué ofreces a tus clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={nuevoProducto}
                  onChange={(e) => setNuevoProducto(e.target.value)}
                  placeholder="Ej: Clases de CrossFit, Entrenamiento personal"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      agregarItem('productos_principales', nuevoProducto, setNuevoProducto);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() =>
                    agregarItem('productos_principales', nuevoProducto, setNuevoProducto)
                  }
                >
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {config.productos_principales?.map((producto, idx) => (
                  <Badge key={idx} variant="outline">
                    {producto}
                    <button
                      onClick={() => eliminarItem('productos_principales', idx)}
                      className="ml-2 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
            <CardDescription>Información geográfica para personalizar contenido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Barrio/Zona</Label>
                <Input
                  value={config.ubicacion?.barrio || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      ubicacion: { ...config.ubicacion, barrio: e.target.value },
                    })
                  }
                  placeholder="Chamberí"
                />
              </div>

              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input
                  value={config.ubicacion?.ciudad || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      ubicacion: { ...config.ubicacion, ciudad: e.target.value },
                    })
                  }
                  placeholder="Madrid"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promociones y Hashtags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Promociones y Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Promociones Recurrentes</Label>
              <div className="flex gap-2">
                <Input
                  value={nuevaPromocion}
                  onChange={(e) => setNuevaPromocion(e.target.value)}
                  placeholder="Ej: Black Friday - Noviembre"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      agregarItem('promociones_recurrentes', nuevaPromocion, setNuevaPromocion);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() =>
                    agregarItem('promociones_recurrentes', nuevaPromocion, setNuevaPromocion)
                  }
                >
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {config.promociones_recurrentes?.map((promo, idx) => (
                  <Badge key={idx} variant="secondary">
                    {promo}
                    <button
                      onClick={() => eliminarItem('promociones_recurrentes', idx)}
                      className="ml-2 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hashtags</Label>
              <div className="flex gap-2">
                <Input
                  value={nuevoHashtag}
                  onChange={(e) => setNuevoHashtag(e.target.value)}
                  placeholder="Ej: #GymFitMadrid"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const hashtagValue = nuevoHashtag.startsWith('#')
                        ? nuevoHashtag
                        : `#${nuevoHashtag}`;
                      setNuevoHashtag(hashtagValue);
                      agregarItem('hashtags', hashtagValue, setNuevoHashtag);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    const hashtagValue = nuevoHashtag.startsWith('#')
                      ? nuevoHashtag
                      : `#${nuevoHashtag}`;
                    agregarItem('hashtags', hashtagValue, setNuevoHashtag);
                  }}
                >
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {config.hashtags?.map((hashtag, idx) => (
                  <Badge key={idx} variant="outline" className="bg-blue-50">
                    {hashtag}
                    <button
                      onClick={() => eliminarItem('hashtags', idx)}
                      className="ml-2 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón guardar */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Cancelar
          </Button>
          <Button onClick={guardarConfig} disabled={saving} size="lg">
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}
