import { ArgumentsHost, Catch, HttpStatus, Inject } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { WinstonLoggerService } from '../../logging/winston-logger.service';
import { ErrorResponse } from '../interfaces/error-response.interface';
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  constructor(@Inject(WinstonLoggerService) private readonly logger: WinstonLoggerService) {
    super();
  }

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    // Log differently based on environment
    if (process.env.NODE_ENV !== 'production') {
      // Detailed logging for development
      this.logger.error(
        `Prisma error: ${exception.message}`,
        JSON.stringify({
          code: exception.code,
          meta: exception.meta,
          path: request.url,
          method: request.method,
        }),
        'PrismaExceptionFilter',
      );
    } else {
      // Minimal logging for production to avoid leaking sensitive data
      this.logger.error(
        `Database error: ${exception.code}`,
        JSON.stringify({
          code: exception.code,
          path: request.url,
          method: request.method,
        }),
        'PrismaExceptionFilter',
      );
    }

    // Create a standardized error response
    const errorResponse = this.createErrorResponse(exception, request);

    if (errorResponse) {
      // If we have a specific error response, return it
      const response = ctx.getResponse<Response>();
      response.status(errorResponse.statusCode).json(errorResponse);
    } else {
      // Otherwise, let the base filter handle it
      super.catch(exception, host);
    }
  }

  private createErrorResponse(exception: Prisma.PrismaClientKnownRequestError, request: Request) {
    const code = exception.code;

    switch (code) {
      case 'P2002': {
        // Unique constraint violation
        const target = (exception.meta?.target as string[]) || [];
        return this.formatError(
          HttpStatus.CONFLICT,
          'Unique constraint violation',
          `Duplicate value for: ${target.join(', ')}`,
          request.url,
        );
      }
      case 'P2025': {
        // Record not found
        return this.formatError(
          HttpStatus.NOT_FOUND,
          'Record not found',
          (exception.meta?.cause as string) || 'The requested record does not exist',
          request.url,
        );
      }
      case 'P2003': {
        // Foreign key constraint failed
        const field = (exception.meta?.field_name as string) || '';
        return this.formatError(
          HttpStatus.BAD_REQUEST,
          'Foreign key constraint failed',
          `Invalid reference: ${field}`,
          request.url,
        );
      }
      case 'P2014': {
        // Required relation violation
        return this.formatError(
          HttpStatus.BAD_REQUEST,
          'Required relation violation',
          (exception.meta?.reason as string) || 'A required relation is missing',
          request.url,
        );
      }
      case 'P2016': {
        // Query interpretation error
        return this.formatError(
          HttpStatus.BAD_REQUEST,
          'Query interpretation error',
          exception.message,
          request.url,
        );
      }
      default:
        return null; // Let the base filter handle unknown codes
    }
  }

  private formatError(
    statusCode: number,
    message: string,
    detail: string,
    path: string,
  ): ErrorResponse {
    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      detail,
      timestamp: new Date().toISOString(),
      path,
    };
    return errorResponse;
  }
}
