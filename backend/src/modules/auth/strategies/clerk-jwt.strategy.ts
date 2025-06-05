import { Injectable, UnauthorizedException, forwardRef, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { WinstonLoggerService } from '../../../common/logging/winston-logger.service';
import { User } from '@prisma/client';
import * as jwksClient from 'jwks-rsa';
import { Request } from 'express';
import { AuthConfigService } from '@config';

interface JwtHeader {
  kid: string;
  alg: string;
  [key: string]: unknown;
}

interface SigningKey {
  getPublicKey(): string;
}

@Injectable()
export class ClerkJwtStrategy extends PassportStrategy(Strategy, 'clerk-jwt') {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: WinstonLoggerService,
    private readonly authConfig: AuthConfigService,
  ) {
    // Create a JWKS client to fetch the public key
    const jwksUri = authConfig.clerkJwksUri;

    // Create JWKS client for key retrieval
    const client = jwksClient({
      jwksUri,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    });

    // Function to get the signing key - using callback approach since jwksClient API is callback-based
    const secretOrKeyProvider = (
      request: Request,
      rawJwtToken: string,
      done: (err: Error | null, secret: string | null) => void,
    ): void => {
      try {
        // Extract the JWT header to get the key ID
        const tokenParts = rawJwtToken.split('.');
        if (tokenParts.length < 1) {
          return done(new UnauthorizedException('Invalid token format'), null);
        }

        const headerStr = Buffer.from(tokenParts[0], 'base64').toString();
        const header = JSON.parse(headerStr) as JwtHeader;
        const kid = header.kid;

        if (!kid) {
          return done(new UnauthorizedException('No key ID (kid) found in token header'), null);
        }

        // Get the signing key from the JWKS endpoint
        client.getSigningKey(kid, (err: Error | null, key?: SigningKey) => {
          if (err) {
            this.logger.error(`Error getting signing key: ${err.message}`, 'ClerkJwtStrategy');
            return done(new UnauthorizedException('Unable to retrieve signing key'), null);
          }

          try {
            if (!key) {
              return done(new UnauthorizedException('No signing key found'), null);
            }
            const signingKey = key.getPublicKey();
            done(null, signingKey);
          } catch (keyErr) {
            const errorMessage = keyErr instanceof Error ? keyErr.message : 'Unknown error';
            this.logger.error(`Error extracting public key: ${errorMessage}`, 'ClerkJwtStrategy');
            done(new UnauthorizedException('Error processing signing key'), null);
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        this.logger.error(`JWT validation error: ${errorMessage}`, errorStack, 'ClerkJwtStrategy');
        done(new UnauthorizedException('Invalid token structure'), null);
      }
    };

    // Initialize passport strategy with properly typed options
    const options: StrategyOptions = {
      // We need to use ExtractJwt as provided by passport-jwt library
      // eslint-disable-next-line max-len
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKeyProvider,
      jsonWebTokenOptions: {
        ignoreNotBefore: true,
        algorithms: ['RS256'],
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(options);
  }

  async validate(payload: JwtPayload): Promise<User> {
    try {
      const clerkId = payload.sub;

      // Check cache first for better performance
      const cachedUser = await this.cacheManager.get<User>(`user:${clerkId}`);
      if (cachedUser) {
        return cachedUser;
      }

      // Find user by Clerk ID
      const user = await this.usersService.findUserByClerkId(clerkId);

      // Cache user data (20 minutes TTL)
      await this.cacheManager.set(`user:${clerkId}`, user, 1200000);

      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `User authentication failed: ${errorMessage}`,
        errorStack,
        'ClerkJwtStrategy',
      );
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
