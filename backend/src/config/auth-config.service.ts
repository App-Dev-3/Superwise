import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Configuration service for authentication-related settings
 *
 * Provides type-safe access to validated environment variables
 * related to Clerk authentication integration, including JWKS
 * endpoints and domain extraction utilities.
 */
@Injectable()
export class AuthConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Gets the Clerk JWKS (JSON Web Key Set) URI for JWT verification
   *
   * This URI is used by the authentication system to fetch public keys
   * for verifying JWT tokens issued by Clerk. The URI must be a valid
   * HTTPS endpoint pointing to a Clerk domain's well-known JWKS endpoint.
   *
   * @returns The complete JWKS URI (e.g., "https://vital-pelican-84.clerk.accounts.dev/.well-known/jwks.json")
   */
  get clerkJwksUri(): string {
    return this.configService.get<string>('CLERK_JWKS_URI')!;
  }

  /**
   * Extracts the Clerk domain from the JWKS URI
   *
   * Parses the JWKS URI to extract just the domain portion, which can
   * be useful for domain-based validation or logging purposes.
   *
   * @returns The Clerk domain (e.g., "vital-pelican-84.clerk.accounts.dev")
   * @example "vital-pelican-84.clerk.accounts.dev"
   */
  get clerkDomain(): string {
    const url = new URL(this.clerkJwksUri);
    return url.hostname;
  }
}
