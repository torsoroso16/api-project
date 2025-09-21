import { Product } from '../../entities/product.entity';

export interface ProductFilterOptions {
  text?: string;
  typeId?: number;
  typeSlug?: string;
  shopId?: number;
  authorId?: number;
  manufacturerId?: number;
  categoryIds?: number[];
  tagIds?: number[];
  status?: string;
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isDigital?: boolean;
  isExternal?: boolean;
  language?: string;
  search?: string;
  searchJoin?: 'and' | 'or';
  flashSaleBuilder?: boolean;
  orderBy?: string;
  sortedBy?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface ProductCountOptions {
  text?: string;
  typeId?: number;
  shopId?: number;
  authorId?: number;
  manufacturerId?: number;
  categoryIds?: number[];
  tagIds?: number[];
  status?: string;
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isDigital?: boolean;
  isExternal?: boolean;
  language?: string;
  flashSaleBuilder?: boolean;
}

export interface BestSellingProductOptions {
  limit?: number;
  shopId?: number;
  typeId?: number;
  typeSlug?: string;
  range?: number; // days
}

export interface PopularProductOptions {
  limit?: number;
  shopId?: number;
  typeId?: number;
  typeSlug?: string;
  range?: number; // days
}

export interface CategoryWiseProductCount {
  categoryId: number;
  categoryName: string;
  shopName?: string;
  productCount: number;
}

export interface CategoryWiseProductSale {
  categoryId: number;
  categoryName: string;
  shopName?: string;
  totalSales: number;
}

export interface TopRatedProductResult {
  id: number;
  name: string;
  slug: string;
  typeId: number;
  typeSlug?: string;
  regularPrice?: number;
  salePrice?: number;
  minPrice?: number;
  maxPrice?: number;
  productType?: string;
  description?: string;
  totalRating?: number;
  ratingCount?: number;
  actualRating?: number;
  imageUrl?: string;
}

export interface ProductRepositoryInterface {
  // Basic CRUD
  findById(id: number): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findByIds(ids: number[]): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  update(id: number, data: Partial<Product>): Promise<Product>;
  delete(id: number): Promise<void>;

  // Filtering and searching
  findWithFilters(options: ProductFilterOptions): Promise<Product[]>;
  countWithFilters(options: ProductCountOptions): Promise<number>;

  // Special queries
  findBestSellingProducts(options: BestSellingProductOptions): Promise<Product[]>;
  findPopularProducts(options: PopularProductOptions): Promise<Product[]>;
  findRelatedProducts(typeSlug: string, excludeId?: number, limit?: number): Promise<Product[]>;
  findLowStockProducts(threshold?: number, shopId?: number, limit?: number): Promise<Product[]>;
  findTopRatedProducts(limit?: number): Promise<TopRatedProductResult[]>;

  // Analytics
  getCategoryWiseProductCount(limit?: number): Promise<CategoryWiseProductCount[]>;
  getCategoryWiseProductSales(limit?: number): Promise<CategoryWiseProductSale[]>;

  // Stock management
  updateStock(id: number, quantity: number): Promise<void>;
  incrementSoldQuantity(id: number, amount: number): Promise<void>;

  // Wishlist
  addToWishlist(userId: number, productId: number): Promise<void>;
  removeFromWishlist(userId: number, productId: number): Promise<void>;
  isInWishlist(userId: number, productId: number): Promise<boolean>;
  findWishlistProducts(userId: number, limit?: number, offset?: number): Promise<Product[]>;
  countWishlistProducts(userId: number): Promise<number>;

  // Category and tag associations
  assignCategories(productId: number, categoryIds: number[]): Promise<void>;
  assignTags(productId: number, tagIds: number[]): Promise<void>;
  removeCategories(productId: number, categoryIds: number[]): Promise<void>;
  removeTags(productId: number, tagIds: number[]): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');