import { CallHandler, ExecutionContext, NestInterceptor, UnauthorizedException } from "@nestjs/common";

export class AuthTokenInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const req = context.switchToHttp().getRequest()
    const token = req.headers.authorization?.split(' ')[1]

    if (typeof token === "undefined" || token !== '12345') {
      throw new UnauthorizedException('Token invalido')
    }

    return next.handle()
  }
}