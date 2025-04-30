import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiProperty()
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
  @ApiPropertyOptional()
  student_profile?: Student;

  @ApiPropertyOptional()
  supervisor_profile?: Supervisor;

  @ApiPropertyOptional({ isArray: true })
  tags?: UserTag[];

  @ApiPropertyOptional({ isArray: true })
  blocked_users?: any[];

  @ApiPropertyOptional({ isArray: true })
  blocked_by_users?: any[];
}
