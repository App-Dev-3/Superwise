import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { ApiAuthGuard } from './guards/api-auth.guard';

@Module({
  imports: [ConfigModule, UsersModule, PrismaModule],
  providers: [AuthService, ApiAuthGuard], 
  exports: [AuthService, ApiAuthGuard],   
})
export class AuthModule {}