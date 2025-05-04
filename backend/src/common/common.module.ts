import { Module } from '@nestjs/common';
import { LoggerModule } from './logging/logger.module';
import { ExceptionsModule } from './exceptions/exceptions.module';

@Module({
  imports: [LoggerModule, ExceptionsModule],
  exports: [LoggerModule],
})
export class CommonModule {}
