import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { TagsBulkImportDto } from './dto/tags-bulk-import.dto';
import { SupervisorsBulkImportDto } from './dto/supervisors-bulk-import.dto';
import { AdminRepository } from './admin.repository';
import { SupervisorsRepository } from '../supervisors/supervisors.repository';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            tagsBulkImport: jest.fn(),
            supervisorsBulkImport: jest.fn(),
          },
        },
        {
          provide: AdminRepository,
          useValue: {
            tagsBulkImport: jest.fn(),
            supervisorsBulkImport: jest.fn(),
          },
        },
        {
          provide: SupervisorsRepository,
          useValue: {
            findSupervisorByUserId: jest.fn(),
            findAllSupervisors: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('tagsBulkImport', () => {
    it('should call the service method with the provided DTO', async () => {
      // Mock data
      const mockDto: TagsBulkImportDto = {
        tags: ['javascript', 'python', 'react'],
        similarities: [{ field1: 'javascript', field2: 'react', similarity_score: 0.8 }],
      };

      const mockResponse = {
        success: true,
        message: 'Tags and similarities imported successfully',
        tagsProcessed: 3,
        similaritiesReplaced: 1,
        duplicateTagsSkipped: 0,
        duplicateSimsSkipped: 0,
      };

      // Setup mock
      const bulkImportSpy = jest.spyOn(service, 'tagsBulkImport').mockResolvedValue(mockResponse);

      // Execute
      const result = await controller.tagsBulkImport(mockDto);

      // Assertions
      expect(bulkImportSpy).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from the service', async () => {
      // Mock data
      const mockDto: TagsBulkImportDto = {
        tags: ['javascript', 'python'],
        similarities: [{ field1: 'javascript', field2: 'react', similarity_score: 0.8 }],
      };

      const mockError = new BadRequestException(
        "Tag 'react' from similarities not found in provided tags list.",
      );

      // Setup mock to throw error
      const bulkImportSpy = jest.spyOn(service, 'tagsBulkImport').mockRejectedValue(mockError);

      // Execute & assert
      await expect(controller.tagsBulkImport(mockDto)).rejects.toThrow(BadRequestException);
      expect(bulkImportSpy).toHaveBeenCalledWith(mockDto);
    });

    it('should handle empty tags and similarities', async () => {
      // Mock data with empty arrays
      const mockDto: TagsBulkImportDto = {
        tags: [],
        similarities: [],
      };

      const mockResponse = {
        success: true,
        message: 'Tags and similarities imported successfully',
        tagsProcessed: 0,
        similaritiesReplaced: 0,
        duplicateTagsSkipped: 0,
        duplicateSimsSkipped: 0,
      };

      // Setup mock
      const bulkImportSpy = jest.spyOn(service, 'tagsBulkImport').mockResolvedValue(mockResponse);

      // Execute
      const result = await controller.tagsBulkImport(mockDto);

      // Assertions
      expect(bulkImportSpy).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('supervisorsBulkImport', () => {
    it('should call the service method with the provided DTO', async () => {
      // Mock data
      const mockDto: SupervisorsBulkImportDto = {
        supervisors: [
          {
            email: 'supervisor1@example.com',
            first_name: 'John',
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

      // Setup mock
      const bulkImportSpy = jest
        .spyOn(service, 'supervisorsBulkImport')
        .mockResolvedValue(mockResponse);

      // Execute
      const result = await controller.supervisorsBulkImport(mockDto);

      // Assertions
      expect(bulkImportSpy).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResponse);
    });

    it('should propagate errors from the service', async () => {
      // Mock data with missing required fields
      const mockDto: SupervisorsBulkImportDto = {
        supervisors: [
          {
            email: 'supervisor1@example.com',
            // Missing first_name and last_name
          },
        ],
      };

      const mockError = new BadRequestException(
        'First name and last name are required when creating a new supervisor with email: supervisor1@example.com',
      );

      // Setup mock to throw error
      const bulkImportSpy = jest
        .spyOn(service, 'supervisorsBulkImport')
        .mockRejectedValue(mockError);

      // Execute & assert
      await expect(controller.supervisorsBulkImport(mockDto)).rejects.toThrow(BadRequestException);
      expect(bulkImportSpy).toHaveBeenCalledWith(mockDto);
    });

    it('should handle empty supervisors array', async () => {
      // Mock data with empty array
      const mockDto: SupervisorsBulkImportDto = {
        supervisors: [],
      };

      const mockResponse = {
        success: true,
        message: 'No supervisors imported or updated',
        supervisorsImported: 0,
        supervisorsUpdated: 0,
      };

      // Setup mock
      const bulkImportSpy = jest
        .spyOn(service, 'supervisorsBulkImport')
        .mockResolvedValue(mockResponse);

      // Execute
      const result = await controller.supervisorsBulkImport(mockDto);

      // Assertions
      expect(bulkImportSpy).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResponse);
    });
  });
});
