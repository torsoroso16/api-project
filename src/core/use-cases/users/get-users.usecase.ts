import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { User } from '../../entities/user.entity';

export interface GetUsersUseCaseInput {
  text?: string;
  first?: number;
  page?: number;
  permission?: string;
  isActive?: boolean;
  orderBy?: Array<{
    column: string;
    order: 'ASC' | 'DESC';
  }>;
}

export interface GetUsersUseCaseOutput {
  users: User[];
  total: number;
  currentPage: number;
  perPage: number;
}

export class GetUsersUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface
  ) {}

  async execute(input: GetUsersUseCaseInput): Promise<GetUsersUseCaseOutput> {
    const {
      text,
      first = 15,
      page = 1,
      permission,
      isActive,
      orderBy
    } = input;

    const users = await this.userRepository.findWithFilters({
      search: text,
      permission,
      isActive,
      orderBy,
      limit: first,
      offset: (page - 1) * first
    });

    const total = await this.userRepository.countWithFilters({
      search: text,
      permission,
      isActive
    });

    return {
      users,
      total,
      currentPage: page,
      perPage: first
    };
  }
}