import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductAttributeValue } from "./product-attribute-value.entity";

@Entity('product_attributes')
export class ProductAttribute extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string; // 'color', 'size', 'material', 'brand'

  @Column({ type: 'varchar', length: 100 })
  display_name: string; // 'Color', 'Size', 'Material', 'Brand'

  @Column({ type: 'enum', enum: ['text', 'number', 'boolean', 'date', 'select'] })
  data_type: string;

  @Column({ type: 'json', nullable: true })
  options?: string[]; // ['Red', 'Blue', 'Green'] cho select type

  @Column({ type: 'boolean', default: true })
  is_required: boolean;

  @Column({ type: 'boolean', default: true })
  is_filterable: boolean; // có thể filter trong search

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @OneToMany(() => ProductAttributeValue, value => value.categoryAttribute.name)
  values: ProductAttributeValue[];
}