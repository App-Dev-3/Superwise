import { plainToInstance, Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
  Max,
  Min,
  Matches,
  validateSync,
} from 'class-validator';

/**
 * Application environment types
 *
 * Defines the valid NODE_ENV values that the application
 * supports for different deployment scenarios.
 */
export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Environment variables validation schema
 *
 * Defines all required environment variables with their validation rules.
 * This class is used by the configuration module to ensure all necessary
 * environment variables are present and valid before the application starts.
 *
 * All properties use class-validator decorators to enforce specific
 * constraints on format, type, and value ranges. This prevents the
 * application from starting with invalid configuration.
 */
export class EnvironmentVariables {
  /**
   * Node.js environment setting
   *
   * Must be one of: development, production, test
   */
  @IsEnum(Environment, {
    message: 'NODE_ENV must be one of: development, production, test',
  })
  NODE_ENV: Environment;

  /**
   * Server port number
   *
   * Must be a valid port number between 1 and 65535
   */
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt({ message: 'PORT must be an integer' })
  @Min(1, { message: 'PORT must be greater than 0' })
  @Max(65535, { message: 'PORT must be less than 65536' })
  PORT: number;

  /**
   * Comma-separated list of allowed email domains
   *
   * Must be a string containing valid domain names separated by commas.
   * Example: "fhstp.ac.at,example.com"
   */
  @IsNotEmpty({ message: 'ALLOWED_EMAIL_DOMAINS is required' })
  @IsString({ message: 'ALLOWED_EMAIL_DOMAINS must be a string' })
  @Matches(/^[a-zA-Z0-9.-]+(\.[a-zA-Z]{2,})(,[a-zA-Z0-9.-]+(\.[a-zA-Z]{2,}))*$/, {
    message:
      'ALLOWED_EMAIL_DOMAINS must be comma-separated domain names (e.g. fhstp.ac.at,test.org)',
  })
  ALLOWED_EMAIL_DOMAINS: string;

  /**
   * Frontend application host URL
   *
   * Used for CORS configuration to allow the frontend to communicate
   * with this API. Must be a valid URL.
   */
  @IsNotEmpty({ message: 'FRONTEND_HOST is required' })
  @IsString({ message: 'FRONTEND_HOST must be a string' })
  FRONTEND_HOST: string;

  /**
   * PostgreSQL database connection URL
   *
   * Must be a valid PostgreSQL connection string starting with postgresql://
   * Format: postgresql://username:password@host:port/database?schema=public
   */
  @IsNotEmpty({ message: 'DATABASE_URL is required' })
  @IsString({ message: 'DATABASE_URL must be a string' })
  @Matches(/^postgresql:\/\/.*/, {
    message:
      'DATABASE_URL must be a valid PostgreSQL connection string starting with postgresql://',
  })
  DATABASE_URL: string;

  /**
   * Supervision request cooldown period in days
   *
   * Defines how many days a student must wait before sending another
   * supervision request to the same supervisor after rejection or withdrawal.
   * Must be between 1 and 365 days.
   */
  @Transform(({ value }) => parseInt(String(value), 10))
  @IsInt({ message: 'SUPERVISION_REQUEST_COOLDOWN_DAYS must be an integer' })
  @Min(1, { message: 'SUPERVISION_REQUEST_COOLDOWN_DAYS must be at least 1 day' })
  @Max(365, { message: 'SUPERVISION_REQUEST_COOLDOWN_DAYS must be less than 365 days' })
  SUPERVISION_REQUEST_COOLDOWN_DAYS: number;

  /**
   * Clerk JWKS URI for JWT token verification
   *
   * Must be a valid HTTPS URL pointing to a Clerk JWKS endpoint.
   * Used by the authentication system to verify JWT tokens.
   */
  @IsNotEmpty({ message: 'CLERK_JWKS_URI is required' })
  @IsUrl(
    { require_tld: true, require_protocol: true },
    {
      message: 'CLERK_JWKS_URI must be a valid HTTPS URL',
    },
  )
  @Matches(/^https:\/\/.*\/\.well-known\/jwks\.json$/, {
    message: 'CLERK_JWKS_URI must be a valid HTTPS URL ending with /.well-known/jwks.json',
  })
  CLERK_JWKS_URI: string;
}

/**
 * Validates and transforms environment variables
 *
 * This function is called during application startup to ensure all
 * required environment variables are present and valid. It uses the
 * EnvironmentVariables class schema to validate each variable according
 * to its defined constraints.
 *
 * If validation fails, the function throws an error with detailed
 * information about which variables are invalid and why, preventing
 * the application from starting with invalid configuration.
 *
 * @param config - Raw environment variables object from process.env
 * @returns Validated and transformed environment variables object
 * @throws Error if any environment variable is missing or invalid
 */
export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  // Only extract the variables we care about
  const relevantConfig = {
    NODE_ENV: config.NODE_ENV,
    PORT: config.PORT,
    ALLOWED_EMAIL_DOMAINS: config.ALLOWED_EMAIL_DOMAINS,
    FRONTEND_HOST: config.FRONTEND_HOST,
    DATABASE_URL: config.DATABASE_URL,
    SUPERVISION_REQUEST_COOLDOWN_DAYS: config.SUPERVISION_REQUEST_COOLDOWN_DAYS,
    CLERK_JWKS_URI: config.CLERK_JWKS_URI,
  };

  const validatedConfig = plainToInstance(EnvironmentVariables, relevantConfig, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map(error => {
        const constraints = error.constraints ? Object.values(error.constraints) : [];
        return `${error.property}: ${constraints.join(', ')}`;
      })
      .join('\n');

    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  return validatedConfig;
}
