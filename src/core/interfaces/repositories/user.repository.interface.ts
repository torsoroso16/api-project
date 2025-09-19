import { User } from '../../entities/user.entity';

export interface UserFilterOptions {
  search?: string;
  permission?: string;
  isActive?: boolean;
  orderBy?: Array<{
    column: string;
    order: 'ASC' | 'DESC';
  }>;
  limit?: number;
  offset?: number;
}

export interface UserCountOptions {
  search?: string;
  permission?: string;
  isActive?: boolean;
}

export interface UserRepositoryInterface {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailVerificationToken(token: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
  findWithFilters(options: UserFilterOptions): Promise<User[]>;
  countWithFilters(options: UserCountOptions): Promise<number>;
  assignRole(userId: number, roleName: string): Promise<User>;
  removeRole(userId: number, roleName: string): Promise<User>;
}