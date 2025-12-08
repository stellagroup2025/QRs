'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Phone, Mail, Plus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { DraggableCard } from '@/components/crm/DraggableCard';
import { DroppableColumn } from '@/components/crm/DroppableColumn';
import { StatusChangeDialog } from '@/components/crm/StatusChangeDialog';

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

    // Draggable Sensor Setup (Pointer for mouse, Touch for mobile)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingChange, setPendingChange] = useState<{ id: string, oldStatus: string, newStatus: string } | null>(null);

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

    // Drag Handler
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const leadId = active.id as string;
        const newStatus = over.id as string;
        const lead = leads.find(l => l.id === leadId);

        if (!lead || lead.estado === newStatus) return;

        // Open dialog to confirm
        setPendingChange({
            id: leadId,
            oldStatus: lead.estado,
            newStatus: newStatus
        });
        setDialogOpen(true);
    };

    // Confirm Change Handler
    const handleConfirmChange = async (reason: string, notes: string) => {
        if (!pendingChange) return;

        const { id, newStatus } = pendingChange;

        // Optimistic UI update
        const oldState = [...leads];
        setLeads(prev => prev.map(l => l.id === id ? { ...l, estado: newStatus } : l));
        setDialogOpen(false);

        // Special case: Ganado -> Redirect to Store Creation
        if (newStatus === 'ganado') {
            const lead = leads.find(l => l.id === id);
            if (lead) {
                const params = new URLSearchParams({
                    nombre: lead.nombre_negocio || '',
                    contacto: lead.nombre_contacto || '',
                    email: lead.email || '',
                    telefono: lead.telefono || '',
                    direccion: lead.direccion || '',
                    crm_id: lead.id
                });
                router.push(`/comerciales/tiendas/nueva?${params.toString()}`);
                // Background update
                updateLeadStatus(id, newStatus, reason, notes);
                return;
            }
        }

        // Standard update
        await updateLeadStatus(id, newStatus, reason, notes);
    };

    const updateLeadStatus = async (id: string, newStatus: string, reason: string, notes: string) => {
        try {
            const token = localStorage.getItem('comercial_token');
            const lead = leads.find(l => l.id === id);

            // Append note history
            const timestamp = new Date().toLocaleString();
            const newEntry = `\n[${timestamp}] Cambio a ${newStatus.toUpperCase()}: ${reason}. ${notes}`;
            const updatedNotas = (lead?.notas || '') + newEntry;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/prospectos/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    estado: newStatus,
                    notas: updatedNotas
                })
            });

            if (!res.ok) {
                // Revert optimistic
                toast({ title: 'Error al actualizar', variant: 'destructive' });
                fetchLeads(); // Force refresh
            } else {
                toast({ title: 'Estado actualizado' });
            }
        } catch (e) {
            fetchLeads();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-8">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b px-6 py-4 sticky top-0 z-10 w-full overflow-hidden">
                <div className="max-w-[1800px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/comerciales/dashboard')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Pipeline de Ventas
                            </h1>
                            <p className="text-xs text-muted-foreground">Gestiona tus prospectos</p>
                        </div>
                    </div>
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo
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
            <main className="max-w-[1800px] mx-auto p-6 overflow-x-auto h-[calc(100vh-80px)]">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                        <div className="flex gap-4 min-w-[1200px] pb-4 h-full">
                            {Object.entries(STATUSES).map(([statusKey, config]) => (
                                <DroppableColumn
                                    key={statusKey}
                                    id={statusKey}
                                    title={config.label}
                                    count={leads.filter(l => l.estado === statusKey).length}
                                    colorClass={config.color}
                                >
                                    {leads.filter(l => l.estado === statusKey).map(lead => (
                                        <DraggableCard key={lead.id} id={lead.id}>
                                            <Card className="hover:shadow-md transition-all border-l-4 cursor-grab active:cursor-grabbing" style={{ borderLeftColor: lead.valor_estimado > 1000 ? '#22c55e' : 'transparent' }}>
                                                <CardContent className="p-3 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-sm select-none">{lead.nombre_negocio}</h4>
                                                        {lead.valor_estimado && (
                                                            <span className="text-xs font-mono text-green-600 bg-green-50 px-1 rounded">
                                                                €{lead.valor_estimado}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground select-none">{lead.nombre_contacto}</p>
                                                    <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                                                        {lead.telefono && <div className="flex items-center"><Phone className="h-3 w-3 mr-1" />{lead.telefono}</div>}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </DraggableCard>
                                    ))}
                                </DroppableColumn>
                            ))}
                        </div>
                    </DndContext>
                )}
            </main>

            <StatusChangeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onConfirm={handleConfirmChange}
                oldStatus={pendingChange?.oldStatus || ''}
                newStatus={pendingChange?.newStatus || ''}
            />
        </div>
    );
}
