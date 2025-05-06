import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminRepository } from './admin.repository';
import { TagsRepository } from '../tags/tags.repository';
import { BadRequestException } from '@nestjs/common';
import { BulkImportDto } from './dto/bulk-import.dto';
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
      const mockDto: BulkImportDto = {
        tags: ['javascript', 'python', 'react'],
        similarities: [
          { field1: 'javascript', field2: 'react', similarity_score: 0.8 },
          { field1: 'python', field2: 'javascript', similarity_score: 0.5 },
        ],
      };

      const now = new Date();
      // Create mock tags with all required properties
      const mockTags: Tag[] = [
        { id: 'tag1', tag_name: 'javascript', created_at: now, updated_at: now },
        { id: 'tag2', tag_name: 'python', created_at: now, updated_at: now },
        { id: 'tag3', tag_name: 'react', created_at: now, updated_at: now },
      ];

      // Setup mock for bulkImport
      mockBulkImport.mockResolvedValue({
        tags: mockTags,
        replacedCount: 2,
      });

      // Execute
      const result = await service.bulkImport(mockDto);

      // Verify results
      expect(mockBulkImport).toHaveBeenCalledWith(mockDto.tags, mockDto.similarities);
      expect(result).toEqual({
        success: true,
        message: 'Tags and similarities imported successfully',
        tagsProcessed: 3,
        similaritiesReplaced: 2,
      });
    });

    it('should throw BadRequestException when tag from similarities not found in tags list (field1)', async () => {
      // Mock data with mismatched tags
      const mockDto: BulkImportDto = {
        tags: ['python', 'react'],
        similarities: [{ field1: 'javascript', field2: 'react', similarity_score: 0.8 }],
      };

      // Mock the repository method to throw the expected error
      mockBulkImport.mockRejectedValue(
        new BadRequestException(
          "Tag 'javascript' from similarities not found in provided tags list.",
        ),
      );

      // Execute & assert
      await expect(service.bulkImport(mockDto)).rejects.toThrow(BadRequestException);
      await expect(service.bulkImport(mockDto)).rejects.toThrow(
        /Tag 'javascript' from similarities not found in provided tags list/,
      );
    });

    it('should throw BadRequestException when tag from similarities not found in tags list (field2)', async () => {
      // Mock data with mismatched tags
      const mockDto: BulkImportDto = {
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
