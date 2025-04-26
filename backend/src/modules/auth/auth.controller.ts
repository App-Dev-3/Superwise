//TEMPRORARY !! I will delete this file later (maybe)
// This is a temporary file to test the authentication mechanism only
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Request } from 'express';
import { ApiAuthMiddleware } from './middleware/api-auth.middleware';

@ApiTags('Authentication') 
@Controller('auth')
export class AuthController {
  @Post('test') 
  @ApiOperation({ summary: 'Test authentication mechanism' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiHeader({ name: 'X-API-Key', description: 'API Key' })
  @ApiHeader({ name: 'X-User-ID', description: 'User ID' })
  @ApiHeader({
    name: 'X-Request-Timestamp',
    description: 'Request timestamp (ISO format)',
  })
  @ApiHeader({ name: 'X-Request-Signature', description: 'HMAC signature' })
  testAuth(@Req() req: Request) {
    return {
      success: true,
      message: 'Authentication successful',
      userId: req['userId'],
    };
  }
}
