import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { TagsBulkImportDto } from './dto/tags-bulk-import.dto';
import { TagsBulkImportSuccessDto } from './dto/tags-bulk-import-success.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SupervisorsBulkImportDto } from './dto/supervisors-bulk-import.dto';
import { SupervisorsBulkImportSuccessDto } from './dto/supervisors-bulk-import-success.dto';
//import { Public } from '../../common/decorators/public.decorator';

@ApiTags('admin')
@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  //@Public()
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
    return this.adminService.tagsBulkImport(dto);
  }
  //@Public()
  @Post('supervisors/bulk-import')
  @ApiOperation({ summary: 'Bulk import Supervisors and their profiles' })
  @ApiBody({
    type: SupervisorsBulkImportDto,
    description: 'New Supervisors for the application',
  })
  @ApiResponse({
    status: 200,
    description: 'Supervisors successfully imported',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Supervisors successfully imported' },
        supervisorsImported: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid datas',
  })
  async supervisorsBulkImport(
    @Body() dto: SupervisorsBulkImportDto,
  ): Promise<SupervisorsBulkImportSuccessDto> {
    return this.adminService.supervisorsBulkImport(dto);
  }
}
