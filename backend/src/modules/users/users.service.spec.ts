import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Role, UserTag, User, UserBlock } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetUserTagsDto } from './dto/set-user-tags.dto';
import { TagsService } from '../tags/tags.service';
import { WinstonLoggerService } from '../../common/logging/winston-logger.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepository = {
    createUser: jest.fn(),
    findAllUsers: jest.fn(),
    findUserById: jest.fn(),
    findUserByIdWithRelations: jest.fn(),
    findUserByEmail: jest.fn(),
    findUserByClerkId: jest.fn(),
    findUsersByFirstName: jest.fn(),
    findUsersByLastName: jest.fn(),
    findUsersByTagId: jest.fn(),
    findUsersByTagIds: jest.fn(),
    updateUser: jest.fn(),
    softDeleteUser: jest.fn(),
    // User Tag methods
    findUserTagsByUserId: jest.fn(),
    setUserTagsByUserId: jest.fn(),
    // User Block methods
    findBlockedSupervisorsByStudentUserId: jest.fn(),
    createUserBlock: jest.fn(),
    deleteUserBlock: jest.fn(),
    findUserBlockByIds: jest.fn(),
  };

  const mockLoggerService = {
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const USER_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const USER_UUID_2 = '123e4567-e89b-12d3-a456-426614174001';
  const TAG_UUID_1 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  const TAG_UUID_2 = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  const CLERK_ID = 'user_2NUj8tGhSFhTLD9sdP0q4P7VoJM';

  const mockStudent = {
    id: USER_UUID,
    email: 'exampleStudent1@fhstp.ac.at',
    first_name: 'Max',
    last_name: 'Mustermann',
    role: Role.STUDENT,
    profile_image: 'https://superwise.at/images/b8a2d4e5-f7c8-41e3-9b9d-89c5f8a12345.jpg',
    is_registered: true,
    is_deleted: false,
    clerk_id: CLERK_ID,
    created_at: new Date('2023-01-15T10:30:00Z'),
    updated_at: new Date('2023-01-15T10:30:00Z'),
  };

  const mockSupervisor = {
    id: USER_UUID_2,
    email: 'exampleSupervisor@fhstp.ac.at',
    first_name: 'Supervisor',
    last_name: 'Example',
    role: Role.SUPERVISOR,
    profile_image: null,
    is_registered: true,
    is_deleted: false,
    clerk_id: 'user_2NUj8tGhSFhTLD9sdP0q4P7VoJZ',
    created_at: new Date('2023-02-20T14:45:00Z'),
    updated_at: new Date('2023-02-20T14:45:00Z'),
  };

  const mockUser = mockStudent;

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
      clerk_id: 'user_2NUj8tGhSFhTLD9sdP0q4P7VoJZ',
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

  const mockUserBlock: UserBlock = {
    blocker_id: USER_UUID, // Student
    blocked_id: USER_UUID_2, // Supervisor
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
        { provide: WinstonLoggerService, useValue: mockLoggerService },
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
      const authUser = {
        clerk_id: CLERK_ID,
        email: 'test@fhstp.ac.at',
      };

      const createUserDto: CreateUserDto = {
        email: 'test@fhstp.ac.at',
        first_name: 'Test',
        last_name: 'User',
        profile_image: 'https://superwise.at/images/b8a2d4e5-f7c8-41e3-9b9d-89c5f8a12345.jpg',
      };
      mockUsersRepository.findUserByEmail.mockResolvedValue(null);
      mockUsersRepository.createUser.mockResolvedValue(mockUser);
      const result = await service.createUser(authUser, createUserDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.createUser).toHaveBeenCalledWith({
        email: createUserDto.email,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        role: Role.STUDENT,
        profile_image: createUserDto.profile_image,
        is_registered: true,
        clerk_id: CLERK_ID,
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

    it('should throw NotFoundException if no user found with email', async () => {
      const email = 'nonexistent@example.com';
      mockUsersRepository.findUserByEmail.mockResolvedValue(null);

      await expect(service.findUserByEmail(email)).rejects.toThrow(
        new NotFoundException(`User with email ${email} not found`),
      );
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

  // --- User Block Operations ---
  describe('findBlockedSupervisorsByStudentUserId', () => {
    it('should find blocked supervisors for a valid student', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const expectedBlocks = [mockUserBlock];
      mockUsersRepository.findUserById.mockResolvedValue(mockStudent);
      mockUsersRepository.findBlockedSupervisorsByStudentUserId.mockResolvedValue(expectedBlocks);

      // Act
      const result = await service.findBlockedSupervisorsByStudentUserId(studentUserId);

      // Assert
      expect(result).toEqual(expectedBlocks);
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(studentUserId);
      expect(mockUsersRepository.findBlockedSupervisorsByStudentUserId).toHaveBeenCalledWith(
        studentUserId,
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const nonExistentId = 'non-existent';
      mockUsersRepository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findBlockedSupervisorsByStudentUserId(nonExistentId)).rejects.toThrow(
        new NotFoundException(`User with ID ${nonExistentId} not found`),
      );
      expect(mockUsersRepository.findBlockedSupervisorsByStudentUserId).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user is not a student', async () => {
      // Arrange
      const supervisorId = USER_UUID_2;
      mockUsersRepository.findUserById.mockResolvedValue(mockSupervisor);

      // Act & Assert
      await expect(service.findBlockedSupervisorsByStudentUserId(supervisorId)).rejects.toThrow(
        new BadRequestException('Only students can have blocked supervisors'),
      );
      expect(mockUsersRepository.findBlockedSupervisorsByStudentUserId).not.toHaveBeenCalled();
    });
  });

  describe('createUserBlock', () => {
    it('should create a block between a student and a supervisor', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const supervisorUserId = USER_UUID_2;
      mockUsersRepository.findUserById.mockImplementation(id => {
        if (id === studentUserId) return Promise.resolve(mockStudent);
        if (id === supervisorUserId) return Promise.resolve(mockSupervisor);
        return Promise.resolve(null);
      });
      mockUsersRepository.findUserBlockByIds.mockResolvedValue(null);
      mockUsersRepository.createUserBlock.mockResolvedValue(mockUserBlock);

      // Act
      const result = await service.createUserBlock(studentUserId, supervisorUserId);

      // Assert
      expect(result).toEqual(mockUserBlock);
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(studentUserId);
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(supervisorUserId);
      expect(mockUsersRepository.findUserBlockByIds).toHaveBeenCalledWith(
        studentUserId,
        supervisorUserId,
      );
      expect(mockUsersRepository.createUserBlock).toHaveBeenCalledWith(
        studentUserId,
        supervisorUserId,
      );
    });

    it('should throw BadRequestException if user tries to block themselves', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      mockUsersRepository.findUserById.mockResolvedValue(mockStudent);

      // Act & Assert
      await expect(service.createUserBlock(studentUserId, studentUserId)).rejects.toThrow(
        new BadRequestException('Users cannot block themselves'),
      );
      expect(mockUsersRepository.createUserBlock).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if blocker is not a student', async () => {
      // Arrange
      const supervisorId = USER_UUID_2;
      const studentId = USER_UUID;
      mockUsersRepository.findUserById.mockImplementation(id => {
        if (id === supervisorId) return Promise.resolve(mockSupervisor);
        if (id === studentId) return Promise.resolve(mockStudent);
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(service.createUserBlock(supervisorId, studentId)).rejects.toThrow(
        new BadRequestException('Only students can block supervisors'),
      );
      expect(mockUsersRepository.createUserBlock).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if blocked user is not a supervisor', async () => {
      // Arrange
      const studentId1 = USER_UUID;
      const studentId2 = USER_UUID_2;

      const anotherStudent = { ...mockStudent, id: studentId2, email: 'another@example.com' };

      mockUsersRepository.findUserById.mockImplementation(id => {
        if (id === studentId1) return Promise.resolve(mockStudent);
        if (id === studentId2) return Promise.resolve(anotherStudent);
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(service.createUserBlock(studentId1, studentId2)).rejects.toThrow(
        new BadRequestException('Students can only block supervisors'),
      );
      expect(mockUsersRepository.createUserBlock).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if block already exists', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const supervisorUserId = USER_UUID_2;
      mockUsersRepository.findUserById.mockImplementation(id => {
        if (id === studentUserId) return Promise.resolve(mockStudent);
        if (id === supervisorUserId) return Promise.resolve(mockSupervisor);
        return Promise.resolve(null);
      });
      mockUsersRepository.findUserBlockByIds.mockResolvedValue(mockUserBlock);

      // Act & Assert
      await expect(service.createUserBlock(studentUserId, supervisorUserId)).rejects.toThrow(
        new BadRequestException('This supervisor is already blocked'),
      );
      expect(mockUsersRepository.createUserBlock).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if student does not exist', async () => {
      // Arrange
      const nonExistentId = 'non-existent';
      const supervisorUserId = USER_UUID_2;
      mockUsersRepository.findUserById.mockImplementation(id => {
        if (id === nonExistentId) return Promise.resolve(null);
        if (id === supervisorUserId) return Promise.resolve(mockSupervisor);
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(service.createUserBlock(nonExistentId, supervisorUserId)).rejects.toThrow(
        new NotFoundException(`User with ID ${nonExistentId} not found`),
      );
      expect(mockUsersRepository.createUserBlock).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if supervisor does not exist', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const nonExistentId = 'non-existent';
      mockUsersRepository.findUserById.mockImplementation(id => {
        if (id === studentUserId) return Promise.resolve(mockStudent);
        if (id === nonExistentId) return Promise.resolve(null);
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(service.createUserBlock(studentUserId, nonExistentId)).rejects.toThrow(
        new NotFoundException(`User with ID ${nonExistentId} not found`),
      );
      expect(mockUsersRepository.createUserBlock).not.toHaveBeenCalled();
    });
  });

  describe('deleteUserBlock', () => {
    it('should delete a block between a student and a supervisor', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const supervisorUserId = USER_UUID_2;
      mockUsersRepository.findUserById.mockImplementation(id => {
        if (id === studentUserId) return Promise.resolve(mockStudent);
        if (id === supervisorUserId) return Promise.resolve(mockSupervisor);
        return Promise.resolve(null);
      });
      mockUsersRepository.findUserBlockByIds.mockResolvedValue(mockUserBlock);

      // Act
      await service.deleteUserBlock(studentUserId, supervisorUserId);

      // Assert
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(studentUserId);
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(supervisorUserId);
      expect(mockUsersRepository.findUserBlockByIds).toHaveBeenCalledWith(
        studentUserId,
        supervisorUserId,
      );
      expect(mockUsersRepository.deleteUserBlock).toHaveBeenCalledWith(
        studentUserId,
        supervisorUserId,
      );
    });

    it('should throw NotFoundException if student does not exist', async () => {
      // Arrange
      const nonExistentId = 'non-existent';
      const supervisorUserId = USER_UUID_2;
      mockUsersRepository.findUserById.mockImplementation(id => {
        if (id === nonExistentId) return Promise.resolve(null);
        return Promise.resolve(mockSupervisor);
      });

      // Act & Assert
      await expect(service.deleteUserBlock(nonExistentId, supervisorUserId)).rejects.toThrow(
        new NotFoundException(`User with ID ${nonExistentId} not found`),
      );
      expect(mockUsersRepository.deleteUserBlock).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if supervisor does not exist', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const nonExistentId = 'non-existent';
      mockUsersRepository.findUserById.mockImplementation(id => {
        if (id === studentUserId) return Promise.resolve(mockStudent);
        if (id === nonExistentId) return Promise.resolve(null);
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(service.deleteUserBlock(studentUserId, nonExistentId)).rejects.toThrow(
        new NotFoundException(`User with ID ${nonExistentId} not found`),
      );
      expect(mockUsersRepository.deleteUserBlock).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if block relationship does not exist', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const supervisorUserId = USER_UUID_2;
      mockUsersRepository.findUserById.mockImplementation(id => {
        if (id === studentUserId) return Promise.resolve(mockStudent);
        if (id === supervisorUserId) return Promise.resolve(mockSupervisor);
        return Promise.resolve(null);
      });
      mockUsersRepository.findUserBlockByIds.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteUserBlock(studentUserId, supervisorUserId)).rejects.toThrow(
        new NotFoundException('Block relationship not found'),
      );
      expect(mockUsersRepository.deleteUserBlock).not.toHaveBeenCalled();
    });
  });
});
