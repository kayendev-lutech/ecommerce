import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/base.entity';
import { Category } from './category.entity';
import { CategoryAttributeOption } from './category-attribute-option.entity';
import { ProductAttributeValue } from '@module/product/entity/product-attribute-value.entity';
import { VariantAttributeValue } from '@module/variant/entity/variant-attribute-value.entity';
import { AttributeType } from '@common/attribute.enum';

@Entity('category_attributes')
export class CategoryAttribute extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  category_id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string; // 'color', 'size', 'storage', etc.

  @Column({ type: 'enum', enum: AttributeType })
  type!: AttributeType; // text, number, boolean, enum

  @Column({ type: 'boolean', default: false })
  is_required!: boolean;

  @Column({ type: 'boolean', default: false })
  is_variant_level!: boolean; // true nếu attribute này dành cho variant level

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  // Relations
  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @OneToMany(() => CategoryAttributeOption, option => option.categoryAttribute, { cascade: true })
  options!: CategoryAttributeOption[];

  @OneToMany(() => ProductAttributeValue, value => value.categoryAttribute)
  productValues!: ProductAttributeValue[];

  @OneToMany(() => VariantAttributeValue, value => value.categoryAttribute)
  variantValues!: VariantAttributeValue[];
}