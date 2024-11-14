import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as packageInfo from '../package.json';

const version = packageInfo.version;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: configService.get<string>('ALLOWED_ORIGIN') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.enableShutdownHooks();

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  logger.log(
    `Server is running on http://localhost:${port}, API Version: ${version}`,
  );
  logger.log(`Allowed origin: ${configService.get<string>('ALLOWED_ORIGIN')}`);
  logger.log(`JWT Secret: ${configService.get<string>('JWT_SECRET')}`);
}
bootstrap();
