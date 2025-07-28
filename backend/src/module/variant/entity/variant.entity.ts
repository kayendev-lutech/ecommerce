import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@common/base.entity';

@Entity('variants')
export class Variant extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: string;

  @Column({ type: 'int' })
  product_id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  sku?: string;

  @Column({ type: 'varchar', nullable: true })
  barcode?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discount_price?: number;

  @Column({ type: 'varchar', nullable: true })
  currency_code?: string;

  @Column({ type: 'int', nullable: true })
  stock?: number;

  @Column({ type: 'int', nullable: true })
  stock_reserved?: number;

  @Column({ type: 'int', nullable: true })
  low_stock_threshold?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'varchar', nullable: true })
  image_url?: string;

  @Column({ type: 'json', nullable: true })
  attributes?: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;
}
