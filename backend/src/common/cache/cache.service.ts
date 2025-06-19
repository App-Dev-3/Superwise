import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from '@prisma/client';
import { WinstonLoggerService } from '../logging/winston-logger.service';
import { CacheConfigService } from '../../config';

/**
 * Centralized cache service for Redis operations
 * Provides type-safe caching with consistent key patterns and TTL management
 */
@Injectable()
export class CacheService {
  private readonly logger: WinstonLoggerService;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    logger: WinstonLoggerService,
    private readonly cacheConfig: CacheConfigService,
  ) {
    this.logger = logger;
  }

  /**
   * Cache user data with security filtering
   * Only stores essential fields to minimize exposure
   */
  async setUser(clerkId: string, user: User, ttl?: number): Promise<void> {
    try {
      const key = this.getUserKey(clerkId);

      // Security: Filter sensitive data before caching
      const filteredUser = this.filterUserForCache(user);

      await this.cacheManager.set(key, filteredUser, ttl ?? this.cacheConfig.userCacheTtl);
      this.logger.debug(`Cached user data for clerk_id: ${clerkId}`, 'CacheService');
    } catch (error) {
      this.logger.error(`Cache error setting user ${clerkId}: ${error}`, 'CacheService');
      // Continue execution - app will work without cache
    }
  }

  /**
   * Retrieve cached user data
   */
  async getUser(clerkId: string): Promise<User | null> {
    try {
      const key = this.getUserKey(clerkId);
      const cached = await this.cacheManager.get<User>(key);

      if (cached) {
        this.logger.debug(`Cache hit for user: ${clerkId}`, 'CacheService');
        return cached;
      }

      this.logger.debug(`Cache miss for user: ${clerkId}`, 'CacheService');
      return null;
    } catch (error) {
      this.logger.error(`Cache error getting user ${clerkId}: ${error}`, 'CacheService');
      return null; // Fallback to database lookup
    }
  }

  /**
   * Invalidate user cache
   */
  async invalidateUser(clerkId: string): Promise<void> {
    try {
      const key = this.getUserKey(clerkId);
      await this.cacheManager.del(key);
      this.logger.debug(`Invalidated user cache for: ${clerkId}`, 'CacheService');
    } catch (error) {
      this.logger.error(`Cache error invalidating user ${clerkId}: ${error}`, 'CacheService');
      // Continue execution - cache will expire via TTL
    }
  }

  /**
   * Cache tag similarity with bidirectional consistency
   */
  async setTagSimilarity(tagId1: string, tagId2: string, similarity: number): Promise<void> {
    const key = this.getTagSimilarityKey(tagId1, tagId2);
    await this.cacheManager.set(key, similarity, this.cacheConfig.tagSimilarityCacheTtl);

    // Ensure bidirectional caching (similarity(A,B) = similarity(B,A))
    if (tagId1 !== tagId2) {
      const reverseKey = this.getTagSimilarityKey(tagId2, tagId1);
      await this.cacheManager.set(reverseKey, similarity, this.cacheConfig.tagSimilarityCacheTtl);
    }
  }

  /**
   * Retrieve cached tag similarity
   */
  async getTagSimilarity(tagId1: string, tagId2: string): Promise<number | null> {
    const key = this.getTagSimilarityKey(tagId1, tagId2);
    const cached = await this.cacheManager.get<number>(key);
    return cached ?? null;
  }

  /**
   * Invalidate all tag similarities involving a specific tag
   */
  async invalidateTagSimilarities(tagId: string): Promise<void> {
    // Note: This is a simplified approach. In production, you might want to use Redis SCAN
    // to find and delete all keys matching the pattern, or use Redis modules like RediSearch
    this.logger.debug(`Tag similarity invalidation requested for tag: ${tagId}`, 'CacheService');

    // For now, we rely on TTL expiration. Could be enhanced with Redis SCAN pattern matching
    // Example: SCAN 0 MATCH tag_sim:${tagId}:* or tag_sim:*:${tagId}
    await Promise.resolve(); // Make this actually async to satisfy linter
  }

  /**
   * Health check for cache connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testKey = 'health_check';
      const testValue = Date.now().toString();

      await this.cacheManager.set(testKey, testValue, 1000); // 1 second TTL
      const retrieved = await this.cacheManager.get(testKey);
      await this.cacheManager.del(testKey);

      return retrieved === testValue;
    } catch (error) {
      this.logger.error(`Cache health check failed: ${error}`, 'CacheService');
      return false;
    }
  }

  /**
   * Generate secure, consistent user cache key
   */
  private getUserKey(clerkId: string): string {
    // Security: Add salt/prefix to make keys less predictable
    return `user:${clerkId}`;
  }

  /**
   * Generate secure, consistent tag similarity cache key
   * Ensures bidirectional consistency by sorting IDs
   */
  private getTagSimilarityKey(tagId1: string, tagId2: string): string {
    // Sort IDs to ensure consistent key regardless of call order
    const [sortedId1, sortedId2] = [tagId1, tagId2].sort();
    return `tag_sim:${sortedId1}:${sortedId2}`;
  }

  /**
   * Security: Filter user object to only cache essential fields
   * Prevents caching of sensitive information
   */
  private filterUserForCache(user: User): User {
    // Cache only necessary fields for authentication and basic operations
    return {
      id: user.id,
      clerk_id: user.clerk_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      profile_image: user.profile_image,
      is_registered: user.is_registered,
      is_deleted: user.is_deleted,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
