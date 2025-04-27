import { Test, TestingModule } from '@nestjs/testing';
import { SupervisorsController } from './supervisors.controller';
import { SupervisorsService } from './supervisors.service';
import { registerSupervisorDto } from './dto/register-supervisor.dto';
import { SupervisorRegistrationResponse } from './entities/supervisor-registration.entity';

describe('SupervisorsController', () => {
  let controller: SupervisorsController;
  let service: SupervisorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupervisorsController],
      providers: [
        {
          provide: SupervisorsService,
          useValue: {
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SupervisorsController>(SupervisorsController);
    service = module.get<SupervisorsService>(SupervisorsService);
  });

  it('should call supervisorsService.register with correct values', async () => {
    const mockUserId = 'user-123';
    const mockDto: registerSupervisorDto = {
      tags: [{ tag_id: 'tag-1', priority: 1 }],
    };
    const mockRequest: any = { userId: mockUserId };


    const mockResult: SupervisorRegistrationResponse = { 
      success: true,
      message: 'Supervisor registered successfully',
      tags: [{ 
        user_id: mockUserId, 
        tag_id: 'tag-1', 
        priority: 1,
        created_at: new Date(),
        updated_at: new Date()
      }]
    };
    
    (service.register as jest.Mock).mockResolvedValue(mockResult);

    const result = await controller.register(mockDto, mockRequest);

    expect(service.register).toHaveBeenCalledWith(mockUserId, mockDto);
    expect(result).toEqual(mockResult);
  });
});