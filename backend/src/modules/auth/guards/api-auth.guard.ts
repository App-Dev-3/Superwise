import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const apiKey = request.header('API-Key');
    const userId = request.header('User-ID');
    const timestamp = request.header('Request-Timestamp');
    const signature = request.header('Request-Signature');

    if (!apiKey || !userId || !timestamp || !signature) {
      throw new UnauthorizedException('Missing required authentication headers');
    }

    if (!this.authService.validateApiKey(apiKey)) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (!this.authService.isTimestampValid(timestamp)) {
      throw new UnauthorizedException('Request timestamp expired');
    }

    const userExists = await this.authService.validateUser(userId);
    if (!userExists) {
      throw new UnauthorizedException('User not found');
    }

    if (!this.authService.verifyHmacSignature(signature, request.body, timestamp)) {
      throw new UnauthorizedException('Invalid request signature');
    }

    request['userId'] = userId;

    return true;
  }
}
