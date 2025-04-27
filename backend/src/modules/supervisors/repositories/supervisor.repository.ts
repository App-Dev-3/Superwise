
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SupervisorRepository } from './supervisor-repository.interface';
import { registerSupervisorDto } from '../dto/register-supervisor.dto';
import {  User, UserTag } from '@prisma/client';

@Injectable()
export class PrismaSupervisorRepository implements SupervisorRepository {
  constructor(private prisma: PrismaService) {}

  async findSupervisorByUserId(userId: string): Promise<User> {
    const supervisor = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        is_deleted: false 
      }
    });
    
    if (!supervisor) {
      throw new Error('Supervisor not found');
    }
    
    return supervisor;
  }
  
  async isSupervisor(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        is_deleted: false 
      },
      select: { 
        role: true
      },
    });
    
    return user?.role === 'SUPERVISOR';
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