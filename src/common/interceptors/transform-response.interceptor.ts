import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ApiResponse,
  ControllerResponse,
  MetaData,
} from '../interfaces/api-response.interface';
import { ResponseStatus } from '../enums/response-status.enum';
import { getRequestId } from '../contexts/request-context';
import { Response } from 'express';

/**
 * Type guard to check if the object is a ControllerResponse
 */
function isControllerResponse<T = any>(
  value: unknown,
): value is ControllerResponse<T> {
  return (
    !!value &&
    typeof value === 'object' &&
    ('data' in value || 'message' in value || 'meta' in value)
  );
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<unknown, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse<Response>();
    const requestId = getRequestId();

    return next.handle().pipe(
      map((original: unknown): ApiResponse<T> => {
        const timestamp = new Date().toISOString();
        const statusCode = res.statusCode ?? 200;

        // Default values
        let message = '';
        let data: T = [] as unknown as T;
        let meta: MetaData | undefined;

        if (isControllerResponse<T>(original)) {
          message = original.message ?? message;
          data =
            original.data !== undefined && original.data !== null
              ? (original.data as T)
              : ([] as unknown as T);
          meta = original.meta;
        } else {
          // Handle raw primitives/arrays/null
          data =
            original !== undefined && original !== null
              ? (original as T)
              : ([] as unknown as T);
        }

        return {
          statusCode,
          status:
            statusCode >= 200 && statusCode < 300
              ? ResponseStatus.SUCCESS
              : ResponseStatus.ERROR,
          message,
          timestamp,
          requestId,
          data,
          meta: meta,
        };
      }),
    );
  }
}
