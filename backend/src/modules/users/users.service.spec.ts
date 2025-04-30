import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findUserById: jest.fn(),
    findUserByIdWithRelations: jest.fn(),
    findUsersByFirstName: jest.fn(),
    findUsersByLastName: jest.fn(),
    findUsersByTagId: jest.fn(),
    findUsersByTagIds: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
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

  const expectedUsers = [
    mockUser,
    {
      id: USER_UUID_2,
      email: 'exampleStudent2@fhstp.ac.at',
      first_name: 'Maria',
      last_name: 'Mustermann',
      role: Role.STUDENT,
      profile_image: 'https://superwise.at/images/a7f32c8b-d09e-47a1-83c1-5fe198b67890.jpg',
      is_registered: true,
      is_deleted: false,
      created_at: new Date('2023-02-20T14:45:00Z'),
      updated_at: new Date('2023-02-20T14:45:00Z'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Basic initialization test - verifies the service is properly initialized
   * This is a convention in NestJS testing to ensure dependency injection works correctly
   */
  it('should be defined - verifies successful service initialization', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a new user and return the created entity', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'cc211014@fhstp.ac.at',
        first_name: 'Bernhard',
        last_name: 'Kofler',
        role: Role.STUDENT,
        profile_image: 'https://superwise.at/images/b8a2d4e5-f7c8-41e3-9b9d-89c5f8a12345.jpg',
      };

      mockUsersRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUsersRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of all active users from the repository', async () => {
      // Arrange
      mockUsersRepository.findAll.mockResolvedValue(expectedUsers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(expectedUsers);
      expect(mockUsersRepository.findAll).toHaveBeenCalled();
      expect(mockUsersRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no users are found', async () => {
      // Arrange
      mockUsersRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(mockUsersRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('should return a user when found by ID', async () => {
      // Arrange
      const userId = USER_UUID;
      mockUsersRepository.findUserById.mockResolvedValue(mockUser);

      // Act
      const result = await service.findUserById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockUsersRepository.findUserById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user is not found by ID', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174999'; // Non-existent UUID
      mockUsersRepository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findUserById(userId)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`),
      );
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('findUsersByFirstName', () => {
    it('should return users matching the first name search criteria', async () => {
      // Arrange
      const firstName = 'Bernhard';
      const expectedUsers = [mockUser];
      mockUsersRepository.findUsersByFirstName.mockResolvedValue(expectedUsers);

      // Act
      const result = await service.findUsersByFirstName(firstName);

      // Assert
      expect(result).toEqual(expectedUsers);
      expect(mockUsersRepository.findUsersByFirstName).toHaveBeenCalledWith(firstName);
      expect(mockUsersRepository.findUsersByFirstName).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no users match the first name', async () => {
      // Arrange
      const firstName = 'NonExistent';
      mockUsersRepository.findUsersByFirstName.mockResolvedValue([]);

      // Act
      const result = await service.findUsersByFirstName(firstName);

      // Assert
      expect(result).toEqual([]);
      expect(mockUsersRepository.findUsersByFirstName).toHaveBeenCalledWith(firstName);
    });
  });

  describe('findUsersByLastName', () => {
    it('should return users matching the last name search criteria', async () => {
      // Arrange
      const lastName = 'Kofler';
      const expectedUsers = [mockUser];
      mockUsersRepository.findUsersByLastName.mockResolvedValue(expectedUsers);

      // Act
      const result = await service.findUsersByLastName(lastName);

      // Assert
      expect(result).toEqual(expectedUsers);
      expect(mockUsersRepository.findUsersByLastName).toHaveBeenCalledWith(lastName);
      expect(mockUsersRepository.findUsersByLastName).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no users match the last name', async () => {
      // Arrange
      const lastName = 'NonExistent';
      mockUsersRepository.findUsersByLastName.mockResolvedValue([]);

      // Act
      const result = await service.findUsersByLastName(lastName);

      // Assert
      expect(result).toEqual([]);
      expect(mockUsersRepository.findUsersByLastName).toHaveBeenCalledWith(lastName);
    });
  });

  describe('findUsersByTagId', () => {
    it('should return users associated with the specified tag ID', async () => {
      // Arrange
      const tagId = '123e4567-e89b-12d3-a456-426614174010'; // UUID for a tag
      const expectedUsers = [mockUser];
      mockUsersRepository.findUsersByTagId.mockResolvedValue(expectedUsers);

      // Act
      const result = await service.findUsersByTagId(tagId);

      // Assert
      expect(result).toEqual(expectedUsers);
      expect(mockUsersRepository.findUsersByTagId).toHaveBeenCalledWith(tagId);
      expect(mockUsersRepository.findUsersByTagId).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no users are associated with the tag ID', async () => {
      // Arrange
      const tagId = '123e4567-e89b-12d3-a456-426614174011'; // UUID for a non-existent tag
      mockUsersRepository.findUsersByTagId.mockResolvedValue([]);

      // Act
      const result = await service.findUsersByTagId(tagId);

      // Assert
      expect(result).toEqual([]);
      expect(mockUsersRepository.findUsersByTagId).toHaveBeenCalledWith(tagId);
    });
  });

  describe('findUsersByTagIds', () => {
    it('should return users associated with any of the specified tag IDs', async () => {
      // Arrange
      const tagIds = [
        '123e4567-e89b-12d3-a456-426614174010',
        '123e4567-e89b-12d3-a456-426614174011',
      ];
      const expectedUsers = [mockUser];
      mockUsersRepository.findUsersByTagIds.mockResolvedValue(expectedUsers);

      // Act
      const result = await service.findUsersByTagIds(tagIds);

      // Assert
      expect(result).toEqual(expectedUsers);
      expect(mockUsersRepository.findUsersByTagIds).toHaveBeenCalledWith(tagIds);
      expect(mockUsersRepository.findUsersByTagIds).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no users are associated with any of the tag IDs', async () => {
      // Arrange
      const tagIds = [
        '123e4567-e89b-12d3-a456-426614174012',
        '123e4567-e89b-12d3-a456-426614174013',
      ];
      mockUsersRepository.findUsersByTagIds.mockResolvedValue([]);

      // Act
      const result = await service.findUsersByTagIds(tagIds);

      // Assert
      expect(result).toEqual([]);
      expect(mockUsersRepository.findUsersByTagIds).toHaveBeenCalledWith(tagIds);
    });
  });

  describe('update', () => {
    it('should verify user exists and then update user properties', async () => {
      // Arrange
      const userId = USER_UUID;
      const updateUserDto: UpdateUserDto = {
        first_name: 'Updated',
        last_name: 'Kofler',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };

      mockUsersRepository.findUserById.mockResolvedValue(mockUser);
      mockUsersRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.update(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockUsersRepository.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(mockUsersRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when trying to update a non-existent user', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174999'; // Non-existent UUID
      const updateUserDto: UpdateUserDto = {
        first_name: 'Updated',
      };

      mockUsersRepository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`),
      );
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockUsersRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should verify user exists and then perform soft deletion', async () => {
      // Arrange
      const userId = USER_UUID;
      const deletedUser = { ...mockUser, is_deleted: true };

      mockUsersRepository.findUserById.mockResolvedValue(mockUser);
      mockUsersRepository.softDelete.mockResolvedValue(deletedUser);

      // Act
      const result = await service.remove(userId);

      // Assert
      expect(result).toEqual(deletedUser);
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockUsersRepository.softDelete).toHaveBeenCalledWith(userId);
      expect(mockUsersRepository.softDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when trying to delete a non-existent user', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174999'; // Non-existent UUID

      mockUsersRepository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(userId)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`),
      );
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockUsersRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
