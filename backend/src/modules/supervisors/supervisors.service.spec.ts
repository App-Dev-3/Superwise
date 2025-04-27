import { Test, TestingModule } from '@nestjs/testing';
import { SupervisorsService } from './supervisors.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { registerSupervisorDto } from './dto/register-supervisor.dto';
import { SupervisorRepository } from './repositories/supervisor-repository.interface';
import { Role } from '@prisma/client';

describe('SupervisorsService', () => {
  let service: SupervisorsService;
  let repository: SupervisorRepository;

  const userId = 'test-user-id';
  const registerDto: registerSupervisorDto = {
    tags: [
      { tag_id: 'tag-id-1', priority: 1 },
      { tag_id: 'tag-id-2', priority: 2 },
    ],
  };

  const mockSupervisor = {
    id: userId,
    email: 'supervisor@example.com',
    first_name: 'Test',
    last_name: 'Supervisor',
    role: Role.SUPERVISOR,
    profile_image: null,
    is_registered: false,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    supervisor_profile: {
      id: 'sp-id',
      user_id: userId,
      bio: 'Test bio',
      available_spots: 5,
      total_spots: 10,
      created_at: new Date(),
      updated_at: new Date(),
    },
   
    tags: [] as any[],
    blocked_users: [] as any[],
    blocked_by_users: [] as any[]
  };

  const mockTagResults = [
    {
      user_id: userId,
      tag_id: 'tag-id-1',
      priority: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: userId,
      tag_id: 'tag-id-2',
      priority: 2,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      findSupervisorByUserId: jest.fn(),
      updateSupervisorTags: jest.fn(),
      updateUserRegistrationStatus: jest.fn(),
      isSupervisor: jest.fn(),
      updateBio: jest.fn(),
      getAllSupervisors: jest.fn(),
      getSupervisorsByTags: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupervisorsService,
        { provide: 'SupervisorRepository', useValue: mockRepository },
      ],
    }).compile();

    service = module.get<SupervisorsService>(SupervisorsService);
    repository = module.get<SupervisorRepository>('SupervisorRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a supervisor with tags', async () => {
  
      jest.spyOn(repository, 'findSupervisorByUserId').mockResolvedValue(mockSupervisor);
      jest.spyOn(repository, 'updateSupervisorTags').mockResolvedValue(mockTagResults);
      jest.spyOn(repository, 'updateUserRegistrationStatus').mockResolvedValue();

      const result = await service.register(userId, registerDto);

      expect(repository.findSupervisorByUserId).toHaveBeenCalledWith(userId);
      expect(repository.updateSupervisorTags).toHaveBeenCalledWith(userId, registerDto.tags);
      expect(repository.updateUserRegistrationStatus).toHaveBeenCalledWith(userId, true);
      expect(result).toEqual({
        success: true,
        message: 'Supervisor registered successfully',
        tags: mockTagResults,
      });
    });

    it('should not update is_registered if already registered', async () => {
      const registeredSupervisor = { ...mockSupervisor, is_registered: true };
      jest.spyOn(repository, 'findSupervisorByUserId').mockResolvedValue(registeredSupervisor);
      jest.spyOn(repository, 'updateSupervisorTags').mockResolvedValue(mockTagResults);
      jest.spyOn(repository, 'updateUserRegistrationStatus');

      await service.register(userId, registerDto);

      expect(repository.updateUserRegistrationStatus).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findSupervisorByUserId').mockResolvedValue(null);

      await expect(service.register(userId, registerDto)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`),
      );
    });

    it('should throw BadRequestException if user is not a supervisor', async () => {
      
      const nonSupervisorUser = { ...mockSupervisor, role: Role.STUDENT };
      jest.spyOn(repository, 'findSupervisorByUserId').mockResolvedValue(nonSupervisorUser);
    
      await expect(service.register(userId, registerDto)).rejects.toThrow(
        new BadRequestException('User is not a supervisor'),
      );
    });

    it('should throw NotFoundException if supervisor profile not found', async () => {
      const userWithoutProfile = {
        ...mockSupervisor,
        supervisor_profile: null,
      };
      jest.spyOn(repository, 'findSupervisorByUserId').mockResolvedValue(userWithoutProfile);

      await expect(service.register(userId, registerDto)).rejects.toThrow(
        new NotFoundException(
          `Supervisor profile not found for user ${userId}`,
        ),
      );
    });

    it('should handle empty tags array gracefully', async () => {
      jest.spyOn(repository, 'findSupervisorByUserId').mockResolvedValue(mockSupervisor);
      jest.spyOn(repository, 'updateSupervisorTags').mockResolvedValue([]);
      jest.spyOn(repository, 'updateUserRegistrationStatus').mockResolvedValue();

      const result = await service.register(userId, { tags: [] });

      expect(repository.updateSupervisorTags).toHaveBeenCalledWith(userId, []);
      expect(result).toEqual({
        success: true,
        message: 'Supervisor registered successfully',
        tags: [],
      });
    });

    it('should handle database errors during tag update', async () => {
      jest.spyOn(repository, 'findSupervisorByUserId').mockResolvedValue(mockSupervisor);
      jest.spyOn(repository, 'updateSupervisorTags').mockRejectedValue(new Error('Database error'));

      await expect(service.register(userId, registerDto)).rejects.toThrow(
        'Database error',
      );
    });
  });
});