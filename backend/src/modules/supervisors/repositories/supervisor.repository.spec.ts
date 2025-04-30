import { Test, TestingModule } from '@nestjs/testing';
import { PrismaSupervisorRepository } from './supervisor.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { Role } from '@prisma/client';

const mockSupervisorUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: Role.SUPERVISOR,
  profile_image: null,
  is_registered: true,
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockRegisteredSupervisorUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: Role.SUPERVISOR,
  profile_image: null,
  is_registered: true,
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('PrismaSupervisorRepository', () => {
  let repository: PrismaSupervisorRepository;
  let prismaService: PrismaService;

  const userId = 'test-user-id';
  const mockTags = [
    { tag_id: 'tag-1', priority: 1 },
    { tag_id: 'tag-2', priority: 2 },
  ];
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

  beforeEach(async () => {
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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findSupervisorByUserId', () => {
    it('should call Prisma with correct parameters', async () => {
      const spy = jest.spyOn(prismaService.user, 'findUnique');
      spy.mockResolvedValue(mockSupervisorUser);

      await repository.findSupervisorByUserId(userId);

      expect(spy).toHaveBeenCalledWith({
        where: {
          id: userId,
          is_deleted: false,
        },
      });
    });
  });

  describe('isSupervisor', () => {
    it('should return true for valid supervisor', async () => {
      const spy = jest.spyOn(prismaService.user, 'findUnique');

      spy.mockResolvedValue({ role: Role.SUPERVISOR } as any);

      const result = await repository.isSupervisor(userId);

      expect(result).toBe(true);

      expect(spy).toHaveBeenCalledWith({
        where: { id: userId, is_deleted: false },
        select: {
          role: true,
        },
      });
    });

    it('should return false for non-supervisor', async () => {
      const spy = jest.spyOn(prismaService.user, 'findUnique');

      spy.mockResolvedValue({ role: Role.STUDENT } as any);

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

      const deleteSpy = jest.spyOn(prismaService.userTag, 'deleteMany');
      deleteSpy.mockResolvedValue({ count: 0 });

      const transactionSpy = jest.spyOn(prismaService, '$transaction');
      transactionSpy.mockResolvedValue(mockTagResults);

      const result = await repository.updateSupervisorTags(userId, mockTags);

      expect(deleteSpy).toHaveBeenCalledWith({
        where: { user_id: userId },
      });

      expect(transactionSpy).toHaveBeenCalled();
      expect(result).toEqual(mockTagResults);
    });
  });

  describe('updateUserRegistrationStatus', () => {
    it('should update user registration status', async () => {
      const updateSpy = jest.spyOn(prismaService.user, 'update');
      updateSpy.mockResolvedValue(mockRegisteredSupervisorUser);

      await repository.updateUserRegistrationStatus(userId, true);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: userId },
        data: { is_registered: true },
      });
    });
  });
});
