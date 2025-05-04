import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import { ApiOperation, ApiTags, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';

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

  @Post()
  @ApiOperation({ summary: 'Create a new supervisor profile' })
  @ApiResponse({
    status: 201,
    description: 'Supervisor profile created successfully',
  })
  async createSupervisorProfile(@Body() createSupervisorDto: CreateSupervisorDto) {
    return this.supervisorsService.createSupervisorProfile(createSupervisorDto);
  }

  @Put(':id') //patch
  @ApiOperation({ summary: 'Update a supervisor profile' })
  @ApiParam({ name: 'id', description: 'Supervisor ID' })
  @ApiResponse({
    status: 200,
    description: 'Supervisor profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  async updateSupervisorProfile(
    @Param('id') id: string,
    @Body() updateSupervisorDto: UpdateSupervisorDto,
  ) {
    return this.supervisorsService.updateSupervisorProfile(id, updateSupervisorDto);
  }
}
