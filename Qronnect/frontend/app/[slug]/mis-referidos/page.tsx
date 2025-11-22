'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Share2,
  Copy,
  QrCode,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  Download,
  Instagram,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { QRCodeSVG } from 'qrcode.react';
import { ClientNav } from '@/components/ClientNav';

interface Codigo {
  codigo: string;
  url: string;
  nombre: string;
  nombre_tienda?: string;
  total_referidos: number;
}

interface Referido {
  nombre: string;
  fecha_registro?: string;
  creado_en?: string; // Campo que viene del backend
  estado: string;
  primera_compra: boolean;
  recompensa_obtenida: string;
}

interface Progreso {
  codigo_personal: string;
  total_referidos: number;
  programa_nombre: string;
  proxima_recompensa?: {
    objetivo: number;
    tipo: string;
    valor: number;
    descripcion: string;
    progreso?: number;
    restantes?: number;
  };
  recompensas_obtenidas: Array<{
    fecha: string;
    tipo: string;
    valor: number;
    descripcion: string;
  }>;
}

interface Milestone {
  id: string;
  nombre: string;
  descripcion: string | null;
  cantidad_referidos: number;
  tipo_recompensa: 'regalo_concreto' | 'puntos' | 'ambos';
  puntos: number | null;
  orden: number;
  activo: boolean;
  regalo: {
    id: string;
    nombre: string;
    descripcion: string | null;
    tipo: string;
    icono: string | null;
  } | null;
}

interface MilestoneAlcanzado {
  id: string;
  fecha_alcanzado: string;
  milestone: Milestone;
  cupon: {
    id: string;
    codigo: string;
  } | null;
}

