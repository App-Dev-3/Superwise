import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStudentDto {
  @ApiPropertyOptional({
    description: "Brief description of the student's thesis or research interests",
    example: 'AI-based recommendation system for supervisor matching',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, {
    message: 'Thesis description cannot be longer than 2000 characters',
  })
  thesis_description?: string;
}
