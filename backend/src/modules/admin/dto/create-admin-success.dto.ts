import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminSuccessDto {
  @ApiProperty({
    description: 'Success flag',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Admin user created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'ID of the created admin user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  adminId: string;
}
