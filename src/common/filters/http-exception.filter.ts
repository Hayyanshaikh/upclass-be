import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message =
      statusCode >= 500 ? 'Internal server error' : 'Request failed';

    let errors: string[] = [];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      const body = exceptionResponse as {
        message?: string | string[];
        errors?: string[];
      };

      if (Array.isArray(body.message)) {
        message = 'Validation failed.';
        errors = body.message;
      } else if (typeof body.message === 'string') {
        message = body.message;
      }

      if (Array.isArray(body.errors)) {
        errors = body.errors;
      }
    }

    response.status(statusCode).json({
      statusCode,
      message,
      data: {
        errors,
      },
    });
  }
}
