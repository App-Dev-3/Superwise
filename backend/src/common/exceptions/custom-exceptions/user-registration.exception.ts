import { BadRequestException } from '@nestjs/common';

export class UserRegistrationException extends BadRequestException {
  constructor(
    message = 'Invalid operation: registration status cannot be reverted once set to true',
  ) {
    super(message);
    this.name = 'UserRegistrationException';
  }
}
