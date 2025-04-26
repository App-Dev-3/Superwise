
import { Test, TestingModule } from '@nestjs/testing';
import { ApiAuthMiddleware } from './api-auth.middleware';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('ApiAuthMiddleware', () => {
  let middleware: ApiAuthMiddleware;
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
        ApiAuthMiddleware,
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compile();

    middleware = module.get<ApiAuthMiddleware>(ApiAuthMiddleware);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    let mockRequest: any;
    let mockResponse: any;
    let nextFunction: jest.Mock;

    beforeEach(() => {
      mockRequest = {
        header: jest.fn(),
        body: { test: 'data' },
      };
      mockResponse = {};
      nextFunction = jest.fn();
    });

    it('should call next() when all validations pass', async () => {
  
      mockRequest.header.mockImplementation((name: string) => {
        if (name === 'X-API-Key') return 'valid-api-key';
        if (name === 'X-User-ID') return 'valid-user-id';
        if (name === 'X-Request-Timestamp') return '2025-04-26T12:00:00.000Z';
        if (name === 'X-Request-Signature') return 'valid-signature';
        return null;
      });

 
      jest.spyOn(authService, 'validateApiKey').mockReturnValue(true);
      jest.spyOn(authService, 'isTimestampValid').mockReturnValue(true);
      jest.spyOn(authService, 'validateUser').mockResolvedValue(true);
      jest.spyOn(authService, 'verifyHmacSignature').mockReturnValue(true);

      await middleware.use(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest['userId']).toBe('valid-user-id');
    });

    it('should throw UnauthorizedException if headers are missing', async () => {
      mockRequest.header.mockReturnValue(null);

      await expect(middleware.use(mockRequest, mockResponse, nextFunction))
        .rejects.toThrow(UnauthorizedException);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if API key is invalid', async () => {
      mockRequest.header.mockImplementation((name: string) => {
        if (name === 'X-API-Key') return 'invalid-key';
        if (name === 'X-User-ID') return 'valid-user-id';
        if (name === 'X-Request-Timestamp') return '2025-04-26T12:00:00.000Z';
        if (name === 'X-Request-Signature') return 'valid-signature';
        return null;
      });

      jest.spyOn(authService, 'validateApiKey').mockReturnValue(false);

      await expect(middleware.use(mockRequest, mockResponse, nextFunction))
        .rejects.toThrow(UnauthorizedException);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if timestamp is invalid', async () => {
      mockRequest.header.mockImplementation((name: string) => {
        if (name === 'X-API-Key') return 'valid-api-key';
        if (name === 'X-User-ID') return 'valid-user-id';
        if (name === 'X-Request-Timestamp') return 'old-timestamp';
        if (name === 'X-Request-Signature') return 'valid-signature';
        return null;
      });

      jest.spyOn(authService, 'validateApiKey').mockReturnValue(true);
      jest.spyOn(authService, 'isTimestampValid').mockReturnValue(false);

      await expect(middleware.use(mockRequest, mockResponse, nextFunction))
        .rejects.toThrow(UnauthorizedException);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockRequest.header.mockImplementation((name: string) => {
        if (name === 'X-API-Key') return 'valid-api-key';
        if (name === 'X-User-ID') return 'invalid-user-id';
        if (name === 'X-Request-Timestamp') return '2025-04-26T12:00:00.000Z';
        if (name === 'X-Request-Signature') return 'valid-signature';
        return null;
      });

      jest.spyOn(authService, 'validateApiKey').mockReturnValue(true);
      jest.spyOn(authService, 'isTimestampValid').mockReturnValue(true);
      jest.spyOn(authService, 'validateUser').mockResolvedValue(false);

      await expect(middleware.use(mockRequest, mockResponse, nextFunction))
        .rejects.toThrow(UnauthorizedException);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if signature is invalid', async () => {
      mockRequest.header.mockImplementation((name: string) => {
        if (name === 'X-API-Key') return 'valid-api-key';
        if (name === 'X-User-ID') return 'valid-user-id';
        if (name === 'X-Request-Timestamp') return '2025-04-26T12:00:00.000Z';
        if (name === 'X-Request-Signature') return 'invalid-signature';
        return null;
      });

      jest.spyOn(authService, 'validateApiKey').mockReturnValue(true);
      jest.spyOn(authService, 'isTimestampValid').mockReturnValue(true);
      jest.spyOn(authService, 'validateUser').mockResolvedValue(true);
      jest.spyOn(authService, 'verifyHmacSignature').mockReturnValue(false);

      await expect(middleware.use(mockRequest, mockResponse, nextFunction))
        .rejects.toThrow(UnauthorizedException);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});