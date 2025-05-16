import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupervisionRequest, RequestState } from '@prisma/client';

export class SupervisionRequestEntity implements SupervisionRequest {
  @ApiProperty({
    description: 'Unique identifier for the supervision request',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Current state of the supervision request',
    enum: RequestState,
    example: RequestState.PENDING,
  })
  request_state: RequestState;

  @ApiProperty({
    description: 'ID of the student who sent the request',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  student_id: string;

  @ApiProperty({
    description: 'ID of the supervisor who received the request',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  supervisor_id: string;

  @ApiProperty({
    description: 'When the request was created',
    example: '2023-01-01T00:00:00Z',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'When the request was last updated',
    example: '2023-01-01T00:00:00Z',
    format: 'date-time',
  })
  updated_at: Date;

  @ApiPropertyOptional({
    description: 'Indicates if a new student account was created during this request',
    type: Boolean,
  })
  studentWasCreated?: boolean;
}
