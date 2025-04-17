import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  SwaggerModule.setup('api', app, document);

  app.enableCors({
    //todo: Figure out with FE how to manage config variables
    origin: process.env.FRONTEND_HOST,
    credentials: true,
  });

  await app.listen(process.env.PORT || 8080);
}
bootstrap();
