import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base.entity';
import { Product } from '@module/product/entity/product.entity';
import { CurrencyCode } from '@module/product/entity/product.enum';

@Entity('variants')
export class Variant extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'int' })
  product_id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  sku?: string;

  @Column({ type: 'varchar', nullable: true })
  barcode?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discount_price?: number;

  @Column({ type: 'enum', enum: CurrencyCode, default: CurrencyCode.VND })
  currency_code?: string;

  @Column({ type: 'int', default: 0 })
  stock?: number;

  @Column({ type: 'int', default: 0 })
  stock_reserved?: number;

  @Column({ type: 'int', default: 0 })
  low_stock_threshold?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'varchar', nullable: true })
  image_url?: string;

  @Column({ type: 'json', nullable: true })
  attributes?: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'boolean', default: false })
  is_default!: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order?: number;
  
  @ManyToOne(() => Product, product => product.variants)
  @JoinColumn({ name: 'product_id' }) 
  product!: Product;
}
