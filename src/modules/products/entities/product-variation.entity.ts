import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('product_variations')
export class ProductVariationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ name: 'product_id' })
  productId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'sale_price' })
  salePrice?: number;

  @Column()
  sku: string;

  @Column('int', { default: 0 })
  quantity: number;

  @Column('int', { default: 0, name: 'sold_quantity' })
  soldQuantity: number;

  @Column({ default: false, name: 'is_disabled' })
  isDisabled: boolean;

  @Column({ default: false, name: 'is_digital' })
  isDigital: boolean;

  @Column('jsonb', { nullable: true })
  image?: {
    id?: number;
    thumbnail?: string;
    original?: string;
    fileName?: string;
  };

  @Column('jsonb', { nullable: true })
  options?: Array<{
    name: string;
    value: string;
  }>;

  @Column('jsonb', { nullable: true, name: 'digital_file' })
  digitalFile?: {
    attachmentId: number;
    url: string;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations - use string reference to avoid circular imports
  @ManyToOne('ProductEntity', 'variations')
  @JoinColumn({ name: 'product_id' })
  product: any;
}