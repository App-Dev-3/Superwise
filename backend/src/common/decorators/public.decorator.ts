import { SetMetadata } from '@nestjs/common';

/**
 * Key used to indicate that a route is public and doesn't require authentication
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route as public, skipping authentication checks
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
