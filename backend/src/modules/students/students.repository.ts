import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Student } from '@prisma/client';
import { StudentWithRelations } from './entities/student-with-relations.entity';

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findStudentById(id: string): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: { id },
    });
  }

  async findStudentByIdWithRelations(id: string): Promise<StudentWithRelations | null> {
    return this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        supervision_requests: true,
        chat_requests: true,
      },
    });
  }

  async findStudentByUserId(userId: string): Promise<Student | null> {
    return this.prisma.student.findUnique({
      where: { user_id: userId },
    });
  }

  async findAllStudents(params: {
    take?: number;
    where?: Prisma.StudentWhereInput;
    orderBy?: Prisma.StudentOrderByWithRelationInput;
  }): Promise<Student[]> {
    const { take, where, orderBy } = params;

    return this.prisma.student.findMany({
      take,
      where,
      orderBy,
    });
  }

  async createStudentProfile(data: {
    thesis_description?: string;
    user_id: string;
  }): Promise<Student> {
    return this.prisma.student.create({
      data: {
        thesis_description: data.thesis_description,
        user: {
          connect: {
            id: data.user_id,
          },
        },
      },
    });
  }

  async updateStudentProfile(
    id: string,
    data: {
      thesis_description?: string;
    },
  ): Promise<Student> {
    return this.prisma.student.update({
      where: { id },
      data,
    });
  }
}
