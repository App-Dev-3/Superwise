import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateUserBlockDto {
  @ApiProperty({
    description: 'ID of the user to block',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'blocked_id must be a valid UUID v4' })
  blocked_id: string;
}
