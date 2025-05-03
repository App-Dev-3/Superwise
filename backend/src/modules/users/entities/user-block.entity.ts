import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity'; // Assuming user.entity.ts exists

export class UserBlock {
  @ApiProperty({ description: 'The user initiating the block' })
  blocker_id: string;

  @ApiProperty({ description: 'The user being blocked' })
  blocked_id: string;

  @ApiProperty({ description: 'The user initiating the block' })
  blocker: User; // Use the User entity here

  @ApiProperty({ description: 'The user being blocked' })
  blocked: User; // Use the User entity here

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
