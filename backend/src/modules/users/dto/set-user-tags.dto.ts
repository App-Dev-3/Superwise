import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

// Internal DTO for defining structure within the array
class UserTagPriorityDto {
  @ApiProperty({
    description: 'Tag ID (UUID)',
    format: 'uuid',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
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
    example: [
      {
        tag_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        priority: 1,
      },
      {
        tag_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        priority: 2,
      },
      {
        tag_id: 'f47ac10b-54cc-6453-b567-0e02b2c3d479',
        priority: 3,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserTagPriorityDto)
  tags: UserTagPriorityDto[];
}
