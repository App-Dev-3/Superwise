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
      create: jest.fn(),
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
      mockPrismaService.student.create.mockResolvedValue(newStudent);

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
          user_id: STUDENT_USER_UUID,
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
      mockPrismaService.student.create.mockResolvedValue(newStudent);

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
          user_id: STUDENT_USER_UUID,
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
      expect(repository.createOrFindStudentByEmail).toHaveBeenCalledWith(
        data.student_email,
        expect.anything(), // The tx client
      );
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

    it('should use transaction when accepting a request to update capacity', async () => {
      // Arrange
      const data = {
        id: REQUEST_UUID,
        newState: RequestState.ACCEPTED, // Changed from pending to accepted
        currentState: RequestState.PENDING,
        supervisor_id: SUPERVISOR_UUID,
        available_spots: 5,
        total_spots: 10,
      };

      // Expected updated request
      const updatedRequest = {
        ...mockSupervisionRequest,
        request_state: RequestState.ACCEPTED,
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

    it('should update request state without capacity changes for non-capacity affecting transitions', async () => {
      // Arrange
      const data = {
        id: REQUEST_UUID,
        newState: RequestState.REJECTED, // Pending to rejected
        currentState: RequestState.PENDING,
        supervisor_id: SUPERVISOR_UUID,
        available_spots: 5,
        total_spots: 10,
      };
      mockPrismaService.supervisionRequest.update.mockResolvedValue({
        ...mockSupervisionRequest,
        request_state: RequestState.REJECTED,
      });

      // Act
      const result = await repository.updateRequestState(data);

      // Assert
      expect(result).toEqual({
        ...mockSupervisionRequest,
        request_state: RequestState.REJECTED,
      });
      expect(mockPrismaService.supervisionRequest.update).toHaveBeenCalledWith({
        where: { id: REQUEST_UUID },
        data: { request_state: RequestState.REJECTED },
      });
      // Transaction should not be used for this case
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should correctly set available spots to 0 when accepting the last available spot', async () => {
      // Arrange
      const data = {
        id: REQUEST_UUID,
        newState: RequestState.ACCEPTED, // Changed from pending to accepted
        currentState: RequestState.PENDING,
        supervisor_id: SUPERVISOR_UUID,
        available_spots: 1, // Only one spot left
        total_spots: 10,
      };

      // Expected updated request
      const updatedRequest = {
        ...mockSupervisionRequest,
        request_state: RequestState.ACCEPTED,
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
        data: { request_state: RequestState.ACCEPTED },
      });
      expect(txMock.supervisor.update).toHaveBeenCalledWith({
        where: { id: SUPERVISOR_UUID },
        data: { available_spots: 0 }, // Available spots should be 0 after using the last spot
      });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });
});
