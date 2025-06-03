import { BadRequestException } from '@nestjs/common';

export class SelfSupervisionException extends BadRequestException {
  constructor() {
    super('You cannot create a supervision request for yourself');
    this.name = 'SelfSupervisionException';
  }
}
