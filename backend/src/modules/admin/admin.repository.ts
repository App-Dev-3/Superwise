import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async tagsBulkImport(
    tags: string[],
    similarities: Array<{ field1: string; field2: string; similarity_score: number }>,
  ): Promise<{
    success: boolean;
    message: string;
    tagsProcessed: number;
    similaritiesReplaced: number;
    duplicateTagsSkipped: number;
    duplicateSimsSkipped: number;
  }> {
    return this.prisma.$transaction(
      async tx => {
        const normalizedTags = tags.map(tag => tag.toLowerCase());

        const existingTags = await tx.tag.findMany({
          where: { tag_name: { in: normalizedTags } },
        });

        const existingTagNames = new Set(existingTags.map(tag => tag.tag_name));
        const newTags = normalizedTags.filter(tag => !existingTagNames.has(tag));

        if (newTags.length > 0) {
          await tx.tag.createMany({
            data: newTags.map(name => ({ tag_name: name })),
            skipDuplicates: true,
          });
        }

        const syncedTags = await tx.tag.findMany({
          where: { tag_name: { in: normalizedTags } },
        });

        await tx.tagSimilarity.deleteMany({});

        const tagMap = new Map<string, string>();
        syncedTags.forEach(tag => tagMap.set(tag.tag_name, tag.id));

        const similaritiesData = similarities.map(sim => {
          const tagA_id = tagMap.get(sim.field1.toLowerCase());
          const tagB_id = tagMap.get(sim.field2.toLowerCase());

          if (!tagA_id) {
            throw new BadRequestException(`Tag '${sim.field1}' not found in provided tags list.`);
          }
          if (!tagB_id) {
            throw new BadRequestException(`Tag '${sim.field2}' not found in provided tags list.`);
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
            skipDuplicates: true,
          });
          replacedCount = result.count;
        }

        return {
          success: true,
          message: `${newTags.length} new tags added, ${existingTags.length} tags already existed`,
          tagsProcessed: newTags.length,
          similaritiesReplaced: replacedCount,
          duplicateTagsSkipped: tags.length - new Set(tags).size,
          duplicateSimsSkipped: similarities.length - replacedCount,
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
