
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;
  let usersService: UsersService;

  beforeEach(async () => {

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'API_KEY') return 'test-api-key';
        if (key === 'API_SECRET') return 'test-api-secret';
        return null;
      }),
    };

    const mockUsersService = {
      findUserById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateApiKey', () => {
    it('should return true for valid API key', () => {
      expect(service.validateApiKey('test-api-key')).toBe(true);
    });

    it('should return false for invalid API key', () => {
      expect(service.validateApiKey('wrong-key')).toBe(false);
    });

    it('should throw error if API_KEY is not configured', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      expect(() => service.validateApiKey('any-key')).toThrow();
    });
  });

  describe('isTimestampValid', () => {
    it('should return true for current timestamp', () => {
      const now = new Date().toISOString();
      expect(service.isTimestampValid(now)).toBe(true);
    });

    it('should return true for timestamp within window', () => {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      expect(service.isTimestampValid(twoMinutesAgo, 5)).toBe(true);
    });

    it('should return false for old timestamp', () => {
      const oldDate = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      expect(service.isTimestampValid(oldDate, 5)).toBe(false);
    });

    it('should return false for future timestamp beyond window', () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      expect(service.isTimestampValid(futureDate, 5)).toBe(false);
    });
  });

  describe('validateUser', () => {
    it('should return true for existing active user', async () => {
      jest.spyOn(usersService, 'findUserById').mockResolvedValue({
        id: 'test-id',
        is_deleted: false,
      } as any);

      expect(await service.validateUser('test-id')).toBe(true);
    });

    it('should return false for deleted user', async () => {
      jest.spyOn(usersService, 'findUserById').mockResolvedValue({
        id: 'test-id',
        is_deleted: true,
      } as any);

      expect(await service.validateUser('test-id')).toBe(false);
    });

    it('should return false if user not found', async () => {
      jest.spyOn(usersService, 'findUserById').mockRejectedValue(new Error('Not found'));
      expect(await service.validateUser('non-existent')).toBe(false);
    });

    it('should return false if usersService throws error', async () => {
      jest.spyOn(usersService, 'findUserById').mockRejectedValue(new Error('Database error'));
      expect(await service.validateUser('any-id')).toBe(false);
    });
  });
  
  describe('verifyHmacSignature', () => {
    it('should verify valid signature', () => {
      const payload = { test: 'data' };
      const timestamp = new Date().toISOString();
      const data = JSON.stringify(payload) + timestamp;
      
      const signature = crypto
        .createHmac('sha256', 'test-api-secret')
        .update(data)
        .digest('hex');
      
      expect(service.verifyHmacSignature(signature, payload, timestamp)).toBe(true);
    });
    
    it('should reject invalid signature', () => {
        const payload = { test: 'data' };
        const timestamp = new Date().toISOString();
        
        
        const invalidSignature = 'a'.repeat(64); 
        
        expect(service.verifyHmacSignature(invalidSignature, payload, timestamp)).toBe(false);
      });

    it('should throw error if API_SECRET is not configured', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      expect(() => service.verifyHmacSignature('any-signature', {}, 'timestamp')).toThrow();
    });

    it('should reject if payload is tampered with', () => {
      const originalPayload = { test: 'original' };
      const timestamp = new Date().toISOString();
      const originalData = JSON.stringify(originalPayload) + timestamp;
      
      const signature = crypto
        .createHmac('sha256', 'test-api-secret')
        .update(originalData)
        .digest('hex');
      
      const tamperedPayload = { test: 'tampered' };
      expect(service.verifyHmacSignature(signature, tamperedPayload, timestamp)).toBe(false);
    });
  });
});