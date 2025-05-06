import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { BulkImportDto } from './dto/bulk-import.dto';
import { BulkImportSuccessDto } from './dto/bulk-import-success.dto';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async bulkImport(dto: BulkImportDto): Promise<BulkImportSuccessDto> {
    return this.adminRepository.bulkImport(dto.tags, dto.similarities);
  }
}
