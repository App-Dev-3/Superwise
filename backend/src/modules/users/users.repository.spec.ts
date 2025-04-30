import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersRepository', () => {
  let repository: UsersRepository;

  // Mock the PrismaService to avoid actual database calls
  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  // Sample test data with proper UUID
  const USER_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const USER_UUID_2 = '123e4567-e89b-12d3-a456-426614174001';

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

  describe('create', () => {
    it('should create a new user and return the created entity', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'exampleStudent1@fhstp.ac.at',
        first_name: 'Max',
        last_name: 'Mustermann',
        role: Role.STUDENT,
        profile_image: 'https://superwise.at/images/b8a2d4e5-f7c8-41e3-9b9d-89c5f8a12345.jpg',
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      // Act
      const result = await repository.create(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          first_name: createUserDto.first_name,
          last_name: createUserDto.last_name,
          role: createUserDto.role,
          profile_image: createUserDto.profile_image,
        },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
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
      const result = await repository.findAll();

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
      const result = await repository.findAll();

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
      const tagId = '123e4567-e89b-12d3-a456-426614174010'; // UUID for a tag
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
      const tagId = '123e4567-e89b-12d3-a456-426614174011'; // UUID for a non-existent tag
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
      const tagIds = [
        '123e4567-e89b-12d3-a456-426614174010',
        '123e4567-e89b-12d3-a456-426614174011',
      ];
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

  describe('update', () => {
    it('should update and return the user with the specified properties', async () => {
      // Arrange
      const userId = USER_UUID;
      const updateUserDto: UpdateUserDto = {
        first_name: 'Updated',
        last_name: 'Mustermann',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await repository.update(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('softDelete', () => {
    it('should mark a user as deleted and return the updated entity', async () => {
      // Arrange
      const userId = USER_UUID;
      const deletedUser = { ...mockUser, is_deleted: true };

      mockPrismaService.user.update.mockResolvedValue(deletedUser);

      // Act
      const result = await repository.softDelete(userId);

      // Assert
      expect(result).toEqual(deletedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { is_deleted: true },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
    });
  });
});
