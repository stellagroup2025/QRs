import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Servicio para integración con Google Gemini AI
 *
 * Proporciona funcionalidades de IA para:
 * 1. Análisis de KPIs y generación de insights
 * 2. Generación de ideas de promociones según sector
 * 3. Generación de campañas de email segmentadas
 */
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      this.logger.warn('⚠️  GEMINI_API_KEY not configured. AI features will be disabled.');
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Usar gemini-2.0-flash (modelo más reciente y rápido)
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      this.logger.log('✅ Google Gemini AI service initialized with model: gemini-2.0-flash');
    }
  }

  /**
   * 1. ANALISTA DE KPIs
   * Genera un análisis en lenguaje natural de los KPIs del negocio
   */
  async generateKpiAnalysis(params: {
    kpis: {
      ventasTotales: number;
      numeroTickets: number;
      ticketMedio: number;
      clientesNuevos: number;
      clientesRecurrentes: number;
      clientesActivos: number;
      tasaRetencion?: number;
      periodoInicio: string;
      periodoFin: string;
    };
    sector?: string;
    tiendaNombre?: string;
  }): Promise<{
    summary: string;
    highlights: string[];
    recommendations: string[];
  }> {
    if (!this.model) {
      throw new Error('Gemini AI service not configured. Set GEMINI_API_KEY environment variable.');
    }

    const { kpis, sector, tiendaNombre } = params;

    // CONSTRUCCIÓN DEL PROMPT - Optimizado para obtener insights accionables
    const prompt = `Eres un analista de negocio experto en comercios locales. Analiza estos KPIs de un ${sector || 'comercio'} llamado "${tiendaNombre || 'la tienda'}" durante el período del ${kpis.periodoInicio} al ${kpis.periodoFin}:

DATOS DEL PERÍODO:
- Ventas totales: ${kpis.ventasTotales.toFixed(2)}€
- Número de tickets/ventas: ${kpis.numeroTickets}
- Ticket medio: ${kpis.ticketMedio.toFixed(2)}€
- Clientes nuevos: ${kpis.clientesNuevos}
- Clientes recurrentes: ${kpis.clientesRecurrentes}
- Clientes activos: ${kpis.clientesActivos}
${kpis.tasaRetencion ? `- Tasa de retención: ${kpis.tasaRetencion.toFixed(1)}%` : ''}

INSTRUCCIONES:
1. Genera un resumen ejecutivo breve (2-3 frases) en lenguaje sencillo explicando qué ha pasado
2. Identifica 3-4 puntos destacables (positivos o a mejorar)
3. Da 2-3 recomendaciones prácticas y accionables específicas para este tipo de negocio

FORMATO DE RESPUESTA (JSON):
{
  "summary": "Resumen ejecutivo aquí...",
  "highlights": ["Punto destacado 1", "Punto destacado 2", "Punto destacado 3"],
  "recommendations": ["Recomendación 1", "Recomendación 2", "Recomendación 3"]
}

Sé conciso, práctico y usa un tono cercano pero profesional. Enfócate en insights accionables.`;

    try {
      this.logger.log('[GEMINI KPI ANALYSIS] Generando análisis de KPIs...');

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Intentar parsear como JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        this.logger.log('[GEMINI KPI ANALYSIS] Análisis generado exitosamente');
        return parsed;
      }

      // Si no es JSON válido, estructurarlo manualmente
      return {
        summary: text.split('\n')[0] || text,
        highlights: [],
        recommendations: []
      };
    } catch (error) {
      this.logger.error('[GEMINI KPI ANALYSIS] Error:', error);
      throw new Error(`Error al generar análisis de KPIs: ${error.message}`);
    }
  }

  /**
   * 2. GENERADOR DE PROMOCIONES SEGÚN SECTOR
   * Genera ideas de promociones adaptadas al tipo de negocio
   */
  async generatePromoIdeas(params: {
    sector: string;
    ticketMedio: number;
    frecuenciaVisitas: number; // visitas promedio por mes
    objetivo: 'aumentar_visitas' | 'subir_ticket' | 'reactivar_inactivos' | 'fidelizar';
    contexto?: string; // info adicional del negocio
  }): Promise<{
    ideas: Array<{
      titulo: string;
      descripcion: string;
      condiciones: string;
      mensajeWhatsApp: string;
      textoCartel: string;
      estimadoImpacto: string;
    }>;
  }> {
    if (!this.model) {
      throw new Error('Gemini AI service not configured. Set GEMINI_API_KEY environment variable.');
    }

    const objetivoTexto = {
      'aumentar_visitas': 'aumentar la frecuencia de visitas',
      'subir_ticket': 'incrementar el ticket medio',
      'reactivar_inactivos': 'reactivar clientes inactivos',
      'fidelizar': 'fidelizar clientes actuales'
    }[params.objetivo];

    // PROMPT para generación de promociones
    const prompt = `Eres un experto en marketing para comercios locales. Genera 3 ideas de promociones creativas y realistas para un ${params.sector} con estas características:

DATOS DEL NEGOCIO:
- Sector: ${params.sector}
- Ticket medio actual: ${params.ticketMedio.toFixed(2)}€
- Frecuencia de visitas: ${params.frecuenciaVisitas} veces/mes
- Objetivo: ${objetivoTexto}
${params.contexto ? `- Contexto adicional: ${params.contexto}` : ''}

REQUISITOS PARA CADA PROMOCIÓN:
1. Debe ser fácil de implementar en un comercio pequeño/mediano
2. Adaptada específicamente al sector "${params.sector}"
3. Dirigida a cumplir el objetivo: ${objetivoTexto}
4. Debe incluir:
   - Título atractivo y corto
   - Descripción de la mecánica
   - Condiciones claras
   - Mensaje para enviar por WhatsApp (máx 160 caracteres)
   - Texto corto para cartel en tienda
   - Estimación de impacto esperado

FORMATO DE RESPUESTA (JSON):
{
  "ideas": [
    {
      "titulo": "Nombre de la promo",
      "descripcion": "Explicación de cómo funciona...",
      "condiciones": "Válido hasta..., mínimo de compra..., etc.",
      "mensajeWhatsApp": "Texto corto y atractivo para WhatsApp",
      "textoCartel": "Texto llamativo para cartel en tienda",
      "estimadoImpacto": "Estimación del impacto esperado"
    }
  ]
}

Sé creativo pero realista. Las promociones deben ser prácticas y aplicables.`;

    try {
      this.logger.log('[GEMINI PROMO IDEAS] Generando ideas de promociones...');

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        this.logger.log(`[GEMINI PROMO IDEAS] ${parsed.ideas?.length || 0} ideas generadas`);
        return parsed;
      }

      return { ideas: [] };
    } catch (error) {
      this.logger.error('[GEMINI PROMO IDEAS] Error:', error);
      throw new Error(`Error al generar ideas de promociones: ${error.message}`);
    }
  }

  /**
   * 3. GENERADOR DE CAMPAÑAS DE EMAIL SEGMENTADAS
   * Genera contenido para campañas de email según el segmento de clientes
   */
  async generateEmailCampaignIdeas(params: {
    segmentoDescripcion: string; // ej: "Mujeres 30-45 años, 2-4 visitas/año, ticket medio 35€, sin venir hace 60-120 días, 124 personas"
    sector: string;
    objetivo: 'reactivacion' | 'upsell' | 'lanzamiento' | 'fidelizacion';
    tono: 'cercano' | 'familiar' | 'premium' | 'juvenil';
    nombreTienda?: string;
  }): Promise<{
    asuntos: string[]; // 3-4 opciones de asunto
    cuerpos: Array<{
      variante: string; // A, B, C
      contenido: string;
      cta: string; // Call to action
    }>;
    consejos: string[];
  }> {
    if (!this.model) {
      throw new Error('Gemini AI service not configured. Set GEMINI_API_KEY environment variable.');
    }

    const objetivoTexto = {
      'reactivacion': 'reactivar clientes que llevan tiempo sin venir',
      'upsell': 'aumentar el ticket medio con productos/servicios adicionales',
      'lanzamiento': 'comunicar un nuevo producto o servicio',
      'fidelizacion': 'fortalecer la relación y fidelizar'
    }[params.objetivo];

    // PROMPT para campañas de email
    const prompt = `Eres un experto en email marketing para comercios locales. Crea el contenido de una campaña de email para ${params.nombreTienda || 'la tienda'}, un ${params.sector}.

SEGMENTO OBJETIVO:
${params.segmentoDescripcion}

OBJETIVO DE LA CAMPAÑA:
${objetivoTexto}

TONO DESEADO:
${params.tono}

GENERA:
1. 3-4 opciones de líneas de asunto atractivas y personalizadas
2. 2-3 variantes del cuerpo del email (para testing A/B)
   - Cada variante debe tener un enfoque ligeramente diferente
   - Longitud: 150-250 palabras por email
   - Debe incluir llamada a la acción (CTA) clara
   - Personalizable con {{nombre}} donde corresponda
3. 2-3 consejos para optimizar la campaña

FORMATO DE RESPUESTA (JSON):
{
  "asuntos": ["Asunto opción 1", "Asunto opción 2", "Asunto opción 3"],
  "cuerpos": [
    {
      "variante": "A",
      "contenido": "Hola {{nombre}},\\n\\nCuerpo del email aquí...",
      "cta": "¡Reserva ahora tu cita!"
    }
  ],
  "consejos": ["Consejo 1 para optimizar", "Consejo 2", "Consejo 3"]
}

El contenido debe ser genuino, personalizado al sector y tono solicitado, y enfocado en el objetivo.`;

    try {
      this.logger.log('[GEMINI EMAIL CAMPAIGN] Generando campaña de email...');

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        this.logger.log(`[GEMINI EMAIL CAMPAIGN] Campaña generada con ${parsed.asuntos?.length || 0} asuntos y ${parsed.cuerpos?.length || 0} variantes`);
        return parsed;
      }

      return {
        asuntos: [],
        cuerpos: [],
        consejos: []
      };
    } catch (error) {
      this.logger.error('[GEMINI EMAIL CAMPAIGN] Error:', error);
      throw new Error(`Error al generar campaña de email: ${error.message}`);
    }
  }
}
