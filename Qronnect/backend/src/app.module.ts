import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { RedisClientOptions } from 'redis';
import { WinstonModule, utilities as nestWinstonUtilities } from 'nest-winston';

// ... lines 10-68 ...

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
        // Excluir health check (no necesita tenant)
        { path: 'health', method: RequestMethod.ALL },
        { path: 'api/health', method: RequestMethod.ALL },
      )
      .forRoutes('*'); // Aplicar a todas las demás rutas
  }
}
