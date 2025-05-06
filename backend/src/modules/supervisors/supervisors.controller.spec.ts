import { Test, TestingModule } from '@nestjs/testing';
import { SupervisorsController } from './supervisors.controller';
import { SupervisorsService } from './supervisors.service';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';

describe('SupervisorsController', () => {
  let controller: SupervisorsController;
  let service: jest.Mocked<SupervisorsService>;

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
    const serviceMock = {
      findAllSupervisors: jest.fn(),
      findSupervisorById: jest.fn(),
      findSupervisorByUserId: jest.fn(),
      createSupervisorProfile: jest.fn(),
      updateSupervisorProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupervisorsController],
      providers: [{ provide: SupervisorsService, useValue: serviceMock }],
    }).compile();

    controller = module.get<SupervisorsController>(SupervisorsController);
    service = module.get(SupervisorsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllSupervisors', () => {
    it('should return array of supervisors', async () => {
      // Using arrow function wrapper to avoid unbound method error
      service.findAllSupervisors.mockResolvedValue([mockSupervisor]);

      const result = await controller.findAllSupervisors(5, true);

      expect(result).toEqual([mockSupervisor]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findAllSupervisors).toHaveBeenCalledWith({
        take: 5,
        where: { available_spots: { gt: 0 } },
        orderBy: { user: { last_name: 'asc' } },
      });
    });
  });

  describe('findSupervisorByUserId', () => {
    it('should return a supervisor by user ID', async () => {
      service.findSupervisorByUserId.mockResolvedValue(mockSupervisor);

      const result = await controller.findSupervisorByUserId('user-id-1');

      expect(result).toEqual(mockSupervisor);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findSupervisorByUserId).toHaveBeenCalledWith('user-id-1');
    });
  });

  describe('findSupervisorById', () => {
    it('should return a supervisor by ID', async () => {
      service.findSupervisorById.mockResolvedValue(mockSupervisor);

      const result = await controller.findSupervisorById('supervisor-id-1');

      expect(result).toEqual(mockSupervisor);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findSupervisorById).toHaveBeenCalledWith('supervisor-id-1');
    });
  });

  describe('createSupervisorProfile', () => {
    it('should create and return a supervisor profile', async () => {
      const createDto: CreateSupervisorDto = {
        user_id: 'user-id-1',
        bio: 'New supervisor',
        available_spots: 3,
        total_spots: 5,
      };

      service.createSupervisorProfile.mockResolvedValue(mockSupervisor);

      const result = await controller.createSupervisorProfile(createDto);

      expect(result).toEqual(mockSupervisor);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.createSupervisorProfile).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateSupervisorProfile', () => {
    it('should update and return supervisor profile', async () => {
      const updateDto: UpdateSupervisorDto = {
        bio: 'Updated bio',
        available_spots: 2,
      };

      const updatedSupervisor = {
        ...mockSupervisor,
        bio: 'Updated bio',
        available_spots: 2,
      };

      service.updateSupervisorProfile.mockResolvedValue(updatedSupervisor);

      const result = await controller.updateSupervisorProfile('supervisor-id-1', updateDto);

      expect(result).toEqual(updatedSupervisor);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.updateSupervisorProfile).toHaveBeenCalledWith('supervisor-id-1', updateDto);
    });
  });
});
