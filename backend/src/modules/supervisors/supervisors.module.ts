import { Module } from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import { SupervisorsRepository } from './supervisors.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [SupervisorsService, SupervisorsRepository],
  exports: [SupervisorsService],
})
export class SupervisorsModule {}
