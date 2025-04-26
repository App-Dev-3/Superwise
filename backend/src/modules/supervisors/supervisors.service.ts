// src/modules/supervisors/supervisors.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { SupervisorRegistrationDto } from './dto/register-supervisor.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SupervisorsService {
  constructor(private prisma: PrismaService) {}

  async register(userId: string, registerDto: SupervisorRegistrationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        supervisor_profile: true,
      },
    });

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

    await this.prisma.userTag.deleteMany({
      where: { user_id: userId },
    });

    const tagOperations = registerDto.tags.map((tag) => {
      return this.prisma.userTag.create({
        data: {
          user_id: userId,
          tag_id: tag.tag_id,
          priority: tag.priority,
        },
      });
    });

    const results = await this.prisma.$transaction(tagOperations);

    if (!user.is_registered) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { is_registered: true },
      });
    }

    return {
      success: true,
      message: 'Supervisor registered successfully',
      tags: results,
    };
  }
}
