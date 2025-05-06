import { ApiProperty } from '@nestjs/swagger';

export class BulkImportSuccessDto {
  @ApiProperty({
    description: 'Success flag',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Tags and similarities imported successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Number of tags processed',
    example: 10,
  })
  tagsProcessed: number;

  @ApiProperty({
    description: 'Number of similarities replaced',
    example: 15,
  })
  similaritiesReplaced: number;
}
