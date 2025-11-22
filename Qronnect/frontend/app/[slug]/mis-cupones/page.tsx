'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Gift,
  QrCode,
  Calendar,
  Check,
  X,
  Clock,
  Sparkles,
  Coffee,
  Ticket,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ClientNav } from '@/components/ClientNav';

interface Cupon {
  id: string;
  codigo: string;
  regalo_nombre: string;
  regalo_descripcion: string | null;
  regalo_tipo: 'producto' | 'descuento' | 'servicio' | 'puntos';
  regalo_icono: string | null;
  estado: 'disponible' | 'usado' | 'expirado' | 'cancelado';
  fecha_otorgado: string;
  fecha_expiracion: string | null;
  fecha_usado: string | null;
  visto_por_cliente: boolean;
  instrucciones_canje: string | null;
  origen: 'bienvenida' | 'referido' | 'milestone' | 'promocion' | 'manual';
  detalles_regalo: any;
}

// Mapeo de iconos de lucide
const iconMap: Record<string, any> = {
  coffee: Coffee,
  gift: Gift,
  sparkles: Sparkles,
  ticket: Ticket,
};

export default function MisCuponesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [cuponQR, setCuponQR] = useState<string | null>(null);

  useEffect(() => {
    cargarCupones();
  }, []);

  const cargarCupones = async () => {
    try {
      const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem('client_token');

      if (!token) {
        toast({
          title: 'Error',
          description: 'No se encontró sesión activa',
          variant: 'destructive',
        });
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/regalos/mis-cupones`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar cupones');
      }

      const data = await response.json();
      setCupones(data || []);

      // Marcar como vistos los cupones nuevos
      const cuponesNuevos = data.filter((c: Cupon) => !c.visto_por_cliente);
      for (const cupon of cuponesNuevos) {
        marcarComoVisto(cupon.id);
      }
    } catch (error) {
      console.error('Error cargando cupones:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar tus cupones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const marcarComoVisto = async (cuponId: string) => {
    try {
      const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem('client_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      await fetch(`${apiUrl}/regalos/cupones/${cuponId}/marcar-visto`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      });

      // Actualizar estado local
      setCupones((prev) =>
        prev.map((c) => (c.id === cuponId ? { ...c, visto_por_cliente: true } : c))
      );
    } catch (error) {
      console.error('Error marcando cupón como visto:', error);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { text: string; variant: any }> = {
      disponible: { text: 'Disponible', variant: 'default' },
      usado: { text: 'Usado', variant: 'secondary' },
      expirado: { text: 'Expirado', variant: 'destructive' },
      cancelado: { text: 'Cancelado', variant: 'outline' },
    };
    return badges[estado] || { text: estado, variant: 'outline' };
  };

  const getOrigenBadge = (origen: string) => {
    const origenes: Record<string, { text: string; icon: any }> = {
      bienvenida: { text: 'Regalo de bienvenida', icon: Sparkles },
      referido: { text: 'Por invitar amigos', icon: Gift },
      milestone: { text: 'Objetivo alcanzado', icon: Sparkles },
      promocion: { text: 'Promoción', icon: Ticket },
      manual: { text: 'Regalo especial', icon: Gift },
    };
    return origenes[origen] || { text: origen, icon: Gift };
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const cuponesDisponibles = cupones.filter((c) => c.estado === 'disponible');
  const cuponesUsados = cupones.filter((c) => c.estado !== 'disponible');

  const cuponesAMostrar = mostrarTodos ? cupones : cuponesDisponibles;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <ClientNav />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando tus cupones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ClientNav />

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Gift className="h-8 w-8 text-blue-600" />
            Mis Cupones
          </h1>
          <p className="text-gray-600">
            Aquí encontrarás todos tus cupones y regalos disponibles
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Disponibles</p>
                  <p className="text-2xl font-bold text-green-600">{cuponesDisponibles.length}</p>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Usados</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {cupones.filter((c) => c.estado === 'usado').length}
                  </p>
                </div>
                <Check className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{cupones.length}</p>
                </div>
                <Gift className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtro */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={!mostrarTodos ? 'default' : 'outline'}
            onClick={() => setMostrarTodos(false)}
          >
            Disponibles ({cuponesDisponibles.length})
          </Button>
          <Button
            variant={mostrarTodos ? 'default' : 'outline'}
            onClick={() => setMostrarTodos(true)}
          >
            Todos ({cupones.length})
          </Button>
        </div>

        {/* Lista de cupones */}
        {cuponesAMostrar.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {mostrarTodos ? 'No tienes cupones aún' : 'No tienes cupones disponibles'}
              </h3>
              <p className="text-gray-600">
                {mostrarTodos
                  ? 'Invita amigos y alcanza objetivos para obtener regalos'
                  : 'Revisa la pestaña "Todos" para ver cupones usados o expirados'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {cuponesAMostrar.map((cupon) => {
              const estadoBadge = getEstadoBadge(cupon.estado);
              const origenInfo = getOrigenBadge(cupon.origen);
              const IconoOrigen = origenInfo.icon;
              const IconoRegalo = cupon.regalo_icono ? iconMap[cupon.regalo_icono] || Gift : Gift;

              return (
                <Card
                  key={cupon.id}
                  className={`overflow-hidden transition-all hover:shadow-lg ${
                    cupon.estado === 'disponible'
                      ? 'border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50'
                      : 'bg-gray-50'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`p-3 rounded-lg ${
                            cupon.estado === 'disponible' ? 'bg-blue-100' : 'bg-gray-200'
                          }`}
                        >
                          <IconoRegalo
                            className={`h-6 w-6 ${
                              cupon.estado === 'disponible' ? 'text-blue-600' : 'text-gray-500'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-xl">{cupon.regalo_nombre}</CardTitle>
                            {!cupon.visto_por_cliente && cupon.estado === 'disponible' && (
                              <Badge variant="default" className="text-xs">
                                ¡Nuevo!
                              </Badge>
                            )}
                          </div>
                          {cupon.regalo_descripcion && (
                            <CardDescription className="text-base">
                              {cupon.regalo_descripcion}
                            </CardDescription>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <IconoOrigen className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{origenInfo.text}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={estadoBadge.variant as any}>{estadoBadge.text}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Código del cupón */}
                    {cupon.estado === 'disponible' && (
                      <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Tu código:</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCuponQR(cuponQR === cupon.id ? null : cupon.id)}
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            {cuponQR === cupon.id ? 'Ocultar QR' : 'Ver QR'}
                          </Button>
                        </div>
                        <p className="text-3xl font-bold text-center text-blue-600 tracking-wider font-mono mb-2">
                          {cupon.codigo}
                        </p>

                        {/* QR Code */}
                        {cuponQR === cupon.id && (
                          <div className="mt-4 p-4 bg-white rounded-lg border flex justify-center">
                            <QRCodeSVG value={cupon.codigo} size={200} level="H" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Instrucciones */}
                    {cupon.instrucciones_canje && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Cómo usar este cupón:
                        </p>
                        <p className="text-sm text-blue-700">{cupon.instrucciones_canje}</p>
                      </div>
                    )}

                    {/* Información adicional */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Recibido: {formatearFecha(cupon.fecha_otorgado)}</span>
                      </div>

                      {cupon.fecha_expiracion && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            Válido hasta: {formatearFecha(cupon.fecha_expiracion)}
                          </span>
                        </div>
                      )}

                      {cupon.fecha_usado && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Check className="h-4 w-4" />
                          <span>Usado el: {formatearFecha(cupon.fecha_usado)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info adicional */}
        {cuponesDisponibles.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">¿Cómo canjear tus cupones?</h3>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Muestra el código o el QR en el establecimiento</li>
                    <li>El personal validará tu cupón</li>
                    <li>¡Disfruta de tu regalo!</li>
                  </ol>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 Tip: Puedes mostrar el QR para un escaneo más rápido
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
