import { Test, TestingModule } from '@nestjs/testing';
import { SupervisorsService } from './supervisors.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { registerSupervisorDto } from './dto/register-supervisor.dto';

describe('SupervisorsService', () => {
  let service: SupervisorsService;
  let prismaService: PrismaService;

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
    role: 'SUPERVISOR',
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
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      userTag: {
        deleteMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupervisorsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SupervisorsService>(SupervisorsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a supervisor with tags', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(mockSupervisor);
      prismaService.userTag.deleteMany = jest
        .fn()
        .mockResolvedValue({ count: 0 });
      prismaService.userTag.create = jest.fn().mockImplementation((data) => {
        const tagId = data.data.tag_id;
        const priority = data.data.priority;
        return Promise.resolve({
          user_id: userId,
          tag_id: tagId,
          priority: priority,
          created_at: new Date(),
          updated_at: new Date(),
        });
      });
      prismaService.$transaction = jest.fn().mockResolvedValue(mockTagResults);
      prismaService.user.update = jest.fn().mockResolvedValue({
        ...mockSupervisor,
        is_registered: true,
      });

      const result = await service.register(userId, registerDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { supervisor_profile: true },
      });
      expect(prismaService.userTag.deleteMany).toHaveBeenCalledWith({
        where: { user_id: userId },
      });
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { is_registered: true },
      });
      expect(result).toEqual({
        success: true,
        message: 'Supervisor registered successfully',
        tags: mockTagResults,
      });
    });

    it('should not update is_registered if already registered', async () => {
      const registeredSupervisor = { ...mockSupervisor, is_registered: true };
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(registeredSupervisor);
      prismaService.userTag.deleteMany = jest
        .fn()
        .mockResolvedValue({ count: 0 });
      prismaService.$transaction = jest.fn().mockResolvedValue(mockTagResults);

      await service.register(userId, registerDto);

      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.register(userId, registerDto)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`),
      );
    });

    it('should throw BadRequestException if user is not a supervisor', async () => {
      const nonSupervisorUser = { ...mockSupervisor, role: 'STUDENT' };
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(nonSupervisorUser);

      await expect(service.register(userId, registerDto)).rejects.toThrow(
        new BadRequestException('User is not a supervisor'),
      );
    });

    it('should throw NotFoundException if supervisor profile not found', async () => {
      const userWithoutProfile = {
        ...mockSupervisor,
        supervisor_profile: null,
      };
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(userWithoutProfile);

      await expect(service.register(userId, registerDto)).rejects.toThrow(
        new NotFoundException(
          `Supervisor profile not found for user ${userId}`,
        ),
      );
    });

    it('should handle empty tags array gracefully', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(mockSupervisor);
      prismaService.userTag.deleteMany = jest
        .fn()
        .mockResolvedValue({ count: 0 });
      prismaService.$transaction = jest.fn().mockResolvedValue([]);
      prismaService.user.update = jest.fn().mockResolvedValue({
        ...mockSupervisor,
        is_registered: true,
      });

      const result = await service.register(userId, { tags: [] });

      expect(prismaService.userTag.deleteMany).toHaveBeenCalled();
      expect(prismaService.$transaction).toHaveBeenCalledWith([]);
      expect(result).toEqual({
        success: true,
        message: 'Supervisor registered successfully',
        tags: [],
      });
    });

    it('should handle database errors during transaction', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue(mockSupervisor);
      prismaService.userTag.deleteMany = jest
        .fn()
        .mockResolvedValue({ count: 0 });
      prismaService.$transaction = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(service.register(userId, registerDto)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
