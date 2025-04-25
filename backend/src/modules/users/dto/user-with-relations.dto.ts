import { ApiProperty } from '@nestjs/swagger';
import { User, Student, Supervisor, UserTag, Role } from '@prisma/client';

export class UserWithRelationsDto implements User {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  role: Role;

  @ApiProperty({ required: false })
  profile_image: string | null;

  @ApiProperty()
  is_registered: boolean;

  @ApiProperty()
  is_deleted: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  // Relations
  @ApiProperty({ required: false })
  student_profile?: Student;

  @ApiProperty({ required: false })
  supervisor_profile?: Supervisor;

  @ApiProperty({ required: false })
  tags?: UserTag[];

  @ApiProperty({ required: false })
  blocked_users?: any[];

  @ApiProperty({ required: false })
  blocked_by_users?: any[];
} 