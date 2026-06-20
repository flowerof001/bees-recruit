import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class ThrottleGuard implements CanActivate {
    private store;
    private readonly windowMs;
    private readonly maxRequests;
    private cleanupInterval;
    constructor();
    canActivate(context: ExecutionContext): boolean;
    private cleanup;
}
