import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'updated@fhstp.ac.at',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'UpdatedName',
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'UpdatedLastName',
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({
    description: 'URL to user profile image',
    example: 'https://example.com/images/updated-profile.jpg',
  })
  @IsString()
  @IsOptional()
  profile_image?: string;

  @IsBoolean()
  @IsOptional()
  is_registered?: boolean;

  @ApiPropertyOptional({
    description: 'User deletion status',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;

  @ApiPropertyOptional({
    description: 'Clerk ID for authentication',
    example: 'user_2NUj8tGhSFhTLD9sdP0q4P7VoJM',
  })
  @IsString()
  @IsOptional()
  clerk_id?: string | null;
}
