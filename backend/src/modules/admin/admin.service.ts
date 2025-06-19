import { Injectable } from '@nestjs/common';
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
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly usersRepository: UsersRepository,
    private readonly logger: WinstonLoggerService,
    private readonly cacheService: CacheService,
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
    const result = await this.adminRepository.tagsBulkImport(dto.tags, dto.similarities);

    // Direct cache invalidation after bulk import as backup to database triggers
    await this.cacheService.invalidateTagSimilarities('all');
    this.logger.log(
      `Tag similarity cache invalidated after bulk import of ${dto.tags.length} tags and ${dto.similarities.length} similarities`,
      'AdminService',
    );

    return result;
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
}
