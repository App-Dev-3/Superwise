import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RequestState, Role, User } from '@prisma/client';
import { SupervisionRequestsRepository } from './supervision-requests.repository';
import { StudentsService } from '../../students/students.service';
import { SupervisorsService } from '../../supervisors/supervisors.service';
import { UsersService } from '../../users/users.service';
import { WinstonLoggerService } from '../../../common/logging/winston-logger.service';
import { SupervisionRequestStateConflictException } from '../../../common/exceptions/custom-exceptions/supervision-request-state-conflict.exception';
import { SupervisionRequestTooEarlyException } from '../../../common/exceptions/custom-exceptions/supervision-request-too-early.exception';
import { InvalidRequestStateTransitionException } from '../../../common/exceptions/custom-exceptions/invalid-request-state-transition.exception';
import { SupervisorCapacityException } from '../../../common/exceptions/custom-exceptions/supervisor-capacity.exception';
import { SelfSupervisionException } from '../../../common/exceptions/custom-exceptions/self-supervision.exception';
import { SupervisorTargetException } from '../../../common/exceptions/custom-exceptions/supervisor-target.exception';
import { MissingStudentEmailException } from '../../../common/exceptions/custom-exceptions/missing-student-email.exception';
import { AdminSupervisionRequestException } from '../../../common/exceptions/custom-exceptions/admin-supervision-request.exception';
import { AppConfigService } from '@config';
import { PendingRequestCountEntity } from './entities/pending-request-count.entity';

@Injectable()
export class SupervisionRequestsService {
  constructor(
    private readonly repository: SupervisionRequestsRepository,
    private readonly studentsService: StudentsService,
    private readonly supervisorsService: SupervisorsService,
    private readonly usersService: UsersService,
    private readonly logger: WinstonLoggerService,
    private readonly appConfig: AppConfigService,
  ) { }

  /**
   * Create a supervision request
   * The behavior depends on the user role:
   * - Students: Create a PENDING request to a supervisor
   * - Supervisors: Create an ACCEPTED request with a student (creating the student if needed)
   */
  async createSupervisionRequest(
    createRequestDto: { student_email?: string; supervisor_id?: string },
    currentUser: User,
  ) {
    switch (currentUser.role) {
      case Role.STUDENT:
        return this.createStudentRequest(createRequestDto, currentUser);
      case Role.SUPERVISOR:
        return this.createSupervisorRequest(createRequestDto, currentUser);
      default:
        throw new ForbiddenException(
          'Only students and supervisors can create supervision requests',
        );
    }
  }

  /**
   * Create a supervision request as a student
   * Request state will be PENDING
   */
  private async createStudentRequest(dto: { supervisor_id?: string }, currentUser: User) {
    // Validate input
    if (!dto.supervisor_id) {
      throw new BadRequestException('supervisor_id is required for students');
    }

    const supervisorId = dto.supervisor_id;

    // Get student profile
    const student = await this.studentsService.findStudentByUserId(currentUser.id);

    // Check if supervisor exists
    await this.supervisorsService.findSupervisorById(supervisorId);

    // Check for existing requests
    const existingRequests = await this.repository.findAllRequests({
      student_id: student.id,
      supervisor_id: supervisorId,
    });

    // Validate request restrictions
    if (existingRequests.length > 0) {
      const latestRequest = existingRequests[0]; // Using our sort by updated_at desc

      // Check if there's already a pending or accepted request
      if (
        latestRequest.request_state === RequestState.PENDING ||
        latestRequest.request_state === RequestState.ACCEPTED
      ) {
        throw new SupervisionRequestStateConflictException(latestRequest.request_state);
      }

      // Check if request is within waiting period (for REJECTED or WITHDRAWN)
      if (
        (latestRequest.request_state === RequestState.REJECTED ||
          latestRequest.request_state === RequestState.WITHDRAWN) &&
        this.isWithinWaitPeriod(latestRequest.updated_at, this.getCooldownDays())
      ) {
        throw new SupervisionRequestTooEarlyException(this.getCooldownDays());
      }
    }

    // Create request with PENDING state
    return this.repository.createSupervisionRequest({
      student_id: student.id,
      supervisor_id: supervisorId,
      request_state: RequestState.PENDING,
    });
  }

