import { BadRequestException } from '@nestjs/common';

export class SupervisionRequestTooEarlyException extends BadRequestException {
  constructor(days: number) {
    super(`Must wait at least ${days} days before sending another request to this supervisor`);
    this.name = 'SupervisionRequestTooEarlyException';
  }
}
