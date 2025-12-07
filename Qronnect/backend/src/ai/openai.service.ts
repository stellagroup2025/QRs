import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { AiProvider } from './interfaces/ai-provider.interface';

@Injectable()
export class OpenAiService implements AiProvider {
    private readonly logger = new Logger(OpenAiService.name);
    private openai: OpenAI;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            this.logger.warn('⚠️ OPENAI_API_KEY not configured.');
        } else {
            this.openai = new OpenAI({ apiKey });
            this.logger.log('✅ OpenAiService initialized');
        }
    }

    private async callGpt(prompt: string, jsonMode = true): Promise<any> {
        if (!this.openai) throw new Error('OpenAI API Key missing');

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o', // Or gpt-3.5-turbo depending on budget/needs
                messages: [{ role: 'user', content: prompt }],
                response_format: jsonMode ? { type: 'json_object' } : undefined,
            });

            const content = response.choices[0].message.content;
            return jsonMode ? JSON.parse(content) : content;
        } catch (error) {
            this.logger.error('OpenAI Call Error:', error);
            throw error;
        }
    }

    async generateKpiAnalysis(params: any): Promise<any> {
        // Re-using the prompt logic from GeminiService would be ideal to avoid duplication,
        // but for now I will adapt it slightly for GPT.
        // Ideally, we extract Prompt Building to a Helper class.

        // For MVP, I'm verifying the plumbing works.
        // The prompts are embedded in GeminiService. I should essentially copy them here
        // or refactor prompts to a common location. 
        // Given the task, I will construct a similar prompt here.

        const prompt = `Act as a business analyst. Analyze these KPIs for a ${params.sector}:
    ${JSON.stringify(params.kpis)}
    Context: ${params.contexto || ''}
    
    Return JSON with { summary, highlights: [], recommendations: [{ text, actionable, type_action, context_action }] }`;

        return this.callGpt(prompt);
    }

    async generatePromoIdeas(params: any): Promise<any> {
        const prompt = `Generate 3 promo ideas for ${params.sector}. 
     Avg Ticket: ${params.ticketMedio}. Visits: ${params.frecuenciaVisitas}. Goal: ${params.objetivo}.
     Return JSON { ideas: [{ title, description, conditions, whatsapp_msg, poster_text, impact }] }`;
        return this.callGpt(prompt);
    }

    async generateEmailCampaignIdeas(params: any): Promise<any> {
        const prompt = `Create email campaign for ${params.sector}. Segment: ${params.segmentoDescripcion}.
    Return JSON { subjects: [], bodies: [{ variant, content, cta }], tips: [] }`;
        return this.callGpt(prompt);
    }

    async generatePlanAccion(params: any): Promise<any> {
        const prompt = `Create action plan for recommendation: "${params.recomendacion}".
    Return JSON { actions: [{ type, title, description, prefilled_data, priority }], explanation, impact_estimate }`;
        return this.callGpt(prompt);
    }

    async generarCampanaSMS(params: any): Promise<any> {
        const prompt = `Write SMS (max 160 chars) for ${params.objetivo}. Key msg: ${params.mensajeClave}.
    Context: ${params.contextoNegocio}.
    Return JSON { mensaje, sugerencias: [] }`;
        return this.callGpt(prompt);
    }

    // New methods for Report Service
    async analyzePromoImpact(promociones: any[], kpis: any, comparativa: any): Promise<any> {
        const prompt = `Analyze promo impact. Promos: ${JSON.stringify(promociones)}. KPIs: ${JSON.stringify(kpis)}. Comp: ${JSON.stringify(comparativa)}.
    Return JSON { resumen, impacto, recomendaciones }`;
        return this.callGpt(prompt);
    }

    async generateNextMonthPlan(tienda: any, kpis: any, analisisIA: any): Promise<any> {
        const prompt = `Create next month plan for ${tienda.nombre}. KPIs: ${JSON.stringify(kpis)}. Analysis: ${JSON.stringify(analisisIA)}.
    Return JSON { objetivos: [], acciones: [], kpis_monitorear: [] }`;
        return this.callGpt(prompt);
    }
}
