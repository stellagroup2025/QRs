import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir requests del frontend
  // Permite localhost y subdominios (*.localhost) para desarrollo
  app.enableCors({
    origin: (origin, callback) => {
      // Lista de orígenes permitidos
      const allowedOrigins = [
        'http://localhost:3000',
        /^http:\/\/[\w-]+\.localhost:3000$/, // Permite cualquier subdominio.localhost:3000
        process.env.FRONTEND_URL,
        // En producción, permitir subdominios wildcard
        /^https:\/\/[\w-]+\.vercel\.app$/, // Vercel preview deployments
        /^https:\/\/([\w-]+\.)?qronnect\.com$/, // Dominio principal con subdominios
      ].filter(Boolean);

      // Permitir origenes adicionales desde variable de entorno
      const extraOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

      // Permitir requests sin origin (Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Verificar si el origin está en la lista permitida
      const isAllowed = [...allowedOrigins, ...extraOrigins].some((allowed) => {
        if (typeof allowed === 'string') {
          return allowed === origin;
        } else if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`⚠️  CORS bloqueado para origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Validación automática de DTOs usando class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma los payloads a instancias de DTO
      transformOptions: {
        enableImplicitConversion: true, // Convierte tipos automáticamente
      },
    }),
  );

  // Prefijo global para todas las rutas de la API
  app.setGlobalPrefix('api');

  // Configuración de Swagger para documentación de la API
  const config = new DocumentBuilder()
    .setTitle('Qronnect API')
    .setDescription('API del sistema de fidelización Qronnect con códigos QR')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa el JWT token obtenido de Supabase Auth',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
    🚀 Qronnect Backend is running!
    📝 API: http://localhost:${port}/api
    📚 Swagger Docs: http://localhost:${port}/api/docs
  `);
}

bootstrap();
