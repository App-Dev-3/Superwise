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
import { StudentAlreadyHasAnAcceptedSupervisionRequestException } from '../../../common/exceptions/custom-exceptions/multiple-supervision-acceptances.exception';

describe('SupervisionRequestsService', () => {
  let service: SupervisionRequestsService;

  // Test UUIDs
  const TEST_IDS = {
    REQUEST_UUID: '123e4567-e89b-12d3-a456-426614174000',
    STUDENT_UUID: '123e4567-e89b-12d3-a456-426614174001',
    SUPERVISOR_UUID: '123e4567-e89b-12d3-a456-426614174002',
    STUDENT_USER_UUID: '123e4567-e89b-12d3-a456-426614174003',
    SUPERVISOR_USER_UUID: '123e4567-e89b-12d3-a456-426614174004',
    ADMIN_USER_UUID: '123e4567-e89b-12d3-a456-426614174005',
    ANOTHER_SUPERVISOR_USER_UUID: '123e4567-e89b-12d3-a456-426614174006',
    STUDENT_CLERK_ID: 'user_2NUj8tGhSFhTLD9sdP0q4P7VoJM',
    SUPERVISOR_CLERK_ID: 'user_1AUj8tGhSFhTLD9sdP0q4P7VoXY',
    ADMIN_CLERK_ID: 'user_3CUj8tGhSFhTLD9sdP0q4P7VoZW',
  };

  // Factory function for creating mock services
  const createMockServices = () => ({
    repository: {
      findAllRequests: jest.fn(),
      findRequestById: jest.fn(),
      createSupervisionRequest: jest.fn(),
      updateRequestState: jest.fn(),
      countRequests: jest.fn(),
      hasAcceptedSupervision: jest.fn(),
      withdrawCompetingRequests: jest.fn(),
    },
    studentsService: {
      findStudentByUserId: jest.fn(),
      findStudentById: jest.fn(),
    },
    supervisorsService: {
      findSupervisorByUserId: jest.fn(),
      findSupervisorById: jest.fn(),
    },
    usersService: {
      findUserById: jest.fn(),
      findUserByEmail: jest.fn(),
      findUserByEmailOrNull: jest.fn(),
    },
    loggerService: {
      log: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
    appConfigService: {
      supervisionRequestCooldownDays: 2,
      isDevelopment: true,
      isProduction: false,
      isTest: true,
      nodeEnv: 'test',
      port: 3000,
      frontendHost: 'http://localhost:3000',
      allowedEmailDomains: ['fhstp.ac.at'],
    },
  });

  // Factory function for creating test data
  const createTestData = () => ({
    mockStudentUser: {
      id: TEST_IDS.STUDENT_USER_UUID,
      email: 'student@fhstp.ac.at',
      first_name: 'Student',
      last_name: 'User',
      role: Role.STUDENT,
      profile_image: 'https://superwise.at/images/student-profile.jpg',
      is_registered: true,
      is_deleted: false,
      clerk_id: TEST_IDS.STUDENT_CLERK_ID,
      created_at: new Date('2023-01-15T10:30:00Z'),
      updated_at: new Date('2023-01-15T10:30:00Z'),
    } as User,

    mockSupervisorUser: {
      id: TEST_IDS.SUPERVISOR_USER_UUID,
      email: 'supervisor@fhstp.ac.at',
      first_name: 'Supervisor',
      last_name: 'User',
      role: Role.SUPERVISOR,
      profile_image: 'https://superwise.at/images/supervisor-profile.jpg',
      is_registered: true,
      is_deleted: false,
      clerk_id: TEST_IDS.SUPERVISOR_CLERK_ID,
      created_at: new Date('2023-01-15T10:30:00Z'),
      updated_at: new Date('2023-01-15T10:30:00Z'),
    } as User,

    mockAdminUser: {
      id: TEST_IDS.ADMIN_USER_UUID,
      email: 'admin@fhstp.ac.at',
      first_name: 'Admin',
      last_name: 'User',
      role: Role.ADMIN,
      profile_image: 'https://superwise.at/images/admin-profile.jpg',
      is_registered: true,
      is_deleted: false,
      clerk_id: TEST_IDS.ADMIN_CLERK_ID,
      created_at: new Date('2023-01-15T10:30:00Z'),
      updated_at: new Date('2023-01-15T10:30:00Z'),
    } as User,

    mockStudent: {
      id: TEST_IDS.STUDENT_UUID,
      user_id: TEST_IDS.STUDENT_USER_UUID,
      thesis_description: null,
      created_at: new Date(),
      updated_at: new Date(),
    },

    mockSupervisor: {
      id: TEST_IDS.SUPERVISOR_UUID,
      user_id: TEST_IDS.SUPERVISOR_USER_UUID,
      bio: 'Experienced supervisor',
      available_spots: 5,
      total_spots: 10,
      created_at: new Date(),
      updated_at: new Date(),
    },

    mockSupervisionRequest: {
      id: TEST_IDS.REQUEST_UUID,
      student_id: TEST_IDS.STUDENT_UUID,
      supervisor_id: TEST_IDS.SUPERVISOR_UUID,
      request_state: RequestState.PENDING,
      created_at: new Date('2023-01-15T10:30:00Z'),
      updated_at: new Date('2023-01-15T10:30:00Z'),
    },
  });

  // Create mock supervision request with users
  const createMockSupervisionRequestWithUsers = (testData: ReturnType<typeof createTestData>) => ({
    ...testData.mockSupervisionRequest,
    student: {
      id: TEST_IDS.STUDENT_UUID,
      user_id: TEST_IDS.STUDENT_USER_UUID,
      user: {
        first_name: 'Student',
        last_name: 'User',
        email: 'student@fhstp.ac.at',
        profile_image: null,
      },
    },
    supervisor: {
      id: TEST_IDS.SUPERVISOR_UUID,
      user_id: TEST_IDS.SUPERVISOR_USER_UUID,
      user: {
        first_name: 'Supervisor',
        last_name: 'User',
        email: 'supervisor@fhstp.ac.at',
        profile_image: null,
      },
    },
  });

  // Function to reset all mocks
  const resetAllMocks = (mocks: ReturnType<typeof createMockServices>) => {
    Object.values(mocks.repository).forEach(mock => mock.mockReset());
    Object.values(mocks.studentsService).forEach(mock => mock.mockReset());
    Object.values(mocks.supervisorsService).forEach(mock => mock.mockReset());
    Object.values(mocks.usersService).forEach(mock => mock.mockReset());
    Object.values(mocks.loggerService).forEach(mock => mock.mockReset());
  };

  // Create instances for the test suite
  const mocks = createMockServices();
  const testData = createTestData();
  const mockSupervisionRequestWithUsers = createMockSupervisionRequestWithUsers(testData);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupervisionRequestsService,
        { provide: SupervisionRequestsRepository, useValue: mocks.repository },
        { provide: StudentsService, useValue: mocks.studentsService },
        { provide: SupervisorsService, useValue: mocks.supervisorsService },
        { provide: UsersService, useValue: mocks.usersService },
        { provide: WinstonLoggerService, useValue: mocks.loggerService },
        { provide: AppConfigService, useValue: mocks.appConfigService },
      ],
    }).compile();

    service = module.get<SupervisionRequestsService>(SupervisionRequestsService);
    resetAllMocks(mocks);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSupervisionRequest', () => {
    describe('as a student', () => {
      it('should create a pending request to a supervisor', async () => {
        // Arrange
        const dto = { supervisor_id: TEST_IDS.SUPERVISOR_UUID };
        mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);
        mocks.supervisorsService.findSupervisorById.mockResolvedValue(testData.mockSupervisor);
        mocks.repository.findAllRequests.mockResolvedValue([]); // No existing requests
        mocks.repository.createSupervisionRequest.mockResolvedValue(
          testData.mockSupervisionRequest,
        );

        // Act
        const result = await service.createSupervisionRequest(dto, testData.mockStudentUser);

        // Assert
        expect(result).toEqual(testData.mockSupervisionRequest);
        expect(mocks.studentsService.findStudentByUserId).toHaveBeenCalledWith(
          testData.mockStudentUser.id,
        );
        expect(mocks.supervisorsService.findSupervisorById).toHaveBeenCalledWith(
          TEST_IDS.SUPERVISOR_UUID,
        );
        expect(mocks.repository.findAllRequests).toHaveBeenCalledWith({
          student_id: testData.mockStudent.id,
          supervisor_id: TEST_IDS.SUPERVISOR_UUID,
        });
        expect(mocks.repository.createSupervisionRequest).toHaveBeenCalledWith({
          student_id: testData.mockStudent.id,
          supervisor_id: TEST_IDS.SUPERVISOR_UUID,
          request_state: RequestState.PENDING,
        });
      });

      it('should throw BadRequestException if supervisor_id is missing', async () => {
        // Arrange
        const dto = {};

        // Act & Assert
        await expect(
          service.createSupervisionRequest(dto, testData.mockStudentUser),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw StateConflictException if a pending request already exists', async () => {
        // Arrange
        const dto = { supervisor_id: TEST_IDS.SUPERVISOR_UUID };
        mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);
        mocks.supervisorsService.findSupervisorById.mockResolvedValue(testData.mockSupervisor);
        // Existing pending request
        mocks.repository.findAllRequests.mockResolvedValue([
          { ...testData.mockSupervisionRequest, request_state: RequestState.PENDING },
        ]);

        // Act & Assert
        await expect(
          service.createSupervisionRequest(dto, testData.mockStudentUser),
        ).rejects.toThrow(SupervisionRequestStateConflictException);
      });

      it('should throw TooEarlyException if rejected request is within waiting period', async () => {
        // Arrange
        const dto = { supervisor_id: TEST_IDS.SUPERVISOR_UUID };
        mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);
        mocks.supervisorsService.findSupervisorById.mockResolvedValue(testData.mockSupervisor);

        // Recent rejected request (within waiting period)
        const recentDate = new Date();
        recentDate.setHours(recentDate.getHours() - 12); // 12 hours ago (less than 2 days)
        mocks.repository.findAllRequests.mockResolvedValue([
          {
            ...testData.mockSupervisionRequest,
            request_state: RequestState.REJECTED,
            updated_at: recentDate,
          },
        ]);

        // Act & Assert
        await expect(
          service.createSupervisionRequest(dto, testData.mockStudentUser),
        ).rejects.toThrow(SupervisionRequestTooEarlyException);
      });

      it('should allow creation of a new request after waiting period', async () => {
        // Arrange
        const dto = { supervisor_id: TEST_IDS.SUPERVISOR_UUID };
        mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);
        mocks.supervisorsService.findSupervisorById.mockResolvedValue(testData.mockSupervisor);

        // Rejected request but more than 2 days ago (outside waiting period)
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 3); // 3 days ago (more than 2 days)
        mocks.repository.findAllRequests.mockResolvedValue([
          {
            ...testData.mockSupervisionRequest,
            request_state: RequestState.REJECTED,
            updated_at: oldDate,
          },
        ]);
        mocks.repository.createSupervisionRequest.mockResolvedValue(
          testData.mockSupervisionRequest,
        );

        // Act
        const result = await service.createSupervisionRequest(dto, testData.mockStudentUser);

        // Assert
        expect(result).toEqual(testData.mockSupervisionRequest);
        expect(mocks.repository.createSupervisionRequest).toHaveBeenCalledWith({
          student_id: testData.mockStudent.id,
          supervisor_id: TEST_IDS.SUPERVISOR_UUID,
          request_state: RequestState.PENDING,
        });
      });
    });

    describe('as a supervisor', () => {
      it('should create an accepted request with an existing student', async () => {
        // Arrange
        const dto = { student_email: testData.mockStudentUser.email };
        mocks.supervisorsService.findSupervisorByUserId.mockResolvedValue(testData.mockSupervisor);

        mocks.usersService.findUserByEmailOrNull.mockResolvedValue(testData.mockStudentUser); // Return student user
        mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);
        mocks.repository.hasAcceptedSupervision.mockResolvedValue(false);
        mocks.repository.createSupervisionRequest.mockResolvedValue({
          ...testData.mockSupervisionRequest,
          request_state: RequestState.ACCEPTED,
          studentWasCreated: false,
        });

        // Act
        const result = await service.createSupervisionRequest(dto, testData.mockSupervisorUser);

        // Assert
        expect(result).toEqual({
          ...testData.mockSupervisionRequest,
          request_state: RequestState.ACCEPTED,
          studentWasCreated: false,
        });
        expect(mocks.repository.hasAcceptedSupervision).toHaveBeenCalledWith(
          testData.mockStudent.id,
        );

        expect(mocks.supervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
          testData.mockSupervisorUser.id,
        );
        expect(mocks.usersService.findUserByEmailOrNull).toHaveBeenCalledWith(dto.student_email);
        expect(mocks.repository.createSupervisionRequest).toHaveBeenCalledWith({
          supervisor_id: testData.mockSupervisor.id,
          student_email: dto.student_email,
          available_spots: testData.mockSupervisor.available_spots,
          request_state: RequestState.ACCEPTED,
        });
      });

      it('should create an accepted request and create a new student', async () => {
        // Arrange
        const dto = { student_email: 'newstudent@fhstp.ac.at' };
        mocks.supervisorsService.findSupervisorByUserId.mockResolvedValue(testData.mockSupervisor);
        mocks.usersService.findUserByEmailOrNull.mockResolvedValue(null); // User doesn't exist
        mocks.repository.createSupervisionRequest.mockResolvedValue({
          ...testData.mockSupervisionRequest,
          request_state: RequestState.ACCEPTED,
          studentWasCreated: true,
        });

        // Act
        const result = await service.createSupervisionRequest(dto, testData.mockSupervisorUser);

        // Assert
        expect(result).toEqual({
          ...testData.mockSupervisionRequest,
          request_state: RequestState.ACCEPTED,
          studentWasCreated: true,
        });
        expect(mocks.supervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
          testData.mockSupervisorUser.id,
        );
        expect(mocks.usersService.findUserByEmailOrNull).toHaveBeenCalledWith(dto.student_email);
        expect(mocks.repository.createSupervisionRequest).toHaveBeenCalledWith({
          supervisor_id: testData.mockSupervisor.id,
          student_email: dto.student_email,
          available_spots: testData.mockSupervisor.available_spots,
          request_state: RequestState.ACCEPTED,
        });
        expect(mocks.loggerService.log).toHaveBeenCalled();
      });

      it('should throw StudentAlreadyHasAnAcceptedSupervisionRequestException if student already has accepted supervision', async () => {
        // Arrange
        const dto = { student_email: 'existingstudent@fhstp.ac.at' };
        const existingUser = { ...testData.mockStudentUser, email: dto.student_email };
        mocks.supervisorsService.findSupervisorByUserId.mockResolvedValue(testData.mockSupervisor);
        mocks.usersService.findUserByEmailOrNull.mockResolvedValue(existingUser);
        mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);
        mocks.repository.hasAcceptedSupervision.mockResolvedValue(true); // Already has accepted

        // Act & Assert
        await expect(
          service.createSupervisionRequest(dto, testData.mockSupervisorUser),
        ).rejects.toThrow(StudentAlreadyHasAnAcceptedSupervisionRequestException);
        expect(mocks.repository.createSupervisionRequest).not.toHaveBeenCalled();
      });

      it('should throw MissingStudentEmailException if student_email is missing', async () => {
        // Arrange
        const dto = {};

        // Act & Assert
        await expect(
          service.createSupervisionRequest(dto, testData.mockSupervisorUser),
        ).rejects.toThrow(MissingStudentEmailException);
      });

      it('should throw SupervisorCapacityException if no spots available', async () => {
        // Arrange
        const dto = { student_email: 'student@fhstp.ac.at' };
        mocks.usersService.findUserByEmailOrNull.mockResolvedValue(testData.mockStudentUser); // Return student user
        mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);
        mocks.repository.hasAcceptedSupervision.mockResolvedValue(false);
        // Supervisor with no available spots
        mocks.supervisorsService.findSupervisorByUserId.mockResolvedValue({
          ...testData.mockSupervisor,
          available_spots: 0,
        });

        // Act & Assert
        await expect(
          service.createSupervisionRequest(dto, testData.mockSupervisorUser),
        ).rejects.toThrow(SupervisorCapacityException);
      });

      it('should throw SelfSupervisionException if supervisor tries to supervise themselves', async () => {
        // Arrange
        const dto = { student_email: testData.mockSupervisorUser.email }; // Same email as supervisor

        // Act & Assert
        await expect(
          service.createSupervisionRequest(dto, testData.mockSupervisorUser),
        ).rejects.toThrow(SelfSupervisionException);
      });

      it('should throw SupervisorTargetException if trying to create request for another supervisor', async () => {
        // Arrange
        const dto = { student_email: 'anothersupervisor@fhstp.ac.at' };
        const anotherSupervisorUser = {
          ...testData.mockSupervisorUser,
          id: TEST_IDS.ANOTHER_SUPERVISOR_USER_UUID,
          email: 'anothersupervisor@fhstp.ac.at',
        };
        mocks.usersService.findUserByEmailOrNull.mockResolvedValue(anotherSupervisorUser); // Return supervisor user
        mocks.supervisorsService.findSupervisorByUserId.mockResolvedValue(testData.mockSupervisor);

        // Act & Assert
        await expect(
          service.createSupervisionRequest(dto, testData.mockSupervisorUser),
        ).rejects.toThrow(SupervisorTargetException);
      });

      it('should handle race condition properly when accepting a supervision request concurrently', async () => {
        // Arrange
        const dto = { student_email: 'newstudent@fhstp.ac.at' };
        mocks.supervisorsService.findSupervisorByUserId.mockResolvedValue(testData.mockSupervisor);
        mocks.usersService.findUserByEmailOrNull.mockResolvedValue(null); // User doesn't exist

        // Simulate the database constraint handling race condition:
        // First call succeeds, second call would fail with unique constraint violation
        mocks.repository.createSupervisionRequest
          .mockResolvedValueOnce({
            ...testData.mockSupervisionRequest,
            request_state: RequestState.ACCEPTED,
            studentWasCreated: true,
          })
          .mockRejectedValueOnce({
            message:
              'Unique constraint failed on the constraint: `unique_student_accepted_request`',
            code: 'P2002',
          });

        // Act - Simulate two concurrent calls
        const result1 = service.createSupervisionRequest(dto, testData.mockSupervisorUser);
        const result2 = service.createSupervisionRequest(dto, testData.mockSupervisorUser);

        // Assert - First call succeeds
        await expect(result1).resolves.toEqual({
          ...testData.mockSupervisionRequest,
          request_state: RequestState.ACCEPTED,
          studentWasCreated: true,
        });

        // Second call should fail due to the unique constraint (handled by Prisma)
        await expect(result2).rejects.toMatchObject({
          message: 'Unique constraint failed on the constraint: `unique_student_accepted_request`',
          code: 'P2002',
        });

        // Verify both calls were made to the repository (race condition scenario)
        expect(mocks.repository.createSupervisionRequest).toHaveBeenCalledTimes(2);
      });
    });

    it('should throw ForbiddenException if user is not a student or supervisor', async () => {
      // Arrange
      const dto = {}; // Empty dto

      // Act & Assert
      await expect(service.createSupervisionRequest(dto, testData.mockAdminUser)) // Admin role
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllRequests', () => {
    it('should return all requests for a student', async () => {
      // Arrange
      mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);
      mocks.repository.findAllRequests.mockResolvedValue([mockSupervisionRequestWithUsers]);

      // Act
      const result = await service.findAllRequests(
        testData.mockStudentUser.id,
        testData.mockStudentUser.role,
      );

      // Assert
      expect(result).toEqual([mockSupervisionRequestWithUsers]);
      expect(mocks.studentsService.findStudentByUserId).toHaveBeenCalledWith(
        testData.mockStudentUser.id,
      );
      expect(mocks.repository.findAllRequests).toHaveBeenCalledWith({
        student_id: testData.mockStudent.id,
        request_state: undefined,
      });
    });

    it('should return all requests for a supervisor', async () => {
      // Arrange
      mocks.supervisorsService.findSupervisorByUserId.mockResolvedValue(testData.mockSupervisor);
      mocks.repository.findAllRequests.mockResolvedValue([mockSupervisionRequestWithUsers]);

      // Act
      const result = await service.findAllRequests(
        testData.mockSupervisorUser.id,
        testData.mockSupervisorUser.role,
      );

      // Assert
      expect(result).toEqual([mockSupervisionRequestWithUsers]);
      expect(mocks.supervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
        testData.mockSupervisorUser.id,
      );
      expect(mocks.repository.findAllRequests).toHaveBeenCalledWith({
        supervisor_id: testData.mockSupervisor.id,
        request_state: undefined,
      });
    });

    it('should return all requests for an admin', async () => {
      // Arrange
      mocks.repository.findAllRequests.mockResolvedValue([mockSupervisionRequestWithUsers]);

      // Act
      const result = await service.findAllRequests(
        testData.mockAdminUser.id,
        testData.mockAdminUser.role,
      );

      // Assert
      expect(result).toEqual([mockSupervisionRequestWithUsers]);
      expect(mocks.repository.findAllRequests).toHaveBeenCalledWith({
        request_state: undefined,
      });
    });

    it('should filter requests by state when specified', async () => {
      // Arrange
      mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);
      mocks.repository.findAllRequests.mockResolvedValue([mockSupervisionRequestWithUsers]);

      // Act
      const result = await service.findAllRequests(
        testData.mockStudentUser.id,
        testData.mockStudentUser.role,
        RequestState.PENDING,
      );

      // Assert
      expect(result).toEqual([mockSupervisionRequestWithUsers]);
      expect(mocks.studentsService.findStudentByUserId).toHaveBeenCalledWith(
        testData.mockStudentUser.id,
      );
      expect(mocks.repository.findAllRequests).toHaveBeenCalledWith({
        student_id: testData.mockStudent.id,
        request_state: RequestState.PENDING,
      });
    });
  });

  describe('findRequestById', () => {
    it('should return a request by ID for student owner', async () => {
      // Arrange
      mocks.repository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);

      // Act
      const result = await service.findRequestById(TEST_IDS.REQUEST_UUID, testData.mockStudentUser);

      // Assert
      expect(result).toEqual(mockSupervisionRequestWithUsers);
      expect(mocks.repository.findRequestById).toHaveBeenCalledWith(TEST_IDS.REQUEST_UUID);
      expect(mocks.studentsService.findStudentByUserId).toHaveBeenCalledWith(
        testData.mockStudentUser.id,
      );
    });

    it('should return a request by ID for supervisor owner', async () => {
      // Arrange
      mocks.repository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      mocks.supervisorsService.findSupervisorByUserId.mockResolvedValue(testData.mockSupervisor);

      // Act
      const result = await service.findRequestById(
        TEST_IDS.REQUEST_UUID,
        testData.mockSupervisorUser,
      );

      // Assert
      expect(result).toEqual(mockSupervisionRequestWithUsers);
      expect(mocks.repository.findRequestById).toHaveBeenCalledWith(TEST_IDS.REQUEST_UUID);
      expect(mocks.supervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
        testData.mockSupervisorUser.id,
      );
    });

    it('should throw NotFoundException if request not found', async () => {
      // Arrange
      mocks.repository.findRequestById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findRequestById(TEST_IDS.REQUEST_UUID, testData.mockStudentUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if student tries to access another student's request", async () => {
      // Arrange
      mocks.repository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      // Student profile with different ID than the request's student_id
      mocks.studentsService.findStudentByUserId.mockResolvedValue({
        ...testData.mockStudent,
        id: 'different-student-id',
      });

      // Act & Assert
      await expect(
        service.findRequestById(TEST_IDS.REQUEST_UUID, testData.mockStudentUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateRequestState', () => {
    it('should allow a student to withdraw their request', async () => {
      // Arrange
      mocks.repository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);

      mocks.repository.hasAcceptedSupervision.mockResolvedValue(false);

      const updatedRequest = {
        ...testData.mockSupervisionRequest,
        request_state: RequestState.WITHDRAWN,
      };
      mocks.repository.updateRequestState.mockResolvedValue(updatedRequest);

      // Act
      const result = await service.updateRequestState(
        TEST_IDS.REQUEST_UUID,
        RequestState.WITHDRAWN,
        testData.mockStudentUser,
      );

      // Assert
      expect(result).toEqual(updatedRequest);
      expect(mocks.repository.findRequestById).toHaveBeenCalledWith(TEST_IDS.REQUEST_UUID);
      expect(mocks.studentsService.findStudentByUserId).toHaveBeenCalledWith(
        testData.mockStudentUser.id,
      );
      expect(mocks.repository.updateRequestState).toHaveBeenCalledWith({
        id: TEST_IDS.REQUEST_UUID,
        newState: RequestState.WITHDRAWN,
        currentState: testData.mockSupervisionRequest.request_state,
        supervisor_id: testData.mockSupervisionRequest.supervisor_id,
        available_spots: 0,
        total_spots: 0,
      });
    });

    it('should allow a supervisor to accept a request', async () => {
      // Arrange
      mocks.repository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      mocks.supervisorsService.findSupervisorByUserId.mockResolvedValue(testData.mockSupervisor);
      mocks.supervisorsService.findSupervisorById.mockResolvedValue(testData.mockSupervisor);
      mocks.repository.hasAcceptedSupervision.mockResolvedValue(false); // No existing accepted supervision

      const updatedRequest = {
        ...testData.mockSupervisionRequest,
        request_state: RequestState.ACCEPTED,
      };
      mocks.repository.updateRequestState.mockResolvedValue(updatedRequest);

      // Act
      const result = await service.updateRequestState(
        TEST_IDS.REQUEST_UUID,
        RequestState.ACCEPTED,
        testData.mockSupervisorUser,
      );

      // Assert
      expect(result).toEqual(updatedRequest);
      expect(mocks.repository.findRequestById).toHaveBeenCalledWith(TEST_IDS.REQUEST_UUID);
      expect(mocks.supervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
        testData.mockSupervisorUser.id,
      );
      expect(mocks.supervisorsService.findSupervisorById).toHaveBeenCalledWith(
        testData.mockSupervisionRequest.supervisor_id,
      );
      expect(mocks.repository.hasAcceptedSupervision).toHaveBeenCalledWith(
        mockSupervisionRequestWithUsers.student_id,
      );
      expect(mocks.repository.updateRequestState).toHaveBeenCalledWith({
        id: TEST_IDS.REQUEST_UUID,
        newState: RequestState.ACCEPTED,
        currentState: testData.mockSupervisionRequest.request_state,
        supervisor_id: testData.mockSupervisionRequest.supervisor_id,
        available_spots: testData.mockSupervisor.available_spots,
        total_spots: testData.mockSupervisor.total_spots,
      });
    });

    it('should throw StudentAlreadyHasAnAcceptedSupervisionRequestException when accepting if student already has accepted supervision', async () => {
      // Arrange
      mocks.repository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      mocks.supervisorsService.findSupervisorByUserId.mockResolvedValue(testData.mockSupervisor);
      mocks.supervisorsService.findSupervisorById.mockResolvedValue(testData.mockSupervisor);
      mocks.repository.hasAcceptedSupervision.mockResolvedValue(true); // Already has accepted supervision

      // Act & Assert
      await expect(
        service.updateRequestState(
          TEST_IDS.REQUEST_UUID,
          RequestState.ACCEPTED,
          testData.mockSupervisorUser,
        ),
      ).rejects.toThrow(StudentAlreadyHasAnAcceptedSupervisionRequestException);

      expect(mocks.repository.hasAcceptedSupervision).toHaveBeenCalledWith(
        mockSupervisionRequestWithUsers.student_id,
      );
      expect(mocks.repository.updateRequestState).not.toHaveBeenCalled();
    });

    it('should throw SupervisorCapacityException if accepting with no available spots', async () => {
      // Arrange
      mocks.repository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      mocks.supervisorsService.findSupervisorByUserId.mockResolvedValue(testData.mockSupervisor);
      mocks.repository.hasAcceptedSupervision.mockResolvedValue(false);

      // Supervisor with no available spots
      mocks.supervisorsService.findSupervisorById.mockResolvedValue({
        ...testData.mockSupervisor,
        available_spots: 0,
      });

      // Act & Assert
      await expect(
        service.updateRequestState(
          TEST_IDS.REQUEST_UUID,
          RequestState.ACCEPTED,
          testData.mockSupervisorUser,
        ),
      ).rejects.toThrow(SupervisorCapacityException);
    });

    it('should throw InvalidRequestStateTransitionException if student tries to accept', async () => {
      // Arrange
      mocks.repository.findRequestById.mockResolvedValue(mockSupervisionRequestWithUsers);
      mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);

      // Act & Assert
      await expect(
        service.updateRequestState(
          TEST_IDS.REQUEST_UUID,
          RequestState.ACCEPTED,
          testData.mockStudentUser,
        ),
      ).rejects.toThrow(InvalidRequestStateTransitionException);
    });

    it('should throw NotFoundException if request not found', async () => {
      // Arrange
      mocks.repository.findRequestById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateRequestState(
          TEST_IDS.REQUEST_UUID,
          RequestState.WITHDRAWN,
          testData.mockStudentUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('countRequestsForUser', () => {
    it('should count pending requests for a student', async () => {
      // Arrange
      const expectedCount = 3;
      mocks.usersService.findUserById.mockResolvedValue(testData.mockStudentUser);
      mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);
      mocks.repository.countRequests.mockResolvedValue(expectedCount);

      // Act
      const result = await service.countRequestsForUser(
        testData.mockStudentUser.id,
        RequestState.PENDING,
      );

      // Assert
      expect(result).toEqual({ request_count: expectedCount });
      expect(mocks.usersService.findUserById).toHaveBeenCalledWith(testData.mockStudentUser.id);
      expect(mocks.studentsService.findStudentByUserId).toHaveBeenCalledWith(
        testData.mockStudentUser.id,
      );
      expect(mocks.repository.countRequests).toHaveBeenCalledWith({
        student_id: testData.mockStudent.id,
        request_state: RequestState.PENDING,
      });
    });

    it('should count accepted requests for a supervisor', async () => {
      // Arrange
      const expectedCount = 5;
      mocks.usersService.findUserById.mockResolvedValue(testData.mockSupervisorUser);
      mocks.supervisorsService.findSupervisorByUserId.mockResolvedValue(testData.mockSupervisor);
      mocks.repository.countRequests.mockResolvedValue(expectedCount);

      // Act
      const result = await service.countRequestsForUser(
        testData.mockSupervisorUser.id,
        RequestState.ACCEPTED,
      );

      // Assert
      expect(result).toEqual({ request_count: expectedCount });
      expect(mocks.usersService.findUserById).toHaveBeenCalledWith(testData.mockSupervisorUser.id);
      expect(mocks.supervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
        testData.mockSupervisorUser.id,
      );
      expect(mocks.repository.countRequests).toHaveBeenCalledWith({
        supervisor_id: testData.mockSupervisor.id,
        request_state: RequestState.ACCEPTED,
      });
    });

    it('should return 0 for a student with no rejected requests', async () => {
      // Arrange
      mocks.usersService.findUserById.mockResolvedValue(testData.mockStudentUser);
      mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);
      mocks.repository.countRequests.mockResolvedValue(0);

      // Act
      const result = await service.countRequestsForUser(
        testData.mockStudentUser.id,
        RequestState.REJECTED,
      );

      // Assert
      expect(result).toEqual({ request_count: 0 });
      expect(mocks.usersService.findUserById).toHaveBeenCalledWith(testData.mockStudentUser.id);
      expect(mocks.studentsService.findStudentByUserId).toHaveBeenCalledWith(
        testData.mockStudentUser.id,
      );
      expect(mocks.repository.countRequests).toHaveBeenCalledWith({
        student_id: testData.mockStudent.id,
        request_state: RequestState.REJECTED,
      });
    });

    it('should return 0 for a supervisor with no withdrawn requests', async () => {
      // Arrange
      mocks.usersService.findUserById.mockResolvedValue(testData.mockSupervisorUser);
      mocks.supervisorsService.findSupervisorByUserId.mockResolvedValue(testData.mockSupervisor);
      mocks.repository.countRequests.mockResolvedValue(0);

      // Act
      const result = await service.countRequestsForUser(
        testData.mockSupervisorUser.id,
        RequestState.WITHDRAWN,
      );

      // Assert
      expect(result).toEqual({ request_count: 0 });
      expect(mocks.usersService.findUserById).toHaveBeenCalledWith(testData.mockSupervisorUser.id);
      expect(mocks.supervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
        testData.mockSupervisorUser.id,
      );
      expect(mocks.repository.countRequests).toHaveBeenCalledWith({
        supervisor_id: testData.mockSupervisor.id,
        request_state: RequestState.WITHDRAWN,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const nonExistentUserId = 'non-existent-user-id';
      mocks.usersService.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.countRequestsForUser(nonExistentUserId, RequestState.PENDING),
      ).rejects.toThrow(NotFoundException);
      expect(mocks.usersService.findUserById).toHaveBeenCalledWith(nonExistentUserId);
      // Should not call other services if user doesn't exist
      expect(mocks.studentsService.findStudentByUserId).not.toHaveBeenCalled();
      expect(mocks.supervisorsService.findSupervisorByUserId).not.toHaveBeenCalled();
      expect(mocks.repository.countRequests).not.toHaveBeenCalled();
    });

    it('should throw AdminSupervisionRequestException if user is an admin', async () => {
      // Arrange
      mocks.usersService.findUserById.mockResolvedValue(testData.mockAdminUser);

      // Act & Assert
      await expect(
        service.countRequestsForUser(testData.mockAdminUser.id, RequestState.PENDING),
      ).rejects.toThrow(AdminSupervisionRequestException);
      expect(mocks.usersService.findUserById).toHaveBeenCalledWith(testData.mockAdminUser.id);
      // Should not call other services if user is admin
      expect(mocks.studentsService.findStudentByUserId).not.toHaveBeenCalled();
      expect(mocks.supervisorsService.findSupervisorByUserId).not.toHaveBeenCalled();
      expect(mocks.repository.countRequests).not.toHaveBeenCalled();
    });

    it('should handle errors from repository count method', async () => {
      // Arrange
      mocks.usersService.findUserById.mockResolvedValue(testData.mockStudentUser);
      mocks.studentsService.findStudentByUserId.mockResolvedValue(testData.mockStudent);
      const repositoryError = new Error('Database connection error');
      mocks.repository.countRequests.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        service.countRequestsForUser(testData.mockStudentUser.id, RequestState.PENDING),
      ).rejects.toThrow('Database connection error');
      expect(mocks.usersService.findUserById).toHaveBeenCalledWith(testData.mockStudentUser.id);
      expect(mocks.studentsService.findStudentByUserId).toHaveBeenCalledWith(
        testData.mockStudentUser.id,
      );
      expect(mocks.repository.countRequests).toHaveBeenCalledWith({
        student_id: testData.mockStudent.id,
        request_state: RequestState.PENDING,
      });
    });

    it('should handle errors from students service', async () => {
      // Arrange
      mocks.usersService.findUserById.mockResolvedValue(testData.mockStudentUser);
      const studentsServiceError = new NotFoundException('Student profile not found');
      mocks.studentsService.findStudentByUserId.mockRejectedValue(studentsServiceError);

      // Act & Assert
      await expect(
        service.countRequestsForUser(testData.mockStudentUser.id, RequestState.PENDING),
      ).rejects.toThrow('Student profile not found');
      expect(mocks.usersService.findUserById).toHaveBeenCalledWith(testData.mockStudentUser.id);
      expect(mocks.studentsService.findStudentByUserId).toHaveBeenCalledWith(
        testData.mockStudentUser.id,
      );
      expect(mocks.repository.countRequests).not.toHaveBeenCalled();
    });

    it('should handle errors from supervisors service', async () => {
      // Arrange
      mocks.usersService.findUserById.mockResolvedValue(testData.mockSupervisorUser);
      const supervisorsServiceError = new NotFoundException('Supervisor profile not found');
      mocks.supervisorsService.findSupervisorByUserId.mockRejectedValue(supervisorsServiceError);

      // Act & Assert
      await expect(
        service.countRequestsForUser(testData.mockSupervisorUser.id, RequestState.PENDING),
      ).rejects.toThrow('Supervisor profile not found');
      expect(mocks.usersService.findUserById).toHaveBeenCalledWith(testData.mockSupervisorUser.id);
      expect(mocks.supervisorsService.findSupervisorByUserId).toHaveBeenCalledWith(
        testData.mockSupervisorUser.id,
      );
      expect(mocks.repository.countRequests).not.toHaveBeenCalled();
    });
  });
});
