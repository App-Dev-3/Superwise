import { BadRequestException } from '@nestjs/common';
import { RequestState, Role } from '@prisma/client';

export class InvalidRequestStateTransitionException extends BadRequestException {
  constructor(currentState: RequestState, requestedState: RequestState, role: Role) {
    super(
      `User with role ${role} cannot change request state from ${currentState} to ${requestedState}`,
    );
    this.name = 'InvalidRequestStateTransitionException';
  }
}
