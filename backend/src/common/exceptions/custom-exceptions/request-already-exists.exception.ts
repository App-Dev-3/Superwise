import { ConflictException } from '@nestjs/common';

export class RequestAlreadyExistsException extends ConflictException {
  constructor(requestType: 'supervision' | 'chat') {
    super(`A ${requestType} request already exists for this user`);
    this.name = 'RequestAlreadyExistsException';
  }
}
