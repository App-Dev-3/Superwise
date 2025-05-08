import { ApiProperty } from '@nestjs/swagger';

export class Match {
  @ApiProperty({
    description: 'The unique identifier of the supervisor in this match',
    example: '15d2a5bc-c547-444d-91fb-b1c498ada33c',
  })
  supervisor_userId: string;

  @ApiProperty({
    description: "The supervisor's first name",
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: "The supervisor's last name",
    example: 'Smith',
  })
  lastName: string;

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
