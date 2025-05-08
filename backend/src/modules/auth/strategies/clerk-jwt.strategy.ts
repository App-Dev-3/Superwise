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
import * as jwksClient from 'jwks-rsa';

@Injectable()
export class ClerkJwtStrategy extends PassportStrategy(Strategy, 'clerk-jwt') {
  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: WinstonLoggerService,
  ) {
    // Create a JWKS client to fetch the public key
    const jwksUri = 'https://heroic-python-12.clerk.accounts.dev/.well-known/jwks.json';

    // Create JWKS client for key retrieval
    const client = jwksClient({
      jwksUri,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    });

    // Function to get the signing key
    const secretOrKeyProvider = async (request: any, rawJwtToken: string, done: Function) => {
      try {
        // Extract the JWT header to get the key ID
        const tokenParts = rawJwtToken.split('.');
        if (tokenParts.length < 1) {
          return done(new UnauthorizedException('Invalid token format'));
        }

        const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
        const kid = header.kid;

        if (!kid) {
          return done(new UnauthorizedException('No key ID (kid) found in token header'));
        }

        // Get the signing key from the JWKS endpoint
        client.getSigningKey(kid, (err: Error, key: any) => {
          if (err) {
            logger.error(`Error getting signing key: ${err.message}`, 'ClerkJwtStrategy');
            return done(new UnauthorizedException('Unable to retrieve signing key'));
          }

          try {
            if (!key) {
              return done(new UnauthorizedException('No signing key found'));
            }
            const signingKey = key.getPublicKey();
            done(null, signingKey);
          } catch (keyErr) {
            logger.error(`Error extracting public key: ${keyErr.message}`, 'ClerkJwtStrategy');
            done(new UnauthorizedException('Error processing signing key'));
          }
        });
      } catch (error) {
        logger.error(`JWT validation error: ${error.message}`, error.stack, 'ClerkJwtStrategy');
        done(new UnauthorizedException('Invalid token structure'));
      }
    };

    // Initialize passport strategy
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKeyProvider,
      jsonWebTokenOptions: {
        ignoreNotBefore: true, // Ignore the nbf claim to prevent timing issues
        algorithms: ['RS256'],
      },
    });
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
      this.logger.error(
        `User authentication failed: ${error.message}`,
        error.stack,
        'ClerkJwtStrategy',
      );
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
