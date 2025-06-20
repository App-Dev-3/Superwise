import { ForbiddenException } from '@nestjs/common';

export class UserDeleteForbiddenException extends ForbiddenException {
  constructor() {
    super('You can only delete your own account');
    this.name = 'UserDeleteForbiddenException';
  }
}
