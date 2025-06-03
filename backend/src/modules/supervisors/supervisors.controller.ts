import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UnauthorizedException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import { ApiOperation, ApiTags, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Supervisor } from './entities/supervisor.entity';

@ApiTags('supervisors')
@Controller('supervisors')
export class SupervisorsController {
  constructor(private readonly supervisorsService: SupervisorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all supervisors with optional filtering' })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Limit the number of supervisors returned',
  })
  @ApiQuery({
    name: 'availableOnly',
    required: false,
    type: Boolean,
    description: 'Only return supervisors with available spots',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of supervisor profiles',
    type: [Supervisor],
  })
  async findAllSupervisors(
    @Query('take') take?: number,
    @Query('availableOnly') availableOnly?: boolean,
  ): Promise<Supervisor[]> {
    const where = availableOnly ? { available_spots: { gt: 0 } } : {};

    return this.supervisorsService.findAllSupervisors({
      take: take ? Number(take) : undefined,
      where,
      orderBy: { user: { last_name: 'asc' } },
    });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get a supervisor by User ID' })
  @ApiParam({
    name: 'userId',
    description: 'Unique identifier of the user',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a supervisor profile',
    type: Supervisor,
  })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  async findSupervisorByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<Supervisor> {
    return this.supervisorsService.findSupervisorByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supervisor by ID' })
  @ApiParam({
    name: 'id',
    description: 'Supervisor ID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a supervisor profile',
    type: Supervisor,
  })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  async findSupervisorById(@Param('id', ParseUUIDPipe) id: string): Promise<Supervisor> {
    return this.supervisorsService.findSupervisorById(id);
  }

  @Patch(':id')
  @Roles(Role.SUPERVISOR)
  @ApiOperation({ summary: 'Partially update a supervisor profile' })
  @ApiParam({ name: 'id', description: 'Supervisor ID' })
  @ApiResponse({
    status: 200,
    description: 'Supervisor profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Supervisor not found' })
  async updateSupervisorProfile(
    @Body() updateSupervisorDto: UpdateSupervisorDto,
    @CurrentUser() currentUser: User,
  ): Promise<Supervisor> {
    const supervisor = await this.supervisorsService.findSupervisorByUserId(currentUser.id);
    if (supervisor.id) {
      return this.supervisorsService.updateSupervisorProfile(supervisor.id, updateSupervisorDto);
    }
    throw new UnauthorizedException('You do not have permission to update this supervisor profile');
  }
}
