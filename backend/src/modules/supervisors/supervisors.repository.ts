import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Supervisor } from '@prisma/client';

@Injectable()
export class SupervisorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSupervisorById(id: string): Promise<Supervisor | null> {
    return this.prisma.supervisor.findUnique({
      where: { id },
    });
  }

  async findSupervisorByUserId(userId: string): Promise<Supervisor | null> {
    return this.prisma.supervisor.findUnique({
      where: { user_id: userId },
    });
  }

  async findAllSupervisors(params: {
    take?: number;
    where?: Prisma.SupervisorWhereInput;
    orderBy?: Prisma.SupervisorOrderByWithRelationInput;
  }): Promise<Supervisor[]> {
    const { take, where, orderBy } = params;

    return this.prisma.supervisor.findMany({
      take,
      where,
      orderBy,
    });
  }

  async updateSupervisorProfile(
    id: string,
    data: {
      bio?: string;
      available_spots?: number;
      total_spots?: number;
    },
  ): Promise<Supervisor> {
    return this.prisma.supervisor.update({
      where: { id },
      data,
    });
  }
}
