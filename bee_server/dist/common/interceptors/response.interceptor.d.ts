import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
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
export declare class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>>;
}
