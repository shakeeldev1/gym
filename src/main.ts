import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { webcrypto } from 'crypto';

async function bootstrap() {
  if (!(global as any).crypto) {
    (global as any).crypto = webcrypto;
  }

  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:5173', 
      'http://localhost:3000', // Alternative dev port
      'http://localhost:5174', // Vite preview
      'https://health-thrive.site', // Production
      'https://thrive2-0.vercel.app', // Production
      'https://www.health-thrive.site', // Production with www
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200,
  });

  // Enable global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable type transformation
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types
      },
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: false, // Don't throw on unknown properties
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
