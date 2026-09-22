import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RequestMethod } from '@nestjs/common';
import { registerWithConsul } from './consul-registration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Excluded from the prefix so it never collides with the flat `/notifications/:userId` route.
  app.setGlobalPrefix('notifications', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  const config = new DocumentBuilder()
    .setTitle('Notification Service API')
    .setDescription('Notification dispatch (stubbed) for the Another Home platform')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4004;
  await app.listen(port);
  registerWithConsul('notification', port);
}
bootstrap();
