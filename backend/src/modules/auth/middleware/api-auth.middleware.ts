import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiAuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.header('X-API-Key');
    const userId = req.header('X-User-ID');
    const timestamp = req.header('X-Request-Timestamp');
    const signature = req.header('X-Request-Signature');

    if (!apiKey || !userId || !timestamp || !signature) {
      throw new UnauthorizedException(
        'Missing required authentication headers',
      );
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

    if (!this.authService.verifyHmacSignature(signature, req.body, timestamp)) {
      throw new UnauthorizedException('Invalid request signature');
    }

    req['userId'] = userId;

    next();
  }
}
