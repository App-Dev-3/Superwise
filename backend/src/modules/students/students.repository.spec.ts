import { Test, TestingModule } from '@nestjs/testing';
import { StudentsRepository } from './students.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { Student, Prisma } from '@prisma/client';

describe('StudentsRepository', () => {
  let repository: StudentsRepository;
  let prismaService: PrismaService;

  // Proper UUIDs for testing
  const STUDENT_ID = '123e4567-e89b-12d3-a456-426614174000';
  const USER_ID = '123e4567-e89b-12d3-a456-426614174001';
  const NON_EXISTENT_ID = '123e4567-e89b-12d3-a456-426614174099';

  // Mock the PrismaService student methods
  const mockPrismaService = {
    student: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<StudentsRepository>(StudentsRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findStudentById', () => {
    it('should find a student by ID', async () => {
      // Arrange
      const mockStudent: Student = {
        id: STUDENT_ID,
        thesis_description: 'Machine learning thesis',
        user_id: USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);

      // Act
      const result = await repository.findStudentById(STUDENT_ID);

      // Assert
      expect(result).toBe(mockStudent);
      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { id: STUDENT_ID },
      });
    });

    it('should return null when student is not found by ID', async () => {
      // Arrange
      mockPrismaService.student.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findStudentById(NON_EXISTENT_ID);

      // Assert
      expect(result).toBeNull();
      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { id: NON_EXISTENT_ID },
      });
    });
  });

  describe('findStudentByIdWithRelations', () => {
    it('should find a student with relations by ID', async () => {
      // Arrange
      const mockStudentWithRelations = {
        id: STUDENT_ID,
        thesis_description: 'Machine learning thesis',
        user_id: USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
        user: {
          id: USER_ID,
          first_name: 'John',
          last_name: 'Doe',
        },
        supervision_requests: [],
        chat_requests: [],
      };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudentWithRelations);

      // Act
      const result = await repository.findStudentByIdWithRelations(STUDENT_ID);

      // Assert
      expect(result).toBe(mockStudentWithRelations);
      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { id: STUDENT_ID },
        include: {
          user: true,
          supervision_requests: true,
          chat_requests: true,
        },
      });
    });

    it('should return null when student with relations is not found by ID', async () => {
      // Arrange
      mockPrismaService.student.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findStudentByIdWithRelations(NON_EXISTENT_ID);

      // Assert
      expect(result).toBeNull();
      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { id: NON_EXISTENT_ID },
        include: {
          user: true,
          supervision_requests: true,
          chat_requests: true,
        },
      });
    });
  });

  describe('findStudentByUserId', () => {
    it('should find a student by user ID', async () => {
      // Arrange
      const mockStudent: Student = {
        id: STUDENT_ID,
        thesis_description: 'Machine learning thesis',
        user_id: USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);

      // Act
      const result = await repository.findStudentByUserId(USER_ID);

      // Assert
      expect(result).toBe(mockStudent);
      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { user_id: USER_ID },
      });
    });

    it('should return null when student is not found by user ID', async () => {
      // Arrange
      mockPrismaService.student.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findStudentByUserId(NON_EXISTENT_ID);

      // Assert
      expect(result).toBeNull();
      expect(mockPrismaService.student.findUnique).toHaveBeenCalledWith({
        where: { user_id: NON_EXISTENT_ID },
      });
    });
  });

  describe('findAllStudents', () => {
    it('should find all students with given parameters', async () => {
      // Arrange
      const params = {
        take: 5,
        where: { thesis_description: { contains: 'machine learning' } } as Prisma.StudentWhereInput,
        orderBy: { user: { last_name: 'asc' } } as any,
      };

      const mockStudents: Student[] = [
        {
          id: STUDENT_ID,
          thesis_description: 'Machine learning thesis',
          user_id: USER_ID,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174010', // Another valid UUID
          thesis_description: 'Deep learning thesis',
          user_id: '323e4567-e89b-12d3-a456-426614174020', // Another valid UUID
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPrismaService.student.findMany.mockResolvedValue(mockStudents);

      // Act
      const result = await repository.findAllStudents(params);

      // Assert
      expect(result).toBe(mockStudents);
      expect(mockPrismaService.student.findMany).toHaveBeenCalledWith({
        take: params.take,
        where: params.where,
        orderBy: params.orderBy,
      });
    });

    it('should handle empty parameters', async () => {
      // Arrange
      const params = {};
      const mockStudents: Student[] = [
        {
          id: STUDENT_ID,
          thesis_description: 'Machine learning thesis',
          user_id: USER_ID,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPrismaService.student.findMany.mockResolvedValue(mockStudents);

      // Act
      const result = await repository.findAllStudents(params);

      // Assert
      expect(result).toBe(mockStudents);
      expect(mockPrismaService.student.findMany).toHaveBeenCalledWith(params);
    });
  });

  describe('createStudentProfile', () => {
    it('should create a student profile', async () => {
      // Arrange
      const createStudentData = {
        thesis_description: 'Machine learning thesis',
        user_id: USER_ID,
      };

      const mockStudent: Student = {
        id: STUDENT_ID,
        ...createStudentData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.student.create.mockResolvedValue(mockStudent);

      // Act
      const result = await repository.createStudentProfile(createStudentData);

      // Assert
      expect(result).toBe(mockStudent);
      expect(mockPrismaService.student.create).toHaveBeenCalledWith({
        data: createStudentData,
      });
    });
  });

  describe('updateStudentProfile', () => {
    it('should update a student profile', async () => {
      // Arrange
      const updateData = {
        thesis_description: 'Updated thesis description',
      };

      const mockUpdatedStudent: Student = {
        id: STUDENT_ID,
        thesis_description: updateData.thesis_description,
        user_id: USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrismaService.student.update.mockResolvedValue(mockUpdatedStudent);

      // Act
      const result = await repository.updateStudentProfile(STUDENT_ID, updateData);

      // Assert
      expect(result).toBe(mockUpdatedStudent);
      expect(mockPrismaService.student.update).toHaveBeenCalledWith({
        where: { id: STUDENT_ID },
        data: updateData,
      });
    });
  });
});
