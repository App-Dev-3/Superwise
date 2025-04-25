import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ 
    description: 'Email address of the user', 
    example: 'studentId@fhstp.ac.at',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'First name of the user', 
    example: 'Max',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ 
    description: 'Last name of the user', 
    example: 'Mustermann',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ 
    description: 'Role of the user in the system', 
    enum: Role,
    example: 'STUDENT',
    enumName: 'Role',
    required: true
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @ApiProperty({ 
    description: 'URL to user profile image', 
    example: 'https://example.com/images/profile.jpg',
    required: false
  })
  @IsString()
  @IsOptional()
  profile_image?: string;
}
