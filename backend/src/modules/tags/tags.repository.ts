import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Tag } from './entities/tag.entity';

export interface ITagsRepository {
  findAllTags(): Promise<Tag[]>;
  findTagById(id: string): Promise<Tag | null>;
  findTagByName(tag_name: string): Promise<Tag | null>;
  findSimilarTagsByTagId(
    tagId: string,
    minSimilarity?: number,
  ): Promise<{ tag: Tag; similarity: number }[]>;
}

@Injectable()
export class TagsRepository implements ITagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllTags(): Promise<Tag[]> {
    return this.prisma.tag.findMany({
      orderBy: {
        tag_name: 'asc',
      },
    });
  }

  async findTagById(id: string): Promise<Tag | null> {
    return this.prisma.tag.findUnique({
      where: { id },
    });
  }

  async findTagByName(tag_name: string): Promise<Tag | null> {
    return this.prisma.tag.findUnique({
      where: { tag_name },
    });
  }

  async findSimilarTagsByTagId(
    tagId: string,
    minSimilarity = 0.0,
  ): Promise<{ tag: Tag; similarity: number }[]> {
    // Find tags that are similar to the given tag (as TagA)
    const similaritiesAsTagA = await this.prisma.tagSimilarity.findMany({
      where: {
        tagA_id: tagId,
        similarity: { gte: minSimilarity },
      },
      include: {
        tagB: true,
      },
      orderBy: {
        similarity: 'desc',
      },
    });

    // Find tags that are similar to the given tag (as TagB)
    const similaritiesAsTagB = await this.prisma.tagSimilarity.findMany({
      where: {
        tagB_id: tagId,
        similarity: { gte: minSimilarity },
      },
      include: {
        tagA: true,
      },
      orderBy: {
        similarity: 'desc',
      },
    });

    // Combine the results
    const similarTagsAsA = similaritiesAsTagA.map(similarity => ({
      tag: similarity.tagB,
      similarity: similarity.similarity,
    }));

    const similarTagsAsB = similaritiesAsTagB.map(similarity => ({
      tag: similarity.tagA,
      similarity: similarity.similarity,
    }));

    return [...similarTagsAsA, ...similarTagsAsB];
  }
}
