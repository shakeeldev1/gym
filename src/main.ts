import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { webcrypto } from 'crypto';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  if (!(global as any).crypto) {
    (global as any).crypto = webcrypto;
  }

  const app = await NestFactory.create(AppModule);

  // ✅ CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'https://health-thrive.site',
      'https://thrive2-0.vercel.app',
      'https://www.health-thrive.site',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200,
  });

  // ✅ Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // ✅ Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Health Thrive API')
    .setDescription('Comprehensive API documentation for Health Thrive platform - including authentication, user management, training, nutrition, habits, sleep, fasting, meditation, and wellness analytics')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management and profile operations')
    .addTag('Training', 'Workout programs, exercises, and performance tracking')
    .addTag('Nutrition', 'Meal planning, nutrition logs, and dietary goals')
    .addTag('Habits', 'Habit tracking and management')
    .addTag('Sleep', 'Sleep tracking and analytics')
    .addTag('Fasting', 'Intermittent fasting tracking')
    .addTag('Meditation', 'Mindfulness and meditation sessions')
    .addTag('Analytics', 'Wellness statistics and reports')
    .addTag('Chat', 'Community messaging and broadcasts')
    .addTag('Recipes', 'Recipe management and recommendations')
    .addTag('Integrations', 'Third-party service integrations')
    .addServer('http://localhost:3000', 'Local Development')
    .addServer('https://health-thrive.site', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Health Thrive API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
