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
    const existingTags = await this.prisma.tag.findMany({
      where: {
        tag_name: {
          in: tags,
        },
      },
    });

    const existingTagNames = existingTags.map(tag => tag.tag_name);
    const missingTagNames = tags.filter(name => !existingTagNames.includes(name));

    const operations: Array<
      Prisma.PrismaPromise<Prisma.BatchPayload> | Prisma.PrismaPromise<Tag[]>
    > = [];

    if (missingTagNames.length > 0) {
      operations.push(
        this.prisma.tag.createMany({
          data: missingTagNames.map(name => ({ tag_name: name })),
          skipDuplicates: true,
        }),
      );
    }

    const getAllTagsOpIndex = operations.length;
    operations.push(
      this.prisma.tag.findMany({
        where: {
          tag_name: {
            in: tags,
          },
        },
      }),
    );

    operations.push(this.prisma.tagSimilarity.deleteMany({}));

    const results = await this.prisma.$transaction(operations);

    const syncedTags = results[getAllTagsOpIndex] as Tag[];

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

    let replacedCount = 0;
    if (similaritiesData.length > 0) {
      const result = await this.prisma.tagSimilarity.createMany({
        data: similaritiesData,
      });
      replacedCount = result.count;
    }

    return {
      tags: syncedTags,
      replacedCount,
    };
  }
}
