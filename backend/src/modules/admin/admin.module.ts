import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { PrismaModule } from '../../prisma/prisma.module';
import { TagsModule } from '../tags/tags.module';
import { SupervisorsModule } from '../supervisors/supervisors.module';

@Module({
  imports: [PrismaModule, TagsModule, SupervisorsModule],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository],
})
export class AdminModule {}
