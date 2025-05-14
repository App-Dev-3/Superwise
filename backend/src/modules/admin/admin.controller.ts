import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { TagsBulkImportDto } from './dto/tagsBulk-import.dto';
import { TagsBulkImportSuccessDto } from './dto/tagsBulk-import-success.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('tags/bulk-import')
  @ApiOperation({ summary: 'Bulk import tags and their similarities' })
  @ApiBody({
    type: TagsBulkImportDto,
    description: 'New Tags and similarities for the application',
  })
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
  async tagsBulkImport(@Body() dto: TagsBulkImportDto): Promise<TagsBulkImportSuccessDto> {
    return this.adminService.bulkImport(dto);
  }
}
