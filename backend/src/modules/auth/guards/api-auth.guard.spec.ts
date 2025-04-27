import { Test, TestingModule } from '@nestjs/testing';
import { ApiAuthGuard } from './api-auth.guard';
import { AuthService } from '../auth.service';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';

describe('ApiAuthGuard', () => {
  let guard: ApiAuthGuard;
  let authService: AuthService;

  beforeEach(async () => {
    const authServiceMock = {
      validateApiKey: jest.fn(),
      isTimestampValid: jest.fn(),
      validateUser: jest.fn(),
      verifyHmacSignature: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiAuthGuard,
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compile();

    guard = module.get<ApiAuthGuard>(ApiAuthGuard);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        header: jest.fn(),
        body: { test: 'data' },
      };
      
      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;
    });

    it('should return true when all validations pass', async () => {
      mockRequest.header.mockImplementation((name: string) => {
        if (name === 'API-Key') return 'valid-api-key';
        if (name === 'User-ID') return 'valid-user-id';
        if (name === 'Request-Timestamp') return '2025-04-26T12:00:00.000Z';
        if (name === 'Request-Signature') return 'valid-signature';
        return null;
      });

      jest.spyOn(authService, 'validateApiKey').mockReturnValue(true);
      jest.spyOn(authService, 'isTimestampValid').mockReturnValue(true);
      jest.spyOn(authService, 'validateUser').mockResolvedValue(true);
      jest.spyOn(authService, 'verifyHmacSignature').mockReturnValue(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest['userId']).toBe('valid-user-id');
    });

    it('should throw UnauthorizedException if headers are missing', async () => {
      mockRequest.header.mockReturnValue(null);

      await expect(
        guard.canActivate(mockContext)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if API key is invalid', async () => {
      mockRequest.header.mockImplementation((name: string) => {
        if (name === 'API-Key') return 'invalid-key';
        if (name === 'User-ID') return 'valid-user-id';
        if (name === 'Request-Timestamp') return '2025-04-26T12:00:00.000Z';
        if (name === 'Request-Signature') return 'valid-signature';
        return null;
      });

      jest.spyOn(authService, 'validateApiKey').mockReturnValue(false);

      await expect(
        guard.canActivate(mockContext)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if timestamp is invalid', async () => {
      mockRequest.header.mockImplementation((name: string) => {
        if (name === 'API-Key') return 'valid-api-key';
        if (name === 'User-ID') return 'valid-user-id';
        if (name === 'Request-Timestamp') return 'old-timestamp';
        if (name === 'Request-Signature') return 'valid-signature';
        return null;
      });

      jest.spyOn(authService, 'validateApiKey').mockReturnValue(true);
      jest.spyOn(authService, 'isTimestampValid').mockReturnValue(false);

      await expect(
        guard.canActivate(mockContext)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockRequest.header.mockImplementation((name: string) => {
        if (name === 'API-Key') return 'valid-api-key';
        if (name === 'User-ID') return 'invalid-user-id';
        if (name === 'Request-Timestamp') return '2025-04-26T12:00:00.000Z';
        if (name === 'Request-Signature') return 'valid-signature';
        return null;
      });

      jest.spyOn(authService, 'validateApiKey').mockReturnValue(true);
      jest.spyOn(authService, 'isTimestampValid').mockReturnValue(true);
      jest.spyOn(authService, 'validateUser').mockResolvedValue(false);

      await expect(
        guard.canActivate(mockContext)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if signature is invalid', async () => {
      mockRequest.header.mockImplementation((name: string) => {
        if (name === 'API-Key') return 'valid-api-key';
        if (name === 'User-ID') return 'valid-user-id';
        if (name === 'Request-Timestamp') return '2025-04-26T12:00:00.000Z';
        if (name === 'Request-Signature') return 'invalid-signature';
        return null;
      });

      jest.spyOn(authService, 'validateApiKey').mockReturnValue(true);
      jest.spyOn(authService, 'isTimestampValid').mockReturnValue(true);
      jest.spyOn(authService, 'validateUser').mockResolvedValue(true);
      jest.spyOn(authService, 'verifyHmacSignature').mockReturnValue(false);

      await expect(
        guard.canActivate(mockContext)
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});