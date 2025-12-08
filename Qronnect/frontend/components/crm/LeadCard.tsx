import { Card, CardContent } from '@/components/ui/card';
import { Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LeadCardProps {
    lead: any;
    onClick?: () => void;
    onMagicClick?: (lead: any) => void;
}

export function LeadCard({ lead, onClick, onMagicClick }: LeadCardProps) {
    return (
        <Card
            onClick={onClick}
            className="group relative hover:shadow-md transition-all border-l-4 cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900 pr-8"
            style={{ borderLeftColor: lead.valor_estimado > 1000 ? '#22c55e' : 'transparent' }}
        >
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

                {/* Magic Button - Absolute positioned, visible on hover */}
                {onMagicClick && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50"
                                        onClick={(e) => { e.stopPropagation(); onMagicClick(lead); }}
                                    >
                                        <Sparkles className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Generar Magic Message</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
