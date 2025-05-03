import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Tag } from '@prisma/client';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

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
