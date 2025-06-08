import { BadRequestException } from '@nestjs/common';

export class StudentHasAlreadyAnAcceptedSupervisionRequestException extends BadRequestException {
  constructor() {
    super('Admin users do not send or receive supervision requests');
    this.name = 'StudenHasAlreadyAnAcceptedSupervisionRequestException';
  }
}
