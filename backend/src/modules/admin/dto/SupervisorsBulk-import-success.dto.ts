import { ApiProperty } from '@nestjs/swagger';

export class SupervisorsBulkImportSuccessDto {
  @ApiProperty({
    description: 'Success flag',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Supervisors imported successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Number of Supervisors imported',
    example: 10,
  })
  supervisorsImported: number;

  @ApiProperty({
    description: 'Number of Supervisors Updated',
    example: 10,
  })
  supervisorsUpdated: number;
}
