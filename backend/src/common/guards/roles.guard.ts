import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role, User } from '@prisma/client';
import { WinstonLoggerService } from '../logging/winston-logger.service';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private logger: WinstonLoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the roles required for this route
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the authenticated user from the request (set by ClerkAuthGuard)
    const request = context.switchToHttp().getRequest<Request & { user: User }>();
    const user = request.user;

    // If no user is present (should not happen with proper guard ordering), deny access
    if (!user) {
      this.logger.debug('No user found in request for role-protected route', 'RolesGuard');
      return false;
    }

    // Check if the user's role matches any of the required roles
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      this.logger.debug(
        `Access denied: User with role ${user.role} attempted to access route requiring ${requiredRoles.join(', ')}`,
        'RolesGuard',
      );
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
