import { Module, Provider } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

// Provide exception filters in the correct order (most specific to least specific)
const exceptionFilters: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: PrismaExceptionFilter,
  },
  {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter,
  },
  {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  },
];

@Module({
  providers: [...exceptionFilters],
})
export class ExceptionsModule {}
