import { Product, ProductStatus, ProductType } from '../../entities/product.entity';
import { ProductRepositoryInterface } from '../../interfaces/repositories/product.repository.interface';

export interface CreateProductUseCaseInput {
  name: string;
  description?: string;
  typeId?: number;
  shopId?: number;
  authorId?: number;
  manufacturerId?: number;
  productType?: ProductType;
  price?: number;
  salePrice?: number;
  sku?: string;
  quantity?: number;
  unit?: string;
  status?: ProductStatus;
  inStock?: boolean;
  isTaxable?: boolean;
  isDigital?: boolean;
  isExternal?: boolean;
  externalProductUrl?: string;
  externalProductButtonText?: string;
  height?: string;
  length?: string;
  width?: string;
  categoryIds?: number[];
  tagIds?: number[];
  language?: string;
  createdBy: number;
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryInterface
  ) {}

  async execute(input: CreateProductUseCaseInput): Promise<Product> {
    // Generate slug from name
    const slug = this.generateSlug(input.name);

    // Check if product with same slug exists
    const existingProduct = await this.productRepository.findBySlug(slug);
    if (existingProduct) {
      throw new Error('Product with this name already exists');
    }

    // Validate external product
    if (input.isExternal && !input.externalProductUrl) {
      throw new Error('External product URL is required for external products');
    }

    // Create product
    const product = Product.create({
      name: input.name,
      slug,
      description: input.description,
      typeId: input.typeId,
      shopId: input.shopId,
      authorId: input.authorId,
      manufacturerId: input.manufacturerId,
      productType: input.productType,
      price: input.price,
      salePrice: input.salePrice,
      sku: input.sku,
      quantity: input.quantity,
      unit: input.unit,
      status: input.status,
      inStock: input.inStock,
      isTaxable: input.isTaxable,
      isDigital: input.isDigital,
      isExternal: input.isExternal,
      externalProductUrl: input.externalProductUrl,
      externalProductButtonText: input.externalProductButtonText,
      height: input.height,
      length: input.length,
      width: input.width,
      categoryIds: input.categoryIds,
      tagIds: input.tagIds,
      language: input.language,
    });

    const savedProduct = await this.productRepository.create(product);

    // Assign categories and tags
    if (input.categoryIds?.length) {
      await this.productRepository.assignCategories(savedProduct.id, input.categoryIds);
    }

    if (input.tagIds?.length) {
      await this.productRepository.assignTags(savedProduct.id, input.tagIds);
    }

    return savedProduct;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}