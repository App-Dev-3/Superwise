import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UserTagDto {
  @ApiProperty({ description: 'Tag ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  tag_id: string;

  @ApiProperty({ description: 'Priority of the tag for this user', example: 1 })
  @IsInt()
  @IsNotEmpty()
  priority: number;
}
