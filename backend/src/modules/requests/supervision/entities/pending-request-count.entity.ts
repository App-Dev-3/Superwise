import { ApiProperty } from '@nestjs/swagger';

export class SupervisionRequestCountEntity {
  @ApiProperty({
    description: 'Number of supervision requests for the user with the specified state',
    example: 5,
    minimum: 0,
  })
  request_count: number;
}
