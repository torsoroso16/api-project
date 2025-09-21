import { ProductRepositoryInterface } from '../../interfaces/repositories/product.repository.interface';

export interface ToggleWishlistUseCaseInput {
  userId: number;
  productId: number;
}

export class ToggleWishlistUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryInterface
  ) {}

  async execute(input: ToggleWishlistUseCaseInput): Promise<boolean> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const isInWishlist = await this.productRepository.isInWishlist(input.userId, input.productId);

    if (isInWishlist) {
      await this.productRepository.removeFromWishlist(input.userId, input.productId);
      return false;
    } else {
      await this.productRepository.addToWishlist(input.userId, input.productId);
      return true;
    }
  }
}