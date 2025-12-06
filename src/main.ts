import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { BadRequestExceptionFilter } from './common/filters/bad-request.filter';
import { PinoLoggerService } from './common/logger/pino.service';
import pino from 'pino';
import { PrismaLogStream } from './common/logger/prisma-log-stream';

async function bootstrap() {
  const prismaStream = new PrismaLogStream();

  // กำหนด Logger config แบบ Object ธรรมดา
  const fastifyAdapter = new FastifyAdapter({
    logger: pino({
      level: 'info',
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    prismaStream // ส่ง log ทั้งหมดเข้า prismaStream
  )
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter);

  // 1. ลงทะเบียน Global Filter
  app.useGlobalFilters(new BadRequestExceptionFilter());

  // 2. ตั้งค่า Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 3. เชื่อม Logger ของ Nest เข้ากับ Fastify Logger (Pino)
  // เพื่อให้ System log ของ Nest ออกผ่าน Pino ด้วย
  app.useLogger(new PinoLoggerService(fastifyAdapter.getInstance().log));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
