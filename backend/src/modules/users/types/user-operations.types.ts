import { Role } from '@prisma/client';

/**
 * Type definition for user deletion operation parameters
 *
 * Provides type safety for the complex user deletion process
 * that involves multiple related entities and database operations.
 */
export interface DeleteUserOperation {
  userId: string;
  userEmail: string;
  userRole: Role;
  studentId?: string;
  supervisorId?: string;
}

/**
 * Type definition for user deletion operation results
 *
 * Contains statistics about what was deleted/modified during
 * the user deletion process for logging and audit purposes.
 */
export interface DeleteUserResult {
  deletedTagsCount: number;
  deletedBlocksCount: number;
  profileUpdated: boolean;
}
