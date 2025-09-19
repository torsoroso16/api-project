import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UserRepositoryInterface, UserFilterOptions, UserCountOptions } from '../../../core/interfaces/repositories/user.repository.interface';
import { User } from '../../../core/entities/user.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectRepository(UserEntity)
    private readonly ormRepository: Repository<UserEntity>
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
      relations: ['roles', 'profile']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    const entity = await this.ormRepository.findOne({
      where: { emailVerificationToken: token },
      relations: ['roles', 'profile']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(user: User): Promise<User> {
    const entity = this.toEntity(user);
    const savedEntity = await this.ormRepository.save(entity);
    return this.toDomain(savedEntity);
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

  async findWithFilters(options: UserFilterOptions): Promise<User[]> {
    const queryBuilder = this.buildFilterQuery(options);
    
    if (options.limit) {
      queryBuilder.limit(options.limit);
    }
    
    if (options.offset) {
      queryBuilder.offset(options.offset);
    }

    const entities = await queryBuilder.getMany();
    return entities.map(entity => this.toDomain(entity));
  }

  async countWithFilters(options: UserCountOptions): Promise<number> {
    const queryBuilder = this.buildFilterQuery(options);
    return await queryBuilder.getCount();
  }

  async assignRole(userId: number, roleName: string): Promise<User> {
    const user = await this.ormRepository.findOne({
      where: { id: userId },
      relations: ['roles']
    });

    if (!user) {
      throw new Error('User not found');
    }

    // This would need to be implemented with proper role assignment
    // For now, we'll simulate it
    const updatedUser = await this.ormRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'profile']
    });

    return this.toDomain(updatedUser!);
  }

  async removeRole(userId: number, roleName: string): Promise<User> {
    const user = await this.ormRepository.findOne({
      where: { id: userId },
      relations: ['roles']
    });

    if (!user) {
      throw new Error('User not found');
    }

    // This would need to be implemented with proper role removal
    // For now, we'll simulate it
    const updatedUser = await this.ormRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'profile']
    });

    return this.toDomain(updatedUser!);
  }

  private buildFilterQuery(options: UserFilterOptions | UserCountOptions): SelectQueryBuilder<UserEntity> {
    let queryBuilder = this.ormRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.profile', 'profile');

    if (options.search) {
      queryBuilder = queryBuilder.where(
        'user.name ILIKE :search OR user.email ILIKE :search',
        { search: `%${options.search}%` }
      );
    }

    if (options.permission) {
      queryBuilder = queryBuilder.andWhere('roles.name = :permission', { permission: options.permission });
    }

    if (options.isActive !== undefined) {
      queryBuilder = queryBuilder.andWhere('user.isActive = :isActive', { isActive: options.isActive });
    }

    // Handle ordering if it's a filter query with order options
    if ('orderBy' in options && options.orderBy && options.orderBy.length > 0) {
      options.orderBy.forEach((order, index) => {
        const column = this.mapOrderColumn(order.column);
        if (index === 0) {
          queryBuilder = queryBuilder.orderBy(column, order.order);
        } else {
          queryBuilder = queryBuilder.addOrderBy(column, order.order);
        }
      });
    } else {
      queryBuilder = queryBuilder.orderBy('user.createdAt', 'DESC');
    }

    return queryBuilder;
  }

  private mapOrderColumn(column: string): string {
    const columnMap = {
      'CREATED_AT': 'user.createdAt',
      'NAME': 'user.name',
      'UPDATED_AT': 'user.updatedAt',
      'IS_ACTIVE': 'user.isActive',
      'EMAIL': 'user.email',
    };
    
    return columnMap[column] || 'user.createdAt';
  }

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