import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshTokenRepositoryInterface } from '../../../core/interfaces/repositories/refresh-token.repository.interface';
import { RefreshToken } from '../../../core/entities/refresh-token.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository implements RefreshTokenRepositoryInterface {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly ormRepository: Repository<RefreshTokenEntity>
  ) {}

  async findByJti(jti: string): Promise<RefreshToken | null> {
    const entity = await this.ormRepository.findOne({
      where: { jti, isRevoked: false },
      relations: ['user']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserIdAndJti(userId: number, jti: string): Promise<RefreshToken | null> {
    const entity = await this.ormRepository.findOne({
      where: { userId, jti, isRevoked: false }
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(token: RefreshToken): Promise<RefreshToken> {
    const entity = this.toEntity(token);
    const savedEntity = await this.ormRepository.save(entity);
    return this.toDomain(savedEntity);
  }

  async revoke(jti: string): Promise<void> {
    await this.ormRepository.update({ jti }, { isRevoked: true });
  }

  async revokeAllByUserId(userId: number): Promise<void> {
    await this.ormRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
  }

  async deleteExpired(): Promise<void> {
    await this.ormRepository.delete({
      expiresAt: LessThan(new Date())
    });
  }

  private toDomain(entity: RefreshTokenEntity): RefreshToken {
    return new RefreshToken(
      entity.id,
      entity.jti,
      entity.tokenHash,
      entity.userId,
      entity.expiresAt,
      entity.isRevoked,
      entity.createdAt
    );
  }

  private toEntity(token: RefreshToken): Partial<RefreshTokenEntity> {
    return {
      id: token.id || undefined,
      jti: token.jti,
      tokenHash: token.tokenHash,
      userId: token.userId,
      expiresAt: token.expiresAt,
      isRevoked: token.isRevoked,
    };
  }
}