import { Card, CardContent } from '@/components/ui/card';
import { Phone, Sparkles, MessageCircle, Clock, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LeadCardProps {
    lead: any;
    onClick?: () => void;
    onMagicClick?: (lead: any) => void;
}

export function LeadCard({ lead, onClick, onMagicClick }: LeadCardProps) {
    // Stale logic: If last update was > 3 days ago (mocking with created_at if updated_at missing)
    const lastActivity = new Date(lead.updated_at || lead.creado_en);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 3600 * 24));
    const isStale = diffDays > 3;

    return (
        <Card
            onClick={onClick}
            className={cn(
                "group relative transition-all duration-300 cursor-grab active:cursor-grabbing",
                "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-0 shadow-sm hover:shadow-xl hover:-translate-y-1",
                isStale ? "ring-1 ring-red-400 dark:ring-red-900" : "hover:ring-1 hover:ring-indigo-200 dark:hover:ring-indigo-800"
            )}
        >
            {/* Status Strip / Stale Indicator */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-colors",
                isStale ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" :
                    lead.valor_estimado > 1000 ? "bg-gradient-to-b from-green-400 to-emerald-600" : "bg-slate-200 dark:bg-slate-700"
            )} />

            <CardContent className="p-4 pl-5 space-y-3">
                {/* Header: Name & Value */}
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 select-none leading-tight">
                            {lead.nombre_negocio}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 select-none">
                            {lead.nombre_contacto}
                        </p>
                    </div>
                    {lead.valor_estimado && (
                        <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200 font-mono text-[10px] px-1.5 py-0 h-5">
                            €{lead.valor_estimado.toLocaleString()}
                        </Badge>
                    )}
                </div>

                {/* Stale Warning */}
                {isStale && (
                    <div className="flex items-center gap-1 text-[10px] text-red-500 font-medium animate-pulse">
                        <Clock className="h-3 w-3" />
                        <span>Sin actividad {diffDays} días</span>
                    </div>
                )}

                {/* Footer: Contact & Actions */}
                <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {lead.telefono ? (
                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                                <Phone className="h-3 w-3" /> {lead.telefono}
                            </span>
                        ) : (
                            <span className="opacity-50 text-[10px]">Sin teléfono</span>
                        )}
                    </div>

                    {/* Quick Actions (Visible on Hover) */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-x-2 group-hover:translate-x-0">
                        {/* Call */}
                        {lead.telefono && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full hover:bg-green-100 hover:text-green-600"
                                onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.telefono}`, '_self'); }}
                            >
                                <Phone className="h-3.5 w-3.5" />
                            </Button>
                        )}

                        {/* WhatsApp (Direct) */}
                        {lead.telefono && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full hover:bg-green-100 hover:text-green-600"
                                onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.telefono}`, '_blank'); }}
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                            </Button>
                        )}

                        {/* Magic Message */}
                        {onMagicClick && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700 hover:shadow-sm"
                                            onClick={(e) => { e.stopPropagation(); onMagicClick(lead); }}
                                        >
                                            <Sparkles className="h-3.5 w-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">Magic Message</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        {/* Voice Note (Mock) */}
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full hover:bg-red-50 hover:text-red-500"
                            onClick={(e) => { e.stopPropagation(); alert('Voice recording coming soon!'); }}
                        >
                            <Mic className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
