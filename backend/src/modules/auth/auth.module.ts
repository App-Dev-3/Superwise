import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ClerkJwtStrategy } from './strategies/clerk-jwt.strategy';
import { ClerkRegistrationStrategy } from './strategies/clerk-registration.strategy';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../../common/logging/logger.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'clerk-jwt' }),
    forwardRef(() => UsersModule),
    ConfigModule,
    LoggerModule,
  ],
  providers: [ClerkJwtStrategy, ClerkRegistrationStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
