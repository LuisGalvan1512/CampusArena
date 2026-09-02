import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // CORS for frontend (Next.js on port 3000)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger API Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Campus Arena API')
    .setDescription('API REST para la plataforma de torneos de videojuegos Campus Arena')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 Campus Arena API running on: http://localhost:${process.env.PORT ?? 3001}/api/v1`);
  console.log(`📖 Swagger docs available at: http://localhost:${process.env.PORT ?? 3001}/api/docs`);
}
await bootstrap();
