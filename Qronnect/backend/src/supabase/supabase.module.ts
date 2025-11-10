import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

/**
 * Módulo global de Supabase
 * Se marca como @Global() para que SupabaseService esté disponible en toda la app
 * sin necesidad de importar el módulo en cada módulo que lo necesite
 */
@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
