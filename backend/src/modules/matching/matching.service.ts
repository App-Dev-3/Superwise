import { Injectable, Logger } from '@nestjs/common';
import { Match } from './entity/match.entity';
import { SupervisorsService } from '../supervisors/supervisors.service';
import { UsersService } from '../users/users.service';
import { TagsService } from '../tags/tags.service';
import { UserTag } from '../users/entities/user-tag.entity';
import { safeStringify } from '../../common/utils/string-utils';
import { SupervisionRequestsService } from '../requests/supervision/supervision-requests.service';
import { CacheService } from '../../common/cache';
import { RequestState, Role } from '@prisma/client';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly supervisorsService: SupervisorsService,
    private readonly usersService: UsersService,
    private readonly tagsService: TagsService,
    private readonly supervisionRequestsService: SupervisionRequestsService,
    private readonly cacheService: CacheService,
  ) {}

  async calculateAllMatchesForUserId(studentUserId: string): Promise<Match[]> {
    // Get all available supervisors
    const availableSupervisors = await this.supervisorsService.findAllSupervisors({
      where: {
        available_spots: {
          gt: 0,
        },
      },
      includeRegisteredOnly: true,
    });

    // Get list of supervisors blocked by this student
    const blockedSupervisors =
      await this.usersService.findBlockedSupervisorsByStudentUserId(studentUserId);
    const blockedSupervisorUserIds = new Set(blockedSupervisors.map(block => block.blocked_id));

    // Get student's supervision requests
    const activeRequests = await this.supervisionRequestsService.findAllRequests(
      studentUserId,
      Role.STUDENT,
    );

    // Extract supervisor IDs from pending and accepted requests
    const requestedSupervisorIds = new Set(
      activeRequests
        .filter(
          req =>
            req.request_state === RequestState.PENDING ||
            req.request_state === RequestState.ACCEPTED,
        )
        .map(req => req.supervisor_id),
    );

    const studentTags = await this.usersService.findUserTagsByUserId(studentUserId);

    const matches: Match[] = [];
    for (const supervisor of availableSupervisors) {
      // Skip blocked supervisors
      if (blockedSupervisorUserIds.has(supervisor.user_id)) {
        continue;
      }

      // Skip supervisors with pending or accepted requests
      if (requestedSupervisorIds.has(supervisor.id)) {
        continue;
      }

      const supervisorUserData = await this.usersService.findUserById(supervisor.user_id);
      const supervisorTags = await this.usersService.findUserTagsByUserId(supervisor.user_id);

      const compatibility_score = await this.calculateCompatibilityScore(
        studentTags,
        supervisorTags,
      );

      const tagNames = await Promise.all(
        supervisorTags.map(async tag => {
          const tagInfo = await this.tagsService.findTagById(tag.tag_id);
          return tagInfo?.tag_name || 'Unknown';
        }),
      );

      matches.push({
        supervisorId: supervisor.id,
        supervisor_userId: supervisor.user_id,
        firstName: supervisorUserData?.first_name || '',
        lastName: supervisorUserData?.last_name || '',
        profileImage: supervisorUserData?.profile_image || null,
        compatibilityScore: compatibility_score,
        bio: supervisor.bio ?? '',
        tags: tagNames,
        pendingRequests: 0, // this has to be actually fetched from a service after the request module is done.
        availableSpots: supervisor.available_spots,
        totalSpots: supervisor.total_spots,
      });
    }

    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    return matches;
  }

  private async calculateCompatibilityScore(
    studentTags: UserTag[],
    supervisorTags: UserTag[],
  ): Promise<number> {
    if (!studentTags?.length || !supervisorTags?.length) {
      return 0;
    }

    await this.prefetchTagSimilarities(studentTags, supervisorTags);

    const maxPriority = Math.max(...studentTags.map(tag => tag.priority));

    const tagWeightsRaw = studentTags.map(tag => ({
      tagId: tag.tag_id,
      rawWeight: Math.max(maxPriority + 1 - tag.priority),
    }));

    const totalRawWeight = tagWeightsRaw.reduce((sum, tag) => sum + tag.rawWeight, 0);

    const tagWeights = tagWeightsRaw.map(tag => ({
      tagId: tag.tagId,
      weight: tag.rawWeight / totalRawWeight,
    }));

    let finalScore = 0;

    for (const studentTag of tagWeights) {
      let maxSimilarity = 0;

      for (const supervisorTag of supervisorTags) {
        const similarity = await this.getTagSimilarityFromCache(
          studentTag.tagId,
          supervisorTag.tag_id,
        );
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }

      const contribution = studentTag.weight * maxSimilarity;
      finalScore += contribution;
    }

    return Math.max(0.0, Math.min(1.0, finalScore));
  }

  private async prefetchTagSimilarities(
    studentTags: UserTag[],
    supervisorTags: UserTag[],
  ): Promise<void> {
    // Get all unique tag combinations we need
    const studentTagIds = [...new Set(studentTags.map(tag => tag.tag_id))];
    const supervisorTagIds = [...new Set(supervisorTags.map(tag => tag.tag_id))];
    const allUniqueTagIds = [...new Set([...studentTagIds, ...supervisorTagIds])];

    const missingCombinations: Array<[string, string]> = [];

    // Check which tag combinations are missing from cache
    for (const tagId1 of allUniqueTagIds) {
      for (const tagId2 of allUniqueTagIds) {
        const cached = await this.cacheService.getTagSimilarity(tagId1, tagId2);
        if (cached === null) {
          // Only add unique combinations (avoid duplicates like A-B and B-A)
          const [sortedId1, sortedId2] = [tagId1, tagId2].sort();
          if (!missingCombinations.some(([id1, id2]) => id1 === sortedId1 && id2 === sortedId2)) {
            missingCombinations.push([sortedId1, sortedId2]);
          }
        }
      }
    }

    if (missingCombinations.length === 0) {
      return; // All similarities are cached
    }

    this.logger.debug(`Prefetching similarities for ${missingCombinations.length} combinations`);

    // Fetch missing similarities in batches
    const fetchPromises = missingCombinations.map(([tagId1, tagId2]) =>
      this.fetchAndCacheTagSimilarity(tagId1, tagId2),
    );

    await Promise.allSettled(fetchPromises);
  }

  private async fetchAndCacheTagSimilarity(tagId1: string, tagId2: string): Promise<void> {
    try {
      let similarity: number;

      if (tagId1 === tagId2) {
        similarity = 1.0;
      } else {
        // Fetch from database
        const similarTags = await this.tagsService.findSimilarTagsByTagId(tagId1, 0.0);
        const found = similarTags.find(st => st.tag.id === tagId2);
        similarity = found?.similarity ?? 0.0;
      }

      // Cache the result
      await this.cacheService.setTagSimilarity(tagId1, tagId2, similarity);
    } catch (error) {
      this.logger.error(
        `Error fetching similarity for ${tagId1}-${tagId2}: ${safeStringify(error)}`,
      );
    }
  }

  private async getTagSimilarityFromCache(tagId1: string, tagId2: string): Promise<number> {
    try {
      const cached = await this.cacheService.getTagSimilarity(tagId1, tagId2);
      if (cached !== null) {
        return cached;
      }

      // If not cached, fetch and cache it
      let similarity: number;
      if (tagId1 === tagId2) {
        similarity = 1.0;
      } else {
        const similarTags = await this.tagsService.findSimilarTagsByTagId(tagId1, 0.0);
        const found = similarTags.find(st => st.tag.id === tagId2);
        similarity = found?.similarity ?? 0.0;
      }

      await this.cacheService.setTagSimilarity(tagId1, tagId2, similarity);
      return similarity;
    } catch (error) {
      this.logger.error(
        `Error getting tag similarity from cache for ${tagId1}-${tagId2}: ${safeStringify(error)}`,
      );
      return 0.0;
    }
  }
}
