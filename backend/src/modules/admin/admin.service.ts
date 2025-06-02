import { Injectable, BadRequestException } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { UsersRepository } from '../users/users.repository';
import { TagsBulkImportDto } from './dto/tags-bulk-import.dto';
import { TagsBulkImportSuccessDto } from './dto/tags-bulk-import-success.dto';
import { SupervisorsBulkImportDto } from './dto/supervisors-bulk-import.dto';
import { SupervisorsBulkImportSuccessDto } from './dto/supervisors-bulk-import-success.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateAdminSuccessDto } from './dto/create-admin-success.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async tagsBulkImport(dto: TagsBulkImportDto): Promise<TagsBulkImportSuccessDto> {
    return this.adminRepository.tagsBulkImport(dto.tags, dto.similarities);
  }

  async supervisorsBulkImport(
    dto: SupervisorsBulkImportDto,
  ): Promise<SupervisorsBulkImportSuccessDto> {
    return this.adminRepository.supervisorsBulkImport(dto.supervisors);
  }

  async createAdmin(dto: CreateAdminDto): Promise<CreateAdminSuccessDto> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findUserByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException(`A user with email ${dto.email} already exists`);
    }

    // Destructure the DTO and pass primitive data to the repository
    const adminData = {
      email: dto.email,
      first_name: dto.first_name,
      last_name: dto.last_name,
    };

    // Create the admin user
    const newAdmin = await this.adminRepository.createAdmin(adminData);

    // Return formatted response
    return {
      success: true,
      message: 'Admin user created successfully',
      adminId: newAdmin.id,
    };
  }
}
