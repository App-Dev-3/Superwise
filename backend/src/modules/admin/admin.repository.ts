import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Tag, TagSimilarity } from '@prisma/client';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async bulkImport(
    tags: string[],
    similarities: Array<{ field1: string; field2: string; similarity_score: number }>,
  ): Promise<{
    success: boolean;
    message: string;
    tagsProcessed: number;
    similaritiesReplaced: number;
  }> {
    return this.prisma.$transaction(
      async tx => {
        await tx.tag.deleteMany({});

        await tx.tag.createMany({
          data: tags.map(name => ({ tag_name: name })),
          skipDuplicates: false,
        });

        const syncedTags = await tx.tag.findMany({
          where: { tag_name: { in: tags } },
        });

        await tx.tagSimilarity.deleteMany({});

        const tagMap = new Map<string, string>();
        syncedTags.forEach(tag => tagMap.set(tag.tag_name, tag.id));

        const similaritiesData = similarities.map(sim => {
          const tagA_id = tagMap.get(sim.field1);
          const tagB_id = tagMap.get(sim.field2);

          if (!tagA_id) {
            throw new BadRequestException("Tag '${sim.field1}' not found in provided tags list.");
          }
          if (!tagB_id) {
            throw new BadRequestException("Tag '${sim.field2}' not found in provided tags list.");
          }

          return {
            tagA_id,
            tagB_id,
            similarity: sim.similarity_score,
          };
        });

        let replacedCount = 0;
        if (similaritiesData.length > 0) {
          const result = await tx.tagSimilarity.createMany({
            data: similaritiesData,
          });
          replacedCount = result.count;
        }

        return {
          success: true,
          message: 'Tags and similarities imported successfully',
          tagsProcessed: syncedTags.length,
          similaritiesReplaced: replacedCount,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      },
    );
  }
}
