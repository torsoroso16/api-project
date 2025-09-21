import { ProductRepositoryInterface } from '../../interfaces/repositories/product.repository.interface';

export interface DeleteProductUseCaseInput {
  id: number;
  deletedBy: number;
}

export class DeleteProductUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryInterface
  ) {}

  async execute(input: DeleteProductUseCaseInput): Promise<boolean> {
    const product = await this.productRepository.findById(input.id);
    if (!product) {
      throw new Error('Product not found');
    }

    await this.productRepository.delete(input.id);
    return true;
  }
}