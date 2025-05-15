import { ApiProperty } from '@nestjs/swagger';
import { Supervisor as PrismaSupervisor } from '@prisma/client';

export class Supervisor implements PrismaSupervisor {
  @ApiProperty({
    description: 'The unique identifier of the supervisor',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The user ID associated with this supervisor',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  user_id: string;

  @ApiProperty({
    description: 'Supervisor bio or description',
    example: 'Professor specializing in artificial intelligence and machine learning',
    nullable: true,
  })
  bio: string | null;

  @ApiProperty({
    description: 'Number of available supervision spots',
    example: 3,
  })
  available_spots: number;

  @ApiProperty({
    description: 'Total number of supervision spots',
    example: 5,
  })
  total_spots: number;

  @ApiProperty({
    description: 'Date when the supervisor profile was created',
    example: '2023-01-01T00:00:00Z',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date when the supervisor profile was last updated',
    example: '2023-01-01T00:00:00Z',
    format: 'date-time',
  })
  updated_at: Date;
}