import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { TagsBulkImportDto } from './dto/tagsBulk-import.dto';
import { TagsBulkImportSuccessDto } from './dto/tagsBulk-import-success.dto';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async tagsBulkImport(dto: TagsBulkImportDto): Promise<TagsBulkImportSuccessDto> {
    return this.adminRepository.tagsBulkImport(dto.tags, dto.similarities);
  }
}
