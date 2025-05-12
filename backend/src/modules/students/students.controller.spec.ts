import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student, User, Role } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import { StudentWithRelations } from './entities/student-with-relations.entity';

describe('StudentsController', () => {
  let controller: StudentsController;
  let studentsService: StudentsService;

  // Proper UUIDs for testing
  const STUDENT_ID = '123e4567-e89b-12d3-a456-426614174000';
  const USER_ID = '123e4567-e89b-12d3-a456-426614174001';
  const OTHER_USER_ID = '123e4567-e89b-12d3-a456-426614174002';
  const ADMIN_USER_ID = '123e4567-e89b-12d3-a456-426614174003';
  const CLERK_ID = 'user_2NUj8tGhSFhTLD9sdP0q4P7VoJM';
  const OTHER_CLERK_ID = 'user_3XYj9pQsSLnVMD5rtP1r6P8WnJN';
  const ADMIN_CLERK_ID = 'user_4ZTk0rTuTMgWNE6suP2s7Q9XoKO';

  // Mock the StudentsService methods
  const mockStudentsService = {
    findAllStudents: jest.fn(),
    findStudentById: jest.fn(),
    findStudentByIdWithRelations: jest.fn(),
    findStudentByUserId: jest.fn(),
    createStudentProfile: jest.fn(),
    updateStudentProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: StudentsService,
          useValue: mockStudentsService,
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    studentsService = module.get<StudentsService>(StudentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllStudents', () => {
    it('should return an array of student profiles', async () => {
      // Arrange
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
          user_id: OTHER_USER_ID,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockStudentsService.findAllStudents.mockResolvedValue(mockStudents);

      // Act
      const result = await controller.findAllStudents(5);

      // Assert
      expect(result).toBe(mockStudents);
      expect(mockStudentsService.findAllStudents).toHaveBeenCalledWith({
        take: 5,
        orderBy: { user: { last_name: 'asc' } },
      });
    });

    it('should handle undefined take parameter', async () => {
      // Arrange
      const mockStudents: Student[] = [
        {
          id: STUDENT_ID,
          thesis_description: 'Machine learning thesis',
          user_id: USER_ID,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockStudentsService.findAllStudents.mockResolvedValue(mockStudents);

      // Act
      const result = await controller.findAllStudents(undefined);

      // Assert
      expect(result).toBe(mockStudents);
      expect(mockStudentsService.findAllStudents).toHaveBeenCalledWith({
        take: undefined,
        orderBy: { user: { last_name: 'asc' } },
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

      mockStudentsService.findStudentByUserId.mockResolvedValue(mockStudent);

      // Act
      const result = await controller.findStudentByUserId(USER_ID);

      // Assert
      expect(result).toBe(mockStudent);
      expect(mockStudentsService.findStudentByUserId).toHaveBeenCalledWith(USER_ID);
    });
  });

  describe('findStudentByIdWithRelations', () => {
    it('should find a student with relations', async () => {
      // Arrange
      const mockStudentWithRelations: StudentWithRelations = {
        id: STUDENT_ID,
        thesis_description: 'Machine learning thesis',
        user_id: USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
        user: {
          id: USER_ID,
          clerk_id: CLERK_ID,
          email: 'student@superwise.at',
          first_name: 'John',
          last_name: 'Doe',
          role: Role.STUDENT,
          profile_image: null,
          is_registered: true,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        supervision_requests: [],
        chat_requests: [],
      };

      mockStudentsService.findStudentByIdWithRelations.mockResolvedValue(mockStudentWithRelations);

      // Act
      const result = await controller.findStudentByIdWithRelations(STUDENT_ID);

      // Assert
      expect(result).toBe(mockStudentWithRelations);
      expect(mockStudentsService.findStudentByIdWithRelations).toHaveBeenCalledWith(STUDENT_ID);
    });
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

      mockStudentsService.findStudentById.mockResolvedValue(mockStudent);

      // Act
      const result = await controller.findStudentById(STUDENT_ID);

      // Assert
      expect(result).toBe(mockStudent);
      expect(mockStudentsService.findStudentById).toHaveBeenCalledWith(STUDENT_ID);
    });
  });

  describe('createStudentProfile', () => {
    it('should create a student profile', async () => {
      // Arrange
      const createStudentDto: CreateStudentDto = {
        thesis_description: 'Machine learning thesis',
      };

      const currentUser: User = {
        id: USER_ID,
        clerk_id: CLERK_ID,
        email: 'student@superwise.at',
        first_name: 'John',
        last_name: 'Doe',
        role: Role.STUDENT,
        profile_image: null,
        is_registered: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockStudent: Student = {
        id: STUDENT_ID,
        thesis_description: createStudentDto.thesis_description || null,
        user_id: currentUser.id,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockStudentsService.createStudentProfile.mockResolvedValue(mockStudent);

      // Act
      const result = await controller.createStudentProfile(createStudentDto, currentUser);

      // Assert
      expect(result).toBe(mockStudent);
      expect(mockStudentsService.createStudentProfile).toHaveBeenCalledWith({
        ...createStudentDto,
        user_id: currentUser.id,
      });
    });
  });

  describe('updateStudentProfile', () => {
    it('should update own student profile as a student', async () => {
      // Arrange
      const updateStudentDto: UpdateStudentDto = {
        thesis_description: 'Updated thesis description',
      };

      const currentUser: User = {
        id: USER_ID,
        clerk_id: CLERK_ID,
        email: 'student@superwise.at',
        first_name: 'John',
        last_name: 'Doe',
        role: Role.STUDENT,
        profile_image: null,
        is_registered: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockStudent: Student = {
        id: STUDENT_ID,
        thesis_description: 'Original thesis description',
        user_id: USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedStudent: Student = {
        ...mockStudent,
        thesis_description: updateStudentDto.thesis_description || null,
      };

      mockStudentsService.findStudentById.mockResolvedValue(mockStudent);
      mockStudentsService.updateStudentProfile.mockResolvedValue(updatedStudent);

      // Act
      const result = await controller.updateStudentProfile(
        STUDENT_ID,
        updateStudentDto,
        currentUser,
      );

      // Assert
      expect(result).toBe(updatedStudent);
      expect(mockStudentsService.findStudentById).toHaveBeenCalledWith(STUDENT_ID);
      expect(mockStudentsService.updateStudentProfile).toHaveBeenCalledWith(
        STUDENT_ID,
        updateStudentDto,
      );
    });

    it('should update any student profile as an admin', async () => {
      // Arrange
      const updateStudentDto: UpdateStudentDto = {
        thesis_description: 'Admin updated thesis description',
      };

      const currentUser: User = {
        id: ADMIN_USER_ID,
        clerk_id: ADMIN_CLERK_ID,
        email: 'admin@superwise.at',
        first_name: 'Admin',
        last_name: 'User',
        role: Role.ADMIN,
        profile_image: null,
        is_registered: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockStudent: Student = {
        id: STUDENT_ID,
        thesis_description: 'Original thesis description',
        user_id: USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const updatedStudent: Student = {
        ...mockStudent,
        thesis_description: updateStudentDto.thesis_description || null,
      };

      mockStudentsService.findStudentById.mockResolvedValue(mockStudent);
      mockStudentsService.updateStudentProfile.mockResolvedValue(updatedStudent);

      // Act
      const result = await controller.updateStudentProfile(
        STUDENT_ID,
        updateStudentDto,
        currentUser,
      );

      // Assert
      expect(result).toBe(updatedStudent);
      expect(mockStudentsService.findStudentById).toHaveBeenCalledWith(STUDENT_ID);
      expect(mockStudentsService.updateStudentProfile).toHaveBeenCalledWith(
        STUDENT_ID,
        updateStudentDto,
      );
    });

    it("should throw UnauthorizedException when trying to update someone else's profile", async () => {
      // Arrange
      const updateStudentDto: UpdateStudentDto = {
        thesis_description: 'Unauthorized update attempt',
      };

      const currentUser: User = {
        id: OTHER_USER_ID,
        clerk_id: OTHER_CLERK_ID,
        email: 'other@superwise.at',
        first_name: 'Other',
        last_name: 'User',
        role: Role.STUDENT,
        profile_image: null,
        is_registered: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockStudent: Student = {
        id: STUDENT_ID,
        thesis_description: 'Original thesis description',
        user_id: USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockStudentsService.findStudentById.mockResolvedValue(mockStudent);

      // Act & Assert
      await expect(
        controller.updateStudentProfile(STUDENT_ID, updateStudentDto, currentUser),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockStudentsService.findStudentById).toHaveBeenCalledWith(STUDENT_ID);
      expect(mockStudentsService.updateStudentProfile).not.toHaveBeenCalled();
    });
  });
});
