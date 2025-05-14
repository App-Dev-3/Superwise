import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

//export class UpdateSupervisorDto extends OmitType(PartialType(CreateSupervisorDto), ['user_id']) {
// i will remove the user_id from here and use email or nothing since it is poducing and error
// TODO check if any supervisor can change any other superviosrs profile if i remove the omit from here.
// todo break the system.
export class UpdateSupervisorDto {
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
}
