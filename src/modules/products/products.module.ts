import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './services/products.service';
import { ProductsResolver } from './controllers/products.resolver';
import { ProductRepository } from './repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../core/interfaces/repositories/product.repository.interface';

// Import entities
import {
  ProductEntity,
  ProductVariationEntity,
  WishlistEntity,
  ProductCategoryEntity,
  ProductTagEntity,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductVariationEntity,
      WishlistEntity,
      ProductCategoryEntity,
      ProductTagEntity,
    ]),
  ],
  providers: [
    ProductsService,
    ProductsResolver,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
  ],
  exports: [ProductsService, PRODUCT_REPOSITORY],
})
export class ProductsModule {}