import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@common/base.entity';

@Entity('products')
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discount_price?: number;

  @Column({ type: 'varchar', default: 'VND' })
  currency_code!: string;

  @Column({ type: 'int' })
  category_id!: string;

  @Column({ type: 'varchar', nullable: true })
  image_url?: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'boolean', default: true })
  is_visible!: boolean;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;
}
