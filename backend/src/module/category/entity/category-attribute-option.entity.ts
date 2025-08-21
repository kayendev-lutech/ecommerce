import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/base.entity';
import { CategoryAttribute } from './category-attribute.entity';
import { ProductAttributeValue } from '@module/product/entity/product-attribute-value.entity';
import { VariantAttributeValue } from '@module/variant/entity/variant-attribute-value.entity';

@Entity('category_attribute_options')
export class CategoryAttributeOption extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  category_attribute_id!: number;

  @Column({ type: 'varchar', length: 100 })
  option_value!: string; // 'red', 'blue', '128gb', 's', 'm', etc.

  @Column({ type: 'varchar', length: 100 })
  display_name!: string; // 'Đỏ', 'Xanh dương', '128GB', 'S', 'M', etc.

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  // Relations
  @ManyToOne(() => CategoryAttribute, attr => attr.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_attribute_id' })
  categoryAttribute!: CategoryAttribute;

  @OneToMany(() => ProductAttributeValue, value => value.categoryAttributeOption)
  productValues!: ProductAttributeValue[];

  @OneToMany(() => VariantAttributeValue, value => value.categoryAttributeOption)
  variantValues!: VariantAttributeValue[];
}