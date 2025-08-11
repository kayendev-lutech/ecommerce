import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/base.entity';
import { Variant } from '@module/variant/entity/variant.entity';
import { CurrencyCode } from './product.enum';

@Entity('products')
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

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

  @Column({ type: 'enum', enum: CurrencyCode, default: CurrencyCode.VND })
  currency_code!: string;

  @Column({ type: 'int' })
  category_id!: number;

  @Column({ type: 'varchar', nullable: true })
  image_url?: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'boolean', default: true })
  is_visible!: boolean;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => Variant, variant => variant.product)
  variants?: Variant[];
}
