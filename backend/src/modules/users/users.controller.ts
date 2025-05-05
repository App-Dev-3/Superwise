import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UserTag } from './entities/user-tag.entity';
import { UserWithRelations } from './entities/user-with-relations.entity';
import { SetUserTagsDto } from './dto/set-user-tags.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new user',
    description: 'Creates a new user (student, supervisor, or admin).',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User data to create a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully created.',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Conflict - User already exists.' })
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves all users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all active users.',
    type: [User],
  })
  findAllUsers(): Promise<User[]> {
    return this.usersService.findAllUsers();
  }

  @Get('search/by-email')
  @ApiOperation({
    summary: 'Search user by email',
    description: 'Find a user by their email address.',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'Email address to search for (exact match)',
    example: 'studentId@fhstp.ac.at',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the user with the matching email.',
    type: User,
  })
  findUserByEmail(@Query('email') email: string): Promise<User> {
    return this.usersService.findUserByEmail(email);
  }

  @Get('search/by-first-name')
  @ApiOperation({
    summary: 'Search users by first name',
    description:
      'Find users by matching their first name. Will return multiple users if multiple matches are found.',
  })
  @ApiQuery({
    name: 'firstName',
    required: true,
    description: 'First name to search for (case insensitive, partial match)',
    example: 'Max',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Return users matching the given first name.',
    type: [User],
  })
  findUsersByFirstName(@Query('firstName') firstName: string): Promise<User[]> {
    return this.usersService.findUsersByFirstName(firstName);
  }

  @Get('search/by-last-name')
  @ApiOperation({
    summary: 'Search users by last name',
    description:
      'Find users by matching their last name. Will return multiple users if multiple matches are found.',
  })
  @ApiQuery({
    name: 'lastName',
    required: true,
    description: 'Last name to search for (case insensitive, partial match)',
    example: 'Mustermann',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Return users matching the given last name.',
    type: [User],
  })
  findUsersByLastName(@Query('lastName') lastName: string): Promise<User[]> {
    return this.usersService.findUsersByLastName(lastName);
  }

  @Get('search/by-tag')
  @ApiOperation({
    summary: 'Search users by tag ID',
    description:
      'Find users associated with a specific research interest or skill tag. Returns all users that have the specified tag.',
  })
  @ApiQuery({
    name: 'tagId',
    required: true,
    description: 'Tag ID to search for (UUID)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Return users with the specified tag.',
    type: [User],
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid Tag ID format.' })
  @ApiResponse({ status: 404, description: 'Not found - Tag does not exist.' })
  findUsersByTagId(@Query('tagId', ParseUUIDPipe) tagId: string): Promise<User[]> {
    return this.usersService.findUsersByTagId(tagId);
  }

  @Get('search/by-tags')
  @ApiOperation({
    summary: 'Search users by multiple tag IDs',
    description:
      'Find users associated with any of the specified research interests or skill tags. Returns all users that have at least one of the specified tags.',
  })
  @ApiQuery({
    name: 'tagIds',
    required: true,
    description: 'Comma-separated list of tag IDs (UUIDs)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479,e47ac10b-58cc-4372-a567-0e02b2c3d480',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Return users with any of the specified tags.',
    type: [User],
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid Tag ID format in list.' })
  @ApiResponse({ status: 404, description: 'Not found - One or more tags do not exist.' })
  findUsersByTagIds(@Query('tagIds') tagIds: string): Promise<User[]> {
    const tagIdsArray = tagIds.split(',').map(id => id.trim());
    return this.usersService.findUsersByTagIds(tagIdsArray);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Retrieves a specific user by their unique identifier.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'The user unique identifier (UUID)',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the user with the matching id.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid User ID format.' })
  findUserById(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findUserById(id);
  }

  @Get(':id/with-relations')
  @ApiOperation({
    summary: 'Get user by ID with all related entities',
    description:
      'Retrieve a specific user with their student/supervisor profile, tags, and block relationships.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User unique identifier (UUID)',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the user with the specified ID including all their relations.',
    type: UserWithRelations,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid User ID format.' })
  findUserByIdWithRelations(@Param('id', ParseUUIDPipe) id: string): Promise<UserWithRelations> {
    return this.usersService.findUserByIdWithRelations(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description:
      "Update a user's information such as name, email, profile image, and registration status.",
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User unique identifier (UUID)',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'The fields to update on the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User has been successfully updated.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data or ID format.' })
  @ApiResponse({ status: 409, description: 'Conflict - Update violates unique constraint.' })
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user (Soft Delete)',
    description:
      'Soft delete a user. Preserves data but marks user as deleted and they will no longer appear in regular queries.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User unique identifier (UUID)',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 204, description: 'User has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid User ID format.' })
  deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.deleteUser(id);
  }

  /**
   * User Tag endpoints
   */
  @Get(':userId/tags')
  @ApiOperation({
    summary: 'Get all tags assigned to a user',
    description:
      'Retrieves all tags assigned to a specific user with their priority ordering. Tags are sorted by priority where 1 is highest priority.',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    format: 'uuid',
    description: 'User unique identifier (UUID)',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: "List of a user's tags with their priorities and tag details",
    type: [UserTag],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid User ID format.' })
  findUserTagsByUserId(@Param('userId', ParseUUIDPipe) userId: string): Promise<UserTag[]> {
    return this.usersService.findUserTagsByUserId(userId);
  }

  @Put(':userId/tags')
  @ApiOperation({
    summary: 'Set/Replace all tags for a user with priorities',
    description:
      'Updates all tags for a user with the specified priorities. This operation replaces all existing tags with the new set provided.',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    format: 'uuid',
    description: 'User unique identifier (UUID)',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: SetUserTagsDto,
    description:
      'The new tags and priorities for the user. Priorities must be sequential starting with 1.',
  })
  @ApiResponse({
    status: 200,
    description:
      'User tags updated successfully. Returns the new list of user tags with their priorities.',
    type: [UserTag],
  })
  @ApiResponse({ status: 404, description: 'User not found or one or more tags not found.' })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid input, non-sequential priorities, duplicate priorities, or invalid tag IDs.',
  })
  async setUserTagsByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() setUserTagsDto: SetUserTagsDto,
  ): Promise<UserTag[]> {
    return await this.usersService.setUserTagsByUserId(userId, setUserTagsDto);
  }
}
