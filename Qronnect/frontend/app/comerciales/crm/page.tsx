'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Phone, Mail, MapPin, Plus, ArrowLeft, ArrowRight, Store, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Status Configuration
const STATUSES = {
    'nuevo': { label: 'Nuevo', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    'contactado': { label: 'Contactado', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'interesado': { label: 'Interesado', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    'negociacion': { label: 'En Negociación', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    'cierre': { label: 'Cierre Pendiente', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    'ganado': { label: 'Ganado', color: 'bg-green-100 text-green-800 border-green-200' },
    'perdido': { label: 'Perdido', color: 'bg-slate-100 text-slate-600 border-slate-200' }
};

export default function CRMDashboard() {
    const router = useRouter();
    const { toast } = useToast();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);

    // New Lead Form State
    const [formData, setFormData] = useState({
        nombre_negocio: '',
        nombre_contacto: '',
        telefono: '',
        email: '',
        direccion: '',
        valor_estimado: '',
        notas: ''
    });

    // Fetch Leads
    const fetchLeads = async () => {
        try {
            const token = localStorage.getItem('comercial_token');
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/prospectos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setLeads(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    // Create Handler
    const handleCreate = async () => {
        try {
            const token = localStorage.getItem('comercial_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/prospectos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast({ title: 'Prospecto creado', description: 'Se ha añadido al pipeline.' });
                setCreateOpen(false);
                setFormData({ nombre_negocio: '', nombre_contacto: '', telefono: '', email: '', direccion: '', valor_estimado: '', notas: '' });
                fetchLeads();
            } else {
                toast({ title: 'Error', variant: 'destructive' });
            }
        } catch (e) { console.error(e); }
    };

    // Update Status Handler
    const handleStatusChange = async (id: string, newStatus: string) => {
        if (newStatus === 'ganado') {
            // Logic for conversion usually handles this, but for now just update status
            // In v2 we can trigger the "Create Store" flow pre-filled
        }

        try {
            const token = localStorage.getItem('comercial_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/prospectos/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: newStatus })
            });

            if (res.ok) {
                toast({ title: 'Estado actualizado' });
                fetchLeads();
            }
        } catch (e) {
            toast({ title: 'Error al actualizar', variant: 'destructive' });
        }
    };

    const StatusColumn = ({ status, title }: { status: string, title: string }) => {
        const items = leads.filter(l => l.estado === status);
        const config = STATUSES[status as keyof typeof STATUSES];

        return (
            <div className="flex flex-col gap-3 min-w-[280px] bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl h-full border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${config.color.split(' ')[0]}`} />
                        <h3 className="font-semibold text-sm">{title}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
                    {items.map(lead => (
                        <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: lead.valor_estimado > 1000 ? '#22c55e' : 'transparent' }}>
                            <CardContent className="p-3 space-y-2">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm">{lead.nombre_negocio}</h4>
                                    {lead.valor_estimado && (
                                        <span className="text-xs font-mono text-green-600 bg-green-50 px-1 rounded">
                                            €{lead.valor_estimado}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">{lead.nombre_contacto}</p>

                                <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                                    {lead.telefono && <a href={`tel:${lead.telefono}`} className="hover:text-blue-500"><Phone className="h-3 w-3" /></a>}
                                    {lead.email && <a href={`mailto:${lead.email}`} className="hover:text-blue-500"><Mail className="h-3 w-3" /></a>}
                                </div>

                                <div className="pt-2 border-t mt-2 flex justify-between items-center">
                                    <select
                                        className="text-[10px] bg-transparent border rounded p-1"
                                        value={lead.estado}
                                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {Object.entries(STATUSES).map(([key, val]) => (
                                            <option key={key} value={key}>{val.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {items.length === 0 && (
                        <div className="text-center py-8 text-slate-300 text-xs border-2 border-dashed rounded-lg">
                            Vacío
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-8">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b px-6 py-4 sticky top-0 z-10">
                <div className="max-w-[1800px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/comerciales/dashboard')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Pipeline de Ventas
                            </h1>
                            <p className="text-xs text-muted-foreground">Gestiona tus prospectos y cierra ventas</p>
                        </div>
                    </div>
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Prospecto
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nuevo Prospecto</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Nombre Negocio</Label>
                                        <Input value={formData.nombre_negocio} onChange={e => setFormData({ ...formData, nombre_negocio: e.target.value })} placeholder="Ej. Bar Pepe" />
                                    </div>
                                    <div>
                                        <Label>Contacto</Label>
                                        <Input value={formData.nombre_contacto} onChange={e => setFormData({ ...formData, nombre_contacto: e.target.value })} placeholder="Pepe García" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Teléfono</Label>
                                        <Input value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} placeholder="+34..." />
                                    </div>
                                    <div>
                                        <Label>Email</Label>
                                        <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="pepe@bar.com" />
                                    </div>
                                </div>
                                <div>
                                    <Label>Valor Estimado (€)</Label>
                                    <Input type="number" value={formData.valor_estimado} onChange={e => setFormData({ ...formData, valor_estimado: e.target.value })} placeholder="Ej. 500" />
                                </div>
                                <div>
                                    <Label>Notas Iniciales</Label>
                                    <Input value={formData.notas} onChange={e => setFormData({ ...formData, notas: e.target.value })} placeholder="Interesado en Plan Business..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreate}>Guardar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Kanban Board */}
            <main className="max-w-[1800px] mx-auto p-6 overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="flex gap-4 min-w-[1200px] pb-4">
                        <StatusColumn status="nuevo" title="Nuevos" />
                        <StatusColumn status="contactado" title="Contactados" />
                        <StatusColumn status="interesado" title="Interesados" />
                        <StatusColumn status="negociacion" title="En Negociación" />
                        <StatusColumn status="cierre" title="Cierre" />
                        <StatusColumn status="ganado" title="Ganados" />
                        <StatusColumn status="perdido" title="Perdidos" />
                    </div>
                )}
            </main>
        </div>
    );
}
