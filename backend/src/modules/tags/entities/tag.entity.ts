import { ApiProperty } from '@nestjs/swagger';

export class Tag {
  @ApiProperty({
    description: 'The unique identifier for the tag',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the tag',
    example: 'Machine Learning',
    maxLength: 100,
  })
  tag_name: string;

  @ApiProperty({
    description: 'The date and time the tag was created',
    example: '2023-01-01T00:00:00Z',
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'The date and time the tag was last updated',
    example: '2023-01-01T00:00:00Z',
    format: 'date-time',
  })
  updated_at: Date;
}
