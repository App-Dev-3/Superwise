import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserTag } from '@prisma/client';
import { UsersRepository } from './users.repository';
import { SetUserTagsDto } from './dto/set-user-tags.dto';
import { UserWithRelations } from './entities/user-with-relations.entity';
import { TagsService } from '../tags/tags.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly tagsService: TagsService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const userData = {
      email: createUserDto.email,
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
      role: createUserDto.role,
      profile_image: createUserDto.profile_image,
    };
    return this.usersRepository.createUser(userData);
  }

  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.findAllUsers();
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findUserByIdWithRelations(id: string): Promise<UserWithRelations> {
    const user = await this.usersRepository.findUserByIdWithRelations(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findUsersByFirstName(firstName: string): Promise<User[]> {
    return this.usersRepository.findUsersByFirstName(firstName);
  }

  async findUsersByLastName(lastName: string): Promise<User[]> {
    return this.usersRepository.findUsersByLastName(lastName);
  }

  async findUsersByTagId(tagId: string): Promise<User[]> {
    // Verify tag exists before searching
    await this.tagsService.findTagById(tagId);
    return this.usersRepository.findUsersByTagId(tagId);
  }

  async findUsersByTagIds(tagIds: string[]): Promise<User[]> {
    // Verify all tags exist
    await Promise.all(tagIds.map(id => this.tagsService.findTagById(id)));
    return this.usersRepository.findUsersByTagIds(tagIds);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // This will throw NotFoundException if user doesn't exist
    await this.findUserById(id);
    return this.usersRepository.updateUser(id, updateUserDto);
  }

  async deleteUser(id: string): Promise<User> {
    // This will throw NotFoundException if user doesn't exist
    await this.findUserById(id);
    // Soft delete
    return this.usersRepository.softDeleteUser(id);
  }

  // User Tag operations
  async findUserTagsByUserId(userId: string): Promise<UserTag[]> {
    // This will throw NotFoundException if user doesn't exist
    await this.findUserById(userId);
    return this.usersRepository.findUserTagsByUserId(userId);
  }

  async setUserTagsByUserId(userId: string, dto: SetUserTagsDto): Promise<UserTag[]> {
    // Verify User Exists - will throw NotFoundException if user doesn't exist
    await this.findUserById(userId);

    // Validate Tag Data
    const priorities = dto.tags.map(t => t.priority);
    const uniquePriorities = new Set(priorities);
    if (priorities.length !== uniquePriorities.size) {
      throw new BadRequestException('Priorities must be unique.');
    }
    // Check if priorities are sequential (1, 2, 3... N)
    const maxPriority = priorities.length > 0 ? Math.max(...priorities) : 0;
    if (maxPriority !== priorities.length) {
      throw new BadRequestException(`Priorities must be sequential from stating from 1.`);
    }
    // Check minimum priority is 1 (already handled by DTO validator, but good practice)
    if (priorities.length > 0 && Math.min(...priorities) !== 1) {
      throw new BadRequestException('Priorities must start from 1.');
    }

    // Verify all referenced tag IDs exist; will throw NotFoundException if any invalid
    const tagIds = dto.tags.map(t => t.tag_id);
    // Using Promise.all for parallel lookups; TagsService.findTagById already throws if not found
    await Promise.all(tagIds.map(id => this.tagsService.findTagById(id)));

    // Call Repository and return its result
    return await this.usersRepository.setUserTagsByUserId(userId, dto.tags);
  }
}
