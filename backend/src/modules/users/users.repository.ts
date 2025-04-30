import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        role: createUserDto.role,
        profile_image: createUserDto.profile_image,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        is_deleted: false,
      },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findUserByIdWithRelations(id: string): Promise<
    | (User & {
        student_profile?: any;
        supervisor_profile?: any;
        tags?: any[];
      })
    | null
  > {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        student_profile: true,
        supervisor_profile: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async findUsersByFirstName(firstName: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        is_deleted: false,
        first_name: {
          contains: firstName,
          mode: 'insensitive',
        },
      },
    });
  }

  async findUsersByLastName(lastName: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        is_deleted: false,
        last_name: {
          contains: lastName,
          mode: 'insensitive',
        },
      },
    });
  }

  async findUsersByTagId(tagId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        is_deleted: false,
        tags: {
          some: {
            tag_id: tagId,
          },
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async findUsersByTagIds(tagIds: string[]): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        is_deleted: false,
        tags: {
          some: {
            tag_id: {
              in: tagIds,
            },
          },
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { is_deleted: true },
    });
  }
}
