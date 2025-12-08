'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Phone, Mail, Plus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

import { DraggableCard } from '@/components/crm/DraggableCard';
import { DroppableColumn } from '@/components/crm/DroppableColumn';
import { PlaybookDialog } from '@/components/crm/PlaybookDialog';
import { LeadCard } from '@/components/crm/LeadCard';
import { MagicMessageDialog } from '@/components/crm/MagicMessageDialog';
import { SalesGamification } from '@/components/crm/SalesGamification';

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

    // Drag State
    const [activeId, setActiveId] = useState<string | null>(null);

    // Gamification State
    const [streak, setStreak] = useState(0);
    const [stats, setStats] = useState({ sales: 0, goal: 5000 });

    // Magic Message State
    const [magicOpen, setMagicOpen] = useState(false);
    const [selectedMagicLead, setSelectedMagicLead] = useState<any>(null);

    // Draggable Sensor Setup
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingChange, setPendingChange] = useState<{ id: string, oldStatus: string, newStatus: string } | null>(null);

    // New Lead Form State
    const [formData, setFormData] = useState({
        nombre_negocio: '', nombre_contacto: '', telefono: '', email: '', direccion: '', valor_estimado: '', notas: ''
    });

    // Magic Handler
    const handleMagicClick = (lead: any) => {
        setSelectedMagicLead(lead);
        setMagicOpen(true);
    };

    // Gamification Effects
    const triggerWinEffect = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    // Calculate initial stats
    useEffect(() => {
        if (leads.length > 0) {
            const wonLeads = leads.filter(l => l.estado === 'ganado');
            const totalValue = wonLeads.reduce((acc, curr) => acc + (parseFloat(curr.valor_estimado) || 0), 0);
            setStats(prev => ({ ...prev, sales: totalValue }));
        }
    }, [leads]);

    const fetchLeads = async () => {
        try {
            const token = localStorage.getItem('comercial_token');
            if (!token) return;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/prospectos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setLeads(await res.json());
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchLeads(); }, []);

    const handleCreate = async () => {
        try {
            const token = localStorage.getItem('comercial_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/prospectos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast({ title: 'Prospecto creado' });
                setCreateOpen(false);
                setFormData({ nombre_negocio: '', nombre_contacto: '', telefono: '', email: '', direccion: '', valor_estimado: '', notas: '' });
                fetchLeads();
            } else { toast({ title: 'Error', variant: 'destructive' }); }
        } catch (e) { console.error(e); }
    };

    const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        const leadId = active.id as string;
        const newStatus = over.id as string;
        const lead = leads.find(l => l.id === leadId);

        if (!lead || lead.estado === newStatus) return;

        setPendingChange({ id: leadId, oldStatus: lead.estado, newStatus: newStatus });
        setDialogOpen(true);
    };

    const handleConfirmChange = async (reason: string, notes: string) => {
        if (!pendingChange) return;
        const { id, newStatus } = pendingChange;

        // Optimistic Update
        setLeads(prev => prev.map(l => l.id === id ? { ...l, estado: newStatus } : l));
        setDialogOpen(false);

        // Gamification & Special Actions
        if (newStatus === 'ganado') {
            setStreak(prev => prev + 1);
            triggerWinEffect();
            const lead = leads.find(l => l.id === id);
            if (lead) {
                setStats(prev => ({ ...prev, sales: prev.sales + (parseFloat(lead.valor_estimado) || 0) }));
                // Delay redirect so they see the confetti
                setTimeout(() => {
                    const params = new URLSearchParams({
                        nombre: lead.nombre_negocio || '', contacto: lead.nombre_contacto || '',
                        email: lead.email || '', telefono: lead.telefono || '', direccion: lead.direccion || '', crm_id: lead.id
                    });
                    router.push(`/comerciales/tiendas/nueva?${params.toString()}`);
                }, 2000);
            }
        } else if (newStatus === 'perdido') {
            setStreak(0);
        }

        await updateLeadStatus(id, newStatus, reason, notes);
    };

    const updateLeadStatus = async (id: string, newStatus: string, reason: string, notes: string) => {
        try {
            const token = localStorage.getItem('comercial_token');
            const lead = leads.find(l => l.id === id);
            const timestamp = new Date().toLocaleString();
            const newEntry = `\n[${timestamp}] Cambio a ${newStatus.toUpperCase()}: ${reason}. ${notes}`;
            const updatedNotas = (lead?.notas || '') + newEntry;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/prospectos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ estado: newStatus, notas: updatedNotas })
            });
            if (!res.ok) fetchLeads(); // Revert on failure
        } catch (e) { fetchLeads(); }
    };

    const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-8">
            <header className="bg-white dark:bg-slate-900 border-b px-6 py-4 sticky top-0 z-10 w-full overflow-hidden shadow-sm">
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

                    <div className="hidden md:block">
                        <SalesGamification streak={streak} monthlySales={stats.sales} monthlyGoal={stats.goal} />
                    </div>

                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                                <Plus className="h-4 w-4 mr-2" /> Nuevo Lead
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Nuevo Prospecto</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                {/* Form Inputs (simplified for brevity) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Negocio</Label><Input value={formData.nombre_negocio} onChange={e => setFormData({ ...formData, nombre_negocio: e.target.value })} /></div>
                                    <div><Label>Contacto</Label><Input value={formData.nombre_contacto} onChange={e => setFormData({ ...formData, nombre_contacto: e.target.value })} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Teléfono</Label><Input value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} /></div>
                                    <div><Label>Email</Label><Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                                </div>
                                <div><Label>Valor (€)</Label><Input type="number" value={formData.valor_estimado} onChange={e => setFormData({ ...formData, valor_estimado: e.target.value })} /></div>
                                <div><Label>Notas</Label><Input value={formData.notas} onChange={e => setFormData({ ...formData, notas: e.target.value })} /></div>
                            </div>
                            <DialogFooter><Button onClick={handleCreate}>Guardar</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            <main className="max-w-[1800px] mx-auto p-6 overflow-x-auto h-[calc(100vh-80px)]">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
                ) : (
                    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                                        <DraggableCard key={lead.id} id={lead.id} className={activeId === lead.id ? 'opacity-30' : ''}>
                                            <LeadCard lead={lead} onMagicClick={handleMagicClick} />
                                        </DraggableCard>
                                    ))}
                                </DroppableColumn>
                            ))}
                        </div>
                        <DragOverlay>
                            {activeLead ? <LeadCard lead={activeLead} /> : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </main>

            <PlaybookDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onConfirm={handleConfirmChange}
                oldStatus={pendingChange?.oldStatus || ''}
                newStatus={pendingChange?.newStatus || ''}
            />

            <MagicMessageDialog
                open={magicOpen}
                onOpenChange={setMagicOpen}
                lead={selectedMagicLead}
            />
        </div>
    );
}
