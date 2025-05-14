import { Type } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsNumber,
  ValidateNested,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  Min,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupervisorDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'supervisorId@fhstp.ac.at',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'First name of the user. Required if creating a new supervisor account.',
    example: 'Max',
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({
    description: 'Last name of the user. Required if creating a new supervisor account.',
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

  @ApiPropertyOptional({
    description: 'The supervisor bio',
    example: 'Professor specializing in artificial intelligence and machine learning',
  })
  @MaxLength(2000, {
    message: 'Bio cannot be longer than 2000 characters',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Number of available spots for supervision',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  available_spots?: number;

  @ApiPropertyOptional({
    description: 'Total spots for supervision',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  total_spots?: number;

  @ApiProperty({
    description: 'ID of the user associated with this supervisor profile',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}

export class SupervisorsBulkImportDto {
  @ApiProperty({
    description: 'Array of supervisor data to import',
    type: [SupervisorDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupervisorDto)
  supervisors: SupervisorDto[];
}
