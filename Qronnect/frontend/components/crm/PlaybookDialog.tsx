'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Check, ArrowRight, Lightbulb, Trophy } from 'lucide-react';
import { SALES_PLAYBOOK, StagePlaybook, PlaybookStep } from '@/config/SalesPlaybook';
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

    // Load Playbook for the target status
    useEffect(() => {
        if (open && newStatus) {
            const pb = SALES_PLAYBOOK[newStatus];
            if (pb) {
                setPlaybook(pb);
                setCurrentStep(0);
                setAnswers({});
            } else {
                // Should not happen if all statuses covered, but fallback:
                setPlaybook(null);
            }
        }
    }, [open, newStatus]);

    // Handle "Next" or "Finish"
    const handleNext = () => {
        if (!playbook) {
            // Fallback for simple status change if no playbook defined
            onConfirm(`Cambio manual a ${newStatus}`, '');
            return;
        }

        if (currentStep < playbook.steps.length) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Finish
            finishProcess();
        }
    };

    const finishProcess = () => {
        if (!playbook) return;

        // Compile Summary
        let summary = `\n--- 🏆 Playbook: ${playbook.title} ---\n`;
        playbook.steps.forEach(step => {
            const ans = answers[step.id];
            const answerText = typeof ans === 'boolean' ? (ans ? 'Sí' : 'No') : ans;
            summary += `> ${step.question}: ${answerText}\n`;
        });

        onConfirm(playbook.title, summary);
    };

    const updateAnswer = (stepId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [stepId]: value }));
    };

    // If no playbook, simple view (or just redirect)
    if (!playbook && open) {
        // Ideally we would have playbooks for all, if not, render simple view (previous dialog)
        // For now, let's assume we defined all or fallback to a generic message
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Cambio</DialogTitle>
                        <DialogDescription>¿Mover a {newStatus}?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => onConfirm('Manual', '')}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

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
                                                    setTimeout(handleNext, 200); // Auto advance
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
                                            className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                                            data-state={answers[activeStep.id] === true ? 'active' : 'inactive'}
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
                            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <Trophy className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Fase Completada!</h3>
                            <p className="text-slate-500 mb-6">{playbook.successMessage}</p>

                            <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={finishProcess}>
                                Guardar Progreso
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
