import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('product_categories')
@Index(['productId', 'categoryId'], { unique: true })
export class ProductCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'category_id' })
  categoryId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations - use string reference to avoid circular imports
  @ManyToOne('ProductEntity', 'productCategories')
  @JoinColumn({ name: 'product_id' })
  product: any;

  // @ManyToOne(() => CategoryEntity)
  // @JoinColumn({ name: 'category_id' })
  // category: CategoryEntity;
}