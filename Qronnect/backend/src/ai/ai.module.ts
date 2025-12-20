import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiUsageService } from './ai-usage.service';
import { GeminiService } from './gemini.service';
import { OpenAiService } from './openai.service';
import { SupabaseModule } from '../supabase/supabase.module';

/**
 * Módulo de IA - Integración con Google Gemini y OpenAI
 *
 * Incluye control de límites de uso por plan:
 * - Plan básico/demo: 1 promoción, 1 campaña, 1 análisis KPI por semana
 * - Plan starter: 3 promociones, 3 campañas, 5 análisis por semana
 * - Plan business: 10 promociones, 10 campañas, 20 análisis por semana
 * - Plan enterprise: Ilimitado
 */
@Module({
  imports: [SupabaseModule],
  controllers: [AiController],
  providers: [
    AiService,
    AiUsageService,
    GeminiService,
    OpenAiService,
    {
      provide: 'AiProvider',
      useFactory: (geminiService: GeminiService, openAiService: OpenAiService) => {
        const provider = process.env.AI_PROVIDER || 'gemini';
        console.log(`🤖 Inicializando AI Module con proveedor: ${provider}`);
        return provider === 'openai' ? openAiService : geminiService;
      },
      inject: [GeminiService, OpenAiService],
    },
  ],
  exports: [AiService, AiUsageService, 'AiProvider'],
})
export class AiModule {}
