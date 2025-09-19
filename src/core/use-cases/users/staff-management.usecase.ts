import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { User } from '../../entities/user.entity';

export interface GetStaffUseCaseInput {
  search?: string;
  first?: number;
  page?: number;
  orderBy?: string;
  sortedBy?: string;
}

export interface GetStaffUseCaseOutput {
  users: User[];
  total: number;
  currentPage: number;
  perPage: number;
}

export class StaffManagementUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface
  ) {}

  async getStaff(input: GetStaffUseCaseInput): Promise<GetStaffUseCaseOutput> {
    const {
      search,
      first = 15,
      page = 1,
      orderBy,
      sortedBy
    } = input;

    const orderConfig = orderBy && sortedBy ? [{
      column: orderBy,
      order: sortedBy.toUpperCase() as 'ASC' | 'DESC'
    }] : undefined;

    const users = await this.userRepository.findWithFilters({
      search,
      permission: 'staff',
      orderBy: orderConfig,
      limit: first,
      offset: (page - 1) * first
    });

    const total = await this.userRepository.countWithFilters({
      search,
      permission: 'staff'
    });

    return {
      users,
      total,
      currentPage: page,
      perPage: first
    };
  }
}