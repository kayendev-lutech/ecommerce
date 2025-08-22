import { ApiProperty } from '@nestjs/swagger';

export class UserResDto {
  @ApiProperty({ example: 1 })
  id!: string;

  @ApiProperty({ example: 'john_doe' })
  username!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiProperty({ example: 'John Doe', required: false })
  full_name?: string;

  @ApiProperty({ example: '+84901234567', required: false })
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  avatar_url?: string;

  @ApiProperty({ example: 'customer' })
  role!: string;

  @ApiProperty({ example: true })
  is_active!: boolean;

  @ApiProperty({ type: 'string', format: 'date-time', required: false })
  last_login_at?: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updated_at!: Date;

  @ApiProperty({ type: 'string', format: 'date-time', required: false })
  deleted_at?: Date;

  @ApiProperty({ type: Object, required: false })
  metadata?: Record<string, any>;
}
