import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';
import { DatabaseListenerService } from './database-listener.service';
import { LoggerModule } from '../logging/logger.module';
import { CacheConfigService } from '../../config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      inject: [CacheConfigService],
      useFactory: (cacheConfig: CacheConfigService) => ({
        store: redisStore,
        host: cacheConfig.redisHost,
        port: cacheConfig.redisPort,
        ttl: cacheConfig.userCacheTtl,
        max: cacheConfig.cacheMaxItems,
        // Memory management configuration
        // redis-cli config: maxmemory 128mb
        // redis-cli config: maxmemory-policy allkeys-lru
      }),
    }),
    LoggerModule,
  ],
  providers: [CacheService, DatabaseListenerService],
  exports: [CacheService, DatabaseListenerService],
})
export class CacheModule {}
