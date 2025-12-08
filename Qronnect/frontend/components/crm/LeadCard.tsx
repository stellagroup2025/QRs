import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeadCardProps {
    lead: any;
    onClick?: () => void;
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
    return (
        <Card
            onClick={onClick}
            className="hover:shadow-md transition-all border-l-4 cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900"
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
            </CardContent>
        </Card>
    );
}
