import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity'; // Assuming user.entity.ts exists

export class UserBlock {
  @ApiProperty({
    description: 'ID of the user who initiated the block',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  blocker_id: string;

  @ApiProperty({
    description: 'ID of the user who is being blocked',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  blocked_id: string;

  @ApiProperty({
    description: 'Full user object of the user who initiated the block',
    type: () => User,
  })
  blocker: User;

  @ApiProperty({
    description: 'Full user object of the user who is being blocked',
    type: () => User,
  })
  blocked: User;

  @ApiProperty({
    description: 'Timestamp when the block was created',
    example: '2023-01-01T00:00:00Z',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when the block was last updated',
    example: '2023-01-01T00:00:00Z',
    format: 'date-time',
  })
  updated_at: Date;
}
