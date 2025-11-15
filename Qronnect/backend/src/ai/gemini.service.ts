import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseService } from '../supabase/supabase.service';

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
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 2000; // 2 segundos

  constructor(private readonly supabase: SupabaseService) {
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
   * Verifica si una tienda puede usar IA según su límite
   */
  private async verificarLimite(tiendaId: string): Promise<boolean> {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client.rpc('verificar_limite_ia', {
      p_tienda_id: tiendaId,
    });

    if (error) {
      this.logger.error('[VERIFICAR LIMITE] Error:', error);
      return true; // Permitir en caso de error
    }

    return data.disponible;
  }

  /**
   * Registra el uso de IA en la base de datos
   */
  private async registrarUso(
    tiendaId: string,
    tipo: string,
    tokens: number,
    exito: boolean,
    errorMsg?: string,
  ): Promise<void> {
    const client = this.supabase.getAdminClient();

    await client.rpc('registrar_uso_ia', {
      p_tienda_id: tiendaId,
      p_tipo: tipo,
      p_tokens: tokens,
      p_exito: exito,
      p_error_msg: errorMsg || null,
      p_metadata: {},
    });
  }

  /**
   * Helper para hacer llamadas a Gemini con retry y exponential backoff
   */
  private async callGeminiWithRetry(prompt: string, context: string): Promise<any> {
    let lastError: Error;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = result.response;
        return response.text();
      } catch (error) {
        lastError = error;

        // Si es error 429, hacer retry con exponential backoff
        if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
          const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          this.logger.warn(
            `[${context}] Rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${this.MAX_RETRIES})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Si es otro tipo de error, lanzarlo inmediatamente
        throw error;
      }
    }

    // Si agotamos los reintentos, lanzar el último error
    this.logger.error(`[${context}] Max retries reached. Giving up.`);
    throw lastError;
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
    contexto?: string; // Contexto adicional desde config_ia
  }): Promise<{
    summary: string;
    highlights: string[];
    recommendations: Array<{
      texto: string;
      accionable: boolean;
      tipo_accion?: 'campana_email' | 'promocion' | 'ambas' | 'ninguna';
      contexto_accion?: string;
    }>;
  }> {
    if (!this.model) {
      throw new Error('Gemini AI service not configured. Set GEMINI_API_KEY environment variable.');
    }

    const { kpis, sector, tiendaNombre, contexto } = params;

    // CONSTRUCCIÓN DEL PROMPT - Optimizado para obtener insights accionables
    const prompt = `Eres un analista de negocio experto en comercios locales. Analiza estos KPIs de un ${sector || 'comercio'} llamado "${tiendaNombre || 'la tienda'}" durante el período del ${kpis.periodoInicio} al ${kpis.periodoFin}:
${contexto ? `\nCONTEXTO DEL NEGOCIO:\n${contexto}\n` : ''}
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

IMPORTANTE - Para cada recomendación, evalúa si se puede ejecutar desde el sistema:
- accionable: true si se puede resolver con una campaña de email o promoción desde el sistema
- tipo_accion: "campana_email" si requiere comunicación a clientes, "promocion" si requiere crear oferta/descuento, "ambas" si ambas acciones ayudan, "ninguna" si no aplica
- contexto_accion: breve descripción de qué crear (ej: "campaña de reactivación a inactivos 60+ días", "promoción 2x1 martes")

FORMATO DE RESPUESTA (JSON):
{
  "summary": "Resumen ejecutivo aquí...",
  "highlights": ["Punto destacado 1", "Punto destacado 2", "Punto destacado 3"],
  "recommendations": [
    {
      "texto": "Recomendación 1",
      "accionable": true,
      "tipo_accion": "campana_email",
      "contexto_accion": "campaña de reactivación a clientes inactivos de más de 60 días"
    },
    {
      "texto": "Recomendación 2",
      "accionable": true,
      "tipo_accion": "promocion",
      "contexto_accion": "promoción especial para incrementar visitas en días de baja afluencia"
    },
    {
      "texto": "Recomendación 3",
      "accionable": false,
      "tipo_accion": "ninguna"
    }
  ]
}

Sé conciso, práctico y usa un tono cercano pero profesional. Enfócate en insights accionables desde el sistema.`;

    try {
      this.logger.log('[GEMINI KPI ANALYSIS] Generando análisis de KPIs...');

      const text = await this.callGeminiWithRetry(prompt, 'GEMINI KPI ANALYSIS');

      // Intentar parsear como JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        this.logger.log('[GEMINI KPI ANALYSIS] Análisis generado exitosamente');

        // Convertir formato antiguo (recommendations: string[]) al nuevo formato si es necesario
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          parsed.recommendations = parsed.recommendations.map((rec: any) => {
            if (typeof rec === 'string') {
              // Formato antiguo - convertir a objeto
              return {
                texto: rec,
                accionable: false,
                tipo_accion: 'ninguna',
              };
            }
            // Ya está en el nuevo formato
            return rec;
          });
        }

        return parsed;
      }

      // Si no es JSON válido, estructurarlo manualmente
      return {
        summary: text.split('\n')[0] || text,
        highlights: [],
        recommendations: [],
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
      aumentar_visitas: 'aumentar la frecuencia de visitas',
      subir_ticket: 'incrementar el ticket medio',
      reactivar_inactivos: 'reactivar clientes inactivos',
      fidelizar: 'fidelizar clientes actuales',
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

      const text = await this.callGeminiWithRetry(prompt, 'GEMINI PROMO IDEAS');

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
      reactivacion: 'reactivar clientes que llevan tiempo sin venir',
      upsell: 'aumentar el ticket medio con productos/servicios adicionales',
      lanzamiento: 'comunicar un nuevo producto o servicio',
      fidelizacion: 'fortalecer la relación y fidelizar',
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

      const text = await this.callGeminiWithRetry(prompt, 'GEMINI EMAIL CAMPAIGN');

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        this.logger.log(
          `[GEMINI EMAIL CAMPAIGN] Campaña generada con ${parsed.asuntos?.length || 0} asuntos y ${parsed.cuerpos?.length || 0} variantes`,
        );
        return parsed;
      }

      return {
        asuntos: [],
        cuerpos: [],
        consejos: [],
      };
    } catch (error) {
      this.logger.error('[GEMINI EMAIL CAMPAIGN] Error:', error);
      throw new Error(`Error al generar campaña de email: ${error.message}`);
    }
  }

  /**
   * 4. GENERADOR DE PLAN DE ACCIÓN
   * Genera acciones concretas y datos prellenados para ejecutar una recomendación
   */
  async generatePlanAccion(params: {
    recomendacion: string;
    contexto?: string;
    tipo_accion?: 'campana_email' | 'promocion' | 'ambas' | 'ninguna';
    nombreTienda?: string;
    ticketMedio?: number;
    clientesActivos?: number;
  }): Promise<{
    acciones: Array<{
      tipo: 'crear_campana' | 'crear_promocion';
      titulo: string;
      descripcion: string;
      datos_prellenados: any;
      prioridad: 'alta' | 'media' | 'baja';
    }>;
    explicacion: string;
    impacto_estimado: string;
  }> {
    if (!this.model) {
      throw new Error('Gemini AI service not configured. Set GEMINI_API_KEY environment variable.');
    }

    const prompt = `Eres un consultor experto en marketing para comercios locales. Tienes esta recomendación de negocio que necesitas convertir en acciones concretas ejecutables desde un sistema de fidelización:

RECOMENDACIÓN:
"${params.recomendacion}"

CONTEXTO ADICIONAL:
${params.contexto ? `- ${params.contexto}` : 'No hay contexto adicional'}
${params.tipo_accion ? `- Tipo de acción sugerida: ${params.tipo_accion}` : ''}
${params.nombreTienda ? `- Nombre del negocio: ${params.nombreTienda}` : ''}
${params.ticketMedio ? `- Ticket medio: ${params.ticketMedio.toFixed(2)}€` : ''}
${params.clientesActivos ? `- Clientes activos: ${params.clientesActivos}` : ''}

EL SISTEMA PUEDE:
1. CREAR CAMPAÑA DE EMAIL:
   - Segmentar clientes (por inactividad, frecuencia, ticket, edad, etc.)
   - Generar contenido personalizado con IA
   - Programar envío
   - Ejemplo datos: { segmento: "clientes inactivos 60+ días", objetivo: "reactivacion", tono: "cercano" }

2. CREAR PROMOCIÓN:
   - Título, descripción, condiciones
   - Mensaje WhatsApp y texto para cartel
   - Ejemplo datos: { titulo: "2x1 Martes", objetivo: "aumentar_visitas", sector: "peluqueria" }

GENERA UN PLAN DE ACCIÓN con 1-2 acciones concretas que resuelvan la recomendación. Para cada acción proporciona:
- tipo: "crear_campana" o "crear_promocion"
- titulo: nombre corto de la acción
- descripcion: qué hace esta acción
- datos_prellenados: objeto JSON con los datos necesarios para prellenar el formulario
- prioridad: "alta", "media" o "baja"

FORMATO DE RESPUESTA (JSON):
{
  "acciones": [
    {
      "tipo": "crear_campana",
      "titulo": "Campaña de Reactivación",
      "descripcion": "Enviar email a clientes que no han visitado en 60+ días",
      "datos_prellenados": {
        "segmentoDescripcion": "clientes sin visitar en 60+ días",
        "objetivo": "reactivacion",
        "tono": "cercano",
        "sector": "comercio local"
      },
      "prioridad": "alta"
    }
  ],
  "explicacion": "Esta campaña te ayudará a recuperar clientes que han dejado de venir...",
  "impacto_estimado": "Puede recuperar entre el 10-20% de los clientes inactivos, representando X€ en ventas adicionales"
}

Sé específico y práctico. Los datos prellenados deben ser directamente utilizables.`;

    try {
      this.logger.log('[GEMINI PLAN ACCION] Generando plan de acción...');

      const text = await this.callGeminiWithRetry(prompt, 'GEMINI PLAN ACCION');

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        this.logger.log(
          `[GEMINI PLAN ACCION] Plan generado con ${parsed.acciones?.length || 0} acciones`,
        );
        return parsed;
      }

      return {
        acciones: [],
        explicacion: 'No se pudo generar un plan de acción automático',
        impacto_estimado: 'Desconocido',
      };
    } catch (error) {
      this.logger.error('[GEMINI PLAN ACCION] Error:', error);
      throw new Error(`Error al generar plan de acción: ${error.message}`);
    }
  }

  /**
   * 4. GENERADOR DE CAMPAÑAS SMS CON IA
   * Genera mensajes SMS optimizados para campañas de marketing
   */
  async generarCampanaSMS(params: {
    contextoNegocio: string; // Descripción del negocio
    objetivo: 'promocion' | 'bienvenida' | 'cumpleanos' | 'reactivacion' | 'abandono' | 'fidelizacion' | 'informativa';
    mensajeClave: string; // Mensaje principal que quieren transmitir
    tono?: 'formal' | 'amigable' | 'urgente' | 'cercano';
    urgencia?: 'baja' | 'media' | 'alta';
    incluirCTA?: boolean; // Call to action
    variables?: string[]; // Variables disponibles como {{nombre}}, {{puntos}}, etc.
  }): Promise<{
    mensaje: string;
    caracteres: number;
    numSMS: number;
    sugerencias: string[];
  }> {
    if (!this.model) {
      throw new Error('Gemini AI service not configured. Set GEMINI_API_KEY environment variable.');
    }

    const tonoTexto = {
      formal: 'profesional y formal',
      amigable: 'amigable y cercano',
      urgente: 'urgente y convincente',
      cercano: 'cálido y personal',
    }[params.tono || 'amigable'];

    const urgenciaTexto = {
      baja: 'sin presión temporal',
      media: 'con cierta urgencia',
      alta: 'con alta urgencia y tiempo limitado',
    }[params.urgencia || 'media'];

    const objetivoTexto = {
      promocion: 'promocionar una oferta o descuento',
      bienvenida: 'dar la bienvenida a un nuevo cliente',
      cumpleanos: 'felicitar por cumpleaños y ofrecer regalo',
      reactivacion: 'reactivar clientes inactivos',
      abandono: 'recuperar clientes que abandonaron el proceso',
      fidelizacion: 'fidelizar y agradecer a clientes frecuentes',
      informativa: 'informar sobre novedades o cambios',
    }[params.objetivo];

    const prompt = `Eres un experto en copywriting para SMS marketing. Genera un mensaje SMS efectivo para la siguiente campaña:

CONTEXTO DEL NEGOCIO:
${params.contextoNegocio}

OBJETIVO DE LA CAMPAÑA:
${objetivoTexto}

MENSAJE CLAVE A TRANSMITIR:
"${params.mensajeClave}"

CARACTERÍSTICAS DEL MENSAJE:
- Tono: ${tonoTexto}
- Urgencia: ${urgenciaTexto}
${params.incluirCTA !== false ? '- DEBE incluir una llamada a la acción clara' : ''}
${params.variables && params.variables.length > 0 ? `- Variables disponibles para personalización: ${params.variables.join(', ')}` : ''}

RESTRICCIONES IMPORTANTES:
1. MÁXIMO 160 caracteres (1 SMS) - esto es CRÍTICO
2. Mensaje claro, directo y sin rodeos
3. Usar emojis moderadamente (1-2 máximo) solo si encaja con el tono
4. Si usas variables de personalización, incluirlas así: {{nombre}}, {{puntos}}, etc.
5. Evitar URLs largas (si necesitas, usa dominios cortos)

GENERA:
1. El mensaje SMS optimizado
2. 2-3 sugerencias alternativas de mejora o variaciones

FORMATO DE RESPUESTA (JSON):
{
  "mensaje": "Mensaje SMS generado aquí (máx 160 caracteres)",
  "sugerencias": [
    "Variación 1 del mensaje",
    "Variación 2 del mensaje",
    "Variación 3 del mensaje"
  ]
}

IMPORTANTE: El mensaje debe ser efectivo, persuasivo y respetar estrictamente el límite de 160 caracteres.`;

    try {
      this.logger.log('[GEMINI SMS] Generando campaña SMS...');

      const text = await this.callGeminiWithRetry(prompt, 'GEMINI SMS');

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        const mensaje = parsed.mensaje || '';
        const caracteres = mensaje.length;

        // Calcular número de SMS necesarios
        let numSMS: number;
        if (caracteres <= 160) {
          numSMS = 1;
        } else if (caracteres <= 306) {
          numSMS = 2;
        } else if (caracteres <= 459) {
          numSMS = 3;
        } else {
          numSMS = Math.ceil(caracteres / 153);
        }

        this.logger.log(`[GEMINI SMS] SMS generado: ${caracteres} caracteres, ${numSMS} SMS`);

        return {
          mensaje,
          caracteres,
          numSMS,
          sugerencias: parsed.sugerencias || [],
        };
      }

      throw new Error('No se pudo parsear la respuesta de Gemini');
    } catch (error) {
      this.logger.error('[GEMINI SMS] Error:', error);
      throw new Error(`Error al generar campaña SMS: ${error.message}`);
    }
  }
}
