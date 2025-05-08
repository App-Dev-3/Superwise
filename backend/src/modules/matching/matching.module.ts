import { Module } from '@nestjs/common';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SupervisorsModule } from '../supervisors/supervisors.module';
import { UsersModule } from '../users/users.module';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [PrismaModule, SupervisorsModule, UsersModule, TagsModule],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
