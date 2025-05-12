import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: "User's Clerk ID. Available if the user is registered via Clerk.",
    example: 'user_2VgdKDGF1Y3oMf4QmIaYM0uyvlY',
    nullable: true,
  })
  clerk_id: string | null;

  @ApiProperty({ description: 'User email address', example: 'studentId@fhstp.ac.at' })
  email: string;

  @ApiProperty({ description: 'User first name', example: 'Max' })
  first_name: string;

  @ApiProperty({ description: 'User last name', example: 'Mustermann' })
  last_name: string;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: 'STUDENT',
  })
  role: Role;

  @ApiProperty({
    description: 'URL to user profile image',
    example: 'https://example.com/images/profile.jpg',
    nullable: true,
  })
  profile_image: string | null;

  @ApiProperty({
    description: 'Whether user has completed registration and is linked to clerk auth provider',
    example: true,
  })
  is_registered: boolean;

  @ApiProperty({
    description: 'Whether user has been deleted (soft deletion)',
    example: false,
  })
  is_deleted: boolean;

  @ApiProperty({
    description: 'Timestamp when user was created',
    example: '2023-01-01T00:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when user was last updated',
    example: '2023-01-01T00:00:00Z',
  })
  updated_at: Date;
}
