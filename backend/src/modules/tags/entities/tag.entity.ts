import { ApiProperty } from '@nestjs/swagger';

export class Tag {
  @ApiProperty({ description: 'The unique identifier for the tag' })
  id: string;

  @ApiProperty({ description: 'The name of the tag' })
  tag_name: string;

  @ApiProperty({ description: 'The date and time the tag was created' })
  created_at: Date;

  @ApiProperty({ description: 'The date and time the tag was last updated' })
  updated_at: Date;
}
