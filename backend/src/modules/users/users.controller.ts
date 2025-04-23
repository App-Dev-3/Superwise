import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { User as UserEntity } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create new user',
    description: 'Creates a new user (student, supervisor, or admin).'
  })
  @ApiBody({ 
    type: CreateUserDto,
    description: 'User data to create a new user'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User has been successfully created.',
    type: UserEntity
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data.' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all users',
    description: 'Retrieves all users.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all active users.',
    type: [UserEntity]
  })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('search/by-first-name')
  @ApiOperation({ 
    summary: 'Search users by first name',
    description: 'Find Users by matching their first name.'
  })
  @ApiQuery({ name: 'firstName', required: true, description: 'First name to search for (case insensitive, partial match)' })
  @ApiResponse({ status: 200, description: 'Return users matching the given first name.' })
  findByFirstName(@Query('firstName') firstName: string): Promise<User[]> {
    return this.usersService.findUsersByFirstName(firstName);
  }

  @Get('search/by-last-name')
  @ApiOperation({ 
    summary: 'Search users by last name',
    description: 'Find Users by matching their last name.'
  })
  @ApiQuery({ name: 'lastName', required: true, description: 'Last name to search for (case insensitive, partial match)' })
  @ApiResponse({ status: 200, description: 'Return users matching the given last name.' })
  findByLastName(@Query('lastName') lastName: string): Promise<User[]> {
    return this.usersService.findUsersByLastName(lastName);
  }

  @Get('search/by-tag')
  @ApiOperation({ 
    summary: 'Search users by tag ID',
    description: 'Find Users associated with a specific research interest or skill tag.'
  })
  @ApiQuery({ name: 'tagId', required: true, description: 'Tag ID to search for' })
  @ApiResponse({ status: 200, description: 'Return users with the specified tag.' })
  findByTagId(@Query('tagId') tagId: string): Promise<User[]> {
    return this.usersService.findUsersByTagId(tagId);
  }

  @Get('search/by-tags')
  @ApiOperation({ 
    summary: 'Search users by multiple tag IDs',
    description: 'Find Users associated with any of the specified research interests or skill tags.'
  })
  @ApiQuery({ name: 'tagIds', required: true, description: 'Comma-separated list of tag IDs', type: String })
  @ApiResponse({ status: 200, description: 'Return users with any of the specified tags.' })
  findByTagIds(@Query('tagIds') tagIds: string): Promise<User[]> {
    const tagIdsArray = tagIds.split(',').map(id => id.trim());
    return this.usersService.findUsersByTagIds(tagIdsArray);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get user by id', 
    description: 'Retrieves a specific user by id.' 
  })
  @ApiParam({ 
    name: 'id', 
    type: 'string', 
    description: 'The user ID',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the user with the matching id.',
    type: UserEntity
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findUserById(id);
  }

  @Get(':id/with-relations')
  @ApiOperation({ 
    summary: 'Get user by ID with all related entities',
    description: 'Retrieve a specific user with their student/supervisor profile, research interests, and other relationships.'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Return the user with the specified ID including relations.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOneWithRelations(@Param('id') id: string) {
    return this.usersService.findUserByIdWithRelations(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update user',
    description: 'Update a user\'s information such as name, email, role, and profile image.'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ 
    type: UpdateUserDto,
    description: 'The fields to update on the user'
  })
  @ApiResponse({ status: 200, description: 'User has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete user',
    description: 'Soft delete a user. This preserves the data but marks it as deleted.'
  })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 204, description: 'User has been successfully deleted (soft delete).' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}