  /**
   * Create a supervision request as a supervisor
   * Request state will be ACCEPTED and student will be created if needed
   */
  private async createSupervisorRequest(dto: { student_email?: string }, currentUser: User) {
    // Validate input
    if (!dto.student_email) {
      throw new MissingStudentEmailException();
    }
    // Check that email is not the same as current user's email
    if (dto.student_email === currentUser.email) {
      throw new SelfSupervisionException();
    }

    // Check if target email belongs to a supervisor
    const targetUser = await this.usersService.findUserByEmail(dto.student_email);
    if (targetUser?.role === Role.SUPERVISOR) {
      throw new SupervisorTargetException();
    }

    // Get supervisor profile
    const supervisor = await this.supervisorsService.findSupervisorByUserId(currentUser.id);

    // Check if supervisor has available spots
    if (supervisor.available_spots <= 0) {
      throw new SupervisorCapacityException(supervisor.id);
    }

    if (targetUser) {
      const student = await this.studentsService.findStudentByUserId(targetUser.id);
      if (student) {
        const hasAccepted = await this.repository.hasAcceptedSupervision(student.id);
        if (hasAccepted) {
          throw new BadRequestException(
            'Student already has an accepted supervision request. Manual assignment not allowed.'
          );
        }
      }
    }


    const result = await this.repository.createSupervisionRequest({
      supervisor_id: supervisor.id,
      student_email: dto.student_email,
      available_spots: supervisor.available_spots,
      request_state: RequestState.ACCEPTED,
    });

    if (result.studentWasCreated) {
      this.logger.log(
        `New student account was created for email ${dto.student_email} by supervisor ${currentUser.id}`,
        'SupervisionRequestsService',
      );
    }

    return result;

  }

  /**
   * Get all supervision requests, filtered by user role and optional state
   */
  async findAllRequests(userId: string, userRole: Role, requestState?: RequestState) {
    switch (userRole) {
      case Role.STUDENT:
        return this.findRequestsForStudent(userId, requestState);
      case Role.SUPERVISOR:
        return this.findRequestsForSupervisor(userId, requestState);
      case Role.ADMIN:
        return this.repository.findAllRequests({
          request_state: requestState,
        });
      default:
        return [];
    }
  }

  /**
   * Get all requests for a student
   */
  private async findRequestsForStudent(userId: string, requestState?: RequestState) {
    const student = await this.studentsService.findStudentByUserId(userId);
    return this.repository.findAllRequests({
      student_id: student.id,
      request_state: requestState,
    });
  }

  /**
   * Get all requests for a supervisor
   */
  private async findRequestsForSupervisor(userId: string, requestState?: RequestState) {
    const supervisor = await this.supervisorsService.findSupervisorByUserId(userId);
    return this.repository.findAllRequests({
      supervisor_id: supervisor.id,
      request_state: requestState,
    });
  }

  /**
   * Find a supervision request by ID
   * Validates user permissions to view the request
   */
  async findRequestById(id: string, currentUser: User) {
    const request = await this.repository.findRequestById(id);

    if (!request) {
      throw new NotFoundException(`Supervision request with ID ${id} not found`);
    }

    // Check if user has permission to view this request
    const hasPermission = await this.userHasRequestPermission(
      currentUser,
      request.student_id,
      request.supervisor_id,
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to view this request');
    }

    return request;
  }

  /**
   * Update a supervision request state
   * Validates user permissions and allowed state transitions
   */
  async updateRequestState(id: string, newState: RequestState, currentUser: User) {
    const request = await this.repository.findRequestById(id);

    if (!request) {
      throw new NotFoundException(`Supervision request with ID ${id} not found`);
    }


    const hasPermission = await this.userHasRequestPermission(
      currentUser,
      request.student_id,
      request.supervisor_id,
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to update this request');
    }

    this.validateStateTransition(request.request_state, newState, currentUser.role);

    if (newState === RequestState.ACCEPTED && request.request_state !== RequestState.ACCEPTED) {
      const hasAccepted = await this.repository.hasAcceptedSupervision(request.student_id);
      if (hasAccepted) {
        throw new BadRequestException(
          'Student already has an accepted supervision request. Only one accepted request is allowed per student.',
        );
      }
    }


    if (newState === RequestState.ACCEPTED || request.request_state === RequestState.ACCEPTED) {
      const supervisor = await this.supervisorsService.findSupervisorById(request.supervisor_id);


      if (newState === RequestState.ACCEPTED && request.request_state !== RequestState.ACCEPTED) {
        if (supervisor.available_spots <= 0) {
          throw new SupervisorCapacityException(request.supervisor_id);
        }
      }


      const result = await this.repository.updateRequestState({
        id,
        newState,
        currentState: request.request_state,
        supervisor_id: request.supervisor_id,
        available_spots: supervisor.available_spots,
        total_spots: supervisor.total_spots,
      });

      if (newState === RequestState.ACCEPTED && request.request_state !== RequestState.ACCEPTED) {
        this.logger.log(
          `Request ${id} accepted, competing requests auto-withdrawn`,
          'SupervisionRequestsService',
        );
      }

      return result;
    }


    return this.repository.updateRequestState({
      id,
      newState,
      currentState: request.request_state,
      supervisor_id: request.supervisor_id,
      available_spots: 0,
      total_spots: 0,
    });
  }

