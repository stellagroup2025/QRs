'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Store, Clock, Phone, Globe, MapPin, Share2, Save, Star } from 'lucide-react';


interface HorarioDia {
  abierto: boolean;
  apertura: string;
  cierre: string;
}

interface Horarios {
  lunes: HorarioDia;
  martes: HorarioDia;
  miercoles: HorarioDia;
  jueves: HorarioDia;
  viernes: HorarioDia;
  sabado: HorarioDia;
  domingo: HorarioDia;
}

interface RedesSociales {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
}

interface InfoTienda {
  descripcion?: string;
  sitio_web?: string;
  whatsapp?: string;
  ubicacion_maps?: string;
  google_reviews_url?: string;
  horarios?: Horarios;
  redes_sociales?: RedesSociales;
}

const diasSemana = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

export default function ConfiguracionTiendaPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<InfoTienda>({
    descripcion: '',
    sitio_web: '',
    whatsapp: '',
    ubicacion_maps: '',
    google_reviews_url: '',
    horarios: {
      lunes: { abierto: true, apertura: '09:00', cierre: '20:00' },
      martes: { abierto: true, apertura: '09:00', cierre: '20:00' },
      miercoles: { abierto: true, apertura: '09:00', cierre: '20:00' },
      jueves: { abierto: true, apertura: '09:00', cierre: '20:00' },
      viernes: { abierto: true, apertura: '09:00', cierre: '20:00' },
      sabado: { abierto: true, apertura: '10:00', cierre: '14:00' },
      domingo: { abierto: false, apertura: '', cierre: '' },
    },
    redes_sociales: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      tiktok: '',
    },
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const tenant = localStorage.getItem('tenant_domain');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const res = await fetch(`${API_URL}/api/tiendas/info`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': tenant || '',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setInfo({
          descripcion: data.descripcion || '',
          sitio_web: data.sitio_web || '',
          whatsapp: data.whatsapp || '',
          ubicacion_maps: data.ubicacion_maps || '',
          google_reviews_url: data.google_reviews_url || '',
          horarios: data.horarios || info.horarios,
          redes_sociales: data.redes_sociales || info.redes_sociales,
        });
      }
    } catch (error) {
      console.error('Error cargando información:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información de la tienda',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const tenant = localStorage.getItem('tenant_domain');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const res = await fetch(`${API_URL}/api/tiendas/config/info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': tenant || '',
        },
        body: JSON.stringify(info),
      });

      if (res.ok) {
        toast({
          title: 'Guardado',
          description: 'La información de tu tienda se ha actualizado correctamente',
        });
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la información',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const actualizarHorario = (dia: string, campo: string, valor: any) => {
    setInfo((prev) => ({
      ...prev,
      horarios: {
        ...prev.horarios!,
        [dia]: {
          ...prev.horarios![dia as keyof Horarios],
          [campo]: valor,
        },
      },
    }));
  };

  const actualizarRedSocial = (red: string, valor: string) => {
    setInfo((prev) => ({
      ...prev,
      redes_sociales: {
        ...prev.redes_sociales!,
        [red]: valor,
      },
    }));
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
              <Store className="h-8 w-8" />
              Información de la Tienda
            </h1>
            <p className="text-muted-foreground mt-1">
              Configura la información que verán tus clientes
            </p>
          </div>
          <Button onClick={handleGuardar} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>

        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Información General
            </CardTitle>
            <CardDescription>
              Descripción y datos básicos de tu negocio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Tu tienda de confianza desde 1990"
                value={info.descripcion}
                onChange={(e) => setInfo({ ...info, descripcion: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contacto
            </CardTitle>
            <CardDescription>
              Métodos de contacto directo con tus clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+34600000000"
                value={info.whatsapp}
                onChange={(e) => setInfo({ ...info, whatsapp: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Incluye el código de país (ej: +34 para España)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Web y Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Web y Ubicación
            </CardTitle>
            <CardDescription>
              Sitio web y ubicación física
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sitio_web">Sitio Web</Label>
              <Input
                id="sitio_web"
                type="url"
                placeholder="https://www.mitienda.com"
                value={info.sitio_web}
                onChange={(e) => setInfo({ ...info, sitio_web: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ubicacion_maps">Google Maps</Label>
              <Input
                id="ubicacion_maps"
                type="url"
                placeholder="https://maps.google.com/?q=..."
                value={info.ubicacion_maps}
                onChange={(e) => setInfo({ ...info, ubicacion_maps: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                URL de tu ubicación en Google Maps
              </p>
            </div>
            <div>
              <Label htmlFor="google_reviews_url" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Google Reviews
              </Label>
              <Input
                id="google_reviews_url"
                type="url"
                placeholder="https://g.page/r/XXXXXXXXXX/review"
                value={info.google_reviews_url}
                onChange={(e) => setInfo({ ...info, google_reviews_url: e.target.value })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                URL para que los clientes dejen reseñas en Google (se incluirá en el email post-compra)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Horarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horarios de Apertura
            </CardTitle>
            <CardDescription>
              Configura tus horarios para cada día de la semana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {diasSemana.map((dia) => {
              const horario = info.horarios?.[dia.key as keyof Horarios];
              return (
                <div key={dia.key} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-32">
                    <p className="font-medium">{dia.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={horario?.abierto}
                      onCheckedChange={(checked) =>
                        actualizarHorario(dia.key, 'abierto', checked)
                      }
                    />
                    <Label className="text-sm">
                      {horario?.abierto ? 'Abierto' : 'Cerrado'}
                    </Label>
                  </div>
                  {horario?.abierto && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`${dia.key}-apertura`} className="text-sm w-16">
                          Apertura:
                        </Label>
                        <Input
                          id={`${dia.key}-apertura`}
                          type="time"
                          value={horario.apertura}
                          onChange={(e) =>
                            actualizarHorario(dia.key, 'apertura', e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`${dia.key}-cierre`} className="text-sm w-16">
                          Cierre:
                        </Label>
                        <Input
                          id={`${dia.key}-cierre`}
                          type="time"
                          value={horario.cierre}
                          onChange={(e) =>
                            actualizarHorario(dia.key, 'cierre', e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Redes Sociales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Redes Sociales
            </CardTitle>
            <CardDescription>
              Enlaces a tus perfiles en redes sociales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                type="url"
                placeholder="https://facebook.com/mitienda"
                value={info.redes_sociales?.facebook}
                onChange={(e) => actualizarRedSocial('facebook', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                type="url"
                placeholder="https://instagram.com/mitienda"
                value={info.redes_sociales?.instagram}
                onChange={(e) => actualizarRedSocial('instagram', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input
                id="twitter"
                type="url"
                placeholder="https://twitter.com/mitienda"
                value={info.redes_sociales?.twitter}
                onChange={(e) => actualizarRedSocial('twitter', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                type="url"
                placeholder="https://tiktok.com/@mitienda"
                value={info.redes_sociales?.tiktok}
                onChange={(e) => actualizarRedSocial('tiktok', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/company/mitienda"
                value={info.redes_sociales?.linkedin}
                onChange={(e) => actualizarRedSocial('linkedin', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

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
