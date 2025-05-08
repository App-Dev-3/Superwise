import { ApiProperty } from '@nestjs/swagger';

export class Match {
  @ApiProperty({
    description: 'The unique identifier of the student in this match',
    example: '15d2a5bc-c547-444d-91fb-b1c498ada33c',
  })
  studentId: string;

  @ApiProperty({
    description: 'The unique identifier of the supervisor in this match',
    example: '15d2a5bc-c547-444d-91fb-b1c498ada33c',
  })
  supervisorId: string;

  @ApiProperty({
    description: 'Compatibility score between student and supervisor (0-1)',
    example: 0.85,
    minimum: 0,
    maximum: 1,
  })
  compatibilityScore: number;
}
