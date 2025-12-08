import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseService } from '../supabase/supabase.service';
import { AiProvider } from './interfaces/ai-provider.interface';

/**
 * Servicio para integración con Google Gemini AI
 */
@Injectable()
export class GeminiService implements AiProvider {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 2000;

  constructor(private readonly supabase: SupabaseService) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      this.logger.warn('⚠️  GEMINI_API_KEY not configured. AI features will be disabled.');
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      this.logger.log('✅ Google Gemini AI service initialized with model: gemini-2.0-flash');
    }
  }

  private async callGeminiWithRetry(prompt: string, context: string): Promise<any> {
    if (!this.model) throw new Error('Gemini AI not configured');

    let lastError: Error;
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = result.response;
        return response.text();
      } catch (error) {
        lastError = error;
        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
          const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  async generateKpiAnalysis(params: any): Promise<any> {
    if (!this.model) throw new Error('Gemini AI not configured');

    const prompt = `Eres un analista de negocio experto. Analiza estos KPIs:
    ${JSON.stringify(params.kpis)}
    Contexto: ${params.contexto || ''}
    
    Genera respuesta JSON con { summary, highlights: [], recommendations: [] }`;

    try {
      const text = await this.callGeminiWithRetry(prompt, 'KPI_ANALYSIS');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text, highlights: [], recommendations: [] };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async generatePromoIdeas(params: any): Promise<any> {
    if (!this.model) throw new Error('Gemini AI not configured');
    const prompt = `Ideas de promociones para ${params.sector}. 
     Ticket: ${params.ticketMedio}. Visitas: ${params.frecuenciaVisitas}. Objetivo: ${params.objetivo}.
     JSON: { ideas: [{ titulo, descripcion, condiciones, mensajeWhatsApp, textoCartel, estimadoImpacto }] }`;

    try {
      const text = await this.callGeminiWithRetry(prompt, 'PROMO_IDEAS');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { ideas: [] };
    } catch (e) { throw e; }
  }

  async generateEmailCampaignIdeas(params: any): Promise<any> {
    if (!this.model) throw new Error('Gemini AI not configured');
    const prompt = `Campaña email para ${params.sector}. Segmento: ${params.segmentoDescripcion}.
    Objetivo: ${params.objetivo}.
    JSON: { asuntos: [], cuerpos: [{ variante, contenido, cta }], consejos: [] }`;

    try {
      const text = await this.callGeminiWithRetry(prompt, 'EMAIL_CAMPAIGN');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { asuntos: [], cuerpos: [], consejos: [] };
    } catch (e) { throw e; }
  }

  async generatePlanAccion(params: any): Promise<any> {
    if (!this.model) throw new Error('Gemini AI not configured');
    const prompt = `Plan acción para recomendación: "${params.recomendacion}".
    JSON: { acciones: [{ tipo, titulo, descripcion, datos_prellenados, prioridad }], explicacion, impacto_estimado }`;

    try {
      const text = await this.callGeminiWithRetry(prompt, 'PLAN_ACCION');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { acciones: [], explicacion: '', impacto_estimado: '' };
    } catch (e) { throw e; }
  }

  async generarCampanaSMS(params: any): Promise<any> {
    if (!this.model) throw new Error('Gemini AI not configured');
    const prompt = `SMS MAX 160 chars.
    Negocio: ${params.contextoNegocio}
    Objetivo: ${params.objetivo}
    Mensaje Clave: ${params.mensajeClave}
    Tono: ${params.tono}
    
    JSON: { mensaje, sugerencias: [] }`;

    try {
      const text = await this.callGeminiWithRetry(prompt, 'SMS_CAMPAIGN');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const mensaje = parsed.mensaje || '';
        return {
          mensaje,
          caracteres: mensaje.length,
          numSMS: Math.ceil(mensaje.length / 160) || 1,
          sugerencias: parsed.sugerencias || []
        };
      }
      return { mensaje: '', caracteres: 0, numSMS: 0, sugerencias: [] };
    } catch (e) { throw e; }
  }

  // --- New Methods for Report Analysis ---

  async analyzePromoImpact(promociones: any[], kpis: any, comparativa: any): Promise<any> {
    if (!this.model) throw new Error('Gemini AI not configured');

    const prompt = `Analiza el impacto de estas promociones en un negocio:
PROMOCIONES: ${JSON.stringify(promociones)}
KPIs: ${JSON.stringify(kpis)}
COMPARATIVA: ${JSON.stringify(comparativa)}

Devuelve JSON:
{
  "resumen": "Análisis del impacto...",
  "impacto": "positivo" | "neutral" | "negativo",
  "recomendaciones": ["Recomendación 1", "Recomendación 2"]
}`;

    try {
      const text = await this.callGeminiWithRetry(prompt, 'ANALISIS_PROMOCIONES');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { resumen: text, impacto: 'neutral' };
    } catch (error) {
      this.logger.error('[INFORME] Error analizando promociones:', error);
      return { resumen: 'Error analizando impacto', impacto: 'neutral' };
    }
  }

  async generateNextMonthPlan(tienda: any, kpis: any, analisisIA: any): Promise<any> {
    if (!this.model) throw new Error('Gemini AI not configured');

    const prompt = `Plan acción próximo mes para ${tienda.nombre}.
     KPIs: ${JSON.stringify(kpis)}
     Análisis Previo: ${JSON.stringify(analisisIA)}
     
     Formato JSON:
     {
       "objetivos": [{ "objetivo": "...", "metrica": "...", "valor_objetivo": 0 }],
       "acciones": [{ "accion": "...", "prioridad": "...", "implementable_sistema": true, "tipo": "..." }],
       "kpis_monitorear": []
     }`;

    try {
      const text = await this.callGeminiWithRetry(prompt, 'PLAN_SIGUIENTE_MES');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { objetivos: [] };
    } catch (error) {
      this.logger.error('[INFORME] Error generando plan:', error);
      return { objetivos: [], kpis_monitorear: [] };
    }
  }

  // --- SALES INNOVATION METHODS ---

  async generateSalesCoaching(context: any): Promise<any> {
    if (!this.model) throw new Error('Gemini AI not configured');

    const prompt = `Actúa como el mejor Coach de Ventas del mundo (estilo Jordan Belfort pero ético).
    Analiza la situación de este prospecto y dame una estrategia de CIERRE inmediata.
    
    Estado Actual: ${context.stage}
    Respuestas del Playbook: ${JSON.stringify(context.answers)}
    Info Prospecto: ${JSON.stringify(context.lead)}
    
    Genera un JSON con:
    {
      "analysis": "Breve análisis de la situación (1 frase)",
      "strategy": "La estrategia psicológica a usar",
      "script": "Un guion exacto de 1-2 frases para decir AHORA MISMO",
      "action": "La siguiente acción física recomendada"
    }
    Mantenlo corto, directo y energizante.`;

    try {
      const text = await this.callGeminiWithRetry(prompt, 'SALES_COACHING');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { strategy: 'No se pudo generar estrategia', script: '' };
    } catch (error) {
      this.logger.error('Error generating sales coaching:', error);
      return { strategy: 'Error de conexión', script: '' };
    }
  }

  async generateNeuroMessage(context: any): Promise<any> {
    if (!this.model) throw new Error('Gemini AI not configured');

    const prompt = `Eres experto en Copywriting y PNL (Programación Neuro-Lingüística).
    Genera un mensaje de ${context.channel} (WhatsApp/Email) para este prospecto.
    Objetivo: Moverlo de ${context.currentStatus} a ${context.targetStatus}.
    
    Datos:
    Nombre: ${context.leadName}
    Negocio: ${context.businessName}
    Dolor/Interés: ${context.painPoint || 'Mejorar ventas'}
    Tono: ${context.tone || 'Profesional pero cercano'}
    
    Usa principios de persuasión (Escasez, Autoridad, Prueba Social) según aplique.
    
    JSON: { "message": "Texto del mensaje..." }`;

    try {
      const text = await this.callGeminiWithRetry(prompt, 'NEURO_MESSAGE');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { message: '' };
    } catch (error) {
      this.logger.error('Error generating neuro message:', error);
      return { message: '' };
    }
  }
}
