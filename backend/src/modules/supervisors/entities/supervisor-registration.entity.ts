import { ApiProperty } from '@nestjs/swagger';
import { UserTag } from '@prisma/client';

export class SupervisorRegistrationResponse {
  @ApiProperty({
    description: 'Indicates if the registration was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Supervisor registered successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User tags with priorities',
    isArray: true,
  })
  tags: UserTag[];
}
