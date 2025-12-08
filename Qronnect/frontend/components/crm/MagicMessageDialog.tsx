import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Copy, Send, RefreshCw, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface MagicMessageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: any;
}

export function MagicMessageDialog({ open, onOpenChange, lead }: MagicMessageDialogProps) {
    const { toast } = useToast();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [channel, setChannel] = useState<'WhatsApp' | 'Email'>('WhatsApp');

    useEffect(() => {
        if (open && lead) {
            generateMessage();
        }
    }, [open, lead]); // Auto-generate on open

    const generateMessage = async () => {
        if (!lead) return;
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('comercial_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/ai/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    channel,
                    currentStatus: lead.estado,
                    targetStatus: 'Next Step', // Implicit goal
                    leadName: lead.nombre_contacto,
                    businessName: lead.nombre_negocio,
                    painPoint: lead.notas, // Using notes as context for now
                    tone: 'Persuasivo y directo'
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessage(data.message);
            } else {
                setMessage('Error generando el mensaje. Intenta de nuevo.');
            }
        } catch (e) {
            console.error(e);
            setMessage('Error de conexión.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message);
        toast({ title: 'Copiado', description: 'Mensaje listo para pegar.' });
    };

    const openWhatsApp = () => {
        if (!lead?.telefono) {
            toast({ title: 'Error', description: 'El lead no tiene teléfono.', variant: 'destructive' });
            return;
        }
        const text = encodeURIComponent(message);
        window.open(`https://wa.me/${lead.telefono}?text=${text}`, '_blank');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-indigo-600">
                        <Sparkles className="h-5 w-5" />
                        Neuro-Template Generator
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Channel Selector */}
                    <div className="flex gap-2 justify-center">
                        <Button
                            variant={channel === 'WhatsApp' ? 'default' : 'outline'}
                            onClick={() => { setChannel('WhatsApp'); if (message) generateMessage(); }}
                            size="sm"
                            className="w-1/2"
                        >
                            <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                        </Button>
                        {/* Email disabled for now or can be enabled */}
                        <Button
                            variant={channel === 'Email' ? 'default' : 'outline'}
                            onClick={() => { setChannel('Email'); if (message) generateMessage(); }}
                            size="sm"
                            className="w-1/2"
                        >
                            <Send className="h-4 w-4 mr-2" /> Email
                        </Button>
                    </div>

                    {/* Content Area */}
                    <div className="relative min-h-[200px] bg-slate-50 rounded-lg border p-4">
                        {loading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                                <RefreshCw className="h-8 w-8 animate-spin mb-2 text-indigo-500" />
                                <span className="text-sm animate-pulse">Redactando con PNL...</span>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Textarea
                                    className="min-h-[180px] border-0 bg-transparent resize-none focus-visible:ring-0 text-slate-700 leading-relaxed"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </motion.div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={generateMessage} disabled={loading}>
                        <RefreshCw className="h-4 w-4 mr-2" /> Regenerar
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button className="flex-1 bg-slate-800 hover:bg-slate-900" onClick={copyToClipboard} disabled={!message || loading}>
                            <Copy className="h-4 w-4 mr-2" /> Copiar
                        </Button>
                        {channel === 'WhatsApp' && (
                            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={openWhatsApp} disabled={!message || loading}>
                                <Send className="h-4 w-4 mr-2" /> Abrir WA
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
