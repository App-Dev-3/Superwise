import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminRepository } from './admin.repository';
import { TagsRepository } from '../tags/tags.repository';
import { BadRequestException } from '@nestjs/common';
import { TagsBulkImportDto } from './dto/tags-bulk-import.dto';
import { Tag } from '@prisma/client';

describe('AdminService', () => {
  let service: AdminService;
  let adminRepository: AdminRepository;
  // Create mock functions upfront
  const mockTagsBulkImport = jest.fn();
  const mockSupervisorsBulkImport = jest.fn();

  beforeEach(async () => {
    // Reset mocks before each test
    mockTagsBulkImport.mockReset();
    mockSupervisorsBulkImport.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminRepository,
          useValue: {
            tagsBulkImport: mockTagsBulkImport,
            supervisorsBulkImport: mockSupervisorsBulkImport,
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

      // Setup mock for tagsBulkImport with the correct return structure
      mockTagsBulkImport.mockResolvedValue({
        success: true,
        message: '3 new tags added, 0 tags already existed',
        tagsProcessed: 3,
        similaritiesReplaced: 2,
        duplicateTagsSkipped: 0,
        duplicateSimsSkipped: 0,
      });

      // Execute
      const result = await service.tagsBulkImport(mockDto);

      // Verify results
      expect(mockTagsBulkImport).toHaveBeenCalledWith(mockDto.tags, mockDto.similarities);
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

      // Setup mock for tagsBulkImport
      mockTagsBulkImport.mockResolvedValue({
        success: true,
        message: '3 new tags added, 0 tags already existed',
        tagsProcessed: 3,
        similaritiesReplaced: 2,
        duplicateTagsSkipped: 2, // 5 tags - 3 unique (case-insensitive)
        duplicateSimsSkipped: 2, // 4 similarities - 2 unique (case-insensitive)
      });

      // Execute
      const result = await service.tagsBulkImport(mockDto);

      // Verify results
      expect(mockTagsBulkImport).toHaveBeenCalledWith(mockDto.tags, mockDto.similarities);
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
      mockTagsBulkImport.mockRejectedValue(
        new BadRequestException(`Tag 'javascript' not found in provided tags list.`),
      );

      // Execute & assert
      await expect(service.tagsBulkImport(mockDto)).rejects.toThrow(BadRequestException);
      await expect(service.tagsBulkImport(mockDto)).rejects.toThrow(
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
      mockTagsBulkImport.mockRejectedValue(
        new BadRequestException("Tag 'react' from similarities not found in provided tags list."),
      );

      // Execute & assert
      await expect(service.tagsBulkImport(mockDto)).rejects.toThrow(BadRequestException);
      await expect(service.tagsBulkImport(mockDto)).rejects.toThrow(
        /Tag 'react' from similarities not found in provided tags list/,
      );
    });
  });

  describe('supervisorsBulkImport', () => {
    it('should successfully import supervisors', async () => {
      // Mock data
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

      // Setup mock
      mockSupervisorsBulkImport.mockResolvedValue({
        success: true,
        message: '1 new supervisors successfully imported',
        supervisorsImported: 1,
        supervisorsUpdated: 0,
      });

      // Execute
      const result = await service.supervisorsBulkImport(mockDto);

      // Verify results
      expect(mockSupervisorsBulkImport).toHaveBeenCalledWith(mockDto.supervisors);
      expect(result).toEqual({
        success: true,
        message: '1 new supervisors successfully imported',
        supervisorsImported: 1,
        supervisorsUpdated: 0,
      });
    });

    it('should handle updates to existing supervisors', async () => {
      // Mock data for updating existing supervisors
      const mockDto = {
        supervisors: [
          {
            email: 'existing@example.com',
            bio: 'Updated bio',
            total_spots: 10,
          },
        ],
      };

      // Setup mock
      mockSupervisorsBulkImport.mockResolvedValue({
        success: true,
        message: '0 new supervisors successfully imported and 1 existing supervisors updated',
        supervisorsImported: 0,
        supervisorsUpdated: 1,
      });

      // Execute
      const result = await service.supervisorsBulkImport(mockDto);

      // Verify results
      expect(mockSupervisorsBulkImport).toHaveBeenCalledWith(mockDto.supervisors);
      expect(result).toEqual({
        success: true,
        message: '0 new supervisors successfully imported and 1 existing supervisors updated',
        supervisorsImported: 0,
        supervisorsUpdated: 1,
      });
    });

    it('should throw BadRequestException on missing email', async () => {
      // Mock data with missing required fields for a new supervisor
      const mockDto = {
        supervisors: [
          {
            email: '', // Empty email
            first_name: 'John',
            last_name: 'Doe',
          },
        ],
      };

      // Mock the repository method to throw the expected error
      mockSupervisorsBulkImport.mockRejectedValue(
        new BadRequestException('Email is required for supervisor: Doe'),
      );

      // Execute & assert
      await expect(service.supervisorsBulkImport(mockDto)).rejects.toThrow(BadRequestException);
      await expect(service.supervisorsBulkImport(mockDto)).rejects.toThrow(
        /Email is required for supervisor/,
      );
    });
  });
});
