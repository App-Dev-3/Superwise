import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { TagsModule } from './modules/tags/tags.module';
import { CommonModule } from './common/common.module';
import { AdminModule } from './modules/admin/admin.module';
import { SupervisorsModule } from './modules/supervisors/supervisors.module';
import { StudentsModule } from './modules/students/students.module';
import { MatchingModule } from './modules/matching/matching.module';
import { AuthModule } from './modules/auth/auth.module';
import { RequestsModule } from './modules/requests/requests.module';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './common/guards/clerk-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { SuperwiseConfigModule } from './config/config.module';

@Module({
  imports: [
    SuperwiseConfigModule,
    PrismaModule,
    UsersModule,
    TagsModule,
    SupervisorsModule,
    StudentsModule,
    CommonModule,
    AdminModule,
    MatchingModule,
    AuthModule,
    RequestsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Register ClerkAuthGuard as global guard (first in execution order)
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    // Register RolesGuard as global guard (second in execution order)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
