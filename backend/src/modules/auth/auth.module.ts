import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { ApiAuthMiddleware } from './middleware/api-auth.middleware';
import { SupervisorsController } from '../supervisors/supervisors.controller';
@Module({
  imports: [ConfigModule, UsersModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiAuthMiddleware)
      .forRoutes(AuthController, SupervisorsController);
  }
}
