import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';
import { getRequestId } from '../contexts/request-context';
import { ResponseStatus } from '../enums/response-status.enum';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const requestId = getRequestId();
    const timestamp = new Date().toISOString();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';
    let errors: any[] | undefined = undefined;

    if (exception instanceof HttpException) {
      const responseBody = exception.getResponse();

      statusCode = exception.getStatus();

      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        const res = responseBody as Record<string, unknown>;
        message = typeof res.message === 'string' ? res.message : message;
        if (Array.isArray(res.errors)) {
          errors = res.errors;
        } else if (Array.isArray(res.message)) {
          errors = res.message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: ApiErrorResponse = {
      statusCode,
      status: ResponseStatus.ERROR,
      message,
      timestamp,
      requestId,
      ...(errors ? { errors } : {}),
    };

    response.status(statusCode).json(errorResponse);
  }
}
