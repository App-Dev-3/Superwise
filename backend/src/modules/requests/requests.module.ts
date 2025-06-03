import { Module } from '@nestjs/common';
import { SupervisionRequestsModule } from './supervision/supervision-requests.module';

@Module({
  imports: [SupervisionRequestsModule],
  exports: [SupervisionRequestsModule],
})
export class RequestsModule {}
