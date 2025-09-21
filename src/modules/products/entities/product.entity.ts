import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ProductStatus, ProductType } from '../../../core/entities/product.entity';

@Entity('products')
@Index(['status', 'inStock'])
@Index(['shopId', 'status'])
@Index(['slug'], { unique: true })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ name: 'type_id', nullable: true })
  typeId?: number;

  @Column({ name: 'shop_id', nullable: true })
  shopId?: number;

  @Column({ name: 'author_id', nullable: true })
  authorId?: number;

  @Column({ name: 'manufacturer_id', nullable: true })
  manufacturerId?: number;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.SIMPLE,
    name: 'product_type',
  })
  productType: ProductType;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'sale_price' })
  salePrice?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'max_price' })
  maxPrice?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'min_price' })
  minPrice?: number;

  @Column({ nullable: true })
  sku?: string;

  @Column('int', { default: 0 })
  quantity: number;

  @Column('int', { default: 0, name: 'sold_quantity' })
  soldQuantity: number;

  @Column({ nullable: true })
  unit?: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Column({ default: true, name: 'in_stock' })
  inStock: boolean;

  @Column({ default: false, name: 'is_taxable' })
  isTaxable: boolean;

  @Column({ default: false, name: 'is_digital' })
  isDigital: boolean;

  @Column({ default: false, name: 'is_external' })
  isExternal: boolean;

  @Column({ nullable: true, name: 'external_product_url' })
  externalProductUrl?: string;

  @Column({ nullable: true, name: 'external_product_button_text' })
  externalProductButtonText?: string;

  @Column({ nullable: true })
  height?: string;

  @Column({ nullable: true })
  length?: string;

  @Column({ nullable: true })
  width?: string;

  @Column('jsonb', { nullable: true })
  image?: {
    id?: number;
    thumbnail?: string;
    original?: string;
    fileName?: string;
  };

  @Column('jsonb', { nullable: true })
  gallery?: Array<{
    id?: number;
    thumbnail?: string;
    original?: string;
    fileName?: string;
  }>;

  @Column('jsonb', { nullable: true })
  videos?: Array<{
    url: string;
  }>;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  ratings?: number;

  @Column('int', { nullable: true, name: 'in_flash_sale' })
  inFlashSale?: number;

  @Column({ nullable: true })
  language?: string;

  @Column('text', { array: true, nullable: true, name: 'translated_languages' })
  translatedLanguages?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations - use string references to avoid circular imports
  @OneToMany('ProductVariationEntity', 'product')
  variations?: any[];

  @OneToMany('WishlistEntity', 'product')
  wishlists?: any[];

  @OneToMany('ProductCategoryEntity', 'product')
  productCategories?: any[];

  @OneToMany('ProductTagEntity', 'product')
  productTags?: any[];

  // These relations would be added when we have the other entities
  // @ManyToOne(() => TypeEntity, { nullable: true })
  // @JoinColumn({ name: 'type_id' })
  // type?: TypeEntity;

  // @ManyToOne(() => ShopEntity, { nullable: true })  
  // @JoinColumn({ name: 'shop_id' })
  // shop?: ShopEntity;

  // @ManyToOne(() => AuthorEntity, { nullable: true })
  // @JoinColumn({ name: 'author_id' })
  // author?: AuthorEntity;

  // @ManyToOne(() => ManufacturerEntity, { nullable: true })
  // @JoinColumn({ name: 'manufacturer_id' })
  // manufacturer?: ManufacturerEntity;
}