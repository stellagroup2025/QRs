'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Store, Plus, LogOut, TrendingUp, DollarSign, QrCode, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ComercialDashboard() {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [tiendas, setTiendas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // QR Assignment State
    const [selectedTienda, setSelectedTienda] = useState<string | null>(null);
    const [qrHash, setQrHash] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

    // Impersonation State
    const [impersonating, setImpersonating] = useState<string | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem('comercial_user');
        if (!userData) {
            router.push('/comerciales/login');
            return;
        }
        setUser(JSON.parse(userData));
        fetchData();
    }, [router]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('comercial_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch Stats
            const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/me/stats`, { headers });
            if (statsRes.ok) setStats(await statsRes.json());

            // Fetch Tiendas
            const tiendasRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/me/tiendas`, { headers });
            if (tiendasRes.ok) setTiendas(await tiendasRes.json());

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('comercial_token');
        localStorage.removeItem('comercial_user');
        router.push('/comerciales/login');
    };

    const handleAssignQr = async () => {
        if (!selectedTienda || !qrHash) return;
        setAssigning(true);
        try {
            const token = localStorage.getItem('comercial_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/tiendas/${selectedTienda}/asignar-qr`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ qrHash })
            });

            if (res.ok) {
                toast({ title: 'QR Asignado', description: 'El código QR se ha vinculado correctamente.' });
                setIsQrDialogOpen(false);
                setQrHash('');
                fetchData(); // Refresh list to maybe show QR status if we had it
            } else {
                toast({ title: 'Error', description: 'No se pudo asignar el QR. Verifica el código.', variant: 'destructive' });
            }
        } catch (e) {
            toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' });
        } finally {
            setAssigning(false);
        }
    };

    const handleImpersonate = async (tiendaId: string) => {
        setImpersonating(tiendaId);
        try {
            const token = localStorage.getItem('comercial_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/tiendas/${tiendaId}/impersonate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    window.open(data.url, '_blank');
                }
            } else {
                toast({ title: 'Error', description: 'No se pudo acceder a la tienda.', variant: 'destructive' });
            }
        } catch (e) {
            toast({ title: 'Error', description: 'Error al intentar entrar.', variant: 'destructive' });
        } finally {
            setImpersonating(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                            Qronnect Agentes
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">
                            {user?.email}
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Salir
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
                        <p className="text-muted-foreground">Bienvenido, {user?.nombre}</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" onClick={() => router.push('/comerciales/tiendas/nueva')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Tienda
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tiendas Registradas</CardTitle>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.stores?.total || 0}</div>
                            <p className="text-xs text-muted-foreground">+{stats?.stores?.newThisMonth || 0} este mes</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Comisiones (Est.)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">€{stats?.commissions?.total || 0}</div>
                            <p className="text-xs text-muted-foreground">Pendiente de pago</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Conversión</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.conversion?.rate || 0}%</div>
                            <p className="text-xs text-muted-foreground">+{stats?.conversion?.growth || 0}% vs mes anterior</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stores List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mis Tiendas</CardTitle>
                        <CardDescription>Gestión de clientes y asignación de QRs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-10">Cargando...</div>
                        ) : tiendas.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <Store className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p>No has registrado ninguna tienda aún.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium text-muted-foreground">Nombre</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Dominio</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Plan</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Creada</th>
                                            <th className="pb-3 font-medium text-muted-foreground text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {tiendas.map((tienda) => (
                                            <tr key={tienda.id} className="group">
                                                <td className="py-4 font-medium">{tienda.nombre}</td>
                                                <td className="py-4 text-muted-foreground">{tienda.dominio}.qronnect.es</td>
                                                <td className="py-4">
                                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                        {tienda.plan}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-muted-foreground">
                                                    {new Date(tienda.creado_en).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 text-right flex justify-end gap-2">
                                                    <Dialog open={isQrDialogOpen && selectedTienda === tienda.id} onOpenChange={(open) => {
                                                        if (!open) setSelectedTienda(null);
                                                        setIsQrDialogOpen(open);
                                                    }}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedTienda(tienda.id);
                                                                    setIsQrDialogOpen(true);
                                                                }}
                                                            >
                                                                <QrCode className="h-4 w-4 mr-1" />
                                                                Asignar QR
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Asignar QR Físico</DialogTitle>
                                                                <DialogDescription>
                                                                    Introduce el código (hash) que aparece en la pegatina del QR físico para vincularlo a <strong>{tienda.nombre}</strong>.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="py-4">
                                                                <Label htmlFor="qr-hash" className="mb-2 block">Código QR (Hash)</Label>
                                                                <Input
                                                                    id="qr-hash"
                                                                    value={qrHash}
                                                                    onChange={(e) => setQrHash(e.target.value)}
                                                                    placeholder="Ej: abc-123-xyz"
                                                                />
                                                            </div>
                                                            <DialogFooter>
                                                                <Button variant="ghost" onClick={() => setIsQrDialogOpen(false)}>Cancelar</Button>
                                                                <Button onClick={handleAssignQr} disabled={assigning || !qrHash}>
                                                                    {assigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                    Asignar
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleImpersonate(tienda.id)}
                                                        disabled={impersonating === tienda.id}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        {impersonating === tienda.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                                Entrar
                                                            </>
                                                        )}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
