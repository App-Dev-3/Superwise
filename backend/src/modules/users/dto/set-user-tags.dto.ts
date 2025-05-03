import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

// Internal DTO for defining structure within the array
class UserTagPriorityDto {
  @ApiProperty({ description: 'Tag ID (UUID)', format: 'uuid' })
  @IsUUID()
  tag_id: string;

  @ApiProperty({
    description:
      'Priority order for the tag (1 = highest priority, 2 = next highest, etc.). Must be sequential positive integers starting from 1.',
    minimum: 1,
    example: 1,
  })
  @IsInt()
  @Min(1)
  priority: number;
}

// Main DTO for the request body
export class SetUserTagsDto {
  @ApiProperty({
    description:
      'An ordered list of tags with their priorities for the user. Replaces all existing tags for the user.',
    isArray: true,
    type: [UserTagPriorityDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserTagPriorityDto)
  tags: UserTagPriorityDto[];
}
