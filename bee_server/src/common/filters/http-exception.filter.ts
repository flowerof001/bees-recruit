import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 'INTERNAL_ERROR';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        message = (res as any).message || message;
        errors = (res as any).errors;
      }
      code = this.getCodeFromStatus(status);
    } else if (exception instanceof Error) {
      // 数据库相关错误
      const err = exception as any;
      if (err.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = '数据已存在，请勿重复操作';
        code = 'DUPLICATE_ENTRY';
      } else if (err.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = '请求的资源不存在';
        code = 'NOT_FOUND';
      } else {
        message = err.message || message;
      }
    }

    this.logger.error(
      `${request.method} ${request.url} → ${status} ${code}: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      success: false,
      code,
      message: Array.isArray(message) ? message[0] : message,
      errors: Array.isArray(message) ? message : errors,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private getCodeFromStatus(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN',
      404: 'NOT_FOUND', 409: 'CONFLICT', 422: 'UNPROCESSABLE',
      429: 'TOO_MANY_REQUESTS', 500: 'INTERNAL_ERROR',
    };
    return map[status] || 'UNKNOWN';
  }
}
