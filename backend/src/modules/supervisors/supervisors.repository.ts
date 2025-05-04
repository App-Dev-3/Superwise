import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Supervisor, User } from '@prisma/client';

@Injectable()
export class SupervisorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // for finding supervisors by their ids
  async findById(id: string): Promise<(Supervisor & { user: User }) | null> {
    return this.prisma.supervisor.findUnique({
      where: { id },
      include: {
        user: {
          // this is a relation to the user table but not the table name (check prisma schema) to get additonal tags and user information
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

  // find a supervisor by user ID
  async findByUserId(userId: string): Promise<Supervisor | null> {
    return this.prisma.supervisor.findUnique({
      where: { user_id: userId },
    });
  }

  // get all supervisors with filtering options based on what the frontend needs.
  // we can for example select 5 (using take) supervisors that are available for supervision.
  async findAll(params: {
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
  async create(data: {
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
  async update(id: string, data: Prisma.SupervisorUpdateInput): Promise<Supervisor | null> {
    return this.prisma.supervisor.update({
      where: { id },
      data,
    });
  }

  // Maybe we need supervison requests state as well.. but for what is this state ?
  async getSupervisionRequests(supervisorId: string) {
    return this.prisma.supervisionRequest.findMany({
      where: { supervisor_id: supervisorId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}
