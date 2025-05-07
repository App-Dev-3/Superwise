import { ApiProperty } from '@nestjs/swagger';

export class Match {
  @ApiProperty({
    description: 'The unique identifier of the student in this match',
    example: '5f8d0d55b54764421b7156f1'
  })
  studentId: string;

  @ApiProperty({
    description: 'The unique identifier of the supervisor in this match',
    example: '5f8d0d55b54764421b7156f2'
  })
  supervisorId: string;

  @ApiProperty({
    description: 'Compatibility score between student and supervisor (0-1)',
    example: 85,
    minimum: 0,
    maximum: 1
  })
  compatibilityScore: number;
}