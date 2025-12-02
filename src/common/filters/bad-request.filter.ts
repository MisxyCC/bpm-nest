import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

import { PinoLoggerService } from '../logger/pino.service';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLoggerService) {}

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception.getStatus();

    // The response from class-validator is a bit nested.
    const errorResponse = exception.getResponse() as { message: string[] };

    this.logger.error(
      `Validation failed for request ${request.method} ${request.raw.url}. Errors: ${JSON.stringify(errorResponse.message)}`,
      BadRequestExceptionFilter.name,
    );

    // Send the original error response back to the client.
    response.status(status).send(exception.getResponse());
  }
}
