import { ForbiddenException } from '@nestjs/common';

export class LastAdminDeleteException extends ForbiddenException {
  constructor() {
    super('Cannot delete the last admin in the system');
    this.name = 'LastAdminDeleteException';
  }
}
