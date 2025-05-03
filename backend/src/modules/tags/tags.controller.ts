import { Controller, Get, Param, ParseFloatPipe, ParseUUIDPipe, Query } from '@nestjs/common';
import { TagsService } from './tags.service';
import { Tag } from './entities/tag.entity';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TagSimilarity } from './entities/tag-similarity.entity';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({
    status: 200,
    description: 'List of all tags in the system',
    type: [Tag],
  })
  @Get()
  findAllTags(): Promise<Tag[]> {
    return this.tagsService.findAllTags();
  }

  @ApiOperation({ summary: 'Get a tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'The tag with the given ID',
    type: Tag,
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
  })
  @Get(':id')
  findTagById(@Param('id', ParseUUIDPipe) id: string): Promise<Tag> {
    return this.tagsService.findTagById(id);
  }

  @ApiOperation({ summary: 'Get similar tags to a given tag' })
  @ApiParam({ name: 'id', description: 'Tag ID', type: 'string', format: 'uuid' })
  @ApiQuery({
    name: 'minSimilarity',
    description: 'Minimum similarity score (0-1)',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of similar tags with similarity scores',
    type: [TagSimilarity],
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
  })
  @Get(':id/similar')
  findSimilarTagsByTagId(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('minSimilarity', new ParseFloatPipe({ optional: true })) minSimilarity?: number,
  ): Promise<{ tag: Tag; similarity: number }[]> {
    return this.tagsService.findSimilarTagsByTagId(id, minSimilarity);
  }
}
