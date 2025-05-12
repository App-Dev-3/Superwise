import { BadRequestException } from '@nestjs/common';

export class StudentThesisLimitException extends BadRequestException {
  constructor(message = 'Thesis description exceeds maximum allowed length') {
    super(message);
    this.name = 'StudentThesisLimitException';
  }
}
