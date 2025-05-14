import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSupervisorDto {
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
  // should the user_id be passed separately or stay here.
  // Should the user_id be part of supervisor dto or should be handled separately? no use
}
