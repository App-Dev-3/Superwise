import { BadRequestException } from '@nestjs/common';

export class SupervisorTargetException extends BadRequestException {
  constructor() {
    super('As a supervisor, you cannot create a supervision request for a supervisor account');
    this.name = 'SupervisorTargetException';
  }
}
