import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseListenerService } from './database-listener.service';
import { CacheService } from './cache.service';
import { WinstonLoggerService } from '../logging/winston-logger.service';
import { DatabaseConfigService } from '../../config/database-config.service';

describe('DatabaseListenerService', () => {
  let service: DatabaseListenerService;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockLogger: jest.Mocked<WinstonLoggerService>;
  let mockDatabaseConfig: jest.Mocked<DatabaseConfigService>;

  beforeEach(async () => {
    // Mock cache service
    mockCacheService = {
      invalidateUser: jest.fn(),
      invalidateTagSimilarities: jest.fn(),
      healthCheck: jest.fn(),
      setUser: jest.fn(),
      getUser: jest.fn(),
      setTagSimilarity: jest.fn(),
      getTagSimilarity: jest.fn(),
    } as any;

    // Mock logger
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    // Mock database config
    mockDatabaseConfig = {
      connectionDetails: {
        host: 'localhost',
        port: 5432,
        database: 'test',
        username: 'test',
        password: 'test',
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseListenerService,
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: WinstonLoggerService,
          useValue: mockLogger,
        },
        {
          provide: DatabaseConfigService,
          useValue: mockDatabaseConfig,
        },
      ],
    }).compile();

    service = module.get<DatabaseListenerService>(DatabaseListenerService);
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should start listening on module init', async () => {
      // Mock successful initialization
      jest.spyOn(service as any, 'initializeConnection').mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Database listener service initialized successfully',
        'DatabaseListenerService',
      );
    });

    it('should handle errors during startup gracefully', async () => {
      // Mock initialization failure
      const error = new Error('Connection failed');
      jest.spyOn(service as any, 'initializeConnection').mockRejectedValue(error);
      jest.spyOn(service as any, 'scheduleReconnect').mockImplementation();

      await service.onModuleInit();

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Failed to initialize database listener: ${error}`,
        'DatabaseListenerService',
      );
    });
  });

  describe('Cleanup', () => {
    it('should stop listening on module destroy', async () => {
      // Mock client connection
      const mockClient = {
        end: jest.fn().mockResolvedValue(undefined),
      };
      (service as any).pgClient = mockClient;

      await service.onModuleDestroy();

      expect(mockClient.end).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Database listener connection closed',
        'DatabaseListenerService',
      );
    });

    it('should handle errors during cleanup gracefully', async () => {
      // Mock client with error on end
      const error = new Error('Cleanup failed');
      const mockClient = {
        end: jest.fn().mockRejectedValue(error),
      };
      (service as any).pgClient = mockClient;

      await service.onModuleDestroy();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        `Error during database listener cleanup: ${error}`,
        'DatabaseListenerService',
      );
    });
  });

  describe('Manual Invalidation Methods', () => {
    describe('handleUserChange()', () => {
      it('should invalidate user cache and log the operation', async () => {
        const clerkId = 'test-clerk-id';
        mockCacheService.invalidateUser.mockResolvedValue();

        await service.handleUserChange(clerkId);

        expect(mockCacheService.invalidateUser).toHaveBeenCalledWith(clerkId);
        expect(mockLogger.debug).toHaveBeenCalledWith(
          `Manual user cache invalidation for clerk_id: ${clerkId}`,
          'DatabaseListenerService',
        );
      });
    });

    describe('handleTagChange()', () => {
      it('should invalidate tag similarities cache and log the operation', async () => {
        mockCacheService.invalidateTagSimilarities.mockResolvedValue();

        await service.handleTagChange();

        expect(mockCacheService.invalidateTagSimilarities).toHaveBeenCalledWith('all');
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'Manual tag similarities cache invalidation',
          'DatabaseListenerService',
        );
      });
    });
  });

  describe('Health Check', () => {
    it('should return true when database connection is healthy', async () => {
      // Mock healthy connection
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
      };
      (service as any).pgClient = mockClient;

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should return false when database connection is unhealthy', async () => {
      // Mock unhealthy connection
      const mockClient = {
        query: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (service as any).pgClient = mockClient;

      const result = await service.healthCheck();

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Database listener health check failed'),
        'DatabaseListenerService',
      );
    });

    it('should return false when no connection exists', async () => {
      // No client connection
      (service as any).pgClient = null;

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('Connection Status', () => {
    it('should return correct connection status', () => {
      // Mock connected client
      (service as any).pgClient = { readyForQuery: true };

      const status = service.getConnectionStatus();

      expect(status).toBe('connected');
    });

    it('should show disconnected when no client exists', () => {
      // No client
      (service as any).pgClient = null;

      const status = service.getConnectionStatus();

      expect(status).toBe('disconnected');
    });
  });
});
