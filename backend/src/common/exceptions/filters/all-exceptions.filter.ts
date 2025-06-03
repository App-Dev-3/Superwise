import { ArgumentsHost, Catch, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { WinstonLoggerService } from '../../logging/winston-logger.service';

// Define interfaces for type-safe error handling
interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
  getStatus?: () => number;
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(@Inject(WinstonLoggerService) private readonly logger: WinstonLoggerService) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Determine if it's an HTTP request
    if (request && response) {
      // Determine HTTP status code with proper type checking
      const status = this.getHttpStatus(exception);

      // Log the error (detailed in development, minimal in production)
      if (process.env.NODE_ENV !== 'production') {
        this.logger.error(
          `Unhandled exception: ${this.getErrorMessage(exception)}`,
          this.getErrorStack(exception),
          'AllExceptionsFilter',
        );
      } else {
        // More minimal logging in production
        this.logger.error('Internal server error', undefined, 'AllExceptionsFilter');
      }

      // Send a generic error response to avoid leaking implementation details
      response.status(status).json({
        statusCode: status,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      // For non-HTTP requests (like WebSockets, etc.)
      this.logger.error(
        `Non-HTTP exception: ${this.getErrorMessage(exception)}`,
        this.getErrorStack(exception),
        'AllExceptionsFilter',
      );

      // Let the base filter handle it for non-HTTP contexts
      super.catch(exception, host);
    }
  }

  /**
   * Safely determines the HTTP status code from various exception types
   */
  private getHttpStatus(exception: unknown): number {
    // Handle HttpException from NestJS
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    // Handle standard Error objects with status/statusCode properties
    if (exception instanceof Error) {
      const err = exception as ErrorWithStatus;

      // Check for common status code patterns
      if (typeof err.getStatus === 'function') {
        return err.getStatus();
      }

      if (typeof err.status === 'number') {
        return err.status;
      }

      if (typeof err.statusCode === 'number') {
        return err.statusCode;
      }
    }

    // Default to 500 Internal Server Error
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Safely extracts error message from different error types
   */

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.message;
    }

    if (exception === null) {
      return 'null';
    }

    if (exception === undefined) {
      return 'undefined';
    }

    if (typeof exception === 'string') {
      return exception;
    }

    if (typeof exception === 'number' || typeof exception === 'boolean') {
      return String(exception);
    }

    if (typeof exception === 'object') {
      try {
        return JSON.stringify(exception);
      } catch {
        return '[Unserializable Object]';
      }
    }

    // Last resort fallback
    try {
      return String(exception);
    } catch {
      return '[Unknown Error]';
    }
  }

  /**
   * Safely extracts stack trace from error
   */
  private getErrorStack(exception: unknown): string | undefined {
    if (exception instanceof Error) {
      return exception.stack;
    }

    return undefined;
  }
}
