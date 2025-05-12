import { Module } from '@nestjs/common';
import { LoggerModule } from './logging/logger.module';
import { ExceptionsModule } from './exceptions/exceptions.module';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { ClerkRegistrationGuard } from './guards/clerk-registration.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [LoggerModule, ExceptionsModule],
  providers: [ClerkAuthGuard, ClerkRegistrationGuard, RolesGuard],
  exports: [LoggerModule, ClerkAuthGuard, ClerkRegistrationGuard, RolesGuard],
})
export class CommonModule {}
