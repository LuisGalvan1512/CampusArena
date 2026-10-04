import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: HTTP Security Headers via Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows cross-origin avatars and vouchers
      crossOriginEmbedderPolicy: false,
    })
  );

  // Security: Balanced payload limit to prevent Memory Exhaustion DoS
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));

  // Global prefix: /api/v1 (per Auth.spec.md section 5)
  app.setGlobalPrefix('api/v1');

  // Cookie parser (for refresh token cookies)
  app.use(cookieParser());

  // Global validation pipe (auto-validates DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Standardized response format: { success: true, data: ... }
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Standardized error format: { success: false, error: { code, message, details } }
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS for frontend (supports comma-separated URLs, Vercel preview domains, and dev)
  const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''));

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        configuredOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
  });

  // Swagger API Documentation (Protected in production environments)
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Campus Arena API')
      .setDescription('API REST para la plataforma de torneos de videojuegos Campus Arena')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`📖 Swagger docs available at: http://localhost:${process.env.PORT ?? 3001}/api/docs`);
  }

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Campus Arena API running on: http://localhost:${port}/api/v1 (bound to 0.0.0.0)`);
}
await bootstrap();
