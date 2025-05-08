import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserTag, Role } from '@prisma/client';
import { UsersRepository } from './users.repository';
import { SetUserTagsDto } from './dto/set-user-tags.dto';
import { UserWithRelations } from './entities/user-with-relations.entity';
import { TagsService } from '../tags/tags.service';
import { UserRegistrationException } from '../../common/exceptions/custom-exceptions/user-registration.exception';
import { WinstonLoggerService } from '../../common/logging/winston-logger.service';

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

    if (existingUser) {
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
          // Update profile details if provided in DTO, otherwise keep existing
          first_name: createUserDto.first_name || existingUser.first_name,
          last_name: createUserDto.last_name || existingUser.last_name,
          profile_image:
            createUserDto.profile_image !== undefined
              ? createUserDto.profile_image
              : existingUser.profile_image,
        });
      }

      // Scenario 2.3: Existing user is NOT a supervisor and not registered (e.g. pre-created student, admin)
      // This is a conflict because a non-supervisor account exists and they are trying to use the registration flow
      this.logger.warn(
        `Attempt to register with email ${verifiedUserEmail} which exists but is not a supervisor (role: ${existingUser.role}).`,
        'UsersService',
      );
      throw new BadRequestException(
        'An account with this email already exists and is not an unlinked supervisor. Please contact support if you believe this is an error.',
      );
    } else {
      // Scenario 1: No existing user - create a new one (defaults to STUDENT)
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
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        role: Role.STUDENT,
        profile_image: createUserDto.profile_image,
        clerk_id: authUser.clerk_id, // clerk_id from authenticated session
        is_registered: true,
      };
      return this.usersRepository.createUser(studentData);
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

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
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

  async deleteUser(id: string): Promise<User> {
    // This will throw NotFoundException if user doesn't exist
    await this.findUserById(id);
    // Soft delete
    return this.usersRepository.softDeleteUser(id);
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
}
