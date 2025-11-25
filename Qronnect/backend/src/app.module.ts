import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
        'superadmin/(.*)', // Excluir todas las rutas de superadmin
        'api/superadmin/(.*)',
        'health', // Excluir health check (no necesita tenant)
        'api/health', // Excluir health check con prefijo api
      )
      .forRoutes('*'); // Aplicar a todas las demás rutas
  }
}
