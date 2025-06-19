import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeEmail } from '../../../common/utils/email-utils';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'studentId@fhstp.ac.at',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => normalizeEmail(value))
  email: string;

  @ApiPropertyOptional({
    description: 'First name of the user. Required if creating a new student account.',
    example: 'Max',
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({
    description: 'Last name of the user. Required if creating a new student account.',
    example: 'Mustermann',
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({
    description: 'URL to user profile image',
    example: 'https://example.com/images/profile.jpg',
  })
  @IsString()
  @IsOptional()
  profile_image?: string;
}
