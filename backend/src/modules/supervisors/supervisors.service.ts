import { Injectable, NotFoundException } from '@nestjs/common';
import { SupervisorsRepository } from './supervisors.repository';
import { Prisma } from '@prisma/client';
import { SupervisorCapacityException } from '../../common/exceptions/custom-exceptions/supervisor-capacity.exception';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { Supervisor } from './entities/supervisor.entity';

@Injectable()
export class SupervisorsService {
  constructor(private readonly supervisorsRepository: SupervisorsRepository) {}
  async findSupervisorById(id: string): Promise<Supervisor> {
    const supervisor = await this.supervisorsRepository.findSupervisorById(id);

    if (!supervisor) {
      throw new NotFoundException(`Supervisor with ID ${id} not found`);
    }
    return supervisor;
  }

  async findSupervisorByUserId(userId: string): Promise<Supervisor> {
    const supervisor = await this.supervisorsRepository.findSupervisorByUserId(userId);

    if (!supervisor) {
      throw new NotFoundException(`Supervisor profile for user ID ${userId} not found`);
    }
    return supervisor;
  }
  async findAllSupervisors(params: {
    take?: number;
    where?: Prisma.SupervisorWhereInput;
    orderBy?: Prisma.SupervisorOrderByWithRelationInput;
  }) {
    return this.supervisorsRepository.findAllSupervisors(params);
  }

  async updateSupervisorProfile(
    id: string,
    updateSupervisorDto: UpdateSupervisorDto,
  ): Promise<Supervisor> {
    const supervisor = await this.findSupervisorById(id);
    const newTotalSpots = updateSupervisorDto.total_spots ?? supervisor.total_spots;
    const newAvailableSpots = updateSupervisorDto.available_spots ?? supervisor.available_spots;
    if (newAvailableSpots > newTotalSpots) {
      throw new SupervisorCapacityException('Available spots cannot exceed total spots');
    }

    return this.supervisorsRepository.updateSupervisorProfile(id, updateSupervisorDto);
  }
}
