import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Student as PrismaStudent, User, SupervisionRequest, ChatRequest } from '@prisma/client';
import { User as UserEntity } from '../../users/entities/user.entity';

export class StudentWithRelations implements PrismaStudent {
  @ApiProperty({
    description: 'Student unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Brief description of thesis or research interests',
    example: 'AI-based recommendation system for supervisor matching',
    nullable: true,
  })
  thesis_description: string | null;

  @ApiProperty({
    description: 'ID of the user this student profile belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  user_id: string;

  @ApiProperty({
    description: 'Timestamp when the student profile was created',
    example: '2023-01-01T00:00:00Z',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when the student profile was last updated',
    example: '2023-01-01T00:00:00Z',
    format: 'date-time',
  })
  updated_at: Date;

  // Relations
  @ApiPropertyOptional({
    description: 'Associated user data',
    type: () => UserEntity,
  })
  user?: User;

  @ApiPropertyOptional({
    description: 'Supervision requests sent by this student',
    type: 'array',
    isArray: true,
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        request_state: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'] },
        student_id: { type: 'string', format: 'uuid' },
        supervisor_id: { type: 'string', format: 'uuid' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  supervision_requests?: SupervisionRequest[];

  @ApiPropertyOptional({
    description: 'Chat requests sent by this student',
    type: 'array',
    isArray: true,
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        request_message: { type: 'string' },
        request_state: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'] },
        student_id: { type: 'string', format: 'uuid' },
        supervisor_id: { type: 'string', format: 'uuid' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  chat_requests?: ChatRequest[];
}
