import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersRepository } from './users.repository';
import { TagsModule } from '../tags/tags.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, TagsModule, forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
