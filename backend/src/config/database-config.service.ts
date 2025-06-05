import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Gets the raw database URL from environment variables
   * @returns The complete database connection URL
   */
  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL')!;
  }

  /**
   * Validates if a URL string is a valid PostgreSQL connection URL
   * @param url - The URL string to validate
   * @returns Object containing validation result and parsed URL if valid
   * @private
   */
  private validateDatabaseUrl(url: string): { isValid: boolean; parsedUrl?: URL; error?: string } {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return {
        isValid: false,
        error: `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }

    // Validate PostgreSQL-specific requirements
    if (parsedUrl.protocol !== 'postgresql:') {
      return {
        isValid: false,
        error: `Invalid protocol: Expected 'postgresql:', got '${parsedUrl.protocol}'`,
      };
    }

    if (!parsedUrl.hostname) {
      return {
        isValid: false,
        error: 'Database URL must include a hostname',
      };
    }

    if (!parsedUrl.pathname || parsedUrl.pathname === '/') {
      return {
        isValid: false,
        error: 'Database URL must include a database name in the path',
      };
    }

    return { isValid: true, parsedUrl };
  }

  /**
   * Parses the database URL to extract connection details
   * WARNING: Contains sensitive password information - use carefully
   * Format: postgresql://username:password@host:port/database
   *
   * @returns Object containing all connection details including password
   * @internal This method exposes sensitive credentials
   * @throws Error if the database URL is invalid or malformed
   */
  get connectionDetails() {
    const url = this.databaseUrl;
    const validation = this.validateDatabaseUrl(url);

    if (!validation.isValid) {
      throw new Error(`Invalid database URL configuration: ${validation.error}`);
    }

    const urlObj = validation.parsedUrl!;

    return {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 5432,
      username: urlObj.username,
      password: urlObj.password,
      database: urlObj.pathname.slice(1), // Remove leading slash
      schema: urlObj.searchParams.get('schema') || 'public',
    };
  }

  /**
   * Gets the database host
   * @returns Database hostname
   */
  get host(): string {
    return this.connectionDetails.host;
  }

  /**
   * Gets the database port
   * @returns Database port number
   */
  get port(): number {
    return this.connectionDetails.port;
  }

  /**
   * Gets the database username
   * @returns Database username
   */
  get username(): string {
    return this.connectionDetails.username;
  }

  /**
   * Gets the database name
   * @returns Database name
   */
  get database(): string {
    return this.connectionDetails.database;
  }

  /**
   * Gets the database schema
   * @returns Database schema name
   */
  get schema(): string {
    return this.connectionDetails.schema;
  }
}
