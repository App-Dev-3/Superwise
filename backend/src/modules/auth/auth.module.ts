import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ClerkJwtStrategy } from './strategies/clerk-jwt.strategy';
import { ClerkRegistrationStrategy } from './strategies/clerk-registration.strategy';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from '../../common/logging/logger.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'clerk-jwt' }),
    forwardRef(() => UsersModule),
    ConfigModule,
    CacheModule.register({
      ttl: 1200000, // 20 minutes
      max: 100, // maximum number of items in cache
      isGlobal: true,
    }),
    LoggerModule,
  ],
  providers: [ClerkJwtStrategy, ClerkRegistrationStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
