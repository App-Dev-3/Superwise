import { Test, TestingModule } from '@nestjs/testing';
import { SupervisionRequestsRepository } from './supervision-requests.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { RequestState, Role } from '@prisma/client';

describe('SupervisionRequestsRepository', () => {
  let repository: SupervisionRequestsRepository;

  // Mock the PrismaService
  const mockPrismaService = {
    supervisionRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    supervisor: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  // Test data
  const REQUEST_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const STUDENT_UUID = '123e4567-e89b-12d3-a456-426614174001';
  const SUPERVISOR_UUID = '123e4567-e89b-12d3-a456-426614174002';
  const STUDENT_USER_UUID = '123e4567-e89b-12d3-a456-426614174003';
  const SUPERVISOR_USER_UUID = '123e4567-e89b-12d3-a456-426614174004';
  const DIFFERENT_STUDENT_UUID = '123e4567-e89b-12d3-a456-426614174008';

  const mockSupervisionRequest = {
    id: REQUEST_UUID,
    student_id: STUDENT_UUID,
    supervisor_id: SUPERVISOR_UUID,
    request_state: RequestState.PENDING,
    created_at: new Date('2023-01-15T10:30:00Z'),
    updated_at: new Date('2023-01-15T10:30:00Z'),
  };

  const mockSupervisionRequestWithUsers = {
    ...mockSupervisionRequest,
    student: {
      id: STUDENT_UUID,
      user_id: STUDENT_USER_UUID,
      created_at: new Date(),
      updated_at: new Date(),
      thesis_description: null,
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
      created_at: new Date(),
      updated_at: new Date(),
      bio: 'Experienced supervisor',
      total_spots: 10,
      available_spots: 5,
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
        SupervisionRequestsRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<SupervisionRequestsRepository>(SupervisionRequestsRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAllRequests', () => {
    it('should return all requests matching filter criteria', async () => {
      // Arrange
      const params = {
        student_id: STUDENT_UUID,
        supervisor_id: SUPERVISOR_UUID,
        request_state: RequestState.PENDING,
      };
      mockPrismaService.supervisionRequest.findMany.mockResolvedValue([
        mockSupervisionRequestWithUsers,
      ]);

      // Act
      const result = await repository.findAllRequests(params);

      // Assert
      expect(result).toEqual([mockSupervisionRequestWithUsers]);
      expect(mockPrismaService.supervisionRequest.findMany).toHaveBeenCalledWith({
        where: {
          student_id: STUDENT_UUID,
          supervisor_id: SUPERVISOR_UUID,
          request_state: RequestState.PENDING,
        },
        orderBy: {
          updated_at: 'desc',
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true,
                  profile_image: true,
                },
              },
            },
          },
          supervisor: {
            include: {
              user: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true,
                  profile_image: true,
                },
              },
            },
          },
        },
      });
    });

    it('should omit undefined parameters from where clause', async () => {
      // Arrange
      const params = {
        student_id: STUDENT_UUID,
        // No supervisor_id or request_state provided
      };
      mockPrismaService.supervisionRequest.findMany.mockResolvedValue([
        mockSupervisionRequestWithUsers,
      ]);

      // Act
      const result = await repository.findAllRequests(params);

      // Assert
      expect(result).toEqual([mockSupervisionRequestWithUsers]);
      expect(mockPrismaService.supervisionRequest.findMany).toHaveBeenCalledWith({
        where: {
          student_id: STUDENT_UUID,
          // Other params should not be in the where clause
        },
        orderBy: {
          updated_at: 'desc',
        },
        include: expect.any(Object),
      });
    });
  });

  describe('findRequestById', () => {
    it('should return a request by ID with related entities', async () => {
      // Arrange
      mockPrismaService.supervisionRequest.findUnique.mockResolvedValue(
        mockSupervisionRequestWithUsers,
      );

      // Act
      const result = await repository.findRequestById(REQUEST_UUID);

      // Assert
      expect(result).toEqual(mockSupervisionRequestWithUsers);
      expect(mockPrismaService.supervisionRequest.findUnique).toHaveBeenCalledWith({
        where: { id: REQUEST_UUID },
        include: {
          student: {
            include: {
              user: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true,
                  profile_image: true,
                },
              },
            },
          },
          supervisor: {
            include: {
              user: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true,
                  profile_image: true,
                },
              },
            },
          },
        },
      });
    });

    it('should return null if request not found', async () => {
      // Arrange
      mockPrismaService.supervisionRequest.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findRequestById('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createOrFindStudentByEmail', () => {
    it('should return existing user and student when they already exist', async () => {
      // Arrange
      const email = 'student@fhstp.ac.at';
      const existingUser = {
        id: STUDENT_USER_UUID,
        email,
        first_name: 'Student',
        last_name: 'User',
        role: Role.STUDENT,
        is_registered: true,
      };
      const existingStudent = {
        id: STUDENT_UUID,
        user_id: STUDENT_USER_UUID,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.student.findUnique.mockResolvedValue(existingStudent);

      // Act
      const result = await repository.createOrFindStudentByEmail(email);

      // Assert
      expect(result).toEqual({
        id: STUDENT_UUID,
        user_id: STUDENT_USER_UUID,
        wasCreated: false,
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { user_id: STUDENT_USER_UUID },
      });
      // These should not be called since user and student exist
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(mockPrismaService.student.create).not.toHaveBeenCalled();
    });

    it('should create new user and student when they do not exist', async () => {
      // Arrange
      const email = 'newstudent@fhstp.ac.at';
      const newUser = {
        id: STUDENT_USER_UUID,
        email,
        first_name: '',
        last_name: '',
        role: Role.STUDENT,
        is_registered: false,
      };
      const newStudent = {
        id: STUDENT_UUID,
        user_id: STUDENT_USER_UUID,
      };

      // Mock user does not exist
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      // Mock user creation
      mockPrismaService.user.create.mockResolvedValue(newUser);
      // Mock student does not exist
      mockPrismaService.student.findUnique.mockResolvedValue(null);
      // Mock student creation
      mockPrismaService.student.create.mockResolvedValue({
        id: STUDENT_UUID,
        user_id: STUDENT_USER_UUID,
      });

      // Act
      const result = await repository.createOrFindStudentByEmail(email);

      // Assert
      expect(result).toEqual({
        id: STUDENT_UUID,
        user_id: STUDENT_USER_UUID,
        wasCreated: true,
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email,
          first_name: '',
          last_name: '',
          role: Role.STUDENT,
          is_registered: false,
        },
      });
      expect(mockPrismaService.student.create).toHaveBeenCalledWith({
        data: {
          user: {
            connect: {
              id: STUDENT_USER_UUID,
            },
          },
        },
      });
    });

    it('should create only student when user exists but not student', async () => {
      // Arrange
      const email = 'existinguser@fhstp.ac.at';
      const existingUser = {
        id: STUDENT_USER_UUID,
        email,
        first_name: 'Existing',
        last_name: 'User',
        role: Role.STUDENT,
        is_registered: true,
      };
      const newStudent = {
        id: STUDENT_UUID,
        user_id: STUDENT_USER_UUID,
      };

      // Mock user exists
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      // Mock student doesn't exist
      mockPrismaService.student.findUnique.mockResolvedValue(null);
      // Mock student creation
      mockPrismaService.student.create.mockResolvedValue({
        id: STUDENT_UUID,
        user_id: STUDENT_USER_UUID,
      });

      // Act
      const result = await repository.createOrFindStudentByEmail(email);

      // Assert
      expect(result).toEqual({
        id: STUDENT_UUID,
        user_id: STUDENT_USER_UUID,
        wasCreated: true,
      });
      // User should not be created
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      // Student should be created
      expect(mockPrismaService.student.create).toHaveBeenCalledWith({
        data: {
          user: {
            connect: {
              id: STUDENT_USER_UUID,
            },
          },
        },
      });
    });

    it('should use transaction client when provided', async () => {
      // Arrange
      const email = 'student@fhstp.ac.at';
      const txClient = {
        user: {
          findUnique: jest.fn().mockResolvedValue({
            id: STUDENT_USER_UUID,
            email,
          }),
        },
        student: {
          findUnique: jest.fn().mockResolvedValue({
            id: STUDENT_UUID,
            user_id: STUDENT_USER_UUID,
          }),
        },
      };

      // Act
      await repository.createOrFindStudentByEmail(email, txClient as any);

      // Assert
      expect(txClient.user.findUnique).toHaveBeenCalled();
      expect(txClient.student.findUnique).toHaveBeenCalled();
      // The prisma service should not be used directly
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.student.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('createSupervisionRequest', () => {
    it('should create a simple pending request', async () => {
      // Arrange
      const data = {
        student_id: STUDENT_UUID,
        supervisor_id: SUPERVISOR_UUID,
        request_state: RequestState.PENDING,
      };
      mockPrismaService.supervisionRequest.create.mockResolvedValue(mockSupervisionRequest);

      // Act
      const result = await repository.createSupervisionRequest(data);

      // Assert
      expect(result).toEqual(mockSupervisionRequest);
      expect(mockPrismaService.supervisionRequest.create).toHaveBeenCalledWith({
        data: {
          student_id: STUDENT_UUID,
          supervisor_id: SUPERVISOR_UUID,
          request_state: RequestState.PENDING,
        },
      });
      // Transaction should not be used for simple request
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should throw error when trying to create accepted request without student_email', async () => {
      // Arrange
      const data = {
        supervisor_id: SUPERVISOR_UUID,
        request_state: RequestState.ACCEPTED,
        available_spots: 5,
        // Missing student_email
      };

      // Act & Assert
      await expect(repository.createSupervisionRequest(data)).rejects.toThrow(
        'student_email is required for creating ACCEPTED requests',
      );
    });
    it('should create an accepted request with student creation and capacity update', async () => {
      // Arrange
      const data = {
        supervisor_id: SUPERVISOR_UUID,
        request_state: RequestState.ACCEPTED,
        student_email: 'newstudent@fhstp.ac.at',
        available_spots: 5,
      };

      // Mock for transaction
      const txMock = {
        supervisionRequest: {
          create: jest.fn().mockResolvedValue(mockSupervisionRequest),
          findFirst: jest.fn().mockResolvedValue(null), // for hasAcceptedSupervision
          updateMany: jest.fn().mockResolvedValue({ count: 0 }), // for withdrawCompetingRequests
        },
        supervisor: {
          update: jest.fn(),
        },
        user: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
        student: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
      };

      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: typeof txMock) => unknown) => {
          return callback(txMock);
        },
      );

      // IMPORTANT: Mock the prisma service methods since hasAcceptedSupervision now uses this.prisma
      mockPrismaService.supervisionRequest.findFirst.mockResolvedValue(null); // Student doesn't have accepted supervision
      mockPrismaService.supervisionRequest.updateMany.mockResolvedValue({ count: 0 });

      // Spy on createOrFindStudentByEmail and mock its behavior
      jest.spyOn(repository, 'createOrFindStudentByEmail').mockResolvedValue({
        id: STUDENT_UUID,
        user_id: STUDENT_USER_UUID,
        wasCreated: true,
      });

      // Act
      const result = await repository.createSupervisionRequest(data);

      // Assert
      expect(result).toEqual({
        ...mockSupervisionRequest,
        studentWasCreated: true,
      });

      expect(txMock.supervisionRequest.create).toHaveBeenCalledWith({
        data: {
          student_id: STUDENT_UUID,
          supervisor_id: SUPERVISOR_UUID,
          request_state: RequestState.ACCEPTED,
        },
      });
      expect(txMock.supervisor.update).toHaveBeenCalledWith({
        where: { id: SUPERVISOR_UUID },
        data: {
          available_spots: 4, // 5 - 1
        },
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
    it('should throw error if student_id is missing for pending request', async () => {
      // Arrange
      const data = {
        supervisor_id: SUPERVISOR_UUID,
        request_state: RequestState.PENDING,
        // Missing student_id
      };

      // Act & Assert
      await expect(repository.createSupervisionRequest(data)).rejects.toThrow(
        'student_id is required for creating PENDING requests',
      );
    });

    it('should propagate errors that occur during transaction', async () => {
      // Arrange
      const data = {
        supervisor_id: SUPERVISOR_UUID,
        request_state: RequestState.ACCEPTED,
        student_email: 'student@fhstp.ac.at',
        available_spots: 5,
      };

      // Mock transaction that throws an error
      const transactionError = new Error('Database transaction failed');
      mockPrismaService.$transaction.mockRejectedValue(transactionError);

      // Act & Assert
      await expect(repository.createSupervisionRequest(data)).rejects.toThrow(
        'Database transaction failed',
      );
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('updateRequestState', () => {
    it('should update request state without transaction if state is not changing', async () => {
      // Arrange
      const data = {
        id: REQUEST_UUID,
        newState: RequestState.PENDING, // Same as current state
        currentState: RequestState.PENDING,
        supervisor_id: SUPERVISOR_UUID,
        available_spots: 5,
        total_spots: 10,
      };
      mockPrismaService.supervisionRequest.update.mockResolvedValue({
        ...mockSupervisionRequest,
        request_state: RequestState.PENDING,
      });

      // Act
      const result = await repository.updateRequestState(data);

      // Assert
      expect(result).toEqual({
        ...mockSupervisionRequest,
        request_state: RequestState.PENDING,
      });
      expect(mockPrismaService.supervisionRequest.update).toHaveBeenCalledWith({
        where: { id: REQUEST_UUID },
        data: { request_state: RequestState.PENDING },
      });
      // Transaction should not be used
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should update request state without capacity changes for non-capacity affecting transitions', async () => {
      // Arrange
      const data = {
        id: REQUEST_UUID,
        newState: RequestState.REJECTED, // Pending to rejected - no capacity change
        currentState: RequestState.PENDING,
        supervisor_id: SUPERVISOR_UUID,
        available_spots: 5,
        total_spots: 10,
      };

      const updatedRequest = {
        ...mockSupervisionRequest,
        request_state: RequestState.REJECTED,
      };

      mockPrismaService.supervisionRequest.update.mockResolvedValue(updatedRequest);

      // Act
      const result = await repository.updateRequestState(data);

      // Assert
      expect(result).toEqual(updatedRequest);
      expect(mockPrismaService.supervisionRequest.update).toHaveBeenCalledWith({
        where: { id: REQUEST_UUID },
        data: { request_state: RequestState.REJECTED },
      });
      // Transaction should NOT be used for this case
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should use transaction when accepting a request to update capacity', async () => {
      // Arrange
      const data = {
        id: REQUEST_UUID,
        newState: RequestState.ACCEPTED,
        currentState: RequestState.PENDING,
        supervisor_id: SUPERVISOR_UUID,
        available_spots: 5,
        total_spots: 10,
      };

      const updatedRequest = {
        ...mockSupervisionRequest,
        request_state: RequestState.ACCEPTED,
      };

      const txMock = {
        supervisionRequest: {
          findUnique: jest.fn().mockResolvedValue({
            id: REQUEST_UUID,
            student_id: STUDENT_UUID,
          }),
          update: jest.fn().mockResolvedValue(updatedRequest),
        },
        supervisor: {
          update: jest.fn(),
        },
      };

      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: typeof txMock) => unknown) => {
          return callback(txMock);
        },
      );

      // IMPORTANT: Mock hasAcceptedSupervision to return false (no existing accepted request)
      mockPrismaService.supervisionRequest.findFirst.mockResolvedValue(null);
      mockPrismaService.supervisionRequest.updateMany.mockResolvedValue({ count: 0 });

      // Act
      const result = await repository.updateRequestState(data);

      // Assert
      expect(result).toEqual(updatedRequest);
      expect(txMock.supervisionRequest.update).toHaveBeenCalledWith({
        where: { id: REQUEST_UUID },
        data: { request_state: RequestState.ACCEPTED },
      });
      expect(txMock.supervisor.update).toHaveBeenCalledWith({
        where: { id: SUPERVISOR_UUID },
        data: { available_spots: 4 }, // 5 - 1
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
    it('should use transaction when withdrawing an accepted request to restore capacity', async () => {
      // Arrange
      const data = {
        id: REQUEST_UUID,
        newState: RequestState.WITHDRAWN, // From accepted to withdrawn
        currentState: RequestState.ACCEPTED,
        supervisor_id: SUPERVISOR_UUID,
        available_spots: 4,
        total_spots: 10,
      };

      // Expected updated request
      const updatedRequest = {
        ...mockSupervisionRequest,
        request_state: RequestState.WITHDRAWN,
      };

      // Mock for transaction
      const txMock = {
        supervisionRequest: {
          update: jest.fn().mockResolvedValue(updatedRequest),
        },
        supervisor: {
          update: jest.fn(),
        },
      };
      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: typeof txMock) => unknown) => {
          return callback(txMock);
        },
      );

      // Act
      const result = await repository.updateRequestState(data);

      // Assert
      expect(result).toEqual(updatedRequest);
      expect(txMock.supervisionRequest.update).toHaveBeenCalledWith({
        where: { id: REQUEST_UUID },
        data: { request_state: RequestState.WITHDRAWN },
      });
      expect(txMock.supervisor.update).toHaveBeenCalledWith({
        where: { id: SUPERVISOR_UUID },
        data: { available_spots: 5 }, // 4 + 1
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should not exceed total spots when restoring capacity', async () => {
      // Arrange
      const data = {
        id: REQUEST_UUID,
        newState: RequestState.WITHDRAWN, // From accepted to withdrawn
        currentState: RequestState.ACCEPTED,
        supervisor_id: SUPERVISOR_UUID,
        available_spots: 10, // Already at max
        total_spots: 10,
      };

      // Expected updated request
      const updatedRequest = {
        ...mockSupervisionRequest,
        request_state: RequestState.WITHDRAWN,
      };

      // Mock for transaction
      const txMock = {
        supervisionRequest: {
          update: jest.fn().mockResolvedValue(updatedRequest),
        },
        supervisor: {
          update: jest.fn(),
        },
      };
      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: typeof txMock) => unknown) => {
          return callback(txMock);
        },
      );

      // Act
      const result = await repository.updateRequestState(data);

      // Assert
      expect(result).toEqual(updatedRequest);
      expect(txMock.supervisor.update).toHaveBeenCalledWith({
        where: { id: SUPERVISOR_UUID },
        data: { available_spots: 10 }, // Should not exceed total_spots
      });
    });

    it('should correctly set available spots to 0 when accepting the last available spot', async () => {
      // Arrange
      const data = {
        id: REQUEST_UUID,
        newState: RequestState.ACCEPTED,
        currentState: RequestState.PENDING,
        supervisor_id: SUPERVISOR_UUID,
        available_spots: 1, // Only one spot left
        total_spots: 10,
      };

      const updatedRequest = {
        ...mockSupervisionRequest,
        request_state: RequestState.ACCEPTED,
      };

      const txMock = {
        supervisionRequest: {
          findUnique: jest.fn().mockResolvedValue({
            id: REQUEST_UUID,
            student_id: STUDENT_UUID,
          }),
          update: jest.fn().mockResolvedValue(updatedRequest),
        },
        supervisor: {
          update: jest.fn(),
        },
      };

      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: typeof txMock) => unknown) => {
          return callback(txMock);
        },
      );

      // IMPORTANT: Mock hasAcceptedSupervision to return false (no existing accepted request)
      mockPrismaService.supervisionRequest.findFirst.mockResolvedValue(null);
      mockPrismaService.supervisionRequest.updateMany.mockResolvedValue({ count: 0 });

      // Act
      const result = await repository.updateRequestState(data);

      // Assert
      expect(result).toEqual(updatedRequest);

      expect(txMock.supervisionRequest.update).toHaveBeenCalledWith({
        where: { id: REQUEST_UUID },
        data: { request_state: RequestState.ACCEPTED },
      });
      expect(txMock.supervisor.update).toHaveBeenCalledWith({
        where: { id: SUPERVISOR_UUID },
        data: { available_spots: 0 }, // Should be 0 after using the last spot
      });
      expect(mockPrismaService.supervisionRequest.updateMany).toHaveBeenCalledWith({
        where: {
          student_id: STUDENT_UUID,
          request_state: RequestState.PENDING,
          id: { not: REQUEST_UUID },
        },
        data: { request_state: RequestState.WITHDRAWN },
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('hasAcceptedSupervision', () => {
    it('should return true when student has accepted supervision', async () => {
      // Arrange
      mockPrismaService.supervisionRequest.findFirst.mockResolvedValue(mockSupervisionRequest);

      // Act
      const result = await repository.hasAcceptedSupervision(STUDENT_UUID);

      // Assert
      expect(result).toBe(true);
      expect(mockPrismaService.supervisionRequest.findFirst).toHaveBeenCalledWith({
        where: {
          student_id: STUDENT_UUID,
          request_state: RequestState.ACCEPTED,
        },
      });
    });

    it('should return false when student has no accepted supervision', async () => {
      // Arrange
      mockPrismaService.supervisionRequest.findFirst.mockResolvedValue(null);

      // Act
      const result = await repository.hasAcceptedSupervision(STUDENT_UUID);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('withdrawCompetingRequests', () => {
    it('should withdraw competing pending requests', async () => {
      // Arrange
      mockPrismaService.supervisionRequest.updateMany.mockResolvedValue({ count: 2 });

      // Act
      const result = await repository.withdrawCompetingRequests(STUDENT_UUID, REQUEST_UUID);

      // Assert
      expect(result).toBe(2);
      expect(mockPrismaService.supervisionRequest.updateMany).toHaveBeenCalledWith({
        where: {
          student_id: STUDENT_UUID,
          request_state: RequestState.PENDING,
          id: { not: REQUEST_UUID },
        },
        data: { request_state: RequestState.WITHDRAWN },
      });
    });
  });

  describe('countRequests', () => {
    it('should count all requests matching filter criteria', async () => {
      // Arrange
      const params = {
        student_id: STUDENT_UUID,
        supervisor_id: SUPERVISOR_UUID,
        request_state: RequestState.PENDING,
      };
      const expectedCount = 3;
      mockPrismaService.supervisionRequest.count.mockResolvedValue(expectedCount);

      // Act
      const result = await repository.countRequests(params);

      // Assert
      expect(result).toBe(expectedCount);
      expect(mockPrismaService.supervisionRequest.count).toHaveBeenCalledWith({
        where: {
          student_id: STUDENT_UUID,
          supervisor_id: SUPERVISOR_UUID,
          request_state: RequestState.PENDING,
        },
      });
    });

    it('should omit undefined parameters from where clause', async () => {
      // Arrange
      const params = {
        student_id: STUDENT_UUID,
        // No supervisor_id or request_state provided
      };
      const expectedCount = 5;
      mockPrismaService.supervisionRequest.count.mockResolvedValue(expectedCount);

      // Act
      const result = await repository.countRequests(params);

      // Assert
      expect(result).toBe(expectedCount);
      expect(mockPrismaService.supervisionRequest.count).toHaveBeenCalledWith({
        where: {
          student_id: STUDENT_UUID,
          // Other params should not be in the where clause
        },
      });
    });

    it('should count all requests when no filters are provided', async () => {
      // Arrange
      const params = {};
      const expectedCount = 10;
      mockPrismaService.supervisionRequest.count.mockResolvedValue(expectedCount);

      // Act
      const result = await repository.countRequests(params);

      // Assert
      expect(result).toBe(expectedCount);
      expect(mockPrismaService.supervisionRequest.count).toHaveBeenCalledWith({
        where: {},
      });
    });

    it('should return 0 when no matching requests exist', async () => {
      // Arrange
      const params = {
        student_id: 'non-existent-student-id',
        request_state: RequestState.PENDING,
      };
      mockPrismaService.supervisionRequest.count.mockResolvedValue(0);

      // Act
      const result = await repository.countRequests(params);

      // Assert
      expect(result).toBe(0);
      expect(mockPrismaService.supervisionRequest.count).toHaveBeenCalledWith({
        where: {
          student_id: 'non-existent-student-id',
          request_state: RequestState.PENDING,
        },
      });
    });

    it('should handle only supervisor_id filter', async () => {
      // Arrange
      const params = {
        supervisor_id: SUPERVISOR_UUID,
      };
      const expectedCount = 7;
      mockPrismaService.supervisionRequest.count.mockResolvedValue(expectedCount);

      // Act
      const result = await repository.countRequests(params);

      // Assert
      expect(result).toBe(expectedCount);
      expect(mockPrismaService.supervisionRequest.count).toHaveBeenCalledWith({
        where: {
          supervisor_id: SUPERVISOR_UUID,
        },
      });
    });

    it('should handle only request_state filter', async () => {
      // Arrange
      const params = {
        request_state: RequestState.ACCEPTED,
      };
      const expectedCount = 15;
      mockPrismaService.supervisionRequest.count.mockResolvedValue(expectedCount);

      // Act
      const result = await repository.countRequests(params);

      // Assert
      expect(result).toBe(expectedCount);
      expect(mockPrismaService.supervisionRequest.count).toHaveBeenCalledWith({
        where: {
          request_state: RequestState.ACCEPTED,
        },
      });
    });
  });
});
