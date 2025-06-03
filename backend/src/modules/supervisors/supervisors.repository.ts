import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Supervisor } from './entities/supervisor.entity';

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
    includeRegisteredOnly?: boolean;
  }): Promise<Supervisor[]> {
    const { take, where, orderBy, includeRegisteredOnly } = params;

    // Create query with user relation for registration check
    const query: Prisma.SupervisorFindManyArgs = {
      take,
      where,
      orderBy,
      include: {
        user: includeRegisteredOnly ? true : undefined,
      },
    };

    // If we need to filter by registration status, add the condition to where
    if (includeRegisteredOnly) {
      query.where = {
        ...query.where,
        user: {
          is_registered: true,
        },
      };
    }

    return this.prisma.supervisor.findMany(query);
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
