export interface PlaybookStep {
    id: string;
    question: string;
    type: 'check' | 'text' | 'select';
    options?: string[];
    script?: string; // Guion o "Tip" de venta
    required: boolean;
}

export interface StagePlaybook {
    targetStatus: string;
    title: string;
    description: string;
    steps: PlaybookStep[];
    successMessage: string;
}

export const SALES_PLAYBOOK: Record<string, StagePlaybook> = {
    'contactado': {
        targetStatus: 'contactado',
        title: 'Primer Contacto Efectivo',
        description: 'El objetivo es validar interés y cualificar rápidamente.',
        successMessage: '¡Bien hecho! Un lead contactado vale por dos.',
        steps: [
            {
                id: 'channel',
                question: '¿Por qué canal has contactado?',
                type: 'select',
                options: ['Llamada', 'Whatsapp', 'Email', 'Visita Presencial'],
                required: true
            },
            {
                id: 'decision_maker',
                question: '¿Has hablado con el Tomador de Decisiones?',
                type: 'check',
                script: 'Tip: Si no es el dueño, pregunta: "¿Quién toma las decisiones de marketing aquí?"',
                required: false
            },
            {
                id: 'interest_level',
                question: 'Nivel inicial de interés (1-5)',
                type: 'select',
                options: ['1 - Frío', '2 - Tibio', '3 - Curioso', '4 - Interesado', '5 - Caliente'],
                required: true
            }
        ]
    },
    'interesado': {
        targetStatus: 'interesado',
        title: 'Despertando el Deseo',
        description: 'Aquí debemos conectar su dolor con nuestra solución.',
        successMessage: '¡Genial! Has plantado la semilla.',
        steps: [
            {
                id: 'pain_point',
                question: '¿Cuál es su principal dolor?',
                type: 'text',
                script: 'Ej: "Pierde clientes", "Quiere modernizarse", "La competencia tiene app"',
                required: true
            },
            {
                id: 'demo_shown',
                question: '¿Le has enseñado una Demo o Video?',
                type: 'check',
                required: true
            }
        ]
    },
    'negociacion': {
        targetStatus: 'negociacion',
        title: 'El Arte de Negociar',
        description: 'Validar presupuesto y condiciones para el cierre.',
        successMessage: '¡Estamos cerca! Mantén la tensión de compra.',
        steps: [
            {
                id: 'budget_fit',
                question: '¿El precio encaja en su presupuesto?',
                type: 'select',
                options: ['Sí', 'Tiene dudas', 'Pide descuento', 'No lo sé aún'],
                required: true
            },
            {
                id: 'objections',
                question: '¿Qué objeción principal ha puesto?',
                type: 'text',
                script: 'Anticípate: Si es precio, vende valor (ROI). Si es tiempo, vende facilidad.',
                required: false
            }
        ]
    },
    'cierre': {
        targetStatus: 'cierre',
        title: 'Cierre Inminente',
        description: 'Preparando el terreno para la firma.',
        successMessage: '¡Casi lo tienes! No lo dejes enfriar.',
        steps: [
            {
                id: 'verbal_agreement',
                question: '¿Tienes un "Sí" verbal?',
                type: 'check',
                required: true
            },
            {
                id: 'closing_date',
                question: '¿Cuándo se espera la firma/pago?',
                type: 'select',
                options: ['Hoy', 'Mañana', 'Esta semana', 'Próxima semana'],
                required: true
            }
        ]
    },
    'ganado': {
        targetStatus: 'ganado',
        title: '¡Victoria! 🎉',
        description: 'Transformando prospecto en cliente.',
        successMessage: '¡ENHORABUENA! Eres un crack.',
        steps: [
            {
                id: 'store_name',
                question: 'Confirmar Nombre Definitivo del Negocio',
                type: 'text',
                required: true
            },
            {
                id: 'payment_verified',
                question: '¿Pago/Alta verificada?',
                type: 'check',
                required: true
            }
        ]
    },
    'perdido': {
        targetStatus: 'perdido',
        title: 'Aprendizaje (Post-Mortem)',
        description: 'Entender por qué para mejorar la próxima vez.',
        successMessage: 'Ánimo, el siguiente caerá.',
        steps: [
            {
                id: 'loss_reason',
                question: 'Motivo principal de la pérdida',
                type: 'select',
                options: ['Precio', 'Competencia', 'No lo necesita', 'Mala cualificación', 'No contesta'],
                required: true
            },
            {
                id: 'competitor',
                question: '¿Con quién se ha ido? (Si aplica)',
                type: 'text',
                required: false
            }
        ]
    }
};
