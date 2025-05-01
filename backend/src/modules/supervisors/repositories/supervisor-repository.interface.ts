import { User, UserTag } from '@prisma/client';
import { registerSupervisorDto } from '../dto/register-supervisor.dto';

export interface SupervisorRepository {
  /**
   * Find a supervisor by their user ID
   * @param userId The user ID
   * @returns The user or null
   */
  findSupervisorByUserId(userId: string): Promise<User | null>;

  /**
   * Check if a user is a supervisor
   * @param userId The user ID
   * @returns True if the user is a supervisor
   */
  isSupervisor(userId: string): Promise<boolean>;

  /**
   * Updates the tags associated with a supervisor
   * @param userId The user ID
   * @param tags Array of tag IDs and priorities
   * @returns Array of created UserTag records
   */
  updateSupervisorTags(userId: string, tags: registerSupervisorDto['tags']): Promise<UserTag[]>;

  /**
   * Updates the registration status of a user
   * @param userId The user ID
   * @param isRegistered Registration status to set
   */
  updateUserRegistrationStatus(userId: string, isRegistered: boolean): Promise<void>;
}
