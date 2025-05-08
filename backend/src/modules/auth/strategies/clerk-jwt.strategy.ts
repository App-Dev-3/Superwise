import { Injectable, UnauthorizedException, forwardRef, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { WinstonLoggerService } from '../../../common/logging/winston-logger.service';
import { User } from '@prisma/client';

@Injectable()
export class ClerkJwtStrategy extends PassportStrategy(Strategy, 'clerk-jwt') {
  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: WinstonLoggerService,
  ) {
    // ExtractJwt is a third-party library without proper TypeScript types
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const extractJwtFromBearer = ExtractJwt.fromAuthHeaderAsBearerToken();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      jwtFromRequest: extractJwtFromBearer,
      ignoreExpiration: false,
      secretOrKeyProvider: (
        request: unknown,
        rawJwtToken: string,
        done: (err: Error | null, secret: string | null) => void,
      ) => {
        const secret = this.configService.get<string>('CLERK_JWT_SECRET_KEY');

        if (!secret) {
          done(new Error('CLERK_JWT_SECRET_KEY not configured'), null);
          return;
        }

        done(null, secret);
      },
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    try {
      const clerkId = payload.sub;

      // Check cache first
      const cachedUser = await this.cacheManager.get<User>(`user:${clerkId}`);
      if (cachedUser) {
        return cachedUser;
      }

      // Find user by Clerk ID
      const user = await this.usersService.findUserByClerkId(clerkId);

      // Cache user data with TTL (20 minutes as recommended)
      await this.cacheManager.set(`user:${clerkId}`, user, 1200000);

      return user;
    } catch (error) {
      this.logger.error(
        `JWT validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'ClerkJwtStrategy',
      );
      throw new UnauthorizedException('Invalid token');
    }
  }
}
