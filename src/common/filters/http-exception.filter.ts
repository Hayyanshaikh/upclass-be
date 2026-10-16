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

    let data: string[] = [];

    if (typeof exceptionResponse === 'string') {
      data = [exceptionResponse];
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      const body = exceptionResponse as {
        message?: string | string[];
        errors?: string[];
      };

      if (Array.isArray(body.errors)) {
        data = body.errors;
      } else if (Array.isArray(body.message)) {
        data = body.message;
      } else if (typeof body.message === 'string') {
        data = [body.message];
      }
    } else {
      data = ['An unexpected error occurred.'];
    }

    response.status(statusCode).json({
      statusCode,
      data,
    });
  }
}
