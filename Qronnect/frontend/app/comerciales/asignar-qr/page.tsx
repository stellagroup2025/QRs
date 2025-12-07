'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Store, ArrowRight, Loader2, Search } from 'lucide-react';

function AsignarQrComercialContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const hash = searchParams.get('hash');
    const [tiendas, setTiendas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [asignando, setAsignando] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!hash) {
            router.push('/comerciales/dashboard');
            return;
        }
        cargarTiendas();
    }, [hash]);

    const cargarTiendas = async () => {
        try {
            const token = localStorage.getItem('comercial_token');
            if (!token) {
                router.push('/comerciales/login');
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/me/tiendas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Error cargando tiendas');

            const data = await res.json();
            setTiendas(data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'No se pudieron cargar tus tiendas',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAsignar = async (tiendaId: string) => {
        if (!hash) return;

        setAsignando(tiendaId);
        try {
            const token = localStorage.getItem('comercial_token');
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/tiendas/${tiendaId}/asignar-qr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ qrHash: hash })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Error al asignar');
            }

            toast({
                title: '¡QR Asignado!',
                description: `El QR ha sido vinculado correctamente.`,
            });

            // Redirigir al dashboard
            router.push('/comerciales/dashboard');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'No se pudo asignar el QR',
                variant: 'destructive',
            });
            setAsignando(null);
        }
    };

    const tiendasFiltradas = tiendas.filter((tienda) =>
        tienda.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tienda.dominio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <QrCode className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <CardTitle>Asignar QR a Tienda</CardTitle>
                            <CardDescription>
                                Estás asignando el QR: <code className="font-mono font-semibold">{hash}</code>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                            Selecciona una de tus tiendas para vincular este código QR físico.
                        </p>
                    </div>

                    {tiendas.length > 0 && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Buscar tienda..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    )}

                    {tiendas.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No tienes tiendas registradas.</p>
                            <Button onClick={() => router.push('/comerciales/tiendas/nueva')} className="mt-4">
                                Crear Nueva Tienda
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {tiendasFiltradas.map((tienda) => (
                                <Card
                                    key={tienda.id}
                                    className="hover:bg-accent/50 transition-colors cursor-pointer border-slate-200"
                                    onClick={() => asignando ? null : handleAsignar(tienda.id)}
                                >
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-lg">
                                                <Store className="h-5 w-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{tienda.nombre}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {tienda.dominio}.qronnect.es | Plan: {tienda.plan}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            disabled={asignando !== null}
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAsignar(tienda.id);
                                            }}
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

                    <div className="flex justify-center pt-4">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/comerciales/dashboard')}
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

export default function AsignarQrComercialPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <AsignarQrComercialContent />
        </Suspense>
    );
}
