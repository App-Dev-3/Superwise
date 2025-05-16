import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { RequestState } from '@prisma/client';

export class SupervisionRequestQueryDto {
  @ApiPropertyOptional({
    description: 'Filter requests by their state',
    enum: RequestState,
    example: RequestState.PENDING,
  })
  @IsEnum(RequestState, { message: 'Must be a valid request state' })
  @IsOptional()
  request_state?: RequestState;
}
