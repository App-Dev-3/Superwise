import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;

  // Mock user service to avoid database calls
  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findUserById: jest.fn(),
    findUserByIdWithRelations: jest.fn(),
    findUsersByFirstName: jest.fn(),
    findUsersByLastName: jest.fn(),
    findUsersByTagId: jest.fn(),
    findUsersByTagIds: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Sample test data with proper UUID format
  const USER_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const USER_UUID_2 = '123e4567-e89b-12d3-a456-426614174001';
  
  const mockUser: User = {
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

  const mockUsers = [
    mockUser, 
    { 
      ...mockUser, 
      id: USER_UUID_2, 
      email: 'exampleStudent2@fhstp.ac.at',
      first_name: 'Maria',
      last_name: 'Mustermann',
      profile_image: 'https://superwise.at/images/a7f32c8b-d09e-47a1-83c1-5fe198b67890.jpg',
      created_at: new Date('2023-02-20T14:45:00Z'),
      updated_at: new Date('2023-02-20T14:45:00Z')
    }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Basic initialization test - verifies the controller is properly initialized
   * This is a convention in NestJS testing to ensure dependency injection works correctly
   */
  it('should be defined - verifies successful controller initialization', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully and return the created user', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'exampleStudent1@fhstp.ac.at',
        first_name: 'Max',
        last_name: 'Mustermann',
        role: Role.STUDENT,
        profile_image: 'https://superwise.at/images/b8a2d4e5-f7c8-41e3-9b9d-89c5f8a12345.jpg',
      };
      mockUsersService.create.mockResolvedValue({ ...mockUser, ...createUserDto });

      // Act
      const result = await controller.create(createUserDto);

      // Assert
      expect(result).toEqual({ ...mockUser, ...createUserDto });
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of all active users', async () => {
      // Arrange
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByFirstName', () => {
    it('should return users that match the first name search criteria', async () => {
      // Arrange
      const firstName = 'Max';
      mockUsersService.findUsersByFirstName.mockResolvedValue([mockUser]);

      // Act
      const result = await controller.findByFirstName(firstName);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockUsersService.findUsersByFirstName).toHaveBeenCalledWith(firstName);
      expect(mockUsersService.findUsersByFirstName).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users match the first name', async () => {
      // Arrange
      const firstName = 'NonExistent';
      mockUsersService.findUsersByFirstName.mockResolvedValue([]);

      // Act
      const result = await controller.findByFirstName(firstName);

      // Assert
      expect(result).toEqual([]);
      expect(mockUsersService.findUsersByFirstName).toHaveBeenCalledWith(firstName);
    });
  });

  describe('findByLastName', () => {
    it('should return users that match the last name search criteria', async () => {
      // Arrange
      const lastName = 'Mustermann';
      mockUsersService.findUsersByLastName.mockResolvedValue([mockUser]);

      // Act
      const result = await controller.findByLastName(lastName);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockUsersService.findUsersByLastName).toHaveBeenCalledWith(lastName);
      expect(mockUsersService.findUsersByLastName).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users match the last name', async () => {
      // Arrange
      const lastName = 'NonExistent';
      mockUsersService.findUsersByLastName.mockResolvedValue([]);

      // Act
      const result = await controller.findByLastName(lastName);

      // Assert
      expect(result).toEqual([]);
      expect(mockUsersService.findUsersByLastName).toHaveBeenCalledWith(lastName);
    });
  });

  describe('findByTagId', () => {
    it('should return users associated with the specified tag ID', async () => {
      // Arrange
      const tagId = '123e4567-e89b-12d3-a456-426614174010'; // UUID for a tag
      mockUsersService.findUsersByTagId.mockResolvedValue([mockUser]);

      // Act
      const result = await controller.findByTagId(tagId);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockUsersService.findUsersByTagId).toHaveBeenCalledWith(tagId);
      expect(mockUsersService.findUsersByTagId).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByTagIds', () => {
    it('should split tag IDs string and return users with any of the specified tags', async () => {
      // Arrange
      const tagIds = '123e4567-e89b-12d3-a456-426614174010,123e4567-e89b-12d3-a456-426614174011';
      const splitTagIds = ['123e4567-e89b-12d3-a456-426614174010', '123e4567-e89b-12d3-a456-426614174011'];
      mockUsersService.findUsersByTagIds.mockResolvedValue([mockUser]);

      // Act
      const result = await controller.findByTagIds(tagIds);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockUsersService.findUsersByTagIds).toHaveBeenCalledWith(splitTagIds);
      expect(mockUsersService.findUsersByTagIds).toHaveBeenCalledTimes(1);
    });

    it('should handle tag IDs with whitespace correctly', async () => {
      // Arrange
      const tagIds = ' 123e4567-e89b-12d3-a456-426614174010 , 123e4567-e89b-12d3-a456-426614174011 ';
      const splitTagIds = ['123e4567-e89b-12d3-a456-426614174010', '123e4567-e89b-12d3-a456-426614174011'];
      mockUsersService.findUsersByTagIds.mockResolvedValue([mockUser]);

      // Act
      const result = await controller.findByTagIds(tagIds);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockUsersService.findUsersByTagIds).toHaveBeenCalledWith(splitTagIds);
    });
  });

  describe('findOne', () => {
    it('should return a single user by ID when it exists', async () => {
      // Arrange
      const userId = USER_UUID;
      mockUsersService.findUserById.mockResolvedValue(mockUser);

      // Act
      const result = await controller.findOne(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(userId);
      expect(mockUsersService.findUserById).toHaveBeenCalledTimes(1);
    });

    it('should propagate NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174999'; // Non-existent UUID
      mockUsersService.findUserById.mockRejectedValue(new NotFoundException(`User with ID ${userId} not found`));

      // Act & Assert
      await expect(controller.findOne(userId)).rejects.toThrow(NotFoundException);
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update and return the user when it exists', async () => {
      // Arrange
      const userId = USER_UUID;
      const updateUserDto: UpdateUserDto = {
        first_name: 'Updated',
        last_name: 'Mustermann',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      // Act
      const result = await controller.update(userId, updateUserDto);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(mockUsersService.update).toHaveBeenCalledTimes(1);
    });

    it('should propagate NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174999'; // Non-existent UUID
      const updateUserDto: UpdateUserDto = {
        first_name: 'Updated',
      };
      mockUsersService.update.mockRejectedValue(new NotFoundException(`User with ID ${userId} not found`));

      // Act & Assert
      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(NotFoundException);
      expect(mockUsersService.update).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should soft delete and return the user when it exists', async () => {
      // Arrange
      const userId = USER_UUID;
      const deletedUser = { ...mockUser, is_deleted: true };
      mockUsersService.remove.mockResolvedValue(deletedUser);

      // Act
      const result = await controller.remove(userId);

      // Assert
      expect(result).toEqual(deletedUser);
      expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
      expect(mockUsersService.remove).toHaveBeenCalledTimes(1);
    });

    it('should propagate NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174999'; // Non-existent UUID
      mockUsersService.remove.mockRejectedValue(new NotFoundException(`User with ID ${userId} not found`));

      // Act & Assert
      await expect(controller.remove(userId)).rejects.toThrow(NotFoundException);
      expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
    });
  });
});
