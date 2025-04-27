import { Module } from '@nestjs/common';
import { SupervisorsController } from './supervisors.controller';
import { SupervisorsService } from './supervisors.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaSupervisorRepository } from './repositories/supervisor.repository';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule],
  controllers: [SupervisorsController],
  providers: [
    SupervisorsService,
    {
      provide: 'SupervisorRepository',
      useClass: PrismaSupervisorRepository
    }
  ],
  exports: [
    SupervisorsService,
    {
      provide: 'SupervisorRepository',
      useClass: PrismaSupervisorRepository
    }
  ],
})
export class SupervisorsModule {}