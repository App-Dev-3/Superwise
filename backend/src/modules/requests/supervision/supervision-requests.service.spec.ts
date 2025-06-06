import { Test, TestingModule } from '@nestjs/testing';
import { SupervisionRequestsService } from './supervision-requests.service';
import { SupervisionRequestsRepository } from './supervision-requests.repository';
import { StudentsService } from '../../students/students.service';
import { SupervisorsService } from '../../supervisors/supervisors.service';
import { UsersService } from '../../users/users.service';
import { WinstonLoggerService } from '../../../common/logging/winston-logger.service';
import { AppConfigService } from '@config';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RequestState, Role, User } from '@prisma/client';
import { SupervisionRequestStateConflictException } from '../../../common/exceptions/custom-exceptions/supervision-request-state-conflict.exception';
import { SupervisionRequestTooEarlyException } from '../../../common/exceptions/custom-exceptions/supervision-request-too-early.exception';
import { InvalidRequestStateTransitionException } from '../../../common/exceptions/custom-exceptions/invalid-request-state-transition.exception';
import { SupervisorCapacityException } from '../../../common/exceptions/custom-exceptions/supervisor-capacity.exception';
import { SelfSupervisionException } from '../../../common/exceptions/custom-exceptions/self-supervision.exception';
import { SupervisorTargetException } from '../../../common/exceptions/custom-exceptions/supervisor-target.exception';
import { MissingStudentEmailException } from '../../../common/exceptions/custom-exceptions/missing-student-email.exception';
import { AdminSupervisionRequestException } from '../../../common/exceptions/custom-exceptions/admin-supervision-request.exception';

