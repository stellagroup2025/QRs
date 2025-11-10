import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';
import { SupabaseModule } from '../supabase/supabase.module';

/**
 * Módulo de IA - Integración con Google Gemini
 *
 * Proporciona 3 funcionalidades principales:
 * 1. Análisis de KPIs con insights y recomendaciones
 * 2. Generación de ideas de promociones según sector
 * 3. Generación de campañas de email segmentadas
 *
 * Requiere:
 * - GEMINI_API_KEY en variables de entorno
 * - SupabaseModule para acceso a datos
 * - Autenticación de admin para todos los endpoints
 */
@Module({
  imports: [SupabaseModule],
  controllers: [AiController],
  providers: [AiService, GeminiService],
  exports: [AiService, GeminiService], // Exportar para que otros módulos puedan usarlo
})
export class AiModule {}
