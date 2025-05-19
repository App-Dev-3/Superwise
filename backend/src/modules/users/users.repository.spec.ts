import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, UserTag, UserBlock } from '@prisma/client';

describe('UsersRepository', () => {
  let repository: UsersRepository;

  // Mock the PrismaService to avoid actual database calls
  const mockPrismaService = {
    $transaction: jest.fn(),
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userTag: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    userBlock: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  // Sample test data with proper UUID
  const USER_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const USER_UUID_2 = '123e4567-e89b-12d3-a456-426614174001';
  // Use actual UUIDs
  const TAG_UUID_1 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  const TAG_UUID_2 = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

  const mockUser = {
    id: USER_UUID,
    email: 'exampleStudent1@fhstp.ac.at',
    first_name: 'Max',
    last_name: 'Mustermann',
    role: Role.STUDENT,
    profile_image: 'https://superwise.at/images/b8a2d4e5-f7c8-41e3-9b9d-89c5f8a12345.jpg',
    is_registered: true,
    is_deleted: false,
    created_at: new Date('2023-01-15T10:30:00Z'),
    updated_at: new Date('2023-01-15T10:30:00Z'),
  };

  const mockUserTag: UserTag = {
    user_id: USER_UUID,
    tag_id: TAG_UUID_1,
    priority: 1,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUserBlock: UserBlock = {
    blocker_id: USER_UUID, // Student
    blocked_id: USER_UUID_2, // Supervisor
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined - verifies successful initialization', () => {
    expect(repository).toBeDefined();
  });
  describe('findUsers', () => {
    it('should return users matching email', async () => {
      // Arrange
      const searchParams = {
        email: 'exampleStudent1@fhstp.ac.at',
        firstName: undefined,
        lastName: undefined,
        tagId: undefined,
        tagIds: [],
      };
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      // Act
      const result = await repository.findUsers(searchParams);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          email: 'exampleStudent1@fhstp.ac.at',
        },
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
    });

    it('should return users matching firstName', async () => {
      // Arrange
      const searchParams = {
        email: undefined,
        firstName: 'Max',
        lastName: undefined,
        tagId: undefined,
        tagIds: [],
      };
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      // Act
      const result = await repository.findUsers(searchParams);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          first_name: {
            contains: 'Max',
            mode: 'insensitive',
          },
        },
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
    });

    it('should return users matching lastName', async () => {
      // Arrange
      const searchParams = {
        email: undefined,
        firstName: undefined,
        lastName: 'Mustermann',
        tagId: undefined,
        tagIds: [],
      };
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      // Act
      const result = await repository.findUsers(searchParams);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          last_name: {
            contains: 'Mustermann',
            mode: 'insensitive',
          },
        },
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
    });

    it('should return users matching single tagId', async () => {
      // Arrange
      const searchParams = {
        email: undefined,
        firstName: undefined,
        lastName: undefined,
        tagId: TAG_UUID_1,
        tagIds: [],
      };
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      // Act
      const result = await repository.findUsers(searchParams);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          tags: {
            some: {
              tag_id: {
                in: [TAG_UUID_1],
              },
            },
          },
        },
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
    });

    it('should return users matching multiple tagIds', async () => {
      // Arrange
      const searchParams = {
        email: undefined,
        firstName: undefined,
        lastName: undefined,
        tagId: undefined,
        tagIds: [TAG_UUID_1, TAG_UUID_2],
      };
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      // Act
      const result = await repository.findUsers(searchParams);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          tags: {
            some: {
              tag_id: {
                in: [TAG_UUID_1, TAG_UUID_2],
              },
            },
          },
        },
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
    });

    it('should return users matching combination of parameters', async () => {
      // Arrange
      const searchParams = {
        email: undefined,
        firstName: 'Max',
        lastName: 'Mustermann',
        tagId: TAG_UUID_1,
        tagIds: [],
      };
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      // Act
      const result = await repository.findUsers(searchParams);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          first_name: {
            contains: 'Max',
            mode: 'insensitive',
          },
          last_name: {
            contains: 'Mustermann',
            mode: 'insensitive',
          },
          tags: {
            some: {
              tag_id: {
                in: [TAG_UUID_1],
              },
            },
          },
        },
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
    });

    it('should return empty array when no parameters provided', async () => {
      // Arrange
      const searchParams = {
        email: undefined,
        firstName: undefined,
        lastName: undefined,
        tagId: undefined,
        tagIds: [],
      };
      mockPrismaService.user.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.findUsers(searchParams);

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
        },
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
    });

    it('should return empty array when no users match search criteria', async () => {
      // Arrange
      const searchParams = {
        email: undefined,
        firstName: 'NonExistent',
        lastName: undefined,
        tagId: undefined,
        tagIds: [],
      };
      mockPrismaService.user.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.findUsers(searchParams);

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      // Arrange
      const userData = {
        email: 'exampleStudent1@fhstp.ac.at',
        first_name: 'Max',
        last_name: 'Mustermann',
        role: Role.STUDENT,
        profile_image: 'https://superwise.at/images/b8a2d4e5-f7c8-41e3-9b9d-89c5f8a12345.jpg',
        is_registered: true,
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      // Act
      const result = await repository.createUser(userData);
      // Assert
      expect(result).toEqual({ ...mockUser, ...userData });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({ data: userData });
    });
  });

  describe('findAllUsers', () => {
    it('should return all non-deleted users from the database', async () => {
      // Arrange
      const expectedUsers = [
        mockUser,
        {
          ...mockUser,
          id: USER_UUID_2,
          email: 'exampleStudent2@fhstp.ac.at',
          first_name: 'Maria',
          last_name: 'Mustermann',
          profile_image: 'https://superwise.at/images/a7f32c8b-d09e-47a1-83c1-5fe198b67890.jpg',
          created_at: new Date('2023-02-20T14:45:00Z'),
          updated_at: new Date('2023-02-20T14:45:00Z'),
        },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(expectedUsers);

      // Act
      const result = await repository.findAllUsers();

      // Assert
      expect(result).toEqual(expectedUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
        },
      });
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no active users exist', async () => {
      // Arrange
      mockPrismaService.user.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.findAllUsers();

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
        },
      });
    });
  });

  describe('findUserById', () => {
    it('should return a user when found by ID', async () => {
      // Arrange
      const userId = USER_UUID;
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await repository.findUserById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when user is not found by ID', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174999'; // Non-existent UUID
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findUserById(userId);

      // Assert
      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('findUserByIdWithRelations', () => {
    it('should return user with relations', async () => {
      const userWithRelations = {
        ...mockUser,
        tags: [],
        student_profile: null,
        supervisor_profile: null,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithRelations);
      const result = await repository.findUserByIdWithRelations(USER_UUID);
      expect(result).toEqual(userWithRelations);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: USER_UUID },
        include: {
          student_profile: true,
          supervisor_profile: true,
          tags: { include: { tag: true } },
        },
      });
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      // Arrange
      const email = 'exampleStudent1@fhstp.ac.at';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await repository.findUserByEmail(email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return null when no user with the email exists', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findUserByEmail(email);

      // Assert
      expect(result).toBeNull();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('findUsersByFirstName', () => {
    it('should return users matching the first name search criteria', async () => {
      // Arrange
      const firstName = 'Max';
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      // Act
      const result = await repository.findUsersByFirstName(firstName);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          first_name: {
            contains: firstName,
            mode: 'insensitive',
          },
        },
      });
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should perform case-insensitive search for first name', async () => {
      // Arrange
      const firstName = 'max'; // lowercase, should still match 'Max'
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      // Act
      await repository.findUsersByFirstName(firstName);

      // Assert
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          first_name: {
            contains: firstName,
            mode: 'insensitive',
          },
        },
      });
    });

    it('should return an empty array when no users match the first name', async () => {
      // Arrange
      const firstName = 'NonExistent';
      mockPrismaService.user.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.findUsersByFirstName(firstName);

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          first_name: {
            contains: firstName,
            mode: 'insensitive',
          },
        },
      });
    });
  });

  describe('findUsersByLastName', () => {
    it('should return users matching the last name search criteria', async () => {
      // Arrange
      const lastName = 'Mustermann';
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      // Act
      const result = await repository.findUsersByLastName(lastName);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          last_name: {
            contains: lastName,
            mode: 'insensitive',
          },
        },
      });
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should perform case-insensitive search for last name', async () => {
      // Arrange
      const lastName = 'mustermann'; // lowercase, should still match 'Mustermann'
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      // Act
      await repository.findUsersByLastName(lastName);

      // Assert
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          last_name: {
            contains: lastName,
            mode: 'insensitive',
          },
        },
      });
    });

    it('should return an empty array when no users match the last name', async () => {
      // Arrange
      const lastName = 'NonExistent';
      mockPrismaService.user.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.findUsersByLastName(lastName);

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          is_deleted: false,
          last_name: {
            contains: lastName,
            mode: 'insensitive',
          },
        },
      });
    });
  });

  describe('findUsersByTagId', () => {
    it('should return users associated with the specified tag ID', async () => {
      // Arrange
      const tagId = TAG_UUID_1;
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      // Act
      const result = await repository.findUsersByTagId(tagId);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
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
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no users are associated with the tag ID', async () => {
      // Arrange
      const tagId = TAG_UUID_2; // UUID for a non-existent tag
      mockPrismaService.user.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.findUsersByTagId(tagId);

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe('findUsersByTagIds', () => {
    it('should return users associated with any of the specified tag IDs', async () => {
      // Arrange
      const tagIds = [TAG_UUID_1, TAG_UUID_2];
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      // Act
      const result = await repository.findUsersByTagIds(tagIds);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
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
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no users are associated with any of the tag IDs', async () => {
      // Arrange
      const tagIds = [
        '123e4567-e89b-12d3-a456-426614174012',
        '123e4567-e89b-12d3-a456-426614174013',
      ];
      mockPrismaService.user.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.findUsersByTagIds(tagIds);

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      // Arrange
      const updateData = { first_name: 'Updated' }; // Simple update object
      const updatedUser = { ...mockUser, ...updateData };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);
      // Act
      const result = await repository.updateUser(USER_UUID, updateData);
      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: USER_UUID },
        data: updateData,
      });
    });
  });

  describe('softDeleteUser', () => {
    it('should mark a user as deleted and return the updated entity', async () => {
      // Arrange
      const userId = USER_UUID;
      const deletedUser = { ...mockUser, is_deleted: true };

      mockPrismaService.user.update.mockResolvedValue(deletedUser);

      // Act
      const result = await repository.softDeleteUser(userId);

      // Assert
      expect(result).toEqual(deletedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { is_deleted: true },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUserTagsByUserId', () => {
    it('should find all tags for a user', async () => {
      // Arrange
      const userTags = [mockUserTag];
      mockPrismaService.userTag.findMany.mockResolvedValue(userTags);
      // Act
      const result = await repository.findUserTagsByUserId(USER_UUID);
      // Assert
      expect(result).toEqual(userTags);
      expect(mockPrismaService.userTag.findMany).toHaveBeenCalledWith({
        where: { user_id: USER_UUID },
        include: { tag: true },
        orderBy: { priority: 'asc' },
      });
    });
  });

  describe('setUserTagsByUserId', () => {
    it('should delete/create tags and return the new list', async () => {
      // Arrange
      const userId = USER_UUID;
      const tagsInput = [
        { tag_id: TAG_UUID_1, priority: 1 },
        { tag_id: TAG_UUID_2, priority: 2 },
      ];
      const expectedNewTags = [
        {
          user_id: USER_UUID,
          tag_id: TAG_UUID_1,
          priority: 1,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          tag: {
            id: TAG_UUID_1,
            tag_name: 'JavaScript',
            created_at: expect.any(Date),
            updated_at: expect.any(Date),
          },
        },
        {
          user_id: USER_UUID,
          tag_id: TAG_UUID_2,
          priority: 2,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          tag: {
            id: TAG_UUID_2,
            tag_name: 'TypeScript',
            created_at: expect.any(Date),
            updated_at: expect.any(Date),
          },
        },
      ];

      mockPrismaService.userTag.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.userTag.createMany.mockResolvedValue({ count: 2 });
      mockPrismaService.$transaction.mockImplementation(async ops => {
        // Safe access with type checking
        if (Array.isArray(ops) && ops.length > 0) {
          await ops[0];
          if (ops.length > 1) {
            await ops[1];
          }
        }
      });
      mockPrismaService.userTag.findMany.mockResolvedValue(expectedNewTags);

      // Act
      const result = await repository.setUserTagsByUserId(userId, tagsInput);

      // Assert
      expect(result).toEqual(expectedNewTags);
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.userTag.deleteMany).toHaveBeenCalledWith({
        where: { user_id: userId },
      });
      expect(mockPrismaService.userTag.createMany).toHaveBeenCalledWith({
        data: expect.any(Array),
      });
      expect(mockPrismaService.userTag.findMany).toHaveBeenCalledWith({
        where: { user_id: userId },
        include: { tag: true },
        orderBy: { priority: 'asc' },
      });
    });

    it('should return empty array when input tags are empty', async () => {
      // Arrange
      const userId = USER_UUID;
      const tagsInput: Array<{ tag_id: string; priority: number }> = [];
      mockPrismaService.userTag.deleteMany.mockResolvedValue({ count: 1 });
      mockPrismaService.userTag.findMany.mockResolvedValue([]);
      mockPrismaService.$transaction.mockImplementation(async ops => {
        await ops[0];
      });

      // Act
      const result = await repository.setUserTagsByUserId(userId, tagsInput);

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.userTag.deleteMany).toHaveBeenCalledWith({
        where: { user_id: userId },
      });
      expect(mockPrismaService.userTag.createMany).not.toHaveBeenCalled();
      expect(mockPrismaService.userTag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { user_id: userId } }),
      );
    });
  });

  // --- User Block Operations ---
  describe('findBlockedSupervisorsByStudentUserId', () => {
    it('should return all supervisors blocked by the student', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const blockedSupervisors = [mockUserBlock];
      mockPrismaService.userBlock.findMany.mockResolvedValue(blockedSupervisors);

      // Act
      const result = await repository.findBlockedSupervisorsByStudentUserId(studentUserId);

      // Assert
      expect(result).toEqual(blockedSupervisors);
      expect(mockPrismaService.userBlock.findMany).toHaveBeenCalledWith({
        where: {
          blocker_id: studentUserId,
        },
      });
    });

    it('should return an empty array when student has not blocked any supervisors', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      mockPrismaService.userBlock.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.findBlockedSupervisorsByStudentUserId(studentUserId);

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaService.userBlock.findMany).toHaveBeenCalledWith({
        where: {
          blocker_id: studentUserId,
        },
      });
    });
  });

  describe('createUserBlock', () => {
    it('should create a block relationship between a student and supervisor', async () => {
      // Arrange
      const blockerUserId = USER_UUID; // Student
      const blockedUserId = USER_UUID_2; // Supervisor
      mockPrismaService.userBlock.create.mockResolvedValue(mockUserBlock);

      // Act
      const result = await repository.createUserBlock(blockerUserId, blockedUserId);

      // Assert
      expect(result).toEqual(mockUserBlock);
      expect(mockPrismaService.userBlock.create).toHaveBeenCalledWith({
        data: {
          blocker_id: blockerUserId,
          blocked_id: blockedUserId,
        },
      });
    });
  });

  describe('deleteUserBlock', () => {
    it('should delete a block relationship between a student and supervisor', async () => {
      // Arrange
      const blockerUserId = USER_UUID; // Student
      const blockedUserId = USER_UUID_2; // Supervisor
      mockPrismaService.userBlock.delete.mockResolvedValue(mockUserBlock);

      // Act
      await repository.deleteUserBlock(blockerUserId, blockedUserId);

      // Assert
      expect(mockPrismaService.userBlock.delete).toHaveBeenCalledWith({
        where: {
          blocker_id_blocked_id: {
            blocker_id: blockerUserId,
            blocked_id: blockedUserId,
          },
        },
      });
    });
  });

  describe('findUserBlockByIds', () => {
    it('should find a block relationship when it exists', async () => {
      // Arrange
      const blockerUserId = USER_UUID; // Student
      const blockedUserId = USER_UUID_2; // Supervisor
      mockPrismaService.userBlock.findUnique.mockResolvedValue(mockUserBlock);

      // Act
      const result = await repository.findUserBlockByIds(blockerUserId, blockedUserId);

      // Assert
      expect(result).toEqual(mockUserBlock);
      expect(mockPrismaService.userBlock.findUnique).toHaveBeenCalledWith({
        where: {
          blocker_id_blocked_id: {
            blocker_id: blockerUserId,
            blocked_id: blockedUserId,
          },
        },
      });
    });

    it('should return null when a block relationship does not exist', async () => {
      // Arrange
      const blockerUserId = USER_UUID; // Student
      const blockedUserId = USER_UUID_2; // Supervisor
      mockPrismaService.userBlock.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findUserBlockByIds(blockerUserId, blockedUserId);

      // Assert
      expect(result).toBeNull();
      expect(mockPrismaService.userBlock.findUnique).toHaveBeenCalledWith({
        where: {
          blocker_id_blocked_id: {
            blocker_id: blockerUserId,
            blocked_id: blockedUserId,
          },
        },
      });
    });
  });
});
