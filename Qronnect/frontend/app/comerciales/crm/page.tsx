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
        <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0B0F19] pb-8 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-100/40 to-transparent dark:from-indigo-900/20 pointer-events-none" />
            <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-10 w-full border-b border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm px-6 py-4 transition-all">
                <div className="max-w-[1920px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/comerciales/dashboard')} className="hover:bg-black/5 dark:hover:bg-white/10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent tracking-tight">
                                Qronnect CRM
                            </h1>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Avant-Garde Sales</p>
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <SalesGamification streak={streak} monthlySales={stats.sales} monthlyGoal={stats.goal} />
                    </div>

                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-500/20 transition-all font-bold">
                                <Plus className="h-4 w-4 mr-2" /> Nuevo
                            </Button>
                        </DialogTrigger>
                        {/* ... Dialog Content ... (Keep existing) */}
                        <DialogContent>
                            <DialogHeader><DialogTitle>Nuevo Prospecto</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
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

            <main className="max-w-[1920px] mx-auto p-6 overflow-x-auto h-[calc(100vh-80px)] relative z-0">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full" /></div>
                ) : (
                    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <div className="flex gap-4 min-w-[1200px] h-full pb-8">
                            {Object.entries(STATUSES).map(([statusKey, config]) => (
                                <DroppableColumn
                                    key={statusKey}
                                    id={statusKey}
                                    title={config.label}
                                    count={leads.filter(l => l.estado === statusKey).length}
                                    colorClass={config.color}
                                >
                                    {leads.filter(l => l.estado === statusKey).map(lead => (
                                        <DraggableCard key={lead.id} id={lead.id} className={activeId === lead.id ? 'opacity-30 scale-95' : ''}>
                                            <LeadCard lead={lead} onMagicClick={handleMagicClick} />
                                        </DraggableCard>
                                    ))}
                                </DroppableColumn>
                            ))}
                        </div>
                        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                            {activeLead ? (
                                <div className="rotate-3 scale-105 cursor-grabbing shadow-2xl">
                                    <LeadCard lead={activeLead} />
                                </div>
                            ) : null}
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
