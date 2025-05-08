import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WinstonLoggerService } from '../logging/winston-logger.service';

@Injectable()
export class ClerkRegistrationGuard extends AuthGuard('clerk-registration') {
  constructor(private logger: WinstonLoggerService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Proceed with JWT validation without any additional checks
    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(err: Error | null, user: TUser, _info: unknown): TUser {
    // Handle errors from the Passport strategy
    if (err || !user) {
      this.logger.debug(
        `Registration authentication failed: ${err?.message || 'Invalid token'}`,
        'ClerkRegistrationGuard',
      );
      // Let the exception filter handle the error
      throw err || new UnauthorizedException('Registration authentication failed: Invalid token');
    }
    return user;
  }
}
