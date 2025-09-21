import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('wishlists')
@Index(['userId', 'productId'], { unique: true })
export class WishlistEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations - use string reference to avoid circular imports
  @ManyToOne('ProductEntity', 'wishlists')
  @JoinColumn({ name: 'product_id' })
  product: any;

  // @ManyToOne(() => UserEntity)
  // @JoinColumn({ name: 'user_id' })
  // user: UserEntity;
}