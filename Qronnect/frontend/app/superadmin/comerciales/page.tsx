'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, Shield, Store } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Comercial {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    activo: boolean;
    tiendas_creadas: number;
    ultimo_acceso?: string;
    creado_en: string;
}

export default function ComercialesPage() {
    const [comerciales, setComerciales] = useState<Comercial[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { toast } = useToast();

    // Form states
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        telefono: '',
    });

    useEffect(() => {
        fetchComerciales();
    }, []);

    const fetchComerciales = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('superadmin_token')}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setComerciales(data);
            }
        } catch (error) {
            console.error('Error fetching comerciales:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('superadmin_token')}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast({
                    title: 'Comercial creado',
                    description: 'El agente ha sido registrado exitosamente.',
                });
                setIsCreateOpen(false);
                fetchComerciales();
                setFormData({ nombre: '', email: '', password: '', telefono: '' });
            } else {
                const error = await response.json();
                toast({
                    title: 'Error',
                    description: error.message || 'No se pudo crear el comercial',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error de conexión',
                variant: 'destructive',
            });
        }
    };

    const filteredComerciales = comerciales.filter(
        (c) =>
            c.nombre.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Equipo Comercial</h1>
                    <p className="text-muted-foreground">
                        Gestiona tus agentes de ventas y supervisa su rendimiento.
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Comercial
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nuevo Agente Comercial</DialogTitle>
                            <DialogDescription>
                                Crea una cuenta para un nuevo agente de ventas.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nombre">Nombre Completo</Label>
                                <Input
                                    id="nombre"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Corporativo</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="pass">Contraseña Inicial</Label>
                                <Input
                                    id="pass"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tel">Teléfono (Opcional)</Label>
                                <Input
                                    id="tel"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleCreate}>Crear Cuenta</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Agentes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{comerciales.length}</div>
                        <p className="text-xs text-muted-foreground">Activos en la plataforma</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tiendas Captadas</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {comerciales.reduce((sum, c) => sum + c.tiendas_creadas, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total histórico</p>
                    </CardContent>
                </Card>
                {/* Placeholder for future metric */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {comerciales.length > 0
                                ? comerciales.reduce((prev, current) => (prev.tiendas_creadas > current.tiendas_creadas) ? prev : current).nombre
                                : '-'
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">Mayor captación</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Listado de Agentes</CardTitle>
                        <div className="flex items-center gap-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre..."
                                className="w-[200px]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Cargando...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Tiendas Creadas</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Último Acceso</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredComerciales.map((comercial) => (
                                    <TableRow key={comercial.id}>
                                        <TableCell className="font-medium">{comercial.nombre}</TableCell>
                                        <TableCell>{comercial.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="px-3">
                                                {comercial.tiendas_creadas}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={comercial.activo ? 'default' : 'destructive'}>
                                                {comercial.activo ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {comercial.ultimo_acceso
                                                ? new Date(comercial.ultimo_acceso).toLocaleDateString()
                                                : 'Nunca'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredComerciales.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No se encontraron agentes
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
