import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          'message' in data &&
          'data' in data
        ) {
          return data;
        }

        return {
          statusCode: response.statusCode,
          message: 'Success',
          data: Array.isArray(data)
            ? data
            : data !== null && typeof data === 'object'
              ? data
              : { value: data },
        };
      }),
    );
  }
}
