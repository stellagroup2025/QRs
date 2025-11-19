'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  Clock,
  Phone,
  Mail,
  Globe,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  Linkedin
} from 'lucide-react';
import { useBrandingContext } from './BrandingProvider';
import { hexToRgb } from '@/lib/brand-colors';

interface HorarioDia {
  abierto: boolean;
  apertura: string | null;
  cierre: string | null;
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
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  tiktok?: string | null;
}

interface TiendaInfo {
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  sitio_web?: string;
  whatsapp?: string;
  ubicacion_maps?: string;
  horarios?: Horarios;
  redes_sociales?: RedesSociales;
  esta_abierta?: boolean | null;
}

interface TiendaInfoCardProps {
  slug: string;
}

const diasSemana: { [key: string]: string } = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

export function TiendaInfoCard({ slug }: TiendaInfoCardProps) {
  const { branding } = useBrandingContext();
  const [tiendaInfo, setTiendaInfo] = useState<TiendaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarInfoTienda();
  }, [slug]);

  const cargarInfoTienda = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const res = await fetch(`${API_URL}/api/clientes/tienda-info`, {
        headers: {
          'X-Tenant-Domain': slug,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTiendaInfo(data);
      }
    } catch (error) {
      console.error('Error cargando información de tienda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneClick = () => {
    if (tiendaInfo?.telefono) {
      window.location.href = `tel:${tiendaInfo.telefono}`;
    }
  };

  const handleWhatsAppClick = () => {
    if (tiendaInfo?.whatsapp) {
      const numero = tiendaInfo.whatsapp.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${numero}`, '_blank');
    }
  };

  const handleEmailClick = () => {
    if (tiendaInfo?.email) {
      window.location.href = `mailto:${tiendaInfo.email}`;
    }
  };

  const handleWebClick = () => {
    if (tiendaInfo?.sitio_web) {
      window.open(tiendaInfo.sitio_web, '_blank');
    }
  };

  const handleMapClick = () => {
    if (tiendaInfo?.ubicacion_maps) {
      window.open(tiendaInfo.ubicacion_maps, '_blank');
    }
  };

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Cargando información...</p>
        </CardContent>
      </Card>
    );
  }

  if (!tiendaInfo) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6" style={{ color: hexToRgb(branding.color_primario) }} />
            <CardTitle>{tiendaInfo.nombre}</CardTitle>
          </div>
          {tiendaInfo.esta_abierta !== null && (
            <Badge
              variant={tiendaInfo.esta_abierta ? 'default' : 'secondary'}
              style={{
                backgroundColor: tiendaInfo.esta_abierta
                  ? hexToRgb(branding.color_primario)
                  : '#6b7280',
                color: 'white',
              }}
            >
              {tiendaInfo.esta_abierta ? 'Abierto' : 'Cerrado'}
            </Badge>
          )}
        </div>
        {tiendaInfo.descripcion && (
          <CardDescription>{tiendaInfo.descripcion}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contacto */}
        {(tiendaInfo.telefono || tiendaInfo.whatsapp || tiendaInfo.email) && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Contacto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tiendaInfo.telefono && (
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={handlePhoneClick}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
              )}
              {tiendaInfo.whatsapp && (
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={handleWhatsAppClick}
                  style={{
                    borderColor: hexToRgb(branding.color_primario),
                    color: hexToRgb(branding.color_primario),
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              )}
              {tiendaInfo.email && (
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={handleEmailClick}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              )}
              {tiendaInfo.sitio_web && (
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={handleWebClick}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Sitio Web
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Ubicación */}
        {(tiendaInfo.direccion || tiendaInfo.ubicacion_maps) && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Ubicación</h3>
            {tiendaInfo.direccion && (
              <p className="text-sm text-muted-foreground">{tiendaInfo.direccion}</p>
            )}
            {tiendaInfo.ubicacion_maps && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleMapClick}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Ver en Google Maps
              </Button>
            )}
          </div>
        )}

        {/* Horarios */}
        {tiendaInfo.horarios && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horarios
            </h3>
            <div className="space-y-2">
              {Object.entries(diasSemana).map(([key, label]) => {
                const horario = tiendaInfo.horarios?.[key as keyof Horarios];
                if (!horario) return null;

                return (
                  <div
                    key={key}
                    className="flex justify-between items-center text-sm py-1"
                  >
                    <span className="font-medium">{label}</span>
                    <span className="text-muted-foreground">
                      {horario.abierto && horario.apertura && horario.cierre
                        ? `${horario.apertura} - ${horario.cierre}`
                        : 'Cerrado'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Redes Sociales */}
        {tiendaInfo.redes_sociales &&
          Object.values(tiendaInfo.redes_sociales).some((url) => url) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Síguenos</h3>
              <div className="flex gap-3">
                {tiendaInfo.redes_sociales.facebook && (
                  <button
                    onClick={() => handleSocialClick(tiendaInfo.redes_sociales!.facebook!)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook
                      className="h-5 w-5"
                      style={{ color: hexToRgb(branding.color_primario) }}
                    />
                  </button>
                )}
                {tiendaInfo.redes_sociales.instagram && (
                  <button
                    onClick={() => handleSocialClick(tiendaInfo.redes_sociales!.instagram!)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram
                      className="h-5 w-5"
                      style={{ color: hexToRgb(branding.color_primario) }}
                    />
                  </button>
                )}
                {tiendaInfo.redes_sociales.twitter && (
                  <button
                    onClick={() => handleSocialClick(tiendaInfo.redes_sociales!.twitter!)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Twitter/X"
                  >
                    <Twitter
                      className="h-5 w-5"
                      style={{ color: hexToRgb(branding.color_primario) }}
                    />
                  </button>
                )}
                {tiendaInfo.redes_sociales.linkedin && (
                  <button
                    onClick={() => handleSocialClick(tiendaInfo.redes_sociales!.linkedin!)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin
                      className="h-5 w-5"
                      style={{ color: hexToRgb(branding.color_primario) }}
                    />
                  </button>
                )}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
