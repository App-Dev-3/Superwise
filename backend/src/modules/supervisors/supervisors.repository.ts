import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Supervisor, User } from '@prisma/client';

@Injectable()
export class SupervisorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // for finding supervisors by their ids
  // please use a supervisor with relations entity !! check users code
  // DO IT : change this function to return less data .. make a new one for relatios then.
  async findSupervisorById(id: string): Promise<Supervisor | null> {
    return this.prisma.supervisor.findUnique({
      where: { id },
    });
  }

  // find a supervisor by user ID
  async findSupervisorByUserId(userId: string): Promise<Supervisor | null> {
    return this.prisma.supervisor.findUnique({
      where: { user_id: userId },
    });
  }

  // get all supervisors with filtering options based on what the frontend needs.
  // we can for example select 5 (using take) supervisors that are available for supervision.
  // here separate the logic for filtering and calling.
  // the soulution would be relations entity.
  async findAllSupervisors(params: {
    take?: number;
    where?: Prisma.SupervisorWhereInput;
    orderBy?: Prisma.SupervisorOrderByWithRelationInput;
  }): Promise<(Supervisor & { user: User })[]> {
    const { take, where, orderBy } = params;

    return this.prisma.supervisor.findMany({
      take,
      where,
      orderBy,
      include: {
        user: {
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });
  }

  // create a new supervisor profile
  async createSupervisorProfile(data: {
    // take a look later
    bio?: string;
    available_spots?: number; // not sure if this has to be part of this function, i cant decide for now.
    total_spots?: number;
    user_id: string;
  }): Promise<Supervisor> {
    return this.prisma.supervisor.create({
      data,
    });
  }

  // this is for admin and supervisor ? or just supervisor
  async updateSupervisorProfile(
    id: string,
    data: Prisma.SupervisorUpdateInput,
  ): Promise<Supervisor> {
    return this.prisma.supervisor.update({
      where: { id },
      data,
    });
  }
}
