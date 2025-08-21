import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/base.entity';
import { Variant } from '@module/variant/entity/variant.entity';
import { CurrencyCode } from '@common/currency.enum';
import { ProductAttributeValue } from './product-attribute-value.entity';

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

  // Relations
  @OneToMany(() => Variant, variant => variant.product, { cascade: true })
  variants!: Variant[];

  @OneToMany(() => ProductAttributeValue, value => value.product, { cascade: true })
  attributeValues!: ProductAttributeValue[];

  // Helper method to get attributes as object
  getAttributes(): Record<string, any> {
    const result: Record<string, any> = {};
    if (this.attributeValues) {
      this.attributeValues.forEach(value => {
        const attrName = value.categoryAttribute.name;
        const dataType = value.categoryAttribute.type;
        const rawValue = value.getRawValue();
        
        switch (dataType) {
          case 'number':
            result[attrName] = parseFloat(rawValue);
            break;
          case 'boolean':
            result[attrName] = rawValue === 'true';
            break;
          default:
            result[attrName] = rawValue;
        }
      });
    }
    return result;
  }
}