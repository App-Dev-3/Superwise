import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { WinstonLoggerService } from '../logging/winston-logger.service';

@Injectable()
export class ClerkAuthGuard extends AuthGuard('clerk-jwt') {
  constructor(
    private reflector: Reflector,
    private logger: WinstonLoggerService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if the route is marked as public using @Public decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Skip authentication for public routes
    if (isPublic) {
      return true;
    }

    // For non-public routes, proceed with JWT validation
    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest<TUser = unknown>(err: Error | null, user: TUser, _info: unknown): TUser {
    // Handle errors from the Passport strategy
    if (err || !user) {
      this.logger.debug(
        `Authentication failed: ${err?.message || 'User not found'}`,
        'ClerkAuthGuard',
      );
      // Let the exception filter handle the error
      throw err || new UnauthorizedException('Authentication failed: User not found');
    }
    return user;
  }
}
