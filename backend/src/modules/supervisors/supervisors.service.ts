import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { registerSupervisorDto } from './dto/register-supervisor.dto';
import { SupervisorRegistrationResponse } from './entities/supervisor-registration.entity';
import { SupervisorRepository } from './repositories/supervisor-repository.interface';

@Injectable()
export class SupervisorsService {
  constructor(
    @Inject('SupervisorRepository')
    private supervisorRepository: SupervisorRepository
  ) {}

  async register(userId: string, registerDto: registerSupervisorDto): Promise<SupervisorRegistrationResponse> {
    const user = await this.supervisorRepository.findSupervisorByUserId(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role !== 'SUPERVISOR') {
      throw new BadRequestException('User is not a supervisor');
    }

    if (!user.supervisor_profile) {
      throw new NotFoundException(
        `Supervisor profile not found for user ${userId}`,
      );
    }

 
    const results = await this.supervisorRepository.updateSupervisorTags(userId, registerDto.tags);

    if (!user.is_registered) {
      await this.supervisorRepository.updateUserRegistrationStatus(userId, true);
    }

    return {
      success: true,
      message: 'Supervisor registered successfully',
      tags: results,
    };
  }
  

}