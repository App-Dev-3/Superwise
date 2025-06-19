import { ApiProperty } from '@nestjs/swagger';

export class PendingRequestCountEntity {
  @ApiProperty({
    description: 'Number of pending supervision requests for the user',
    example: 5,
    minimum: 0,
  })
  pending_count: number;
}
