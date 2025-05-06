import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User, Student, Supervisor, UserTag, Role, UserBlock } from '@prisma/client';

export class UserWithRelations implements User {
  @ApiProperty({
    description: 'User unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'studentId@fhstp.ac.at',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Max',
  })
  first_name: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Mustermann',
  })
  last_name: string;

  @ApiProperty({
    description: 'User role in the system (STUDENT, SUPERVISOR, or ADMIN)',
    enum: Role,
    example: 'STUDENT',
    enumName: 'Role',
  })
  role: Role;

  @ApiProperty({
    description: 'URL to user profile image (null if not set)',
    example: 'https://example.com/images/profile.jpg',
    nullable: true,
  })
  profile_image: string | null;

  @ApiProperty({
    description: 'Whether user has completed registration process',
    example: true,
    type: Boolean,
  })
  is_registered: boolean;

  @ApiProperty({
    description: 'Whether user has been soft deleted from the system',
    example: false,
    type: Boolean,
  })
  is_deleted: boolean;

  @ApiProperty({
    description: 'Timestamp when user was created',
    example: '2023-01-01T00:00:00Z',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when user was last updated',
    example: '2023-01-01T00:00:00Z',
    format: 'date-time',
  })
  updated_at: Date;

  // Relations
  @ApiPropertyOptional({
    description: 'Student profile data if the user is a student',
    nullable: true,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      thesis_idea: 'AI-based recommendation system for supervisor matching',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  })
  student_profile?: Student;

  @ApiPropertyOptional({
    description: 'Supervisor profile data if the user is a supervisor',
    nullable: true,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      bio: 'I specialize in AI and machine learning with 15+ years of industry and academic experience. My current research focuses on ethical AI applications in healthcare. I enjoy mentoring students who are passionate about pushing the boundaries of technology.',
      max_slots: 5,
      current_slots: 2,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  })
  supervisor_profile?: Supervisor;

  @ApiPropertyOptional({
    description: 'List of tags associated with this user and their priorities',
    isArray: true,
    example: [
      {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        tag_id: 'abc4567-e89b-12d3-a456-426614174001',
        priority: 1,
        tag: {
          id: 'abc4567-e89b-12d3-a456-426614174001',
          tag_name: 'Machine Learning',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
      {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        tag_id: 'def4567-e89b-12d3-a456-426614174002',
        priority: 2,
        tag: {
          id: 'def4567-e89b-12d3-a456-426614174002',
          tag_name: 'Data Science',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ],
  })
  tags?: UserTag[];

  @ApiPropertyOptional({
    description: 'List of users blocked by this user',
    isArray: true,
    example: [
      {
        blocker_id: '123e4567-e89b-12d3-a456-426614174000',
        blocked_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ],
  })
  blocked_users?: UserBlock[];

  @ApiPropertyOptional({
    description: 'List of users who have blocked this user',
    isArray: true,
    example: [
      {
        blocker_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        blocked_id: '123e4567-e89b-12d3-a456-426614174000',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      },
    ],
  })
  blocked_by_users?: UserBlock[];
}
