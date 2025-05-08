import { Test, TestingModule } from '@nestjs/testing';
import { SupervisorsService } from './supervisors.service';
import { SupervisorsRepository } from './supervisors.repository';
import { SupervisorCapacityException } from '../../common/exceptions/custom-exceptions/supervisor-capacity.exception';
import { NotFoundException } from '@nestjs/common';

describe('SupervisorsService', () => {
  let service: SupervisorsService;
  let repository: jest.Mocked<SupervisorsRepository>;

  const mockSupervisor = {
    id: 'supervisor-id-1',
    user_id: 'user-id-1',
    bio: 'Test bio',
    available_spots: 3,
    total_spots: 5,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const repositoryMock = {
      findAllSupervisors: jest.fn(),
      findSupervisorById: jest.fn(),
      findSupervisorByUserId: jest.fn(),
      createSupervisorProfile: jest.fn(),
      updateSupervisorProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SupervisorsService, { provide: SupervisorsRepository, useValue: repositoryMock }],
    }).compile();

    service = module.get<SupervisorsService>(SupervisorsService);
    repository = module.get(SupervisorsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllSupervisors', () => {
    it('should return an array of supervisors', async () => {
      repository.findAllSupervisors.mockResolvedValue([mockSupervisor]);

      const result = await service.findAllSupervisors({});

      expect(result).toEqual([mockSupervisor]);

      expect(repository.findAllSupervisors).toHaveBeenCalledWith({});
    });
  });

  describe('findSupervisorById', () => {
    it('should return a supervisor when found', async () => {
      repository.findSupervisorById.mockResolvedValue(mockSupervisor);

      const result = await service.findSupervisorById('supervisor-id-1');

      expect(result).toEqual(mockSupervisor);

      expect(repository.findSupervisorById).toHaveBeenCalledWith('supervisor-id-1');
    });

    it('should throw NotFoundException when supervisor not found', async () => {
      repository.findSupervisorById.mockResolvedValue(null);

      await expect(service.findSupervisorById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createSupervisorProfile', () => {
    it('should create and return a supervisor profile', async () => {
      const createDto = {
        user_id: 'user-id-1',
        bio: 'New supervisor',
        available_spots: 3,
        total_spots: 5,
      };

      repository.createSupervisorProfile.mockResolvedValue(mockSupervisor);

      const result = await service.createSupervisorProfile(createDto);

      expect(result).toEqual(mockSupervisor);

      expect(repository.createSupervisorProfile).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateSupervisorProfile', () => {
    it('should update and return supervisor profile', async () => {
      const updateDto = {
        bio: 'Updated bio',
        available_spots: 2,
      };

      repository.findSupervisorById.mockResolvedValue(mockSupervisor);
      repository.updateSupervisorProfile.mockResolvedValue({
        ...mockSupervisor,
        bio: 'Updated bio',
        available_spots: 2,
      });

      const result = await service.updateSupervisorProfile('supervisor-id-1', updateDto);

      expect(result.bio).toBe('Updated bio');
      expect(result.available_spots).toBe(2);
    });

    it('should throw SupervisorCapacityException when available spots exceed total spots', async () => {
      const updateDto = {
        available_spots: 10, // Exceeds total_spots of 5
      };

      repository.findSupervisorById.mockResolvedValue(mockSupervisor);

      await expect(service.updateSupervisorProfile('supervisor-id-1', updateDto)).rejects.toThrow(
        SupervisorCapacityException,
      );
    });
  });
});
