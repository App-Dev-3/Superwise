import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';

/**
 * Parameter decorator that extracts the authenticated user from the request object
 * Can be used in controller methods to access the current user
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request & { user: User }>();
  return request.user;
});
