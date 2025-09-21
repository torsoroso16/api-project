import { Injectable, Inject } from '@nestjs/common';
import { Product } from '../../../core/entities/product.entity';
import { PRODUCT_REPOSITORY } from '../../../core/interfaces/repositories/product.repository.interface';
import type { ProductRepositoryInterface } from '../../../core/interfaces/repositories/product.repository.interface';
import { CreateProductUseCase, CreateProductUseCaseInput } from '../../../core/use-cases/products/create-product.usecase';
import { GetProductsUseCase, GetProductsUseCaseInput, GetProductsUseCaseOutput } from '../../../core/use-cases/products/get-products.usecase';
import { GetProductUseCase, GetProductUseCaseInput } from '../../../core/use-cases/products/get-product.usecase';
import { UpdateProductUseCase, UpdateProductUseCaseInput } from '../../../core/use-cases/products/update-product.usecase';
import { DeleteProductUseCase, DeleteProductUseCaseInput } from '../../../core/use-cases/products/delete-product.usecase';
import { ToggleWishlistUseCase, ToggleWishlistUseCaseInput } from '../../../core/use-cases/products/toggle-wishlist.usecase';

@Injectable()
export class ProductsService {
  private readonly createProductUseCase: CreateProductUseCase;
  private readonly getProductsUseCase: GetProductsUseCase;
  private readonly getProductUseCase: GetProductUseCase;
  private readonly updateProductUseCase: UpdateProductUseCase;
  private readonly deleteProductUseCase: DeleteProductUseCase;
  private readonly toggleWishlistUseCase: ToggleWishlistUseCase;

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryInterface,
  ) {
    this.createProductUseCase = new CreateProductUseCase(productRepository);
    this.getProductsUseCase = new GetProductsUseCase(productRepository);
    this.getProductUseCase = new GetProductUseCase(productRepository);
    this.updateProductUseCase = new UpdateProductUseCase(productRepository);
    this.deleteProductUseCase = new DeleteProductUseCase(productRepository);
    this.toggleWishlistUseCase = new ToggleWishlistUseCase(productRepository);
  }

  async createProduct(input: CreateProductUseCaseInput): Promise<Product> {
    return await this.createProductUseCase.execute(input);
  }

  async getProducts(input: GetProductsUseCaseInput): Promise<GetProductsUseCaseOutput> {
    return await this.getProductsUseCase.execute(input);
  }

  async getProduct(input: GetProductUseCaseInput): Promise<Product> {
    return await this.getProductUseCase.execute(input);
  }

  async updateProduct(input: UpdateProductUseCaseInput): Promise<Product> {
    return await this.updateProductUseCase.execute(input);
  }

  async deleteProduct(input: DeleteProductUseCaseInput): Promise<boolean> {
    return await this.deleteProductUseCase.execute(input);
  }

  async getBestSellingProducts(options: {
    limit?: number;
    shopId?: number;
    typeId?: number;
    typeSlug?: string;
    range?: number;
  }): Promise<Product[]> {
    return await this.productRepository.findBestSellingProducts({
      limit: options.limit,
      shopId: options.shopId,
      typeId: options.typeId,
      typeSlug: options.typeSlug,
      range: options.range,
    });
  }

  async getPopularProducts(options: {
    limit?: number;
    shopId?: number;
    typeId?: number;
    typeSlug?: string;
    range?: number;
  }): Promise<Product[]> {
    return await this.productRepository.findPopularProducts({
      limit: options.limit,
      shopId: options.shopId,
      typeId: options.typeId,
      typeSlug: options.typeSlug,
      range: options.range,
    });
  }

  async getRelatedProducts(typeSlug: string, excludeId?: number, limit?: number): Promise<Product[]> {
    return await this.productRepository.findRelatedProducts(typeSlug, excludeId, limit);
  }

  async getLowStockProducts(options: {
    threshold?: number;
    shopId?: number;
    typeId?: number;
    limit?: number;
  }): Promise<Product[]> {
    return await this.productRepository.findLowStockProducts(
      options.threshold,
      options.shopId,
      options.limit
    );
  }

  async getTopRatedProducts(limit?: number) {
    return await this.productRepository.findTopRatedProducts(limit);
  }

  async getCategoryWiseProductCount(limit?: number) {
    return await this.productRepository.getCategoryWiseProductCount(limit);
  }

  async getCategoryWiseProductSales(limit?: number) {
    return await this.productRepository.getCategoryWiseProductSales(limit);
  }

  async getWishlistProducts(userId: number, options: {
    first?: number;
    page?: number;
  }): Promise<GetProductsUseCaseOutput> {
    const { first = 15, page = 1 } = options;
    const offset = (page - 1) * first;

    const [products, total] = await Promise.all([
      this.productRepository.findWishlistProducts(userId, first, offset),
      this.productRepository.countWishlistProducts(userId),
    ]);

    return {
      products,
      total,
      currentPage: page,
      perPage: first,
    };
  }

  async isInWishlist(userId: number, productId: number): Promise<boolean> {
    return await this.productRepository.isInWishlist(userId, productId);
  }

  async toggleWishlist(input: ToggleWishlistUseCaseInput): Promise<boolean> {
    return await this.toggleWishlistUseCase.execute(input);
  }

  async deleteWishlist(userId: number, productSlug: string): Promise<boolean> {
    const product = await this.productRepository.findBySlug(productSlug);
    if (!product) {
      throw new Error('Product not found');
    }

    await this.productRepository.removeFromWishlist(userId, product.id);
    return true;
  }

  async getProductsStock(input: GetProductsUseCaseInput): Promise<GetProductsUseCaseOutput> {
    // Filter to only show products with stock information
    const modifiedInput = {
      ...input,
      // You can add additional filters for stock-specific queries here
    };
    
    return await this.getProductsUseCase.execute(modifiedInput);
  }

  async getProductsDraft(input: GetProductsUseCaseInput): Promise<GetProductsUseCaseOutput> {
    // Filter to only show draft products
    const modifiedInput = {
      ...input,
      status: 'draft',
    };
    
    return await this.getProductsUseCase.execute(modifiedInput);
  }
}