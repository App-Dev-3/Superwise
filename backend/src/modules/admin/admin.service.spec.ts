import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminRepository } from './admin.repository';
import { UsersRepository } from '../users/users.repository';
import { TagsRepository } from '../tags/tags.repository';
import { BadRequestException } from '@nestjs/common';
import { TagsBulkImportDto } from './dto/tags-bulk-import.dto';
import { Tag, Role } from '@prisma/client';

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

    it('should throw BadRequestException when admin email already exists', async () => {
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
      await expect(service.createAdmin(mockDto)).rejects.toThrow(BadRequestException);
      await expect(service.createAdmin(mockDto)).rejects.toThrow(
        /A user with email existing@fhstp.ac.at already exists/,
      );
      expect(mockUsersRepository.findUserByEmail).toHaveBeenCalledWith(mockDto.email);
      expect(mockAdminRepository.createAdmin).not.toHaveBeenCalled();
    });
  });
});
