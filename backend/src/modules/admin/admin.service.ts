import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminRepository } from './admin.repository';
import { TagsRepository } from '../tags/tags.repository';
import { BulkImportDto } from './dto/bulk-import.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminRepository: AdminRepository,
    private readonly tagsRepository: TagsRepository,
  ) {}

  async bulkImport(dto: BulkImportDto) {
    return this.prisma.$transaction(async prismaTx => {
      const tags = await this.adminRepository.syncTags(prismaTx, dto.tags);

      const tagMap = new Map<string, string>();
      for (const tag of tags) {
        tagMap.set(tag.tag_name, tag.id);
      }

      const similaritiesData: Array<{ tagA_id: string; tagB_id: string; similarity: number }> = [];

      for (const similarity of dto.similarities) {
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

      const replacedCount = await this.adminRepository.replaceSimilarities(
        prismaTx,
        similaritiesData,
      );

      return {
        success: true,
        message: 'Tags and similarities imported successfully',
        tagsProcessed: tags.length,
        similaritiesReplaced: replacedCount,
      };
    });
  }
}
