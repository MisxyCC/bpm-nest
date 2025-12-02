import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // ดึง error messages จาก class-validator
    let validationErrors = null;
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      validationErrors = (exceptionResponse as any).message;
    }

    // สร้าง Log Payload
    const logPayload = {
      type: 'DTO_VALIDATION_FAILURE',
      path: request.url,
      method: request.method,
      body: request.body, // Log ข้อมูลที่ user ส่งมาผิด
      query: request.query,
      params: request.params,
      errors: validationErrors,
    };

    // ใช้ logger ของ request โดยตรง (จะได้รับ config buffered มาจาก main.ts)
    // การใช้ request.log จะทำให้ log นี้มี reqId ผูกอยู่ด้วย อัตโนมัติ
    request.log.warn(logPayload, 'DTO Validation Failed');

    // ส่ง response กลับหา client
    response.status(status).send(exceptionResponse);
  }
}
