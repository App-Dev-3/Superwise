import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { TagsRepository } from './tags.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TagsController],
  providers: [TagsService, TagsRepository],
  exports: [TagsService, TagsRepository],
})
export class TagsModule {}
