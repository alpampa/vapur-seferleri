import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';

// Ortam değişkenleri uygulama oluşturulmadan ÖNCE yüklenir.
loadEnv();

function resolveCorsOrigins(): string[] {
  const raw = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0 && origin !== '*');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Güvenlik başlıkları
  app.use(helmet());

  // CORS: yalnızca bilinen origin'ler kabul edilir (wildcard yok).
  app.enableCors({
    origin: resolveCorsOrigins(),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Girdi doğrulama: bilinmeyen alanlar reddedilir.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableShutdownHooks();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(`API is running on port ${port}`, 'Bootstrap');
}
void bootstrap();
