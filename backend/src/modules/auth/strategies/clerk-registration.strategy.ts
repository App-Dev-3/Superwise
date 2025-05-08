import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { WinstonLoggerService } from '../../../common/logging/winston-logger.service';
import * as jwksClient from 'jwks-rsa';

@Injectable()
export class ClerkRegistrationStrategy extends PassportStrategy(Strategy, 'clerk-registration') {
  constructor(
    private readonly configService: ConfigService,
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
            logger.error(`Error getting signing key: ${err.message}`, 'ClerkRegistrationStrategy');
            return done(new UnauthorizedException('Unable to retrieve signing key'));
          }

          try {
            if (!key) {
              return done(new UnauthorizedException('No signing key found'));
            }
            const signingKey = key.getPublicKey();
            done(null, signingKey);
          } catch (keyErr) {
            logger.error(
              `Error extracting public key: ${keyErr.message}`,
              'ClerkRegistrationStrategy',
            );
            done(new UnauthorizedException('Error processing signing key'));
          }
        });
      } catch (error) {
        logger.error(
          `JWT validation error: ${error.message}`,
          error.stack,
          'ClerkRegistrationStrategy',
        );
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

    logger.debug(
      `Initialized ClerkRegistrationStrategy with JWKS URI: ${jwksUri}`,
      'ClerkRegistrationStrategy',
    );
  }

  validate(payload: JwtPayload): { clerk_id: string; email: string; exp: number } {
    try {
      // For registration, extract and return the claims without DB lookup
      return {
        clerk_id: payload.sub,
        email: payload.email,
        exp: payload.exp,
      };
    } catch (error) {
      this.logger.error(
        `Registration validation error: ${error.message}`,
        error.stack,
        'ClerkRegistrationStrategy',
      );
      throw new UnauthorizedException('Invalid token payload');
    }
  }
}
