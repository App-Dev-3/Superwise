import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import { WinstonLoggerService } from './common/logging/winston-logger.service';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs until our custom logger is available
  });

  // Use our custom Winston logger
  const logger = app.get(WinstonLoggerService);
  app.useLogger(logger);
  app.use(json({ limit: '50mb' })); // added this because the payload of bulk tag upload was too large.
  // Add validation pipe for all requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert types when possible
      },
      forbidUnknownValues: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('MatchMaker API')
    .setDescription('The MatchMaker API for matching students with thesis supervisors')
    .setVersion('1.0')
    .addTag('matchmaker')
    .addServer('http://localhost:8080', 'Local development server')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  fs.writeFileSync('OpenAPI.json', JSON.stringify(document, null, 2));

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: 1, // Expand models by default
      docExpansion: 'list', // Expand operations list
    },
  });

  app.enableCors({
    //todo: Figure out with FE how to manage config variables
    origin: process.env.FRONTEND_HOST,
    credentials: true,
  });

  logger.log(`Application starting on port ${process.env.PORT || 8080}`, 'Bootstrap');
  await app.listen(process.env.PORT || 8080);
  logger.log(`Application running on port ${process.env.PORT || 8080}`, 'Bootstrap');
}

bootstrap().catch(err => {
  // We use console.error here because our logger might not be initialized yet
  console.error('Failed to start application:', err);
  process.exit(1);
});
