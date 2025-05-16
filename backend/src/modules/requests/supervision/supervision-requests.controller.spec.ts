import { Test, TestingModule } from '@nestjs/testing';
import { SupervisionRequestsController } from './supervision-requests.controller';
import { SupervisionRequestsService } from './supervision-requests.service';
import { RequestState, Role, User } from '@prisma/client';
import { CreateSupervisionRequestDto } from './dto/create-supervision-request.dto';
import { UpdateSupervisionRequestDto } from './dto/update-supervision-request.dto';
import { SupervisionRequestQueryDto } from './dto/supervision-request-query.dto';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('SupervisionRequestsController', () => {
  let controller: SupervisionRequestsController;

  // Mock service
  const mockSupervisionRequestsService = {
    createSupervisionRequest: jest.fn(),
    findAllRequests: jest.fn(),
    findRequestById: jest.fn(),
    updateRequestState: jest.fn(),
  };

  // Sample test data with proper UUIDs
  const REQUEST_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const STUDENT_UUID = '123e4567-e89b-12d3-a456-426614174001';
  const SUPERVISOR_UUID = '123e4567-e89b-12d3-a456-426614174002';
  const STUDENT_USER_UUID = '123e4567-e89b-12d3-a456-426614174003';
  const SUPERVISOR_USER_UUID = '123e4567-e89b-12d3-a456-426614174004';
  const ADMIN_USER_UUID = '123e4567-e89b-12d3-a456-426614174005';
  const STUDENT_CLERK_ID = 'user_2NUj8tGhSFhTLD9sdP0q4P7VoJM';
  const SUPERVISOR_CLERK_ID = 'user_1AUj8tGhSFhTLD9sdP0q4P7VoXY';
  const ADMIN_CLERK_ID = 'user_3CUj8tGhSFhTLD9sdP0q4P7VoZW';

  // Mock user objects for different roles
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

  // Mock supervision request
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
      },
    },
    supervisor: {
      id: SUPERVISOR_UUID,
      user_id: SUPERVISOR_USER_UUID,
      user: {
        first_name: 'Supervisor',
        last_name: 'User',
        email: 'supervisor@fhstp.ac.at',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupervisionRequestsController],
      providers: [
        { provide: SupervisionRequestsService, useValue: mockSupervisionRequestsService },
      ],
    }).compile();

    controller = module.get<SupervisionRequestsController>(SupervisionRequestsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSupervisionRequest', () => {
    it('should create a request as a student', async () => {
      // Arrange
      const createRequestDto: CreateSupervisionRequestDto = {
        supervisor_id: SUPERVISOR_UUID,
      };
      mockSupervisionRequestsService.createSupervisionRequest.mockResolvedValue(
        mockSupervisionRequest,
      );

      // Act
      const result = await controller.createSupervisionRequest(createRequestDto, mockStudentUser);

      // Assert
      expect(result).toEqual(mockSupervisionRequest);
      expect(mockSupervisionRequestsService.createSupervisionRequest).toHaveBeenCalledWith(
        createRequestDto,
        mockStudentUser,
      );
    });

    it('should create a request as a supervisor', async () => {
      // Arrange
      const createRequestDto: CreateSupervisionRequestDto = {
        student_email: 'student@fhstp.ac.at',
      };
      const supervisionRequestWithStudentCreated = {
        ...mockSupervisionRequest,
        studentWasCreated: true,
      };
      mockSupervisionRequestsService.createSupervisionRequest.mockResolvedValue(
        supervisionRequestWithStudentCreated,
      );

      // Act
      const result = await controller.createSupervisionRequest(
        createRequestDto,
        mockSupervisorUser,
      );

      // Assert
      expect(result).toEqual(supervisionRequestWithStudentCreated);
      expect(mockSupervisionRequestsService.createSupervisionRequest).toHaveBeenCalledWith(
        createRequestDto,
        mockSupervisorUser,
      );
    });

    it('should pass through exceptions from the service', async () => {
      // Arrange
      const createRequestDto: CreateSupervisionRequestDto = {};
      const expectedError = new BadRequestException('supervisor_id is required for students');
      mockSupervisionRequestsService.createSupervisionRequest.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(
        controller.createSupervisionRequest(createRequestDto, mockStudentUser),
      ).rejects.toThrow(expectedError);
    });
  });

  describe('findAllSupervisionRequests', () => {
    it('should return all requests for the current user', async () => {
      // Arrange
      const queryParams: SupervisionRequestQueryDto = {};
      mockSupervisionRequestsService.findAllRequests.mockResolvedValue([
        mockSupervisionRequestWithUsers,
      ]);

      // Act
      const result = await controller.findAllSupervisionRequests(queryParams, mockStudentUser);

      // Assert
      expect(result).toEqual([mockSupervisionRequestWithUsers]);
      expect(mockSupervisionRequestsService.findAllRequests).toHaveBeenCalledWith(
        mockStudentUser.id,
        mockStudentUser.role,
        undefined,
      );
    });

    it('should filter requests by state', async () => {
      // Arrange
      const queryParams: SupervisionRequestQueryDto = {
        request_state: RequestState.PENDING,
      };
      mockSupervisionRequestsService.findAllRequests.mockResolvedValue([
        mockSupervisionRequestWithUsers,
      ]);

      // Act
      const result = await controller.findAllSupervisionRequests(queryParams, mockStudentUser);

      // Assert
      expect(result).toEqual([mockSupervisionRequestWithUsers]);
      expect(mockSupervisionRequestsService.findAllRequests).toHaveBeenCalledWith(
        mockStudentUser.id,
        mockStudentUser.role,
        RequestState.PENDING,
      );
    });

    it('should return all requests for an admin user', async () => {
      // Arrange
      const queryParams: SupervisionRequestQueryDto = {};
      mockSupervisionRequestsService.findAllRequests.mockResolvedValue([
        mockSupervisionRequestWithUsers,
      ]);

      // Act
      const result = await controller.findAllSupervisionRequests(queryParams, mockAdminUser);

      // Assert
      expect(result).toEqual([mockSupervisionRequestWithUsers]);
      expect(mockSupervisionRequestsService.findAllRequests).toHaveBeenCalledWith(
        mockAdminUser.id,
        mockAdminUser.role,
        undefined,
      );
    });
  });

  describe('findSupervisionRequestById', () => {
    it('should return a request by ID', async () => {
      // Arrange
      mockSupervisionRequestsService.findRequestById.mockResolvedValue(
        mockSupervisionRequestWithUsers,
      );

      // Act
      const result = await controller.findSupervisionRequestById(REQUEST_UUID, mockStudentUser);

      // Assert
      expect(result).toEqual(mockSupervisionRequestWithUsers);
      expect(mockSupervisionRequestsService.findRequestById).toHaveBeenCalledWith(
        REQUEST_UUID,
        mockStudentUser,
      );
    });

    it('should pass through NotFoundException', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';
      const expectedError = new NotFoundException(
        `Supervision request with ID ${nonExistentId} not found`,
      );
      mockSupervisionRequestsService.findRequestById.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(
        controller.findSupervisionRequestById(nonExistentId, mockStudentUser),
      ).rejects.toThrow(expectedError);
    });

    it('should pass through ForbiddenException', async () => {
      // Arrange
      const expectedError = new ForbiddenException(
        'You do not have permission to view this request',
      );
      mockSupervisionRequestsService.findRequestById.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(
        controller.findSupervisionRequestById(REQUEST_UUID, mockStudentUser),
      ).rejects.toThrow(expectedError);
    });
  });

  describe('updateSupervisionRequestState', () => {
    it('should update the request state', async () => {
      // Arrange
      const updateDto: UpdateSupervisionRequestDto = {
        request_state: RequestState.ACCEPTED,
      };
      const updatedRequest = {
        ...mockSupervisionRequest,
        request_state: RequestState.ACCEPTED,
      };
      mockSupervisionRequestsService.updateRequestState.mockResolvedValue(updatedRequest);

      // Act
      const result = await controller.updateSupervisionRequestState(
        REQUEST_UUID,
        updateDto,
        mockSupervisorUser,
      );

      // Assert
      expect(result).toEqual(updatedRequest);
      expect(mockSupervisionRequestsService.updateRequestState).toHaveBeenCalledWith(
        REQUEST_UUID,
        RequestState.ACCEPTED,
        mockSupervisorUser,
      );
    });

    it('should pass through InvalidRequestStateTransitionException', async () => {
      // Arrange
      const updateDto: UpdateSupervisionRequestDto = {
        request_state: RequestState.ACCEPTED,
      };
      const expectedError = new BadRequestException(
        `User with role ${Role.STUDENT} cannot change request state from ${RequestState.PENDING} to ${RequestState.ACCEPTED}`,
      );
      mockSupervisionRequestsService.updateRequestState.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(
        controller.updateSupervisionRequestState(REQUEST_UUID, updateDto, mockStudentUser),
      ).rejects.toThrow(expectedError);
    });
  });
});
