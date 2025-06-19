import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Cache configuration service
 * Manages Redis connection settings and cache TTL values
 */
@Injectable()
export class CacheConfigService {
  constructor(private configService: ConfigService) {}

  /**
   * Redis host address
   */
  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  /**
   * Redis port number
   */
  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  /**
   * Default cache TTL for users (in milliseconds)
   */
  get userCacheTtl(): number {
    return this.configService.get<number>('USER_CACHE_TTL', 1200000); // 20 minutes
  }

  /**
   * Default cache TTL for tag similarities (in milliseconds)
   */
  get tagSimilarityCacheTtl(): number {
    return this.configService.get<number>('TAG_SIMILARITY_CACHE_TTL', 86400000); // 24 hours
  }

  /**
   * Maximum number of items in cache
   */
  get cacheMaxItems(): number {
    return this.configService.get<number>('CACHE_MAX_ITEMS', 1000);
  }
}
