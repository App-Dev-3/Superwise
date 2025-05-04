import { Injectable, NotFoundException } from '@nestjs/common';
import { SupervisorsRepository } from './supervisors.repository';
import { Prisma, Supervisor, User } from '@prisma/client';
import { SupervisorCapacityException } from '../../common/exceptions/custom-exceptions/supervisor-capacity.exception';

@Injectable()
export class SupervisorsService {
  constructor(private readonly supervisorsRepository: SupervisorsRepository) {}

  async findById(id: string): Promise<(Supervisor & { user: User }) | null> {
    const supervisor = await this.supervisorsRepository.findById(id);

    if (!supervisor) {
      throw new NotFoundException(`Supervisor with ID ${id} not found`);
    }

    return supervisor;
  }

  async findByUserId(userId: string): Promise<Supervisor> {
    const supervisor = await this.supervisorsRepository.findByUserId(userId);

    if (!supervisor) {
      throw new NotFoundException(`Supervisor profile for user ID ${userId} not found`);
    }

    return supervisor;
  }

  async findAll(params: {
    take?: number;
    where?: Prisma.SupervisorWhereInput;
    orderBy?: Prisma.SupervisorOrderByWithRelationInput;
  }) {
    return this.supervisorsRepository.findAll(params);
  }

  async create(data: {
    bio?: string;
    available_spots?: number;
    total_spots?: number;
    user_id: string;
  }): Promise<Supervisor> {
    if (data.available_spots && data.total_spots && data.available_spots > data.total_spots) {
      data.available_spots = data.total_spots;
    }

    return this.supervisorsRepository.create(data);
  }

  async update(id: string, data: Prisma.SupervisorUpdateInput): Promise<Supervisor | null> {
    await this.findById(id);

    if (typeof data.total_spots !== 'undefined' && typeof data.available_spots !== 'undefined') {
      if (Number(data.available_spots) > Number(data.total_spots)) {
        throw new SupervisorCapacityException('Available spots cannot exceed total spots');
      }
    }

    return this.supervisorsRepository.update(id, data);
  }

  async getSupervisionRequests(supervisorId: string) {
    await this.findById(supervisorId);

    return this.supervisorsRepository.getSupervisionRequests(supervisorId);
  }
}
