import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { TagsBulkImportDto } from './dto/tags-bulk-import.dto';
import { SupervisorsBulkImportDto } from './dto/supervisors-bulk-import.dto';
import { AdminRepository } from './admin.repository';
import { SupervisorsRepository } from '../supervisors/supervisors.repository';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UserAlreadyExistsException } from '../../common/exceptions/custom-exceptions/user-already-exists.exception';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  // Proper UUIDs for testing
  const ADMIN_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

  // Create mock service object with all methods
  const mockAdminService = {
    tagsBulkImport: jest.fn(),
    supervisorsBulkImport: jest.fn(),
    createAdmin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('tagsBulkImport', () => {
    it('should call service.tagsBulkImport and return its result', async () => {
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

      mockAdminService.tagsBulkImport.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.tagsBulkImport(mockDto);

      // Assert
      expect(service.tagsBulkImport).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResponse);
    });

    it('should pass through BadRequestException from service', async () => {
      // Arrange
      const mockDto: TagsBulkImportDto = {
        tags: ['javascript'],
        similarities: [
          { field1: 'javascript', field2: 'nodejs', similarity_score: 0.8 }, // nodejs not in tags
        ],
      };

      mockAdminService.tagsBulkImport.mockRejectedValue(
        new BadRequestException("Tag 'react' not found in provided tags list."),
      );

      // Act & Assert
      await expect(controller.tagsBulkImport(mockDto)).rejects.toThrow(BadRequestException);
      expect(service.tagsBulkImport).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('supervisorsBulkImport', () => {
    it('should call service.supervisorsBulkImport and return its result', async () => {
      // Arrange
      const mockDto: SupervisorsBulkImportDto = {
        supervisors: [
          {
            email: 'supervisor@fhstp.ac.at',
            first_name: 'Jane',
            last_name: 'Doe',
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

      mockAdminService.supervisorsBulkImport.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.supervisorsBulkImport(mockDto);

      // Assert
      expect(service.supervisorsBulkImport).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResponse);
    });

    it('should pass through BadRequestException from service', async () => {
      // Arrange
      const mockDto: SupervisorsBulkImportDto = {
        supervisors: [
          {
            email: '', // Missing email
            first_name: 'Jane',
            last_name: 'Doe',
          },
        ],
      };

      mockAdminService.supervisorsBulkImport.mockRejectedValue(
        new BadRequestException('Email is required for supervisor: Doe'),
      );

      // Act & Assert
      await expect(controller.supervisorsBulkImport(mockDto)).rejects.toThrow(BadRequestException);
      expect(service.supervisorsBulkImport).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('createAdmin', () => {
    it('should call service.createAdmin and return its result', async () => {
      // Arrange
      const mockDto: CreateAdminDto = {
        email: 'admin@fhstp.ac.at',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockResponse = {
        success: true,
        message: 'Admin user created successfully',
        adminId: ADMIN_USER_ID,
      };

      mockAdminService.createAdmin.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createAdmin(mockDto);

      // Assert
      expect(service.createAdmin).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResponse);
    });

    it('should pass through UserAlreadyExistsException when email already exists', async () => {
      // Arrange
      const mockDto: CreateAdminDto = {
        email: 'existing@fhstp.ac.at',
        first_name: 'John',
        last_name: 'Doe',
      };

      mockAdminService.createAdmin.mockRejectedValue(
        new UserAlreadyExistsException('existing@fhstp.ac.at'),
      );

      // Act & Assert
      await expect(controller.createAdmin(mockDto)).rejects.toThrow(UserAlreadyExistsException);
      expect(service.createAdmin).toHaveBeenCalledWith(mockDto);
    });
  });
});

describe('AdminController - resetUser', () => {
  let controller: AdminController;
  let adminService: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            resetUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  it('should call adminService.resetUser with correct parameters', async () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const requestingAdminId = '456e7890-e89b-12d3-a456-426614174001';
    const expectedResult = { success: true, message: 'User reset successfully' };

    const mockReq = {
      user: { id: requestingAdminId },
    };

    (adminService.resetUser as jest.Mock).mockResolvedValue(expectedResult);

    const result = await controller.resetUser(userId, mockReq);

    expect(adminService.resetUser).toHaveBeenCalledWith(userId, requestingAdminId);
    expect(result).toEqual(expectedResult);
  });
});
