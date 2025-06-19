import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeEmail } from '../../../common/utils/email-utils';
import { IsAllowedEmailDomain } from '../../../common/validators/allowed-email-domains.validator';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Email address of the admin user',
    example: 'admin@fhstp.ac.at',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => normalizeEmail(value))
  @IsAllowedEmailDomain({
    message: 'Email must be from an allowed domain',
  })
  email: string;

  @ApiProperty({
    description: 'First name of the admin user',
    example: 'John',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'Last name of the admin user',
    example: 'Doe',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;
}
