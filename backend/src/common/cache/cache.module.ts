import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';
import { DatabaseListenerService } from './database-listener.service';
import { LoggerModule } from '../logging/logger.module';

@Global()
@Module({
  imports: [
    // Simple Redis configuration for development
    NestCacheModule.register({
      isGlobal: true,
      ttl: 1200000, // Default TTL: 20 minutes
      max: 1000, // Max items in cache
      // Simple Redis config for development
      store: redisStore,
      host: 'localhost',
      port: 6379,
      // Simple memory limit - 128MB should be plenty for our app (can be actived here if needed)
      // redis-cli config: maxmemory 128mb
      // redis-cli config: maxmemory-policy allkeys-lru
    }),
    LoggerModule,
  ],
  providers: [CacheService, DatabaseListenerService],
  exports: [CacheService, DatabaseListenerService],
})
export class CacheModule {}
