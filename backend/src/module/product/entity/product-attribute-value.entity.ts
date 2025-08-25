import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@common/base.entity';
import { Product } from './product.entity';
import { CategoryAttribute } from '@module/category/entity/category-attribute.entity';
import { CategoryAttributeOption } from '@module/category/entity/category-attribute-option.entity';

@Index(['product_id', 'category_attribute_id'], { unique: true })
@Entity('product_attribute_values')
export class ProductAttributeValue extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  product_id!: number;

  @Column({ type: 'int' })
  category_attribute_id!: number;

  @Column({ type: 'int', nullable: true })
  category_attribute_option_id?: number | null;

  @Column({ type: 'text', nullable: true })
  custom_value?: string | null;

  // Relations
  @ManyToOne(() => Product, (product) => product.attributeValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => CategoryAttribute, (attr) => attr.productValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_attribute_id' })
  categoryAttribute!: CategoryAttribute;

  @ManyToOne(() => CategoryAttributeOption, (option) => option.productValues, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'category_attribute_option_id' })
  categoryAttributeOption?: CategoryAttributeOption | null;

  // Helper method to get display value
  getDisplayValue(): string {
    return this.categoryAttributeOption?.display_name || this.custom_value || '';
  }

  // Helper method to get raw value
  getRawValue(): string {
    return this.categoryAttributeOption?.option_value || this.custom_value || '';
  }
}
