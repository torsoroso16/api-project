import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleRepositoryInterface } from '../../../core/interfaces/repositories/role.repository.interface';
import { Role } from '../../../core/entities/role.entity';
import { RoleEntity } from '../entities/role.entity';

@Injectable()
export class RoleRepository implements RoleRepositoryInterface {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly ormRepository: Repository<RoleEntity>
  ) {}

  async findById(id: number): Promise<Role | null> {
    const entity = await this.ormRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const entity = await this.ormRepository.findOne({ where: { name } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Role[]> {
    const entities = await this.ormRepository.find();
    return entities.map(entity => this.toDomain(entity));
  }

  async create(role: Role): Promise<Role> {
    const entity = this.toEntity(role);
    const savedEntity = await this.ormRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  private toDomain(entity: RoleEntity): Role {
    return new Role(
      entity.id,
      entity.name,
      entity.description,
      entity.createdAt,
      entity.updatedAt
    );
  }

  private toEntity(role: Role): Partial<RoleEntity> {
    return {
      id: role.id || undefined,
      name: role.name,
      description: role.description,
    };
  }
}