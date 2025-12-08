'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

interface StatusChangeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string, notes: string) => void;
    oldStatus: string;
    newStatus: string;
}

const REASONS = [
    'No contesta',
    'Teléfono incorrecto',
    'Precio alto',
    'Ya tiene proveedor',
    'Pide más info',
    'Volver a llamar',
    'Visita agendada',
    'Cierre inminente',
    'No interesado'
];

export function StatusChangeDialog({ open, onOpenChange, onConfirm, oldStatus, newStatus }: StatusChangeDialogProps) {
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [notes, setNotes] = useState('');

    // Reset when opening
    useEffect(() => {
        if (open) {
            setSelectedReasons([]);
            setNotes('');
        }
    }, [open]);

    const toggleReason = (reason: string) => {
        if (selectedReasons.includes(reason)) {
            setSelectedReasons(prev => prev.filter(r => r !== reason));
        } else {
            setSelectedReasons(prev => [...prev, reason]);
        }
    };

    const handleConfirm = () => {
        const type = selectedReasons.join(', ');
        onConfirm(type, notes);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Motivo del Cambio</DialogTitle>
                    <DialogDescription>
                        ¿Por qué mueves este prospecto a <span className="font-bold capitalize">{newStatus.replace('_', ' ')}</span>?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Selecciona motivo(s):</Label>
                        <div className="flex flex-wrap gap-2">
                            {REASONS.map(reason => (
                                <Badge
                                    key={reason}
                                    variant={selectedReasons.includes(reason) ? "default" : "outline"}
                                    className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors py-1 px-3"
                                    onClick={() => toggleReason(reason)}
                                >
                                    {reason}
                                    {selectedReasons.includes(reason) && <Check className="ml-1 h-3 w-3" />}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Observaciones adicionales</Label>
                        <Textarea
                            placeholder="Añade detalles extra aquí..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleConfirm}>Guardar y Mover</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
