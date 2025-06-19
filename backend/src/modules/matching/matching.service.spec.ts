import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { SupervisorsService } from '../supervisors/supervisors.service';
import { UsersService } from '../users/users.service';
import { TagsService } from '../tags/tags.service';
import { UserTag } from '../users/entities/user-tag.entity';
import { RequestState, Role, UserBlock } from '@prisma/client';
import { StudentsService } from '../students/students.service';
import { SupervisionRequestsService } from '../requests/supervision/supervision-requests.service';
import { CacheService } from '../../common/cache/cache.service';

describe('MatchingService', () => {
  let service: MatchingService;
  let supervisorsService: jest.Mocked<SupervisorsService>;
  let usersService: jest.Mocked<UsersService>;
  let tagsService: jest.Mocked<TagsService>;
  let studentsService: jest.Mocked<StudentsService>;
  let supervisionRequestsService: jest.Mocked<SupervisionRequestsService>;
  let cacheService: jest.Mocked<CacheService>;

  // Sample UUIDs for testing
  const STUDENT_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const STUDENT_PROFILE_ID = '123e4567-e89b-12d3-a456-426614174006';
  const USER_UUID_1 = '123e4567-e89b-12d3-a456-426614174001';
  const USER_UUID_2 = '123e4567-e89b-12d3-a456-426614174002';
  const TAG_UUID_1 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  const TAG_UUID_2 = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  const TAG_UUID_3 = 'b2c3d4e5-f6a7-8901-2345-67890abcdef0';
  const SUPERVISOR_UUID_1 = 'c9b5e8f7-d6c5-4b3a-a291-f76d58302ea1';
  const SUPERVISOR_UUID_2 = 'd8c7b6a5-e5f4-4d3c-b2a1-987654321abc';
  const REQUEST_UUID_1 = 'e7f6d5c4-b3a2-1987-6543-210fedcba987';

  const mockSupervisors = [
    {
      id: SUPERVISOR_UUID_1,
      user_id: USER_UUID_1,
      bio: 'Test bio 1',
      available_spots: 3,
      total_spots: 5,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: SUPERVISOR_UUID_2,
      user_id: USER_UUID_2,
      bio: 'Test bio 2',
      available_spots: 2,
      total_spots: 4,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockStudentProfile = {
    id: STUDENT_PROFILE_ID,
    user_id: STUDENT_UUID,
    thesis_description: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockSupervisionRequests = [
    {
      id: REQUEST_UUID_1,
      student_id: STUDENT_PROFILE_ID,
      supervisor_id: SUPERVISOR_UUID_1,
      request_state: RequestState.PENDING,
      created_at: new Date(),
      updated_at: new Date(),
      student: {
        id: STUDENT_PROFILE_ID,
        user_id: STUDENT_UUID,
        user: {
          first_name: 'Student',
          last_name: 'User',
          email: 'student@fhstp.ac.at',
          profile_image: null,
        },
      },
      supervisor: {
        id: SUPERVISOR_UUID_1,
        user_id: USER_UUID_1,
        user: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'supervisor@fhstp.ac.at',
          profile_image: null,
        },
      },
    },
  ];

  const mockBlockedSupervisors: UserBlock[] = [
    {
      blocker_id: STUDENT_UUID,
      blocked_id: USER_UUID_1, // Student has blocked the first supervisor
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const mockUsers = [
    {
      id: USER_UUID_1,
      email: 'john.doe@fhstp.ac.at',
      first_name: 'John',
      last_name: 'Doe',
      role: Role.SUPERVISOR,
      profile_image: null,
      clerk_id: null,
      is_registered: true,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: USER_UUID_1,
      email: 'jane.smith@fhstp.ac.at',
      first_name: 'Jane',
      last_name: 'Smith',
      role: Role.SUPERVISOR,
      profile_image: null,
      clerk_id: null,
      is_registered: true,
      is_deleted: false,
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
      user_id: USER_UUID_1,
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
      user_id: USER_UUID_1,
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
      findUserById: jest.fn(),
      findBlockedSupervisorsByStudentUserId: jest.fn(),
    };

    const tagsServiceMock = {
      findSimilarTagsByTagId: jest.fn(),
      findTagById: jest.fn(),
    };

    const studentsServiceMock = {
      findStudentByUserId: jest.fn(),
    };

    const supervisionRequestsServiceMock = {
      findAllRequests: jest.fn(),
    };

    const cacheServiceMock = {
      getTagSimilarity: jest.fn(),
      setTagSimilarity: jest.fn(),
      invalidateTagSimilarities: jest.fn(),
      getUser: jest.fn(),
      setUser: jest.fn(),
      invalidateUser: jest.fn(),
      healthCheck: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        { provide: SupervisorsService, useValue: supervisorsServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: TagsService, useValue: tagsServiceMock },
        { provide: StudentsService, useValue: studentsServiceMock },
        { provide: SupervisionRequestsService, useValue: supervisionRequestsServiceMock },
        { provide: CacheService, useValue: cacheServiceMock },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
    supervisorsService = module.get(SupervisorsService);
    usersService = module.get(UsersService);
    tagsService = module.get(TagsService);
    studentsService = module.get(StudentsService);
    supervisionRequestsService = module.get(SupervisionRequestsService);

    // Reset mock calls before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateAllMatchesForUserId', () => {
    it('should return an array of matches with compatibility scores and supervisor details', async () => {
      // Set up mocks
      studentsService.findStudentByUserId.mockResolvedValue(mockStudentProfile);
      supervisionRequestsService.findAllRequests.mockResolvedValue([]);
      supervisorsService.findAllSupervisors.mockResolvedValue(mockSupervisors);
      usersService.findBlockedSupervisorsByStudentUserId.mockResolvedValue([]);
      usersService.findUserTagsByUserId.mockImplementation(userId => {
        if (userId === STUDENT_UUID) return Promise.resolve(mockStudentTags);
        if (userId === USER_UUID_1 || userId === USER_UUID_2)
          return Promise.resolve(mockSupervisorTags);
        return Promise.resolve([]);
      });

      // Create a default user for unknown IDs
      const defaultUser = {
        id: 'unknown-id',
        email: 'unknown@fhstp.ac.at',
        first_name: 'Unknown',
        last_name: 'User',
        role: Role.SUPERVISOR,
        profile_image: null,
        clerk_id: null,
        is_registered: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      usersService.findUserById.mockImplementation(userId => {
        if (userId === USER_UUID_1) return Promise.resolve(mockUsers[0]);
        if (userId === USER_UUID_2) return Promise.resolve(mockUsers[1]);
        // Return default user instead of null
        return Promise.resolve(defaultUser);
      });
      tagsService.findSimilarTagsByTagId.mockImplementation(tagId => {
        if (tagId === TAG_UUID_1) return Promise.resolve(mockTagSimilarities);
        return Promise.resolve([]);
      });
      tagsService.findTagById.mockImplementation(tagId => {
        const now = new Date();
        if (tagId === TAG_UUID_1)
          return Promise.resolve({
            id: TAG_UUID_1,
            tag_name: 'Machine Learning',
            created_at: now,
            updated_at: now,
          });
        if (tagId === TAG_UUID_2)
          return Promise.resolve({
            id: TAG_UUID_2,
            tag_name: 'Web Development',
            created_at: now,
            updated_at: now,
          });
        if (tagId === TAG_UUID_3)
          return Promise.resolve({
            id: TAG_UUID_3,
            tag_name: 'Data Science',
            created_at: now,
            updated_at: now,
          });
        return Promise.resolve({
          id: tagId,
          tag_name: 'Unknown',
          created_at: now,
          updated_at: now,
        });
      });

      // Execute
      const result = await service.calculateAllMatchesForUserId(STUDENT_UUID);

      // Assertions
      expect(result).toHaveLength(2); // Should match number of supervisors

      expect(result[0].supervisorId).toEqual(SUPERVISOR_UUID_1);
      expect(result[0].supervisor_userId).toEqual(USER_UUID_1);
      expect(result[0].firstName).toEqual('John');
      expect(result[0].lastName).toEqual('Doe');
      expect(result[0].profileImage).toBeNull();
      expect(result[0].bio).toEqual('Test bio 1');
      expect(result[0].availableSpots).toEqual(3);
      expect(result[0].totalSpots).toEqual(5);
      expect(result[0].pendingRequests).toEqual(0);
      expect(result[0].tags).toEqual(['Machine Learning', 'Data Science']);

      expect(result[1].supervisorId).toEqual(SUPERVISOR_UUID_2);
      expect(result[1].supervisor_userId).toEqual(USER_UUID_2);
      expect(result[1].firstName).toEqual('Jane');
      expect(result[1].lastName).toEqual('Smith');
      expect(result[1].profileImage).toBeNull();
      expect(result[1].bio).toEqual('Test bio 2');
      expect(result[1].availableSpots).toEqual(2);
      expect(result[1].totalSpots).toEqual(4);
      expect(result[1].pendingRequests).toEqual(0);
      expect(result[1].tags).toEqual(['Machine Learning', 'Data Science']);
    });

    it('should filter out blocked supervisors from the results', async () => {
      // Set up mocks
      studentsService.findStudentByUserId.mockResolvedValue(mockStudentProfile);
      supervisionRequestsService.findAllRequests.mockResolvedValue([]);
      supervisorsService.findAllSupervisors.mockResolvedValue(mockSupervisors);
      usersService.findBlockedSupervisorsByStudentUserId.mockResolvedValue(mockBlockedSupervisors);
      usersService.findUserTagsByUserId.mockImplementation(userId => {
        if (userId === STUDENT_UUID) return Promise.resolve(mockStudentTags);
        if (userId === USER_UUID_1 || userId === USER_UUID_2)
          return Promise.resolve(mockSupervisorTags);
        return Promise.resolve([]);
      });

      usersService.findUserById.mockImplementation(userId => {
        if (userId === USER_UUID_1) return Promise.resolve(mockUsers[0]);
        if (userId === USER_UUID_2) return Promise.resolve(mockUsers[1]);
        // Return default user instead of null to match expected User type
        return Promise.resolve({
          id: 'unknown-id',
          email: 'unknown@fhstp.ac.at',
          first_name: 'Unknown',
          last_name: 'User',
          role: Role.SUPERVISOR,
          profile_image: null,
          clerk_id: null,
          is_registered: true,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });

      tagsService.findSimilarTagsByTagId.mockImplementation(tagId => {
        if (tagId === TAG_UUID_1) return Promise.resolve(mockTagSimilarities);
        return Promise.resolve([]);
      });

      tagsService.findTagById.mockImplementation(tagId => {
        const now = new Date();
        if (tagId === TAG_UUID_1)
          return Promise.resolve({
            id: TAG_UUID_1,
            tag_name: 'Machine Learning',
            created_at: now,
            updated_at: now,
          });
        if (tagId === TAG_UUID_2)
          return Promise.resolve({
            id: TAG_UUID_2,
            tag_name: 'Web Development',
            created_at: now,
            updated_at: now,
          });
        if (tagId === TAG_UUID_3)
          return Promise.resolve({
            id: TAG_UUID_3,
            tag_name: 'Data Science',
            created_at: now,
            updated_at: now,
          });
        return Promise.resolve({
          id: tagId,
          tag_name: 'Unknown',
          created_at: now,
          updated_at: now,
        });
      });

      // Execute
      const result = await service.calculateAllMatchesForUserId(STUDENT_UUID);

      // Assertions
      expect(result).toHaveLength(1); // Only the non-blocked supervisor should be returned
      expect(result[0].supervisorId).toEqual(SUPERVISOR_UUID_2); // Should include the supervisor ID
      expect(result[0].supervisor_userId).toEqual(USER_UUID_2); // Should only contain supervisor 2

      // Verify the blocked supervisors call was made
      expect(usersService.findBlockedSupervisorsByStudentUserId).toHaveBeenCalledWith(STUDENT_UUID);

      // Verify that the blocked supervisor was properly filtered out
      const blockedSupervisorUserIds = new Set(
        mockBlockedSupervisors.map(block => block.blocked_id),
      );
      expect(blockedSupervisorUserIds.has(USER_UUID_1)).toBeTruthy();
      expect(result.some(match => match.supervisor_userId === USER_UUID_1)).toBeFalsy();
    });

    it('should filter out supervisors with pending or accepted requests', async () => {
      // Set up mocks
      studentsService.findStudentByUserId.mockResolvedValue(mockStudentProfile);
      supervisionRequestsService.findAllRequests.mockResolvedValue(mockSupervisionRequests);
      supervisorsService.findAllSupervisors.mockResolvedValue(mockSupervisors);
      usersService.findBlockedSupervisorsByStudentUserId.mockResolvedValue([]);
      usersService.findUserTagsByUserId.mockImplementation(userId => {
        if (userId === STUDENT_UUID) return Promise.resolve(mockStudentTags);
        if (userId === USER_UUID_1 || userId === USER_UUID_2)
          return Promise.resolve(mockSupervisorTags);
        return Promise.resolve([]);
      });

      usersService.findUserById.mockImplementation(userId => {
        if (userId === USER_UUID_1) return Promise.resolve(mockUsers[0]);
        if (userId === USER_UUID_2) return Promise.resolve(mockUsers[1]);
        // Return default user instead of null to match expected User type
        return Promise.resolve({
          id: 'unknown-id',
          email: 'unknown@fhstp.ac.at',
          first_name: 'Unknown',
          last_name: 'User',
          role: Role.SUPERVISOR,
          profile_image: null,
          clerk_id: null,
          is_registered: true,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });

      tagsService.findSimilarTagsByTagId.mockImplementation(tagId => {
        if (tagId === TAG_UUID_1) return Promise.resolve(mockTagSimilarities);
        return Promise.resolve([]);
      });

      tagsService.findTagById.mockImplementation(tagId => {
        const now = new Date();
        if (tagId === TAG_UUID_1)
          return Promise.resolve({
            id: TAG_UUID_1,
            tag_name: 'Machine Learning',
            created_at: now,
            updated_at: now,
          });
        if (tagId === TAG_UUID_2)
          return Promise.resolve({
            id: TAG_UUID_2,
            tag_name: 'Web Development',
            created_at: now,
            updated_at: now,
          });
        if (tagId === TAG_UUID_3)
          return Promise.resolve({
            id: TAG_UUID_3,
            tag_name: 'Data Science',
            created_at: now,
            updated_at: now,
          });
        return Promise.resolve({
          id: tagId,
          tag_name: 'Unknown',
          created_at: now,
          updated_at: now,
        });
      });

      // Execute
      const result = await service.calculateAllMatchesForUserId(STUDENT_UUID);

      // Assertions
      expect(result).toHaveLength(1); // Only the supervisor without a pending request should be returned
      expect(result[0].supervisorId).toEqual(SUPERVISOR_UUID_2); // Should include the supervisor ID
      expect(result[0].supervisor_userId).toEqual(USER_UUID_2); // Should only contain supervisor 2

      // Verify that the supervisionRequestsService was called
      expect(supervisionRequestsService.findAllRequests).toHaveBeenCalledWith(
        STUDENT_UUID,
        Role.STUDENT,
      );

      // Verify that the supervisor with a pending request was properly filtered out
      expect(result.some(match => match.supervisorId === SUPERVISOR_UUID_1)).toBeFalsy();
    });

    it('should call findAllSupervisors with includeRegisteredOnly=true', async () => {
      // Set up mocks
      studentsService.findStudentByUserId.mockResolvedValue(mockStudentProfile);
      supervisionRequestsService.findAllRequests.mockResolvedValue([]);
      supervisorsService.findAllSupervisors.mockResolvedValue([]);
      usersService.findBlockedSupervisorsByStudentUserId.mockResolvedValue([]);
      usersService.findUserTagsByUserId.mockResolvedValue([]);

      // Execute
      await service.calculateAllMatchesForUserId(STUDENT_UUID);

      // Verify the supervisors service was called with includeRegisteredOnly=true
      expect(supervisorsService.findAllSupervisors).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
          includeRegisteredOnly: true,
        }),
      );
    });
  });
});
