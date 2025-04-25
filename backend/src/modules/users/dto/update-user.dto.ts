import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ 
    description: 'User email address', 
    example: 'updated@fhstp.ac.at',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    description: 'User first name', 
    example: 'UpdatedName',
    required: false
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({ 
    description: 'User last name', 
    example: 'UpdatedLastName',
    required: false
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({ 
    description: 'User role', 
    enum: Role,
    example: 'SUPERVISOR',
    required: false
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({ 
    description: 'URL to user profile image', 
    example: 'https://example.com/images/updated-profile.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  profile_image?: string;
}
