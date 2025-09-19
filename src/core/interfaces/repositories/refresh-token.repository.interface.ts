import { RefreshToken } from '../../entities/refresh-token.entity';

export interface RefreshTokenRepositoryInterface {
  findByJti(jti: string): Promise<RefreshToken | null>;
  create(token: RefreshToken): Promise<RefreshToken>;
  revoke(jti: string): Promise<void>;
  revokeAllByUserId(userId: number): Promise<void>;
  deleteExpired(): Promise<void>;
  findByUserIdAndJti(userId: number, jti: string): Promise<RefreshToken | null>;
}