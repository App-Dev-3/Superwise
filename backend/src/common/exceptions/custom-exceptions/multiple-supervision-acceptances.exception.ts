import { ConflictException } from '@nestjs/common';

/**
 * Should be thrown when a supervisor tries to add a student to their supervision
 * list who already has an accepted supervision request.
 *
 * @param studentId - Optional ID of the student with an existing accepted request
 * @returns A new instance of the exception with a message indicating the error
 */
export class StudentAlreadyHasAnAcceptedSupervisionRequestException extends ConflictException {
  constructor(studentId?: string) {
    const message = studentId
      ? `Student ${studentId} already has an accepted supervision request.`
      : 'This student already has an accepted supervision request and cannot have another one.';
    super(message);
    this.name = 'StudentAlreadyHasAnAcceptedSupervisionRequestException';
  }
}
