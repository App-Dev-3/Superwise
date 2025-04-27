import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserTagDto } from '../../users/dto/user-tag.dto';

export class registerSupervisorDto {
  @ApiProperty({
    description: 'Tags and their priorities for the supervisor',
    type: [UserTagDto],
    example: [
      { tag_id: '123e4567-e89b-12d3-a456-426614174000', priority: 1 },
      { tag_id: '223e4567-e89b-12d3-a456-426614174000', priority: 2 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserTagDto)
  @IsNotEmpty()
  tags: UserTagDto[];
}
