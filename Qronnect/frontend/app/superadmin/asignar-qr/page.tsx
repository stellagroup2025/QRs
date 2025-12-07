'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Store, ArrowRight, Loader2 } from 'lucide-react';
import { asignarQr, listarTiendasSinQr } from '@/lib/api/qr-codes';

interface Tienda {
  id: string;
  nombre: string;
  dominio: string;
  email: string;
}

function AsignarQrRapidoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const hash = searchParams.get('hash');
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [asignando, setAsignando] = useState<string | null>(null);

  useEffect(() => {
    if (!hash) {
      router.push('/superadmin/qr-codes');
      return;
    }
    cargarTiendas();
  }, [hash]);

  const cargarTiendas = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      if (!token) {
        console.error('No hay token de superadmin');
        router.push('/superadmin/login');
        return;
      }

      console.log('Cargando tiendas sin QR con token:', token.substring(0, 20) + '...');
      const data = await listarTiendasSinQr(token);
      setTiendas(data);
      console.log('Tiendas cargadas:', data.length);
    } catch (error: any) {
      console.error('Error al cargar tiendas:', error);

      // Si el error es de autenticación, redirigir al login
      if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Token')) {
        toast({
          title: 'Sesión expirada',
          description: 'Por favor, inicia sesión nuevamente',
          variant: 'destructive',
        });
        localStorage.removeItem('superadmin_token');
        localStorage.removeItem('superadmin_refresh_token');
        localStorage.removeItem('superadmin_user');
        router.push('/superadmin/login');
        return;
      }

      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar las tiendas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAsignar = async (tienda: Tienda) => {
    if (!hash) return;

    setAsignando(tienda.id);
    try {
      const token = localStorage.getItem('superadmin_token');
      if (!token) return;

      await asignarQr(token, {
        hash,
        id_tienda: tienda.id,
      });

      toast({
        title: '¡QR Asignado!',
        description: `El QR "${hash}" ha sido asignado a ${tienda.nombre}`,
      });

      // Redirigir al subdominio de la tienda
      window.location.href = `https://${tienda.dominio}.qronnect.es/get-qr`;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo asignar el QR',
        variant: 'destructive',
      });
      setAsignando(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <QrCode className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <CardTitle>Asignación Rápida de QR Code</CardTitle>
              <CardDescription>
                QR Code: <code className="font-mono font-semibold">{hash}</code>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Selecciona una tienda</strong> para asignar este QR code. Una vez asignado,
              el QR redirigirá automáticamente a la página de fidelización de la tienda.
            </p>
          </div>

          {/* Lista de tiendas */}
          {tiendas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay tiendas sin QR asignado</p>
              <Button
                variant="link"
                onClick={() => router.push('/superadmin/tiendas')}
                className="mt-2"
              >
                Ver todas las tiendas
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                {tiendas.length} {tiendas.length === 1 ? 'tienda disponible' : 'tiendas disponibles'}
              </p>
              {tiendas.map((tienda) => (
                <Card
                  key={tienda.id}
                  className="hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => asignando ? null : handleAsignar(tienda)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Store className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-semibold">{tienda.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {tienda.dominio}.qronnect.es
                        </p>
                      </div>
                    </div>
                    <Button
                      disabled={asignando !== null}
                      onClick={() => handleAsignar(tienda)}
                    >
                      {asignando === tienda.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Asignando...
                        </>
                      ) : (
                        <>
                          Asignar
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Botón de cancelar */}
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/superadmin/qr-codes')}
              disabled={asignando !== null}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AsignarQrRapidoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <AsignarQrRapidoContent />
    </Suspense>
  );
}
