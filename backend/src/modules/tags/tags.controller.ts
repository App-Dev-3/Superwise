import { Controller, Get, Param, ParseFloatPipe, ParseUUIDPipe, Query } from '@nestjs/common';
import { TagsService } from './tags.service';
import { Tag } from './entities/tag.entity';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TagSimilarity } from './entities/tag-similarity.entity';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @ApiOperation({
    summary: 'Get all tags',
    description:
      'Retrieves a list of all available tags in the system that can be used for searching and filtering users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved list of all tags in the system',
    type: [Tag],
  })
  @Get()
  findAllTags(): Promise<Tag[]> {
    return this.tagsService.findAllTags();
  }

  @ApiOperation({
    summary: 'Get a tag by ID',
    description: 'Retrieves detailed information about a specific tag identified by its UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tag unique identifier (UUID)',
    type: 'string',
    format: 'uuid',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the tag with the given ID',
    type: Tag,
  })
  @ApiResponse({
    status: 404,
    description: 'Tag with the specified ID was not found in the system',
  })
  @Get(':id')
  findTagById(@Param('id', ParseUUIDPipe) id: string): Promise<Tag> {
    return this.tagsService.findTagById(id);
  }

  @ApiOperation({
    summary: 'Get similar tags to a given tag',
    description:
      'Finds tags that are semantically similar to the specified tag, with optional minimum similarity threshold.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tag unique identifier (UUID)',
    type: 'string',
    format: 'uuid',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiQuery({
    name: 'minSimilarity',
    description:
      'Minimum similarity score threshold (0-1). Only tags with similarity scores above this value will be returned.',
    required: false,
    type: Number,
    example: 0.5,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved list of similar tags with their similarity scores',
    type: [TagSimilarity],
  })
  @ApiResponse({
    status: 404,
    description: 'Tag with the specified ID was not found in the system',
  })
  @Get(':id/similar')
  findSimilarTagsByTagId(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('minSimilarity', new ParseFloatPipe({ optional: true })) minSimilarity?: number,
  ): Promise<{ tag: Tag; similarity: number }[]> {
    return this.tagsService.findSimilarTagsByTagId(id, minSimilarity);
  }
}
