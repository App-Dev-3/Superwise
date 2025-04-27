// src/modules/supervisors/repositories/supervisor.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SupervisorRepository } from './supervisor-repository.interface';
import { registerSupervisorDto } from '../dto/register-supervisor.dto';
import { Supervisor, User, UserTag } from '@prisma/client';

@Injectable()
export class PrismaSupervisorRepository implements SupervisorRepository {
  constructor(private prisma: PrismaService) {}

  async findSupervisorByUserId(userId: string): Promise<User & { supervisor_profile: Supervisor | null } | null> {
    return this.prisma.user.findUnique({
      where: { 
        id: userId,
        is_deleted: false 
      },
      include: {
        supervisor_profile: true, // Not sure if we need this. 
      },
    });
  }

  async isSupervisor(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        is_deleted: false 
      },
      select: { 
        role: true,
        supervisor_profile: {
          select: { id: true } // Not sure if we need this also.
        }
      },
    });
    
    return user?.role === 'SUPERVISOR' && !!user?.supervisor_profile;
  }

  async updateSupervisorTags(userId: string, tags: registerSupervisorDto['tags']): Promise<UserTag[]> {
   
    await this.prisma.userTag.deleteMany({
      where: { user_id: userId },
    });

  
    const tagOperations = tags.map((tag) => {
      return this.prisma.userTag.create({
        data: {
          user_id: userId,
          tag_id: tag.tag_id,
          priority: tag.priority,
        },
      });
    });

    return this.prisma.$transaction(tagOperations);
  }

  async updateUserRegistrationStatus(userId: string, isRegistered: boolean): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { is_registered: isRegistered },
    });
  }


}