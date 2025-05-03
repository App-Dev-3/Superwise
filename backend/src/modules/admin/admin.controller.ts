import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { BulkImportDto } from './dto/bulk-import.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('tags/bulk-import')
  @ApiOperation({ summary: 'Bulk import tags and their similarities' })
  @ApiResponse({
    status: 200,
    description: 'Tags and similarities successfully imported',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Tags and similarities imported successfully' },
        tagsProcessed: { type: 'number', example: 10 },
        similaritiesReplaced: { type: 'number', example: 25 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data or inconsistent tags and similarities',
  })
  bulkImport(@Body() dto: BulkImportDto) {
    return this.adminService.bulkImport(dto);
  }
}
