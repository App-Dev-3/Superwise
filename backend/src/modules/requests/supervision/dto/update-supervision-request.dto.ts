import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestState } from '@prisma/client';

export class UpdateSupervisionRequestDto {
  @ApiProperty({
    description: 'The new state of the request',
    enum: RequestState,
    example: RequestState.ACCEPTED,
  })
  @IsEnum(RequestState, { message: 'Must be a valid request state' })
  @IsNotEmpty({ message: 'Request state is required' })
  request_state: RequestState;
}
