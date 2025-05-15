import { Test, TestingModule } from '@nestjs/testing';
import { AdminRepository } from './admin.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { SupervisorsRepository } from '../supervisors/supervisors.repository';

describe('AdminRepository', () => {
  let repository: AdminRepository;
  let prismaService: PrismaService;
  let supervisorsRepository: SupervisorsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminRepository,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
          },
        },
        {
          provide: SupervisorsRepository,
          useValue: {
            findSupervisorByUserId: jest.fn(),
            findAllSupervisors: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<AdminRepository>(AdminRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    supervisorsRepository = module.get<SupervisorsRepository>(SupervisorsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('tagsBulkImport', () => {
    it('should successfully import tags', async () => {
      // Setup mock data
      const tags = ['javascript', 'typescript', 'nodejs'];
      const similarities = [{ field1: 'javascript', field2: 'typescript', similarity_score: 0.9 }];

      // Mock successful transaction
      jest.spyOn(prismaService, '$transaction').mockResolvedValue({
        success: true,
        message: '2 new tags added, 1 tags already existed',
        tagsProcessed: 2,
        similaritiesReplaced: 1,
        duplicateTagsSkipped: 0,
        duplicateSimsSkipped: 0,
      });

      // Execute
      const result = await repository.tagsBulkImport(tags, similarities);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.tagsProcessed).toBe(2);
      expect(result.similaritiesReplaced).toBe(1);
    });

    it('should throw BadRequestException when tag from similarities is not found in tags list', async () => {
      // Setup test data with missing tag
      const tags = ['javascript', 'typescript'];
      const similarities = [
        { field1: 'javascript', field2: 'nodejs', similarity_score: 0.5 }, // 'nodejs' not in tags
      ];

      // Mock implementation that throws
      jest
        .spyOn(prismaService, '$transaction')
        .mockRejectedValue(
          new BadRequestException("Tag 'nodejs' not found in provided tags list."),
        );

      // Execute & assert
      await expect(repository.tagsBulkImport(tags, similarities)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('supervisorsBulkImport', () => {
    it('should successfully import new supervisors', async () => {
      // Setup test data
      const supervisors = [
        {
          email: 'supervisor@example.com',
          first_name: 'Jane',
          last_name: 'Doe',
          bio: 'Experienced supervisor',
          total_spots: 5,
          available_spots: 3,
        },
      ];

      // Mock successful transaction
      jest.spyOn(prismaService, '$transaction').mockResolvedValue({
        success: true,
        message: '1 new supervisors successfully imported',
        supervisorsImported: 1,
        supervisorsUpdated: 0,
      });

      // Execute
      const result = await repository.supervisorsBulkImport(supervisors);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.supervisorsImported).toBe(1);
      expect(result.supervisorsUpdated).toBe(0);
    });

    it('should update existing supervisors', async () => {
      // Setup test data for updating
      const supervisors = [
        {
          email: 'existing@example.com',
          first_name: 'Jane',
          last_name: 'Doe',
          bio: 'Updated bio',
          total_spots: 10,
          available_spots: 5,
        },
      ];

      // Mock successful transaction for update
      jest.spyOn(prismaService, '$transaction').mockResolvedValue({
        success: true,
        message: '0 new supervisors successfully imported and 1 existing supervisors updated',
        supervisorsImported: 0,
        supervisorsUpdated: 1,
      });

      // Execute
      const result = await repository.supervisorsBulkImport(supervisors);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.supervisorsImported).toBe(0);
      expect(result.supervisorsUpdated).toBe(1);
    });

    it('should throw BadRequestException when email is missing', async () => {
      // Setup test data with missing email
      const supervisors = [
        {
          email: '', // Empty email should trigger validation
          first_name: 'Jane',
          last_name: 'Doe',
          bio: 'Test bio',
          total_spots: 5,
        },
      ];

      // Mock error transaction
      jest
        .spyOn(prismaService, '$transaction')
        .mockRejectedValue(new BadRequestException('Email is required for supervisor: Doe'));

      // Execute & assert
      await expect(repository.supervisorsBulkImport(supervisors)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
