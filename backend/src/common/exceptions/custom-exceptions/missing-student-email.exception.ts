import { BadRequestException } from '@nestjs/common';

export class MissingStudentEmailException extends BadRequestException {
  constructor() {
    super('student_email is required for supervisors');
    this.name = 'MissingStudentEmailException';
  }
}
