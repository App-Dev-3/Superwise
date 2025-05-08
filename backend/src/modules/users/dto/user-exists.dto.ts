import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for the minimal user existence check response
 * Contains only non-sensitive information needed for the frontend registration flow
 */
export class UserExistsDto {
  @ApiProperty({
    description: 'Whether a user with this email exists in our system',
    example: true,
  })
  exists: boolean;

  @ApiProperty({
    description:
      'Whether the user has completed registration. If exists=true and is_registered=true, go-to dashboard. If exists=true and is_registered=false, show registration form for supervisor. If exists=false, show registration form for student.',
    example: false,
  })
  is_registered: boolean;
}
