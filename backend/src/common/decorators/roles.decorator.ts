import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

/**
 * Key used to store roles metadata for route protection
 */
export const ROLES_KEY = 'roles';

/**
 * Decorator that assigns required roles to a route
 * Used with RolesGuard to restrict access based on user role
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
