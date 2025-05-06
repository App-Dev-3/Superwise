import { Type } from 'class-transformer';
import { IsArray, IsString, IsNumber, ValidateNested, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SimilarityItemDto {
  @ApiProperty({
    description: 'First tag name in the similarity relationship',
    example: 'JavaScript',
  })
  @IsString()
  field1: string;

  @ApiProperty({
    description: 'Second tag name in the similarity relationship',
    example: 'TypeScript',
  })
  @IsString()
  field2: string;

  @ApiProperty({
    description: 'Similarity score between the two tags (0-1)',
    minimum: 0,
    maximum: 1,
    example: 0.85,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  similarity_score: number;
}

export class BulkImportDto {
  @ApiProperty({
    description: 'List of all tag names to be imported',
    isArray: true,
    type: [String],
    example: ['JavaScript', 'TypeScript', 'React', 'Vue'],
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    description: 'List of similarity relationships between tags',
    isArray: true,
    type: [SimilarityItemDto],
    example: [
      { field1: 'JavaScript', field2: 'TypeScript', similarity_score: 0.85 },
      { field1: 'React', field2: 'Vue', similarity_score: 0.7 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimilarityItemDto)
  similarities: SimilarityItemDto[];
}
