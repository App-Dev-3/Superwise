import { ConflictException } from '@nestjs/common';

/**
 * Exception thrown when a supervisor tries to add a student to their supervision
 * list who already has an accepted supervision request.
 *
 * Enforces the one-accepted-supervision-per-student business rule.
 * @param studentId - Optional ID of the student who already has accepted supervision
 * @returns A new instance of the Custom Exception with a message indicating the error
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
