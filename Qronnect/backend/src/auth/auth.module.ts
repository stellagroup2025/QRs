import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { JwtTokenService } from './jwt-token.service';

/**
 * Módulo de autenticación
 * Proporciona guards, decoradores y servicio JWT para proteger rutas
 *
 * @Global para que JwtTokenService esté disponible en todos los módulos
 * sin necesidad de importar AuthModule explícitamente
 */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'qronnect-dev-secret-change-in-production'),
        signOptions: {
          issuer: 'qronnect',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SupabaseAuthGuard, AdminGuard, JwtTokenService],
  exports: [SupabaseAuthGuard, AdminGuard, JwtTokenService, JwtModule],
})
export class AuthModule { }
