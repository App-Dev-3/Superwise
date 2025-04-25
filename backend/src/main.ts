import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add validation pipe for all requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert types when possible
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('MatchMaker API')
    .setDescription(
      'The MatchMaker API for matching students with thesis supervisors',
    )
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

  await app.listen(process.env.PORT || 8080);
}
bootstrap();
