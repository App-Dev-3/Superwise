import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { WinstonLoggerService } from '../../../common/logging/winston-logger.service';

@Injectable()
export class ClerkRegistrationStrategy extends PassportStrategy(Strategy, 'clerk-registration') {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    // Create extractors outside constructor to avoid ESLint unsafe calls
    const jwtExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();

    super({
      jwtFromRequest: jwtExtractor,
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

  validate(payload: JwtPayload): { clerk_id: string; email: string; exp: number } {
    try {
      this.logger.debug(
        `Registration JWT validation for clerk_id: ${payload.sub}, email: ${payload.email}`,
        'ClerkRegistrationStrategy',
      );

      // For registration, we only need to extract and return the claims
      // without looking up the user in the database
      return {
        clerk_id: payload.sub,
        email: payload.email, // Email from Clerk JWT, verified by Clerk
        exp: payload.exp, // Include expiration time for consistency
      };
    } catch (error) {
      this.logger.error(
        `Registration JWT validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'ClerkRegistrationStrategy',
      );
      throw error;
    }
  }
}
