import { ApiProperty } from '@nestjs/swagger';
import { Tag } from './tag.entity';

export class TagSimilarity {
  @ApiProperty({
    description: 'The related tag with its full details',
    type: () => Tag,
    example: {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      tag_name: 'Machine Learning',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  })
  tag: Tag;

  @ApiProperty({
    description: 'Similarity score between two tags (0-1, where 1 is identical)',
    example: 0.85,
    minimum: 0,
    maximum: 1,
    type: Number,
  })
  similarity: number;
}
