import { Injectable, NotFoundException } from '@nestjs/common';
import { SupervisorsRepository } from './supervisors.repository';
import { Prisma, Supervisor, User } from '@prisma/client';
import { SupervisorCapacityException } from '../../common/exceptions/custom-exceptions/supervisor-capacity.exception';

// make sure to rename funcions to be consistent with the rest of the codebase !!
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
  // but i do need to check the role of the user id ?
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
  async createSupervisorProfile(data: {
    bio?: string;
    available_spots?: number;
    total_spots?: number;
    user_id: string;
  }): Promise<Supervisor> {
    // if (data.available_spots && data.total_spots && data.available_spots > data.total_spots) {
    //   data.available_spots = data.total_spots;
    // } // do we actually need this first check?

    return this.supervisorsRepository.createSupervisorProfile(data);
  }
  // use dtos..
  async updateSupervisorProfile(
    id: string,
    data: Prisma.SupervisorUpdateInput,
  ): Promise<Supervisor> {
    const supervisor = await this.findSupervisorById(id);

    if (
      typeof supervisor.total_spots !== 'undefined' &&
      typeof supervisor.available_spots !== 'undefined'
    ) {
      if (Number(supervisor.available_spots) > Number(supervisor.total_spots)) {
        throw new SupervisorCapacityException('Available spots cannot exceed total spots');
      }
    }

    return this.supervisorsRepository.updateSupervisorProfile(id, data);
  }
}
