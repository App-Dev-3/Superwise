import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { StudentsRepository } from './students.repository';
import { Prisma, Student } from '@prisma/client';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentWithRelations } from './entities/student-with-relations.entity';

@Injectable()
export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  async findStudentById(id: string): Promise<Student> {
    const student = await this.studentsRepository.findStudentById(id);

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  async findStudentByIdWithRelations(id: string): Promise<StudentWithRelations> {
    const student = await this.studentsRepository.findStudentByIdWithRelations(id);

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student as StudentWithRelations;
  }

  async findStudentByUserId(userId: string): Promise<Student> {
    const student = await this.studentsRepository.findStudentByUserId(userId);

    if (!student) {
      throw new NotFoundException(`Student profile for user ID ${userId} not found`);
    }
    return student;
  }

  async findAllStudents(params: {
    take?: number;
    where?: Prisma.StudentWhereInput;
    orderBy?: Prisma.StudentOrderByWithRelationInput;
  }) {
    return this.studentsRepository.findAllStudents(params);
  }

  async createStudentProfile(data: {
    thesis_description?: string;
    user_id: string;
  }): Promise<Student> {
    // Check if a profile already exists for this user
    const existingProfile = await this.studentsRepository.findStudentByUserId(data.user_id);

    if (existingProfile) {
      throw new ConflictException(`A student profile already exists for user ID ${data.user_id}`);
    }

    return this.studentsRepository.createStudentProfile(data);
  }

  async updateStudentProfile(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    // First check if student exists
    await this.findStudentById(id);

    return this.studentsRepository.updateStudentProfile(id, updateStudentDto);
  }
}
