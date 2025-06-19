import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeEmail } from '../../../common/utils/email-utils';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'updated@fhstp.ac.at',
  })
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => normalizeEmail(value))
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
}
