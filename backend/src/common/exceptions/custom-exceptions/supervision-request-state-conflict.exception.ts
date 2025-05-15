import { ConflictException } from '@nestjs/common';
import { RequestState } from '@prisma/client';

export class SupervisionRequestStateConflictException extends ConflictException {
  constructor(state: RequestState) {
    super(`Cannot create a new request while an existing request is in ${state} state`);
    this.name = 'SupervisionRequestStateConflictException';
  }
}
