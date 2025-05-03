import { Test, TestingModule } from '@nestjs/testing';
import { TagsRepository } from './tags.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { Tag } from '@prisma/client';

describe('TagsRepository', () => {
  let repository: TagsRepository;

  // Mock the PrismaService to avoid actual database calls
  const mockPrismaService = {
    tag: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  // Use actual UUIDs
  const TAG_UUID_1 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  const TAG_UUID_2 = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  const TAG_UUID_3 = 'b2c3d4e5-f6a7-8901-2345-67890abcdef0';

  const MOCK_TAGS: Tag[] = [
    {
      id: TAG_UUID_1,
      tag_name: 'Machine Learning',
      created_at: new Date('2023-01-15T10:30:00Z'),
      updated_at: new Date('2023-01-15T10:30:00Z'),
    },
    {
      id: TAG_UUID_2,
      tag_name: 'Web Development',
      created_at: new Date('2023-01-16T11:30:00Z'),
      updated_at: new Date('2023-01-16T11:30:00Z'),
    },
    {
      id: TAG_UUID_3,
      tag_name: 'Data Science',
      created_at: new Date('2023-01-17T12:30:00Z'),
      updated_at: new Date('2023-01-17T12:30:00Z'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<TagsRepository>(TagsRepository);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined - verifies successful initialization', () => {
    expect(repository).toBeDefined();
  });

  describe('findAllTags', () => {
    it('should return all tags from the database', async () => {
      // Arrange
      mockPrismaService.tag.findMany.mockResolvedValue(MOCK_TAGS);

      // Act
      const result = await repository.findAllTags();

      // Assert
      expect(result).toEqual(MOCK_TAGS);
      expect(mockPrismaService.tag.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        orderBy: { tag_name: 'asc' },
      });
    });

    it('should return an empty array when no tags exist', async () => {
      // Arrange
      mockPrismaService.tag.findMany.mockResolvedValue([]);

      // Act
      const result = await repository.findAllTags();

      // Assert
      expect(result).toEqual([]);
      expect(mockPrismaService.tag.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findTagById', () => {
    it('should return a tag when found by ID', async () => {
      // Arrange
      const tagId = TAG_UUID_1;
      mockPrismaService.tag.findUnique.mockResolvedValue(MOCK_TAGS[0]);

      // Act
      const result = await repository.findTagById(tagId);

      // Assert
      expect(result).toEqual(MOCK_TAGS[0]);
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: tagId },
      });
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when tag is not found by ID', async () => {
      // Arrange
      const tagId = '111e4567-e89b-12d3-a456-428657556435'; // Non-existent UUID
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findTagById(tagId);

      // Assert
      expect(result).toBeNull();
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: tagId },
      });
    });
  });

  describe('findTagByName', () => {
    it('should return a tag when found by name', async () => {
      // Arrange
      const tagName = 'Machine Learning';
      mockPrismaService.tag.findUnique.mockResolvedValue(MOCK_TAGS[0]);

      // Act
      const result = await repository.findTagByName(tagName);

      // Assert
      expect(result).toEqual(MOCK_TAGS[0]);
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { tag_name: tagName },
      });
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when tag is not found by name', async () => {
      // Arrange
      const tagName = 'NonExistent';
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findTagByName(tagName);

      // Assert
      expect(result).toBeNull();
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { tag_name: tagName },
      });
    });
  });
});
