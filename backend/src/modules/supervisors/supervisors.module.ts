import { Module } from '@nestjs/common';
import { SupervisorsController } from './supervisors.controller';
import { SupervisorsService } from './supervisors.service';
import { SupervisorsRepository } from './supervisors.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SupervisorsController],
  providers: [SupervisorsService, SupervisorsRepository],
  exports: [SupervisorsService],
})
export class SupervisorsModule {}
