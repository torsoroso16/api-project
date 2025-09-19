import { Role } from '../../entities/role.entity';

export interface RoleRepositoryInterface {
  findById(id: number): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  create(role: Role): Promise<Role>;
}