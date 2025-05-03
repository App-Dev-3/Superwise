import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminRepository } from './admin.repository';
import { TagsRepository } from '../tags/tags.repository';
import { BadRequestException } from '@nestjs/common';
import { BulkImportDto } from './dto/bulk-import.dto';
import { Tag } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('AdminService', () => {
  let service: AdminService;
  let adminRepository: AdminRepository;
  let prismaService: PrismaService;

  const mockPrismaTx = mockDeep<PrismaService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminRepository,
          useValue: {
            syncTags: jest.fn(),
            replaceSimilarities: jest.fn(),
          },
        },
        {
          provide: TagsRepository,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    adminRepository = module.get<AdminRepository>(AdminRepository);
    prismaService = module.get<PrismaService>(PrismaService);
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

      // Setup mocks
      const syncTagsSpy = jest.spyOn(adminRepository, 'syncTags').mockResolvedValue(mockTags);
      const replaceSimilaritiesSpy = jest
        .spyOn(adminRepository, 'replaceSimilarities')
        .mockResolvedValue(2);

      // Mock the transaction better
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation(callback => Promise.resolve(callback(mockPrismaTx as any)));

      // Execute
      const result = await service.bulkImport(mockDto);

      // Assertions - Updated to fix the assertion error
      expect(syncTagsSpy).toHaveBeenCalled();
      expect(syncTagsSpy.mock.calls[0][1]).toEqual(mockDto.tags);

      expect(replaceSimilaritiesSpy).toHaveBeenCalled();
      expect(replaceSimilaritiesSpy.mock.calls[0][1]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tagA_id: 'tag1',
            tagB_id: 'tag3',
            similarity: 0.8,
          }),
          expect.objectContaining({
            tagA_id: 'tag2',
            tagB_id: 'tag1',
            similarity: 0.5,
          }),
        ]),
      );

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

      const now = new Date();
      const mockTags: Tag[] = [
        { id: 'tag2', tag_name: 'python', created_at: now, updated_at: now },
        { id: 'tag3', tag_name: 'react', created_at: now, updated_at: now },
      ];

      // Setup mocks
      jest.spyOn(adminRepository, 'syncTags').mockResolvedValue(mockTags);

      // Mock the transaction better
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation(callback => Promise.resolve(callback(mockPrismaTx as any)));

      // Execute & assert
      await expect(service.bulkImport(mockDto)).rejects.toThrow(
        new BadRequestException(
          "Tag 'javascript' from similarities not found in provided tags list.",
        ),
      );
    });

    it('should throw BadRequestException when tag from similarities not found in tags list (field2)', async () => {
      // Mock data with mismatched tags
      const mockDto: BulkImportDto = {
        tags: ['javascript', 'python'],
        similarities: [{ field1: 'javascript', field2: 'react', similarity_score: 0.8 }],
      };

      const now = new Date();
      const mockTags: Tag[] = [
        { id: 'tag1', tag_name: 'javascript', created_at: now, updated_at: now },
        { id: 'tag2', tag_name: 'python', created_at: now, updated_at: now },
      ];

      // Setup mocks
      jest.spyOn(adminRepository, 'syncTags').mockResolvedValue(mockTags);

      // Mock the transaction better
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation(callback => Promise.resolve(callback(mockPrismaTx as any)));

      // Execute & assert
      await expect(service.bulkImport(mockDto)).rejects.toThrow(
        new BadRequestException("Tag 'react' from similarities not found in provided tags list."),
      );
    });
  });
});
