import { Controller, Get, Post, Body, Patch, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SupervisionRequestsService } from './supervision-requests.service';
import { CreateSupervisionRequestDto } from './dto/create-supervision-request.dto';
import { UpdateSupervisionRequestDto } from './dto/update-supervision-request.dto';
import { SupervisionRequestQueryDto } from './dto/supervision-request-query.dto';
import { SupervisionRequestEntity } from './entities/supervision-request.entity';
import { SupervisionRequestWithUsersEntity } from './entities/supervision-request-with-users.entity';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequestState, User } from '@prisma/client';

@ApiTags('supervision-requests')
@Controller('supervision-requests')
export class SupervisionRequestsController {
  constructor(private readonly supervisionRequestsService: SupervisionRequestsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a supervision request',
    description:
      'Creates a new supervision request. Behavior differs based on user role. When a supervisor creates a request for a student email that is not in the system, a new student account will be automatically created and the response will include a studentWasCreated flag.',
  })
  @ApiResponse({
    status: 201,
    description: 'Request created successfully',
    type: SupervisionRequestEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data or constraints violated',
  })
  async createSupervisionRequest(
    @Body() createRequestDto: CreateSupervisionRequestDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.supervisionRequestsService.createSupervisionRequest(createRequestDto, currentUser);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all supervision requests',
    description: 'Retrieves all supervision requests with optional filtering by state',
  })
  @ApiQuery({
    name: 'request_state',
    required: false,
    enum: RequestState,
    description: 'Filter by request state',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all supervision requests matching query parameters',
    type: [SupervisionRequestWithUsersEntity],
  })
  async findAllSupervisionRequests(
    @Query() queryParams: SupervisionRequestQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.supervisionRequestsService.findAllRequests(
      currentUser.id,
      currentUser.role,
      queryParams.request_state,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a supervision request by ID',
    description: 'Retrieves a specific supervision request',
  })
  @ApiParam({
    name: 'id',
    description: 'Supervision request ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the supervision request with the given ID',
    type: SupervisionRequestWithUsersEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Supervision request not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have permission to view this request',
  })
  async findSupervisionRequestById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.supervisionRequestsService.findRequestById(id, currentUser);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a supervision request state',
    description: 'Updates the state of a supervision request',
  })
  @ApiParam({
    name: 'id',
    description: 'Supervision request ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated supervision request',
    type: SupervisionRequestEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Supervision request not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have permission to update this request',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid state transition for the user role',
  })
  async updateSupervisionRequestState(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSupervisionRequestDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.supervisionRequestsService.updateRequestState(
      id,
      updateDto.request_state,
      currentUser,
    );
  }
}
