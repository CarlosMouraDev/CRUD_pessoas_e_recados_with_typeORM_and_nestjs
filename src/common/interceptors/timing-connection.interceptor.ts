import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { resolve } from "path";
import { Observable, tap } from "rxjs";

export class TimingConnectionInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const now = Date.now()
    console.log('executado')

    await new Promise(resolve => setTimeout(resolve, 10000))

    return next.handle().pipe(
      tap(() => {
        const finalTime = Date.now()
        const elapsed = finalTime - now
        console.log('depois, ' + elapsed)
      })
    )
  }
}