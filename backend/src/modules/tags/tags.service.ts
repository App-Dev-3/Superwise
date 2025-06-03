import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TagsRepository } from './tags.repository';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepository: TagsRepository) {}

  async findAllTags(): Promise<Tag[]> {
    return this.tagsRepository.findAllTags();
  }

  async findTagById(id: string): Promise<Tag> {
    const tag = await this.tagsRepository.findTagById(id);
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  async findSimilarTagsByTagId(
    tagId: string,
    minSimilarity = 0.0,
  ): Promise<{ tag: Tag; similarity: number }[]> {
    // Validate minSimilarity
    if (minSimilarity < 0 || minSimilarity > 1) {
      throw new BadRequestException('minSimilarity must be between 0 and 1 (inclusive)');
    }

    // Check if the tag exists
    await this.findTagById(tagId);
    // findTagById will throw NotFoundException if tag doesn't exist

    return this.tagsRepository.findSimilarTagsByTagId(tagId, minSimilarity);
  }
}
