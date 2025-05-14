import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminRepository } from './admin.repository';
import { TagsRepository } from '../tags/tags.repository';
import { BadRequestException } from '@nestjs/common';
import { TagsBulkImportDto } from './dto/tagsBulk-import.dto';
import { Tag } from '@prisma/client';

describe('AdminService', () => {
  let service: AdminService;
  let adminRepository: AdminRepository;
  // Create mock functions upfront
  const mockBulkImport = jest.fn();

  beforeEach(async () => {
    // Reset mocks before each test
    mockBulkImport.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminRepository,
          useValue: {
            bulkImport: mockBulkImport,
          },
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bulkImport', () => {
    it('should successfully import tags and similarities', async () => {
      // Mock data
      const mockDto: TagsBulkImportDto = {
        tags: ['javascript', 'python', 'react'],
        similarities: [
          { field1: 'javascript', field2: 'react', similarity_score: 0.8 },
          { field1: 'python', field2: 'javascript', similarity_score: 0.5 },
        ],
      };

      // Setup mock for bulkImport with the correct return structure
      mockBulkImport.mockResolvedValue({
        success: true,
        message: '3 new tags added, 0 tags already existed',
        tagsProcessed: 3,
        similaritiesReplaced: 2,
        duplicateTagsSkipped: 0,
        duplicateSimsSkipped: 0,
      });

      // Execute
      const result = await service.bulkImport(mockDto);

      // Verify results
      expect(mockBulkImport).toHaveBeenCalledWith(mockDto.tags, mockDto.similarities);
      expect(result).toEqual({
        success: true,
        message: '3 new tags added, 0 tags already existed',
        tagsProcessed: 3,
        similaritiesReplaced: 2,
        duplicateTagsSkipped: 0,
        duplicateSimsSkipped: 0,
      });
    });

    it('should handle duplicates with formatting inconsistencies', async () => {
      // Mock data with case and whitespace inconsistencies
      const mockDto: TagsBulkImportDto = {
        tags: ['JavaScript', 'javascript', ' python ', 'Python', 'react'],
        similarities: [
          { field1: 'JavaScript', field2: 'react', similarity_score: 0.8 },
          { field1: 'javascript', field2: 'react', similarity_score: 0.8 }, // Duplicate with different case
          { field1: ' python ', field2: 'react', similarity_score: 0.6 },
          { field1: 'Python', field2: 'react', similarity_score: 0.6 }, // Duplicate with different case
        ],
      };

      // Setup mock for bulkImport
      mockBulkImport.mockResolvedValue({
        success: true,
        message: '3 new tags added, 0 tags already existed',
        tagsProcessed: 3,
        similaritiesReplaced: 2,
        duplicateTagsSkipped: 2, // 5 tags - 3 unique (case-insensitive)
        duplicateSimsSkipped: 2, // 4 similarities - 2 unique (case-insensitive)
      });

      // Execute
      const result = await service.bulkImport(mockDto);

      // Verify results
      expect(mockBulkImport).toHaveBeenCalledWith(mockDto.tags, mockDto.similarities);
      expect(result).toEqual({
        success: true,
        message: '3 new tags added, 0 tags already existed',
        tagsProcessed: 3,
        similaritiesReplaced: 2,
        duplicateTagsSkipped: 2,
        duplicateSimsSkipped: 2,
      });
    });

    it('should throw BadRequestException when tag from similarities not found in tags list (field1)', async () => {
      // Mock data with mismatched tags
      const mockDto: TagsBulkImportDto = {
        tags: ['python', 'react'],
        similarities: [{ field1: 'javascript', field2: 'react', similarity_score: 0.8 }],
      };

      // Mock the repository method to throw the expected error
      mockBulkImport.mockRejectedValue(
        new BadRequestException(`Tag 'javascript' not found in provided tags list.`),
      );

      // Execute & assert
      await expect(service.bulkImport(mockDto)).rejects.toThrow(BadRequestException);
      await expect(service.bulkImport(mockDto)).rejects.toThrow(
        /Tag 'javascript' not found in provided tags list./,
      );
    });

    it('should throw BadRequestException when tag from similarities not found in tags list (field2)', async () => {
      // Mock data with mismatched tags
      const mockDto: TagsBulkImportDto = {
        tags: ['javascript', 'python'],
        similarities: [{ field1: 'javascript', field2: 'react', similarity_score: 0.8 }],
      };

      // Mock the repository method to throw the expected error
      mockBulkImport.mockRejectedValue(
        new BadRequestException("Tag 'react' from similarities not found in provided tags list."),
      );

      // Execute & assert
      await expect(service.bulkImport(mockDto)).rejects.toThrow(BadRequestException);
      await expect(service.bulkImport(mockDto)).rejects.toThrow(
        /Tag 'react' from similarities not found in provided tags list/,
      );
    });
  });
});
