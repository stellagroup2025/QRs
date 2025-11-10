import { Module } from '@nestjs/common';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { AdminGuard } from './guards/admin.guard';

/**
 * Módulo de autenticación
 * Proporciona guards y decoradores para proteger rutas
 */
@Module({
  providers: [SupabaseAuthGuard, AdminGuard],
  exports: [SupabaseAuthGuard, AdminGuard],
})
export class AuthModule {}
