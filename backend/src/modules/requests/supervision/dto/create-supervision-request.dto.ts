import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsAllowedEmailDomain } from '../../../../common/validators/allowed-email-domains.validator';

export class CreateSupervisionRequestDto {
  @ApiPropertyOptional({
    description: 'The supervisor ID (required for student requests)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  supervisor_id?: string;

  @ApiPropertyOptional({
    description:
      'The student email (required for supervisor requests). If the student does not exist, a new account will be created.',
    example: 'student@fhstp.ac.at',
  })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase() : (value as string),
  )
  @IsAllowedEmailDomain({
    message: 'Email must be from an allowed domain',
  })
  student_email?: string;
}