  /**
   * Count pending supervision requests for a specific user
   * Validates user exists and role, then returns count based on role
   * @param userId - The ID of the user to count pending requests for
   * @returns A PendingRequestCountEntity object containing the count of pending requests
   * @throws NotFoundException if the user is not found
   * @throws AdminSupervisionRequestException if the user is an admin
   */
  async countPendingRequestsForUser(userId: string): Promise<PendingRequestCountEntity> {
    // Step 1: Validate user exists
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Step 2: Check admin role
    if (user.role === Role.ADMIN) {
      throw new AdminSupervisionRequestException();
    }

    // Step 3: Count based on role
    let count: number;
    if (user.role === Role.STUDENT) {
      const student = await this.studentsService.findStudentByUserId(userId);
      count = await this.repository.countRequests({
        student_id: student.id,
        request_state: RequestState.PENDING,
      });
    } else if (user.role === Role.SUPERVISOR) {
      const supervisor = await this.supervisorsService.findSupervisorByUserId(userId);
      count = await this.repository.countRequests({
        supervisor_id: supervisor.id,
        request_state: RequestState.PENDING,
      });
    } else {
      count = 0;
    }

    return { pending_count: count };
  }

  /**
   * Check if a user has permission to access a request
   */
  private async userHasRequestPermission(
    user: User,
    studentId: string,
    supervisorId: string,
  ): Promise<boolean> {
    // Admins can access all requests
    if (user.role === Role.ADMIN) {
      return true;
    }

    // Check if student is viewing their own request
    if (user.role === Role.STUDENT) {
      const student = await this.studentsService.findStudentByUserId(user.id);
      return student.id === studentId;
    }

    // Check if supervisor is viewing a request directed to them
    if (user.role === Role.SUPERVISOR) {
      const supervisor = await this.supervisorsService.findSupervisorByUserId(user.id);
      return supervisor.id === supervisorId;
    }

    return false;
  }

  /**
   * Check if a date is within a waiting period (in days)
   */
  private isWithinWaitPeriod(date: Date, days: number): boolean {
    const waitPeriodMs = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    return Date.now() - date.getTime() < waitPeriodMs;
  }

  /**
   * Get the cooldown period in days from configuration
   */
  private getCooldownDays(): number {
    return this.appConfig.supervisionRequestCooldownDays;
  }

  /**
   * Validate state transitions based on user role
   */
  private validateStateTransition(
    currentState: RequestState,
    newState: RequestState,
    role: Role,
  ): void {
    switch (role) {
      case Role.STUDENT:
        // Students can only withdraw their own requests
        if (newState !== RequestState.WITHDRAWN) {
          throw new InvalidRequestStateTransitionException(currentState, newState, role);
        }
        break;

      case Role.SUPERVISOR:
        // Supervisors can accept, reject, or withdraw
        if (
          newState !== RequestState.ACCEPTED &&
          newState !== RequestState.REJECTED &&
          newState !== RequestState.WITHDRAWN
        ) {
          throw new InvalidRequestStateTransitionException(currentState, newState, role);
        }
        break;

      case Role.ADMIN:
        // Admins can only withdraw
        if (newState !== RequestState.WITHDRAWN) {
          throw new InvalidRequestStateTransitionException(currentState, newState, role);
        }
        break;

      default:
        throw new ForbiddenException('You do not have permission to update this request');
    }
  }
}
