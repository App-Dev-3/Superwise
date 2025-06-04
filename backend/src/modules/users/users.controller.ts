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
  UnauthorizedException,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UserTag } from './entities/user-tag.entity';
import { UserWithRelations } from './entities/user-with-relations.entity';
import { SetUserTagsDto } from './dto/set-user-tags.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ClerkRegistrationGuard } from '../../common/guards/clerk-registration.guard';
import { UserExistsDto } from './dto/user-exists.dto';
import { CreateUserBlockDto } from './dto/create-user-block.dto';
import { UserBlock } from './entities/user-block.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('check-registration')
  @UseGuards(ClerkRegistrationGuard)
  @Public() // Mark as public to bypass the global ClerkAuthGuard
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check if user needs to register',
    description:
      'Securely checks if a user with the given email exists and its registration status. Only works with the email from your verified JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns user existence and registration status.',
    type: UserExistsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT is missing or invalid.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Email mismatch with JWT.' })
  async checkUserRegistration(
    @Query('email') email: string,
    @CurrentUser() authUser: { clerk_id: string; email: string },
  ): Promise<UserExistsDto> {
    // Security check: Only allow checking the email that matches the JWT
    if (!email || email !== authUser.email) {
      throw new BadRequestException(
        'Email mismatch: You can only check the email associated with your authentication.',
      );
    }

    try {
  
      const user = await this.usersService.findUserByEmail(email);

      const userWithRelations = await this.usersService.findUserByIdWithRelations(user.id);

      return {
        exists: true,
        is_registered: userWithRelations.is_registered,
        role: userWithRelations.role,
        tags: !!(userWithRelations.tags && userWithRelations.tags.length > 0)
      };
    } catch (error) {
      // If user not found, return exists: false with default values
      if (error instanceof NotFoundException) {
        return {
          exists: false,
          is_registered: false,
          tags: false,
        };
      }
      throw error; // Re-throw other errors
    }
  }

  @Post()
  @UseGuards(ClerkRegistrationGuard)
  @Public() // Mark as public to bypass the global ClerkAuthGuard
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create new user or register existing supervisor account',
    description:
      'Creates a new user (defaults to student role) or links an existing supervisor account to the Clerk identity. Uses JWT validation to ensure secure registration without requiring pre-existing clerk_id.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User data to create a new user or register an existing supervisor',
  })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully created or registered.',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Invalid input data (e.g., missing first/last name for new student).',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT is missing or invalid.' })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - User already registered, or non-supervisor account exists with this email.',
  })
  createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() authUser: { clerk_id: string; email: string },
  ): Promise<User> {
    if (!authUser || !authUser.clerk_id || !authUser.email) {
      throw new UnauthorizedException('Invalid authentication data.');
    }

    // Ensure the email in the DTO matches the email in the JWT for security
    if (createUserDto.email && createUserDto.email !== authUser.email) {
      throw new UnauthorizedException(
        'Email mismatch: You can only register with the email verified by your authentication provider.',
      );
    }

    // Always use the email from the JWT for security
    const secureCreateUserDto = {
      ...createUserDto,
      email: authUser.email, // Override with JWT email which is verified by Clerk
    };

    return this.usersService.createUser(authUser, secureCreateUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves all users. Restricted to administrators only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all active users.',
    type: [User],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to access this endpoint',
  })
  findAllUsers(): Promise<User[]> {
    return this.usersService.findAllUsers();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Unified search for users',
    description:
      'Search for users by email, first name, last name, or tag names with a single search string.',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    description:
      'Search string to match against email, first name, last name, or tag names (case insensitive, partial match)',
    example: 'john',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns users matching the search criteria (limited to 15 results)',
    type: [User],
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid parameter' })
  searchUsers(@Query('query') query: string): Promise<User[]> {
    return this.usersService.searchUsers(query);
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
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    // Allow users to update their own data, but admins can also update other users' data
    if (currentUser.id === id || currentUser.role === Role.ADMIN) {
      return this.usersService.updateUser(id, updateUserDto);
    }
    throw new UnauthorizedException('You do not have permission to update this user');
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
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
  @Get(':id/tags')
  @ApiOperation({
    summary: 'Get all tags assigned to a user',
    description:
      'Retrieves all tags assigned to a specific user with their priority ordering. Tags are sorted by priority where 1 is highest priority.',
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
    description: "List of a user's tags with their priorities and tag details",
    type: [UserTag],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid User ID format.' })
  findUserTagsByUserId(@Param('id', ParseUUIDPipe) userId: string): Promise<UserTag[]> {
    return this.usersService.findUserTagsByUserId(userId);
  }

  @Put(':id/tags')
  @ApiOperation({
    summary: 'Set/Replace all tags for a user with priorities',
    description:
      'Updates all tags for a user with the specified priorities. This operation replaces all existing tags with the new set provided.',
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
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() setUserTagsDto: SetUserTagsDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserTag[]> {
    // Allow users to only update their own tags, but admins can also update other users' tags
    if (currentUser.id === userId || currentUser.role === Role.ADMIN) {
      return await this.usersService.setUserTagsByUserId(userId, setUserTagsDto);
    }
    throw new UnauthorizedException("You do not have permission to update this user's tags");
  }

  /**
   * User Block endpoints
   */
  @Get(':id/blocks')
  @ApiOperation({
    summary: 'Get all supervisors blocked by a student',
    description:
      'Retrieves a list of all supervisors that have been blocked by the specified student.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'The User ID of the student (UUID)',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of blocked supervisors',
    type: [UserBlock],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - User is not a student' })
  findBlockedSupervisorsByStudentUserId(
    @Param('id', ParseUUIDPipe) studentUserId: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserBlock[]> {
    // Allow access only to the user themselves or admins
    if (currentUser.id === studentUserId || currentUser.role === Role.ADMIN) {
      return this.usersService.findBlockedSupervisorsByStudentUserId(studentUserId);
    }
    throw new UnauthorizedException(
      "You do not have permission to view this user's blocked supervisors",
    );
  }

  @Post(':id/blocks')
  @ApiOperation({
    summary: 'Block a supervisor',
    description:
      'Allows a student to block a supervisor, preventing them from appearing in recommendations.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'The User ID of the student (UUID)',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: CreateUserBlockDto,
    description: 'The User ID (UUID) of the supervisor to block',
  })
  @ApiResponse({
    status: 201,
    description: 'Supervisor has been successfully blocked',
    type: UserBlock,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input or validation error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(HttpStatus.CREATED)
  createUserBlock(
    @Param('id', ParseUUIDPipe) studentUserId: string,
    @Body() createUserBlockDto: CreateUserBlockDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserBlock> {
    // Allow only the user themselves or admins to create blocks
    if (currentUser.id === studentUserId || currentUser.role === Role.ADMIN) {
      return this.usersService.createUserBlock(studentUserId, createUserBlockDto.blocked_id);
    }
    throw new UnauthorizedException(
      'You do not have permission to block supervisors for this user',
    );
  }

  @Delete(':id/blocks/:blockedId')
  @ApiOperation({
    summary: 'Unblock a supervisor',
    description:
      'Removes a block from a supervisor, allowing them to appear in recommendations again.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'The User ID of the student (UUID)',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'blockedId',
    type: 'string',
    format: 'uuid',
    description: 'The User ID of the supervisor (UUID) to unblock',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({ status: 204, description: 'Supervisor has been successfully unblocked' })
  @ApiResponse({ status: 404, description: 'User or block relationship not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUserBlock(
    @Param('id', ParseUUIDPipe) studentUserId: string,
    @Param('blockedId', ParseUUIDPipe) supervisorUserId: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    // Allow only the user themselves or admins to remove blocks
    if (currentUser.id === studentUserId || currentUser.role === Role.ADMIN) {
      await this.usersService.deleteUserBlock(studentUserId, supervisorUserId);
    } else {
      throw new UnauthorizedException(
        'You do not have permission to unblock supervisors for this user',
      );
    }
  }
}
