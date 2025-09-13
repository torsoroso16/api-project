import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { Observable } from 'rxjs';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const ip = request.ip || request.connection.remoteAddress;
    const operation = ctx.getInfo().operation?.operation;
    const fieldName = ctx.getInfo().fieldName;

    // Special rate limiting for sensitive operations
    if (['login', 'register', 'forgotPassword'].includes(fieldName)) {
      const key = `rate_limit:${operation}:${fieldName}:${ip}`;
      const current = await this.redis.get(key);
      const limit = fieldName === 'login' ? 5 : 3; // 5 login attempts, 3 for others
      const windowSeconds = 900; // 15 minutes

      if (current && parseInt(current) >= limit) {
        throw new HttpException(
          'Too many attempts. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      await this.redis.multi()
        .incr(key)
        .expire(key, windowSeconds)
        .exec();
    }

    return next.handle();
  }
}