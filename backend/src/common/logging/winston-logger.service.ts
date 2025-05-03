import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { safeStringify } from '../utils/string-utils';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const isProd = process.env.NODE_ENV === 'production';

    // Define formats
    const commonFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
    );

    const devFormat = winston.format.combine(
      commonFormat,
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, stack, context }) => {
        // The built-in Winston format already has these values converted to strings
        return `${timestamp} [${level}] ${context ? `[${context}]` : ''}: ${message}${stack ? `\n${stack}` : ''}`;
      }),
    );

    const prodFormat = winston.format.combine(commonFormat, winston.format.json());

    // Set up transports based on environment
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: isProd ? prodFormat : devFormat,
      }),
    ];

    // Add file transport in production
    if (isProd) {
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      );
    }

    // Create logger instance
    this.logger = winston.createLogger({
      level: isProd ? 'info' : 'debug',
      transports,
      exitOnError: false,
    });
  }

  log(message: any, context?: string): void {
    this.logger.info(safeStringify(message), { context });
  }

  error(message: any, trace?: string, context?: string): void {
    this.logger.error(safeStringify(message), {
      context,
      stack: trace,
    });
  }

  warn(message: any, context?: string): void {
    this.logger.warn(safeStringify(message), { context });
  }

  debug(message: any, context?: string): void {
    this.logger.debug(safeStringify(message), { context });
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose(safeStringify(message), { context });
  }
}
