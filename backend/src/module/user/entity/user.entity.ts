import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@common/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: string;

  @Exclude()
  @Column({ type: 'varchar', unique: true })
  username!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at?: Date;

  @Exclude()
  @Column({ type: 'varchar' })
  password_hash!: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  full_name?: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  avatar_url?: string;

  @Column({ type: 'varchar', default: 'customer' })
  role!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at?: Date;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;
}
