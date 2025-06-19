import { Type, Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsNumber,
  ValidateNested,
  IsNotEmpty,
  IsOptional,
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
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase() : (value as string),
  )
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
