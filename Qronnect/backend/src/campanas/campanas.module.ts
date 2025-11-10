import { Module } from '@nestjs/common';
import { CampanasService } from './campanas.service';
import { CampanasController } from './campanas.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

/**
 * Módulo de campañas de email marketing
 * Gestiona la creación, envío y seguimiento de campañas con segmentación avanzada
 */
@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [CampanasController],
  providers: [CampanasService],
  exports: [CampanasService],
})
export class CampanasModule {}
