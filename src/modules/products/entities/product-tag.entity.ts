import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('product_tags')
@Index(['productId', 'tagId'], { unique: true })
export class ProductTagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'tag_id' })
  tagId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations - use string reference to avoid circular imports
  @ManyToOne('ProductEntity', 'productTags')
  @JoinColumn({ name: 'product_id' })
  product: any;

  // @ManyToOne(() => TagEntity)
  // @JoinColumn({ name: 'tag_id' })
  // tag: TagEntity;
}