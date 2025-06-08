import { BadRequestException } from '@nestjs/common';

export class StudentAlreadyHasAnAcceptedSupervisionRequestException extends BadRequestException {
  constructor(studentId: string) {
    super(`Student ${studentId} already has an accepted supervision request.`);
    this.name = 'StudentAlreadyHasAnAcceptedSupervisionRequestException';
  }
}
