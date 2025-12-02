import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { PinoLoggerService } from './common/logger/pino.service';

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter({
    logger: true,
  });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
    bufferLogs: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useLogger(new PinoLoggerService(fastifyAdapter.getInstance().log));
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
