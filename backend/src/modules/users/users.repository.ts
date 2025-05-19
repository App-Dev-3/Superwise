import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User, UserTag, Role, UserBlock } from '@prisma/client';

export interface IUsersRepository {
  createUser(userData: {
    email: string;
    first_name: string;
    last_name: string;
    role: Role;
    profile_image?: string | null;
    is_registered: boolean;
    clerk_id?: string | null;
  }): Promise<User>;

  findAllUsers(): Promise<User[]>;
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByClerkId(clerkId: string): Promise<User | null>;
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
      clerk_id?: string | null;
    },
  ): Promise<User>;
  softDeleteUser(id: string): Promise<User>;

  // User Tag operations
  findUserTagsByUserId(userId: string): Promise<UserTag[]>;
  setUserTagsByUserId(
    userId: string,
    tags: Array<{ tag_id: string; priority: number }>,
  ): Promise<UserTag[]>;

  // User Block operations
  findBlockedSupervisorsByStudentUserId(studentUserId: string): Promise<UserBlock[]>;
  createUserBlock(blockerUserId: string, blockedUserId: string): Promise<UserBlock>;
  deleteUserBlock(blockerUserId: string, blockedUserId: string): Promise<void>;
  findUserBlockByIds(blockerUserId: string, blockedUserId: string): Promise<UserBlock | null>;
}

interface SearchParams {
  email?: string;
  firstName?: string;
  lastName?: string;
  tagId?: string;
  tagIds: string[];
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
    is_registered: boolean;
    clerk_id?: string | null;
  }): Promise<User> {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async searchUsers(searchParams: SearchParams): Promise<User[]> {
    const { email, firstName, lastName, tagId, tagIds } = searchParams;
    const whereConditions: Prisma.UserWhereInput = {
      is_deleted: false,
    };

    if (email) {
      whereConditions.email = email;
    }

    if (firstName) {
      whereConditions.first_name = {
        contains: firstName,
        mode: 'insensitive',
      };
    }

    if (lastName) {
      whereConditions.last_name = {
        contains: lastName,
        mode: 'insensitive',
      };
    }

    if (tagId || (tagIds && tagIds.length > 0)) {
      const allTagIds = [...(tagId ? [tagId] : []), ...tagIds];

      if (allTagIds.length > 0) {
        whereConditions.tags = {
          some: {
            tag_id: {
              in: allTagIds,
            },
          },
        };
      }
    }

    return this.prisma.user.findMany({
      where: whereConditions,
      orderBy: [{ last_name: 'asc' }, { first_name: 'asc' }],
      include: {
        tags: {
          include: {
            tag: true,
          },
          orderBy: {
            priority: 'asc',
          },
        },
      },
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

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserByClerkId(clerkId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { clerk_id: clerkId },
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
      clerk_id?: string | null;
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

  // User Block operations
  async findBlockedSupervisorsByStudentUserId(studentUserId: string): Promise<UserBlock[]> {
    return this.prisma.userBlock.findMany({
      where: {
        blocker_id: studentUserId,
      },
    });
  }

  async createUserBlock(blockerUserId: string, blockedUserId: string): Promise<UserBlock> {
    return this.prisma.userBlock.create({
      data: {
        blocker_id: blockerUserId,
        blocked_id: blockedUserId,
      },
    });
  }

  async deleteUserBlock(blockerUserId: string, blockedUserId: string): Promise<void> {
    await this.prisma.userBlock.delete({
      where: {
        blocker_id_blocked_id: {
          blocker_id: blockerUserId,
          blocked_id: blockedUserId,
        },
      },
    });
  }

  async findUserBlockByIds(
    blockerUserId: string,
    blockedUserId: string,
  ): Promise<UserBlock | null> {
    return this.prisma.userBlock.findUnique({
      where: {
        blocker_id_blocked_id: {
          blocker_id: blockerUserId,
          blocked_id: blockedUserId,
        },
      },
    });
  }
}
