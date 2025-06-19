import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminRepository } from './admin.repository';
import { UsersRepository } from '../users/users.repository';
import { TagsRepository } from '../tags/tags.repository';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TagsBulkImportDto } from './dto/tags-bulk-import.dto';
import { Role, RequestState } from '@prisma/client';
import { UserAlreadyExistsException } from '../../common/exceptions/custom-exceptions/user-already-exists.exception';
import { WinstonLoggerService } from '../../common/logging/winston-logger.service';

describe('AdminService', () => {
  let service: AdminService;
  let adminRepository: AdminRepository;
  let usersRepository: UsersRepository;

  // Proper UUIDs for testing
  const ADMIN_USER_ID = '123e4567-e89b-12d3-a456-426614174000';
  const EXISTING_USER_ID = '223e4567-e89b-12d3-a456-426614174001';
  const CLERK_ID = 'user_2NUj8tGhSFhTLD9sdP0q4P7VoJM';

  // Create mock repository objects with all methods
  const mockAdminRepository = {
    tagsBulkImport: jest.fn(),
    supervisorsBulkImport: jest.fn(),
    createAdmin: jest.fn(),
  };

  const mockUsersRepository = {
    findUserByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminRepository,
          useValue: mockAdminRepository,
        },
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: TagsRepository,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: WinstonLoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    adminRepository = module.get<AdminRepository>(AdminRepository);
    usersRepository = module.get<UsersRepository>(UsersRepository);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bulkImport', () => {
    it('should successfully import tags and similarities', async () => {
      // Arrange
      const mockDto: TagsBulkImportDto = {
        tags: ['javascript', 'python', 'react'],
        similarities: [
          { field1: 'javascript', field2: 'react', similarity_score: 0.8 },
          { field1: 'python', field2: 'javascript', similarity_score: 0.5 },
        ],
      };

      const mockResponse = {
        success: true,
        message: '3 new tags added, 0 tags already existed',
        tagsProcessed: 3,
        similaritiesReplaced: 2,
        duplicateTagsSkipped: 0,
        duplicateSimsSkipped: 0,
      };

      mockAdminRepository.tagsBulkImport.mockResolvedValue(mockResponse);

      // Act
      const result = await service.tagsBulkImport(mockDto);

      // Assert
      expect(mockAdminRepository.tagsBulkImport).toHaveBeenCalledWith(
        mockDto.tags,
        mockDto.similarities,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle duplicates with formatting inconsistencies', async () => {
      // Arrange
      const mockDto: TagsBulkImportDto = {
        tags: ['JavaScript', 'javascript', ' python ', 'Python', 'react'],
        similarities: [
          { field1: 'JavaScript', field2: 'react', similarity_score: 0.8 },
          { field1: 'javascript', field2: 'react', similarity_score: 0.8 }, // Duplicate with different case
          { field1: ' python ', field2: 'react', similarity_score: 0.6 },
          { field1: 'Python', field2: 'react', similarity_score: 0.6 }, // Duplicate with different case
        ],
      };

      const mockResponse = {
        success: true,
        message: '3 new tags added, 0 tags already existed',
        tagsProcessed: 3,
        similaritiesReplaced: 2,
        duplicateTagsSkipped: 2, // 5 tags - 3 unique (case-insensitive)
        duplicateSimsSkipped: 2, // 4 similarities - 2 unique (case-insensitive)
      };

      mockAdminRepository.tagsBulkImport.mockResolvedValue(mockResponse);

      // Act
      const result = await service.tagsBulkImport(mockDto);

      // Assert
      expect(mockAdminRepository.tagsBulkImport).toHaveBeenCalledWith(
        mockDto.tags,
        mockDto.similarities,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException when tag from similarities not found in tags list (field1)', async () => {
      // Arrange
      const mockDto: TagsBulkImportDto = {
        tags: ['python', 'react'],
        similarities: [{ field1: 'javascript', field2: 'react', similarity_score: 0.8 }],
      };

      mockAdminRepository.tagsBulkImport.mockRejectedValue(
        new BadRequestException(`Tag 'javascript' not found in provided tags list.`),
      );

      // Act & Assert
      await expect(service.tagsBulkImport(mockDto)).rejects.toThrow(BadRequestException);
      await expect(service.tagsBulkImport(mockDto)).rejects.toThrow(
        /Tag 'javascript' not found in provided tags list./,
      );
    });

    it('should throw BadRequestException when tag from similarities not found in tags list (field2)', async () => {
      // Arrange
      const mockDto: TagsBulkImportDto = {
        tags: ['javascript', 'python'],
        similarities: [{ field1: 'javascript', field2: 'react', similarity_score: 0.8 }],
      };

      mockAdminRepository.tagsBulkImport.mockRejectedValue(
        new BadRequestException("Tag 'react' from similarities not found in provided tags list."),
      );

      // Act & Assert
      await expect(service.tagsBulkImport(mockDto)).rejects.toThrow(BadRequestException);
      await expect(service.tagsBulkImport(mockDto)).rejects.toThrow(
        /Tag 'react' from similarities not found in provided tags list/,
      );
    });
  });

  describe('supervisorsBulkImport', () => {
    it('should successfully import supervisors', async () => {
      // Arrange
      const mockDto = {
        supervisors: [
          {
            email: 'supervisor1@example.com',
            first_name: 'John',
            last_name: 'Doe',
            bio: 'Experienced supervisor',
            total_spots: 5,
            available_spots: 3,
          },
        ],
      };

      const mockResponse = {
        success: true,
        message: '1 new supervisors successfully imported',
        supervisorsImported: 1,
        supervisorsUpdated: 0,
      };

      mockAdminRepository.supervisorsBulkImport.mockResolvedValue(mockResponse);

      // Act
      const result = await service.supervisorsBulkImport(mockDto);

      // Assert
      expect(mockAdminRepository.supervisorsBulkImport).toHaveBeenCalledWith(mockDto.supervisors);
      expect(result).toEqual(mockResponse);
    });

    it('should handle updates to existing supervisors', async () => {
      // Arrange
      const mockDto = {
        supervisors: [
          {
            email: 'existing@example.com',
            bio: 'Updated bio',
            total_spots: 10,
          },
        ],
      };

      const mockResponse = {
        success: true,
        message: '0 new supervisors successfully imported and 1 existing supervisors updated',
        supervisorsImported: 0,
        supervisorsUpdated: 1,
      };

      mockAdminRepository.supervisorsBulkImport.mockResolvedValue(mockResponse);

      // Act
      const result = await service.supervisorsBulkImport(mockDto);

      // Assert
      expect(mockAdminRepository.supervisorsBulkImport).toHaveBeenCalledWith(mockDto.supervisors);
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException on missing email', async () => {
      // Arrange
      const mockDto = {
        supervisors: [
          {
            email: '', // Empty email
            first_name: 'John',
            last_name: 'Doe',
          },
        ],
      };

      mockAdminRepository.supervisorsBulkImport.mockRejectedValue(
        new BadRequestException('Email is required for supervisor: Doe'),
      );

      // Act & Assert
      await expect(service.supervisorsBulkImport(mockDto)).rejects.toThrow(BadRequestException);
      await expect(service.supervisorsBulkImport(mockDto)).rejects.toThrow(
        /Email is required for supervisor/,
      );
    });
  });

  describe('createAdmin', () => {
    it('should successfully create a new admin user when email does not exist', async () => {
      // Arrange
      const mockDto = {
        email: 'admin@fhstp.ac.at',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockCreatedUser = {
        id: ADMIN_USER_ID,
        email: 'admin@fhstp.ac.at',
        first_name: 'John',
        last_name: 'Doe',
        role: Role.ADMIN,
        is_registered: false,
        clerk_id: null,
        profile_image: null,
        is_deleted: false,
        created_at: new Date('2023-01-15T10:30:00Z'),
        updated_at: new Date('2023-01-15T10:30:00Z'),
      };

      mockUsersRepository.findUserByEmail.mockResolvedValue(null); // No existing user
      mockAdminRepository.createAdmin.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await service.createAdmin(mockDto);

      // Assert
      expect(mockUsersRepository.findUserByEmail).toHaveBeenCalledWith(mockDto.email);
      expect(mockAdminRepository.createAdmin).toHaveBeenCalledWith({
        email: mockDto.email,
        first_name: mockDto.first_name,
        last_name: mockDto.last_name,
      });
      expect(result).toEqual({
        success: true,
        message: 'Admin user created successfully',
        adminId: ADMIN_USER_ID,
      });
    });

    it('should throw UserAlreadyExistsException when admin email already exists', async () => {
      // Arrange
      const mockDto = {
        email: 'existing@fhstp.ac.at',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockExistingUser = {
        id: EXISTING_USER_ID,
        email: 'existing@fhstp.ac.at',
        first_name: 'Jane',
        last_name: 'Smith',
        role: Role.STUDENT,
        is_registered: true,
        clerk_id: CLERK_ID,
        profile_image: null,
        is_deleted: false,
        created_at: new Date('2023-01-10T08:00:00Z'),
        updated_at: new Date('2023-01-10T08:00:00Z'),
      };

      mockUsersRepository.findUserByEmail.mockResolvedValue(mockExistingUser);

      // Act & Assert
      await expect(service.createAdmin(mockDto)).rejects.toThrow(
        new UserAlreadyExistsException('existing@fhstp.ac.at'),
      );
      expect(mockUsersRepository.findUserByEmail).toHaveBeenCalledWith(mockDto.email);
      expect(mockAdminRepository.createAdmin).not.toHaveBeenCalled();
    });

    it('should handle email case insensitivity when checking for existing users', async () => {
      // Arrange
      const mockDto = {
        email: 'ADMIN@FHSTP.AC.AT',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockExistingUser = {
        id: EXISTING_USER_ID,
        email: 'admin@fhstp.ac.at',
        first_name: 'Existing',
        last_name: 'Admin',
        role: Role.ADMIN,
        is_registered: true,
        clerk_id: CLERK_ID,
        profile_image: null,
        is_deleted: false,
        created_at: new Date('2023-01-10T08:00:00Z'),
        updated_at: new Date('2023-01-10T08:00:00Z'),
      };

      mockUsersRepository.findUserByEmail.mockResolvedValue(mockExistingUser);

      // Act & Assert
      await expect(service.createAdmin(mockDto)).rejects.toThrow(
        new UserAlreadyExistsException('ADMIN@FHSTP.AC.AT'),
      );
    });

    it('should handle concurrent creation attempts (race condition)', async () => {
      // Arrange
      const mockDto = {
        email: 'admin@fhstp.ac.at',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockCreatedUser = {
        id: ADMIN_USER_ID,
        email: 'admin@fhstp.ac.at',
        first_name: 'John',
        last_name: 'Doe',
        role: Role.ADMIN,
        is_registered: false,
        clerk_id: null,
        profile_image: null,
        is_deleted: false,
        created_at: new Date('2023-01-15T10:30:00Z'),
        updated_at: new Date('2023-01-15T10:30:00Z'),
      };

      // First call returns null (no user exists)
      // Second call returns the created user (simulating another request created it)
      mockUsersRepository.findUserByEmail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCreatedUser);

      // Simulate a unique constraint violation from Prisma
      const prismaError = new Error('Unique constraint failed on the fields: (`email`)');
      (prismaError as any).code = 'P2002'; // Prisma unique constraint error code
      mockAdminRepository.createAdmin.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(service.createAdmin(mockDto)).rejects.toThrow(
        'Unique constraint failed on the fields: (`email`)',
      );

      // Verify the service attempted to create after checking
      expect(mockUsersRepository.findUserByEmail).toHaveBeenCalledWith(mockDto.email);
      expect(mockAdminRepository.createAdmin).toHaveBeenCalledWith({
        email: mockDto.email,
        first_name: mockDto.first_name,
        last_name: mockDto.last_name,
      });
    });
  });
});

describe('AdminService - resetUser', () => {
  let service: AdminService;
  let prismaService: PrismaService;
  let mockTransaction: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    student: {
      findUnique: jest.Mock;
    };
    supervisor: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    supervisionRequest: {
      findMany: jest.Mock;
      updateMany: jest.Mock;
    };
    $executeRaw: jest.Mock;
  };

  const mockUser = {
    id: 'user-uuid-123',
    email: 'test@fhstp.ac.at',
    role: Role.STUDENT,
    first_name: 'Test',
    last_name: 'User',
  };

  const mockAdmin = {
    id: 'admin-uuid-456',
    email: 'admin@fhstp.ac.at',
    role: Role.ADMIN,
    first_name: 'Admin',
    last_name: 'User',
  };

  beforeEach(async () => {
    mockTransaction = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      student: {
        findUnique: jest.fn(),
      },
      supervisor: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      supervisionRequest: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
      $executeRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminRepository,
          useValue: {},
        },
        {
          provide: UsersRepository,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest
              .fn()
              .mockImplementation((callback: (tx: typeof mockTransaction) => Promise<any>) =>
                callback(mockTransaction),
              ),
          },
        },
        {
          provide: WinstonLoggerService,
          useValue: {
            log: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('Input Validation', () => {
    it('should throw BadRequestException for invalid userId', async () => {
      await expect(service.resetUser('', 'admin-id')).rejects.toThrow(BadRequestException);
      await expect(service.resetUser(null as any, 'admin-id')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid requestingAdminId', async () => {
      await expect(service.resetUser('user-id', '')).rejects.toThrow(BadRequestException);
      await expect(service.resetUser('user-id', null as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Security Validation', () => {
    it('should prevent admin self-reset', async () => {
      const adminId = 'same-id-123';

      await expect(service.resetUser(adminId, adminId)).rejects.toThrow(
        new ForbiddenException('Admins cannot reset their own accounts'),
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockTransaction.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.resetUser('non-existent', 'admin-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for non-admin requester', async () => {
      mockTransaction.user.findUnique
        .mockResolvedValueOnce(mockUser) // Target user exists
        .mockResolvedValueOnce({ ...mockAdmin, role: Role.STUDENT }); // Requesting user is not admin

      await expect(service.resetUser('user-id', 'non-admin-id')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should prevent admin-to-admin reset', async () => {
      const adminUser = { ...mockUser, role: Role.ADMIN };

      mockTransaction.user.findUnique
        .mockResolvedValueOnce(adminUser) // Target is admin
        .mockResolvedValueOnce(mockAdmin); // Requester is admin

      await expect(service.resetUser('admin-user-id', 'admin-id')).rejects.toThrow(
        new ForbiddenException('Cannot reset admin users'),
      );
    });
  });

  describe('Student Reset', () => {
    it('should successfully reset student with active supervisions', async () => {
      const studentProfile = { id: '123e4567-e89b-12d3-a456-426614174000', user_id: 'user-id' };
      // Only return ACCEPTED requests (like the real query filters for)
      const acceptedRequests = [
        {
          id: 'req-1',
          request_state: RequestState.ACCEPTED,
          supervisor_id: '223e4567-e89b-12d3-a456-426614174001',
        },
        {
          id: 'req-2',
          request_state: RequestState.ACCEPTED,
          supervisor_id: '223e4567-e89b-12d3-a456-426614174002',
        },
      ];

      mockTransaction.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockAdmin);
      mockTransaction.student.findUnique.mockResolvedValue(studentProfile);
      mockTransaction.supervisionRequest.findMany.mockResolvedValue(acceptedRequests);
      mockTransaction.supervisionRequest.updateMany.mockResolvedValue({ count: 2 });
      mockTransaction.supervisor.update.mockResolvedValue({});
      mockTransaction.$executeRaw.mockResolvedValue(undefined);
      mockTransaction.user.update.mockResolvedValue(mockUser);

      const result = await service.resetUser(
        '223e4567-e89b-12d3-a456-426614174001',
        '223e4567-e89b-12d3-a456-426614174003',
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain(mockUser.email);
      expect(mockTransaction.supervisionRequest.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['req-1', 'req-2'] } },
        data: { request_state: RequestState.WITHDRAWN },
      });
      expect(mockTransaction.supervisor.update).toHaveBeenCalled();
    });
  });

  describe('Supervisor Reset', () => {
    it('should successfully reset supervisor with active supervisions', async () => {
      const supervisorUser = { ...mockUser, role: Role.SUPERVISOR };
      const supervisorProfile = { id: 'supervisor-profile-123', user_id: 'user-id' };
      const activeSupervisions = [{ id: 'sup-req-1' }, { id: 'sup-req-2' }];

      mockTransaction.user.findUnique
        .mockResolvedValueOnce(supervisorUser)
        .mockResolvedValueOnce(mockAdmin);
      mockTransaction.supervisor.findUnique.mockResolvedValue(supervisorProfile);
      mockTransaction.supervisionRequest.findMany.mockResolvedValue(activeSupervisions);
      mockTransaction.supervisionRequest.updateMany.mockResolvedValue({ count: 2 });
      mockTransaction.user.update.mockResolvedValue(supervisorUser);

      const result = await service.resetUser('user-id', 'admin-id');

      expect(result.success).toBe(true);
      expect(mockTransaction.supervisionRequest.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['sup-req-1', 'sup-req-2'] } },
        data: { request_state: RequestState.WITHDRAWN },
      });
    });
  });

  describe('Transaction Rollback', () => {
    it('should rollback on supervision update failure', async () => {
      const studentProfile = { id: '123e4567-e89b-12d3-a456-426614174000', user_id: 'user-id' };

      mockTransaction.user.findUnique
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockAdmin);
      mockTransaction.student.findUnique.mockResolvedValue(studentProfile);
      mockTransaction.supervisionRequest.findMany.mockResolvedValue([
        {
          id: 'req-1',
          request_state: RequestState.ACCEPTED,
          supervisor_id: '223e4567-e89b-12d3-a456-426614174001',
        },
      ]);
      mockTransaction.supervisionRequest.updateMany.mockRejectedValue(new Error('DB Error'));

      await expect(service.resetUser('user-id', 'admin-id')).rejects.toThrow('DB Error');
    });
  });
});
