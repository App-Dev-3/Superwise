import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateStudentDto } from './create-student.dto';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({
    description: 'The student thesis description or research interests',
    example: 'AI-based recommendation system for supervisor matching',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, {
    message: 'Thesis description cannot be longer than 2000 characters',
  })
  thesis_description?: string;
}
