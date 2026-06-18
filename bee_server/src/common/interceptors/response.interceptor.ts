import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: boolean;
  code: string;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => {
        const response: StandardResponse<T> = {
          success: true,
          code: 'OK',
          data,
        };
        // 如果 data 中有分页信息，提取到 meta
        if (data && typeof data === 'object' && 'items' in data && 'total' in data) {
          response.data = data.items;
          response.meta = {
            page: data.page,
            pageSize: data.pageSize,
            total: data.total,
            totalPages: data.totalPages,
          };
        }
        return response;
      }),
    );
  }
}
