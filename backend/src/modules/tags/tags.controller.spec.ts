import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { NotFoundException } from '@nestjs/common';
import { Tag } from '@prisma/client';

describe('TagsController', () => {
  let controller: TagsController;

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

  const mockTagsService = {
    findAllTags: jest.fn(),
    findTagById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [{ provide: TagsService, useValue: mockTagsService }],
    }).compile();
    controller = module.get<TagsController>(TagsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    // Assert
    expect(controller).toBeDefined();
  });

  describe('findAllTags', () => {
    it('should return all tags', async () => {
      // Arrange
      mockTagsService.findAllTags.mockResolvedValue(MOCK_TAGS);
      // Act
      const result = await controller.findAllTags();
      // Assert
      expect(result).toEqual(MOCK_TAGS);
      expect(mockTagsService.findAllTags).toHaveBeenCalledTimes(1);
    });
  });

  describe('findTagById', () => {
    it('should return a tag when found by ID', async () => {
      // Arrange
      const tagId = TAG_UUID_1;
      mockTagsService.findTagById.mockResolvedValue(MOCK_TAGS[0]);
      // Act
      const result = await controller.findTagById(tagId);
      // Assert
      expect(result).toEqual(MOCK_TAGS[0]);
      expect(mockTagsService.findTagById).toHaveBeenCalledWith(tagId);
    });

    it('should re-throw NotFoundException when service throws it', async () => {
      // Arrange
      const tagId = '111e4567-e89b-12d3-a456-426614174111'; // Non-existent UUID
      const expectedError = new NotFoundException(`Tag with ID ${tagId} not found`);
      mockTagsService.findTagById.mockRejectedValue(expectedError);
      // Act & Assert
      await expect(controller.findTagById(tagId)).rejects.toThrow(expectedError);
      expect(mockTagsService.findTagById).toHaveBeenCalledWith(tagId);
    });
  });
});
