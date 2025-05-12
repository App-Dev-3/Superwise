import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { StudentsRepository } from './students.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student, Prisma } from '@prisma/client';

describe('StudentsService', () => {
  let service: StudentsService;
  let repository: StudentsRepository;

  // Proper UUIDs for testing
  const STUDENT_ID = '123e4567-e89b-12d3-a456-426614174000';
  const USER_ID = '123e4567-e89b-12d3-a456-426614174001';
  const NON_EXISTENT_ID = '123e4567-e89b-12d3-a456-426614174099';

  // Mock the StudentsRepository
  const mockStudentsRepository = {
    findStudentById: jest.fn(),
    findStudentByIdWithRelations: jest.fn(),
    findStudentByUserId: jest.fn(),
    findAllStudents: jest.fn(),
    createStudentProfile: jest.fn(),
    updateStudentProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: StudentsRepository,
          useValue: mockStudentsRepository,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    repository = module.get<StudentsRepository>(StudentsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findStudentById', () => {
    it('should find and return a student by ID', async () => {
      // Arrange
      const mockStudent: Student = {
        id: STUDENT_ID,
        thesis_description: 'Machine learning thesis',
        user_id: USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockStudentsRepository.findStudentById.mockResolvedValue(mockStudent);

      // Act
      const result = await service.findStudentById(STUDENT_ID);

      // Assert
      expect(result).toBe(mockStudent);
      expect(mockStudentsRepository.findStudentById).toHaveBeenCalledWith(STUDENT_ID);
    });

    it('should throw NotFoundException when student is not found', async () => {
      // Arrange
      mockStudentsRepository.findStudentById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findStudentById(NON_EXISTENT_ID)).rejects.toThrow(NotFoundException);
      expect(mockStudentsRepository.findStudentById).toHaveBeenCalledWith(NON_EXISTENT_ID);
    });
  });

  describe('findStudentByIdWithRelations', () => {
    it('should find and return a student with relations by ID', async () => {
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

      mockStudentsRepository.findStudentByIdWithRelations.mockResolvedValue(
        mockStudentWithRelations,
      );

      // Act
      const result = await service.findStudentByIdWithRelations(STUDENT_ID);

      // Assert
      expect(result).toBe(mockStudentWithRelations);
      expect(mockStudentsRepository.findStudentByIdWithRelations).toHaveBeenCalledWith(STUDENT_ID);
    });

    it('should throw NotFoundException when student with relations is not found', async () => {
      // Arrange
      mockStudentsRepository.findStudentByIdWithRelations.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findStudentByIdWithRelations(NON_EXISTENT_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockStudentsRepository.findStudentByIdWithRelations).toHaveBeenCalledWith(
        NON_EXISTENT_ID,
      );
    });
  });

  describe('findStudentByUserId', () => {
    it('should find and return a student by user ID', async () => {
      // Arrange
      const mockStudent: Student = {
        id: STUDENT_ID,
        thesis_description: 'Machine learning thesis',
        user_id: USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockStudentsRepository.findStudentByUserId.mockResolvedValue(mockStudent);

      // Act
      const result = await service.findStudentByUserId(USER_ID);

      // Assert
      expect(result).toBe(mockStudent);
      expect(mockStudentsRepository.findStudentByUserId).toHaveBeenCalledWith(USER_ID);
    });

    it('should throw NotFoundException when student is not found by user ID', async () => {
      // Arrange
      mockStudentsRepository.findStudentByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findStudentByUserId(NON_EXISTENT_ID)).rejects.toThrow(NotFoundException);
      expect(mockStudentsRepository.findStudentByUserId).toHaveBeenCalledWith(NON_EXISTENT_ID);
    });
  });

  describe('findAllStudents', () => {
    it('should return an array of students', async () => {
      // Arrange
      const params: {
        take?: number;
        where?: Prisma.StudentWhereInput;
        orderBy?: Prisma.StudentOrderByWithRelationInput;
      } = {
        take: 5,
        orderBy: { user: { last_name: Prisma.SortOrder.asc } },
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
          thesis_description: 'Web development thesis',
          user_id: '323e4567-e89b-12d3-a456-426614174020', // Another valid UUID
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockStudentsRepository.findAllStudents.mockResolvedValue(mockStudents);

      // Act
      const result = await service.findAllStudents(params);

      // Assert
      expect(result).toBe(mockStudents);
      expect(mockStudentsRepository.findAllStudents).toHaveBeenCalledWith(params);
    });
  });

  describe('createStudentProfile', () => {
    it('should create and return a new student profile', async () => {
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

      mockStudentsRepository.findStudentByUserId.mockResolvedValue(null);
      mockStudentsRepository.createStudentProfile.mockResolvedValue(mockStudent);

      // Act
      const result = await service.createStudentProfile(createStudentData);

      // Assert
      expect(result).toBe(mockStudent);
      expect(mockStudentsRepository.findStudentByUserId).toHaveBeenCalledWith(
        createStudentData.user_id,
      );
      expect(mockStudentsRepository.createStudentProfile).toHaveBeenCalledWith(createStudentData);
    });

    it('should throw ConflictException when student profile already exists for user', async () => {
      // Arrange
      const createStudentData = {
        thesis_description: 'Machine learning thesis',
        user_id: USER_ID,
      };
      const existingStudent: Student = {
        id: STUDENT_ID,
        thesis_description: 'Existing thesis',
        user_id: createStudentData.user_id,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockStudentsRepository.findStudentByUserId.mockResolvedValue(existingStudent);

      // Act & Assert
      await expect(service.createStudentProfile(createStudentData)).rejects.toThrow(
        ConflictException,
      );
      expect(mockStudentsRepository.findStudentByUserId).toHaveBeenCalledWith(
        createStudentData.user_id,
      );
      expect(mockStudentsRepository.createStudentProfile).not.toHaveBeenCalled();
    });
  });

  describe('updateStudentProfile', () => {
    it('should update and return the student profile', async () => {
      // Arrange
      const updateStudentDto: UpdateStudentDto = {
        thesis_description: 'Updated thesis description',
      };
      const existingStudent: Student = {
        id: STUDENT_ID,
        thesis_description: 'Original thesis description',
        user_id: USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const updatedStudent: Student = {
        ...existingStudent,
        thesis_description: updateStudentDto.thesis_description || null,
      };

      mockStudentsRepository.findStudentById.mockResolvedValue(existingStudent);
      mockStudentsRepository.updateStudentProfile.mockResolvedValue(updatedStudent);

      // Act
      const result = await service.updateStudentProfile(STUDENT_ID, updateStudentDto);

      // Assert
      expect(result).toBe(updatedStudent);
      expect(mockStudentsRepository.findStudentById).toHaveBeenCalledWith(STUDENT_ID);
      expect(mockStudentsRepository.updateStudentProfile).toHaveBeenCalledWith(
        STUDENT_ID,
        updateStudentDto,
      );
    });

    it('should throw NotFoundException when student to update is not found', async () => {
      // Arrange
      const updateStudentDto: UpdateStudentDto = {
        thesis_description: 'Updated thesis description',
      };

      mockStudentsRepository.findStudentById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateStudentProfile(NON_EXISTENT_ID, updateStudentDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockStudentsRepository.findStudentById).toHaveBeenCalledWith(NON_EXISTENT_ID);
      expect(mockStudentsRepository.updateStudentProfile).not.toHaveBeenCalled();
    });
  });
});
