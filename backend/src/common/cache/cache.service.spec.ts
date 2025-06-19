import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { WinstonLoggerService } from '../logging/winston-logger.service';
import { User, Role } from '@prisma/client';

describe('CacheService', () => {
  let service: CacheService;
  let mockCacheManager: any;
  let mockLogger: {
    debug: jest.Mock;
    error: jest.Mock;
    log: jest.Mock;
    warn: jest.Mock;
    verbose: jest.Mock;
  };

  const mockUser: User = {
    id: 'test-user-id',
    clerk_id: 'test-clerk-id',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: Role.STUDENT,
    profile_image: null,
    is_registered: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    // Mock cache manager
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    // Mock logger
    mockLogger = {
      debug: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: WinstonLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  describe('Core Service', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('User Cache Operations', () => {
    describe('getUser()', () => {
      it('should return cached user when cache hit', async () => {
        mockCacheManager.get.mockResolvedValue(mockUser);

        const result = await service.getUser('test-clerk-id');

        expect(result).toEqual(mockUser);
        expect(mockCacheManager.get).toHaveBeenCalledWith('user:test-clerk-id');
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'Cache hit for user: test-clerk-id',
          'CacheService',
        );
      });

      it('should return null when cache miss', async () => {
        mockCacheManager.get.mockResolvedValue(undefined);

        const result = await service.getUser('test-clerk-id');

        expect(result).toBeNull();
        expect(mockCacheManager.get).toHaveBeenCalledWith('user:test-clerk-id');
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'Cache miss for user: test-clerk-id',
          'CacheService',
        );
      });
    });

    describe('setUser()', () => {
      it('should cache user with default TTL', async () => {
        await service.setUser('test-clerk-id', mockUser);

        expect(mockCacheManager.set).toHaveBeenCalledWith(
          'user:test-clerk-id',
          mockUser,
          1200000, // 20 minutes
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'Cached user data for clerk_id: test-clerk-id',
          'CacheService',
        );
      });

      it('should cache user with custom TTL', async () => {
        const customTtl = 600000; // 10 minutes
        await service.setUser('test-clerk-id', mockUser, customTtl);

        expect(mockCacheManager.set).toHaveBeenCalledWith(
          'user:test-clerk-id',
          mockUser,
          customTtl,
        );
      });
    });

    describe('invalidateUser()', () => {
      it('should invalidate user cache', async () => {
        await service.invalidateUser('test-clerk-id');

        expect(mockCacheManager.del).toHaveBeenCalledWith('user:test-clerk-id');
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'Invalidated user cache for: test-clerk-id',
          'CacheService',
        );
      });
    });
  });

  describe('Tag Similarity Cache Operations', () => {
    describe('getTagSimilarity()', () => {
      it('should return cached similarity when available', async () => {
        const similarity = 0.85;
        mockCacheManager.get.mockResolvedValue(similarity);

        const result = await service.getTagSimilarity('tag1', 'tag2');

        expect(result).toBe(similarity);
        expect(mockCacheManager.get).toHaveBeenCalledWith('tag_sim:tag1:tag2');
      });

      it('should return null when similarity not cached', async () => {
        mockCacheManager.get.mockResolvedValue(undefined);

        const result = await service.getTagSimilarity('tag1', 'tag2');

        expect(result).toBeNull();
      });
    });

    describe('setTagSimilarity()', () => {
      it('should cache tag similarity with default TTL', async () => {
        const similarity = 0.75;
        await service.setTagSimilarity('tag1', 'tag2', similarity);

        expect(mockCacheManager.set).toHaveBeenCalledWith(
          'tag_sim:tag1:tag2',
          similarity,
          86400000, // 24 hours
        );
      });

      it('should cache bidirectional similarity for different tags', async () => {
        const similarity = 0.65;
        await service.setTagSimilarity('tag1', 'tag2', similarity);

        expect(mockCacheManager.set).toHaveBeenCalledTimes(2);
        expect(mockCacheManager.set).toHaveBeenCalledWith(
          'tag_sim:tag1:tag2',
          similarity,
          86400000,
        );
        expect(mockCacheManager.set).toHaveBeenCalledWith(
          'tag_sim:tag1:tag2', // Both sorted to tag1:tag2
          similarity,
          86400000,
        );
      });

      it('should cache only once for identical tags', async () => {
        const similarity = 1.0;
        await service.setTagSimilarity('tag1', 'tag1', similarity);

        expect(mockCacheManager.set).toHaveBeenCalledTimes(1);
        expect(mockCacheManager.set).toHaveBeenCalledWith(
          'tag_sim:tag1:tag1',
          similarity,
          86400000,
        );
      });
    });

    describe('invalidateTagSimilarities()', () => {
      it('should log tag similarities invalidation', async () => {
        await service.invalidateTagSimilarities('tag1');

        expect(mockLogger.debug).toHaveBeenCalledWith(
          'Tag similarity invalidation requested for tag: tag1',
          'CacheService',
        );
      });
    });
  });

  describe('Health Check', () => {
    it('should return true when cache is healthy', async () => {
      let storedValue: string;

      mockCacheManager.set.mockImplementation((key, value) => {
        storedValue = value;
        return Promise.resolve();
      });

      mockCacheManager.get.mockImplementation(() => {
        return Promise.resolve(storedValue);
      });

      mockCacheManager.del.mockResolvedValue(undefined);

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(mockCacheManager.set).toHaveBeenCalledWith('health_check', expect.any(String), 1000);
      expect(mockCacheManager.get).toHaveBeenCalledWith('health_check');
      expect(mockCacheManager.del).toHaveBeenCalledWith('health_check');
    });

    it('should return false when cache operation fails', async () => {
      mockCacheManager.set.mockRejectedValue(new Error('Cache error'));

      const result = await service.healthCheck();

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Cache health check failed'),
        'CacheService',
      );
    });
  });

  describe('Key Generation Consistency', () => {
    it('should generate consistent keys for tag similarities regardless of order', async () => {
      const similarity = 0.8;

      await service.setTagSimilarity('tagA', 'tagB', similarity);
      await service.setTagSimilarity('tagB', 'tagA', similarity);

      // Both calls should result in the same sorted key being used
      expect(mockCacheManager.set).toHaveBeenCalledWith('tag_sim:tagA:tagB', similarity, 86400000);
      expect(mockCacheManager.set).toHaveBeenCalledWith('tag_sim:tagA:tagB', similarity, 86400000);
    });
  });
});
