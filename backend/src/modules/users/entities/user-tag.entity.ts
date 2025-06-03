import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Tag } from '../../tags/entities/tag.entity';

export class UserTag {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user_id: string;

  @ApiProperty({
    description: 'Tag ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  tag_id: string;

  @ApiPropertyOptional({ description: 'Related tag details' })
  tag?: Tag;

  @ApiProperty({
    description: 'Priority of this tag for the user (lower is higher priority)',
    example: 1,
  })
  priority: number;

  @ApiProperty({
    description: 'When the user-tag association was created',
    example: '2023-01-01T00:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'When the user-tag association was last updated',
    example: '2023-01-01T00:00:00Z',
  })
  updated_at: Date;
}
