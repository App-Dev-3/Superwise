import { BadRequestException } from '@nestjs/common';

export class SupervisorCapacityException extends BadRequestException {
  constructor(supervisorId: string) {
    super(`Supervisor with ID ${supervisorId} has reached maximum capacity`);
    this.name = 'SupervisorCapacityException';
  }
}
