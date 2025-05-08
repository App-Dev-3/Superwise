import { Injectable, Logger } from '@nestjs/common';
import { Match } from './entity/match.entity';
import { SupervisorsService } from '../supervisors/supervisors.service';
import { UsersService } from '../users/users.service';
import { TagsService } from '../tags/tags.service';
import { UserTag } from '../users/entities/user-tag.entity';
import { safeStringify } from '../../common/utils/string-utils';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);
  private tagSimilarityCache: Record<string, Record<string, number>> = {};
  // cache expiration time (24 hours in ms)
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000;
  private cacheLastRefreshed: Date = new Date();

  constructor(
    private readonly supervisorsService: SupervisorsService,
    private readonly usersService: UsersService,
    private readonly tagsService: TagsService,
  ) {}
  async calculateAllMatchesForUserId(studentId: string): Promise<Match[]> {
    this.checkCacheExpiration();
    const matches: Match[] = [];

    const availableSupervisors = await this.supervisorsService.findAllSupervisors({
      where: {
        available_spots: {
          gt: 0,
        },
      },
    });

    const studentTags = await this.usersService.findUserTagsByUserId(studentId);

    for (const supervisor of availableSupervisors) {
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
        const similarity = this.getTagSimilarityFromCache(studentTag.tagId, supervisorTag.tag_id);
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
    // the purpose of those is to get a set that contains all uniqe
    // needed tags for the calculation and fetches them all.
    const studentTagIds = [...new Set(studentTags.map(tag => tag.tag_id))];
    const supervisorTagIds = [...new Set(supervisorTags.map(tag => tag.tag_id))];
    const allUniqueTagIds = [...new Set([...studentTagIds, ...supervisorTagIds])];

    const tagsToFetch = new Set<string>();

    // but we still need to check if a tag is not stored in cache to fetch it
    // then we check if we have for each tag in the list a
    // pair of this tag with all other tags.
    for (const tagId of allUniqueTagIds) {
      this.ensureCacheInitialized(tagId);

      // Check if we need to fetch data for this tag
      let needsFetching = false;

      // here i check if we have all tags combinations needed or not
      for (const otherTagId of allUniqueTagIds) {
        if (this.tagSimilarityCache[tagId][otherTagId] === undefined) {
          needsFetching = true;
          break;
        }
      }

      if (needsFetching) {
        tagsToFetch.add(tagId);
      }
    }

    const tagsToFetchArray = [...tagsToFetch];

    if (tagsToFetchArray.length === 0) {
      return; // if all similarites we need are cached
    }

    this.logger.debug(`Prefetching similarities for ${tagsToFetchArray.length} tags`);

    // here we get similarities for tags that need updating
    const fetchPromises = tagsToFetchArray.map(tagId => this.fetchAndCacheTagSimilarities(tagId));

    // we wait for all fetches to complete, with retries for failures
    // (shouldnt happen but who knows)
    await Promise.allSettled(fetchPromises);
  }

  private async fetchAndCacheTagSimilarities(tagId: string, retryCount = 2): Promise<void> {
    try {
      // here we find for one tag the similairties of all other tags
      const similarTags = await this.tagsService.findSimilarTagsByTagId(tagId, 0.0);

      //  self-similarity (always 1.0)
      this.setSimilarityBidirectional(tagId, tagId, 1.0);

      for (const similarTag of similarTags) {
        this.setSimilarityBidirectional(tagId, similarTag.tag.id, similarTag.similarity);
      }
    } catch (error) {
      this.logger.error(`Error fetching similarities for tag ${tagId}: ${safeStringify(error)}`);

      if (retryCount > 0) {
        this.logger.debug(`Retrying fetch for tag ${tagId}, ${retryCount} attempts remaining`);
        await this.fetchAndCacheTagSimilarities(tagId, retryCount - 1);
      }
    }
  }

  private getTagSimilarityFromCache(tagId1: string, tagId2: string): number {
    if (this.tagSimilarityCache[tagId1]?.[tagId2] !== undefined) {
      return this.tagSimilarityCache[tagId1][tagId2];
    }

    if (this.tagSimilarityCache[tagId2]?.[tagId1] !== undefined) {
      return this.tagSimilarityCache[tagId2][tagId1];
    }

    if (tagId1 === tagId2) {
      this.setSimilarityBidirectional(tagId1, tagId2, 1.0);
      return 1.0;
    }

    this.logger.warn(`Cache miss for tag similarity: ${tagId1} - ${tagId2}`);
    return 0;
  }
  // this inizalizing an empty object for the tagid if it has not entery
  // inside the cache nested object.
  private ensureCacheInitialized(tagId: string): void {
    if (!this.tagSimilarityCache[tagId]) {
      this.tagSimilarityCache[tagId] = {};
    }
  }

  // to have bidrectional tags pairs (ai - machine learning , machine learning - ai)
  private setSimilarityBidirectional(tagId1: string, tagId2: string, similarity: number): void {
    this.ensureCacheInitialized(tagId1);
    this.ensureCacheInitialized(tagId2);

    this.tagSimilarityCache[tagId1][tagId2] = similarity;
    this.tagSimilarityCache[tagId2][tagId1] = similarity;
  }
  // avoids dealing with data integtiy issues since it recalcultes everything
  // after 24 hours.
  private checkCacheExpiration(): void {
    const now = new Date();
    if (now.getTime() - this.cacheLastRefreshed.getTime() > this.CACHE_TTL) {
      this.logger.debug('Tag similarity cache expired, resetting');
      this.resetCache();
    }
  }

  public resetCache(): void {
    this.tagSimilarityCache = {};
    this.cacheLastRefreshed = new Date();
  }
}
