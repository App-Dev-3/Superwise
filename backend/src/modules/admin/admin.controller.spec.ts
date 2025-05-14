import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminRepository } from './admin.repository';
import { TagsRepository } from '../tags/tags.repository';
import { BadRequestException } from '@nestjs/common';
import { TagsBulkImportDto } from './dto/tagsBulk-import.dto';

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
            bulkImport: jest.fn(),
          },
        },
        AdminRepository,
        TagsRepository,
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

  describe('bulkImport', () => {
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
});
