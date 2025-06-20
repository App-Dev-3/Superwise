import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserSuccessDto } from './dto/delete-user-success.dto';
import { User, UserTag, Role, UserBlock } from '@prisma/client';
import { UsersRepository } from './users.repository';
import { SetUserTagsDto } from './dto/set-user-tags.dto';
import { UserWithRelations } from './entities/user-with-relations.entity';
import { TagsService } from '../tags/tags.service';
import { UserRegistrationException } from '../../common/exceptions/custom-exceptions/user-registration.exception';
import { UserDeleteForbiddenException } from '../../common/exceptions/custom-exceptions/user-delete-forbidden.exception';
import { LastAdminDeleteException } from '../../common/exceptions/custom-exceptions/last-admin-delete.exception';
import { WinstonLoggerService } from '../../common/logging/winston-logger.service';
import { DeleteUserOperation } from './types/user-operations.types';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly tagsService: TagsService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createUser(
    authUser: { clerk_id: string; email: string },
    createUserDto: CreateUserDto,
  ): Promise<User> {
    this.logger.debug(
      `current jwt attached AuthUser: { clerk_id: ${authUser.clerk_id} for email: ${authUser.email} }`,
      'UsersService',
    );

    // Always use the JWT-verified email for security
    const verifiedUserEmail = authUser.email;
    const existingUser = await this.usersRepository.findUserByEmail(verifiedUserEmail);

    // Scenario 1: No existing user - create a new one (defaults to STUDENT)
    if (!existingUser) {
      this.logger.debug(
        `No existing user for email ${verifiedUserEmail}. Creating new student user with clerk_id: ${authUser.clerk_id}`,
        'UsersService',
      );

      // For new student creation, first_name and last_name are mandatory
      if (!createUserDto.first_name || !createUserDto.last_name) {
        throw new BadRequestException(
          'First name and last name are required to create a new student account.',
        );
      }

      const studentData = {
        email: verifiedUserEmail, // Using verified email from JWT
        clerk_id: authUser.clerk_id, // clerk_id from authenticated session
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        role: Role.STUDENT,
        profile_image: createUserDto.profile_image,
        is_registered: true,
        is_deleted: false,
      };
      return this.usersRepository.createUser(studentData);
    } else {
      // Existing user scenarios
      this.logger.debug(
        `Existing user found for email ${verifiedUserEmail}: id=${existingUser.id}, role=${existingUser.role}, is_registered=${existingUser.is_registered}, clerk_id=${existingUser.clerk_id}`,
        'UsersService',
      );

      // Scenario 2.1: User is already fully registered (has a clerk_id or is_registered is true)
      if (existingUser.clerk_id || existingUser.is_registered) {
        // It's a conflict if trying to link to an already linked/registered account,
        // especially if the clerk_id differs from authUser.clerk_id (though we don't check that explicitly here yet)
        this.logger.warn(
          `User with email ${verifiedUserEmail} is already registered.`,
          'UsersService',
        );
        throw new UserRegistrationException(
          'User is already registered. Please try a different email or log in.',
        );
      }

      // Scenario 2.2: Existing user is a SUPERVISOR and not yet registered
      // This is the flow to link a pre-created supervisor account to their new Clerk login
      if (existingUser.role === Role.SUPERVISOR) {
        this.logger.debug(
          `Linking existing supervisor account (email: ${verifiedUserEmail}, id: ${existingUser.id}) to clerk_id: ${authUser.clerk_id}`,
          'UsersService',
        );
        return this.usersRepository.updateUser(existingUser.id, {
          clerk_id: authUser.clerk_id,
          is_registered: true,
          is_deleted: false,
          // Update profile details if provided in DTO, otherwise keep existing
          first_name: createUserDto.first_name || existingUser.first_name,
          last_name: createUserDto.last_name || existingUser.last_name,
          profile_image:
            createUserDto.profile_image !== undefined
              ? createUserDto.profile_image
              : existingUser.profile_image,
        });
      }

      // Scenario 2.3: Existing user is a STUDENT and not yet registered
      // This is for students created by supervisors who are now registering themselves
      if (existingUser.role === Role.STUDENT) {
        this.logger.debug(
          `Linking existing student account (email: ${verifiedUserEmail}, id: ${existingUser.id}) to clerk_id: ${authUser.clerk_id}`,
          'UsersService',
        );
        return this.usersRepository.updateUser(existingUser.id, {
          clerk_id: authUser.clerk_id,
          is_registered: true,
          is_deleted: false,
          // Update profile details if provided in DTO, otherwise keep existing
          first_name: createUserDto.first_name || existingUser.first_name,
          last_name: createUserDto.last_name || existingUser.last_name,
          profile_image:
            createUserDto.profile_image !== undefined
              ? createUserDto.profile_image
              : existingUser.profile_image,
        });
      }

      // Scenario 2.4: Existing user is an ADMIN and not yet registered
      // This is the flow to link a pre-created admin account to their new Clerk login
      if (existingUser.role === Role.ADMIN) {
        this.logger.debug(
          `Linking existing admin account (email: ${verifiedUserEmail}, id: ${existingUser.id}) to clerk_id: ${authUser.clerk_id}`,
          'UsersService',
        );
        return this.usersRepository.updateUser(existingUser.id, {
          clerk_id: authUser.clerk_id,
          is_registered: true,
          is_deleted: false,
          // Update profile details if provided in DTO, otherwise keep existing
          first_name: createUserDto.first_name || existingUser.first_name,
          last_name: createUserDto.last_name || existingUser.last_name,
          profile_image:
            createUserDto.profile_image !== undefined
              ? createUserDto.profile_image
              : existingUser.profile_image,
        });
      }

      // Scenario 2.5: Existing user has an unknown role and is not registered
      this.logger.warn(
        `Attempt to register with email ${verifiedUserEmail} which exists but has an unknown role (role: ${existingUser.role}).`,
        'UsersService',
      );
      throw new BadRequestException(
        'An account with this email already exists but cannot be registered. Please contact support if you believe this is an error.',
      );
    }
  }

  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.findAllUsers();
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findUserByIdWithRelations(id: string): Promise<UserWithRelations> {
    const user = await this.usersRepository.findUserByIdWithRelations(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async searchUsers(searchQuery: string): Promise<User[]> {
    // Validate search query - if empty, return empty array
    if (!searchQuery || searchQuery.trim() === '') {
      return [];
    }

    // Delegate to repository - repository handles sanitization and result limiting
    return this.usersRepository.searchUsers(searchQuery);
  }

  /**
   * Finds a user by email and throws if not found
   *
   * Standard method when user existence is required.
   * Used throughout the application where a missing user should cause an error.
   * @param email - The email address to search for
   * @returns Promise resolving to the found User
   * @throws NotFoundException if no user exists with the given email
   */
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /**
   * Finds a user by email or returns null if not found
   *
   * Used when missing users should NOT cause errors (e.g., createSupervisorRequest
   * where we check existence before potentially creating a new student).
   * @param email - The email address to search for
   * @returns Promise resolving to the found User or null if not found
   */
  async findUserByEmailOrNull(email: string): Promise<User | null> {
    return this.usersRepository.findUserByEmail(email);
  }

  async findUserByClerkId(clerkId: string): Promise<User> {
    const user = await this.usersRepository.findUserByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException(`User with clerk_id ${clerkId} not found`);
    }
    return user;
  }

  async findUsersByFirstName(firstName: string): Promise<User[]> {
    return this.usersRepository.findUsersByFirstName(firstName);
  }

  async findUsersByLastName(lastName: string): Promise<User[]> {
    return this.usersRepository.findUsersByLastName(lastName);
  }

  async findUsersByTagId(tagId: string): Promise<User[]> {
    // Verify tag exists before searching
    await this.tagsService.findTagById(tagId);
    return this.usersRepository.findUsersByTagId(tagId);
  }

  async findUsersByTagIds(tagIds: string[]): Promise<User[]> {
    // Verify all tags exist
    await Promise.all(tagIds.map(id => this.tagsService.findTagById(id)));
    return this.usersRepository.findUsersByTagIds(tagIds);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Find the existing user (will throw NotFoundException if user doesn't exist)
    await this.findUserById(id);
    return this.usersRepository.updateUser(id, updateUserDto);
  }

  async deleteUser(id: string, currentUser: User): Promise<DeleteUserSuccessDto> {
    // Authorization check
    if (currentUser.id !== id && currentUser.role !== Role.ADMIN) {
      throw new UserDeleteForbiddenException();
    }

    // Find the user to be deleted
    const userToDelete = await this.findUserByIdWithRelations(id);

    // Check if admin is trying to delete themselves and they're the last admin
    if (currentUser.id === id && currentUser.role === Role.ADMIN) {
      const activeAdminCount = await this.usersRepository.countActiveAdmins();

      if (activeAdminCount === 1) {
        throw new LastAdminDeleteException();
      }
    }

    // Get student/supervisor profile IDs if needed
    let studentId: string | undefined;
    let supervisorId: string | undefined;

    if (userToDelete.role === Role.STUDENT) {
      studentId = userToDelete.student_profile?.id;
    } else if (userToDelete.role === Role.SUPERVISOR) {
      supervisorId = userToDelete.supervisor_profile?.id;
    }

    // Use repository method for the transaction
    const deleteOperation: DeleteUserOperation = {
      userId: id,
      userEmail: userToDelete.email,
      userRole: userToDelete.role,
      studentId,
      supervisorId,
    };

    const deletionStats = await this.usersRepository.deleteUser(deleteOperation);

    this.logger.log(
      `Successfully soft deleted user ${userToDelete.email} (${id}). ` +
        `Deleted ${deletionStats.deletedTagsCount} user tags, ${deletionStats.deletedBlocksCount} blocked users. ` +
        `Profile updated: ${deletionStats.profileUpdated}`,
      'UsersService',
    );

    return {
      success: true,
      message: `User ${userToDelete.email} has been deleted successfully`,
    };
  }

  // User Tag operations
  async findUserTagsByUserId(userId: string): Promise<UserTag[]> {
    // This will throw NotFoundException if user doesn't exist
    await this.findUserById(userId);
    return this.usersRepository.findUserTagsByUserId(userId);
  }

  async setUserTagsByUserId(userId: string, dto: SetUserTagsDto): Promise<UserTag[]> {
    // Verify User Exists - will throw NotFoundException if user doesn't exist
    await this.findUserById(userId);

    // Validate Tag Data
    const priorities = dto.tags.map(t => t.priority);
    const uniquePriorities = new Set(priorities);
    if (priorities.length !== uniquePriorities.size) {
      throw new BadRequestException('Priorities must be unique.');
    }
    // Check if priorities are sequential (1, 2, 3... N)
    const maxPriority = priorities.length > 0 ? Math.max(...priorities) : 0;
    if (maxPriority !== priorities.length) {
      throw new BadRequestException(`Priorities must be sequential from stating from 1.`);
    }
    // Check minimum priority is 1 (already handled by DTO validator, but good practice)
    if (priorities.length > 0 && Math.min(...priorities) !== 1) {
      throw new BadRequestException('Priorities must start from 1.');
    }

    // Verify all referenced tag IDs exist; will throw NotFoundException if any invalid
    const tagIds = dto.tags.map(t => t.tag_id);
    // Using Promise.all for parallel lookups; TagsService.findTagById already throws if not found
    await Promise.all(tagIds.map(id => this.tagsService.findTagById(id)));

    // Call Repository and return its result
    return await this.usersRepository.setUserTagsByUserId(userId, dto.tags);
  }

  // User Block operations
  async findBlockedSupervisorsByStudentUserId(studentUserId: string): Promise<UserBlock[]> {
    // Verify user exists and is a student
    const user = await this.findUserById(studentUserId);
    if (user.role !== Role.STUDENT) {
      throw new BadRequestException('Only students can have blocked supervisors');
    }

    return this.usersRepository.findBlockedSupervisorsByStudentUserId(studentUserId);
  }

  async createUserBlock(studentUserId: string, supervisorUserId: string): Promise<UserBlock> {
    // Validate that users exist and have correct roles
    const student = await this.findUserById(studentUserId);
    const supervisor = await this.findUserById(supervisorUserId);

    // Check if blocker is trying to block themselves
    if (studentUserId === supervisorUserId) {
      throw new BadRequestException('Users cannot block themselves');
    }

    // Verify blocker is a student and blocked is a supervisor
    if (student.role !== Role.STUDENT) {
      throw new BadRequestException('Only students can block supervisors');
    }

    if (supervisor.role !== Role.SUPERVISOR) {
      throw new BadRequestException('Students can only block supervisors');
    }

    // Check if block already exists
    const existingBlock = await this.usersRepository.findUserBlockByIds(
      studentUserId,
      supervisorUserId,
    );
    if (existingBlock) {
      throw new BadRequestException('This supervisor is already blocked');
    }

    // Create the block
    return this.usersRepository.createUserBlock(studentUserId, supervisorUserId);
  }

  async deleteUserBlock(studentUserId: string, supervisorUserId: string): Promise<void> {
    // Verify both users exist (will throw if not found)
    await this.findUserById(studentUserId);
    await this.findUserById(supervisorUserId);

    // Check if block exists
    const existingBlock = await this.usersRepository.findUserBlockByIds(
      studentUserId,
      supervisorUserId,
    );
    if (!existingBlock) {
      throw new NotFoundException('Block relationship not found');
    }

    // Delete the block
    await this.usersRepository.deleteUserBlock(studentUserId, supervisorUserId);
  }

  async deleteAllUserBlocks(userId: string): Promise<number> {
    return this.usersRepository.deleteAllUserBlocks(userId);
  }

  async deleteAllUserTags(userId: string): Promise<number> {
    return this.usersRepository.deleteAllUserTags(userId);
  }
}
