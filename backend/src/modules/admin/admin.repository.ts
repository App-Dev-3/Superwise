import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Tag } from '@prisma/client';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async bulkImport(
    tags: string[],
    similarities: Array<{ field1: string; field2: string; similarity_score: number }>,
  ) {
    return this.prisma.$transaction(async prismaTx => {
      const syncedTags = await this.syncTags(prismaTx, tags);

      const tagMap = new Map<string, string>();
      for (const tag of syncedTags) {
        tagMap.set(tag.tag_name, tag.id);
      }

      const similaritiesData: Array<{ tagA_id: string; tagB_id: string; similarity: number }> = [];

      for (const similarity of similarities) {
        const tagA_id = tagMap.get(similarity.field1);
        const tagB_id = tagMap.get(similarity.field2);

        if (!tagA_id) {
          throw new BadRequestException(
            `Tag '${similarity.field1}' from similarities not found in provided tags list.`,
          );
        }

        if (!tagB_id) {
          throw new BadRequestException(
            `Tag '${similarity.field2}' from similarities not found in provided tags list.`,
          );
        }

        similaritiesData.push({
          tagA_id,
          tagB_id,
          similarity: similarity.similarity_score,
        });
      }

      const replacedCount = await this.replaceSimilarities(prismaTx, similaritiesData);

      return {
        tags: syncedTags,
        replacedCount,
      };
    });
  }

  async syncTags(prismaTx: Prisma.TransactionClient, tagNames: string[]): Promise<Tag[]> {
    const existingTags = await prismaTx.tag.findMany({
      where: {
        tag_name: {
          in: tagNames,
        },
      },
    });

    const existingTagNames = existingTags.map(tag => tag.tag_name);
    const missingTagNames = tagNames.filter(name => !existingTagNames.includes(name));

    if (missingTagNames.length > 0) {
      await prismaTx.tag.createMany({
        data: missingTagNames.map(name => ({ tag_name: name })),
        skipDuplicates: true,
      });
    }

    return prismaTx.tag.findMany({
      where: {
        tag_name: {
          in: tagNames,
        },
      },
    });
  }

  async replaceSimilarities(
    prismaTx: Prisma.TransactionClient,
    similaritiesData: Array<{ tagA_id: string; tagB_id: string; similarity: number }>,
  ): Promise<number> {
    await prismaTx.tagSimilarity.deleteMany({});

    const result = await prismaTx.tagSimilarity.createMany({
      data: similaritiesData,
    });

    return result.count;
  }
}
