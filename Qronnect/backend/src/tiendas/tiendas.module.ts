import { Module } from '@nestjs/common';
import { TiendasService } from './tiendas.service';
import { TiendasController } from './tiendas.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

/**
 * Módulo de tiendas
 * Proporciona servicios para gestionar tiendas y configuración
 */
@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [TiendasController],
  providers: [TiendasService],
  exports: [TiendasService],
})
export class TiendasModule {}
