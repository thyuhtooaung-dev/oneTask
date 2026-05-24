import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) || JSON.stringify(exceptionResponse);
        if (resp.error && typeof resp.error === 'string') {
          code = resp.error.toUpperCase().replace(/\s+/g, '_');
        }
      }

      // Map specific HTTP statuses to custom codes if not provided
      if (code === 'INTERNAL_SERVER_ERROR') {
        if (status === HttpStatus.FORBIDDEN) code = 'WORKSPACE_ACCESS_DENIED';
        else if (status === HttpStatus.UNAUTHORIZED) code = 'UNAUTHORIZED';
        else if (status === HttpStatus.NOT_FOUND) code = 'NOT_FOUND';
        else if (status === HttpStatus.BAD_REQUEST) code = 'BAD_REQUEST';
        else if (status === HttpStatus.CONFLICT) code = 'CONFLICT';
      }
    } else {
      console.error('Unhandled Exception:', exception);
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
