import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: string;

  @Column({ type: 'int' })
  user_id!: string;

  @Column({ type: 'varchar' })
  token!: string; // hashed if sensitive

  @Column({ type: 'varchar' })
  type!: string; // 'refresh','reset_password','verify_email','api'

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @Column({ type: 'boolean', default: false })
  is_revoked!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'varchar', nullable: true })
  created_ip?: string;

  @Column({ type: 'varchar', nullable: true })
  user_agent?: string;
}
