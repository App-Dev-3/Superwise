import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { TagsBulkImportDto } from './dto/tags-bulk-import.dto';
import { TagsBulkImportSuccessDto } from './dto/tags-bulk-import-success.dto';
import { SupervisorsBulkImportDto } from './dto/supervisors-bulk-import.dto';
import { SupervisorsBulkImportSuccessDto } from './dto/supervisors-bulk-import-success.dto';
@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async tagsBulkImport(dto: TagsBulkImportDto): Promise<TagsBulkImportSuccessDto> {
    return this.adminRepository.tagsBulkImport(dto.tags, dto.similarities);
  }

  async supervisorsBulkImport(
    dto: SupervisorsBulkImportDto,
  ): Promise<SupervisorsBulkImportSuccessDto> {
    return this.adminRepository.supervisorsBulkImport(dto.supervisors);
  }
}
