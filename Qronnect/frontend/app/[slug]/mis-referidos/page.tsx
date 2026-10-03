'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Award, Check, Copy, Download, Gift, Link2, Mail, MessageCircle, Share2, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import { ClientCard, ClientPage, ClientSectionTitle, ClientSkeleton } from '@/components/cliente/ClientPage';

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

      // Cargar código personal
      const codigoRes = await fetch(`${API_URL}/api/referidos/mi-codigo`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      });

      if (codigoRes.ok) {
        const data = await codigoRes.json();
        setCodigo(data);
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
        // Objetivos de la tienda actual (el backend la saca del dominio)
        const milestonesRes = await fetch(`${API_URL}/api/regalos/milestones`, {
          headers: {
            'X-Tenant-Domain': slug,
          },
        });

        if (milestonesRes.ok) {
          const data = await milestonesRes.json();
          setMilestones(data || []);
        }
      } catch (error) {
        // Milestones es funcionalidad opcional
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
        // Milestones alcanzados es funcionalidad opcional
      }
    } catch (error) {
      // Error general silencioso
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
    const mensaje = `¡Únete a ${nombreTienda}! Regístrate con mi código ${codigo?.codigo} y llévate tu regalo de bienvenida: ${codigo?.url}`;
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
      ctx.fillStyle = '#161311';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`¡Únete a ${nombreTienda}!`, canvas.width / 2, 100);

      // QR Code centrado
      const qrSize = 600;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 180;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // Código debajo del QR
      ctx.fillStyle = '#161311';
      ctx.font = 'bold 60px Arial';
      ctx.fillText(codigo?.codigo || '', canvas.width / 2, 850);

      // Texto descriptivo
      ctx.fillStyle = '#6b7280';
      ctx.font = '32px Arial';
      ctx.fillText('Escanea, regístrate y llévate tu regalo', canvas.width / 2, 920);

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
          text: `Regístrate con mi código ${codigo?.codigo} y llévate tu regalo de bienvenida`,
          url: codigo?.url,
        });
      } catch (error) {
        // Usuario canceló compartir
      }
    } else {
      compartirWhatsApp();
    }
  };

  if (loading) {
    return (
      <ClientPage>
        <ClientSkeleton blocks={3} />
      </ClientPage>
    );
  }

  const totalReferidos = codigo?.total_referidos ?? referidos.length;
  const proxima = progreso?.proxima_recompensa;

  return (
    <ClientPage
      title="Invita a tus amigos"
      subtitle="Tú ganas puntos por cada amigo que se une, y tu amigo se lleva su regalo de bienvenida."
    >
      {/* Código y QR para compartir */}
      {codigo && (
        <ClientCard className="overflow-hidden border-0 bg-ink p-0 text-paper">
          <div className="flex flex-col items-center px-5 pb-5 pt-6 text-center">
            <div className="rounded-3xl bg-white p-4">
              <QRCodeSVG id="qr-code-svg" value={codigo.url} size={176} level="M" />
            </div>
            <p className="mt-4 text-sm text-paper/60">Tu código</p>
            <button
              type="button"
              onClick={copiarCodigo}
              className="mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-2xl font-bold tracking-[0.15em] hover:bg-paper/10"
            >
              {codigo.codigo}
              <Copy className="h-4 w-4 opacity-60" aria-label="Copiar código" />
            </button>
            <p className="mt-1 text-sm text-paper/60">Tu amigo puede escanear el QR o abrir tu enlace.</p>

            <button
              type="button"
              onClick={compartirNativo}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-brand-on"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Compartir invitación
            </button>
          </div>
          <div className="grid grid-cols-4 border-t border-paper/10">
            {[
              { label: 'WhatsApp', icon: MessageCircle, onClick: compartirWhatsApp },
              { label: 'Email', icon: Mail, onClick: compartirEmail },
              { label: 'Enlace', icon: Link2, onClick: copiarLink },
              { label: 'Imagen', icon: Download, onClick: descargarQR },
            ].map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className="flex flex-col items-center gap-1.5 py-4 text-xs font-medium text-paper/75 transition-colors hover:bg-paper/5 hover:text-paper"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </ClientCard>
      )}

      {/* Resumen */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ClientCard className="p-4">
          <p className="font-display text-3xl font-bold tabular-nums">{totalReferidos}</p>
          <p className="text-sm text-ink/55">{totalReferidos === 1 ? 'amigo invitado' : 'amigos invitados'}</p>
        </ClientCard>
        <ClientCard className="p-4">
          <p className="font-display text-3xl font-bold tabular-nums">{progreso?.recompensas_obtenidas?.length || 0}</p>
          <p className="text-sm text-ink/55">recompensas conseguidas</p>
        </ClientCard>
      </div>

      {/* Próxima recompensa */}
      {proxima && (
        <ClientCard className="mt-4">
          <p className="text-sm text-ink/55">Próxima recompensa</p>
          <p className="mt-0.5 font-display text-lg font-bold">
            {proxima.tipo === 'puntos' ? `${proxima.valor} puntos` : `${proxima.valor}% de descuento`}
          </p>
          {proxima.descripcion && <p className="text-sm text-ink/60">{proxima.descripcion}</p>}
          <ProgressBar value={totalReferidos} max={proxima.objetivo} />
          <p className="mt-1.5 text-xs text-ink/55">
            {Math.min(totalReferidos, proxima.objetivo)} de {proxima.objetivo} amigos
            {proxima.restantes ? ` · te ${proxima.restantes === 1 ? 'falta 1' : `faltan ${proxima.restantes}`}` : ''}
          </p>
        </ClientCard>
      )}

      {/* Objetivos con regalo */}
      {milestones.length > 0 && (
        <>
          <ClientSectionTitle>Objetivos con regalo</ClientSectionTitle>
          <ul className="space-y-3">
            {milestones.map((milestone) => {
              const alcanzado = milestonesAlcanzados.some((m) => m.milestone.id === milestone.id);
              const restantes = Math.max(milestone.cantidad_referidos - totalReferidos, 0);
              const premio = [
                milestone.regalo?.nombre,
                milestone.puntos && milestone.tipo_recompensa !== 'regalo_concreto' ? `${milestone.puntos} puntos` : null,
              ]
                .filter(Boolean)
                .join(' + ');

              return (
                <li
                  key={milestone.id}
                  className={cn(
                    'rounded-3xl border bg-white p-5',
                    alcanzado ? 'border-brand/40' : 'border-ink/[0.07]',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                        alcanzado ? 'bg-brand text-brand-on' : 'bg-ink/[0.05] text-ink/50',
                      )}
                    >
                      {alcanzado ? <Check className="h-5 w-5" aria-hidden="true" /> : <Gift className="h-5 w-5" aria-hidden="true" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{milestone.nombre}</p>
                      <p className="text-sm text-ink/60">
                        {milestone.cantidad_referidos} {milestone.cantidad_referidos === 1 ? 'amigo' : 'amigos'}
                        {premio ? ` → ${premio}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">
                      {alcanzado ? '¡Conseguido!' : `Faltan ${restantes}`}
                    </span>
                  </div>
                  {!alcanzado && <ProgressBar value={totalReferidos} max={milestone.cantidad_referidos} />}
                </li>
              );
            })}
          </ul>
          {milestonesAlcanzados.length > 0 && (
            <p className="mt-3 text-sm text-ink/55">Los regalos conseguidos están en Mis cupones.</p>
          )}
        </>
      )}

      {/* Recompensas obtenidas */}
      {progreso?.recompensas_obtenidas && progreso.recompensas_obtenidas.length > 0 && (
        <>
          <ClientSectionTitle>Recompensas conseguidas</ClientSectionTitle>
          <ClientCard className="p-0">
            <ul className="divide-y divide-ink/[0.07]">
              {progreso.recompensas_obtenidas.map((recompensa, idx) => (
                <li key={idx} className="flex items-center gap-3 px-5 py-4">
                  <Award className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{recompensa.descripcion}</p>
                    <p className="text-sm text-ink/55">{new Date(recompensa.fecha).toLocaleDateString('es-ES')}</p>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">
                    +{recompensa.valor} {recompensa.tipo === 'puntos' ? 'pts' : '%'}
                  </span>
                </li>
              ))}
            </ul>
          </ClientCard>
        </>
      )}

      {/* Amigos */}
      <ClientSectionTitle>Tus amigos</ClientSectionTitle>
      {referidos.length === 0 ? (
        <ClientCard className="text-center text-sm text-ink/60">
          Aún no se ha unido nadie con tu código. ¡Compártelo!
        </ClientCard>
      ) : (
        <ClientCard className="p-0">
          <ul className="divide-y divide-ink/[0.07]">
            {referidos.map((ref, idx) => {
              const fecha = ref.creado_en || ref.fecha_registro;
              return (
                <li key={idx} className="flex items-center gap-3 px-5 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 font-semibold">
                    {ref.nombre.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{ref.nombre}</p>
                    <p className="text-sm text-ink/55">
                      {fecha ? `Se unió el ${new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}` : 'Se unió'}
                      {ref.recompensa_obtenida ? ` · ${ref.recompensa_obtenida}` : ''}
                    </p>
                  </div>
                  <span className={cn('shrink-0 text-xs font-medium', ref.primera_compra ? 'text-ink' : 'text-ink/45')}>
                    {ref.primera_compra ? 'Ya ha comprado' : 'Sin compras aún'}
                  </span>
                </li>
              );
            })}
          </ul>
        </ClientCard>
      )}
    </ClientPage>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/[0.07]" role="progressbar" aria-valuenow={Math.min(value, max)} aria-valuemax={max}>
      <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
    </div>
  );
}
