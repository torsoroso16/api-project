import { Product } from '../../entities/product.entity';
import { ProductRepositoryInterface, ProductFilterOptions } from '../../interfaces/repositories/product.repository.interface';

export interface GetProductsUseCaseInput {
  text?: string;
  first?: number;
  page?: number;
  typeSlug?: string;
  shopId?: number;
  authorSlug?: string;
  manufacturerSlug?: string;
  categoryIds?: number[];
  tagIds?: number[];
  status?: string;
  productType?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  searchJoin?: 'and' | 'or';
  orderBy?: string;
  sortedBy?: 'ASC' | 'DESC';
  language?: string;
}

export interface GetProductsUseCaseOutput {
  products: Product[];
  total: number;
  currentPage: number;
  perPage: number;
}

export class GetProductsUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryInterface
  ) {}

  async execute(input: GetProductsUseCaseInput): Promise<GetProductsUseCaseOutput> {
    const {
      text,
      first = 15,
      page = 1,
      typeSlug,
      shopId,
      categoryIds,
      tagIds,
      status,
      productType,
      minPrice,
      maxPrice,
      search,
      searchJoin,
      orderBy,
      sortedBy,
      language,
    } = input;

    const filterOptions: ProductFilterOptions = {
      text,
      typeSlug,
      shopId,
      categoryIds,
      tagIds,
      status,
      productType,
      minPrice,
      maxPrice,
      search,
      searchJoin,
      orderBy,
      sortedBy,
      language,
      limit: first,
      offset: (page - 1) * first,
    };

    const [products, total] = await Promise.all([
      this.productRepository.findWithFilters(filterOptions),
      this.productRepository.countWithFilters(filterOptions),
    ]);

    return {
      products,
      total,
      currentPage: page,
      perPage: first,
    };
  }
}