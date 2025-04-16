import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import { env } from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('MatchMaker API')
    .setDescription('The MatchMaker API for matching students with thesis supervisors')
    .setVersion('1.0')
    .addTag('matchmaker')
    .addServer('http://localhost:3000', 'Local development server')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  fs.writeFileSync('OpenAPI.json', JSON.stringify(document, null, 2));

  SwaggerModule.setup('api', app, document);

  app.enableCors({
    //todo: figure out with FE how to manage config variables
    origin: process.env.FRONTEND_HOST, // allow Nuxt
    credentials: true,              // if you're using cookies or auth
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
