import { Product, ProductStatus } from '../../entities/product.entity';
import { ProductRepositoryInterface } from '../../interfaces/repositories/product.repository.interface';

export interface UpdateProductUseCaseInput {
  id: number;
  name?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  quantity?: number;
  status?: ProductStatus;
  categoryIds?: number[];
  tagIds?: number[];
  updatedBy: number;
}

export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryInterface
  ) {}

  async execute(input: UpdateProductUseCaseInput): Promise<Product> {
    const product = await this.productRepository.findById(input.id);
    if (!product) {
      throw new Error('Product not found');
    }

    const updatedProduct = product.updateBasicInfo({
      name: input.name,
      description: input.description,
      price: input.price,
      salePrice: input.salePrice,
      quantity: input.quantity,
      status: input.status,
    });

    const savedProduct = await this.productRepository.update(input.id, updatedProduct);

    // Update categories and tags if provided
    if (input.categoryIds !== undefined) {
      await this.productRepository.assignCategories(input.id, input.categoryIds);
    }

    if (input.tagIds !== undefined) {
      await this.productRepository.assignTags(input.id, input.tagIds);
    }

    return savedProduct;
  }
}