'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Store, ArrowLeft, Save, CheckCircle2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function NuevaTiendaComercial() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);
    const [planes, setPlanes] = useState<any[]>([]);

    // Fetch planes
    useEffect(() => {
        const fetchPlanes = async () => {
            const token = localStorage.getItem('comercial_token');
            if (!token) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/planes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPlanes(data);
                    // Default to Demo if exists, or first one
                    const demo = data.find((p: any) => p.nombre.includes('Demo'));
                    if (demo && !formData.plan_id) {
                        setFormData(prev => ({ ...prev, plan_id: demo.id }));
                    }
                }
            } catch (e) { console.error(e); }
        };
        fetchPlanes();
    }, []);

    const [formData, setFormData] = useState({
        nombre: '',
        dominio: '',
        dominio_personalizado: '',
        direccion: '',
        telefono: '',
        email: '',
        plan_id: '',
        admin_nombre: '',
        admin_email: '',
    });

    const generateDominio = (nombre: string) => {
        return nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
    };

    const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nombre = e.target.value;
        setFormData({
            ...formData,
            nombre,
            dominio: formData.dominio || generateDominio(nombre)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('comercial_token');
            const authHeader = token ? `Bearer ${token}` : '';

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/tiendas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setSuccessData(data);
                toast({
                    title: "Tienda creada",
                    description: "La tienda se ha configurado correctamente.",
                });
            } else {
                const err = await response.json();
                toast({
                    title: "Error",
                    description: err.message || "No se pudo crear la tienda.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error de conexión",
                description: "Verifica tu conexión al servidor.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (successData) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 flex items-center justify-center">
                <Card className="max-w-md w-full border-green-500 border-2">
                    <CardHeader>
                        <div className="mx-auto bg-green-100 p-3 rounded-full mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-center">¡Tienda Creada!</CardTitle>
                        <CardDescription className="text-center">El comercio ha sido dado de alta exitosamente.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">PIN de acceso generado:</p>
                            <p className="text-3xl font-mono font-bold text-center tracking-widest my-2 select-all">
                                {successData.credenciales?.pin}
                            </p>
                            <p className="text-xs text-center text-muted-foreground">Comparte este PIN con el cliente</p>
                        </div>
                        <Button className="w-full" onClick={() => router.push('/comerciales/dashboard')}>
                            Volver al Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 mb-8">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Alta de Nueva Tienda</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Selección de Plan</CardTitle>
                            <CardDescription>Elige el plan de suscripción para el cliente.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingPlanes ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                    Cargando planes disponibles...
                                </div>
                            ) : planesError ? (
                                <div className="text-center py-6 text-red-500 bg-red-50 rounded-lg">
                                    <p>{planesError}</p>
                                    <Button type="button" variant="link" onClick={() => window.location.reload()}>Reintentar</Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {planes.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className={cn(
                                                "cursor-pointer rounded-lg border p-4 hover:border-blue-500 transition-all relative overflow-hidden",
                                                formData.plan_id === plan.id ? "border-blue-600 bg-blue-50 dark:bg-blue-900/10 ring-1 ring-blue-600" : "border-slate-200"
                                            )}
                                            onClick={() => setFormData({ ...formData, plan_id: plan.id })}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold">{plan.nombre}</h3>
                                                {formData.plan_id === plan.id && <Check className="h-5 w-5 text-blue-600" />}
                                            </div>
                                            <div className="text-2xl font-bold mb-2">
                                                {plan.precio === 0 ? 'Gratis' : `€${plan.precio}`}
                                                <span className="text-sm font-normal text-muted-foreground">/mes</span>
                                            </div>
                                            {plan.duracion_meses > 1 && (
                                                <div className="text-xs text-orange-600 font-medium mb-2">
                                                    Duración: {plan.duracion_meses} meses
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {/* Aquí podríamos parsear caracteristicas JSON si lo traemos */}
                                                {plan.nombre.includes('Demo') ? 'Prueba gratuita completa.' : 'Plan profesional.'}
                                            </p>

                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>2. Datos del Comercio</CardTitle>
                            <CardDescription>Información general de la tienda y su administrador.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre Comercial</Label>
                                    <Input
                                        id="nombre"
                                        placeholder="Ej. Cafetería Central"
                                        value={formData.nombre}
                                        onChange={handleNombreChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dominio">Subdominio (qronnect.es)</Label>
                                    <Input
                                        id="dominio"
                                        placeholder="cafeteriacentral"
                                        value={formData.dominio}
                                        onChange={(e) => setFormData({ ...formData, dominio: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dominio_personalizado">Dominio Personalizado (Opcional)</Label>
                                <Input
                                    id="dominio_personalizado"
                                    placeholder="midominio.com"
                                    value={formData.dominio_personalizado}
                                    onChange={(e) => setFormData({ ...formData, dominio_personalizado: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="direccion">Dirección</Label>
                                    <Input
                                        id="direccion"
                                        placeholder="Calle Principal 123"
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono Tienda</Label>
                                    <Input
                                        id="telefono"
                                        placeholder="+34 600 000 000"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Contacto Tienda</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="contacto@tienda.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="border-t pt-6 mt-6">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Store className="h-4 w-4" />
                                    Datos del Administrador
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="admin_nombre">Nombre Responsable</Label>
                                        <Input
                                            id="admin_nombre"
                                            placeholder="Juan Pérez"
                                            value={formData.admin_nombre}
                                            onChange={(e) => setFormData({ ...formData, admin_nombre: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admin_email">Email Responsable (Login)</Label>
                                        <Input
                                            id="admin_email"
                                            type="email"
                                            placeholder="juan@tienda.com"
                                            value={formData.admin_email}
                                            onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Se enviará un email a esta dirección con las credenciales de acceso.
                                </p>
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading || !formData.plan_id}>
                                {loading ? 'Procesando...' : 'Dar de Alta Tienda'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </div>
    );
}
