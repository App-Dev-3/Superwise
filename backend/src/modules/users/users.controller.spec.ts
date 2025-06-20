import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role, User, UserTag, UserBlock } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserWithRelations } from './entities/user-with-relations.entity';
import { SetUserTagsDto } from './dto/set-user-tags.dto';
import { CreateUserBlockDto } from './dto/create-user-block.dto';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
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
    deleteUser: jest.fn(),
    findUserTagsByUserId: jest.fn(),
    setUserTagsByUserId: jest.fn(),
    checkUserRegistration: jest.fn(),
    // User Block methods
    findBlockedSupervisorsByStudentUserId: jest.fn(),
    createUserBlock: jest.fn(),
    deleteUserBlock: jest.fn(),
    searchUsers: jest.fn(),
  };

  const USER_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const USER_UUID_2 = '123e4567-e89b-12d3-a456-426614174001';
  const USER_UUID_3 = '123e4567-e89b-12d3-a456-426614174003';
  const ADMIN_UUID = '123e4567-e89b-12d3-a456-426614174002';
  const TAG_UUID_1 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  const TAG_UUID_2 = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  const CLERK_ID = 'user_2NUj8tGhSFhTLD9sdP0q4P7VoJM';

  const mockUser: User = {
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

  const mockAdmin: User = {
    ...mockUser,
    id: ADMIN_UUID,
    email: 'admin@fhstp.ac.at',
    role: Role.ADMIN,
  };

  const mockSupervisor: User = {
    ...mockUser,
    id: USER_UUID_2,
    email: 'supervisor@fhstp.ac.at',
    role: Role.SUPERVISOR,
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
  const mockUserTags = [mockUserTag];

  const mockUserBlock: UserBlock = {
    blocker_id: USER_UUID, // Student
    blocked_id: USER_UUID_2, // Supervisor
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockAuthUser = {
    clerk_id: CLERK_ID,
    email: 'exampleStudent1@fhstp.ac.at',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();
    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'exampleStudent1@fhstp.ac.at',
        first_name: 'Max',
        last_name: 'Mustermann',
        profile_image: 'https://superwise.at/images/b8a2d4e5-f7c8-41e3-9b9d-89c5f8a12345.jpg',
      };
      mockUsersService.createUser.mockResolvedValue(mockUser);
      const result = await controller.createUser(createUserDto, mockAuthUser);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(mockAuthUser, createUserDto);
    });
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      mockUsersService.findAllUsers.mockResolvedValue(mockUsers);
      const result = await controller.findAllUsers();
      expect(result).toEqual(mockUsers);
      expect(mockUsersService.findAllUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      const email = 'exampleStudent1@fhstp.ac.at';
      mockUsersService.findUserByEmail.mockResolvedValue(mockUser);
      const result = await controller.findUserByEmail(email);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null when no user is found with the email', async () => {
      const email = 'nonexistent@example.com';
      mockUsersService.findUserByEmail.mockResolvedValue(null);
      const result = await controller.findUserByEmail(email);
      expect(result).toBeNull();
      expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('findUsersByFirstName', () => {
    it('should find users by first name', async () => {
      mockUsersService.findUsersByFirstName.mockResolvedValue([mockUser]);
      const result = await controller.findUsersByFirstName('Max');
      expect(result).toEqual([mockUser]);
      expect(mockUsersService.findUsersByFirstName).toHaveBeenCalledWith('Max');
    });
  });

  describe('findUsersByLastName', () => {
    it('should find users by last name', async () => {
      mockUsersService.findUsersByLastName.mockResolvedValue([mockUser]);
      const result = await controller.findUsersByLastName('Mustermann');
      expect(result).toEqual([mockUser]);
      expect(mockUsersService.findUsersByLastName).toHaveBeenCalledWith('Mustermann');
    });
  });

  describe('findUsersByTagId', () => {
    it('should find users by tag ID', async () => {
      mockUsersService.findUsersByTagId.mockResolvedValue([mockUser]);
      const result = await controller.findUsersByTagId(TAG_UUID_1);
      expect(result).toEqual([mockUser]);
      expect(mockUsersService.findUsersByTagId).toHaveBeenCalledWith(TAG_UUID_1);
    });
  });

  describe('findUsersByTagIds', () => {
    it('should find users by multiple tag IDs', async () => {
      mockUsersService.findUsersByTagIds.mockResolvedValue([mockUser]);
      const result = await controller.findUsersByTagIds(`${TAG_UUID_1},${TAG_UUID_2}`);
      expect(result).toEqual([mockUser]);
      expect(mockUsersService.findUsersByTagIds).toHaveBeenCalledWith([TAG_UUID_1, TAG_UUID_2]);
    });
  });

  describe('findUserById', () => {
    it('should return a user by ID', async () => {
      mockUsersService.findUserById.mockResolvedValue(mockUser);
      const result = await controller.findUserById(USER_UUID);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(USER_UUID);
    });

    it('should propagate NotFoundException', async () => {
      const expectedError = new NotFoundException();
      mockUsersService.findUserById.mockRejectedValue(expectedError);
      await expect(controller.findUserById('non-existent')).rejects.toThrow(expectedError);
    });
  });

  describe('findUserByIdWithRelations', () => {
    it('should return a user with relations by ID', async () => {
      const userWithRelations: UserWithRelations = { ...mockUser, tags: [] };
      mockUsersService.findUserByIdWithRelations.mockResolvedValue(userWithRelations);
      const result = await controller.findUserByIdWithRelations(USER_UUID);
      expect(result).toEqual(userWithRelations);
      expect(mockUsersService.findUserByIdWithRelations).toHaveBeenCalledWith(USER_UUID);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        first_name: 'Updated',
        last_name: 'Mustermann',
      };
      mockUsersService.updateUser.mockResolvedValue(mockUser);
      const result = await controller.updateUser(USER_UUID, updateUserDto, mockUser);
      expect(result).toEqual(mockUser);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(USER_UUID, updateUserDto);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const mockDeleteResult = {
        success: true,
        message: 'User has been deleted successfully',
      };
      mockUsersService.deleteUser.mockResolvedValue(mockDeleteResult);

      const result = await controller.deleteUser(USER_UUID, mockUser);

      expect(result).toEqual(mockDeleteResult);
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(USER_UUID, mockUser);
    });
  });

  describe('findUserTagsByUserId', () => {
    it('should find tags for a user', async () => {
      mockUsersService.findUserTagsByUserId.mockResolvedValue(mockUserTags);
      const result = await controller.findUserTagsByUserId(USER_UUID);
      expect(result).toEqual(mockUserTags);
      expect(mockUsersService.findUserTagsByUserId).toHaveBeenCalledWith(USER_UUID);
    });
  });

  describe('setUserTagsByUserId', () => {
    it('should set tags for a user by id', async () => {
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
      mockUsersService.setUserTagsByUserId.mockResolvedValue(expectedUserTags);

      // Act
      const result = await controller.setUserTagsByUserId(userId, dto, mockUser);

      // Assert
      expect(result).toEqual(expectedUserTags);
      expect(mockUsersService.setUserTagsByUserId).toHaveBeenCalledWith(userId, dto);
    });

    it('should propagate exceptions from the service', async () => {
      const userId = USER_UUID;
      const dto: SetUserTagsDto = { tags: [] };
      const expectedError = new BadRequestException('Invalid priorities');
      mockUsersService.setUserTagsByUserId.mockRejectedValue(expectedError);

      await expect(controller.setUserTagsByUserId(userId, dto, mockUser)).rejects.toThrow(
        expectedError,
      );
    });
  });

  // --- User Block Operations ---
  describe('findBlockedSupervisorsByStudentUserId', () => {
    it('should find blocked supervisors for a student when called by the student', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const blockedSupervisors = [mockUserBlock];
      mockUsersService.findBlockedSupervisorsByStudentUserId.mockResolvedValue(blockedSupervisors);

      // Act
      const result = await controller.findBlockedSupervisorsByStudentUserId(
        studentUserId,
        mockUser,
      );

      // Assert
      expect(result).toEqual(blockedSupervisors);
      expect(mockUsersService.findBlockedSupervisorsByStudentUserId).toHaveBeenCalledWith(
        studentUserId,
      );
    });

    it('should find blocked supervisors for a student when called by an admin', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const blockedSupervisors = [mockUserBlock];
      mockUsersService.findBlockedSupervisorsByStudentUserId.mockResolvedValue(blockedSupervisors);

      // Act
      const result = await controller.findBlockedSupervisorsByStudentUserId(
        studentUserId,
        mockAdmin,
      );

      // Assert
      expect(result).toEqual(blockedSupervisors);
      expect(mockUsersService.findBlockedSupervisorsByStudentUserId).toHaveBeenCalledWith(
        studentUserId,
      );
    });

    it("should throw UnauthorizedException when a student tries to view another student's blocked supervisors", async () => {
      // Arrange
      const otherStudentUserId = USER_UUID_3;
      const currentUser = mockUser; // Student with id USER_UUID

      try {
        // Act
        await controller.findBlockedSupervisorsByStudentUserId(otherStudentUserId, currentUser);
        // If we get here, fail the test
        fail('Expected an UnauthorizedException to be thrown');
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(mockUsersService.findBlockedSupervisorsByStudentUserId).not.toHaveBeenCalled();
      }
    });

    it('should propagate errors from the service', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const expectedError = new BadRequestException('User is not a student');
      mockUsersService.findBlockedSupervisorsByStudentUserId.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(
        controller.findBlockedSupervisorsByStudentUserId(studentUserId, mockUser),
      ).rejects.toThrow(expectedError);
    });
  });

  describe('createUserBlock', () => {
    it('should create a block when a student blocks a supervisor', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const dto: CreateUserBlockDto = { blocked_id: USER_UUID_2 };
      mockUsersService.createUserBlock.mockResolvedValue(mockUserBlock);

      // Act
      const result = await controller.createUserBlock(studentUserId, dto, mockUser);

      // Assert
      expect(result).toEqual(mockUserBlock);
      expect(mockUsersService.createUserBlock).toHaveBeenCalledWith(studentUserId, dto.blocked_id);
    });

    it('should create a block when an admin blocks a supervisor on behalf of a student', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const dto: CreateUserBlockDto = { blocked_id: USER_UUID_2 };
      mockUsersService.createUserBlock.mockResolvedValue(mockUserBlock);

      // Act
      const result = await controller.createUserBlock(studentUserId, dto, mockAdmin);

      // Assert
      expect(result).toEqual(mockUserBlock);
      expect(mockUsersService.createUserBlock).toHaveBeenCalledWith(studentUserId, dto.blocked_id);
    });

    it('should throw UnauthorizedException when a student tries to block a supervisor on behalf of another student', async () => {
      // Arrange
      const otherStudentUserId = USER_UUID_3;
      const dto: CreateUserBlockDto = { blocked_id: USER_UUID_2 };
      const currentUser = mockUser; // Student with id USER_UUID

      try {
        // Act
        await controller.createUserBlock(otherStudentUserId, dto, currentUser);
        // If we get here, fail the test
        fail('Expected an UnauthorizedException to be thrown');
      } catch (error) {
        // Assert
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(mockUsersService.createUserBlock).not.toHaveBeenCalled();
      }
    });

    it('should propagate errors from the service', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const dto: CreateUserBlockDto = { blocked_id: USER_UUID_2 };
      const expectedError = new BadRequestException('User cannot block themselves');
      mockUsersService.createUserBlock.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(controller.createUserBlock(studentUserId, dto, mockUser)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('removeUserBlock', () => {
    it('should delete a block when a student unblocks a supervisor', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const supervisorUserId = USER_UUID_2;
      mockUsersService.deleteUserBlock.mockResolvedValue(undefined);

      // Act
      await controller.removeUserBlock(studentUserId, supervisorUserId, mockUser);

      // Assert
      expect(mockUsersService.deleteUserBlock).toHaveBeenCalledWith(
        studentUserId,
        supervisorUserId,
      );
    });

    it('should delete a block when an admin unblocks a supervisor on behalf of a student', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const supervisorUserId = USER_UUID_2;
      mockUsersService.deleteUserBlock.mockResolvedValue(undefined);

      // Act
      await controller.removeUserBlock(studentUserId, supervisorUserId, mockAdmin);

      // Assert
      expect(mockUsersService.deleteUserBlock).toHaveBeenCalledWith(
        studentUserId,
        supervisorUserId,
      );
    });

    it('should throw UnauthorizedException when a student tries to unblock a supervisor on behalf of another student', async () => {
      // Arrange
      const otherStudentUserId = USER_UUID_3;
      const supervisorUserId = USER_UUID_2;
      const currentUser = mockUser; // Student

      // Act & Assert
      await expect(
        controller.removeUserBlock(otherStudentUserId, supervisorUserId, currentUser),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockUsersService.deleteUserBlock).not.toHaveBeenCalled();
    });

    it('should propagate errors from the service', async () => {
      // Arrange
      const studentUserId = USER_UUID;
      const supervisorUserId = USER_UUID_2;
      const expectedError = new NotFoundException('Block relationship not found');
      mockUsersService.deleteUserBlock.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(
        controller.removeUserBlock(studentUserId, supervisorUserId, mockUser),
      ).rejects.toThrow(expectedError);
    });
  });

  describe('searchUsers', () => {
    it('should search users with the provided query', async () => {
      // Arrange
      const searchQuery = 'test';
      mockUsersService.searchUsers.mockResolvedValue([mockUser]);

      // Act
      const result = await controller.searchUsers(searchQuery);

      // Assert
      expect(result).toEqual([mockUser]);
      expect(mockUsersService.searchUsers).toHaveBeenCalledWith(searchQuery);
    });
  });
});
