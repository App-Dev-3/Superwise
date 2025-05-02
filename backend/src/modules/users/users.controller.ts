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

  @Get('search/by-first-name')
  @ApiOperation({
    summary: 'Search users by first name',
    description: 'Find Users by matching their first name.',
  })
  @ApiQuery({
    name: 'firstName',
    required: true,
    description: 'First name to search for (case insensitive, partial match)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return users matching the given first name.',
    type: [User],
  })
  findUsersByFirstName(@Query('firstName') firstName: string): Promise<User[] | null> {
    return this.usersService.findUsersByFirstName(firstName);
  }

  @Get('search/by-last-name')
  @ApiOperation({
    summary: 'Search users by last name',
    description: 'Find Users by matching their last name.',
  })
  @ApiQuery({
    name: 'lastName',
    required: true,
    description: 'Last name to search for (case insensitive, partial match)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return users matching the given last name.',
    type: [User],
  })
  findUsersByLastName(@Query('lastName') lastName: string): Promise<User[] | null> {
    return this.usersService.findUsersByLastName(lastName);
  }

  @Get('search/by-tag')
  @ApiOperation({
    summary: 'Search users by tag ID',
    description: 'Find Users associated with a specific research interest or skill tag.',
  })
  @ApiQuery({ name: 'tagId', required: true, description: 'Tag ID to search for (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Return users with the specified tag.',
    type: [User],
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid Tag ID format.' })
  findUsersByTagId(@Query('tagId', ParseUUIDPipe) tagId: string): Promise<User[] | null> {
    return this.usersService.findUsersByTagId(tagId);
  }

  @Get('search/by-tags')
  @ApiOperation({
    summary: 'Search users by multiple tag IDs',
    description:
      'Find Users associated with any of the specified research interests or skill tags.',
  })
  @ApiQuery({
    name: 'tagIds',
    required: true,
    description: 'Comma-separated list of tag IDs (UUIDs)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Return users with any of the specified tags.',
    type: [User],
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid Tag ID format in list.' })
  findUsersByTagIds(@Query('tagIds') tagIds: string): Promise<User[] | null> {
    const tagIdsArray = tagIds.split(',').map(id => id.trim());
    return this.usersService.findUsersByTagIds(tagIdsArray);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Retrieves a specific user by id.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The user ID',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Return the user with the matching id.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid User ID format.' })
  findUserById(@Param('id', ParseUUIDPipe) id: string): Promise<User | null> {
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
    description: 'User ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the user with the specified ID including relations.',
    type: UserWithRelations,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid User ID format.' })
  findUserByIdWithRelations(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserWithRelations | null> {
    return this.usersService.findUserByIdWithRelations(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: "Update a user's information such as name, email, role, and profile image.",
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
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
    description: 'Soft delete a user. Preserves data but marks as deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID (UUID)',
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
    description: 'Retrieves all tags assigned to a specific user with their priorities.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user tags',
    type: [UserTag],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid User ID format.' })
  findUserTagsByUserId(@Param('userId', ParseUUIDPipe) userId: string): Promise<UserTag[] | null> {
    return this.usersService.findUserTagsByUserId(userId);
  }

  @Put(':userId/tags')
  @ApiOperation({
    summary: 'Set/Replace all tags for a user with priorities',
    description: 'Updates all tags for a user with the specified priorities.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: SetUserTagsDto,
    description: 'The new tags and priorities for the user',
  })
  @ApiResponse({
    status: 200,
    description: 'User tags updated successfully. Returns the new list of user tags.',
    type: [UserTag],
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., invalid input, non-sequential/duplicate priorities).',
  })
  async setUserTagsByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() setUserTagsDto: SetUserTagsDto,
  ): Promise<UserTag[]> {
    return await this.usersService.setUserTagsByUserId(userId, setUserTagsDto);
  }
}
