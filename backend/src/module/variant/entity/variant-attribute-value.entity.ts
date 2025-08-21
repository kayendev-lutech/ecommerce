import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@common/base.entity';
import { Variant } from './variant.entity';
import { CategoryAttribute } from '@module/category/entity/category-attribute.entity';
import { CategoryAttributeOption } from '@module/category/entity/category-attribute-option.entity';

@Index(['variant_id', 'category_attribute_id'], { unique: true })
@Entity('variant_attribute_values')
export class VariantAttributeValue extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  variant_id!: number;

  @Column({ type: 'int' })
  category_attribute_id!: number;

  @Column({ type: 'int', nullable: true })
  category_attribute_option_id?: number | null;

  @Column({ type: 'text', nullable: true })
  custom_value?: string | null;
  // Relations
  @ManyToOne(() => Variant, variant => variant.attributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant!: Variant;

  @ManyToOne(() => CategoryAttribute, attr => attr.variantValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_attribute_id' })
  categoryAttribute!: CategoryAttribute;

  @ManyToOne(() => CategoryAttributeOption, option => option.variantValues, { 
    onDelete: 'CASCADE',
    nullable: true 
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