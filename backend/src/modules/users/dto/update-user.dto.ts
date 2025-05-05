import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
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

  @ApiPropertyOptional({
    description: 'Whether user has completed registration',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_registered?: boolean;
}
