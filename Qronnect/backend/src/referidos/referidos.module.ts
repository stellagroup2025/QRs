import { Module } from '@nestjs/common';
import { ReferidosService } from './referidos.service';
import { ReferidosController } from './referidos.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

/**
 * Módulo de sistema de referidos
 * Gestiona programas de referidos, códigos personales y recompensas
 */
@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [ReferidosController],
  providers: [ReferidosService],
  exports: [ReferidosService],
})
export class ReferidosModule {}
