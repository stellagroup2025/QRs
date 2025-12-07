'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Building2, Lock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ComercialLogin() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                // Guardar token y datos
                // NOTA: En la implementación real el backend debe devolver un token JWT válido
                // Aquí asumimos que "data" contiene { access_token: '...', comercial: { ... } }
                // Si el service backend actual solo devuelve el user, faltaría el token.
                // Asumiremos por ahora que el usuario maneja la auth visualmente hasta que conectemos jwt real.

                localStorage.setItem('comercial_token', 'demo_token_placeholder'); // TODO: Usar token real
                localStorage.setItem('comercial_user', JSON.stringify(data.comercial));

                router.push('/comerciales/dashboard');
            } else {
                toast({
                    title: "Error de acceso",
                    description: "Credenciales inválidas.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error de conexión",
                description: "No se pudo conectar con el servidor.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <Card className="w-full max-w-md shadow-2xl border-none">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-600 rounded-xl">
                            <Building2 className="h-8 w-8 text-white relative z-10" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Portal Comercial</CardTitle>
                    <CardDescription className="text-center">
                        Ingresa tus credenciales de agente
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Corporativo</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nombre@empresa.com"
                                    className="pl-10"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={loading}>
                            {loading ? 'Verificando...' : 'Acceder'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
