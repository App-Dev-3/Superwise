import { ForbiddenException } from '@nestjs/common';

export class DiscardedUserException extends ForbiddenException {
  constructor() {
    super('User has been discarded from suggestions');
    this.name = 'DiscardedUserException';
  }
}
