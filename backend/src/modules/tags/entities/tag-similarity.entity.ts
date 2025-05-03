import { ApiProperty } from '@nestjs/swagger';
import { Tag } from './tag.entity';

export class TagSimilarity {
  @ApiProperty({
    description: 'The related tag',
    type: () => Tag,
  })
  tag: Tag;

  @ApiProperty({
    description: 'Similarity score between tags (0-1)',
    example: 0.85,
    minimum: 0,
    maximum: 1,
  })
  similarity: number;
}
