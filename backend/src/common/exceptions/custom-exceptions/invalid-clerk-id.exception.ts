import { BadRequestException } from '@nestjs/common';

export class InvalidClerkIdException extends BadRequestException {
  constructor(message = 'Invalid operation: clerk_id cannot be modified once set') {
    super(message);
    this.name = 'InvalidClerkIdException';
  }
}
