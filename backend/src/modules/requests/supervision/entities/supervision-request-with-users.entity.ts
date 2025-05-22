import { ApiProperty } from '@nestjs/swagger';
import { SupervisionRequestEntity } from './supervision-request.entity';

// Define the minimal user data structure to be returned
class UserBasicInfo {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  last_name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john.doe@fhstp.ac.at',
  })
  email: string;

  @ApiProperty({
    description: 'User profile image URL',
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  profile_image: string | null;
}

// Define student with minimal user data
class StudentWithUser {
  @ApiProperty({
    description: 'Student ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'User ID associated with the student',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  user_id: string;

  @ApiProperty({
    description: 'Basic user information',
    type: UserBasicInfo,
  })
  user: UserBasicInfo;
}

// Define supervisor with minimal user data
class SupervisorWithUser {
  @ApiProperty({
    description: 'Supervisor ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'User ID associated with the supervisor',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  user_id: string;

  @ApiProperty({
    description: 'Basic user information',
    type: UserBasicInfo,
  })
  user: UserBasicInfo;
}

export class SupervisionRequestWithUsersEntity extends SupervisionRequestEntity {
  @ApiProperty({
    description: 'Student who sent the request',
    type: StudentWithUser,
  })
  student: StudentWithUser;

  @ApiProperty({
    description: 'Supervisor who received the request',
    type: SupervisorWithUser,
  })
  supervisor: SupervisorWithUser;
}