export default function MisReferidosPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [codigo, setCodigo] = useState<Codigo | null>(null);
  const [referidos, setReferidos] = useState<Referido[]>([]);
  const [progreso, setProgreso] = useState<Progreso | null>(null);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestonesAlcanzados, setMilestonesAlcanzados] = useState<MilestoneAlcanzado[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem('client_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      if (!token) {
        toast({
          title: 'No autenticado',
          description: 'Por favor inicia sesión',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      console.log('🔍 Cargando código de referido...', { token: token?.substring(0, 20), slug });

      // Cargar código personal
      const codigoRes = await fetch(`${API_URL}/api/referidos/mi-codigo`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      });

      console.log('📡 Respuesta del servidor:', codigoRes.status);

      if (codigoRes.ok) {
        const data = await codigoRes.json();
        console.log('✅ Datos recibidos:', data);
        setCodigo(data);
      } else {
        const error = await codigoRes.text();
        console.error('❌ Error al cargar código:', codigoRes.status, error);
      }

      // Cargar mis referidos
      const referidosRes = await fetch(`${API_URL}/api/referidos/mis-referidos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      });

      if (referidosRes.ok) {
        const data = await referidosRes.json();
        console.log('📋 Referidos recibidos:', data);
        // El backend devuelve directamente el array, no { referidos: [] }
        setReferidos(Array.isArray(data) ? data : []);
      }

      // Cargar progreso
      const progresoRes = await fetch(`${API_URL}/api/referidos/mi-progreso`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      });

      if (progresoRes.ok) {
        const data = await progresoRes.json();
        setProgreso(data);
      }

      // Cargar milestones disponibles (públicos)
      try {
        const tiendaId = slug; // Asumimos que slug es el ID de la tienda
        const milestonesRes = await fetch(`${API_URL}/api/regalos/milestones/${tiendaId}`, {
          headers: {
            'X-Tenant-Domain': slug,
          },
        });

        if (milestonesRes.ok) {
          const data = await milestonesRes.json();
          setMilestones(data || []);
        }
      } catch (error) {
        console.error('Error cargando milestones:', error);
      }

      // Cargar milestones alcanzados (requiere auth)
      try {
        const alcanzadosRes = await fetch(`${API_URL}/api/regalos/mis-milestones`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Tenant-Domain': slug,
          },
        });

        if (alcanzadosRes.ok) {
          const data = await alcanzadosRes.json();
          setMilestonesAlcanzados(data || []);
        }
      } catch (error) {
        console.error('Error cargando milestones alcanzados:', error);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigo = () => {
    if (codigo?.codigo) {
      navigator.clipboard.writeText(codigo.codigo);
      toast({
        title: 'Código copiado',
        description: 'El código se ha copiado al portapapeles',
      });
    }
  };

  const copiarLink = () => {
    if (codigo?.url) {
      navigator.clipboard.writeText(codigo.url);
      toast({
        title: 'Link copiado',
        description: 'El enlace se ha copiado al portapapeles',
      });
    }
  };

  const compartirWhatsApp = () => {
    const nombreTienda = codigo?.nombre_tienda || codigo?.nombre || 'nuestra tienda';
    const mensaje = `¡Únete a ${nombreTienda}! Usa mi código ${codigo?.codigo} y obtén beneficios. Regístrate aquí: ${codigo?.url}`;
    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const compartirEmail = () => {
    const nombreTienda = codigo?.nombre_tienda || codigo?.nombre || 'nuestra tienda';
    const asunto = `Invitación a ${nombreTienda}`;
    const cuerpo = `¡Hola!\n\nTe invito a registrarte en ${nombreTienda}.\n\nUsa mi código: ${codigo?.codigo}\n\nRegístrate aquí: ${codigo?.url}\n\n¡Te esperamos!`;
    const url = `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    window.open(url);
  };

  const compartirFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(codigo?.url || '')}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const compartirTwitter = () => {
    const nombreTienda = codigo?.nombre_tienda || codigo?.nombre || 'nuestra tienda';
    const texto = `¡Únete a ${nombreTienda} con mi código ${codigo?.codigo}!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(codigo?.url || '')}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const descargarQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) {
      toast({
        title: 'Error',
        description: 'El código QR aún no está listo',
        variant: 'destructive',
      });
      return;
    }

    const nombreTienda = codigo?.nombre_tienda || codigo?.nombre || 'nuestra tienda';
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Tamaño más grande para mejor calidad en redes sociales (formato cuadrado para Instagram)
    canvas.width = 1080;
    canvas.height = 1080;

    img.onload = () => {
      if (!ctx) return;

      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Título
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`¡Únete a ${nombreTienda}!`, canvas.width / 2, 100);

      // QR Code centrado
      const qrSize = 600;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 180;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // Código debajo del QR
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 60px Arial';
      ctx.fillText(codigo?.codigo || '', canvas.width / 2, 850);

      // Texto descriptivo
      ctx.fillStyle = '#6b7280';
      ctx.font = '32px Arial';
      ctx.fillText('Escanea para registrarte y obtener beneficios', canvas.width / 2, 920);

      // Convertir a imagen y descargar
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-referido-${codigo?.codigo}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: 'QR descargado',
          description: 'Puedes compartirlo en tus redes sociales',
        });
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const compartirNativo = async () => {
    const nombreTienda = codigo?.nombre_tienda || codigo?.nombre || 'nuestra tienda';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Únete a ${nombreTienda}`,
          text: `Usa mi código ${codigo?.codigo} y obtén beneficios`,
          url: codigo?.url,
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      toast({
        title: 'Compartir no disponible',
        description: 'Usa los botones de redes sociales',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const progresoPercentaje = progreso?.proxima_recompensa
    ? ((progreso.proxima_recompensa.progreso || 0) / progreso.proxima_recompensa.objetivo) * 100
    : 0;

  return (
    <>
      <ClientNav slug={slug} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Invita a tus Amigos</h1>
          <p className="text-gray-600 mt-2">Comparte tu código y gana recompensas</p>
        </div>

      {/* QR Code Principal - Siempre visible */}
      <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Tu Código de Referido</CardTitle>
          <CardDescription className="text-center text-lg">Comparte este QR y gana recompensas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code - Siempre visible y grande */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-4 border-blue-300 min-h-[296px] flex items-center justify-center">
              {codigo?.url ? (
                <QRCodeSVG
                  id="qr-code-svg"
                  value={codigo.url}
                  size={280}
                  level="H"
                  includeMargin={true}
                />
              ) : (
                <div className="flex items-center justify-center w-[280px] h-[280px]">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            {/* Código debajo del QR */}
            <div className="mt-6 bg-white px-8 py-4 rounded-lg shadow-md border-2 border-blue-300 min-w-[200px]">
              <p className="text-3xl font-bold text-blue-600 tracking-wider text-center">
                {codigo?.codigo || '---'}
              </p>
            </div>

            <p className="text-sm text-gray-600 mt-4 text-center max-w-md">
              Escanea el código QR o comparte tu código personal para que tus amigos se registren
            </p>
          </div>

          {/* Botones de acción principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={descargarQR} className="bg-purple-600 hover:bg-purple-700" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>

            <Button onClick={copiarCodigo} variant="outline" size="lg">
              <Copy className="h-4 w-4 mr-2" />
              Copiar Código
            </Button>

            <Button onClick={copiarLink} variant="outline" size="lg">
              <Share2 className="h-4 w-4 mr-2" />
              Copiar Link
            </Button>

            <Button onClick={compartirNativo} variant="outline" size="lg">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          </div>

          {/* Compartir en redes sociales */}
          <div className="border-t pt-6">
            <p className="text-center text-sm font-medium mb-4 text-gray-700">
              📱 Comparte en tus redes sociales
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button onClick={compartirWhatsApp} className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>

              <Button onClick={compartirFacebook} className="bg-blue-600 hover:bg-blue-700">
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>

              <Button onClick={compartirTwitter} className="bg-sky-500 hover:bg-sky-600">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>

              <Button onClick={compartirEmail} className="bg-gray-600 hover:bg-gray-700">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>

            <div className="mt-4 p-4 bg-blue-100 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                💡 <strong>Tip:</strong> Descarga el QR y compártelo en Instagram Stories, WhatsApp Status o como imagen en cualquier red social
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progreso */}
      {progreso?.proxima_recompensa && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tu Progreso</CardTitle>
            <CardDescription>{progreso.programa_nombre}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  {progreso.total_referidos} de {progreso.proxima_recompensa.objetivo} referidos
                </span>
                <span className="text-sm text-gray-500">
                  {progreso.proxima_recompensa.restantes} restantes
                </span>
              </div>
              <Progress value={progresoPercentaje} className="h-3" />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-900">Próxima Recompensa</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {progreso.proxima_recompensa.valor}{' '}
                {progreso.proxima_recompensa.tipo === 'puntos' ? 'puntos' : '% descuento'}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {progreso.proxima_recompensa.descripcion}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Objetivos de Referidos
            </CardTitle>
            <CardDescription>Alcanza estos objetivos y gana regalos increíbles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestones.map((milestone) => {
              const totalReferidos = codigo?.total_referidos || 0;
              const alcanzado = milestonesAlcanzados.some((m) => m.milestone.id === milestone.id);
              const progreso = Math.min((totalReferidos / milestone.cantidad_referidos) * 100, 100);
              const restantes = Math.max(milestone.cantidad_referidos - totalReferidos, 0);

              return (
                <div
                  key={milestone.id}
                  className={`p-4 rounded-lg border-2 ${
                    alcanzado
                      ? 'bg-green-50 border-green-300'
                      : progreso === 100
                      ? 'bg-yellow-50 border-yellow-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{milestone.nombre}</h4>
                        {alcanzado && (
                          <Badge className="bg-green-600">
                            <Check className="h-3 w-3 mr-1" />
                            ¡Completado!
                          </Badge>
                        )}
                      </div>
                      {milestone.descripcion && (
                        <p className="text-sm text-gray-600">{milestone.descripcion}</p>
                      )}
                    </div>
                    {milestone.regalo && (
                      <div className="ml-4 text-center min-w-[80px]">
                        <Gift className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                        <p className="text-xs font-medium text-gray-700">{milestone.regalo.nombre}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {totalReferidos} / {milestone.cantidad_referidos} amigos
                      </span>
                      {!alcanzado && (
                        <span className="text-gray-500">
                          Faltan {restantes} {restantes === 1 ? 'amigo' : 'amigos'}
                        </span>
                      )}
                    </div>
                    <Progress
                      value={progreso}
                      className={`h-3 ${alcanzado ? 'bg-green-200' : 'bg-gray-200'}`}
                    />

                    {milestone.tipo_recompensa === 'ambos' && milestone.puntos && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <Sparkles className="h-4 w-4" />
                        <span>+ {milestone.puntos} puntos extra</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recompensas obtenidas */}
      {progreso && progreso.recompensas_obtenidas && progreso.recompensas_obtenidas.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recompensas Obtenidas</CardTitle>
            <CardDescription>Historial de tus logros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progreso.recompensas_obtenidas.map((recompensa, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">{recompensa.descripcion}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(recompensa.fecha).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {recompensa.valor} {recompensa.tipo === 'puntos' ? 'pts' : '%'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tus referidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tus Amigos Referidos ({referidos.length})
          </CardTitle>
          <CardDescription>Personas que se han registrado con tu código</CardDescription>
        </CardHeader>
        <CardContent>
          {referidos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Aún no has referido a nadie</p>
              <p className="text-sm mt-2">Comparte tu código para empezar a ganar recompensas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referidos.map((ref, idx) => {
                // Usar creado_en o fecha_registro dependiendo de qué campo exista
                const fecha = ref.creado_en || ref.fecha_registro;
                const fechaFormateada = fecha
                  ? new Date(fecha).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Fecha no disponible';

                return (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{ref.nombre}</p>
                      <p className="text-sm text-gray-500">
                        Registrado el {fechaFormateada}
                      </p>
                      <p className="text-xs text-green-600 mt-1">{ref.recompensa_obtenida}</p>
                    </div>
                    <div className="text-right">
                      {ref.primera_compra ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Primera compra</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Sin compra aún</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{codigo?.total_referidos || 0}</p>
              <p className="text-sm text-gray-600">Total Referidos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{progreso?.recompensas_obtenidas?.length || 0}</p>
              <p className="text-sm text-gray-600">Recompensas</p>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
}
