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
  private debugLog: string[] = [];

  constructor(private readonly supabase: SupabaseService) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      this.addDebugLog('⚠️ GEMINI_API_KEY not configured.');
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Initialize asynchronously
      this.initializeModel(apiKey).catch(err => {
        this.addDebugLog(`Initialization Error: ${err.message}`);
        this.logger.error('Failed to initialize Gemini model', err);
      });
    }
  }

  private addDebugLog(msg: string) {
    this.debugLog.push(`[${new Date().toISOString()}] ${msg}`);
    // Keep only last 20 logs
    if (this.debugLog.length > 20) this.debugLog.shift();
  }

  private async initializeModel(apiKey: string) {
    try {
      this.addDebugLog('🔄 Detecting available Gemini models...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

      let selectedModelName = 'gemini-1.5-flash'; // Fallback default

      if (response.ok) {
        const data = await response.json();
        const models = (data.models || []).map((m: any) => m.name.replace('models/', ''));

        this.addDebugLog(`📋 Remote models: ${models.join(', ')}`);

        // Priority list - updated based on user's available models and quota limits
        const candidates = [
          'gemini-2.0-flash-exp', // Experimental often has better free access
          'gemini-2.5-flash',     // Newer preview model
          'gemini-2.0-flash',     // Standard flash (hit limit 0)
          'gemini-2.0-flash-001',
          'gemini-flash-latest',
          'gemini-1.5-flash',
          'gemini-1.5-flash-001',
          'gemini-1.5-pro',
          'gemini-1.5-pro-001'
        ];

        // Find the first candidate that exists in the available models
        const bestMatch = candidates.find(c => models.includes(c));

        if (bestMatch) {
          selectedModelName = bestMatch;
          this.addDebugLog(`✨ Selected optimal model: ${selectedModelName}`);
        } else {
          this.addDebugLog(`⚠️ No preferred model found. Fallback: ${selectedModelName}`);
        }
      } else {
        this.addDebugLog(`❌ List models failed (${response.status} ${response.statusText}). Fallback: ${selectedModelName}`);
      }

      this.model = this.genAI.getGenerativeModel({ model: selectedModelName });
      this.addDebugLog(`✅ Service ready with: ${selectedModelName}`);
      this.logger.log(`✅ Gemini Service ready with model: ${selectedModelName}`);
    } catch (error) {
      this.addDebugLog(`❌ Init exception: ${error.message}`);
      this.logger.error('❌ Error during model initialization', error);
      // Fallback in case of error
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  private async callGeminiWithRetry(prompt: string, context: string): Promise<any> {
    // Wait for initialization if needed (max 10 seconds)
    if (!this.model && this.genAI) {
      for (let i = 0; i < 20; i++) {
        if (this.model) break;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!this.model) {
      const debugInfo = this.debugLog.join('\n');
      throw new Error(`Gemini not configured. Debug Info:\n${debugInfo}`);
    }

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
        // Append debug info to error
        const enhancedError = new Error(`${error.message}\n\n[SERVER DEBUG LOGS]:\n${this.debugLog.join('\n')}`);
        throw enhancedError;
      }
    }
    throw lastError;
  }

  /**
   * Limpia y parsea la respuesta JSON de Gemini
   * Maneja bloques de código markdown y posibles textos adicionales
   */
  private cleanAndParseJson(text: string, context: string = ''): any {
    try {
      // 1. Eliminar bloques de código mrkdwn ```json ... ```
      let cleanText = text.replace(/```json/g, '').replace(/```/g, '');

      // 2. Encontrar el primer { y el último }
      const firstOpen = cleanText.indexOf('{');
      const lastClose = cleanText.lastIndexOf('}');

      if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        cleanText = cleanText.substring(firstOpen, lastClose + 1);
      }

      return JSON.parse(cleanText);
    } catch (error) {
      this.logger.error(`[${context}] Error parsing JSON from Gemini response:`, error);
      this.logger.debug(`[${context}] Raw text was: ${text.substring(0, 500)}...`);
      return null;
    }
  }

  const prompt = `Eres un analista de negocio experto. Analiza estos KPIs:
  async generateKpiAnalysis(params: any): Promise<any> {
    if (!this.model) throw new Error('Gemini AI not configured');
    const prompt = `Eres un analista de negocio experto. Analiza estos KPIs:
    ${ JSON.stringify(params.kpis) }
Contexto: ${ params.contexto || '' }
    
    Genera respuesta JSON siguiendo ESTRICTAMENTE este esquema:
{
  "summary": "Resumen ejecutivo del desempeño general",
    "highlights": [
      { "metric": "Nombre métrica", "value": "Valor", "insight": "Breve explicación" }
    ],
      "recommendations": [
        {
          "texto": "Descripción detallada de la recomendación",
          "accionable": boolean,
          "tipo_accion": "campana_email" | "promocion" | "ninguna"
        }
      ]
} `;

    try {
      const text = await this.callGeminiWithRetry(prompt, 'KPI_ANALYSIS');
      return this.cleanAndParseJson(text, 'KPI_ANALYSIS') || { summary: text, highlights: [], recommendations: [] };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async generatePromoIdeas(params: any): Promise < any > {
  if(!this.model) throw new Error('Gemini AI not configured');
  const prompt = `Ideas de promociones para ${ params.sector }.
Ticket: ${ params.ticketMedio }.Visitas: ${ params.frecuenciaVisitas }.Objetivo: ${ params.objetivo }.
JSON: { ideas: [{ titulo, descripcion, condiciones, mensajeWhatsApp, textoCartel, estimadoImpacto }] } `;

  try {
    const text = await this.callGeminiWithRetry(prompt, 'PROMO_IDEAS');
    return this.cleanAndParseJson(text, 'PROMO_IDEAS') || { ideas: [] };
  } catch(e) { throw e; }
}

  async generateEmailCampaignIdeas(params: any): Promise < any > {
  if(!this.model) throw new Error('Gemini AI not configured');
  const prompt = `Campaña email para ${ params.sector }.Segmento: ${ params.segmentoDescripcion }.
Objetivo: ${ params.objetivo }.
JSON: { asuntos: [], cuerpos: [{ variante, contenido, cta }], consejos: [] } `;

  try {
    const text = await this.callGeminiWithRetry(prompt, 'EMAIL_CAMPAIGN');
    return this.cleanAndParseJson(text, 'EMAIL_CAMPAIGN') || { asuntos: [], cuerpos: [], consejos: [] };
  } catch(e) { throw e; }
}

  async generatePlanAccion(params: any): Promise < any > {
  if(!this.model) throw new Error('Gemini AI not configured');
  const prompt = `Plan acción para recomendación: "${params.recomendacion}".
  JSON: { acciones: [{ tipo, titulo, descripcion, datos_prellenados, prioridad }], explicacion, impacto_estimado } `;

  try {
    const text = await this.callGeminiWithRetry(prompt, 'PLAN_ACCION');
    return this.cleanAndParseJson(text, 'PLAN_ACCION') || { acciones: [], explicacion: '', impacto_estimado: '' };
  } catch(e) { throw e; }
}

  async generarCampanaSMS(params: any): Promise < any > {
  if(!this.model) throw new Error('Gemini AI not configured');
  const prompt = `SMS MAX 160 chars.
  Negocio: ${ params.contextoNegocio }
Objetivo: ${ params.objetivo }
    Mensaje Clave: ${ params.mensajeClave }
Tono: ${ params.tono }

JSON: { mensaje, sugerencias: [] } `;

  try {
    const text = await this.callGeminiWithRetry(prompt, 'SMS_CAMPAIGN');
    const parsed = this.cleanAndParseJson(text, 'SMS_CAMPAIGN');

    if(parsed) {
      const mensaje = parsed.mensaje || '';
      return {
        mensaje,
        caracteres: mensaje.length,
        numSMS: Math.ceil(mensaje.length / 160) || 1,
        sugerencias: parsed.sugerencias || []
      };
    }
      return { mensaje: '', caracteres: 0, numSMS: 0, sugerencias: [] };
  } catch(e) { throw e; }
}

  // --- New Methods for Report Analysis ---

  async analyzePromoImpact(promociones: any[], kpis: any, comparativa: any): Promise < any > {
  if(!this.model) throw new Error('Gemini AI not configured');

  const prompt = `Analiza el impacto de estas promociones en un negocio:
PROMOCIONES: ${ JSON.stringify(promociones) }
KPIs: ${ JSON.stringify(kpis) }
COMPARATIVA: ${ JSON.stringify(comparativa) }

Devuelve JSON:
{
  "resumen": "Análisis del impacto...",
    "impacto": "positivo" | "neutral" | "negativo",
      "recomendaciones": ["Recomendación 1", "Recomendación 2"]
} `;

  try {
    const text = await this.callGeminiWithRetry(prompt, 'ANALISIS_PROMOCIONES');
    return this.cleanAndParseJson(text, 'ANALISIS_PROMOCIONES') || { resumen: text, impacto: 'neutral' };
  } catch(error) {
    this.logger.error('[INFORME] Error analizando promociones:', error);
    return { resumen: 'Error analizando impacto', impacto: 'neutral' };
  }
}

  async generateNextMonthPlan(tienda: any, kpis: any, analisisIA: any): Promise < any > {
  if(!this.model) throw new Error('Gemini AI not configured');

  const prompt = `Plan acción próximo mes para ${ tienda.nombre }.
KPIs: ${ JSON.stringify(kpis) }
     Análisis Previo: ${ JSON.stringify(analisisIA) }
     
     Formato JSON:
{
  "objetivos": [{ "objetivo": "...", "metrica": "...", "valor_objetivo": 0 }],
    "acciones": [{ "accion": "...", "prioridad": "...", "implementable_sistema": true, "tipo": "..." }],
      "kpis_monitorear": []
} `;

  try {
    const text = await this.callGeminiWithRetry(prompt, 'PLAN_SIGUIENTE_MES');
    return this.cleanAndParseJson(text, 'PLAN_SIGUIENTE_MES') || { objetivos: [] };
  } catch(error) {
    this.logger.error('[INFORME] Error generando plan:', error);
    return { objetivos: [], kpis_monitorear: [] };
  }

  // --- SALES INNOVATION METHODS ---

  async generateSalesCoaching(context: any): Promise < any > {
  if(!this.model) throw new Error('Gemini AI not configured');

  const prompt = `Actúa como el mejor Coach de Ventas del mundo(estilo Jordan Belfort pero ético).
    Analiza la situación de este prospecto y dame una estrategia de CIERRE inmediata.
    
    Estado Actual: ${ context.stage }
    Respuestas del Playbook: ${ JSON.stringify(context.answers) }
    Info Prospecto: ${ JSON.stringify(context.lead) }
    
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
    return this.cleanAndParseJson(text, 'SALES_COACHING') || { strategy: 'No se pudo generar estrategia', script: '' };
  } catch(error) {
    this.logger.error('Error generating sales coaching:', error);
    return { strategy: 'Error de conexión', script: '' };
  }
}

  async generateNeuroMessage(context: any): Promise < any > {
  if(!this.model) throw new Error('Gemini AI not configured');

  const prompt = `Eres experto en Copywriting y PNL(Programación Neuro - Lingüística).
    Genera un mensaje de ${ context.channel } (WhatsApp / Email) para este prospecto.
  Objetivo: Moverlo de ${ context.currentStatus } a ${ context.targetStatus }.

Datos:
Nombre: ${ context.leadName }
Negocio: ${ context.businessName }
Dolor / Interés: ${ context.painPoint || 'Mejorar ventas' }
Tono: ${ context.tone || 'Profesional pero cercano' }
    
    Usa principios de persuasión(Escasez, Autoridad, Prueba Social) según aplique.

  JSON: { "message": "Texto del mensaje..." } `;

  try {
    const text = await this.callGeminiWithRetry(prompt, 'NEURO_MESSAGE');
    return this.cleanAndParseJson(text, 'NEURO_MESSAGE') || { message: '' };
  } catch(error) {
    this.logger.error('Error generating neuro message:', error);
    return { message: '' };
  }
}
}
