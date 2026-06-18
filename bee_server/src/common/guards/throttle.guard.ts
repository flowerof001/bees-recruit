import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class ThrottleGuard implements CanActivate {
  private store = new Map<string, RateLimitEntry>();
  private readonly windowMs = 60_000;   // 1 分钟窗口
  private readonly maxRequests = 100;    // 每窗口最多 100 次
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = request.ip || 'unknown';
    const now = Date.now();

    let entry = this.store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + this.windowMs };
      this.store.set(key, entry);
    }

    entry.count++;
    if (entry.count > this.maxRequests) {
      throw new HttpException('请求过于频繁，请稍后再试', HttpStatus.TOO_MANY_REQUESTS);
    }

    // 设置限流头
    const response = context.switchToHttp().getResponse();
    response.header('X-RateLimit-Limit', this.maxRequests);
    response.header('X-RateLimit-Remaining', Math.max(0, this.maxRequests - entry.count));
    response.header('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) this.store.delete(key);
    }
  }
}
