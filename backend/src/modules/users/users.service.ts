import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.usersRepository.create(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findUserById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findUserByIdWithRelations(id: string): Promise<
    User & {
      student_profile?: {
        id: string;
        user_id: string;
        current_semester: number;
        created_at: Date;
        updated_at: Date;
      } | null;
      supervisor_profile?: {
        id: string;
        user_id: string;
        bio: string | null;
        available_spots: number;
        total_spots: number;
        created_at: Date;
        updated_at: Date;
      } | null;
      tags?: {
        user_id: string;
        tag_id: string;
        priority: number;
        created_at: Date;
        updated_at: Date;
        tag: {
          id: string;
          name: string;
          category: string;
          created_at: Date;
          updated_at: Date;
        };
      }[];
    }
  > {
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
    return this.usersRepository.findUsersByTagId(tagId);
  }

  async findUsersByTagIds(tagIds: string[]): Promise<User[]> {
    return this.usersRepository.findUsersByTagIds(tagIds);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // First check if user exists
    await this.findUserById(id);

    return this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: string): Promise<User> {
    // First check if user exists
    await this.findUserById(id);

    // Soft delete
    return this.usersRepository.softDelete(id);
  }
}
