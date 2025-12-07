import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { RedisClientOptions } from 'redis';
import { WinstonModule, utilities as nestWinstonUtilities } from 'nest-winston';
import * as winston from 'winston';
import { I18nModule, AcceptLanguageResolver, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';

// Módulos de la aplicación
import { SupabaseModule } from './supabase/supabase.module';
import { TenantModule } from './tenant/tenant.module';
import { TenantResolverMiddleware } from './tenant/middleware/tenant-resolver.middleware';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { ComprasModule } from './compras/compras.module';
import { QrModule } from './qr/qr.module';
import { AdminModule } from './admin/admin.module';
import { TiendasModule } from './tiendas/tiendas.module';
import { SuperAdminModule } from './superadmin/superadmin.module';
import { BrandingModule } from './config/branding.module';
import { PromocionesModule } from './promociones/promociones.module';
import { CampanasModule } from './campanas/campanas.module';
import { EmailModule } from './email/email.module';
import { AiModule } from './ai/ai.module';
import { ReferidosModule } from './referidos/referidos.module';
import { UsuariosTiendaModule } from './usuarios-tienda/usuarios-tienda.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { InformesModule } from './informes/informes.module';
import { SellosModule } from './sellos/sellos.module';
import { GachaModule } from './gacha/gacha.module';
import { QrRedirectModule } from './qr-redirect/qr-redirect.module';
import { QrCodesModule } from './qr-codes/qr-codes.module';
import { ComercialesModule } from './comerciales/comerciales.module';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigService esté disponible en toda la app
      envFilePath: '.env',
    }),

    // Módulo de integración con Supabase
    SupabaseModule,

    // Módulo de multitenancy (identificación por dominio)
    TenantModule,

    // Módulo de autenticación (guards, decoradores, verificación JWT)
    AuthModule,

    // Módulo de SuperAdmin (acceso global, bypasea multitenancy)
    SuperAdminModule,

    // Módulo de Email (Resend)
    EmailModule,

    // Módulo de IA (Google Gemini)
    AiModule,

    // Módulo de Caché (Redis)
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore as unknown as any,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: 600, // 10 minutos por defecto
      }),
      inject: [ConfigService],
    }),

    // Módulos de Logging (Winston)
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonUtilities.format.nestLike('Qronnect', {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
        // En producción se puede añadir File o Http transport
      ],
    }),

    // Módulo de Internacionalización (i18n)
    I18nModule.forRoot({
      fallbackLanguage: 'es',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-custom-lang']),
      ],
    }),

    // Módulos de dominio
    ClientesModule,
    ComprasModule,
    QrModule,
    TiendasModule,
    AdminModule,
    BrandingModule,
    PromocionesModule,
    CampanasModule,
    ReferidosModule,
    UsuariosTiendaModule,
    OnboardingModule,
    InformesModule,
    SellosModule,
    GachaModule,
    QrRedirectModule,
    QrCodesModule,
    ComercialesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  /**
   * Configura el middleware de tenant resolution
   *
   * IMPORTANTE: El middleware NO se aplica a las rutas de superadmin
   * porque los superadmins tienen acceso global a todas las tiendas
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantResolverMiddleware)
      .exclude(
        // Excluir todas las rutas de superadmin
        { path: 'superadmin/(.*)', method: RequestMethod.ALL },
        { path: 'api/superadmin/(.*)', method: RequestMethod.ALL },
        // Excluir redirecciones de QR genéricos (no necesita tenant)
        { path: 'q/(.*)', method: RequestMethod.ALL },
        // Excluir gestión de QR codes (usa auth de superadmin, no tenant)
        { path: 'api/qr-codes', method: RequestMethod.ALL },
        { path: 'api/qr-codes/(.*)', method: RequestMethod.ALL },
        // Excluir rutas de comerciales (agentes)
        { path: 'comerciales/(.*)', method: RequestMethod.ALL },
        { path: 'api/comerciales/(.*)', method: RequestMethod.ALL },
        // Excluir health check (no necesita tenant)
        { path: 'health', method: RequestMethod.ALL },
        { path: 'api/health', method: RequestMethod.ALL },
      )
      .forRoutes('*'); // Aplicar a todas las demás rutas
  }
}
