import { ConflictException } from '@nestjs/common';

export class StudentAlreadyHasAnAcceptedSupervisionRequestException extends ConflictException {
  constructor(studentId?: string) {
    const message = studentId
      ? `Student ${studentId} already has an accepted supervision request.`
      : 'This student already has an accepted supervision request and cannot have another one.';
    super(message);
    this.name = 'StudentAlreadyHasAnAcceptedSupervisionRequestException';
  }
}
