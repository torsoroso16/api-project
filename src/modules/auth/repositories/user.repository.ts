import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryInterface, UserFilterOptions, UserCountOptions } from '../../../core/interfaces/repositories/user.repository.interface';
import { User } from '../../../core/entities/user.entity';
import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity'; // asumsi role entity ada

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectRepository(UserEntity)
    private readonly ormRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>
  ) {}

  async findById(id: number): Promise<User | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
      relations: ['roles', 'profile']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.ormRepository.findOne({
      where: { email },
      relations: ['roles']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    const entity = await this.ormRepository.findOne({
      where: { emailVerificationToken: token }
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(user: User): Promise<User> {
    const entity = this.toEntity(user);
    const savedEntity = await this.ormRepository.save(entity);
    return this.toDomain(savedEntity as UserEntity);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    await this.ormRepository.update(id, {
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      isEmailVerified: data.isEmailVerified,
      emailVerificationToken: data.emailVerificationToken,
      isActive: data.isActive,
    });
    
    const updatedEntity = await this.ormRepository.findOne({
      where: { id },
      relations: ['roles', 'profile']
    });
    
    if (!updatedEntity) {
      throw new Error('User not found after update');
    }
    
    return this.toDomain(updatedEntity);
  }

  async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }

  // === Implementasi tambahan sesuai interface ===

  async findWithFilters(options: UserFilterOptions): Promise<User[]> {
    const qb = this.ormRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.profile', 'profile');

    if (options.search) {
      qb.andWhere('(user.email LIKE :search OR user.name LIKE :search)', {
        search: `%${options.search}%`,
      });
    }

    if (options.permission) {
      qb.andWhere('role.name = :permission', { permission: options.permission });
    }

    if (options.isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive: options.isActive });
    }

    if (options.orderBy) {
      for (const order of options.orderBy) {
        qb.addOrderBy(`user.${order.column}`, order.order);
      }
    }

    if (options.limit) {
      qb.take(options.limit);
    }
    if (options.offset) {
      qb.skip(options.offset);
    }

    const entities = await qb.getMany();
    return entities.map((e) => this.toDomain(e));
  }

  async countWithFilters(options: UserCountOptions): Promise<number> {
    const qb = this.ormRepository.createQueryBuilder('user')
      .leftJoin('user.roles', 'role');

    if (options.search) {
      qb.andWhere('(user.email LIKE :search OR user.name LIKE :search)', {
        search: `%${options.search}%`,
      });
    }

    if (options.permission) {
      qb.andWhere('role.name = :permission', { permission: options.permission });
    }

    if (options.isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive: options.isActive });
    }

    return qb.getCount();
  }

  async assignRole(userId: number, roleName: string): Promise<User> {
    const user = await this.ormRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new Error('User not found');

    const role = await this.roleRepository.findOne({ where: { name: roleName } });
    if (!role) throw new Error('Role not found');

    if (!user.roles.find(r => r.name === role.name)) {
      user.roles.push(role);
    }

    const saved = await this.ormRepository.save(user);
    return this.toDomain(saved);
  }

  async removeRole(userId: number, roleName: string): Promise<User> {
    const user = await this.ormRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new Error('User not found');

    user.roles = user.roles.filter(role => role.name !== roleName);

    const saved = await this.ormRepository.save(user);
    return this.toDomain(saved);
  }

  // === Mapper ===

  private toDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.email,
      entity.name,
      entity.passwordHash,
      entity.isEmailVerified,
      entity.isActive,
      entity.emailVerificationToken,
      entity.createdAt,
      entity.updatedAt
    );
  }

  private toEntity(user: User): Partial<UserEntity> {
    return {
      id: user.id || undefined,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      isEmailVerified: user.isEmailVerified,
      emailVerificationToken: user.emailVerificationToken,
      isActive: user.isActive,
    };
  }
}