import { Global, Module } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

import { PinoLoggerService } from './pino.service';

@Global()
@Module({
  providers: [
    {
      provide: PinoLoggerService,
      useFactory: (req: FastifyRequest) => {
        return new PinoLoggerService(req.log);
      },
      inject: [REQUEST],
    },
  ],
  exports: [PinoLoggerService],
})
export class LoggerModule {}
