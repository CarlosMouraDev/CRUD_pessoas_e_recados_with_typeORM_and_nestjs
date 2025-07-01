import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { resolve } from 'path';
import { catchError, Observable, tap, throwError } from 'rxjs';

export class ErrorHandlingInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        catchError((error) => {
          return throwError(() => error);
        });
      }),
    );
  }
}
