import { UserEntity } from '../entities/user.entity';

export interface AuthContext {
  user: UserEntity;
}