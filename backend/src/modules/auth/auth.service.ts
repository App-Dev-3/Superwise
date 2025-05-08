import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from '../../common/logging/winston-logger.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { verifyToken } from '@clerk/backend';

/**
 * This is a placeholder service for future Clerk authentication operations.
 *
 * IMPORTANT: This service is currently NOT USED in the application and is not decorated with @Injectable().
 * When needed in the future:
 * 1. Add the @Injectable() decorator
 * 2. Add to providers array in AuthModule
 * 3. Inject where needed
 *
 * For now, authentication is handled directly by the Passport strategies.
 */
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonLoggerService,
  ) {}

  /**
   * Verifies a Clerk JWT token and returns the decoded payload
   * @param token The Clerk JWT token to verify
   * @returns The decoded token payload
   * @throws UnauthorizedException if the token is invalid
   */
  async verifyClerkToken(token: string): Promise<JwtPayload> {
    try {
      this.logger.debug('Verifying Clerk token', 'AuthService');

      const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
      if (!secretKey) {
        throw new Error('CLERK_SECRET_KEY not configured');
      }

      // Verify the token using Clerk's specialized verification
      const verifiedToken = await verifyToken(token, {
        secretKey,
      });

      // Extract the relevant fields for our JwtPayload interface
      const payload: JwtPayload = {
        sub: verifiedToken.sub,
        email: verifiedToken.email as string,
        exp: verifiedToken.exp,
      };

      return payload;
    } catch (error) {
      this.logger.error(
        `Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'AuthService',
      );
      throw new UnauthorizedException('Invalid token');
    }
  }
}
