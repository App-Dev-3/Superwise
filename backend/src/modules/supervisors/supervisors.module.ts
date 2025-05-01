import { Module } from '@nestjs/common';
import { SupervisorsController } from './supervisors.controller';
import { SupervisorsService } from './supervisors.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { SupervisorRepository } from './supervisor.repository';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [SupervisorsController],
  providers: [SupervisorsService, SupervisorRepository],
  exports: [SupervisorsService, SupervisorRepository],
})
export class SupervisorsModule {}
