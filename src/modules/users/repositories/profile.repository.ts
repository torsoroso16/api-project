import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileRepositoryInterface } from '../../../core/interfaces/repositories/profile.repository.interface';
import { Profile } from '../../../core/entities/profile.entity';
import { ProfileEntity } from '../entities/profile.entity';

@Injectable()
export class ProfileRepository implements ProfileRepositoryInterface {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly ormRepository: Repository<ProfileEntity>
  ) {}

  async findById(id: number): Promise<Profile | null> {
    const entity = await this.ormRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserId(userId: number): Promise<Profile | null> {
    const entity = await this.ormRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(profile: Profile): Promise<Profile> {
    const entity = this.toEntity(profile);
    const savedEntity = await this.ormRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  async update(id: number, data: Partial<Profile>): Promise<Profile> {
    await this.ormRepository.update(id, {
      bio: data.bio,
      avatar: data.avatar,
      contact: data.contact,
      socials: data.socials as any,
    });
    
    const updatedEntity = await this.ormRepository.findOne({ where: { id } });
    if (!updatedEntity) {
      throw new Error('Profile not found after update');
    }
    
    return this.toDomain(updatedEntity);
  }

  async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }

  private toDomain(entity: ProfileEntity): Profile {
    return new Profile(
      entity.id,
      entity.bio,
      entity.avatar,
      entity.contact,
      entity.socials,
      entity.createdAt,
      entity.updatedAt
    );
  }

  private toEntity(profile: Profile): Partial<ProfileEntity> {
    return {
      id: profile.id || undefined,
      bio: profile.bio,
      avatar: profile.avatar,
      contact: profile.contact,
      socials: profile.socials as any,
    };
  }
}