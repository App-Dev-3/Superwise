import { ArgumentsHost, Catch, HttpException, Inject } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { WinstonLoggerService } from '../../logging/winston-logger.service';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  constructor(@Inject(WinstonLoggerService) private readonly logger: WinstonLoggerService) {
    super();
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // Get response data from the exception
    const exceptionResponse = exception.getResponse() as
      | string
      | { message: string | string[]; statusCode: number; error: string };

    // Format the error message
    let errorMessage: string;
    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    } else if (Array.isArray(exceptionResponse.message)) {
      errorMessage = exceptionResponse.message.join('; ');
    } else if (typeof exceptionResponse.message === 'string') {
      errorMessage = exceptionResponse.message;
    } else {
      errorMessage = 'An error occurred';
    }

    // Log the error
    this.logger.error(`HTTP Exception: ${errorMessage}`, exception.stack, 'HttpExceptionFilter');

    // Return a consistent error response
    response.status(status).json({
      statusCode: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
