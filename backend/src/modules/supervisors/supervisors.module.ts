import { Module } from '@nestjs/common';
import { SupervisorsRepository } from './supervisors.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [SupervisorsRepository],
  exports: [],
})
export class SupervisorsModule {}
