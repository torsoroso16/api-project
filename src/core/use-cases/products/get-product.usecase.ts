import { Product } from '../../entities/product.entity';
import { ProductRepositoryInterface } from '../../interfaces/repositories/product.repository.interface';

export interface GetProductUseCaseInput {
  id?: number;
  slug?: string;
  language?: string;
}

export class GetProductUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryInterface
  ) {}

  async execute(input: GetProductUseCaseInput): Promise<Product> {
    let product: Product | null = null;

    if (input.id) {
      product = await this.productRepository.findById(input.id);
    } else if (input.slug) {
      product = await this.productRepository.findBySlug(input.slug);
    }

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }
}