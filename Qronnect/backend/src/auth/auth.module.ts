import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { JwtTokenService } from './jwt-token.service';
import { LoginAttemptsService } from './login-attempts.service';

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
      useFactory: (configService: ConfigService) => {
        // Sin valor por defecto: un secreto conocido permitiría falsificar tokens de cualquier rol
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret || secret.length < 32) {
          throw new Error(
            'JWT_SECRET no está configurado o tiene menos de 32 caracteres. ' +
              'Genera uno con: openssl rand -base64 48',
          );
        }

        return {
          secret,
          signOptions: {
            issuer: 'qronnect',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SupabaseAuthGuard, AdminGuard, JwtTokenService, LoginAttemptsService],
  exports: [SupabaseAuthGuard, AdminGuard, JwtTokenService, LoginAttemptsService, JwtModule],
})
export class AuthModule { }
