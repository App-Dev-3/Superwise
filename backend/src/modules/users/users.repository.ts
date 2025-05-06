import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User, UserTag, Role } from '@prisma/client';

export interface IUsersRepository {
  createUser(userData: {
    email: string;
    first_name: string;
    last_name: string;
    role: Role;
    profile_image?: string | null;
  }): Promise<User>;
  findAllUsers(): Promise<User[]>;
  findUserById(id: string): Promise<User | null>;
  findUserByIdWithRelations(id: string): Promise<User | null>;
  findUsersByFirstName(firstName: string): Promise<User[]>;
  findUsersByLastName(lastName: string): Promise<User[]>;
  findUsersByTagId(tagId: string): Promise<User[]>;
  findUsersByTagIds(tagIds: string[]): Promise<User[]>;
  updateUser(
    id: string,
    updateData: {
      email?: string;
      first_name?: string;
      last_name?: string;
      role?: Role;
      profile_image?: string | null;
      is_registered?: boolean;
      is_deleted?: boolean;
    },
  ): Promise<User>;
  softDeleteUser(id: string): Promise<User>;

  // User Tag operations
  findUserTagsByUserId(userId: string): Promise<UserTag[]>;
  setUserTagsByUserId(
    userId: string,
    tags: Array<{ tag_id: string; priority: number }>,
  ): Promise<UserTag[]>;
}

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userData: {
    email: string;
    first_name: string;
    last_name: string;
    role: Role;
    profile_image?: string | null;
  }): Promise<User> {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async findAllUsers(): Promise<User[]> {
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

  async findUserByIdWithRelations(id: string): Promise<User | null> {
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

  async updateUser(
    id: string,
    updateData: {
      email?: string;
      first_name?: string;
      last_name?: string;
      role?: Role;
      profile_image?: string | null;
      is_registered?: boolean;
      is_deleted?: boolean;
    },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async softDeleteUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  // User Tag operations implementation
  async findUserTagsByUserId(userId: string): Promise<UserTag[]> {
    return this.prisma.userTag.findMany({
      where: {
        user_id: userId,
      },
      include: {
        tag: true,
      },
      orderBy: {
        priority: 'asc',
      },
    });
  }

  async setUserTagsByUserId(
    userId: string,
    tags: Array<{ tag_id: string; priority: number }>,
  ): Promise<UserTag[]> {
    const deleteTagsOperation = this.prisma.userTag.deleteMany({
      where: { user_id: userId },
    });

    // Start transaction array with the delete operation
    const operations: Prisma.PrismaPromise<Prisma.BatchPayload>[] = [deleteTagsOperation];

    // Conditionally add the create operation if tags exist
    if (tags.length > 0) {
      const createTagsOperation = this.prisma.userTag.createMany({
        data: tags.map(tag => ({
          user_id: userId,
          tag_id: tag.tag_id,
          priority: tag.priority,
        })),
      });
      operations.push(createTagsOperation);
    }

    // Execute the transaction with the constructed operations array
    await this.prisma.$transaction(operations);

    // Fetch and return the newly set tags (or empty array)
    return this.findUserTagsByUserId(userId);
  }
}
