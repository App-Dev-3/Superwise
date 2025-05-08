import { Test, TestingModule } from '@nestjs/testing';
import { SupervisorsController } from './supervisors.controller';
import { SupervisorsService } from './supervisors.service';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { Role } from '@prisma/client';

describe('SupervisorsController', () => {
  let controller: SupervisorsController;
  let service: jest.Mocked<SupervisorsService>;

  // Proper UUIDs for testing
  const USER_ID = '123e4567-e89b-12d3-a456-426614174000';
  const SUPERVISOR_ID = '123e4567-e89b-12d3-a456-426614174001';
  const CLERK_ID = 'user_2NUj8tGhSFhTLD9sdP0q4P7VoJM';

  const mockSupervisor = {
    id: SUPERVISOR_ID,
    user_id: USER_ID,
    bio: 'Test bio',
    available_spots: 3,
    total_spots: 5,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUser = {
    id: USER_ID,
    email: 'supervisor@fhstp.ac.at',
    first_name: 'Super',
    last_name: 'Visor',
    role: Role.SUPERVISOR,
    profile_image: 'https://superwise.at/images/supervisor.jpg',
    is_registered: true,
    is_deleted: false,
    clerk_id: CLERK_ID,
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

      // Instead of using the method directly, refer to the mock function

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

      const result = await controller.findSupervisorByUserId(USER_ID);

      expect(result).toEqual(mockSupervisor);

      expect(service.findSupervisorByUserId).toHaveBeenCalledWith(USER_ID);
    });
  });

  describe('findSupervisorById', () => {
    it('should return a supervisor by ID', async () => {
      service.findSupervisorById.mockResolvedValue(mockSupervisor);

      const result = await controller.findSupervisorById(SUPERVISOR_ID);

      expect(result).toEqual(mockSupervisor);

      expect(service.findSupervisorById).toHaveBeenCalledWith(SUPERVISOR_ID);
    });
  });

  describe('createSupervisorProfile', () => {
    it('should create and return a supervisor profile', async () => {
      const createDto: CreateSupervisorDto = {
        user_id: USER_ID,
        bio: 'New supervisor',
        available_spots: 3,
        total_spots: 5,
      };

      service.createSupervisorProfile.mockResolvedValue(mockSupervisor);

      const result = await controller.createSupervisorProfile(createDto);

      expect(result).toEqual(mockSupervisor);

      // Use type assertion to verify the method was called with the right parameters
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

      // Mock the findSupervisorById call that happens inside updateSupervisorProfile
      service.findSupervisorById.mockResolvedValue(mockSupervisor);
      service.updateSupervisorProfile.mockResolvedValue(updatedSupervisor);

      const result = await controller.updateSupervisorProfile(SUPERVISOR_ID, updateDto, mockUser);

      expect(result).toEqual(updatedSupervisor);
      // Verify findSupervisorById was called first
      expect(service.findSupervisorById).toHaveBeenCalledWith(SUPERVISOR_ID);

      // Use type assertion to verify the method was called with the right parameters
      expect(service.updateSupervisorProfile).toHaveBeenCalledWith(SUPERVISOR_ID, updateDto);
    });
  });
});
