import { Injectable, ForbiddenException } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { UsersRepository } from '../users/users.repository';
import { TagsBulkImportDto } from './dto/tags-bulk-import.dto';
import { TagsBulkImportSuccessDto } from './dto/tags-bulk-import-success.dto';
import { SupervisorsBulkImportDto } from './dto/supervisors-bulk-import.dto';
import { SupervisorsBulkImportSuccessDto } from './dto/supervisors-bulk-import-success.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateAdminSuccessDto } from './dto/create-admin-success.dto';
import { UserAlreadyExistsException } from '../../common/exceptions/custom-exceptions/user-already-exists.exception';
import { WinstonLoggerService } from '../../common/logging/winston-logger.service';
import { UsersService } from '../users/users.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly logger: WinstonLoggerService,
  ) {}

  /**
   * Bulk imports tags and their similarity relationships
   *
   * This method is essential for initial system setup and periodic updates
   * of the tag ecosystem that drives the matching algorithm
   * @param dto - Contains arrays of tags and their similarity scores
   * @returns Success response with import statistics
   */
  async tagsBulkImport(dto: TagsBulkImportDto): Promise<TagsBulkImportSuccessDto> {
    return this.adminRepository.tagsBulkImport(dto.tags, dto.similarities);
  }

  /**
   * Bulk imports supervisor accounts with their availability settings
   *
   * Enables efficient onboarding of multiple supervisors, typically used
   * at the start of each academic term or when new faculty joins
   * @param dto - Contains array of supervisor data including capacity
   * @returns Success response with import/update counts
   */
  async supervisorsBulkImport(
    dto: SupervisorsBulkImportDto,
  ): Promise<SupervisorsBulkImportSuccessDto> {
    return this.adminRepository.supervisorsBulkImport(dto.supervisors);
  }

  /**
   * Creates a new unregistered admin user account
   *
   * Allows existing admins to pre-create admin accounts that can be claimed
   * later through the standard Clerk authentication flow. This follows the
   * same pattern as supervisor account creation for consistency
   * @param dto - Admin user details (email, first name, last name)
   * @returns Success response with the new admin's user ID
   * @throws UserAlreadyExistsException if email is already in use
   */
  async createAdmin(dto: CreateAdminDto): Promise<CreateAdminSuccessDto> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findUserByEmail(dto.email);

    if (existingUser) {
      this.logger.warn(`Attempt to create admin with existing email: ${dto.email}`, 'AdminService');
      throw new UserAlreadyExistsException(dto.email);
    }

    this.logger.log(`Creating new admin user with email: ${dto.email}`, 'AdminService');

    // Create the admin user
    const newAdmin = await this.adminRepository.createAdmin({
      email: dto.email,
      first_name: dto.first_name,
      last_name: dto.last_name,
    });

    this.logger.log(`Successfully created admin user with ID: ${newAdmin.id}`, 'AdminService');

    // Return formatted response
    return {
      success: true,
      message: 'Admin user created successfully',
      adminId: newAdmin.id,
    };
  }

  async resetUser(userId: string): Promise<{ success: boolean; message: string }> {
  
    const user = await this.usersService.findUserById(userId);

    if (user.role === Role.ADMIN) {
      throw new ForbiddenException('Cannot reset admin users');
    }

    await this.usersService.updateUser(userId, {
      first_name: '',
      last_name: '',
      profile_image: "",
      is_registered: false,
      is_deleted: true,
      clerk_id: null,
    });

    return {
      success: true,
      message: `User ${user.email} has been reset`,
    };
  }
}
