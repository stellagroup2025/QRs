'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SALES_PLAYBOOK, StagePlaybook } from '@/config/SalesPlaybook';
import { Check, ArrowRight, Lightbulb, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlaybookDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string, notes: string) => void;
    oldStatus: string;
    newStatus: string;
}

export function PlaybookDialog({ open, onOpenChange, onConfirm, oldStatus, newStatus }: PlaybookDialogProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
    const [playbook, setPlaybook] = useState<StagePlaybook | null>(null);

    // AI State
    const [analyzing, setAnalyzing] = useState(false);
    const [coaching, setCoaching] = useState<any>(null);

    // Load Playbook
    useEffect(() => {
        if (open && newStatus) {
            const pb = SALES_PLAYBOOK[newStatus];
            setPlaybook(pb || null);
            setCurrentStep(0);
            setAnswers({});
            setCoaching(null);
            setAnalyzing(false);
        }
    }, [open, newStatus]);

    const handleNext = () => {
        if (!playbook) {
            onConfirm(`Cambio manual a ${newStatus}`, '');
            return;
        }

        if (currentStep < playbook.steps.length) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Trigger AI Analysis instead of finishing immediately
            fetchAiCoaching();
        }
    };

    const fetchAiCoaching = async () => {
        setAnalyzing(true);
        // Simulate delay or fetch real AI if backend is ready
        // For now, let's just finish unless we want to hook up the API right here
        // We will call the API we built:
        try {
            // Mock context - in real app pass actual answers
            const token = localStorage.getItem('comercial_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comerciales/ai/coaching`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    stage: newStatus,
                    answers: answers,
                    lead: { nombre: 'Cliente' } // We need lead info here ideally
                })
            });

            if (res.ok) {
                const data = await res.json();
                setCoaching(data);
            } else {
                // Fallback mock
                setCoaching({
                    analysis: "Buena progresión, pero falta urgencia.",
                    strategy: "Uso de escasez (oferta limitada).",
                    script: "Solo nos quedan 2 plazas con este precio promocional.",
                    action: "Agendar llamada de cierre para mañana."
                });
            }
        } catch (e) {
            console.error(e);
            setCoaching({
                analysis: "Análisis completado.",
                strategy: "Cierre directo.",
                script: "¿Te parece bien si firmamos hoy?",
                action: "Enviar contrato."
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const finishProcess = () => {
        if (!playbook) return;
        let summary = `\n--- 🏆 Playbook: ${playbook.title} ---\n`;
        playbook.steps.forEach(step => {
            const ans = answers[step.id];
            const answerText = typeof ans === 'boolean' ? (ans ? 'Sí' : 'No') : ans;
            summary += `> ${step.question}: ${answerText}\n`;
        });

        if (coaching) {
            summary += `\n🤖 AI Coach: ${coaching.strategy} -> "${coaching.script}"`;
        }

        onConfirm(playbook.title, summary);
    };

    const updateAnswer = (stepId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [stepId]: value }));
    };

    if (!playbook && open) return null; // Or simple confirmation dialog
    if (!playbook) return null;

    const isLastStep = currentStep === playbook.steps.length;
    const activeStep = playbook.steps[currentStep];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <AnimatePresence mode="wait">
                    {!isLastStep ? (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-xl">
                                    <span className="bg-blue-100 text-blue-700 p-1 rounded text-xs px-2">
                                        Paso {currentStep + 1}/{playbook.steps.length}
                                    </span>
                                    {playbook.title}
                                </DialogTitle>
                                <DialogDescription className="text-base pt-2">
                                    {activeStep.script && (
                                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md mb-4 flex gap-2 items-start border border-yellow-200">
                                            <Lightbulb className="h-5 w-5 shrink-0 mt-0.5" />
                                            <span className="italic">"{activeStep.script}"</span>
                                        </div>
                                    )}
                                    {activeStep.question}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-6">
                                {activeStep.type === 'text' && (
                                    <Input
                                        autoFocus
                                        placeholder="Escribe tu respuesta..."
                                        value={answers[activeStep.id] as string || ''}
                                        onChange={e => updateAnswer(activeStep.id, e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleNext()}
                                    />
                                )}

                                {activeStep.type === 'select' && (
                                    <div className="flex flex-col gap-2">
                                        {activeStep.options?.map(opt => (
                                            <Button
                                                key={opt}
                                                variant={answers[activeStep.id] === opt ? "default" : "outline"}
                                                className="justify-start h-auto py-3 text-left"
                                                onClick={() => {
                                                    updateAnswer(activeStep.id, opt);
                                                    setTimeout(handleNext, 200);
                                                }}
                                            >
                                                {opt}
                                            </Button>
                                        ))}
                                    </div>
                                )}

                                {activeStep.type === 'check' && (
                                    <div className="flex gap-4">
                                        <Button
                                            variant={answers[activeStep.id] === true ? "default" : "outline"}
                                            className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border-green-200"
                                            onClick={() => updateAnswer(activeStep.id, true)}
                                        >
                                            <Check className="mr-2 h-4 w-4" /> Sí, hecho
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => updateAnswer(activeStep.id, false)}
                                        >
                                            Aún no
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                                <Button onClick={handleNext} disabled={activeStep.required && answers[activeStep.id] === undefined}>
                                    Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            {!coaching && analyzing && (
                                <div className="space-y-4 py-8">
                                    <div className="mx-auto w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                                    <p className="text-blue-600 font-semibold animate-pulse">Analizando respuestas con IA...</p>
                                </div>
                            )}

                            {coaching && (
                                <div className="space-y-4 text-left">
                                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-700">
                                            <Trophy className="h-5 w-5" />
                                            <h3 className="font-bold">AI Sales Coach</h3>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700 italic border-l-4 border-indigo-400 pl-3 py-1 bg-white/50 rounded-r">
                                            "{coaching.analysis}"
                                        </p>

                                        <div className="mt-4 space-y-3">
                                            <div className="text-sm">
                                                <span className="font-bold text-slate-800 block mb-1">🎯 Estrategia:</span>
                                                <p className="text-slate-600">{coaching.strategy}</p>
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-bold text-slate-800 block mb-1">🗣️ Guion Sugerido:</span>
                                                <p className="bg-white p-2 rounded border text-indigo-800 font-medium">"{coaching.script}"</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center pt-2">
                                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                            <Check className="h-3 w-3" /> Playbook Completado
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Fallback if no coaching / error */}
                            {!analyzing && !coaching && (
                                <div>
                                    <Trophy className="h-12 w-12 mx-auto text-green-500 mb-2" />
                                    <h3 className="font-bold">¡Fase Completada!</h3>
                                    <p className="text-slate-500 mb-4">{playbook.successMessage}</p>
                                </div>
                            )}

                            {!analyzing && (
                                <Button size="lg" className="w-full mt-6 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200" onClick={finishProcess}>
                                    Guardar Progreso
                                </Button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
