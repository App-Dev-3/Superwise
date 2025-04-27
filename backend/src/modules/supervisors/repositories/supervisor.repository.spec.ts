import { Test, TestingModule } from '@nestjs/testing';
import { PrismaSupervisorRepository } from './supervisor.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { Role } from '@prisma/client';

describe('PrismaSupervisorRepository', () => {
  let repository: PrismaSupervisorRepository;
  let prismaService: PrismaService;

  const userId = 'test-user-id';
  const mockTags = [
    { tag_id: 'tag-1', priority: 1 },
    { tag_id: 'tag-2', priority: 2 },
  ];

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      supervisor: {
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      userTag: {
        deleteMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaSupervisorRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaSupervisorRepository>(PrismaSupervisorRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findSupervisorByUserId', () => {
    it('should call Prisma with correct parameters', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        id: userId,
        role: Role.SUPERVISOR,
      });

      await repository.findSupervisorByUserId(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { 
          id: userId,
          is_deleted: false 
        }
      });
    });
  });

  describe('isSupervisor', () => {
    it('should return true for valid supervisor', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        role: Role.SUPERVISOR
      });

      const result = await repository.isSupervisor(userId);

      expect(result).toBe(true);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId, is_deleted: false },
        select: { 
          role: true
        }
      });
    });

    it('should return false for non-supervisor', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        role: Role.STUDENT
      });

      const result = await repository.isSupervisor(userId);

      expect(result).toBe(false);
    });
  });

  describe('updateSupervisorTags', () => {
    it('should delete existing tags and create new ones', async () => {
      const mockTagResults = [
        { user_id: userId, tag_id: 'tag-1', priority: 1 },
        { user_id: userId, tag_id: 'tag-2', priority: 2 },
      ];

      prismaService.userTag.deleteMany = jest.fn().mockResolvedValue({ count: 0 });
      prismaService.$transaction = jest.fn().mockResolvedValue(mockTagResults);

      const result = await repository.updateSupervisorTags(userId, mockTags);

      expect(prismaService.userTag.deleteMany).toHaveBeenCalledWith({
        where: { user_id: userId },
      });
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockTagResults);
    });
  });

  describe('updateUserRegistrationStatus', () => {
    it('should update user registration status', async () => {
      prismaService.user.update = jest.fn().mockResolvedValue({
        id: userId,
        is_registered: true,
      });

      await repository.updateUserRegistrationStatus(userId, true);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { is_registered: true },
      });
    });
  });
});