import { ApiProperty } from '@nestjs/swagger';

export class Student {
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
}
