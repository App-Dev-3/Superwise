import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'studentId@fhstp.ac.at',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'Max',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Mustermann',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiPropertyOptional({
    description: 'URL to user profile image',
    example: 'https://example.com/images/profile.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  profile_image?: string;
}
