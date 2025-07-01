import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { resolve } from "path";
import { catchError, Observable, tap, throwError } from "rxjs";

export class ErrorHandlingInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const now = Date.now()
    console.log('executado')

    return next.handle().pipe(
      tap(() => {
        catchError(error => {
          console.log('deu erro')
          return throwError(() => error)
        })
      })
    )
  }
}