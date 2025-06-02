import { ArgumentsHost, Catch, HttpStatus, Inject } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { WinstonLoggerService } from '../../logging/winston-logger.service';
import { ErrorResponse } from '../interfaces/error-response.interface';
import { AppConfigService } from '@config';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  constructor(
    @Inject(WinstonLoggerService) private readonly logger: WinstonLoggerService,
    private readonly appConfig: AppConfigService,
  ) {
    super();
  }

  catch(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    // Log the full error in development
    if (!this.appConfig.isProduction) {
      if (exception instanceof Prisma.PrismaClientKnownRequestError) {
        // Known request errors have code and meta properties
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
        // Validation errors only have message
        this.logger.error(
          `Prisma validation error: ${exception.message}`,
          JSON.stringify({
            path: request.url,
            method: request.method,
          }),
          'PrismaExceptionFilter',
        );
      }
    } else {
      // Minimal logging for production to avoid leaking sensitive data
      if (exception instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(
          `Database error: ${exception.code}`,
          JSON.stringify({
            code: exception.code,
            path: request.url,
            method: request.method,
          }),
          'PrismaExceptionFilter',
        );
      } else {
        this.logger.error(
          'Database validation error',
          JSON.stringify({
            path: request.url,
            method: request.method,
          }),
          'PrismaExceptionFilter',
        );
      }
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

  private createErrorResponse(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
    request: Request,
  ) {
    // Handle PrismaClientValidationError separately
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return this.formatError(
        HttpStatus.BAD_REQUEST,
        'Invalid query parameters',
        'The provided query parameters are invalid',
        request.url,
      );
    }

    // Handle PrismaClientKnownRequestError
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
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

    return null;
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
