import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { SupervisorsService } from '../supervisors/supervisors.service';
import { UsersService } from '../users/users.service';
import { TagsService } from '../tags/tags.service';
import { UserTag } from '../users/entities/user-tag.entity';

describe('MatchingService', () => {
  let service: MatchingService;
  let supervisorsService: jest.Mocked<SupervisorsService>;
  let usersService: jest.Mocked<UsersService>;
  let tagsService: jest.Mocked<TagsService>;

  // Sample UUIDs for testing
  const STUDENT_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const SUPERVISOR_UUID_1 = '123e4567-e89b-12d3-a456-426614174001';
  const SUPERVISOR_UUID_2 = '123e4567-e89b-12d3-a456-426614174002';
  const TAG_UUID_1 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  const TAG_UUID_2 = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  const TAG_UUID_3 = 'b2c3d4e5-f6a7-8901-2345-67890abcdef0';

  const mockSupervisors = [
    {
      id: SUPERVISOR_UUID_1,
      user_id: 'user-id-1',
      bio: 'Test bio 1',
      available_spots: 3,
      total_spots: 5,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: SUPERVISOR_UUID_2,
      user_id: 'user-id-2',
      bio: 'Test bio 2',
      available_spots: 2,
      total_spots: 4,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockStudentTags: UserTag[] = [
    {
      user_id: STUDENT_UUID,
      tag_id: TAG_UUID_1,
      priority: 1,
      tag: {
        id: TAG_UUID_1,
        tag_name: 'Machine Learning',
        created_at: new Date(),
        updated_at: new Date(),
      },
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: STUDENT_UUID,
      tag_id: TAG_UUID_2,
      priority: 2,
      tag: {
        id: TAG_UUID_2,
        tag_name: 'Web Development',
        created_at: new Date(),
        updated_at: new Date(),
      },
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockSupervisorTags: UserTag[] = [
    {
      user_id: 'user-id-1',
      tag_id: TAG_UUID_1,
      priority: 1,
      tag: {
        id: TAG_UUID_1,
        tag_name: 'Machine Learning',
        created_at: new Date(),
        updated_at: new Date(),
      },
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: 'user-id-1',
      tag_id: TAG_UUID_3,
      priority: 2,
      tag: {
        id: TAG_UUID_3,
        tag_name: 'Data Science',
        created_at: new Date(),
        updated_at: new Date(),
      },
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockTagSimilarities = [
    {
      tag: {
        id: TAG_UUID_1,
        tag_name: 'Machine Learning',
        created_at: new Date(),
        updated_at: new Date(),
      },
      similarity: 1.0, // Same tag, perfect similarity
    },
    {
      tag: {
        id: TAG_UUID_2,
        tag_name: 'Web Development',
        created_at: new Date(),
        updated_at: new Date(),
      },
      similarity: 0.2, // Low similarity
    },
    {
      tag: {
        id: TAG_UUID_3,
        tag_name: 'Data Science',
        created_at: new Date(),
        updated_at: new Date(),
      },
      similarity: 0.8, // High similarity
    },
  ];

  beforeEach(async () => {
    // Create mocks for all the dependencies
    const supervisorsServiceMock = {
      findAllSupervisors: jest.fn(),
    };

    const usersServiceMock = {
      findUserTagsByUserId: jest.fn(),
    };

    const tagsServiceMock = {
      findSimilarTagsByTagId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        { provide: SupervisorsService, useValue: supervisorsServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: TagsService, useValue: tagsServiceMock },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
    supervisorsService = module.get(SupervisorsService);
    usersService = module.get(UsersService);
    tagsService = module.get(TagsService);

    // Reset mock calls before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateAllMatchesForUserId', () => {
    it('should return an array of matches with compatibility scores', async () => {
      // Set up mocks
      supervisorsService.findAllSupervisors.mockResolvedValue(mockSupervisors);
      usersService.findUserTagsByUserId.mockImplementation(userId => {
        if (userId === STUDENT_UUID) return Promise.resolve(mockStudentTags);
        if (userId === 'user-id-1' || userId === 'user-id-2')
          return Promise.resolve(mockSupervisorTags);
        return Promise.resolve([]);
      });
      tagsService.findSimilarTagsByTagId.mockImplementation(tagId => {
        if (tagId === TAG_UUID_1) return Promise.resolve(mockTagSimilarities);
        return Promise.resolve([]);
      });

      // Execute
      const result = await service.calculateAllMatchesForUserId(STUDENT_UUID);

      // Assertions
      expect(result).toHaveLength(2); // Should match number of supervisors
      expect(result[0].studentId).toEqual(STUDENT_UUID);
      expect(result[0].supervisorId).toEqual(SUPERVISOR_UUID_1);
      expect(result[1].studentId).toEqual(STUDENT_UUID);
      expect(result[1].supervisorId).toEqual(SUPERVISOR_UUID_2);

      // Ensure scores are between 0 and 1
      expect(result[0].compatibilityScore).toBeGreaterThanOrEqual(0);
      expect(result[0].compatibilityScore).toBeLessThanOrEqual(1);
      expect(result[1].compatibilityScore).toBeGreaterThanOrEqual(0);
      expect(result[1].compatibilityScore).toBeLessThanOrEqual(1);

      // Verify service calls
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(supervisorsService.findAllSupervisors).toHaveBeenCalledWith({
        where: { available_spots: { gt: 0 } },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findUserTagsByUserId).toHaveBeenCalledWith(STUDENT_UUID);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findUserTagsByUserId).toHaveBeenCalledWith('user-id-1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findUserTagsByUserId).toHaveBeenCalledWith('user-id-2');
    });

    it('should return empty matches when student has no tags', async () => {
      // Set up mocks
      supervisorsService.findAllSupervisors.mockResolvedValue(mockSupervisors);
      usersService.findUserTagsByUserId.mockImplementation(userId => {
        if (userId === STUDENT_UUID) return Promise.resolve([]); // No tags for student
        if (userId === 'user-id-1' || userId === 'user-id-2')
          return Promise.resolve(mockSupervisorTags);
        return Promise.resolve([]);
      });

      // Execute
      const result = await service.calculateAllMatchesForUserId(STUDENT_UUID);

      // Assertions
      expect(result).toHaveLength(2);
      expect(result[0].compatibilityScore).toBe(0); // No matching should result in 0 score
      expect(result[1].compatibilityScore).toBe(0);
    });

    it('should return zero compatibility scores when supervisor has no tags', async () => {
      // Set up mocks
      supervisorsService.findAllSupervisors.mockResolvedValue(mockSupervisors);
      usersService.findUserTagsByUserId.mockImplementation(userId => {
        if (userId === STUDENT_UUID) return Promise.resolve(mockStudentTags);
        return Promise.resolve([]); // No tags for supervisors
      });

      // Execute
      const result = await service.calculateAllMatchesForUserId(STUDENT_UUID);

      // Assertions
      expect(result).toHaveLength(2);
      expect(result[0].compatibilityScore).toBe(0);
      expect(result[1].compatibilityScore).toBe(0);
    });
  });

  describe('resetCache', () => {
    it('should clear the tag similarity cache', async () => {
      // Set up initial cache by executing a calculation
      supervisorsService.findAllSupervisors.mockResolvedValue([mockSupervisors[0]]);
      usersService.findUserTagsByUserId.mockResolvedValue(mockStudentTags);
      tagsService.findSimilarTagsByTagId.mockResolvedValue(mockTagSimilarities);

      // First call to populate cache
      await service.calculateAllMatchesForUserId(STUDENT_UUID);

      // Verify the tag service was called to fill the cache
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(tagsService.findSimilarTagsByTagId).toHaveBeenCalled();

      // Reset the mock call count
      jest.clearAllMocks();

      // Reset the cache
      service.resetCache();

      // Second call should need to refill the cache
      await service.calculateAllMatchesForUserId(STUDENT_UUID);

      // Verify the tag service was called again after cache reset
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(tagsService.findSimilarTagsByTagId).toHaveBeenCalled();
    });
  });
});
