import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../../../core/entities/product.entity';
import {
    ProductRepositoryInterface,
    ProductFilterOptions,
    ProductCountOptions,
    BestSellingProductOptions,
    PopularProductOptions,
    CategoryWiseProductCount,
    CategoryWiseProductSale,
    TopRatedProductResult,
} from '../../../core/interfaces/repositories/product.repository.interface';
import { ProductEntity } from '../entities/product.entity';
import { WishlistEntity } from '../entities/wishlist.entity';
import { ProductCategoryEntity } from '../entities/product-category.entity';
import { ProductTagEntity } from '../entities/product-tag.entity';

@Injectable()
export class ProductRepository implements ProductRepositoryInterface {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        @InjectRepository(WishlistEntity)
        private readonly wishlistRepository: Repository<WishlistEntity>,
        @InjectRepository(ProductCategoryEntity)
        private readonly productCategoryRepository: Repository<ProductCategoryEntity>,
        @InjectRepository(ProductTagEntity)
        private readonly productTagRepository: Repository<ProductTagEntity>,
    ) { }

    async findById(id: number): Promise<Product | null> {
        const entity = await this.productRepository.findOne({
            where: { id },
            relations: ['productCategories', 'productTags'],
        });
        return entity ? this.toDomainEntity(entity) : null;
    }

    async findBySlug(slug: string): Promise<Product | null> {
        const entity = await this.productRepository.findOne({
            where: { slug },
            relations: ['productCategories', 'productTags'],
        });
        return entity ? this.toDomainEntity(entity) : null;
    }

    async findByIds(ids: number[]): Promise<Product[]> {
        if (!ids || ids.length === 0) {
            return [];
        }

        const entities = await this.productRepository.findBy({
            id: In(ids),
        });

        return entities.map(entity => this.toDomainEntity(entity));
    }

    async create(product: Product): Promise<Product> {
        const entity = this.toEntity(product);
        const savedEntity = await this.productRepository.save(entity);
        return this.toDomainEntity(savedEntity);
    }

    async update(id: number, data: Partial<Product>): Promise<Product> {
        const entity = this.toEntity(data as Product);
        await this.productRepository.update(id, entity);
        const updatedEntity = await this.productRepository.findOne({
            where: { id },
            relations: ['productCategories', 'productTags'],
        });
        if (!updatedEntity) {
            throw new Error('Product not found after update');
        }
        return this.toDomainEntity(updatedEntity);
    }

    async delete(id: number): Promise<void> {
        await this.productRepository.delete(id);
    }

    // Continue with other methods...
    // (The rest of the methods remain the same but use the synchronous toDomainEntity)

    private toDomainEntity(entity: ProductEntity): Product {
        // Get category and tag IDs from loaded relations
        let categoryIds: number[] = [];
        let tagIds: number[] = [];

        if (entity.productCategories) {
            categoryIds = entity.productCategories.map(pc => pc.categoryId);
        }

        if (entity.productTags) {
            tagIds = entity.productTags.map(pt => pt.tagId);
        }

        return new Product(
            entity.id,
            entity.name,
            entity.slug,
            entity.description,
            entity.typeId,
            entity.shopId,
            entity.authorId,
            entity.manufacturerId,
            entity.productType,
            entity.price ? parseFloat(entity.price.toString()) : undefined,
            entity.salePrice ? parseFloat(entity.salePrice.toString()) : undefined,
            entity.maxPrice ? parseFloat(entity.maxPrice.toString()) : undefined,
            entity.minPrice ? parseFloat(entity.minPrice.toString()) : undefined,
            entity.sku,
            entity.quantity,
            entity.soldQuantity,
            entity.unit,
            entity.status,
            entity.inStock,
            entity.isTaxable,
            entity.isDigital,
            entity.isExternal,
            entity.externalProductUrl,
            entity.externalProductButtonText,
            entity.height,
            entity.length,
            entity.width,
            entity.image,
            entity.gallery,
            entity.videos,
            [], // variations - would be loaded separately if needed
            categoryIds,
            tagIds,
            entity.ratings ? parseFloat(entity.ratings.toString()) : undefined,
            false, // inWishlist - would be determined based on user context
            entity.inFlashSale,
            entity.language,
            entity.translatedLanguages,
            entity.createdAt,
            entity.updatedAt
        );
    }

    private toEntity(product: Product): Partial<ProductEntity> {
        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            typeId: product.typeId,
            shopId: product.shopId,
            authorId: product.authorId,
            manufacturerId: product.manufacturerId,
            productType: product.productType,
            price: product.price,
            salePrice: product.salePrice,
            maxPrice: product.maxPrice,
            minPrice: product.minPrice,
            sku: product.sku,
            quantity: product.quantity,
            soldQuantity: product.soldQuantity,
            unit: product.unit,
            status: product.status,
            inStock: product.inStock,
            isTaxable: product.isTaxable,
            isDigital: product.isDigital,
            isExternal: product.isExternal,
            externalProductUrl: product.externalProductUrl,
            externalProductButtonText: product.externalProductButtonText,
            height: product.height,
            length: product.length,
            width: product.width,
            image: product.image,
            gallery: product.gallery,
            videos: product.videos,
            ratings: product.ratings,
            inFlashSale: product.inFlashSale,
            language: product.language,
            translatedLanguages: product.translatedLanguages,
        };
    }

    // Add remaining methods with proper implementations...
    async findWithFilters(options: ProductFilterOptions): Promise<Product[]> {
        const entities = await this.productRepository.find({
            take: options.limit,
            skip: options.offset,
            relations: ['productCategories', 'productTags'],
        });
        return entities.map(entity => this.toDomainEntity(entity));
    }

    async countWithFilters(options: ProductCountOptions): Promise<number> {
        return await this.productRepository.count();
    }

    // ... implement other required methods
    async findBestSellingProducts(options: BestSellingProductOptions): Promise<Product[]> {
        const entities = await this.productRepository.find({
            order: { soldQuantity: 'DESC' },
            take: options.limit,
        });
        return entities.map(entity => this.toDomainEntity(entity));
    }

    async findPopularProducts(options: PopularProductOptions): Promise<Product[]> {
        const entities = await this.productRepository.find({
            where: { ratings: {} as any }, // Not null
            order: { ratings: 'DESC' },
            take: options.limit,
        });
        return entities.map(entity => this.toDomainEntity(entity));
    }

    async findRelatedProducts(typeSlug: string, excludeId?: number, limit?: number): Promise<Product[]> {
        const queryBuilder = this.productRepository.createQueryBuilder('product')
            .where('product.status = :status', { status: 'publish' });

        if (excludeId) {
            queryBuilder.andWhere('product.id != :excludeId', { excludeId });
        }

        if (limit) {
            queryBuilder.limit(limit);
        }

        const entities = await queryBuilder.getMany();
        return entities.map(entity => this.toDomainEntity(entity));
    }

    async findLowStockProducts(threshold?: number, shopId?: number, limit?: number): Promise<Product[]> {
        const queryBuilder = this.productRepository.createQueryBuilder('product')
            .where('product.quantity <= :threshold', { threshold: threshold || 10 });

        if (shopId) {
            queryBuilder.andWhere('product.shopId = :shopId', { shopId });
        }

        if (limit) {
            queryBuilder.limit(limit);
        }

        const entities = await queryBuilder.getMany();
        return entities.map(entity => this.toDomainEntity(entity));
    }

    async findTopRatedProducts(limit?: number): Promise<TopRatedProductResult[]> {
        const entities = await this.productRepository.find({
            where: { ratings: {} as any }, // Not null
            order: { ratings: 'DESC' },
            take: limit,
        });

        return entities.map(entity => ({
            id: entity.id,
            name: entity.name,
            slug: entity.slug,
            typeId: entity.typeId || 0,
            regularPrice: entity.price,
            salePrice: entity.salePrice,
            actualRating: entity.ratings,
            imageUrl: entity.image?.original,
        }));
    }

    async getCategoryWiseProductCount(limit?: number): Promise<CategoryWiseProductCount[]> {
        // Implement when category entity is available
        return [];
    }

    async getCategoryWiseProductSales(limit?: number): Promise<CategoryWiseProductSale[]> {
        // Implement when order entity is available
        return [];
    }

    async updateStock(id: number, quantity: number): Promise<void> {
        await this.productRepository.update(id, { quantity });
    }

    async incrementSoldQuantity(id: number, amount: number): Promise<void> {
        await this.productRepository.increment({ id }, 'soldQuantity', amount);
    }

    async addToWishlist(userId: number, productId: number): Promise<void> {
        const wishlist = this.wishlistRepository.create({ userId, productId });
        await this.wishlistRepository.save(wishlist);
    }

    async removeFromWishlist(userId: number, productId: number): Promise<void> {
        await this.wishlistRepository.delete({ userId, productId });
    }

    async isInWishlist(userId: number, productId: number): Promise<boolean> {
        const count = await this.wishlistRepository.count({
            where: { userId, productId },
        });
        return count > 0;
    }

    async findWishlistProducts(userId: number, limit?: number, offset?: number): Promise<Product[]> {
        const wishlists = await this.wishlistRepository.find({
            where: { userId },
            relations: ['product'],
            take: limit,
            skip: offset,
            order: { createdAt: 'DESC' },
        });
        return wishlists.map(w => this.toDomainEntity(w.product));
    }

    async countWishlistProducts(userId: number): Promise<number> {
        return await this.wishlistRepository.count({ where: { userId } });
    }

    async assignCategories(productId: number, categoryIds: number[]): Promise<void> {
        await this.productCategoryRepository.delete({ productId });
        if (categoryIds.length > 0) {
            const entities = categoryIds.map(categoryId =>
                this.productCategoryRepository.create({ productId, categoryId })
            );
            await this.productCategoryRepository.save(entities);
        }
    }

    async assignTags(productId: number, tagIds: number[]): Promise<void> {
        await this.productTagRepository.delete({ productId });
        if (tagIds.length > 0) {
            const entities = tagIds.map(tagId =>
                this.productTagRepository.create({ productId, tagId })
            );
            await this.productTagRepository.save(entities);
        }
    }

    async removeCategories(productId: number, categoryIds: number[]): Promise<void> {
        await this.productCategoryRepository
            .createQueryBuilder()
            .delete()
            .where('productId = :productId', { productId })
            .andWhere('categoryId IN (:...categoryIds)', { categoryIds })
            .execute();
    }

    async removeTags(productId: number, tagIds: number[]): Promise<void> {
        await this.productTagRepository
            .createQueryBuilder()
            .delete()
            .where('productId = :productId', { productId })
            .andWhere('tagId IN (:...tagIds)', { tagIds })
            .execute();
    }
}