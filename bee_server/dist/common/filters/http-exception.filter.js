"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = '服务器内部错误';
        let code = 'INTERNAL_ERROR';
        let errors = undefined;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
            }
            else if (typeof res === 'object') {
                message = res.message || message;
                errors = res.errors;
            }
            code = this.getCodeFromStatus(status);
        }
        else if (exception instanceof Error) {
            const err = exception;
            if (err.code === 'P2002') {
                status = common_1.HttpStatus.CONFLICT;
                message = '数据已存在，请勿重复操作';
                code = 'DUPLICATE_ENTRY';
            }
            else if (err.code === 'P2025') {
                status = common_1.HttpStatus.NOT_FOUND;
                message = '请求的资源不存在';
                code = 'NOT_FOUND';
            }
            else {
                message = err.message || message;
            }
        }
        this.logger.error(`${request.method} ${request.url} → ${status} ${code}: ${message}`, exception instanceof Error ? exception.stack : undefined);
        response.status(status).json({
            success: false,
            code,
            message: Array.isArray(message) ? message[0] : message,
            errors: Array.isArray(message) ? message : errors,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
    getCodeFromStatus(status) {
        const map = {
            400: 'BAD_REQUEST', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN',
            404: 'NOT_FOUND', 409: 'CONFLICT', 422: 'UNPROCESSABLE',
            429: 'TOO_MANY_REQUESTS', 500: 'INTERNAL_ERROR',
        };
        return map[status] || 'UNKNOWN';
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map