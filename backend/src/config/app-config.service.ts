import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from './environment.validation';

/**
 * Configuration service for application-wide settings
 *
 * Provides type-safe access to validated environment variables
 * related to general application configuration including environment,
 * port, allowed email domains, and frontend integration settings.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Gets the current Node.js environment
   *
   * @returns The environment enum value (development, production, test)
   */
  get nodeEnv(): Environment {
    return this.configService.get<Environment>('NODE_ENV')!;
  }

  /**
   * Gets the port number for the application server
   *
   * @returns Port number between 1 and 65535
   */
  get port(): number {
    return this.configService.get<number>('PORT')!;
  }

  /**
   * Gets the frontend host URL for CORS configuration
   *
   * This URL is used to configure CORS origins and ensure
   * only the authorized frontend can communicate with this API.
   *
   * @returns Frontend host URL (e.g., "http://localhost:3000")
   */
  get frontendHost(): string {
    return this.configService.get<string>('FRONTEND_HOST')!;
  }

  /**
   * Gets the list of allowed email domains for user registration
   *
   * Converts the comma-separated ALLOWED_EMAIL_DOMAINS environment
   * variable into an array of domain strings. These domains are used
   * to validate email addresses during user registration and authentication.
   *
   * @returns Array of allowed email domain strings (e.g., ["fhstp.ac.at", "example.com"])
   */
  get allowedEmailDomains(): string[] {
    const domains = this.configService.get<string>('ALLOWED_EMAIL_DOMAINS')!;
    return domains.split(',').map(domain => domain.trim());
  }

  /**
   * Gets the cooldown period for supervision requests in days
   *
   * This setting controls how many days a student must wait before
   * sending another supervision request to the same supervisor after
   * a previous request was rejected or withdrawn.
   *
   * @returns Number of days between 1 and 365
   */
  get supervisionRequestCooldownDays(): number {
    return this.configService.get<number>('SUPERVISION_REQUEST_COOLDOWN_DAYS')!;
  }

  /**
   * Checks if the application is running in development mode
   *
   * @returns True if NODE_ENV is 'development'
   */
  get isDevelopment(): boolean {
    return this.nodeEnv === Environment.Development;
  }

  /**
   * Checks if the application is running in production mode
   *
   * @returns True if NODE_ENV is 'production'
   */
  get isProduction(): boolean {
    return this.nodeEnv === Environment.Production;
  }

  /**
   * Checks if the application is running in test mode
   *
   * @returns True if NODE_ENV is 'test'
   */
  get isTest(): boolean {
    return this.nodeEnv === Environment.Test;
  }
}
