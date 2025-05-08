import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import { ApiOperation, ApiTags, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('supervisors')
@Controller('supervisors')
export class SupervisorsController {
  constructor(private readonly supervisorsService: SupervisorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all supervisors with optional filtering' })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'availableOnly', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of supervisor profiles',
  })
  async findAllSupervisors(
    @Query('take') take?: number,
    @Query('availableOnly') availableOnly?: boolean,
  ) {
    const where = availableOnly ? { available_spots: { gt: 0 } } : {};

    return this.supervisorsService.findAllSupervisors({
      take: take ? Number(take) : undefined,
      where,
      orderBy: { user: { last_name: 'asc' } },
    });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get a supervisor by User ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a supervisor profile',
  })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  async findSupervisorByUserId(@Param('userId') userId: string) {
    return this.supervisorsService.findSupervisorByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supervisor by ID' })
  @ApiParam({ name: 'id', description: 'Supervisor ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a supervisor profile',
  })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  async findSupervisorById(@Param('id') id: string) {
    return this.supervisorsService.findSupervisorById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new supervisor profile' })
  @ApiResponse({
    status: 201,
    description: 'Supervisor profile created successfully',
  })
  async createSupervisorProfile(@Body() createSupervisorDto: CreateSupervisorDto) {
    return this.supervisorsService.createSupervisorProfile(createSupervisorDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a supervisor profile' })
  @ApiParam({ name: 'id', description: 'Supervisor ID' })
  @ApiResponse({
    status: 200,
    description: 'Supervisor profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  async updateSupervisorProfile(
    @Param('id') id: string,
    @Body() updateSupervisorDto: UpdateSupervisorDto,
    @CurrentUser() currentUser: User,
  ) {
    // Get the supervisor to verify ownership
    const supervisor = await this.supervisorsService.findSupervisorById(id);

    // Allow supervisor to update their own profile or admin to update any profile
    if (supervisor.user_id === currentUser.id || currentUser.role === Role.ADMIN) {
      return this.supervisorsService.updateSupervisorProfile(id, updateSupervisorDto);
    }

    throw new UnauthorizedException('You do not have permission to update this supervisor profile');
  }
}