describe('SupervisionRequestsService', () => {
  let service: SupervisionRequestsService;

  // Mock dependencies
  const mockRepository = {
    findAllRequests: jest.fn(),
    findRequestById: jest.fn(),
    createSupervisionRequest: jest.fn(),
    updateRequestState: jest.fn(),
    countRequests: jest.fn(),
  };

  const mockStudentsService = {
    findStudentByUserId: jest.fn(),
    findStudentById: jest.fn(),
  };

  const mockSupervisorsService = {
    findSupervisorByUserId: jest.fn(),
    findSupervisorById: jest.fn(),
  };

  const mockUsersService = {
    findUserById: jest.fn(),
    findUserByEmail: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockAppConfigService = {
    supervisionRequestCooldownDays: 2, // Default cooldown period for tests
    isDevelopment: true,
    isProduction: false,
    isTest: true,
    nodeEnv: 'test',
    port: 3000,
    frontendHost: 'http://localhost:3000',
    allowedEmailDomains: ['fhstp.ac.at'],
  };

  // Test data
  const REQUEST_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const STUDENT_UUID = '123e4567-e89b-12d3-a456-426614174001';
  const SUPERVISOR_UUID = '123e4567-e89b-12d3-a456-426614174002';
  const STUDENT_USER_UUID = '123e4567-e89b-12d3-a456-426614174003';
  const SUPERVISOR_USER_UUID = '123e4567-e89b-12d3-a456-426614174004';
  const ADMIN_USER_UUID = '123e4567-e89b-12d3-a456-426614174005';
  const ANOTHER_SUPERVISOR_USER_UUID = '123e4567-e89b-12d3-a456-426614174006';
  const STUDENT_CLERK_ID = 'user_2NUj8tGhSFhTLD9sdP0q4P7VoJM';
  const SUPERVISOR_CLERK_ID = 'user_1AUj8tGhSFhTLD9sdP0q4P7VoXY';
  const ADMIN_CLERK_ID = 'user_3CUj8tGhSFhTLD9sdP0q4P7VoZW';

  const mockStudentUser: User = {
    id: STUDENT_USER_UUID,
    email: 'student@fhstp.ac.at',
    first_name: 'Student',
    last_name: 'User',
    role: Role.STUDENT,
    profile_image: 'https://superwise.at/images/student-profile.jpg',
    is_registered: true,
    is_deleted: false,
    clerk_id: STUDENT_CLERK_ID,
    created_at: new Date('2023-01-15T10:30:00Z'),
    updated_at: new Date('2023-01-15T10:30:00Z'),
  };

  const mockSupervisorUser: User = {
    id: SUPERVISOR_USER_UUID,
    email: 'supervisor@fhstp.ac.at',
    first_name: 'Supervisor',
    last_name: 'User',
    role: Role.SUPERVISOR,
    profile_image: 'https://superwise.at/images/supervisor-profile.jpg',
    is_registered: true,
    is_deleted: false,
    clerk_id: SUPERVISOR_CLERK_ID,
    created_at: new Date('2023-01-15T10:30:00Z'),
    updated_at: new Date('2023-01-15T10:30:00Z'),
  };

  const mockAdminUser: User = {
    id: ADMIN_USER_UUID,
    email: 'admin@fhstp.ac.at',
    first_name: 'Admin',
    last_name: 'User',
    role: Role.ADMIN,
    profile_image: 'https://superwise.at/images/admin-profile.jpg',
    is_registered: true,
    is_deleted: false,
    clerk_id: ADMIN_CLERK_ID,
    created_at: new Date('2023-01-15T10:30:00Z'),
    updated_at: new Date('2023-01-15T10:30:00Z'),
  };

  const mockStudent = {
    id: STUDENT_UUID,
    user_id: STUDENT_USER_UUID,
    thesis_description: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockSupervisor = {
    id: SUPERVISOR_UUID,
    user_id: SUPERVISOR_USER_UUID,
    bio: 'Experienced supervisor',
    available_spots: 5,
    total_spots: 10,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockSupervisionRequest = {
    id: REQUEST_UUID,
    student_id: STUDENT_UUID,
    supervisor_id: SUPERVISOR_UUID,
    request_state: RequestState.PENDING,
    created_at: new Date('2023-01-15T10:30:00Z'),
    updated_at: new Date('2023-01-15T10:30:00Z'),
  };

  // Mock supervision request with users
  const mockSupervisionRequestWithUsers = {
    ...mockSupervisionRequest,
    student: {
      id: STUDENT_UUID,
      user_id: STUDENT_USER_UUID,
      user: {
        first_name: 'Student',
        last_name: 'User',
        email: 'student@fhstp.ac.at',
        profile_image: null,
      },
    },
    supervisor: {
      id: SUPERVISOR_UUID,
      user_id: SUPERVISOR_USER_UUID,
      user: {
        first_name: 'Supervisor',
        last_name: 'User',
        email: 'supervisor@fhstp.ac.at',
        profile_image: null,
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupervisionRequestsService,
        { provide: SupervisionRequestsRepository, useValue: mockRepository },
        { provide: StudentsService, useValue: mockStudentsService },
        { provide: SupervisorsService, useValue: mockSupervisorsService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: WinstonLoggerService, useValue: mockLoggerService },
        { provide: AppConfigService, useValue: mockAppConfigService },
      ],
    }).compile();

    service = module.get<SupervisionRequestsService>(SupervisionRequestsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSupervisionRequest', () => {
    describe('as a student', () => {
      it('should create a pending request to a supervisor', async () => {
        // Arrange
        const dto = { supervisor_id: SUPERVISOR_UUID };
        mockStudentsService.findStudentByUserId.mockResolvedValue(mockStudent);
        mockSupervisorsService.findSupervisorById.mockResolvedValue(mockSupervisor);
        mockRepository.findAllRequests.mockResolvedValue([]); // No existing requests
        mockRepository.createSupervisionRequest.mockResolvedValue(mockSupervisionRequest);

        // Act
        const result = await service.createSupervisionRequest(dto, mockStudentUser);

        // Assert
        expect(result).toEqual(mockSupervisionRequest);
        expect(mockStudentsService.findStudentByUserId).toHaveBeenCalledWith(mockStudentUser.id);
        expect(mockSupervisorsService.findSupervisorById).toHaveBeenCalledWith(SUPERVISOR_UUID);
        expect(mockRepository.findAllRequests).toHaveBeenCalledWith({
          student_id: mockStudent.id,
          supervisor_id: SUPERVISOR_UUID,
        });
        expect(mockRepository.createSupervisionRequest).toHaveBeenCalledWith({
          student_id: mockStudent.id,
          supervisor_id: SUPERVISOR_UUID,
          request_state: RequestState.PENDING,
        });
      });

      it('should throw BadRequestException if supervisor_id is missing', async () => {
        // Arrange
        const dto = {};

        // Act & Assert
        await expect(service.createSupervisionRequest(dto, mockStudentUser)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw StateConflictException if a pending request already exists', async () => {
        // Arrange
        const dto = { supervisor_id: SUPERVISOR_UUID };
        mockStudentsService.findStudentByUserId.mockResolvedValue(mockStudent);
        mockSupervisorsService.findSupervisorById.mockResolvedValue(mockSupervisor);
        // Existing pending request
        mockRepository.findAllRequests.mockResolvedValue([
          { ...mockSupervisionRequest, request_state: RequestState.PENDING },
        ]);

        // Act & Assert
        await expect(service.createSupervisionRequest(dto, mockStudentUser)).rejects.toThrow(
          SupervisionRequestStateConflictException,
        );
      });

      it('should throw TooEarlyException if rejected request is within waiting period', async () => {
        // Arrange
        const dto = { supervisor_id: SUPERVISOR_UUID };
        mockStudentsService.findStudentByUserId.mockResolvedValue(mockStudent);
        mockSupervisorsService.findSupervisorById.mockResolvedValue(mockSupervisor);

        // Recent rejected request (within waiting period)
        const recentDate = new Date();
        recentDate.setHours(recentDate.getHours() - 12); // 12 hours ago (less than 2 days)
        mockRepository.findAllRequests.mockResolvedValue([
          {
            ...mockSupervisionRequest,
            request_state: RequestState.REJECTED,
            updated_at: recentDate,
          },
        ]);

        // Act & Assert
        await expect(service.createSupervisionRequest(dto, mockStudentUser)).rejects.toThrow(
          SupervisionRequestTooEarlyException,
        );
      });

      it('should allow creation of a new request after waiting period', async () => {
        // Arrange
        const dto = { supervisor_id: SUPERVISOR_UUID };
        mockStudentsService.findStudentByUserId.mockResolvedValue(mockStudent);
        mockSupervisorsService.findSupervisorById.mockResolvedValue(mockSupervisor);

        // Rejected request but more than 2 days ago (outside waiting period)
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 3); // 3 days ago (more than 2 days)
        mockRepository.findAllRequests.mockResolvedValue([
          {
            ...mockSupervisionRequest,
            request_state: RequestState.REJECTED,
            updated_at: oldDate,
          },
        ]);
        mockRepository.createSupervisionRequest.mockResolvedValue(mockSupervisionRequest);

        // Act
        const result = await service.createSupervisionRequest(dto, mockStudentUser);

        // Assert
        expect(result).toEqual(mockSupervisionRequest);
        expect(mockRepository.createSupervisionRequest).toHaveBeenCalledWith({
          student_id: mockStudent.id,
          supervisor_id: SUPERVISOR_UUID,
          request_state: RequestState.PENDING,
        });
      });
    });

    describe('as a supervisor', () => {
      it('should create an accepted request with an existing student', async () => {
        // Arrange
        const dto = { student_email: 'student@fhstp.ac.at' };
        mockSupervisorsService.findSupervisorByUserId.mockResolvedValue(mockSupervisor);
        mockUsersService.findUserByEmail.mockResolvedValue(mockStudentUser); // Return student user
        mockRepository.createSupervisionRequest.mockResolvedValue({
          ...mockSupervisionRequest,
          request_state: RequestState.ACCEPTED,
          studentWasCreated: false,
        });

        // Act
        const result = await service.createSupervisionRequest(dto, mockSupervisorUser);

        // Assert
        expect(result).toEqual({
          ...mockSupervisionRequest,
          request_state: RequestState.ACCEPTED,
          studentWasCreated: false,
        });
        expect(mockSupervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
          mockSupervisorUser.id,
        );
        expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith(dto.student_email);
        expect(mockRepository.createSupervisionRequest).toHaveBeenCalledWith({
          supervisor_id: mockSupervisor.id,
          student_email: dto.student_email,
          available_spots: mockSupervisor.available_spots,
          request_state: RequestState.ACCEPTED,
        });
      });

      it('should create an accepted request and create a new student', async () => {
        // Arrange
        const dto = { student_email: 'newstudent@fhstp.ac.at' };
        mockSupervisorsService.findSupervisorByUserId.mockResolvedValue(mockSupervisor);
        mockUsersService.findUserByEmail.mockResolvedValue(null); // User doesn't exist
        mockRepository.createSupervisionRequest.mockResolvedValue({
          ...mockSupervisionRequest,
          request_state: RequestState.ACCEPTED,
          studentWasCreated: true,
        });

        // Act
        const result = await service.createSupervisionRequest(dto, mockSupervisorUser);

        // Assert
        expect(result).toEqual({
          ...mockSupervisionRequest,
          request_state: RequestState.ACCEPTED,
          studentWasCreated: true,
        });
        expect(mockSupervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
          mockSupervisorUser.id,
        );
        expect(mockUsersService.findUserByEmail).toHaveBeenCalledWith(dto.student_email);
        expect(mockRepository.createSupervisionRequest).toHaveBeenCalledWith({
          supervisor_id: mockSupervisor.id,
          student_email: dto.student_email,
          available_spots: mockSupervisor.available_spots,
          request_state: RequestState.ACCEPTED,
        });
        expect(mockLoggerService.log).toHaveBeenCalled();
      });

      it('should throw MissingStudentEmailException if student_email is missing', async () => {
        // Arrange
        const dto = {};

        // Act & Assert
        await expect(service.createSupervisionRequest(dto, mockSupervisorUser)).rejects.toThrow(
          MissingStudentEmailException,
        );
      });

      it('should throw SupervisorCapacityException if no spots available', async () => {
        // Arrange
        const dto = { student_email: 'student@fhstp.ac.at' };
        mockUsersService.findUserByEmail.mockResolvedValue(mockStudentUser); // Return student user
        // Supervisor with no available spots
        mockSupervisorsService.findSupervisorByUserId.mockResolvedValue({
          ...mockSupervisor,
          available_spots: 0,
        });

        // Act & Assert
        await expect(service.createSupervisionRequest(dto, mockSupervisorUser)).rejects.toThrow(
          SupervisorCapacityException,
        );
      });

      it('should throw SelfSupervisionException if supervisor tries to supervise themselves', async () => {
        // Arrange
        const dto = { student_email: mockSupervisorUser.email }; // Same email as supervisor

        // Act & Assert
        await expect(service.createSupervisionRequest(dto, mockSupervisorUser)).rejects.toThrow(
          SelfSupervisionException,
        );
      });

      it('should throw SupervisorTargetException if trying to create request for another supervisor', async () => {
        // Arrange
        const dto = { student_email: 'anothersupervisor@fhstp.ac.at' };
        const anotherSupervisorUser = {
          ...mockSupervisorUser,
          id: ANOTHER_SUPERVISOR_USER_UUID,
          email: 'anothersupervisor@fhstp.ac.at',
        };
        mockUsersService.findUserByEmail.mockResolvedValue(anotherSupervisorUser); // Return supervisor user
        mockSupervisorsService.findSupervisorByUserId.mockResolvedValue(mockSupervisor);

        // Act & Assert
        await expect(service.createSupervisionRequest(dto, mockSupervisorUser)).rejects.toThrow(
          SupervisorTargetException,
        );
      });
    });

    it('should throw ForbiddenException if user is not a student or supervisor', async () => {
      // Arrange
      const dto = {}; // Empty dto

      // Act & Assert
      await expect(service.createSupervisionRequest(dto, mockAdminUser)) // Admin role
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllRequests', () => {
    it('should return all requests for a student', async () => {
      // Arrange
      mockStudentsService.findStudentByUserId.mockResolvedValue(mockStudent);
      mockRepository.findAllRequests.mockResolvedValue([mockSupervisionRequestWithUsers]);

      // Act
      const result = await service.findAllRequests(mockStudentUser.id, mockStudentUser.role);

      // Assert
      expect(result).toEqual([mockSupervisionRequestWithUsers]);
      expect(mockStudentsService.findStudentByUserId).toHaveBeenCalledWith(mockStudentUser.id);
      expect(mockRepository.findAllRequests).toHaveBeenCalledWith({
        student_id: mockStudent.id,
        request_state: undefined,
      });
    });

    it('should return all requests for a supervisor', async () => {
      // Arrange
      mockSupervisorsService.findSupervisorByUserId.mockResolvedValue(mockSupervisor);
      mockRepository.findAllRequests.mockResolvedValue([mockSupervisionRequestWithUsers]);

      // Act
      const result = await service.findAllRequests(mockSupervisorUser.id, mockSupervisorUser.role);

      // Assert
      expect(result).toEqual([mockSupervisionRequestWithUsers]);
      expect(mockSupervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
        mockSupervisorUser.id,
      );
      expect(mockRepository.findAllRequests).toHaveBeenCalledWith({
        supervisor_id: mockSupervisor.id,
        request_state: undefined,
      });
    });

    it('should return all requests for an admin', async () => {
      // Arrange
      mockRepository.findAllRequests.mockResolvedValue([mockSupervisionRequestWithUsers]);

      // Act
      const result = await service.findAllRequests(mockAdminUser.id, mockAdminUser.role);

      // Assert
      expect(result).toEqual([mockSupervisionRequestWithUsers]);
      expect(mockRepository.findAllRequests).toHaveBeenCalledWith({
        request_state: undefined,
      });
    });

    it('should filter requests by state when specified', async () => {
      // Arrange
      mockStudentsService.findStudentByUserId.mockResolvedValue(mockStudent);
      mockRepository.findAllRequests.mockResolvedValue([mockSupervisionRequestWithUsers]);

      // Act
      const result = await service.findAllRequests(
        mockStudentUser.id,
        mockStudentUser.role,
        RequestState.PENDING,
      );

      // Assert
      expect(result).toEqual([mockSupervisionRequestWithUsers]);
      expect(mockStudentsService.findStudentByUserId).toHaveBeenCalledWith(mockStudentUser.id);
      expect(mockRepository.findAllRequests).toHaveBeenCalledWith({
        student_id: mockStudent.id,
        request_state: RequestState.PENDING,
      });
    });
  });

  describe('findRequestById', () => {
    it('should return a request by ID for student owner', async () => {
      // Arrange
      mockRepository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      mockStudentsService.findStudentByUserId.mockResolvedValue(mockStudent);

      // Act
      const result = await service.findRequestById(REQUEST_UUID, mockStudentUser);

      // Assert
      expect(result).toEqual(mockSupervisionRequestWithUsers);
      expect(mockRepository.findRequestById).toHaveBeenCalledWith(REQUEST_UUID);
      expect(mockStudentsService.findStudentByUserId).toHaveBeenCalledWith(mockStudentUser.id);
    });

    it('should return a request by ID for supervisor owner', async () => {
      // Arrange
      mockRepository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      mockSupervisorsService.findSupervisorByUserId.mockResolvedValue(mockSupervisor);

      // Act
      const result = await service.findRequestById(REQUEST_UUID, mockSupervisorUser);

      // Assert
      expect(result).toEqual(mockSupervisionRequestWithUsers);
      expect(mockRepository.findRequestById).toHaveBeenCalledWith(REQUEST_UUID);
      expect(mockSupervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
        mockSupervisorUser.id,
      );
    });

    it('should throw NotFoundException if request not found', async () => {
      // Arrange
      mockRepository.findRequestById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findRequestById(REQUEST_UUID, mockStudentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if student tries to access another student's request", async () => {
      // Arrange
      mockRepository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      // Student profile with different ID than the request's student_id
      mockStudentsService.findStudentByUserId.mockResolvedValue({
        ...mockStudent,
        id: 'different-student-id',
      });

      // Act & Assert
      await expect(service.findRequestById(REQUEST_UUID, mockStudentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateRequestState', () => {
    it('should allow a student to withdraw their request', async () => {
      // Arrange
      mockRepository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      mockStudentsService.findStudentByUserId.mockResolvedValue(mockStudent);

      const updatedRequest = {
        ...mockSupervisionRequest,
        request_state: RequestState.WITHDRAWN,
      };
      mockRepository.updateRequestState.mockResolvedValue(updatedRequest);

      // Act
      const result = await service.updateRequestState(
        REQUEST_UUID,
        RequestState.WITHDRAWN,
        mockStudentUser,
      );

      // Assert
      expect(result).toEqual(updatedRequest);
      expect(mockRepository.findRequestById).toHaveBeenCalledWith(REQUEST_UUID);
      expect(mockStudentsService.findStudentByUserId).toHaveBeenCalledWith(mockStudentUser.id);
      expect(mockRepository.updateRequestState).toHaveBeenCalledWith({
        id: REQUEST_UUID,
        newState: RequestState.WITHDRAWN,
        currentState: mockSupervisionRequest.request_state,
        supervisor_id: mockSupervisionRequest.supervisor_id,
        available_spots: 0, // Not used for non-capacity affecting changes
        total_spots: 0, // Not used for non-capacity affecting changes
      });
    });

    it('should allow a supervisor to accept a request', async () => {
      // Arrange
      mockRepository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      mockSupervisorsService.findSupervisorByUserId.mockResolvedValue(mockSupervisor);
      mockSupervisorsService.findSupervisorById.mockResolvedValue(mockSupervisor);

      const updatedRequest = {
        ...mockSupervisionRequest,
        request_state: RequestState.ACCEPTED,
      };
      mockRepository.updateRequestState.mockResolvedValue(updatedRequest);

      // Act
      const result = await service.updateRequestState(
        REQUEST_UUID,
        RequestState.ACCEPTED,
        mockSupervisorUser,
      );

      // Assert
      expect(result).toEqual(updatedRequest);
      expect(mockRepository.findRequestById).toHaveBeenCalledWith(REQUEST_UUID);
      expect(mockSupervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
        mockSupervisorUser.id,
      );
      expect(mockSupervisorsService.findSupervisorById).toHaveBeenCalledWith(
        mockSupervisionRequest.supervisor_id,
      );
      expect(mockRepository.updateRequestState).toHaveBeenCalledWith({
        id: REQUEST_UUID,
        newState: RequestState.ACCEPTED,
        currentState: mockSupervisionRequest.request_state,
        supervisor_id: mockSupervisionRequest.supervisor_id,
        available_spots: mockSupervisor.available_spots,
        total_spots: mockSupervisor.total_spots,
      });
    });

    it('should throw SupervisorCapacityException if accepting with no available spots', async () => {
      // Arrange
      mockRepository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      mockSupervisorsService.findSupervisorByUserId.mockResolvedValue(mockSupervisor);
      // Supervisor with no available spots
      mockSupervisorsService.findSupervisorById.mockResolvedValue({
        ...mockSupervisor,
        available_spots: 0,
      });

      // Act & Assert
      await expect(
        service.updateRequestState(REQUEST_UUID, RequestState.ACCEPTED, mockSupervisorUser),
      ).rejects.toThrow(SupervisorCapacityException);
    });

    it('should throw InvalidRequestStateTransitionException if student tries to accept', async () => {
      // Arrange
      mockRepository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      mockStudentsService.findStudentByUserId.mockResolvedValue(mockStudent);

      // Act & Assert
      await expect(
        service.updateRequestState(REQUEST_UUID, RequestState.ACCEPTED, mockStudentUser),
      ).rejects.toThrow(InvalidRequestStateTransitionException);
    });

    it('should throw NotFoundException if request not found', async () => {
      // Arrange
      mockRepository.findRequestById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateRequestState(REQUEST_UUID, RequestState.WITHDRAWN, mockStudentUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('countPendingRequestsForUser', () => {
    it('should count pending requests for a student', async () => {
      // Arrange
      const expectedCount = 3;
      mockUsersService.findUserById.mockResolvedValue(mockStudentUser);
      mockStudentsService.findStudentByUserId.mockResolvedValue(mockStudent);
      mockRepository.countRequests.mockResolvedValue(expectedCount);

      // Act
      const result = await service.countPendingRequestsForUser(mockStudentUser.id);

      // Assert
      expect(result).toEqual({ pending_count: expectedCount });
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(mockStudentUser.id);
      expect(mockStudentsService.findStudentByUserId).toHaveBeenCalledWith(mockStudentUser.id);
      expect(mockRepository.countRequests).toHaveBeenCalledWith({
        student_id: mockStudent.id,
        request_state: RequestState.PENDING,
      });
    });

    it('should count pending requests for a supervisor', async () => {
      // Arrange
      const expectedCount = 5;
      mockUsersService.findUserById.mockResolvedValue(mockSupervisorUser);
      mockSupervisorsService.findSupervisorByUserId.mockResolvedValue(mockSupervisor);
      mockRepository.countRequests.mockResolvedValue(expectedCount);

      // Act
      const result = await service.countPendingRequestsForUser(mockSupervisorUser.id);

      // Assert
      expect(result).toEqual({ pending_count: expectedCount });
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(mockSupervisorUser.id);
      expect(mockSupervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
        mockSupervisorUser.id,
      );
      expect(mockRepository.countRequests).toHaveBeenCalledWith({
        supervisor_id: mockSupervisor.id,
        request_state: RequestState.PENDING,
      });
    });

    it('should return 0 for a student with no pending requests', async () => {
      // Arrange
      mockUsersService.findUserById.mockResolvedValue(mockStudentUser);
      mockStudentsService.findStudentByUserId.mockResolvedValue(mockStudent);
      mockRepository.countRequests.mockResolvedValue(0);

      // Act
      const result = await service.countPendingRequestsForUser(mockStudentUser.id);

      // Assert
      expect(result).toEqual({ pending_count: 0 });
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(mockStudentUser.id);
      expect(mockStudentsService.findStudentByUserId).toHaveBeenCalledWith(mockStudentUser.id);
      expect(mockRepository.countRequests).toHaveBeenCalledWith({
        student_id: mockStudent.id,
        request_state: RequestState.PENDING,
      });
    });

    it('should return 0 for a supervisor with no pending requests', async () => {
      // Arrange
      mockUsersService.findUserById.mockResolvedValue(mockSupervisorUser);
      mockSupervisorsService.findSupervisorByUserId.mockResolvedValue(mockSupervisor);
      mockRepository.countRequests.mockResolvedValue(0);

      // Act
      const result = await service.countPendingRequestsForUser(mockSupervisorUser.id);

      // Assert
      expect(result).toEqual({ pending_count: 0 });
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(mockSupervisorUser.id);
      expect(mockSupervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
        mockSupervisorUser.id,
      );
      expect(mockRepository.countRequests).toHaveBeenCalledWith({
        supervisor_id: mockSupervisor.id,
        request_state: RequestState.PENDING,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const nonExistentUserId = 'non-existent-user-id';
      mockUsersService.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.countPendingRequestsForUser(nonExistentUserId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(nonExistentUserId);
      // Should not call other services if user doesn't exist
      expect(mockStudentsService.findStudentByUserId).not.toHaveBeenCalled();
      expect(mockSupervisorsService.findSupervisorByUserId).not.toHaveBeenCalled();
      expect(mockRepository.countRequests).not.toHaveBeenCalled();
    });

    it('should throw AdminSupervisionRequestException if user is an admin', async () => {
      // Arrange
      mockUsersService.findUserById.mockResolvedValue(mockAdminUser);

      // Act & Assert
      await expect(service.countPendingRequestsForUser(mockAdminUser.id)).rejects.toThrow(
        AdminSupervisionRequestException,
      );
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(mockAdminUser.id);
      // Should not call other services if user is admin
      expect(mockStudentsService.findStudentByUserId).not.toHaveBeenCalled();
      expect(mockSupervisorsService.findSupervisorByUserId).not.toHaveBeenCalled();
      expect(mockRepository.countRequests).not.toHaveBeenCalled();
    });

    it('should handle errors from repository count method', async () => {
      // Arrange
      mockUsersService.findUserById.mockResolvedValue(mockStudentUser);
      mockStudentsService.findStudentByUserId.mockResolvedValue(mockStudent);
      const repositoryError = new Error('Database connection error');
      mockRepository.countRequests.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(service.countPendingRequestsForUser(mockStudentUser.id)).rejects.toThrow(
        'Database connection error',
      );
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(mockStudentUser.id);
      expect(mockStudentsService.findStudentByUserId).toHaveBeenCalledWith(mockStudentUser.id);
      expect(mockRepository.countRequests).toHaveBeenCalledWith({
        student_id: mockStudent.id,
        request_state: RequestState.PENDING,
      });
    });

    it('should handle errors from students service', async () => {
      // Arrange
      mockUsersService.findUserById.mockResolvedValue(mockStudentUser);
      const studentsServiceError = new NotFoundException('Student profile not found');
      mockStudentsService.findStudentByUserId.mockRejectedValue(studentsServiceError);

      // Act & Assert
      await expect(service.countPendingRequestsForUser(mockStudentUser.id)).rejects.toThrow(
        'Student profile not found',
      );
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(mockStudentUser.id);
      expect(mockStudentsService.findStudentByUserId).toHaveBeenCalledWith(mockStudentUser.id);
      expect(mockRepository.countRequests).not.toHaveBeenCalled();
    });

    it('should handle errors from supervisors service', async () => {
      // Arrange
      mockUsersService.findUserById.mockResolvedValue(mockSupervisorUser);
      const supervisorsServiceError = new NotFoundException('Supervisor profile not found');
      mockSupervisorsService.findSupervisorByUserId.mockRejectedValue(supervisorsServiceError);

      // Act & Assert
      await expect(service.countPendingRequestsForUser(mockSupervisorUser.id)).rejects.toThrow(
        'Supervisor profile not found',
      );
      expect(mockUsersService.findUserById).toHaveBeenCalledWith(mockSupervisorUser.id);
      expect(mockSupervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
        mockSupervisorUser.id,
      );
      expect(mockRepository.countRequests).not.toHaveBeenCalled();
    });
  });
});
