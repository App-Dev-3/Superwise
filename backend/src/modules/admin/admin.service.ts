import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { TagsRepository } from '../tags/tags.repository';
import { BulkImportDto } from './dto/bulk-import.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly tagsRepository: TagsRepository,
  ) {}
 
  async bulkImport(dto: BulkImportDto) {
    const result = await this.adminRepository.bulkImport(dto.tags, dto.similarities);

    return {
      success: true,
      message: 'Tags and similarities imported successfully',
      tagsProcessed: result.tags.length,
      similaritiesReplaced: result.replacedCount,
    };
  }
}
