import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UnauthorizedException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { ApiOperation, ApiTags, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all students with optional filtering' })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of student profiles',
  })
  async findAllStudents(@Query('take') take?: number) {
    return this.studentsService.findAllStudents({
      take: take ? Number(take) : undefined,
      orderBy: { user: { last_name: 'asc' } },
    });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get a student by User ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a student profile',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async findStudentByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.studentsService.findStudentByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student by ID' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a student profile',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async findStudentById(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.findStudentById(id);
  }

  @Post()
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Create a new student profile' })
  @ApiResponse({
    status: 201,
    description: 'Student profile created successfully',
  })
  async createStudentProfile(
    @Body() createStudentDto: CreateStudentDto,
    @CurrentUser() currentUser: User,
  ) {
    // Student can only create their own profile
    return this.studentsService.createStudentProfile({
      ...createStudentDto,
      user_id: currentUser.id,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a student profile' })
  @ApiParam({ name: 'id', description: 'Student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async updateStudentProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @CurrentUser() currentUser: User,
  ) {
    // Get the student to verify ownership
    const student = await this.studentsService.findStudentById(id);

    // Allow student to update their own profile or admin to update any profile
    if (student.user_id === currentUser.id || currentUser.role === Role.ADMIN) {
      return this.studentsService.updateStudentProfile(id, updateStudentDto);
    }

    throw new UnauthorizedException('You do not have permission to update this student profile');
  }
}
