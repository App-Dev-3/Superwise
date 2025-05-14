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
  async findSupervisorByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
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
  async findSupervisorById(@Param('id', ParseUUIDPipe) id: string) {
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
  ) {

    // check it later 
    const supervisor = await this.supervisorsService.findSupervisorByUserId(currentUser.id);
    if (supervisor.id ) {
      return this.supervisorsService.updateSupervisorProfile(supervisor.id , updateSupervisorDto);
    }
    throw new UnauthorizedException('You do not have permission to update this supervisor profile');
  }
}
