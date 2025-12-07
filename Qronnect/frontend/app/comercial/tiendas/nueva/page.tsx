'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Store, ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NuevaTiendaComercial() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        dominio: '',
        dominio_personalizado: '',
        direccion: '',
        telefono: '',
        email: '',
        plan: 'basico',
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
            const token = localStorage.getItem('comercial_token'); // TODO: Validar token real
            // Simulamos token si es demo
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
            // Si es demo y no hay backend real corriendo auth correcta, simularemos éxito para UX review
            // En prod esto falla.
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
                        <Button className="w-full" onClick={() => router.push('/comercial/dashboard')}>
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
                            <CardTitle>Datos del Comercio</CardTitle>
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
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? 'Procesando...' : 'Dar de Alta Tienda'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </main>
        </div>
    );
}
