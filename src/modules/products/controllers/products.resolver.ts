import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
  ID,
  Int,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductGraphQL } from '../dto/product.type';
import { CreateProductInput } from '../dto/create-product.input';
import { UpdateProductInput } from '../dto/update-product.input';
import { GetProductsArgs } from '../dto/get-products.args';
import { GetProductArgs } from '../dto/get-product.args';
import { CreateWishlistInput } from '../dto/wishlist.input';
import { ProductPaginator } from '../dto/product-paginator.type';
import { CategoryWiseProductCount, CategoryWiseProductSale, TopRatedProduct } from '../dto/analytics.types';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Public } from '../../../shared/decorators/public.decorator';
import { Product } from '../../../core/entities/product.entity';
import { paginate } from '../../../common/pagination/paginate';

interface AuthenticatedUser {
  id: number;
  email: string;
  roles: Array<{ name: string }>;
}

@Resolver(() => ProductGraphQL)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Mutation(() => ProductGraphQL)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'store_owner', 'staff')
  async createProduct(
    @Args('input') createProductInput: CreateProductInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProductGraphQL> {
    const product = await this.productsService.createProduct({
      ...createProductInput,
      createdBy: user.id,
    });

    return this.mapToGraphQLType(product);
  }

  @Query(() => ProductPaginator, { name: 'products' })
  @Public()
  async getProducts(@Args() args: GetProductsArgs): Promise<ProductPaginator> {
    const result = await this.productsService.getProducts({
      text: args.text,
      first: args.first,
      page: args.page,
      typeSlug: args.typeSlug,
      shopId: args.shopId,
      categoryIds: args.categoryIds,
      tagIds: args.tagIds,
      status: args.status,
      productType: args.productType,
      minPrice: args.minPrice,
      maxPrice: args.maxPrice,
      search: args.search,
      searchJoin: args.searchJoin as 'and' | 'or',
      orderBy: args.orderBy,
      sortedBy: args.sortedBy,
      language: args.language,
    });

    return {
      data: result.products.map(product => this.mapToGraphQLType(product)),
      paginatorInfo: paginate(
        result.total,
        result.currentPage,
        result.perPage,
        result.products.length,
      ),
    };
  }

  @Query(() => ProductGraphQL, { name: 'product' })
  @Public()
  async getProduct(@Args() args: GetProductArgs): Promise<ProductGraphQL> {
    const product = await this.productsService.getProduct({
      id: args.id,
      slug: args.slug,
      language: args.language,
    });

    return this.mapToGraphQLType(product);
  }

  @Query(() => [ProductGraphQL], { name: 'bestSellingProducts' })
  @Public()
  async bestSellingProducts(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('shopId', { type: () => ID, nullable: true }) shopId?: number,
    @Args('typeId', { type: () => ID, nullable: true }) typeId?: number,
    @Args('typeSlug', { nullable: true }) typeSlug?: string,
    @Args('range', { type: () => Int, nullable: true }) range?: number,
  ): Promise<ProductGraphQL[]> {
    const products = await this.productsService.getBestSellingProducts({
      limit,
      shopId,
      typeId,
      typeSlug,
      range,
    });

    return products.map(product => this.mapToGraphQLType(product));
  }

  @Query(() => [ProductGraphQL], { name: 'popularProducts' })
  @Public()
  async getPopularProducts(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('shopId', { type: () => ID, nullable: true }) shopId?: number,
    @Args('typeId', { type: () => ID, nullable: true }) typeId?: number,
    @Args('typeSlug', { nullable: true }) typeSlug?: string,
    @Args('range', { type: () => Int, nullable: true }) range?: number,
  ): Promise<ProductGraphQL[]> {
    const products = await this.productsService.getPopularProducts({
      limit,
      shopId,
      typeId,
      typeSlug,
      range,
    });

    return products.map(product => this.mapToGraphQLType(product));
  }

  @Query(() => [ProductGraphQL], { name: 'lowStockProducts' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'store_owner', 'staff')
  async getLowStockProducts(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('threshold', { type: () => Int, nullable: true }) threshold?: number,
    @Args('shopId', { type: () => ID, nullable: true }) shopId?: number,
    @Args('typeId', { type: () => ID, nullable: true }) typeId?: number,
  ): Promise<ProductGraphQL[]> {
    const products = await this.productsService.getLowStockProducts({
      limit,
      threshold,
      shopId,
      typeId,
    });

    return products.map(product => this.mapToGraphQLType(product));
  }

  @Query(() => [TopRatedProduct], { name: 'topRatedProducts' })
  @Public()
  async getTopRatedProducts(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<TopRatedProduct[]> {
    return await this.productsService.getTopRatedProducts(limit);
  }

  @Query(() => [CategoryWiseProductCount], { name: 'categoryWiseProduct' })
  @Public()
  async categoryWiseProduct(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<CategoryWiseProductCount[]> {
    return await this.productsService.getCategoryWiseProductCount(limit);
  }

  @Query(() => [CategoryWiseProductSale], { name: 'categoryWiseProductSale' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'store_owner')
  async categoryWiseProductSale(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<CategoryWiseProductSale[]> {
    return await this.productsService.getCategoryWiseProductSales(limit);
  }

  @Mutation(() => ProductGraphQL)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'store_owner', 'staff')
  async updateProduct(
    @Args('input') updateProductInput: UpdateProductInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProductGraphQL> {
    const product = await this.productsService.updateProduct({
      ...updateProductInput,
      updatedBy: user.id,
    });

    return this.mapToGraphQLType(product);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'store_owner')
  async deleteProduct(
    @Args('id', { type: () => ID }) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    return await this.productsService.deleteProduct({
      id,
      deletedBy: user.id,
    });
  }

  @Query(() => ProductPaginator, { name: 'wishlists' })
  @UseGuards(JwtAuthGuard)
  async getWishlists(
    @Args('first', { type: () => Int, defaultValue: 15 }) first: number,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProductPaginator> {
    const result = await this.productsService.getWishlistProducts(user.id, {
      first,
      page,
    });

    return {
      data: result.products.map(product => this.mapToGraphQLType(product)),
      paginatorInfo: paginate(
        result.total,
        result.currentPage,
        result.perPage,
        result.products.length,
      ),
    };
  }

  @Query(() => Boolean, { name: 'inWishlist' })
  @UseGuards(JwtAuthGuard)
  async inWishlist(
    @Args('productId', { type: () => ID }) productId: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    return await this.productsService.isInWishlist(user.id, productId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async toggleWishlist(
    @Args('input') createWishlistInput: CreateWishlistInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    return await this.productsService.toggleWishlist({
      userId: user.id,
      productId: createWishlistInput.productId,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteWishlist(
    @Args('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    return await this.productsService.deleteWishlist(user.id, slug);
  }

  @Query(() => ProductPaginator, { name: 'productsStock' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'store_owner', 'staff')
  async getProductsStock(@Args() args: GetProductsArgs): Promise<ProductPaginator> {
    const result = await this.productsService.getProductsStock({
      text: args.text,
      first: args.first,
      page: args.page,
      typeSlug: args.typeSlug,
      shopId: args.shopId,
      categoryIds: args.categoryIds,
      tagIds: args.tagIds,
      status: args.status,
      productType: args.productType,
      minPrice: args.minPrice,
      maxPrice: args.maxPrice,
      search: args.search,
      searchJoin: args.searchJoin as 'and' | 'or',
      orderBy: args.orderBy,
      sortedBy: args.sortedBy,
      language: args.language,
    });

    return {
      data: result.products.map(product => this.mapToGraphQLType(product)),
      paginatorInfo: paginate(
        result.total,
        result.currentPage,
        result.perPage,
        result.products.length,
      ),
    };
  }

  @Query(() => ProductPaginator, { name: 'productsDraft' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'store_owner', 'staff')
  async getProductsDraft(@Args() args: GetProductsArgs): Promise<ProductPaginator> {
    const result = await this.productsService.getProductsDraft({
      text: args.text,
      first: args.first,
      page: args.page,
      typeSlug: args.typeSlug,
      shopId: args.shopId,
      categoryIds: args.categoryIds,
      tagIds: args.tagIds,
      status: 'draft',
      productType: args.productType,
      minPrice: args.minPrice,
      maxPrice: args.maxPrice,
      search: args.search,
      searchJoin: args.searchJoin as 'and' | 'or',
      orderBy: args.orderBy,
      sortedBy: args.sortedBy,
      language: args.language,
    });

    return {
      data: result.products.map(product => this.mapToGraphQLType(product)),
      paginatorInfo: paginate(
        result.total,
        result.currentPage,
        result.perPage,
        result.products.length,
      ),
    };
  }

  @ResolveField(() => [ProductGraphQL])
  async relatedProducts(
    @Parent() product: ProductGraphQL,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<ProductGraphQL[]> {
    // This would need typeSlug from the type relation
    // For now, we'll use a placeholder
    const typeSlug = 'placeholder'; // This should come from product.type.slug
    
    const relatedProducts = await this.productsService.getRelatedProducts(
      typeSlug,
      product.id,
      limit || 10,
    );

    return relatedProducts.map(p => this.mapToGraphQLType(p));
  }

  @ResolveField(() => Boolean)
  async inWishlistField(
    @Parent() product: ProductGraphQL,
    @Context() context: any,
  ): Promise<boolean> {
    const user = context.req?.user;
    if (!user) {
      return false;
    }

    return await this.productsService.isInWishlist(user.id, product.id);
  }

  private mapToGraphQLType(product: Product): ProductGraphQL {
    const graphqlProduct = new ProductGraphQL();
    
    graphqlProduct.id = product.id;
    graphqlProduct.name = product.name;
    graphqlProduct.slug = product.slug;
    graphqlProduct.description = product.description;
    graphqlProduct.typeId = product.typeId;
    graphqlProduct.shopId = product.shopId;
    graphqlProduct.authorId = product.authorId;
    graphqlProduct.manufacturerId = product.manufacturerId;
    graphqlProduct.productType = product.productType;
    graphqlProduct.price = product.price;
    graphqlProduct.salePrice = product.salePrice;
    graphqlProduct.maxPrice = product.maxPrice;
    graphqlProduct.minPrice = product.minPrice;
    graphqlProduct.sku = product.sku;
    graphqlProduct.quantity = product.quantity;
    graphqlProduct.soldQuantity = product.soldQuantity;
    graphqlProduct.unit = product.unit;
    graphqlProduct.status = product.status;
    graphqlProduct.inStock = product.inStock;
    graphqlProduct.isTaxable = product.isTaxable;
    graphqlProduct.isDigital = product.isDigital;
    graphqlProduct.isExternal = product.isExternal;
    graphqlProduct.externalProductUrl = product.externalProductUrl;
    graphqlProduct.externalProductButtonText = product.externalProductButtonText;
    graphqlProduct.height = product.height;
    graphqlProduct.length = product.length;
    graphqlProduct.width = product.width;
    graphqlProduct.image = product.image;
    graphqlProduct.gallery = product.gallery;
    graphqlProduct.videos = product.videos;
    graphqlProduct.ratings = product.ratings;
    graphqlProduct.inWishlist = product.inWishlist;
    graphqlProduct.inFlashSale = product.inFlashSale;
    graphqlProduct.language = product.language;
    graphqlProduct.translatedLanguages = product.translatedLanguages;
    graphqlProduct.createdAt = product.createdAt;
    graphqlProduct.updatedAt = product.updatedAt;

    return graphqlProduct;
  }
}