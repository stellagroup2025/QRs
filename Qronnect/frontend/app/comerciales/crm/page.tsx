'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Phone, Mail, Plus, ArrowLeft, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
    'negociacion': { label: 'Negociación', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    'cierre': { label: 'Cierre', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    'ganado': { label: 'Ganado', color: 'bg-green-100 text-green-800 border-green-200' },
    'perdido': { label: 'Perdido', color: 'bg-slate-100 text-slate-600 border-slate-200' }
};

export default function CRMDashboard() {
    const router = useRouter();
    const { toast } = useToast();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');

    // Mobile View State
    const [mobileActiveStatus, setMobileActiveStatus] = useState('nuevo');

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

    // Filter Logic
    const filteredLeads = useMemo(() => {
        if (!searchQuery) return leads;
        const lower = searchQuery.toLowerCase();
        return leads.filter(l =>
            (l.nombre_negocio && l.nombre_negocio.toLowerCase().includes(lower)) ||
            (l.nombre_contacto && l.nombre_contacto.toLowerCase().includes(lower)) ||
            (l.telefono && l.telefono.includes(lower))
        );
    }, [leads, searchQuery]);

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
        <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0B0F19] pb-8 relative overflow-hidden flex flex-col">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-100/40 to-transparent dark:from-indigo-900/20 pointer-events-none" />
            <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-20 w-full border-b border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm px-4 lg:px-6 py-4 transition-all">
                <div className="max-w-[1920px] mx-auto flex flex-col gap-4">
                    {/* Top Row: Title, Gamification, Actions */}
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => router.push('/comerciales/dashboard')} className="hover:bg-black/5 dark:hover:bg-white/10 -ml-2">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl lg:text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent tracking-tight">
                                    CRM
                                </h1>
                                <p className="hidden lg:block text-xs font-medium text-muted-foreground uppercase tracking-widest">Avant-Garde Sales</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden md:block">
                                <SalesGamification streak={streak} monthlySales={stats.sales} monthlyGoal={stats.goal} />
                            </div>

                            {/* Search (Desktop) */}
                            <div className="hidden lg:flex items-center relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    className="pl-9 bg-white/50 border-slate-200 focus:bg-white transition-all rounded-full h-9"
                                    placeholder="Buscar leads..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button className="hidden lg:flex bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 transition-all font-bold h-9">
                                        <Plus className="h-4 w-4 mr-2" /> Nuevo
                                    </Button>
                                </DialogTrigger>
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
                    </div>

                    {/* Mobile Only: Search Bar & Gamification Compact */}
                    <div className="flex lg:hidden gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input
                                className="pl-9 bg-white/50 text-sm h-8 rounded-lg"
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 rounded-lg text-xs font-bold text-orange-600">
                            🔥 {streak}
                        </div>
                    </div>

                    {/* Mobile Only: Status Tabs (Sticky Scroller) */}
                    <div className="flex lg:hidden overflow-x-auto pb-1 gap-2 scrollbar-none -mx-4 px-4 mask-fade-sides">
                        {Object.entries(STATUSES).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setMobileActiveStatus(key)}
                                className={cn(
                                    "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                                    mobileActiveStatus === key
                                        ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                {config.label} <span className="opacity-60 ml-1">({filteredLeads.filter(l => l.estado === key).length})</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-[1920px] mx-auto p-4 lg:p-6 overflow-hidden h-full flex-1 relative z-0">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full" /></div>
                ) : (
                    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>

                        {/* Desktop View: Horizontal Scroll */}
                        <div className="hidden lg:flex gap-4 min-w-[1200px] h-full pb-8 overflow-x-auto">
                            {Object.entries(STATUSES).map(([statusKey, config]) => (
                                <DroppableColumn
                                    key={statusKey}
                                    id={statusKey}
                                    title={config.label}
                                    count={filteredLeads.filter(l => l.estado === statusKey).length}
                                    colorClass={config.color}
                                >
                                    {filteredLeads.filter(l => l.estado === statusKey).map(lead => (
                                        <DraggableCard key={lead.id} id={lead.id} className={activeId === lead.id ? 'opacity-30 scale-95' : ''}>
                                            <LeadCard lead={lead} onMagicClick={handleMagicClick} />
                                        </DraggableCard>
                                    ))}
                                </DroppableColumn>
                            ))}
                        </div>

                        {/* Mobile View: Single Column (Selected Tab) */}
                        <div className="lg:hidden h-full overflow-y-auto pb-20 space-y-3">
                            {filteredLeads.filter(l => l.estado === mobileActiveStatus).length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    No hay leads en esta etapa
                                </div>
                            ) : (
                                filteredLeads.filter(l => l.estado === mobileActiveStatus).map(lead => (
                                    <div key={lead.id} onClick={() => {
                                        // Swipe gesture mock or open actions
                                    }}>
                                        <LeadCard lead={lead} onMagicClick={handleMagicClick} />
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Mobile FAB (Floating Action Button) */}
                        <div className="fixed bottom-6 right-6 lg:hidden z-50">
                            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white p-0">
                                        <Plus className="h-6 w-6" />
                                    </Button>
                                </DialogTrigger>
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
