import { Module } from '@nestjs/common';
import { SupervisionRequestsController } from './supervision-requests.controller';
import { SupervisionRequestsService } from './supervision-requests.service';
import { SupervisionRequestsRepository } from './supervision-requests.repository';
import { StudentsModule } from '../../students/students.module';
import { SupervisorsModule } from '../../supervisors/supervisors.module';
import { UsersModule } from '../../users/users.module';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [StudentsModule, SupervisorsModule, UsersModule, PrismaModule],
  controllers: [SupervisionRequestsController],
  providers: [SupervisionRequestsService, SupervisionRequestsRepository],
  exports: [SupervisionRequestsService],
})
export class SupervisionRequestsModule {}
