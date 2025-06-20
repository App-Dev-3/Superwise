import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserSuccessDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message with user email',
    example: 'User john.doe@fhstp.ac.at has been deleted successfully',
  })
  message: string;
}
