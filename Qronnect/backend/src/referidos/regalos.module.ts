import { Module } from '@nestjs/common';
import { RegalosService } from './regalos.service';
import { RegalosController } from './regalos.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { EmailModule } from '../email/email.module';

/**
 * Módulo de sistema de regalos concretos y cupones
 * Gestiona catálogo de regalos, cupones y milestones de referidos
 */
@Module({
  imports: [SupabaseModule, EmailModule],
  controllers: [RegalosController],
  providers: [RegalosService],
  exports: [RegalosService],
})
export class RegalosModule {}
