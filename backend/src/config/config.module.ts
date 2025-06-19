import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './app-config.service';
import { DatabaseConfigService } from './database-config.service';
import { AuthConfigService } from './auth-config.service';
import { CacheConfigService } from './cache-config.service';
import { validateEnvironment } from './environment.validation';

/**
 * Global configuration module for the Superwise application
 *
 * This module provides centralized, type-safe access to all environment
 * variables and configuration settings. It validates all environment
 * variables at startup to ensure the application cannot start with
 * invalid configuration.
 *
 * The module is marked as @Global() to make configuration services
 * available throughout the entire application without needing to
 * import this module in every feature module.
 *
 *
 * @see AppConfigService - General application settings
 * @see DatabaseConfigService - Database connection settings
 * @see AuthConfigService - Authentication configuration
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnvironment,
      cache: true, // Cache configuration for better performance
    }),
  ],
  providers: [AppConfigService, DatabaseConfigService, AuthConfigService, CacheConfigService],
  exports: [AppConfigService, DatabaseConfigService, AuthConfigService, CacheConfigService],
})
export class SuperwiseConfigModule {}
