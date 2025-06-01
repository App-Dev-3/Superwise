import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Role, User } from '@prisma/client';
import { SupervisorDto } from './dto/supervisors-bulk-import.dto';

export interface IAdminRepository {
  tagsBulkImport(
    tags: string[],
    similarities: Array<{ field1: string; field2: string; similarity_score: number }>,
  ): Promise<{
    success: boolean;
    message: string;
    tagsProcessed: number;
    similaritiesReplaced: number;
    duplicateTagsSkipped: number;
    duplicateSimsSkipped: number;
  }>;

  supervisorsBulkImport(supervisors: SupervisorDto[]): Promise<{
    success: boolean;
    message: string;
    supervisorsImported: number;
    supervisorsUpdated: number;
  }>;

  createAdmin(adminData: { email: string; first_name: string; last_name: string }): Promise<User>;
}

@Injectable()
export class AdminRepository implements IAdminRepository {
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

  async supervisorsBulkImport(supervisors: SupervisorDto[]): Promise<{
    success: boolean;
    message: string;
    supervisorsImported: number;
    supervisorsUpdated: number;
  }> {
    return this.prisma.$transaction(
      async tx => {
        let newSupervisorsCount = 0;
        let updatedSupervisorsCount = 0;

        for (const supervisor of supervisors) {
          if (!supervisor.email) {
            throw new BadRequestException(
              `Email is required for supervisor${supervisor.last_name ? ': ' + supervisor.last_name : ''}`,
            );
          }

          let user = await tx.user.findUnique({
            where: { email: supervisor.email },
          });

          if (!user) {
            if (!supervisor.first_name || !supervisor.last_name) {
              throw new BadRequestException(
                `First name and last name are required when creating a new supervisor with email: ${supervisor.email}`,
              );
            }

            user = await tx.user.create({
              data: {
                email: supervisor.email,
                first_name: supervisor.first_name,
                last_name: supervisor.last_name,
                role: Role.SUPERVISOR,
                is_registered: false,
              },
            });

            newSupervisorsCount++;
          }

          const existingProfile = await tx.supervisor.findUnique({
            where: { user_id: user.id },
          });

          if (existingProfile) {
            await tx.supervisor.update({
              where: { id: existingProfile.id },
              data: {
                total_spots:
                  supervisor.total_spots !== undefined
                    ? supervisor.total_spots
                    : existingProfile.total_spots,
                available_spots:
                  supervisor.available_spots !== undefined
                    ? supervisor.available_spots
                    : supervisor.total_spots !== undefined
                      ? supervisor.total_spots
                      : existingProfile.available_spots,
              },
            });

            updatedSupervisorsCount++;
          } else {
            await tx.supervisor.create({
              data: {
                user_id: user.id,
                total_spots: supervisor.total_spots || 0,
                available_spots:
                  supervisor.available_spots !== undefined
                    ? supervisor.available_spots
                    : supervisor.total_spots || 0,
              },
            });
          }
        }

        let message = '';
        if (newSupervisorsCount > 0 && updatedSupervisorsCount > 0) {
          message = `${newSupervisorsCount} new supervisors successfully imported and ${updatedSupervisorsCount} existing supervisors updated`;
        } else if (newSupervisorsCount > 0) {
          message = `${newSupervisorsCount} new supervisors successfully imported`;
        } else if (updatedSupervisorsCount > 0) {
          message = `${updatedSupervisorsCount} existing supervisors successfully updated`;
        } else {
          message = `No supervisors imported or updated`;
        }

        return {
          success: true,
          message,
          supervisorsImported: newSupervisorsCount,
          supervisorsUpdated: updatedSupervisorsCount,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      },
    );
  }

  /**
   * Creates a new admin user in the database
   *
   * This low-level method handles the actual database creation of an admin user.
   * It sets is_registered to false, following the pattern established for supervisors,
   * allowing the admin to later claim their account through Clerk authentication
   * @param adminData - Basic user data (email, first name, last name)
   * @returns The created User entity
   */
  async createAdmin(adminData: {
    email: string;
    first_name: string;
    last_name: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: adminData.email,
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        role: Role.ADMIN,
        is_registered: false,
      },
    });
  }
}
