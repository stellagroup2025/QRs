import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';
import { OpenAiService } from './openai.service';
import { SupabaseModule } from '../supabase/supabase.module';

/**
 * Módulo de IA - Integración con Google Gemini y OpenAI
 */
@Module({
  imports: [SupabaseModule],
  controllers: [AiController],
  providers: [
    AiService,
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
    }
  ],
  exports: [AiService, 'AiProvider'],
})
export class AiModule { }
