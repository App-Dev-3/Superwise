import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { TagsRepository } from './tags.repository';
import { Tag } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('TagsService', () => {
  let service: TagsService;

  // Use actual UUIDs
  const TAG_UUID_1 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  const TAG_UUID_2 = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  const TAG_UUID_3 = 'b2c3d4e5-f6a7-8901-2345-67890abcdef0';

  const MOCK_TAGS: Tag[] = [
    {
      id: TAG_UUID_1,
      tag_name: 'Machine Learning',
      created_at: new Date(),
      updated_at: new Date(),
    },
    { id: TAG_UUID_2, tag_name: 'Web Development', created_at: new Date(), updated_at: new Date() },
    { id: TAG_UUID_3, tag_name: 'Data Science', created_at: new Date(), updated_at: new Date() },
  ];

  const mockTagsRepository = {
    findAllTags: jest.fn(),
    findTagById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagsService, { provide: TagsRepository, useValue: mockTagsRepository }],
    }).compile();

    service = module.get<TagsService>(TagsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    // Assert
    expect(service).toBeDefined();
  });

  describe('findAllTags', () => {
    it('should return all tags', async () => {
      // Arrange
      mockTagsRepository.findAllTags.mockResolvedValue(MOCK_TAGS);
      // Act
      const result = await service.findAllTags();
      // Assert
      expect(result).toEqual(MOCK_TAGS);
      expect(mockTagsRepository.findAllTags).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no tags are found', async () => {
      // Arrange
      mockTagsRepository.findAllTags.mockResolvedValue([]);
      // Act
      const result = await service.findAllTags();
      // Assert
      expect(result).toEqual([]);
      expect(mockTagsRepository.findAllTags).toHaveBeenCalled();
    });
  });

  describe('findTagById', () => {
    it('should return a tag when found by ID', async () => {
      // Arrange
      const tagId = TAG_UUID_1;
      mockTagsRepository.findTagById.mockResolvedValue(MOCK_TAGS[0]);
      // Act
      const result = await service.findTagById(tagId);
      // Assert
      expect(result).toEqual(MOCK_TAGS[0]);
      expect(mockTagsRepository.findTagById).toHaveBeenCalledWith(tagId);
    });

    it('should throw NotFoundException when tag is not found by ID', async () => {
      // Arrange
      const tagId = '111e4567-e89b-12d3-a456-426614174111'; // Non-existent UUID
      mockTagsRepository.findTagById.mockResolvedValue(null);
      // Act & Assert
      await expect(service.findTagById(tagId)).rejects.toThrow(
        new NotFoundException(`Tag with ID ${tagId} not found`),
      );
      expect(mockTagsRepository.findTagById).toHaveBeenCalledWith(tagId);
    });
  });
});
