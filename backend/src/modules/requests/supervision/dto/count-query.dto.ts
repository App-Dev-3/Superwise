import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestState } from '@prisma/client';

export class CountQueryDto {
  @ApiProperty({
    description: 'The request state to count',
    enum: RequestState,
    example: RequestState.PENDING,
  })
  @IsEnum(RequestState, { message: 'Must be a valid request state' })
  @IsNotEmpty({ message: 'Request state is required' })
  request_state: RequestState;
}
