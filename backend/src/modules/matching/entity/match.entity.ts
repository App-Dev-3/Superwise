import { ApiProperty } from '@nestjs/swagger';

export class Match {
  @ApiProperty({
    description: 'The unique identifier of the supervisor in this match',
    example: '5f8d0d55b54764421b7156f2',
  })
  supervisorId: string;

  @ApiProperty({
    description: 'Compatibility score between student and supervisor (0-1)',
    example: 0.85,
    minimum: 0,
    maximum: 1,
  })
  compatibilityScore: number;

  @ApiProperty({
    description: 'The supervisor bio',
    example: 'Professor specializing in artificial intelligence and machine learning',
  })
  bio: string;
  @ApiProperty({
    description: 'The supervisor tags',
    example: ['Machine Learning', 'AI'],
    isArray: true,
  })
  tags: string[];
  @ApiProperty({
    description: 'Available supervision spots',
    example: 3,
  })
  availableSpots: number;

  @ApiProperty({
    description: 'Total supervision spots',
    example: 5,
  })
  totalSpots: number;

  @ApiProperty({
    description: 'Number of pending requests for this supervisor',
    example: 2,
  })
  pendingRequests: number;
}
