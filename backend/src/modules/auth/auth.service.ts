import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  validateApiKey(providedApiKey: string): boolean {
    const expectedApiKey = this.configService.get<string>('API_KEY');
    if (!expectedApiKey) {
      throw new Error('API_KEY is not configured in environment variables');
    }
    return providedApiKey === expectedApiKey;
  }

  verifyHmacSignature(signature: string, payload: any, timestamp: string): boolean {
    const apiKey = this.configService.get<string>('API_KEY');
    if (!apiKey) {
      throw new Error('API_KEY is not configured in environment variables');
    }

    const data = JSON.stringify(payload) + timestamp;

    const expectedSignature = crypto.createHmac('sha256', apiKey).update(data).digest('hex');

    try {
      if (Buffer.from(signature).length === Buffer.from(expectedSignature).length) {
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
      }
      return false;
    } catch {
      console.log('Error in timingSafeEqual');
      return false;
    }
  }
  isTimestampValid(timestamp: string, windowMinutes: number = 2): boolean {
    const requestTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    return Math.abs(currentTime - requestTime) < windowMs;
  }

  async validateUser(userId: string): Promise<boolean> {
    try {
      const user = await this.usersService.findUserById(userId);

      if (!user) {
        return false;
      }

      return !('is_deleted' in user && user.is_deleted === true);
    } catch {
      console.log('Error validating user');
      return false;
    }
  }
}
