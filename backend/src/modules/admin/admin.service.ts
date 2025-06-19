import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
import { Role, RequestState, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService,
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
  /**
   * Resets a user account to unregistered state while preserving email for re-registration.
   *
   * @param userId - UUID of the user to reset
   * @param requestingAdminId - UUID of the admin performing the reset (for security)
   * @returns Promise resolving to operation result with success status and message
   *
   * @throws {BadRequestException} When userId is invalid
   * @throws {NotFoundException} When user with given ID doesn't exist
   * @throws {ForbiddenException} When attempting to reset admin users or self-reset
   */
  async resetUser(
    userId: string,
    requestingAdminId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Input validation
    if (!userId || typeof userId !== 'string') {
      throw new BadRequestException('Invalid user ID provided');
    }

    if (!requestingAdminId || typeof requestingAdminId !== 'string') {
      throw new BadRequestException('Invalid requesting admin ID');
    }

    // CRITICAL: Prevent admin self-reset
    if (userId === requestingAdminId) {
      throw new ForbiddenException('Admins cannot reset their own accounts');
    }

    return this.prisma.$transaction(async tx => {
      // Validate user exists
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Validate requesting admin exists and has admin role
      const requestingAdmin = await tx.user.findUnique({
        where: { id: requestingAdminId },
        select: { id: true, role: true, email: true },
      });

      if (!requestingAdmin || requestingAdmin.role !== Role.ADMIN) {
        throw new ForbiddenException('Only administrators can perform user resets');
      }

      // Prevent admin account deletion for security
      if (user.role === Role.ADMIN) {
        throw new ForbiddenException('Cannot reset admin users');
      }

      // Log admin action for audit trail
      this.logger.log(
        `Admin ${requestingAdmin.email} (${requestingAdminId}) is resetting user ${user.email} (${userId})`,
        'AdminService',
      );

      // Handle role-specific cleanup before user profile reset
      if (user.role === Role.STUDENT) {
        const studentProfile = await tx.student.findUnique({
          where: { user_id: userId },
        });

        if (studentProfile) {
          await this.resetStudentData(studentProfile.id, tx);
        }
      } else if (user.role === Role.SUPERVISOR) {
        const supervisorProfile = await tx.supervisor.findUnique({
          where: { user_id: userId },
        });

        if (supervisorProfile) {
          await this.resetSupervisorData(supervisorProfile.id, tx);
        }
      }

      // Reset user profile to unregistered state
      await tx.user.update({
        where: { id: userId },
        data: {
          first_name: '',
          last_name: '',
          profile_image: '',
          is_registered: false,
          is_deleted: true,
          clerk_id: null,
          // Note: email is preserved to allow re-registration
        },
      });

      this.logger.log(
        `Successfully reset user ${user.email} by admin ${requestingAdmin.email}`,
        'AdminService',
      );

      return {
        success: true,
        message: `User ${user.email} has been reset successfully`,
      };
    });
  }

  /**
   * Handles cleanup of student-specific data during user reset with secure database operations.
   *
   * This method processes all supervision requests for a student:
   * - Active supervisions (ACCEPTED) are withdrawn in batch operations
   * - Supervisor capacity is restored securely with individual atomic updates
   * - Other request states (PENDING, REJECTED, WITHDRAWN) remain unchanged
   *
   * @param studentId - ID of the student profile to reset
   * @param tx - Prisma transaction client for atomic operations
   *
   * @private Internal method used within resetUser transaction
   *
   * @effects
   * - Converts ACCEPTED supervision requests to WITHDRAWN state in batch
   * - Securely restores available_spots for affected supervisors
   * - Student loses active supervision and becomes unassigned
   *
   * @security Uses parameterized Prisma operations to prevent SQL injection
   * @performance Uses batch operations where possible, individual updates for capacity restoration
   */
  private async resetStudentData(studentId: string, tx: Prisma.TransactionClient): Promise<void> {
    // Validate student ID format for security
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId)) {
      throw new BadRequestException('Invalid student ID format');
    }

    // Optimize query to filter at database level instead of in memory
    const acceptedRequests = await tx.supervisionRequest.findMany({
      where: {
        student_id: studentId,
        request_state: RequestState.ACCEPTED,
      },
      select: { id: true, supervisor_id: true },
    });

    // Early return if no active supervisions to process
    if (acceptedRequests.length === 0) return;

    // Batch update all supervision requests to WITHDRAWN
    await tx.supervisionRequest.updateMany({
      where: { id: { in: acceptedRequests.map(request => request.id) } },
      data: { request_state: RequestState.WITHDRAWN },
    });

    // Group supervisor capacity updates to handle multiple supervisions per supervisor
    const supervisorUpdates = acceptedRequests.reduce(
      (acc, request) => {
        // Validate supervisor ID format for security
        if (
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            request.supervisor_id,
          )
        ) {
          this.logger.error(
            `Invalid supervisor ID format: ${request.supervisor_id}`,
            'AdminService',
          );
          return acc; // Skip invalid IDs
        }
        acc[request.supervisor_id] = (acc[request.supervisor_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    if (Object.keys(supervisorUpdates).length > 0) {
      try {
        await Promise.all(
          Object.entries(supervisorUpdates).map(([supervisorId, increment]) =>
            tx.supervisor
              .update({
                where: { id: supervisorId },
                data: {
                  available_spots: {
                    increment: increment,
                  },
                },
              })
              .catch((error: Error) => {
                // Log individual failures for debugging
                this.logger.error(
                  `Failed to update capacity for supervisor ${supervisorId}: ${error.message}`,
                  'AdminService',
                );
                throw error; // Re-throw to trigger transaction rollback
              }),
          ),
        );

        this.logger.debug(
          `Securely updated capacity for ${Object.keys(supervisorUpdates).length} supervisors`,
          'AdminService',
        );
      } catch (error: unknown) {
        this.logger.error(
          `Failed to update supervisor capacities during student reset: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'AdminService',
        );
        throw error; // Will trigger transaction rollback
      }
    }
  }

  /**
   * Handles cleanup of supervisor-specific data during user reset with optimized batch operations.
   *
   * This method terminates all active supervisions where this supervisor is supervising students:
   * - All ACCEPTED supervision requests are converted to WITHDRAWN in batch
   * - Affected students become unassigned and can seek new supervision
   * - No capacity restoration needed since supervisor is being deleted
   *
   * @param supervisorId - ID of the supervisor profile to reset
   * @param tx - Prisma transaction client for atomic operations
   *
   * @private Internal method used within resetUser transaction
   *
   * @effects
   * - Multiple students may lose their supervision simultaneously
   * - All affected students revert to unassigned status
   * - Students can immediately seek new supervision
   *
   * @warning High impact operation - can affect multiple students at once
   * @performance Uses batch updateMany for efficient processing of multiple supervisions
   */
  private async resetSupervisorData(
    supervisorId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    // Find all students currently being supervised by this supervisor
    const activeSupervisions = await tx.supervisionRequest.findMany({
      where: {
        supervisor_id: supervisorId,
        request_state: RequestState.ACCEPTED,
      },
      select: { id: true },
    });

    // Early return if no active supervisions
    if (activeSupervisions.length === 0) return;

    // Batch update all active supervisions to WITHDRAWN
    await tx.supervisionRequest.updateMany({
      where: { id: { in: activeSupervisions.map(supervision => supervision.id) } },
      data: { request_state: RequestState.WITHDRAWN },
    });
  }
}
