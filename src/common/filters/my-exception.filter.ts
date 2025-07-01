import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, Injectable } from "@nestjs/common";
import { response } from "express";

@Catch(BadRequestException)
@Injectable()
export class MyExceptionFilter<T extends BadRequestException> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse()

    const statusCode = exception.getStatus()

    const exceptionResponse = exception.getResponse()

    const error = typeof response === 'string' ? {
      message: exceptionResponse
    } : (exceptionResponse as object)
    

    response.status(statusCode).json({
      ...error,
      data: new Date().toISOString
    })
  }
}