import { BaseEntity, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { ProductAttribute } from "./product-attribute.entity";

// src/module/product/entity/product-attribute-value.entity.ts
@Index(['product_id', 'attribute_id'], { unique: true }) // Một product chỉ có 1 giá trị cho 1 attribute
@Entity('product_attribute_values')
export class ProductAttributeValue extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  product_id: number;

  @Column({ type: 'int' })
  attribute_id: number;

  @Column({ type: 'text' })
  value: string; // Lưu tất cả dưới dạng string, convert khi cần

  @ManyToOne(() => Product, product => product.attributeValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => ProductAttribute, attribute => attribute.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: ProductAttribute;
}