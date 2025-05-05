import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Role, UserTag, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetUserTagsDto } from './dto/set-user-tags.dto';
import { TagsService } from '../tags/tags.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepository = {
    createUser: jest.fn(),
    findAllUsers: jest.fn(),
    findUserById: jest.fn(),
    findUserByIdWithRelations: jest.fn(),
    findUserByEmail: jest.fn(),
    findUsersByFirstName: jest.fn(),
    findUsersByLastName: jest.fn(),
    findUsersByTagId: jest.fn(),
    findUsersByTagIds: jest.fn(),
    updateUser: jest.fn(),
    softDeleteUser: jest.fn(),
    // User Tag methods
    findUserTagsByUserId: jest.fn(),
    setUserTagsByUserId: jest.fn(),
  };

  const USER_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const USER_UUID_2 = '123e4567-e89b-12d3-a456-426614174001';
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

  const mockUserTag: UserTag = {
    user_id: USER_UUID,
    tag_id: TAG_UUID_1,
    priority: 1,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockTagsService = { findTagById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: TagsService, useValue: mockTagsService },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
    // Provide default resolved tag entity to satisfy validations
    mockTagsService.findTagById.mockResolvedValue({
      id: TAG_UUID_1,
      tag_name: 'MockTag',
      created_at: new Date(),
      updated_at: new Date(),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Standard User Operations ---
  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@test.com',
        first_name: 'Test',
        last_name: 'User',
        profile_image: 'https://superwise.at/images/b8a2d4e5-f7c8-41e3-9b9d-89c5f8a12345.jpg',
      };
      mockUsersRepository.createUser.mockResolvedValue(mockUser);
      const result = await service.createUser(createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.createUser).toHaveBeenCalledWith({
        email: createUserDto.email,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        role: Role.STUDENT,
        profile_image: createUserDto.profile_image,
        is_registered: true,
      });
    });
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      mockUsersRepository.findAllUsers.mockResolvedValue(expectedUsers);
      const result = await service.findAllUsers();
      expect(result).toEqual(expectedUsers);
      expect(mockUsersRepository.findAllUsers).toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('should return a user by ID', async () => {
      mockUsersRepository.findUserById.mockResolvedValue(mockUser);
      const result = await service.findUserById(USER_UUID);
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(USER_UUID);
    });

    it('should throw NotFoundException if user not found', async () => {
      const nonExistentId = 'non-existent';
      mockUsersRepository.findUserById.mockResolvedValue(null);

      await expect(service.findUserById(nonExistentId)).rejects.toThrow(
        new NotFoundException(`User with ID ${nonExistentId} not found`),
      );
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('findUserByIdWithRelations', () => {
    it('should return a user with relations by ID', async () => {
      const userWithRelations = { ...mockUser, tags: [] }; // simplified example
      mockUsersRepository.findUserByIdWithRelations.mockResolvedValue(userWithRelations);
      const result = await service.findUserByIdWithRelations(USER_UUID);
      expect(result).toEqual(userWithRelations);
      expect(mockUsersRepository.findUserByIdWithRelations).toHaveBeenCalledWith(USER_UUID);
    });

    it('should throw NotFoundException if user with relations not found', async () => {
      const nonExistentId = 'non-existent';
      mockUsersRepository.findUserByIdWithRelations.mockResolvedValue(null);

      await expect(service.findUserByIdWithRelations(nonExistentId)).rejects.toThrow(
        new NotFoundException(`User with ID ${nonExistentId} not found`),
      );
      expect(mockUsersRepository.findUserByIdWithRelations).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      mockUsersRepository.findUserByEmail.mockResolvedValue(mockUser);
      const result = await service.findUserByEmail(email);
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findUserByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null if no user found with email', async () => {
      const email = 'nonexistent@example.com';
      mockUsersRepository.findUserByEmail.mockResolvedValue(null);
      const result = await service.findUserByEmail(email);
      expect(result).toBeNull();
      expect(mockUsersRepository.findUserByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('findUsersByFirstName', () => {
    it('should return users by first name', async () => {
      mockUsersRepository.findUsersByFirstName.mockResolvedValue(expectedUsers);
      const result = await service.findUsersByFirstName('Max');
      expect(result).toEqual(expectedUsers);
      expect(mockUsersRepository.findUsersByFirstName).toHaveBeenCalledWith('Max');
    });
  });

  describe('findUsersByLastName', () => {
    it('should return users by last name', async () => {
      mockUsersRepository.findUsersByLastName.mockResolvedValue(expectedUsers);
      const result = await service.findUsersByLastName('Mustermann');
      expect(result).toEqual(expectedUsers);
      expect(mockUsersRepository.findUsersByLastName).toHaveBeenCalledWith('Mustermann');
    });
  });

  describe('findUsersByTagId', () => {
    it('should return users by tag ID', async () => {
      mockUsersRepository.findUsersByTagId.mockResolvedValue(expectedUsers);
      const result = await service.findUsersByTagId(TAG_UUID_1);
      expect(result).toEqual(expectedUsers);
      expect(mockUsersRepository.findUsersByTagId).toHaveBeenCalledWith(TAG_UUID_1);
    });
  });

  describe('findUsersByTagIds', () => {
    it('should return users by multiple tag IDs', async () => {
      mockUsersRepository.findUsersByTagIds.mockResolvedValue(expectedUsers);
      const result = await service.findUsersByTagIds([TAG_UUID_1, TAG_UUID_2]);
      expect(result).toEqual(expectedUsers);
      expect(mockUsersRepository.findUsersByTagIds).toHaveBeenCalledWith([TAG_UUID_1, TAG_UUID_2]);
    });
  });

  describe('updateUser', () => {
    it('should update a user after verifying existence', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = { first_name: 'Updated' };
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersRepository.findUserById.mockResolvedValue(mockUser);
      mockUsersRepository.updateUser.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateUser(USER_UUID, updateUserDto);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(USER_UUID);
      expect(mockUsersRepository.updateUser).toHaveBeenCalledWith(USER_UUID, updateUserDto);
    });

    it('should throw NotFoundException if user to update not found', async () => {
      // Arrange
      const nonExistentId = 'non-existent';
      const updateUserDto: UpdateUserDto = { first_name: 'Updated' };
      mockUsersRepository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateUser(nonExistentId, updateUserDto)).rejects.toThrow(
        new NotFoundException(`User with ID ${nonExistentId} not found`),
      );
      expect(mockUsersRepository.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should soft delete a user after verifying existence', async () => {
      const deletedUser = { ...mockUser, is_deleted: true };
      mockUsersRepository.findUserById.mockResolvedValue(mockUser);
      mockUsersRepository.softDeleteUser.mockResolvedValue(deletedUser);

      const result = await service.deleteUser(USER_UUID);

      expect(result).toEqual(deletedUser);
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(USER_UUID);
      expect(mockUsersRepository.softDeleteUser).toHaveBeenCalledWith(USER_UUID);
    });

    it('should throw NotFoundException if user to delete not found', async () => {
      // Arrange
      const nonExistentId = 'non-existent';
      mockUsersRepository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteUser(nonExistentId)).rejects.toThrow(
        new NotFoundException(`User with ID ${nonExistentId} not found`),
      );
      expect(mockUsersRepository.softDeleteUser).not.toHaveBeenCalled();
    });
  });

  // --- User Tag Operations ---
  describe('findUserTagsByUserId', () => {
    it('should find tags for a user after verifying user existence', async () => {
      const userTags = [mockUserTag];
      mockUsersRepository.findUserById.mockResolvedValue(mockUser);
      mockUsersRepository.findUserTagsByUserId.mockResolvedValue(userTags);

      const result = await service.findUserTagsByUserId(USER_UUID);

      expect(result).toEqual(userTags);
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(USER_UUID);
      expect(mockUsersRepository.findUserTagsByUserId).toHaveBeenCalledWith(USER_UUID);
    });

    it('should throw NotFoundException if user not found when getting tags', async () => {
      // Arrange
      const nonExistentId = 'non-existent';
      mockUsersRepository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findUserTagsByUserId(nonExistentId)).rejects.toThrow(
        new NotFoundException(`User with ID ${nonExistentId} not found`),
      );
      expect(mockUsersRepository.findUserTagsByUserId).not.toHaveBeenCalled();
    });
  });

  describe('setUserTagsByUserId', () => {
    it('should validate priorities and call repository, returning tags', async () => {
      // Arrange
      const userId = USER_UUID;
      const dto: SetUserTagsDto = {
        tags: [
          { tag_id: TAG_UUID_1, priority: 1 },
          { tag_id: TAG_UUID_2, priority: 2 },
        ],
      };
      const expectedUserTags = [
        {
          user_id: USER_UUID,
          tag_id: TAG_UUID_1,
          priority: 1,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        },
        {
          user_id: USER_UUID,
          tag_id: TAG_UUID_2,
          priority: 2,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        },
      ];
      mockUsersRepository.findUserById.mockResolvedValue(mockUser as User);
      mockUsersRepository.setUserTagsByUserId.mockResolvedValue(expectedUserTags);

      // Act
      const result = await service.setUserTagsByUserId(userId, dto);

      // Assert
      expect(result).toEqual(expectedUserTags); // Verify return value
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockUsersRepository.setUserTagsByUserId).toHaveBeenCalledWith(userId, dto.tags);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const userId = 'non-existent';
      const dto: SetUserTagsDto = { tags: [] };
      mockUsersRepository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.setUserTagsByUserId(userId, dto)).rejects.toThrow(NotFoundException);
      expect(mockUsersRepository.setUserTagsByUserId).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if priorities are not unique', async () => {
      // Arrange
      const userId = USER_UUID;
      const dto: SetUserTagsDto = {
        tags: [
          { tag_id: TAG_UUID_1, priority: 1 },
          { tag_id: TAG_UUID_2, priority: 1 },
        ],
      };
      mockUsersRepository.findUserById.mockResolvedValue(mockUser as User);
      // Act & Assert
      await expect(service.setUserTagsByUserId(userId, dto)).rejects.toThrow(BadRequestException);
      expect(mockUsersRepository.setUserTagsByUserId).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if priorities are not sequential from 1', async () => {
      // Arrange
      const userId = USER_UUID;
      const dto: SetUserTagsDto = {
        tags: [
          { tag_id: TAG_UUID_1, priority: 1 },
          { tag_id: TAG_UUID_2, priority: 3 }, // Gap in sequence (missing 2)
        ],
      };
      mockUsersRepository.findUserById.mockResolvedValue(mockUser as User);

      // Act & Assert
      await expect(service.setUserTagsByUserId(userId, dto)).rejects.toThrow(
        new BadRequestException('Priorities must be sequential from stating from 1.'),
      );
      expect(mockUsersRepository.setUserTagsByUserId).not.toHaveBeenCalled();
    });
    it('should throw BadRequestException if priorities do not start from 1', async () => {
      // Arrange
      const userId = USER_UUID;
      const dto: SetUserTagsDto = {
        tags: [
          { tag_id: TAG_UUID_1, priority: 2 },
          { tag_id: TAG_UUID_2, priority: 3 },
        ],
      };
      mockUsersRepository.findUserById.mockResolvedValue(mockUser as User);

      // Act & Assert
      await expect(service.setUserTagsByUserId(userId, dto)).rejects.toThrow(
        new BadRequestException('Priorities must be sequential from stating from 1.'),
      );
      expect(mockUsersRepository.setUserTagsByUserId).not.toHaveBeenCalled();
    });
    it('should pass validation for empty list and return empty array', async () => {
      // Arrange
      const userId = USER_UUID;
      const dto: SetUserTagsDto = { tags: [] };
      mockUsersRepository.findUserById.mockResolvedValue(mockUser as User);
      // Mock repo returning empty array
      mockUsersRepository.setUserTagsByUserId.mockResolvedValue([]);
      // Act
      const result = await service.setUserTagsByUserId(userId, dto);
      // Assert
      expect(result).toEqual([]); // Verify empty array returned
      expect(mockUsersRepository.setUserTagsByUserId).toHaveBeenCalledWith(userId, []);
    });
  });
});
